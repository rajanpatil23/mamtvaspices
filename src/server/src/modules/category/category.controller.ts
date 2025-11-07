import { Request, Response } from "express";
import asyncHandler from "@/shared/utils/asyncHandler";
import sendResponse from "@/shared/utils/sendResponse";
import { makeLogsService } from "../logs/logs.factory";
import { uploadToCloudinary } from "@/shared/utils/uploadToCloudinary";
import slugify from "@/shared/utils/slugify";
import { CategoryService } from "./category.service";
import AppError from "@/shared/errors/AppError";

export class CategoryController {
  private logsService = makeLogsService();
  constructor(private categoryService: CategoryService) { }

  getAllCategories = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const categories = await this.categoryService.getAllCategories(req.query);
      sendResponse(res, 200, {
        data: { categories },
        message: "Categories fetched successfully",
      });
    }
  );

  getCategory = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { id: categoryId } = req.params;
      const category = await this.categoryService.getCategory(categoryId);
      sendResponse(res, 200, {
        data: { category },
        message: "Category fetched successfully",
      });
    }
  );

  createCategory = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      // Debug logging
      console.log("📝 Request body:", req.body);
      console.log("📁 Request files:", req.files);
      
      const { name, description } = req.body;
      
      // Validate required fields
      if (!name || name.trim() === "") {
        throw new AppError(400, "Category name is required");
      }
      
      const slugifiedName = slugify(name);

      const files = req.files as Express.Multer.File[];

      let imageUrls: string[] = [];
      if (Array.isArray(files) && files.length > 0) {
        const uploadedImages = await uploadToCloudinary(files);
        imageUrls = uploadedImages.map((img) => img.url).filter(Boolean);
      }

      const { category } = await this.categoryService.createCategory({
        name,
        description,
        images: imageUrls.length > 0 ? imageUrls : undefined,
      });
      sendResponse(res, 201, {
        data: { category },
        message: "Category created successfully",
      });
      const start = Date.now();
      const end = Date.now();

      this.logsService.info("Category created", {
        userId: req.user?.id,
        sessionId: req.session.id,
        timePeriod: end - start,
      });
    }
  );

  updateCategory = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      // Debug logging
      console.log("📝 Update Request body:", req.body);
      console.log("📁 Update Request files:", req.files);
      
      const { id: categoryId } = req.params;
      const { name, description } = req.body;
      
      const updateData: any = {};
      
      if (name) {
        updateData.name = name;
        updateData.slug = slugify(name);
      }
      
      if (description !== undefined) {
        updateData.description = description;
      }

      const files = req.files as Express.Multer.File[];
      
      if (Array.isArray(files) && files.length > 0) {
        const uploadedImages = await uploadToCloudinary(files);
        const imageUrls = uploadedImages.map((img) => img.url).filter(Boolean);
        if (imageUrls.length > 0) {
          updateData.images = imageUrls;
        }
      }

      const { category } = await this.categoryService.updateCategory(categoryId, updateData);
      
      sendResponse(res, 200, {
        data: { category },
        message: "Category updated successfully",
      });
      
      const start = Date.now();
      const end = Date.now();

      this.logsService.info("Category updated", {
        userId: req.user?.id,
        sessionId: req.session.id,
        timePeriod: end - start,
      });
    }
  );

  deleteCategory = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { id: categoryId } = req.params;
      await this.categoryService.deleteCategory(categoryId);
      sendResponse(res, 204, { message: "Category deleted successfully" });
      const start = Date.now();
      const end = Date.now();

      this.logsService.info("Category deleted", {
        userId: req.user?.id,
        sessionId: req.session.id,
        timePeriod: end - start,
      });
    }
  );
}
