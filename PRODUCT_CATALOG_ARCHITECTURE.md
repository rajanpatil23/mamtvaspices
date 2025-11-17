# Product Catalog Architecture Documentation

## Overview
This document explains the complete architecture of the product catalog system including Products, Attributes, Variants, and Categories with their relationships and configurations.

## Table of Contents
1. [Database Schema](#database-schema)
2. [Entity Relationships](#entity-relationships)
3. [API Endpoints](#api-endpoints)
4. [Business Logic](#business-logic)
5. [Frontend Implementation](#frontend-implementation)
6. [Known Issues](#known-issues)

---

## Database Schema

### Core Entities

#### 1. Product
The main product entity that serves as a container for variants.

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
  
  // Relations
  category      Category?        @relation(fields: [categoryId], references: [id], onDelete: SetNull)
  variants      ProductVariant[]
  interactions  Interaction[]
  reviews       Review[]
  
  createdAt     DateTime         @default(now())
  updatedAt     DateTime         @updatedAt
}
```

**Key Points:**
- Products don't have prices directly - prices are on variants
- A product MUST have at least one variant
- Product deletion cascades to variants
- Category is optional (onDelete: SetNull)

#### 2. ProductVariant
The actual sellable item with specific attributes, price, and stock.

```prisma
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
  
  // Relations
  product           Product                   @relation(fields: [productId], references: [id], onDelete: Cascade)
  attributes        ProductVariantAttribute[]
  orderItems        OrderItem[]               // NO CASCADE DELETE
  cartItems         CartItem[]
  stockMovements    StockMovement[]
  restocks          Restock[]
  
  createdAt         DateTime                  @default(now())
  updatedAt         DateTime                  @updatedAt
}
```

**Key Points:**
- SKU must be unique across all variants
- Each variant has its own price and stock
- Variants are deleted when product is deleted (Cascade)
- **CRITICAL**: OrderItem relation has NO onDelete cascade - this prevents product deletion if orders exist

#### 3. Attribute
Defines product characteristics (e.g., "Color", "Size", "Material").

```prisma
model Attribute {
  id                String                    @id @default(uuid())
  name              String                    @unique
  slug              String                    @unique
  
  // Relations
  values            AttributeValue[]
  categories        CategoryAttribute[]
  variantAttributes ProductVariantAttribute[]
  
  createdAt         DateTime                  @default(now())
  updatedAt         DateTime                  @updatedAt
}
```

#### 4. AttributeValue
Specific values for attributes (e.g., "Red", "Blue" for Color attribute).

```prisma
model AttributeValue {
  id                String                    @id @default(uuid())
  attributeId       String
  value             String
  slug              String                    @unique
  
  // Relations
  attribute         Attribute                 @relation(fields: [attributeId], references: [id], onDelete: Cascade)
  variantAttributes ProductVariantAttribute[]
  
  createdAt         DateTime                  @default(now())
  updatedAt         DateTime                  @updatedAt
}
```

#### 5. ProductVariantAttribute
Junction table linking variants to their attribute values.

```prisma
model ProductVariantAttribute {
  id          String         @id @default(uuid())
  variantId   String
  attributeId String
  valueId     String
  
  // Relations
  variant     ProductVariant @relation(fields: [variantId], references: [id], onDelete: Cascade)
  attribute   Attribute      @relation(fields: [attributeId], references: [id], onDelete: Cascade)
  value       AttributeValue @relation(fields: [valueId], references: [id], onDelete: Cascade)
  
  createdAt   DateTime       @default(now())
  
  @@unique([variantId, attributeId, valueId])
}
```

**Key Points:**
- Each variant can have multiple attributes
- Same attribute cannot be assigned twice to a variant
- Attribute combinations must be unique per product

#### 6. Category
Groups products into categories with optional required attributes.

```prisma
model Category {
  id          String              @id @default(uuid())
  slug        String              @unique
  name        String
  description String?
  images      Json
  
  // Relations
  products    Product[]
  attributes  CategoryAttribute[]
  
  createdAt   DateTime            @default(now())
  updatedAt   DateTime            @updatedAt
}
```

#### 7. CategoryAttribute
Defines which attributes are available/required for a category.

```prisma
model CategoryAttribute {
  id          String    @id @default(uuid())
  categoryId  String
  attributeId String
  isRequired  Boolean   @default(false)
  
  // Relations
  category    Category  @relation(fields: [categoryId], references: [id], onDelete: Cascade)
  attribute   Attribute @relation(fields: [attributeId], references: [id], onDelete: Cascade)
  
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  
  @@unique([categoryId, attributeId])
}
```

---

## Entity Relationships

### Product → Variant → Attributes Flow

```
Product (e.g., "T-Shirt")
  ├── Variant 1 (SKU: TSHIRT-RED-S)
  │   ├── Price: $19.99
  │   ├── Stock: 50
  │   └── Attributes:
  │       ├── Color: Red
  │       └── Size: Small
  │
  ├── Variant 2 (SKU: TSHIRT-RED-M)
  │   ├── Price: $19.99
  │   ├── Stock: 30
  │   └── Attributes:
  │       ├── Color: Red
  │       └── Size: Medium
  │
  └── Variant 3 (SKU: TSHIRT-BLUE-S)
      ├── Price: $21.99
      ├── Stock: 25
      └── Attributes:
          ├── Color: Blue
          └── Size: Small
```

### Category → Attribute Requirements

```
Category: "Clothing"
  ├── Required Attributes:
  │   ├── Size (required)
  │   └── Color (required)
  │
  └── Optional Attributes:
      ├── Material
      └── Brand

When creating a product in "Clothing" category:
  - ALL variants MUST have Size and Color attributes
  - Material and Brand are optional
```

### Deletion Cascade Rules

```
DELETE Product
  ├── CASCADE → ProductVariant (all variants deleted)
  │   ├── CASCADE → ProductVariantAttribute (all attribute links deleted)
  │   ├── CASCADE → CartItem (removed from carts)
  │   ├── CASCADE → StockMovement (history deleted)
  │   └── CASCADE → Restock (history deleted)
  │   └── ❌ BLOCKED if OrderItem exists (orders reference this variant)
  │
  ├── SET NULL → Interaction (interactions remain but product link removed)
  └── CASCADE → Review (all reviews deleted)

DELETE Category
  ├── SET NULL → Product.categoryId (products remain but category removed)
  └── CASCADE → CategoryAttribute (attribute requirements deleted)

DELETE Attribute
  ├── CASCADE → AttributeValue (all values deleted)
  │   └── CASCADE → ProductVariantAttribute (variant links deleted)
  └── CASCADE → CategoryAttribute (category requirements deleted)
```

---

## API Endpoints

### Product Endpoints

#### GET /api/products
Get all products with filtering, sorting, and pagination.

**Query Parameters:**
- `searchQuery`: Search by product name
- `category`: Filter by category ID
- `sort`: Sort field (e.g., `createdAt`, `-price`)
- `limit`: Results per page (default: 10)
- `page`: Page number
- `featured`: Filter featured products (true/false)
- `bestselling`: Filter best-selling products (true/false)

**Response:**
```json
{
  "status": "success",
  "data": {
    "products": [
      {
        "id": "uuid",
        "name": "Product Name",
        "slug": "product-name",
        "description": "Description",
        "isNew": false,
        "isFeatured": true,
        "isTrending": false,
        "isBestSeller": false,
        "salesCount": 150,
        "averageRating": 4.5,
        "reviewCount": 23,
        "category": {
          "id": "uuid",
          "name": "Category Name"
        },
        "variants": [
          {
            "id": "uuid",
            "sku": "SKU-001",
            "price": 29.99,
            "stock": 100,
            "images": ["url1", "url2"],
            "attributes": [
              {
                "attribute": { "id": "uuid", "name": "Color" },
                "value": { "id": "uuid", "value": "Red" }
              }
            ]
          }
        ]
      }
    ],
    "totalResults": 50,
    "totalPages": 5,
    "currentPage": 1,
    "resultsPerPage": 10
  }
}
```

#### GET /api/products/:id
Get product by ID with full details.

#### GET /api/products/slug/:slug
Get product by slug with full details.

#### POST /api/products
Create a new product (Admin only).

**Authentication:** Required (Bearer token)
**Authorization:** ADMIN or SUPERADMIN

**Request Body (multipart/form-data):**
```
name: string (required)
description: string (optional)
categoryId: string (optional)
isNew: boolean (optional)
isFeatured: boolean (optional)
isTrending: boolean (optional)
isBestSeller: boolean (optional)
images: File[] (multiple files)
variants: JSON array (required, at least 1)
  [
    {
      sku: string (required, unique, 3-50 chars, alphanumeric + dashes)
      price: number (required, > 0)
      stock: number (required, >= 0)
      lowStockThreshold: number (optional, default: 10)
      barcode: string (optional)
      warehouseLocation: string (optional)
      imageIndexes: number[] (indexes of uploaded images for this variant)
      attributes: [
        {
          attributeId: string (required)
          valueId: string (required)
        }
      ]
    }
  ]
```

**Validation Rules:**
1. At least one variant required
2. SKU must be unique across all products
3. Attribute combinations must be unique per product
4. If category has required attributes, all variants must include them
5. Attribute values must belong to their specified attributes

#### PUT /api/products/:id
Update a product (Admin only).

**Same authentication and validation as POST**

#### DELETE /api/products/:id
Delete a product (Admin only).

**⚠️ CURRENT ISSUE:** Deletion fails if any variant has been ordered.

#### POST /api/products/bulk
Bulk create products from CSV/XLSX file (Admin only).

---

### Attribute Endpoints

#### GET /api/attributes
Get all attributes with their values.

**Response:**
```json
{
  "status": "success",
  "data": {
    "attributes": [
      {
        "id": "uuid",
        "name": "Color",
        "slug": "color",
        "values": [
          { "id": "uuid", "value": "Red", "slug": "red" },
          { "id": "uuid", "value": "Blue", "slug": "blue" }
        ]
      }
    ]
  }
}
```

#### GET /api/attributes/:id
Get single attribute with values.

#### POST /api/attributes
Create a new attribute.

**Request Body:**
```json
{
  "name": "Color"
}
```

#### POST /api/attributes/value
Create a new attribute value.

**Request Body:**
```json
{
  "attributeId": "uuid",
  "value": "Red"
}
```

#### POST /api/attributes/assign-category
Assign attribute to category.

**Request Body:**
```json
{
  "categoryId": "uuid",
  "attributeId": "uuid",
  "isRequired": true
}
```

#### PUT /api/attributes/category-attribute/:id
Update category attribute requirement.

#### DELETE /api/attributes/:id
Delete attribute (cascades to values and variant links).

#### DELETE /api/attributes/value/:id
Delete attribute value.

#### DELETE /api/attributes/category-attribute/:id
Remove attribute from category.

---

### Variant Endpoints

#### GET /api/variants
Get all variants with filtering and pagination.

#### GET /api/variants/:id
Get variant by ID.

#### GET /api/variants/sku/:sku
Get variant by SKU.

#### GET /api/variants/:id/restock-history
Get restock history for a variant.

#### POST /api/variants
Create a new variant.

**Request Body:**
```json
{
  "productId": "uuid",
  "sku": "SKU-001",
  "price": 29.99,
  "stock": 100,
  "lowStockThreshold": 10,
  "barcode": "123456789",
  "warehouseLocation": "A-12",
  "images": ["url1", "url2"],
  "attributes": [
    {
      "attributeId": "uuid",
      "valueId": "uuid"
    }
  ]
}
```

#### PATCH /api/variants/:id
Update a variant.

#### POST /api/variants/:id/restock
Restock a variant (requires authentication).

**Request Body:**
```json
{
  "quantity": 50,
  "notes": "Restock from supplier"
}
```

#### DELETE /api/variants/:id
Delete a variant.

---

### Category Endpoints

#### GET /api/categories
Get all categories.

#### GET /api/categories/:id
Get category by ID with products and attributes.

#### POST /api/categories
Create a new category (Admin only).

**Request Body (multipart/form-data):**
```
name: string (required)
description: string (optional)
images: File[] (up to 5 files)
attributes: JSON array (optional)
  [
    {
      attributeId: string
      isRequired: boolean
    }
  ]
```

#### PUT /api/categories/:id
Update a category (Admin only).

#### DELETE /api/categories/:id
Delete a category (Admin only).
- Products in this category will have categoryId set to null
- Category attributes are deleted

---

## Business Logic

### Product Creation Flow

1. **Validate Input**
   - Check product name is unique
   - Validate at least one variant exists
   - Validate SKUs are unique and properly formatted
   - Validate prices and stock are valid numbers

2. **Validate Category & Attributes**
   - If categoryId provided, verify category exists
   - Get required attributes for the category
   - Verify all variants have required attributes

3. **Validate Attributes**
   - Verify all attributeIds exist
   - Verify all valueIds exist
   - Verify each value belongs to its specified attribute
   - Check for duplicate attributes in same variant
   - Check for duplicate attribute combinations across variants

4. **Upload Images**
   - Upload all images to Cloudinary
   - Map images to variants based on imageIndexes

5. **Create in Transaction**
   - Create product record
   - Create all variant records
   - Create all variant-attribute links
   - Return complete product with relations

### Product Update Flow

1. **Validate Product Exists**
   - Fetch existing product
   - Return 404 if not found

2. **Validate Updates**
   - If name changed, check uniqueness
   - If variants provided, validate all rules (same as creation)
   - Check SKUs don't conflict with other products

3. **Update in Transaction**
   - Update product fields
   - If variants provided:
     - Delete all existing variants (cascades to attributes)
     - Create new variants with attributes
   - Return updated product

### Product Deletion Flow

**Current Implementation:**
```typescript
async deleteProduct(productId: string) {
  const product = await this.productRepository.findProductById(productId);
  if (!product) {
    throw new AppError(404, "Product not found");
  }
  await this.productRepository.deleteProduct(productId);
}
```

**Issue:** Fails if variants are referenced in OrderItems due to foreign key constraint.

**Solution Needed:** Check for orders before deletion or implement soft delete.

### Variant Attribute Validation

When creating/updating variants, the system validates:

1. **Attribute Existence**: All attributeIds must exist
2. **Value Existence**: All valueIds must exist
3. **Value-Attribute Match**: Each valueId must belong to its attributeId
4. **No Duplicates**: Same attribute can't appear twice in one variant
5. **Unique Combinations**: No two variants can have identical attribute combinations
6. **Required Attributes**: If product has category, all required category attributes must be present

### Stock Management

#### Restock Flow
1. Validate quantity > 0
2. Validate variant exists
3. Create restock record
4. Increment variant stock
5. Create stock movement record
6. Check if still low stock
7. Return restock info and low stock status

#### Stock Movement Tracking
Every stock change creates a StockMovement record:
- Restock: reason = "restock"
- Sale: reason = "sale" (created during order)
- Adjustment: reason = "adjustment"

---

## Frontend Implementation

### Product Management Dashboard

**Location:** `src/client/app/(private)/dashboard/products/page.tsx`

**Features:**
- List all products with variants
- Create new products with multiple variants
- Edit existing products
- Delete products
- Bulk upload via CSV/XLSX

**State Management:**
- Uses RTK Query hooks from `ProductApi`
- `useGetAllProductsQuery()` - Fetch products
- `useCreateProductMutation()` - Create product
- `useUpdateProductMutation()` - Update product
- `useDeleteProductMutation()` - Delete product

### Attribute Management Dashboard

**Location:** `src/client/app/(private)/dashboard/attributes/`

**Components:**
- `AttributesCard.tsx` - Manage category-attribute mappings
- `AttributesBoardView.tsx` - Manage attributes and values

**Features:**
- Create/delete attributes
- Create/delete attribute values
- Assign attributes to categories
- Mark attributes as required/optional

### Category Management Dashboard

**Location:** `src/client/app/(private)/dashboard/categories/page.tsx`

**Features:**
- List all categories
- Create new categories with images
- Edit categories
- Delete categories
- View products in category

### Variant Management

**Location:** Integrated in product forms

**Features:**
- Add/remove variants
- Set SKU, price, stock for each variant
- Assign attributes to variants
- Upload images per variant
- Set low stock thresholds

---

## Known Issues

### 1. Product Deletion Fails When Orders Exist

**Issue:**
```
Error: Foreign key constraint fails
Cannot delete product because variants are referenced in order_items
```

**Root Cause:**
- `OrderItem` → `ProductVariant` relation has no `onDelete` cascade
- Once a variant is ordered, it cannot be deleted
- Product deletion tries to cascade delete variants, which fails

**Current Workaround:**
- Products with orders cannot be deleted
- Error is shown to user

**Recommended Solutions:**

**Option A: Soft Delete (Recommended)**
```prisma
model Product {
  // ... existing fields
  deletedAt DateTime?
  isDeleted  Boolean   @default(false)
}

model ProductVariant {
  // ... existing fields
  deletedAt DateTime?
  isDeleted  Boolean   @default(false)
}
```

Benefits:
- Preserves order history
- Allows "undelete" functionality
- Maintains referential integrity

**Option B: Prevent Deletion**
```typescript
async deleteProduct(productId: string) {
  // Check if any variants have orders
  const variantsWithOrders = await prisma.orderItem.count({
    where: {
      variant: {
        productId: productId
      }
    }
  });
  
  if (variantsWithOrders > 0) {
    throw new AppError(
      400,
      "Cannot delete product with existing orders. Consider marking as inactive instead."
    );
  }
  
  await this.productRepository.deleteProduct(productId);
}
```

**Option C: Archive System**
Add `isActive` flag and hide archived products from listings.

### 2. Image Management

**Current Implementation:**
- Images uploaded to Cloudinary
- URLs stored in variant.images as JSON array
- No cleanup when images are replaced

**Issue:**
- Old images remain in Cloudinary when updated
- No image deletion on product/variant delete

**Recommendation:**
- Track Cloudinary public_ids
- Implement cleanup on update/delete

### 3. Attribute Validation Performance

**Current Implementation:**
- Multiple database queries to validate attributes
- Queries run for each variant

**Optimization Opportunity:**
- Batch validate all attributes in single query
- Cache category requirements

---

## Best Practices

### Creating Products

1. **Always provide at least one variant**
2. **Use descriptive SKUs** (e.g., TSHIRT-RED-M, not just 001)
3. **Set appropriate low stock thresholds** based on sales velocity
4. **Assign to category** for better organization and required attributes
5. **Use high-quality images** for each variant
6. **Ensure unique attribute combinations** per product

### Managing Attributes

1. **Create attributes before products** that use them
2. **Use consistent naming** (e.g., "Color" not "Colour" or "color")
3. **Assign to categories** to enforce consistency
4. **Mark critical attributes as required** (e.g., Size for clothing)

### Stock Management

1. **Set realistic low stock thresholds**
2. **Use restock feature** to track inventory history
3. **Monitor stock movements** for audit trail
4. **Regular stock audits** to match physical inventory

### Category Organization

1. **Create logical hierarchy** (even though current schema is flat)
2. **Define required attributes** for each category
3. **Use descriptive names and descriptions**
4. **Add category images** for better UX

---

## Future Enhancements

### Recommended Features

1. **Soft Delete System**
   - Implement deletedAt timestamps
   - Filter deleted items from queries
   - Admin interface to view/restore deleted items

2. **Category Hierarchy**
   - Add parentId to Category model
   - Support nested categories
   - Inherit attributes from parent categories

3. **Variant Templates**
   - Save common attribute combinations
   - Quick variant creation from templates

4. **Bulk Operations**
   - Bulk update prices
   - Bulk update stock
   - Bulk assign categories

5. **Image Management**
   - Track Cloudinary public_ids
   - Automatic cleanup on delete
   - Image optimization

6. **Advanced Search**
   - Search by attributes
   - Price range filters
   - Stock availability filters

7. **Inventory Alerts**
   - Email notifications for low stock
   - Automatic reorder suggestions
   - Stock forecast based on sales

8. **Audit Trail**
   - Track all changes to products
   - User attribution for changes
   - Rollback capability

---

## Troubleshooting

### Common Errors

#### "Duplicate SKU detected"
- **Cause:** SKU already exists in database
- **Solution:** Use unique SKU or update existing variant

#### "Duplicate attribute combinations detected"
- **Cause:** Two variants have identical attributes
- **Solution:** Ensure each variant has unique attribute combination

#### "Missing required attributes"
- **Cause:** Category requires attributes not provided
- **Solution:** Add required attributes to all variants

#### "Attribute value does not belong to attribute"
- **Cause:** ValueId doesn't match AttributeId
- **Solution:** Verify attribute-value pairs are correct

#### "Cannot delete product"
- **Cause:** Product variants referenced in orders
- **Solution:** See "Known Issues" section for solutions

---

## API Testing

### Postman Collections

Collections are available in `/collections/` directory:
- `Product.postman_collection.json`
- `Attributes.postman_collection.json`
- `Variants.postman_collection.json`
- `Category.postman_collection.json`

### Example Requests

See individual collection files for complete examples with:
- Authentication headers
- Request bodies
- Expected responses
- Error scenarios

---

## Conclusion

This architecture provides a flexible and scalable product catalog system with:
- ✅ Multi-variant products
- ✅ Dynamic attributes
- ✅ Category organization
- ✅ Stock management
- ✅ Comprehensive validation
- ⚠️ Known deletion limitation (see Known Issues)

For questions or issues, refer to the API documentation or contact the development team.
