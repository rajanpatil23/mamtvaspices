# Product Deletion Fix - Implementation Plan

## Problem Analysis

### Current Issue
Product deletion fails with foreign key constraint error when variants have been ordered.

**Error:**
```
Foreign key constraint fails: Cannot delete product because variants are referenced in order_items
```

### Root Cause
```prisma
model OrderItem {
  variantId String
  variant   ProductVariant @relation(fields: [variantId], references: [id])
  // ❌ NO onDelete behavior specified - defaults to RESTRICT
}
```

When a product is deleted:
1. Prisma tries to CASCADE delete all variants (correct behavior)
2. Variants cannot be deleted because OrderItems reference them
3. Deletion fails with constraint error

## Solution Options

### Option 1: Soft Delete (RECOMMENDED)
Implement soft delete to preserve order history while hiding deleted products.

**Pros:**
- ✅ Preserves order history and referential integrity
- ✅ Allows "undelete" functionality
- ✅ Maintains data for analytics and reporting
- ✅ No breaking changes to existing orders

**Cons:**
- ⚠️ Requires schema migration
- ⚠️ Need to filter deleted items in all queries

### Option 2: Prevent Deletion with Clear Error
Check for orders before deletion and provide clear error message.

**Pros:**
- ✅ Simple to implement
- ✅ No schema changes needed
- ✅ Clear user feedback

**Cons:**
- ❌ Products with orders can never be deleted
- ❌ Database grows indefinitely

### Option 3: Archive System
Add isActive flag to hide products without deleting.

**Pros:**
- ✅ Simple implementation
- ✅ Products can be reactivated
- ✅ No data loss

**Cons:**
- ⚠️ Requires schema migration
- ⚠️ Need to filter inactive items

## Recommended Implementation: Soft Delete

### Phase 1: Schema Changes

```prisma
model Product {
  id            String           @id @default(uuid())
  name          String           @unique
  description   String?
  slug          String           @unique
  salesCount    Int              @default(0)
  isNew         Boolean          @default(false)
  isFeatured    Boolean          @default(false)
  isTrending    Boolean          @default(false)
  isBestSeller  Boolean          @default(false)
  averageRating Float            @default(0)
  reviewCount   Int              @default(0)
  categoryId    String?
  
  // Soft delete fields
  isDeleted     Boolean          @default(false)
  deletedAt     DateTime?
  deletedBy     String?          // User ID who deleted
  
  category      Category?        @relation(fields: [categoryId], references: [id], onDelete: SetNull)
  variants      ProductVariant[]
  interactions  Interaction[]
  reviews       Review[]
  
  createdAt     DateTime         @default(now())
  updatedAt     DateTime         @updatedAt

  @@index([name, slug, isDeleted])
}

model ProductVariant {
  id                String                    @id @default(uuid())
  productId         String
  sku               String                    @unique
  images            Json                      @default("[]")
  price             Float
  stock             Int
  lowStockThreshold Int                       @default(10)
  barcode           String?
  warehouseLocation String?
  
  // Soft delete fields
  isDeleted         Boolean                   @default(false)
  deletedAt         DateTime?
  
  product           Product                   @relation(fields: [productId], references: [id], onDelete: Cascade)
  attributes        ProductVariantAttribute[]
  orderItems        OrderItem[]
  cartItems         CartItem[]
  stockMovements    StockMovement[]
  restocks          Restock[]
  
  createdAt         DateTime                  @default(now())
  updatedAt         DateTime                  @updatedAt

  @@index([productId, sku, isDeleted])
}
```

### Phase 2: Repository Updates

