import express from "express";
import dotenv from "dotenv";
import "./infra/cloudinary/config";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import ExpressMongoSanitize from "express-mongo-sanitize";
import hpp from "hpp";
import morgan from "morgan";
import logger from "./infra/winston/logger";
import compression from "compression";
import passport from "passport";
import session from "express-session";
import { RedisStore } from "connect-redis";
import redisClient from "./infra/cache/redis";
import configurePassport from "./infra/passport/passport";
import { cookieParserOptions } from "./shared/constants";
import globalError from "./shared/errors/globalError";
import { logRequest } from "./shared/middlewares/logRequest";
import { configureRoutes } from "./routes";
import { configureGraphQL } from "./graphql";
import webhookRoutes from "./modules/webhook/webhook.routes";
import healthRoutes from "./routes/health.routes";
// import { preflightHandler } from "./shared/middlewares/preflightHandler";
import { Server as HTTPServer } from "http";
import { SocketManager } from "@/infra/socket/socket";
import { connectDB } from "./infra/database/database.config";
import { setupSwagger } from "./docs/swagger";
import path from "path";

dotenv.config();

export const createApp = async () => {
  const app = express();

  await connectDB().catch((err) => {
    console.error("❌ Failed to connect to DB:", err);
    process.exit(1);
  });

  const httpServer = new HTTPServer(app);

  // Initialize Socket.IO
  const socketManager = new SocketManager(httpServer);
  const io = socketManager.getIO();

  // Swagger Documentation
  try {
    setupSwagger(app);
  } catch (err) {
    console.error("⚠️ setupSwagger threw an error during initialization:", err);
    // Do not crash the whole process for non-critical docs failure, but surface it.
  }

  // Health check routes (no middleware applied)
  app.use("/", healthRoutes);

  // Basic
  app.use(
    "/api/v1/webhook",
    bodyParser.raw({ type: "application/json" }),
    webhookRoutes
  );
  app.use(express.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(cookieParser(process.env.COOKIE_SECRET, cookieParserOptions));

  app.set("trust proxy", 1);

  // Configure session store. Use RedisStore when REDIS_URL is provided;
  // otherwise fall back to the default MemoryStore (suitable for local dev).
  const sessionOptions: any = {
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: true, // Keeps guest sessionId from the first request
    proxy: true, // Ensures secure cookies work with proxy
    cookie: {
      httpOnly: true,
      // In development, use 'lax' for same-site; in production use 'none' with secure
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    },
  };

  if (process.env.REDIS_URL) {
    try {
      sessionOptions.store = new RedisStore({ client: redisClient });
    } catch (err) {
      console.warn("⚠️ Failed to initialize Redis session store, using MemoryStore:", err);
    }
  } else {
    console.warn("⚠️ REDIS_URL not set — using in-memory session store for development.");
  }

  app.use(session(sessionOptions));
  app.use(passport.initialize());
  app.use(passport.session());
  configurePassport();

  // Preflight handler removed to avoid conflicts

  // CORS must be applied BEFORE GraphQL setup
  // Build allowed origins from ALLOWED_ORIGINS env (comma-separated). Fallback to previous
  // defaults for development and the old production origin if not specified.
  const allowedOriginsEnv = process.env.ALLOWED_ORIGINS || "";
  const allowedOrigins = allowedOriginsEnv
    ? allowedOriginsEnv.split(",").map((o) => o.trim())
    : process.env.NODE_ENV === "production"
    ? ["https://ecommerce-nu-rosy.vercel.app"]
    : ["http://localhost:3000", "http://localhost:5173"];

  app.use(
    cors({
      origin: allowedOrigins,
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
      allowedHeaders: [
        "Content-Type",
        "Authorization",
        "X-Requested-With",
        "Apollo-Require-Preflight", // For GraphQL
      ],
    })
  );

  app.use(helmet());
  app.use(helmet.frameguard({ action: "deny" }));

  // Extra Security
  app.use(ExpressMongoSanitize());
  app.use(
    hpp({
      whitelist: ["sort", "filter", "fields", "page", "limit"],
    })
  );

  app.use(
    morgan("combined", {
      stream: {
        write: (message) => logger.info(message.trim()),
      },
    })
  );
  app.use(compression());

  app.use("/api", configureRoutes(io));

  // GraphQL setup
  try {
    await configureGraphQL(app);
  } catch (err) {
    console.error("❌ configureGraphQL failed during startup:", err);
    // Re-throw to allow bootstrap to fail fast and provide a clear stack from server.ts
    throw err;
  }

  // --- Next.js integration: serve frontend from the same Express server ---
  // This prepares Next and registers a catch-all handler for non-API routes.
  // We default to looking for the built Next app at `src/client` inside the container
  // (the Dockerfile below copies the built `.next` into this path).
  try {
    const nextClientDir = process.env.NEXT_CLIENT_DIR || path.resolve(process.cwd(), "src", "client");
    const isNextDev = process.env.NODE_ENV !== "production";
    // require at runtime so local dev without 'next' in server/node_modules won't crash
    // (we populate next in the Docker image during the build step). If top-level
    // require('next') fails (common when running locally and next is only installed
    // in the client folder), try to require the next package from the client node_modules.
    let nextPkg: any;
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      nextPkg = require("next");
    } catch (err) {
      try {
        // try loading Next from the client node_modules folder
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        nextPkg = require(path.join(nextClientDir, "node_modules", "next"));
      } catch (err2) {
        // rethrow the original error to be caught below
        throw err;
      }
    }

    const nextApp = nextPkg({ dev: isNextDev, dir: nextClientDir });
    const nextHandle = nextApp.getRequestHandler();

    await nextApp.prepare();

    // Important: keep API/GraphQL routes intact. Register Next handler after them.
    app.all("*", (req, res) => {
      // Let express handle API/GraphQL/static routes first
      if (
        req.path.startsWith("/api") ||
        req.path.startsWith("/graphql") ||
        req.path.startsWith("/api/v1") ||
        req.path.startsWith("/_next") ||
        req.path.startsWith("/static")
      ) {
        return res.status(404).end();
      }
      return nextHandle(req, res);
    });
  } catch (err) {
    // If Next fails to prepare, log a warning but don't crash — this keeps API available.
    console.warn("⚠️ Next.js failed to prepare. Frontend routes may 404:", err);
  }

  // Error & Logging
  app.use(globalError);
  app.use(logRequest);

  return { app, httpServer };
};
