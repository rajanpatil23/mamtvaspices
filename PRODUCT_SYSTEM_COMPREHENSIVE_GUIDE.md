# 🛍️ Complete Product System Guide - Understanding Your E-Commerce App

## 📋 Table of Contents
1. [System Overview](#system-overview)
2. [Core Entities Explained](#core-entities-explained)
3. [How Everything Connects](#how-everything-connects)
4. [Step-by-Step Configuration Guide](#step-by-step-configuration-guide)
5. [Real-World Examples](#real-world-examples)
6. [Common Scenarios](#common-scenarios)
7. [API Reference](#api-reference)
8. [Troubleshooting](#troubleshooting)

---

## 🎯 System Overview

Your app uses a **4-layer product system** that provides maximum flexibility:

```
┌─────────────────────────────────────────────────────────────┐
│                        PRODUCT SYSTEM                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. CATEGORIES          → Groups products (e.g., Clothing)  │
│     ↓                                                        │
│  2. ATTRIBUTES          → Defines properties (e.g., Color)  │
│     ↓                                                        │
│  3. PRODUCTS            → The actual items (e.g., T-Shirt)  │
│     ↓                                                        │
│  4. VARIANTS            → Specific versions (Red T-Shirt M) │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Why This Structure?

**Traditional Simple System:**
```
Product: "Red T-Shirt Medium" - $19.99
Product: "Red T-Shirt Large" - $19.99
Product: "Blue T-Shirt Medium" - $19.99
❌ Problem: 100 products for 10 colors × 5 sizes × 2 styles
```

**Your Advanced System:**
```
Product: "T-Shirt"
  ├─ Variant 1: Red + Medium → $19.99
  ├─ Variant 2: Red + Large → $19.99
  ├─ Variant 3: Blue + Medium → $19.99
  └─ Variant 4: Blue + Large → $19.99
✅ Solution: 1 product with 4 variants
```

---

## 🧩 Core Entities Explained

### 1️⃣ **CATEGORY** - The Foundation

**What it is:** A group that organizes similar products

**Database Structure:**
```typescript
Category {
  id: string              // Unique identifier
  name: string            // "Clothing", "Electronics", "Food"
  slug: string            // "clothing" (URL-friendly)
  description: string     // Optional description
  images: JSON            // Category banner images
  products: Product[]     // All products in this category
  attributes: CategoryAttribute[]  // Allowed attributes
}
```

**Real Examples:**
```
Category: "Clothing"
  ├─ Products: T-Shirts, Jeans, Jackets
  └─ Attributes: Size, Color, Material, Brand

Category: "Electronics"
  ├─ Products: Phones, Laptops, Tablets
  └─ Attributes: Brand, Storage, RAM, Screen Size

Category: "Spices"
  ├─ Products: Turmeric, Chili Powder, Cumin
  └─ Attributes: Weight, Packaging, Origin, Organic
```

**Key Features:**
- ✅ Each product belongs to ONE category
- ✅ Categories define which attributes are available
- ✅ Categories can have required vs optional attributes
- ✅ Deleting a category sets products' categoryId to null (not deleted)

---

### 2️⃣ **ATTRIBUTE** - The Property Definition

**What it is:** A characteristic that products can have (like "Color" or "Size")

**Database Structure:**
```typescript
Attribute {
  id: string              // Unique identifier
  name: string            // "Color", "Size", "Brand"
  slug: string            // "color" (URL-friendly)
  values: AttributeValue[]  // Possible values
  categories: CategoryAttribute[]  // Which categories use this
  variantAttributes: ProductVariantAttribute[]  // Usage in variants
}

AttributeValue {
  id: string              // Unique identifier
  attributeId: string     // Links to parent attribute
  value: string           // "Red", "Large", "Cotton"
  slug: string            // "red" (URL-friendly)
}

CategoryAttribute {
  id: string              // Unique identifier
  categoryId: string      // Which category
  attributeId: string     // Which attribute
  isRequired: boolean     // Must variants have this?
}
```

**Real Examples:**

**Attribute: "Color"**
```
Attribute {
  name: "Color"
  values: [
    { value: "Red", slug: "red" },
    { value: "Blue", slug: "blue" },
    { value: "Green", slug: "green" }
  ]
}
```

**Attribute: "Size"**
```
Attribute {
  name: "Size"
  values: [
    { value: "Small", slug: "small" },
    { value: "Medium", slug: "medium" },
    { value: "Large", slug: "large" },
    { value: "XL", slug: "xl" }
  ]
}
```

**Attribute: "Weight"**
```
Attribute {
  name: "Weight"
  values: [
    { value: "100g", slug: "100g" },
    { value: "250g", slug: "250g" },
    { value: "500g", slug: "500g" },
    { value: "1kg", slug: "1kg" }
  ]
}
```

**Key Features:**
- ✅ Attributes are reusable across categories
- ✅ Each attribute can have multiple values
- ✅ Attributes can be required or optional per category
- ✅ Deleting an attribute cascades to all its values and mappings

---

### 3️⃣ **PRODUCT** - The Main Item

**What it is:** The general product (like "T-Shirt" or "Turmeric Powder")

**Database Structure:**
```typescript
Product {
  id: string              // Unique identifier
  name: string            // "Premium Cotton T-Shirt"
  slug: string            // "premium-cotton-t-shirt"
  description: string     // Product details
  categoryId: string      // Which category it belongs to
  
  // Marketing flags
  isNew: boolean          // Show "NEW" badge
  isFeatured: boolean     // Show on homepage
  isTrending: boolean     // Show in trending section
  isBestSeller: boolean   // Show "Best Seller" badge
  
  // Computed fields
  averageRating: float    // Average of all reviews
  reviewCount: int        // Total number of reviews
  salesCount: int         // Total units sold
  
  // Relations
  variants: ProductVariant[]  // All variations
  reviews: Review[]       // Customer reviews
  category: Category      // Parent category
}
```

**Real Example:**
```
Product: "Mamtva Organic Turmeric Powder"
  ├─ Category: "Spices"
  ├─ Description: "Premium quality organic turmeric..."
  ├─ isNew: true
  ├─ isFeatured: true
  ├─ averageRating: 4.5
  ├─ reviewCount: 127
  └─ Variants:
      ├─ 100g pack - $5.99
      ├─ 250g pack - $12.99
      └─ 500g pack - $22.99
```

**Key Features:**
- ✅ Products are the "parent" - variants are the "children"
- ✅ You CANNOT sell a product directly - only its variants
- ✅ Product-level flags (isNew, isFeatured) apply to all variants
- ✅ Each product must have at least ONE variant
- ✅ Deleting a product cascades to all its variants

---

### 4️⃣ **VARIANT** - The Actual Sellable Item

**What it is:** A specific version of a product with unique attributes

**Database Structure:**
```typescript
ProductVariant {
  id: string              // Unique identifier
  productId: string       // Parent product
  sku: string             // Stock Keeping Unit (unique)
  
  // Pricing & Inventory
  price: float            // Selling price
  stock: int              // Available quantity
  lowStockThreshold: int  // Alert when stock falls below this
  
  // Physical tracking
  barcode: string         // Barcode for scanning
  warehouseLocation: string  // Where it's stored
  
  // Media
  images: JSON            // Array of image URLs
  
  // Attributes (what makes this variant unique)
  attributes: ProductVariantAttribute[]
  
  // Relations
  product: Product        // Parent product
  orderItems: OrderItem[] // Orders containing this
  cartItems: CartItem[]   // Carts containing this
  stockMovements: StockMovement[]  // Inventory history
  restocks: Restock[]     // Restock history
}

ProductVariantAttribute {
  id: string              // Unique identifier
  variantId: string       // Which variant
  attributeId: string     // Which attribute (e.g., "Color")
  valueId: string         // Which value (e.g., "Red")
}
```

**Real Example:**

**Product: "Premium T-Shirt"**
```
Variant 1:
  ├─ SKU: "TSH-RED-M"
  ├─ Price: $19.99
  ├─ Stock: 50 units
  ├─ Images: ["red-tshirt-front.jpg", "red-tshirt-back.jpg"]
  ├─ Barcode: "123456789012"
  ├─ Warehouse: "WH-A1-SHELF-3"
  └─ Attributes:
      ├─ Color: Red
      └─ Size: Medium

Variant 2:
  ├─ SKU: "TSH-RED-L"
  ├─ Price: $19.99
  ├─ Stock: 30 units
  ├─ Images: ["red-tshirt-front.jpg", "red-tshirt-back.jpg"]
  ├─ Barcode: "123456789013"
  ├─ Warehouse: "WH-A1-SHELF-3"
  └─ Attributes:
      ├─ Color: Red
      └─ Size: Large

Variant 3:
  ├─ SKU: "TSH-BLU-M"
  ├─ Price: $21.99  ← Different price!
  ├─ Stock: 25 units
  ├─ Images: ["blue-tshirt-front.jpg", "blue-tshirt-back.jpg"]
  ├─ Barcode: "123456789014"
  ├─ Warehouse: "WH-A1-SHELF-4"
  └─ Attributes:
      ├─ Color: Blue
      └─ Size: Medium
```

**Key Features:**
- ✅ Each variant MUST have a unique SKU
- ✅ Each variant MUST have unique attribute combinations
- ✅ Variants can have different prices (e.g., XL costs more)
- ✅ Variants can have different images
- ✅ Stock is tracked per variant, not per product
- ✅ Customers add VARIANTS to cart, not products

---

## 🔗 How Everything Connects

### The Complete Flow

```
┌──────────────────────────────────────────────────────────────┐
│                    CONFIGURATION FLOW                         │
└──────────────────────────────────────────────────────────────┘

STEP 1: Create Category
  ↓
  Category: "Clothing"

STEP 2: Create Attributes
  ↓
  Attribute: "Color" → Values: [Red, Blue, Green]
  Attribute: "Size" → Values: [S, M, L, XL]
  Attribute: "Material" → Values: [Cotton, Polyester]

STEP 3: Assign Attributes to Category
  ↓
  Clothing Category:
    ├─ Color (Required)
    ├─ Size (Required)
    └─ Material (Optional)

STEP 4: Create Product
  ↓
  Product: "Premium T-Shirt"
    └─ Category: Clothing

STEP 5: Create Variants
  ↓
  Variant 1: Red + Medium + Cotton → $19.99
  Variant 2: Red + Large + Cotton → $19.99
  Variant 3: Blue + Medium + Polyester → $21.99
  Variant 4: Blue + Large + Polyester → $21.99

┌──────────────────────────────────────────────────────────────┐
│                    CUSTOMER FLOW                              │
└──────────────────────────────────────────────────────────────┘

STEP 1: Browse Category
  ↓
  Customer sees: "Clothing" category

STEP 2: View Product
  ↓
  Customer sees: "Premium T-Shirt"
    └─ Available options: Color, Size, Material

STEP 3: Select Variant
  ↓
  Customer selects: Red + Large + Cotton
    └─ System shows: $19.99, 30 in stock

STEP 4: Add to Cart
  ↓
  Cart contains: Variant "TSH-RED-L" × 1

STEP 5: Checkout
  ↓
  Order created with specific variant
  Stock reduced: 30 → 29
```

### Database Relationships

```
Category (1) ──────────── (Many) Product
    │                           │
    │                           │
    │                      (1 to Many)
    │                           │
    │                      ProductVariant
    │                           │
    │                           │
    │                      (Many to Many)
    │                           │
    └──── (Many to Many) ───────┘
              via                
        CategoryAttribute    ProductVariantAttribute
              │                     │
              │                     │
         Attribute ─────────── AttributeValue
```

### Validation Rules

**When Creating a Product:**
```typescript
✅ Must have a name
✅ Must have at least ONE variant
✅ Category is optional (can be null)
✅ If category is set, variants must have required attributes
```

**When Creating a Variant:**
```typescript
✅ Must have unique SKU
✅ Must have at least one attribute
✅ Must have unique attribute combination for that product
✅ Must have all required attributes from category
✅ Price must be positive
✅ Stock cannot be negative
```

**When Assigning Attribute to Category:**
```typescript
✅ Attribute must exist
✅ Category must exist
✅ Cannot assign same attribute twice to same category
✅ Can mark as required or optional
```

---

## 📖 Step-by-Step Configuration Guide

### Scenario: Setting Up a Spice Store

#### Step 1: Create Categories

**API Call:**
```http
POST /api/categories
Content-Type: multipart/form-data
Authorization: Bearer <admin-token>

{
  "name": "Spices",
  "description": "Premium quality spices from around the world",
  "images": [<file>]
}
```

**Result:**
```json
{
  "category": {
    "id": "cat-123",
    "name": "Spices",
    "slug": "spices",
    "description": "Premium quality spices...",
    "images": ["https://cdn.example.com/spices-banner.jpg"]
  }
}
```

#### Step 2: Create Attributes

**Create "Weight" Attribute:**
```http
POST /api/attributes
Content-Type: application/json

{
  "name": "Weight"
}
```

**Result:**
```json
{
  "id": "attr-weight-123",
  "name": "Weight",
  "slug": "weight"
}
```

**Create Weight Values:**
```http
POST /api/attributes/value
Content-Type: application/json

{
  "attributeId": "attr-weight-123",
  "value": "100g"
}
```

Repeat for: 250g, 500g, 1kg

**Create "Packaging" Attribute:**
```http
POST /api/attributes
Content-Type: application/json

{
  "name": "Packaging"
}
```

**Create Packaging Values:**
- "Pouch"
- "Jar"
- "Box"

**Create "Organic" Attribute:**
```http
POST /api/attributes
Content-Type: application/json

{
  "name": "Organic"
}
```

**Create Organic Values:**
- "Yes"
- "No"

#### Step 3: Assign Attributes to Category

**Make Weight Required:**
```http
POST /api/attributes/assign-category
Content-Type: application/json

{
  "categoryId": "cat-123",
  "attributeId": "attr-weight-123",
  "isRequired": true
}
```

**Make Packaging Required:**
```http
POST /api/attributes/assign-category
Content-Type: application/json

{
  "categoryId": "cat-123",
  "attributeId": "attr-packaging-456",
  "isRequired": true
}
```

**Make Organic Optional:**
```http
POST /api/attributes/assign-category
Content-Type: application/json

{
  "categoryId": "cat-123",
  "attributeId": "attr-organic-789",
  "isRequired": false
}
```

#### Step 4: Create Product

```http
POST /api/products
Content-Type: multipart/form-data
Authorization: Bearer <admin-token>

{
  "name": "Mamtva Organic Turmeric Powder",
  "description": "Premium quality organic turmeric powder...",
  "categoryId": "cat-123",
  "isNew": true,
  "isFeatured": true,
  "variants": [
    {
      "sku": "TUR-100G-POUCH",
      "price": 5.99,
      "stock": 100,
      "lowStockThreshold": 20,
      "barcode": "8901234567890",
      "warehouseLocation": "WH-A1-SHELF-5",
      "images": ["turmeric-100g.jpg"],
      "attributes": [
        {
          "attributeId": "attr-weight-123",
          "valueId": "val-100g-001"
        },
        {
          "attributeId": "attr-packaging-456",
          "valueId": "val-pouch-001"
        },
        {
          "attributeId": "attr-organic-789",
          "valueId": "val-yes-001"
        }
      ]
    },
    {
      "sku": "TUR-250G-JAR",
      "price": 12.99,
      "stock": 75,
      "lowStockThreshold": 15,
      "barcode": "8901234567891",
      "warehouseLocation": "WH-A1-SHELF-5",
      "images": ["turmeric-250g.jpg"],
      "attributes": [
        {
          "attributeId": "attr-weight-123",
          "valueId": "val-250g-002"
        },
        {
          "attributeId": "attr-packaging-456",
          "valueId": "val-jar-002"
        },
        {
          "attributeId": "attr-organic-789",
          "valueId": "val-yes-001"
        }
      ]
    }
  ]
}
```

**Result:**
```json
{
  "id": "prod-turmeric-123",
  "name": "Mamtva Organic Turmeric Powder",
  "slug": "mamtva-organic-turmeric-powder",
  "categoryId": "cat-123",
  "isNew": true,
  "isFeatured": true,
  "variants": [
    {
      "id": "var-001",
      "sku": "TUR-100G-POUCH",
      "price": 5.99,
      "stock": 100,
      "attributes": [
        { "attribute": "Weight", "value": "100g" },
        { "attribute": "Packaging", "value": "Pouch" },
        { "attribute": "Organic", "value": "Yes" }
      ]
    },
    {
      "id": "var-002",
      "sku": "TUR-250G-JAR",
      "price": 12.99,
      "stock": 75,
      "attributes": [
        { "attribute": "Weight", "value": "250g" },
        { "attribute": "Packaging", "value": "Jar" },
        { "attribute": "Organic", "value": "Yes" }
      ]
    }
  ]
}
```

---

## 🎯 Real-World Examples

### Example 1: Clothing Store

**Setup:**
```
Category: "T-Shirts"
  Attributes:
    ├─ Color (Required): Red, Blue, Green, Black, White
    ├─ Size (Required): XS, S, M, L, XL, XXL
    ├─ Material (Optional): Cotton, Polyester, Blend
    └─ Fit (Optional): Regular, Slim, Relaxed

Product: "Classic Cotton Tee"
  Variants:
    ├─ Red + M + Cotton + Regular → $19.99 (50 in stock)
    ├─ Red + L + Cotton + Regular → $19.99 (30 in stock)
    ├─ Blue + M + Cotton + Slim → $21.99 (40 in stock)
    └─ Black + XL + Blend + Relaxed → $22.99 (25 in stock)
```

**Customer Experience:**
```
1. Customer visits "T-Shirts" category
2. Sees "Classic Cotton Tee" product
3. Selects:
   - Color: Red
   - Size: M
   - Material: Cotton
   - Fit: Regular
4. System shows: $19.99, 50 available
5. Adds to cart → Variant "TSH-RED-M-COT-REG"
```

### Example 2: Electronics Store

**Setup:**
```
Category: "Smartphones"
  Attributes:
    ├─ Brand (Required): Apple, Samsung, Google
    ├─ Storage (Required): 64GB, 128GB, 256GB, 512GB
    ├─ Color (Required): Black, White, Blue, Red
    └─ Condition (Optional): New, Refurbished

Product: "iPhone 15 Pro"
  Variants:
    ├─ Apple + 128GB + Black + New → $999 (10 in stock)
    ├─ Apple + 256GB + Black + New → $1099 (8 in stock)
    ├─ Apple + 128GB + Blue + New → $999 (5 in stock)
    └─ Apple + 256GB + White + Refurbished → $899 (3 in stock)
```

### Example 3: Food/Spice Store (Your Use Case)

**Setup:**
```
Category: "Spices"
  Attributes:
    ├─ Weight (Required): 50g, 100g, 250g, 500g, 1kg
    ├─ Packaging (Required): Pouch, Jar, Box
    ├─ Organic (Optional): Yes, No
    └─ Origin (Optional): India, Mexico, Thailand

Product: "Chili Powder"
  Variants:
    ├─ 100g + Pouch + Organic + India → $4.99 (200 in stock)
    ├─ 250g + Jar + Organic + India → $10.99 (150 in stock)
    ├─ 500g + Box + Non-Organic + Mexico → $15.99 (100 in stock)
    └─ 1kg + Box + Organic + India → $28.99 (50 in stock)
```

---

## 🔧 Common Scenarios

### Scenario 1: Adding a New Product to Existing Category

**You already have:**
- ✅ Category: "Spices"
- ✅ Attributes: Weight, Packaging, Organic

**To add new product:**
```http
POST /api/products

{
  "name": "Cumin Seeds",
  "categoryId": "cat-spices-123",
  "variants": [
    {
      "sku": "CUM-100G-POUCH",
      "price": 3.99,
      "stock": 150,
      "attributes": [
        { "attributeId": "attr-weight", "valueId": "val-100g" },
        { "attributeId": "attr-packaging", "valueId": "val-pouch" }
      ]
    }
  ]
}
```

### Scenario 2: Adding New Variant to Existing Product

**You have:**
- ✅ Product: "Turmeric Powder"
- ✅ Existing variants: 100g, 250g

**To add 500g variant:**
```http
POST /api/variants

{
  "productId": "prod-turmeric-123",
  "sku": "TUR-500G-JAR",
  "price": 22.99,
  "stock": 50,
  "attributes": [
    { "attributeId": "attr-weight", "valueId": "val-500g" },
    { "attributeId": "attr-packaging", "valueId": "val-jar" }
  ]
}
```

### Scenario 3: Updating Variant Stock

**When product is sold:**
```http
PATCH /api/variants/var-001

{
  "stock": 49  // Reduced by 1
}
```

**When restocking:**
```http
POST /api/variants/var-001/restock

{
  "quantity": 50,
  "notes": "Received shipment from supplier",
  "userId": "user-admin-123"
}
```

This will:
- ✅ Add 50 to current stock
- ✅ Create restock record
- ✅ Create stock movement record
- ✅ Check if still low stock

### Scenario 4: Changing Variant Price

**Seasonal sale:**
```http
PATCH /api/variants/var-001

{
  "price": 4.99  // Was $5.99, now $4.99
}
```

### Scenario 5: Adding New Attribute Value

**You have:**
- ✅ Attribute: "Weight"
- ✅ Values: 100g, 250g, 500g

**To add 1kg:**
```http
POST /api/attributes/value

{
  "attributeId": "attr-weight-123",
  "value": "1kg"
}
```

Now you can use "1kg" in new variants!

---

## 📚 API Reference

### Categories

```http
# Get all categories
GET /api/categories
Query params: ?page=1&limit=10&sort=name

# Get single category
GET /api/categories/:id

# Create category (Admin only)
POST /api/categories
Body: { name, description, images, attributes }

# Update category (Admin only)
PUT /api/categories/:id
Body: { name, description, images }

# Delete category (Admin only)
DELETE /api/categories/:id
```

### Attributes

```http
# Get all attributes
GET /api/attributes
Query params: ?page=1&limit=10

# Get single attribute
GET /api/attributes/:id

# Create attribute
POST /api/attributes
Body: { name }

# Create attribute value
POST /api/attributes/value
Body: { attributeId, value }

# Assign to category
POST /api/attributes/assign-category
Body: { categoryId, attributeId, isRequired }

# Update category attribute
PUT /api/attributes/category-attribute/:id
Body: { isRequired }

# Delete attribute
DELETE /api/attributes/:id

# Delete attribute value
DELETE /api/attributes/value/:id

# Delete category attribute mapping
DELETE /api/attributes/category-attribute/:id
```

### Products

```http
# Get all products
GET /api/products
Query params: ?page=1&limit=10&categoryId=xxx&isNew=true

# Get single product
GET /api/products/:id

# Get product by slug
GET /api/products/slug/:slug

# Create product (Admin only)
POST /api/products
Body: { name, description, categoryId, variants, isNew, isFeatured }

# Update product (Admin only)
PUT /api/products/:id
Body: { name, description, variants }

# Bulk create products (Admin only)
POST /api/products/bulk
Body: FormData with CSV/XLSX file

# Delete product (Admin only)
DELETE /api/products/:id
```

### Variants

```http
# Get all variants
GET /api/variants
Query params: ?page=1&limit=10&productId=xxx

# Get single variant
GET /api/variants/:id

# Get variant by SKU
GET /api/variants/sku/:sku

# Get restock history
GET /api/variants/:id/restock-history
Query params: ?page=1&limit=10

# Create variant
POST /api/variants
Body: { productId, sku, price, stock, attributes }

# Update variant
PATCH /api/variants/:id
Body: { price, stock, attributes }

# Restock variant
POST /api/variants/:id/restock
Body: { quantity, notes, userId }

# Delete variant
DELETE /api/variants/:id
```

---

## 🐛 Troubleshooting

### Error: "At least one variant is required"

**Problem:** Trying to create product without variants

**Solution:**
```json
{
  "name": "Product Name",
  "variants": [  // ← Must have at least one
    {
      "sku": "PROD-001",
      "price": 19.99,
      "stock": 50,
      "attributes": [...]
    }
  ]
}
```

### Error: "Duplicate SKUs detected"

**Problem:** Two variants have the same SKU

**Solution:** Each variant needs unique SKU
```json
{
  "variants": [
    { "sku": "PROD-RED-M" },   // ✅ Unique
    { "sku": "PROD-RED-L" },   // ✅ Unique
    { "sku": "PROD-RED-M" }    // ❌ Duplicate!
  ]
}
```

### Error: "Duplicate attribute combinations detected"

**Problem:** Two variants have same attributes

**Solution:** Each variant must be unique
```json
{
  "variants": [
    {
      "sku": "PROD-001",
      "attributes": [
        { "attributeId": "color", "valueId": "red" },
        { "attributeId": "size", "valueId": "medium" }
      ]
    },
    {
      "sku": "PROD-002",
      "attributes": [
        { "attributeId": "color", "valueId": "red" },
        { "attributeId": "size", "valueId": "medium" }  // ❌ Same as above!
      ]
    }
  ]
}
```

### Error: "Variant is missing required attributes"

**Problem:** Category requires certain attributes

**Solution:** Include all required attributes
```json
// Category "Clothing" requires: Color, Size

{
  "variants": [
    {
      "attributes": [
        { "attributeId": "color", "valueId": "red" },
        { "attributeId": "size", "valueId": "medium" }  // ✅ Both required
      ]
    }
  ]
}
```

### Error: "Attribute value does