```typescript
// src/server/src/modules/product/product.repository.ts

export class ProductRepository {
  // Update findManyProducts to exclude deleted
  async findManyProducts(params: {
    where?: any;
    orderBy?: any;
    skip?: number;
    take?: number;
    select?: any;
    includeDeleted?: boolean; // New parameter
  }) {
    const {
      where = {},
      orderBy = { createdAt: "desc" },
      skip = 0,
      take = 10,
      select,
      includeDeleted = false,
    } = params;

    const { categorySlug, ...restWhere } = where;

    const finalWhere: any = {
      ...restWhere,
      // Filter deleted products unless explicitly requested
      ...(!includeDeleted && { isDeleted: false }),
      ...(categorySlug
        ? {
            category: {
              is: {
                slug: {
                  equals: categorySlug,
                },
              },
            },
          }
        : {}),
    };

    const queryOptions: any = {
      where: finalWhere,
      orderBy,
      skip,
      take,
    };

    if (select) {
      queryOptions.select = select;
    } else {
      queryOptions.include = {
        variants: {
          where: !includeDeleted ? { isDeleted: false } : {},
          include: {
            attributes: {
              include: {
                attribute: true,
                value: true,
              },
            },
          },
        },
      };
    }

    return prisma.product.findMany(queryOptions);
  }

  // Soft delete method
  async softDeleteProduct(id: string, userId?: string) {
    return prisma.$transaction(async (tx) => {
      // Soft delete all variants first
      await tx.productVariant.updateMany({
        where: { productId: id },
        data: {
          isDeleted: true,
          deletedAt: new Date(),
        },
      });

      // Soft delete the product
      return tx.product.update({
        where: { id },
        data: {
          isDeleted: true,
          deletedAt: new Date(),
          deletedBy: userId,
        },
      });
    });
  }

  // Restore deleted product
  async restoreProduct(id: string) {
    return prisma.$transaction(async (tx) => {
      // Restore all variants
      await tx.productVariant.updateMany({
        where: { productId: id },
        data: {
          isDeleted: false,
          deletedAt: null,
        },
      });

      // Restore the product
      return tx.product.update({
        where: { id },
        data: {
          isDeleted: false,
          deletedAt: null,
          deletedBy: null,
        },
      });
    });
  }

  // Hard delete (admin only, for products never ordered)
  async hardDeleteProduct(id: string) {
    return prisma.product.delete({
      where: { id },
    });
  }
}
```

### Phase 3: Service Updates

```typescript
// src/server/src/modules/product/product.service.ts

export class ProductService {
  // Update deleteProduct to use soft delete
  async deleteProduct(productId: string, userId?: string) {
    const product = await this.productRepository.findProductById(productId);
    if (!product) {
      throw new AppError(404, "Product not found");
    }

    if (product.isDeleted) {
      throw new AppError(400, "Product is already deleted");
    }

    // Soft delete the product
    await this.productRepository.softDeleteProduct(productId, userId);
  }

  // New method to restore deleted product
  async restoreProduct(productId: string) {
    const product = await this.productRepository.findProductById(productId, true);
    if (!product) {
      throw new AppError(404, "Product not found");
    }

    if (!product.isDeleted) {
      throw new AppError(400, "Product is not deleted");
    }

    await this.productRepository.restoreProduct(productId);
  }

  // New method for permanent deletion (admin only)
  async permanentlyDeleteProduct(productId: string) {
    const product = await this.productRepository.findProductById(productId, true);
    if (!product) {
      throw new AppError(404, "Product not found");
    }

    // Check if any variants have orders
    const variantsWithOrders = await prisma.orderItem.count({
      where: {
        variant: {
          productId: productId,
        },
      },
    });

    if (variantsWithOrders > 0) {
      throw new AppError(
        400,
        "Cannot permanently delete product with existing orders. Use soft delete instead."
      );
    }

    await this.productRepository.hardDeleteProduct(productId);
  }
}
```

### Phase 4: Controller Updates

```typescript
// src/server/src/modules/product/product.controller.ts

export class ProductController {
  deleteProduct = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { id: productId } = req.params;
      const userId = req.user?.id;
      
      await this.productService.deleteProduct(productId, userId);
      
      sendResponse(res, 200, { 
        message: "Product deleted successfully (soft delete)" 
      });
      
      this.logsService.info("Product soft deleted", {
        userId: req.user?.id,
        productId,
        sessionId: req.session.id,
      });
    }
  );

  restoreProduct = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { id: productId } = req.params;
      
      await this.productService.restoreProduct(productId);
      
      sendResponse(res, 200, { 
        message: "Product restored successfully" 
      });
      
      this.logsService.info("Product restored", {
        userId: req.user?.id,
        productId,
        sessionId: req.session.id,
      });
    }
  );

  permanentlyDeleteProduct = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { id: productId } = req.params;
      
      await this.productService.permanentlyDeleteProduct(productId);
      
      sendResponse(res, 200, { 
        message: "Product permanently deleted" 
      });
      
      this.logsService.info("Product permanently deleted", {
        userId: req.user?.id,
        productId,
        sessionId: req.session.id,
      });
    }
  );
}
```

### Phase 5: Route Updates

