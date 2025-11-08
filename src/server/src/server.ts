import { addAlias } from "module-alias";
import path from "path";

// Dynamically set module alias based on NODE_ENV and runtime
const isProduction = process.env.NODE_ENV === "production";
const isTsNode = process.execArgv.some(arg => arg.includes('ts-node'));

// For ts-node, use src directory; for compiled, use dist
const projectRoot = path.resolve(__dirname, isTsNode ? ".." : "../.."); 
const aliasPath = path.join(projectRoot, isTsNode || !isProduction ? "src" : "dist");

console.log("🔧 Module alias setup:", { isProduction, isTsNode, projectRoot, aliasPath });

// Register global handlers for unhandled exceptions/rejections
process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught Exception:", err);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});

addAlias("@", aliasPath);

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

const PORT = process.env.PORT || 5000;

async function bootstrap() {
  try {
    const { httpServer } = await createApp();

    httpServer.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
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
