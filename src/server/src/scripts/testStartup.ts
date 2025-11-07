import dotenv from "dotenv";
dotenv.config();

// Test each major dependency in isolation
async function testDependencies() {
  try {
    console.log("Testing critical dependencies...");
    
    // 1. Test env
    console.log("Environment variables loaded:", {
      NODE_ENV: process.env.NODE_ENV,
      DATABASE_URL: process.env.DATABASE_URL?.replace(/:[^:@]+@/, ':***@'),
      REDIS_URL: process.env.REDIS_URL ? '(set)' : '(not set)',
    });

    // 2. Test database (already tested earlier)
    const { default: prisma } = await import("@infra/database/database.config");
    await prisma.$connect();
    console.log("✅ Database connection successful");
    await prisma.$disconnect();

    // 3. Test Redis (already tested earlier)
    const { default: redisClient } = await import("@infra/cache/redis");
    const pong = await redisClient.ping();
    console.log("✅ Redis connection successful:", pong);

      // 4. Test Cloudinary setup
      try {
      const cloudinaryPath = "@infra/cloudinary/config";
        console.log("Loading Cloudinary from:", cloudinaryPath);
        const cloudinary = await import(cloudinaryPath);
        if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
          console.log("✅ Cloudinary module loaded with credentials");
        } else {
          console.log("⚠️ Cloudinary module loaded but credentials are missing");
        }
      } catch (err) {
        console.warn("⚠️ Cloudinary module load failed:", err);
      }

    // 5. Test Express app creation
    const { createApp } = await import("../app");
    console.log("✅ Express app module loaded");
    
    return true;
  } catch (err) {
    console.error("❌ Dependency test failed:", err);
    throw err;
  }
}

testDependencies()
  .then(() => {
    console.log("All dependencies tested successfully");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Test failed:", err);
    process.exit(1);
  });