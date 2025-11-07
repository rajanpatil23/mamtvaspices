import dotenv from "dotenv";
import http from "http";
import express from "express";

dotenv.config();

const log = (tag: string, msg: any) => console.log(`[isolate] ${tag}:`, msg);

async function tryStep(name: string, fn: () => Promise<any> | any) {
  process.stdout.write(`[isolate] START ${name}... `);
  try {
    const res = await Promise.resolve().then(() => fn());
    // If the step returned a promise that resolves later, await that too
    await Promise.resolve(res);
    console.log("OK");
    return { ok: true };
  } catch (err: any) {
    console.log("FAIL");
    console.error(`[isolate] ERROR in ${name}:`, err && (err.stack || err));
    return { ok: false, err };
  }
}

async function main() {
  log("env", {
    NODE_ENV: process.env.NODE_ENV,
    DATABASE_URL: !!process.env.DATABASE_URL,
    REDIS_URL: !!process.env.REDIS_URL,
    CLOUDINARY_URL: !!process.env.CLOUDINARY_URL,
  });

  // 1) Database connect
  await tryStep("connectDB", async () => {
    // import inside the step so any import-time errors are captured per-step
    const { connectDB, default: prisma } = await import("../infra/database/database.config");
    await connectDB();
    // disconnect immediately to avoid leaving the engine running
    try {
      await prisma.$disconnect();
    } catch (e) {
      /* ignore */
    }
  });

  // 2) Redis client
  await tryStep("redis", async () => {
    const redis = await import("../infra/cache/redis");
    // call ping if available
    const client = redis.default;
    if (client && typeof client.ping === "function") {
      const pong = await client.ping();
      log("redis.ping", pong);
    } else {
      log("redis", "no ping method available on client");
    }
  });

  // 3) Cloudinary
  await tryStep("cloudinary", async () => {
    const cloud = await import("../infra/cloudinary/config");
    log("cloudinary", {
      loaded: !!cloud,
      exportedKeys: Object.keys(cloud || {}),
    });
  });

  // 4) Socket manager
  await tryStep("socketManager", async () => {
    const { SocketManager } = await import("../infra/socket/socket");
    const server = http.createServer();
    // instantiate, but don't listen
    const sm = new (SocketManager as any)(server);
    if (sm && typeof sm.getIO === "function") {
      log("socket", "constructed");
    }
  });

  // 5) Swagger (non-critical)
  await tryStep("swagger", async () => {
    const expressApp = express();
    const { setupSwagger } = await import("../docs/swagger");
    setupSwagger(expressApp as any);
  });

  // 6) GraphQL setup (this will start Apollo server instance)
  await tryStep("graphql", async () => {
    const expressApp = express();
    const { configureGraphQL } = await import("../graphql");
    // configureGraphQL will call apolloServer.start(); it may create a PrismaClient internally
    await configureGraphQL(expressApp as any);
    // do not attempt to stop the server here; just report success
  });

  // 7) createApp (full app wiring) - last, because it can call connectDB again
  await tryStep("createApp", async () => {
    const { createApp } = await import("../app");
    const result = await createApp();
    if (result && result.httpServer) {
      // don't listen; just close immediately if possible
      log("createApp", "constructed httpServer");
      try {
        // if there is a prisma on the module, disconnect it so engines stop
        const maybePrisma = (await import("../infra/database/database.config")).default;
        if (maybePrisma && typeof maybePrisma.$disconnect === "function") {
          await maybePrisma.$disconnect();
        }
      } catch (e) {
        /* ignore */
      }
    }
  });

  log("done", "isolation complete");
}

main().catch((err) => {
  console.error("[isolate] fatal error:", err && (err.stack || err));
  process.exit(1);
});
