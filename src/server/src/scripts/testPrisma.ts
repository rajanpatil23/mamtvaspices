import prisma from "../infra/database/database.config";

(async () => {
  try {
    console.log("Testing Prisma connection...");
    await prisma.$connect();
    console.log("Prisma connected successfully");
    await prisma.$disconnect();
    process.exit(0);
  } catch (err) {
    console.error("Prisma connection error:", err);
    process.exit(1);
  }
})();
