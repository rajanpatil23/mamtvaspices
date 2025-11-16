// Register module-alias for compiled JavaScript (production)
import moduleAlias from "module-alias";
import path from "path";

// Register aliases for compiled code
if (process.env.NODE_ENV === "production" || !process.env.TS_NODE) {
  moduleAlias.addAliases({
    "@": path.join(__dirname),
    "@infra": path.join(__dirname, "infra"),
    "@modules": path.join(__dirname, "modules"),
    "@shared": path.join(__dirname, "shared"),
    "@routes": path.join(__dirname, "routes"),
    "@scripts": path.join(__dirname, "scripts"),
  });
}

// Register global handlers for unhandled exceptions/rejections BEFORE any imports
process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught Exception:", err);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});

// tsconfig-paths/register handles path aliases via -r flag in package.json
// No need for module-alias when using ts-node
import { createApp } from "./app";

// Add process-level handlers so startup-time exceptions/rejections are logged
// with full stack traces (nodemon will still restart the process).
process.on("uncaughtException", (err: any) => {
  console.error("Uncaught Exception (will exit):", err && err.stack ? err.stack : err);
  // Exit so nodemon reports a crash and restarts; keeps behavior deterministic
  process.exit(1);
});

process.on("unhandledRejection", (reason: any) => {
  console.error("Unhandled Rejection (will exit):", reason && (reason.stack || reason));
  process.exit(1);
});

const PORT = parseInt(process.env.PORT || '5000', 10);
const HOST = '0.0.0.0';

async function bootstrap() {
  try {
    const { httpServer } = await createApp();

    httpServer.listen(PORT, HOST, () => {
      console.log(`🚀 Server is running on ${HOST}:${PORT}`);
    });

    httpServer.on("error", (err) => {
      console.error("Server error:", err);
      process.exit(1);
    });
  } catch (err) {
    console.error("❌ Failed to start server:", err);
    // Rethrow to trigger process.exit in catch block below
    throw err;
  }
}

bootstrap().catch((err) => {
  if (!err.logged) {
    console.error("Bootstrap error:", err);
  }
  // Ensure non-zero exit for CI/automation
  process.exit(1);
});
