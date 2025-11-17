import express from "express";
import { makeAttributeController } from "./attribute.factory";

const router = express.Router();
const controller = makeAttributeController();

// List all attributes
router.get("/", controller.getAllAttributes);

// Create new attribute
router.post("/", controller.createAttribute);

// Attribute value routes (must come before /:id routes)
router.post("/value", controller.createAttributeValue);
router.put("/value/:id", controller.updateAttributeValue);
router.delete("/value/:id", controller.deleteAttributeValue);

// Category attribute routes (must come before /:id routes)
router.post("/assign-category", controller.assignAttributeToCategory);
router.put("/category-attribute/:id", controller.updateCategoryAttribute);
router.delete("/category-attribute/:id", controller.deleteCategoryAttribute);

// Generic attribute routes (must come last)
router.get("/:id", controller.getAttribute);
router.delete("/:id", controller.deleteAttribute);

export default router;
