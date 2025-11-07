import prisma from "@/infra/database/database.config";
import { Prisma } from "@prisma/client";

export class SectionRepository {
  async findAll() {
    return prisma.section.findMany();
  }

  async findHero() {
    return prisma.section.findFirst({ where: { type: "HERO" } });
  }

  async findPromo() {
    return prisma.section.findFirst({ where: { type: "PROMOTIONAL" } });
  }

  async findArrivals() {
    return prisma.section.findFirst({ where: { type: "NEW_ARRIVALS" } });
  }

  async findBenefits() {
    return prisma.section.findFirst({ where: { type: "BENEFITS" } });
  }

  async create(data: {
    type: "HERO" | "PROMOTIONAL" | "BENEFITS" | "NEW_ARRIVALS";
    title?: string | null;
    description?: string | null;
    images: any[];
    icons?: string | null;
    link?: string | null;
    ctaText?: string | null;
    isVisible?: boolean | null;
    primaryColor?: string | null;
    secondaryColor?: string | null;
  }) {
    // Ensure images is an array and convert to Prisma JSON
    const cleanedData = {
      ...data,
      images: data.images || [],  // Ensure images is an array
      // Filter out undefined values
      ...Object.fromEntries(
        Object.entries(data)
          .filter(([_, v]) => v !== undefined)
          .map(([k, v]) => [k, v === null ? null : v])
      )
    };

    return prisma.section.create({
      data: cleanedData as unknown as Prisma.SectionCreateInput
    });
  }

  async findById(id: number) {
    return prisma.section.findUnique({ where: { id } });
  }

  async update(type: "HERO" | "PROMOTIONAL" | "BENEFITS" | "NEW_ARRIVALS", data: {
    title?: string | null;
    description?: string | null;
    images?: any[];
    icons?: string | null;
    link?: string | null;
    ctaText?: string | null;
    isVisible?: boolean | null;
    primaryColor?: string | null;
    secondaryColor?: string | null;
  }) {
    // Clean up the data similar to create
    const cleanedData = {
      ...Object.fromEntries(
        Object.entries(data)
          .filter(([_, v]) => v !== undefined)
          .map(([k, v]) => [k, v === null ? null : v])
      ),
      ...(data.images ? { images: data.images } : {})
    };

    return prisma.section.updateMany({
      where: { type },
      data: cleanedData
    });
  }

  async deleteByType(type: "HERO" | "PROMOTIONAL" | "BENEFITS" | "NEW_ARRIVALS") {
    return prisma.section.deleteMany({ where: { type } });
  }
}
