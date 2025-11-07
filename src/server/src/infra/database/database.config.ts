import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const connectDB = async () => {
  try {
    await prisma.$connect();
    console.log("Neon Database connected successfully.");
  } catch (error) {
    console.error("Failed to connect to database:", error);
    // Rethrow so callers can decide how to handle a failed connection.
    throw error;
  }
};

export default prisma;