```typescript
// src/server/src/modules/product/product.routes.ts

// Soft delete (default delete)
router.delete(
  "/:id",
  protect,
  authorizeRole("ADMIN", "SUPERADMIN"),
  productController.deleteProduct
);

// Restore deleted product
router.post(
  "/:id/restore",
  protect,
  authorizeRole("ADMIN", "SUPERADMIN"),
  productController.restoreProduct
);

// Permanent delete (superadmin only)
router.delete(
  "/:id/permanent",
  protect,
  authorizeRole("SUPERADMIN"),
  productController.permanentlyDeleteProduct
);
```

### Phase 6: Frontend Updates

```typescript
// src/client/app/store/apis/ProductApi.ts

export const productApi = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    // ... existing endpoints

    deleteProduct: builder.mutation({
      query: (id) => ({
        url: `/products/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Product"],
    }),

    restoreProduct: builder.mutation({
      query: (id) => ({
        url: `/products/${id}/restore`,
        method: "POST",
      }),
      invalidatesTags: ["Product"],
    }),

    permanentlyDeleteProduct: builder.mutation({
      query: (id) => ({
        url: `/products/${id}/permanent`,
        method: "DELETE",
      }),
      invalidatesTags: ["Product"],
    }),
  }),
});

export const {
  // ... existing hooks
  useDeleteProductMutation,
  useRestoreProductMutation,
  usePermanentlyDeleteProductMutation,
} = productApi;
```

### Phase 7: UI Updates

```typescript
// src/client/app/(private)/dashboard/products/page.tsx

const handleDelete = async () => {
  if (!productToDelete) return;
  try {
    await deleteProduct(productToDelete).unwrap();
    setIsConfirmModalOpen(false);
    setProductToDelete(null);
    showToast("Product deleted successfully", "success");
  } catch (err: any) {
    console.error("Failed to delete product:", err);
    const errorMessage = err?.data?.message || "Failed to delete product";
    showToast(errorMessage, "error");
  }
};

// Add restore functionality
const handleRestore = async (productId: string) => {
  try {
    await restoreProduct(productId).unwrap();
    showToast("Product restored successfully", "success");
  } catch (err: any) {
    console.error("Failed to restore product:", err);
    showToast("Failed to restore product", "error");
  }
};
```

## Migration Steps

### Step 1: Create Migration

```bash
cd src/server
npx prisma migrate dev --name add_soft_delete_to_products
```

### Step 2: Update Existing Data

```sql
-- Set all existing products as not deleted
UPDATE Product SET isDeleted = false WHERE isDeleted IS NULL;
UPDATE ProductVariant SET isDeleted = false WHERE isDeleted IS NULL;
```

### Step 3: Deploy Changes

1. Run migration on production database
2. Deploy updated backend code
3. Deploy updated frontend code
4. Test deletion functionality

## Testing Checklist

- [ ] Soft delete product without orders
- [ ] Soft delete product with orders
- [ ] Verify deleted products don't appear in listings
- [ ] Restore deleted product
- [ ] Verify restored product appears in listings
- [ ] Attempt permanent delete of product with orders (should fail)
- [ ] Permanent delete of product without orders (superadmin only)
- [ ] Verify soft deleted products excluded from search
- [ ] Verify cart items with deleted variants handled properly
- [ ] Test API endpoints with Postman

## Rollback Plan

If issues occur:

1. Revert schema changes:
```bash
npx prisma migrate resolve --rolled-back <migration_name>
```

2. Restore previous code version

3. All data remains intact (soft delete doesn't remove data)

## Alternative: Quick Fix (Option 2)

If soft delete is too complex for immediate deployment:

```typescript
// src/server/src/modules/product/product.service.ts

async deleteProduct(productId: string) {
  const product = await this.productRepository.findProductById(productId);
  if (!product) {
    throw new AppError(404, "Product not found");
  }

  // Check if any variants have orders
  const variantsWithOrders = await prisma.orderItem.count({
    where: {
      variant: {
        productId: productId,
      },
    },
  });

  if (variantsWithOrders > 0) {
    throw new AppError(
      400,
      "Cannot delete product with existing orders. This product has been ordered and must be kept for order history. Consider marking it as inactive or out of stock instead."
    );
  }

  await this.productRepository.deleteProduct(productId);
}
```

This provides clear error message without schema changes.

## Conclusion

**Recommended:** Implement soft delete (Option 1) for production-ready solution.

**Quick Fix:** Implement order check (Option 2) for immediate deployment.

Both solutions prevent data integrity issues while providing clear user feedback.
