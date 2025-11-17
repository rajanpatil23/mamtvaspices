# ❓ Product System FAQ & Troubleshooting Guide

## 📚 Table of Contents
1. [Frequently Asked Questions](#frequently-asked-questions)
2. [Common Errors & Solutions](#common-errors--solutions)
3. [Best Practices](#best-practices)
4. [Performance Tips](#performance-tips)
5. [Data Migration](#data-migration)

---

## ❓ Frequently Asked Questions

### General Questions

#### Q1: Why do I need variants? Can't I just create separate products?

**Answer:**
You *could* create separate products, but variants are much better:

**Without Variants (Bad):**
```
Product 1: "Red T-Shirt Small" - $19.99
Product 2: "Red T-Shirt Medium" - $19.99
Product 3: "Red T-Shirt Large" - $19.99
Product 4: "Blue T-Shirt Small" - $19.99
... (100+ products for 10 colors × 5 sizes × 2 styles)
```

**Problems:**
- ❌ 100+ separate products to manage
- ❌ Customer sees 100 products in search
- ❌ Can't easily compare options
- ❌ Duplicate descriptions, images, reviews
- ❌ Hard to update prices (must update 100 products)

**With Variants (Good):**
```
Product: "T-Shirt"
  Variant 1: Red + Small → $19.99
  Variant 2: Red + Medium → $19.99
  Variant 3: Red + Large → $19.99
  Variant 4: Blue + Small → $19.99
  ... (1 product with 100 variants)
```

**Benefits:**
- ✅ 1 product to manage
- ✅ Customer sees 1 product, selects options
- ✅ Easy comparison
- ✅ Shared description, reviews
- ✅ Update price once, applies to all

---

#### Q2: What's the difference between a Product and a Variant?

**Answer:**

**Product = The General Item**
- Example: "iPhone 15 Pro"
- Has: Name, description, category, reviews
- Cannot be purchased directly

**Variant = Specific Version**
- Example: "iPhone 15 Pro, 256GB, Blue"
- Has: SKU, price, stock, specific attributes
- This is what customers actually buy

**Analogy:**
```
Product = "Car Model" (e.g., "Tesla Model 3")
Variant = "Specific Car" (e.g., "Tesla Model 3, Long Range, Red, 2024")
```

---

#### Q3: Can a product have no category?

**Answer:**
Yes! `categoryId` is optional. However:

**With Category:**
```
✅ Attributes are validated
✅ Required attributes enforced
✅ Better organization
✅ Easier filtering
✅ Better SEO
```

**Without Category:**
```
⚠️ No attribute validation
⚠️ Harder to organize
⚠️ Harder to filter
⚠️ Less structured data
```

**Recommendation:** Always assign a category unless it's a truly unique item.

---

#### Q4: Can I change a product's category after creation?

**Answer:**
Yes, but be careful!

**What Happens:**
```
Old Category: "Clothing"
  Required: Color, Size

New Category: "Electronics"
  Required: Brand, Storage

Existing Variants:
  ✓ Have: Color, Size
  ✗ Missing: Brand, Storage
```

**Result:** Existing variants become invalid!

**Solution:**
1. Update category
2. Update ALL variants to include new required attributes
3. Or: Delete and recreate variants

**Better Approach:**
- Plan categories carefully before creating products
- Use optional attributes for flexibility

---

#### Q5: Can multiple products share the same variant?

**Answer:**
No! Each variant belongs to exactly ONE product.

**Why?**
```
Product A: "T-Shirt"
Product B: "Polo Shirt"

Can they share variant "Red + Medium"?
❌ No - they're different products!

Even if they have same attributes, they're different items:
- Different descriptions
- Different images
- Different prices
- Different stock
```

---

#### Q6: What happens if I delete a category?

**Answer:**
```
Category deleted → Products' categoryId set to NULL

Products still exist!
Variants still exist!
Orders still exist!

But:
⚠️ Products lose category association
⚠️ No attribute validation anymore
⚠️ Harder to organize
```

**Recommendation:** Don't delete categories with products. Instead:
1. Move products to another category first
2. Then delete empty category

---

#### Q7: Can I have variants with different prices?

**Answer:**
Absolutely! This is common:

**Example 1: Size-based pricing**
```
Product: "T-Shirt"
  Small: $19.99
  Medium: $19.99
  Large: $19.99
  XL: $21.99    ← More expensive
  XXL: $23.99   ← Even more expensive
```

**Example 2: Storage-based pricing**
```
Product: "iPhone 15"
  64GB: $799
  128GB: $899
  256GB: $999
  512GB: $1199
```

**Example 3: Material-based pricing**
```
Product: "Notebook"
  Paper: $5.99
  Leather: $12.99
  Premium Leather: $19.99
```

---

#### Q8: How many variants can a product have?

**Answer:**
**Technical Limit:** No hard limit in the database

**Practical Limits:**
```
Attributes: 3 (Color, Size, Material)
Values per attribute: 5, 5, 3

Maximum combinations: 5 × 5 × 3 = 75 variants
```

**Recommendations:**
- **Small products:** 5-20 variants (typical)
- **Medium products:** 20-50 variants (common)
- **Large products:** 50-100 variants (manageable)
- **Very large:** 100+ variants (consider splitting)

**Performance Impact:**
- ✅ 1-50 variants: No issues
- ⚠️ 50-200 variants: Slight slowdown
- ❌ 200+ variants: Consider optimization

---

#### Q9: Can I import products from a CSV/Excel file?

**Answer:**
Yes! There's a bulk import endpoint:

```http
POST /api/products/bulk
Content-Type: multipart/form-data

file: products.csv
```

**CSV Format:**
```csv
name,description,basePrice,discount,categoryId,isNew,isFeatured
"Turmeric Powder","Premium quality",5.99,0,cat-123,true,true
"Chili Powder","Hot and spicy",4.99,0,cat-123,false,true
```

**Note:** This creates products but NOT variants. You'll need to add variants separately.

---

#### Q10: How do I handle products that are "out of stock"?

**Answer:**
Set variant stock to 0:

```http
PATCH /api/variants/var-123
{
  "stock": 0
}
```

**What Happens:**
- ✅ Product still visible
- ✅ Variant shows "Out of Stock"
- ❌ Cannot add to cart
- ✅ Customer can sign up for restock notification

**Alternative:** Delete the variant (not recommended)

---

### Attribute Questions

#### Q11: Can I rename an attribute?

**Answer:**
Not directly through the API, but you can:

**Option 1: Database Update (Careful!)**
```sql
UPDATE Attribute SET name = 'New Name' WHERE id = 'attr-123';
```

**Option 2: Create New + Migrate**
1. Create new attribute with correct name
2. Create all values
3. Update all variants to use new attribute
4. Delete old attribute

**Recommendation:** Plan attribute names carefully!

---

#### Q12: Can I delete an attribute value that's in use?

**Answer:**
No! The database will prevent it:

```
Error: Cannot delete attribute value
Reason: Referenced by ProductVariantAttribute

Variants using this value: 15
```

**Solution:**
1. Find all variants using this value
2. Update them to use a different value
3. Then delete the value

---

#### Q13: What's the difference between required and optional attributes?

**Answer:**

**Required Attribute:**
```
Category: "Clothing"
  Color (Required)
  Size (Required)

Every variant MUST have:
✓ Color: Red
✓ Size: Medium

Cannot create variant without these!
```

**Optional Attribute:**
```
Category: "Clothing"
  Material (Optional)
  Brand (Optional)

Variant can have:
✓ Material: Cotton
✓ Brand: Nike

Or not:
✓ No material specified
✓ No brand specified
```

**Use Cases:**
- **Required:** Core differentiators (Size, Color, Weight)
- **Optional:** Additional info (Brand, Origin, Certification)

---

#### Q14: Can I make an optional attribute required later?

**Answer:**
Yes, but existing variants might become invalid!

**Scenario:**
```
1. Create category with "Brand" as optional
2. Create 50 variants without brand
3. Change "Brand" to required
4. Now 50 variants are invalid!
```

**Solution:**
```http
PUT /api/attributes/category-attribute/ca-123
{
  "isRequired": true
}
```

Then update all variants to include brand.

**Recommendation:** Plan required attributes upfront!

---

### Variant Questions

#### Q15: Can two variants have the same SKU?

**Answer:**
No! SKUs must be globally unique:

```
Product A:
  Variant 1: SKU "TSH-001" ✓

Product B:
  Variant 2: SKU "TSH-001" ✗ Error: Duplicate SKU!
```

**Why?**
- SKUs are used for inventory tracking
- Used in orders, shipments, barcodes
- Must be unique to identify specific items

---

#### Q16: What's a good SKU naming convention?

**Answer:**

**Format:** `[PRODUCT]-[ATTR1]-[ATTR2]-[ATTR3]`

**Examples:**
```
✅ Good SKUs:
- TSH-RED-M (T-Shirt, Red, Medium)
- IPH-256-BLU (iPhone, 256GB, Blue)
- TUR-100G-POUCH (Turmeric, 100g, Pouch)
- LAP-16GB-512GB (Laptop, 16GB RAM, 512GB Storage)

❌ Bad SKUs:
- 12345 (not descriptive)
- tshirt-red-medium (inconsistent case)
- T-SHIRT-RED-MEDIUM-COTTON-ORGANIC (too long)
- TSH_RED_M (use dashes, not underscores)
```

**Rules:**
1. Use uppercase
2. Use dashes as separators
3. Keep it short but descriptive
4. Be consistent across products
5. Include key differentiators

---

#### Q17: Can I change a variant's attributes after creation?

**Answer:**
Yes, but the new combination must be unique:

```http
PATCH /api/variants/var-123
{
  "attributes": [
    { "attributeId": "attr-color", "valueId": "val-blue" },
    { "attributeId": "attr-size", "valueId": "val-large" }
  ]
}
```

**Validation:**
```
Existing variants for this product:
1. Red + Medium ✓
2. Red + Large ✓
3. Blue + Medium ✓

Trying to change variant 1 to:
Blue + Medium ✗ Error: Duplicate combination!
Blue + Large ✓ OK (unique)
```

---

#### Q18: How do I handle variant images?

**Answer:**
Each variant can have its own images:

```json
{
  "variants": [
    {
      "sku": "TSH-RED-M",
      "images": [
        "https://cdn.example.com/tshirt-red-front.jpg",
        "https://cdn.example.com/tshirt-red-back.jpg"
      ]
    },
    {
      "sku": "TSH-BLU-M",
      "images": [
        "https://cdn.example.com/tshirt-blue-front.jpg",
        "https://cdn.example.com/tshirt-blue-back.jpg"
      ]
    }
  ]
}
```

**Best Practices:**
- Use CDN for images
- Optimize image sizes
- Use consistent naming
- Include multiple angles
- Show product in use

---

## 🐛 Common Errors & Solutions

### Error 1: "At least one variant is required"

**Error Message:**
```json
{
  "status": 400,
  "message": "At least one variant is required"
}
```

**Cause:**
```json
{
  "name": "Product Name",
  "variants": []  // ← Empty array!
}
```

**Solution:**
```json
{
  "name": "Product Name",
  "variants": [
    {
      "sku": "PROD-001",
      "price": 19.99,
      "stock": 50,
      "attributes": [...]
    }
  ]
}
```

---

### Error 2: "Duplicate SKUs detected"

**Error Message:**
```json
{
  "status": 400,
  "message": "Duplicate SKUs detected: TSH-RED-M"
}
```

**Cause:**
```json
{
  "variants": [
    { "sku": "TSH-RED-M" },
    { "sku": "TSH-RED-M" }  // ← Duplicate!
  ]
}
```

**Solution:**
Make each SKU unique:
```json
{
  "variants": [
    { "sku": "TSH-RED-M" },
    { "sku": "TSH-RED-L" }  // ← Different
  ]
}
```

---

### Error 3: "Duplicate attribute combinations detected"

**Error Message:**
```json
{
  "status": 400,
  "message": "Duplicate attribute combinations detected"
}
```

**Cause:**
```json
{
  "variants": [
    {
      "sku": "TSH-001",
      "attributes": [
        { "attributeId": "color", "valueId": "red" },
        { "attributeId": "size", "valueId": "medium" }
      ]
    },
    {
      "sku": "TSH-002",
      "attributes": [
        { "attributeId": "color", "valueId": "red" },
        { "attributeId": "size", "valueId": "medium" }  // ← Same!
      ]
    }
  ]
}
```

**Solution:**
Each variant must have unique attributes:
```json
{
  "variants": [
    {
      "sku": "TSH-001",
      "attributes": [
        { "attributeId": "color", "valueId": "red" },
        { "attributeId": "size", "valueId": "medium" }
      ]
    },
    {
      "sku": "TSH-002",
      "attributes": [
        { "attributeId": "color", "valueId": "red" },
        { "attributeId": "size", "valueId": "large" }  // ← Different
      ]
    }
  ]
}
```

---

### Error 4: "Variant is missing required attributes"

**Error Message:**
```json
{
  "status": 400,
  "message": "Variant at index 0 is missing required attributes: attr-color-123, attr-size-456"
}
```

**Cause:**
```
Category "Clothing" requires:
- Color (Required)
- Size (Required)

Variant only has:
- Color ✓
- Size ✗ Missing!
```

**Solution:**
Include ALL required attributes:
```json
{
  "attributes": [
    { "attributeId": "attr-color-123", "valueId": "val-red" },
    { "attributeId": "attr-size-456", "valueId": "val-medium" }
  ]
}
```

---

### Error 5: "Attribute value does not belong to the specified attribute"

**Error Message:**
```json
{
  "status": 400,
  "message": "Attribute value at variant index 0, attribute index 1 does not belong to the specified attribute"
}
```

**Cause:**
```
Attribute: "Color" (attr-123)
  Values: Red (val-001), Blue (val-002)

Trying to use:
  attributeId: "attr-123" (Color)
  valueId: "val-999" (belongs to "Size", not "Color")
```

**Solution:**
Use correct value for the attribute:
```json
{
  "attributeId": "attr-123",  // Color
  "valueId": "val-001"        // Red (belongs to Color)
}
```

---

### Error 6: "Category not found"

**Error Message:**
```json
{
  "status": 404,
  "message": "Category not found"
}
```

**Cause:**
```json
{
  "categoryId": "cat-999"  // ← Doesn't exist
}
```

**Solution:**
1. Get list of categories:
```bash
curl http://localhost:5000/api/categories
```

2. Use valid category ID:
```json
{
  "categoryId": "cat-123"  // ← Valid ID
}
```

---

### Error 7: "SKU already exists"

**Error Message:**
```json
{
  "status": 400,
  "message": "SKU already exists"
}
```

**Cause:**
Trying to create variant with SKU that's already in use.

**Solution:**
1. Check if SKU exists:
```bash
curl http://localhost:5000/api/variants/sku/TSH-RED-M
```

2. Use different SKU:
```json
{
  "sku": "TSH-RED-M-V2"  // ← Different
}
```

---

### Error 8: "Invalid SKU format"

**Error Message:**
```json
{
  "status": 400,
  "message": "Variant at index 0 has invalid SKU. Use alphanumeric characters and dashes, 3-50 characters."
}
```

**Cause:**
```json
{
  "sku": "T"  // ← Too short
}
// or
{
  "sku": "TSH_RED_M"  // ← Underscore not allowed
}
// or
{
  "sku": "TSH RED M"  // ← Space not allowed
}
```

**Solution:**
```json
{
  "sku": "TSH-RED-M"  // ← Valid: alphanumeric + dashes, 3-50 chars
}
```

---

## ✅ Best Practices

### 1. Category Organization

```
✅ Good Structure:
Clothing
  ├─ T-Shirts
  ├─ Jeans
  └─ Jackets

Electronics
  ├─ Phones
  ├─ Laptops
  └─ Tablets

❌ Bad Structure:
Products
  ├─ Everything mixed together
```

### 2. Attribute Planning

```
✅ Plan attributes before creating products:
1. List all product types
2. Identify common attributes
3. Determine required vs optional
4. Create attributes
5. Assign to categories
6. Then create products

❌ Don't:
1. Create products first
2. Realize you need attributes
3. Try to retrofit
```

### 3. SKU Conventions

```
✅ Consistent naming:
TSH-RED-S
TSH-RED-M
TSH-RED-L
TSH-BLU-S
TSH-BLU-M

❌ Inconsistent:
tsh-red-small
TSH_BLUE_M
T-Shirt-Large-Red
```

### 4. Stock Management

```
✅ Set appropriate thresholds:
High-volume: threshold = 50
Medium-volume: threshold = 20
Low-volume: threshold = 5

❌ Don't:
Set all to 10 regardless of sales
```

### 5. Image Management

```
✅ Organized images:
/products/tshirts/red-front.jpg
/products/tshirts/red-back.jpg
/products/tshirts/blue-front.jpg

❌ Messy:
/img1.jpg
/img2.jpg
/photo.jpg
```

---

## ⚡ Performance Tips

### 1. Pagination

```
✅ Always paginate:
GET /api/products?page=1&limit=20

❌ Don't fetch all:
GET /api/products  // Returns 10,000 products!
```

### 2. Selective Fields

```
✅ Request only needed fields:
GET /api/products?fields=id,name,price

❌ Don't fetch everything:
GET /api/products  // Returns all fields including relations
```

### 3. Caching

```
✅ Cache category attributes:
// Fetch once, cache for 1 hour
const attributes = await getCategoryAttributes(categoryId);

❌ Don't fetch repeatedly:
// Fetches on every product creation
```

### 4. Bulk Operations

```
✅ Bulk create:
POST /api/products/bulk
// Creates 100 products in one request

❌ Don't loop:
for (let i = 0; i < 100; i++) {
  await createProduct(products[i]);  // 100 requests!
}
```

---

## 🔄 Data Migration

### Migrating from Simple to Variant System

**Scenario:** You have 100 simple products, want to convert to variants.

**Old Structure:**
```
Product: "Red T-Shirt Small" - $19.99
Product: "Red T-Shirt Medium" - $19.99
Product: "Blue T-Shirt Small" - $19.99
```

**New Structure:**
```
Product: "T-Shirt"
  Variant: Red + Small - $19.99
  Variant: Red + Medium - $19.99
  Variant: Blue + Small - $19.99
```

**Migration Steps:**

1. **Create Attributes:**
```bash
# Create Color attribute
curl -X POST /api/attributes -d '{"name": "Color"}'
# Create values: Red, Blue

# Create Size attribute
curl -X POST /api/attributes -d '{"name": "Size"}'
# Create values: Small, Medium, Large
```

2. **Create Category:**
```bash
curl -X POST /api/categories -d '{"name": "T-Shirts"}'
```

3. **Assign Attributes:**
```bash
curl -X POST /api/attributes/assign-category -d '{
  "categoryId": "cat-123",
  "attributeId": "attr-color",
  "isRequired": true
}'
```

4. **Group Old Products:**
```javascript
const oldProducts = [
  { name: "Red T-Shirt Small", price: 19.99 },
  { name: "Red T-Shirt Medium", price: 19.99 },
  { name: "Blue T-Shirt Small", price: 19.99 }
];

// Group by base name
const grouped = {
  "T-Shirt": [
    { color: "Red", size: "Small", price: 19.99 },
    { color: "Red", size: "Medium", price: 19.99 },
    { color: "Blue", size: "Small", price: 19.99 }
  ]
};
```

5. **Create New Product with Variants:**
```bash
curl -X POST /api/products -d '{
  "name": "T-Shirt",
  "categoryId": "cat-123",
  "variants": [
    {
      "sku": "TSH-RED-S",
      "price": 19.99,
      "stock": 50,
      "attributes": [
        { "attributeId": "attr-color", "valueId": "val-red" },
        { "attributeId": "attr-size", "valueId": "val-small" }
      ]
    },
    {
      "sku": "TSH-RED-M",
      "price": 19.99,
      "stock": 50,
      "attributes": [
        { "attributeId": "attr-color", "valueId": "val-red" },
        { "attributeId": "attr-size", "valueId": "val-medium" }
      ]
    },
    {
      "sku": "TSH-BLU-S",
      "price": 19.99,
      "stock": 50,
      "attributes": [
        { "attributeId": "attr-color", "valueId": "val-blue" },
        { "attributeId": "attr-size", "valueId": "val-small" }
      ]
    }
  ]
}'
```

6. **Delete Old Products:**
```bash
# After verifying new product works
curl -X DELETE /api/products/old-prod-1
curl -X DELETE /api/products/old-prod-2
curl -X DELETE /api/products/old-prod-3
```

---

## 🆘 Getting Help

### Debug Checklist

When something doesn't work:

```
□ Check API response for error message
□ Verify authentication token is valid
□ Confirm all required fields are present
□ Check if IDs exist (category, attribute, value)
□ Verify SKUs are unique
□ Ensure attribute combinations are unique
□ Check if required attributes are included
□ Verify data types (string, number, boolean)
□ Check for typos in field names
□ Review API documentation
```

### Useful Commands

```bash
# Check if category exists
curl http://localhost:5000/api/categories/:id

# Check if attribute exists
curl http://localhost:5000/api/attributes/:id

# Check if SKU exists
curl http://localhost:5000/api/variants/sku/:sku

# Get product with all variants
curl http://localhost:5000/api/products/:id

# Check variant stock
curl http://localhost:5000/api/variants/:id
```

### Support Resources

- 📚 **Comprehensive Guide:** `PRODUCT_SYSTEM_COMPREHENSIVE_GUIDE.md`
- 🚀 **Quick Start:** `PRODUCT_CONFIGURATION_QUICK_START.md`
- 🎨 **Visual Guide:** `PRODUCT_SYSTEM_VISUAL_GUIDE.md`
- 🔧 **API Collections:** `collections/` folder
- 📖 **Database Schema:** `src/server/prisma/schema.prisma`

---

## 🎉 Summary

You now have answers to:
- ✅ Common questions about products, variants, attributes
- ✅ Error messages and how to fix them
- ✅ Best practices for organization
- ✅ Performance optimization tips
- ✅ Data migration strategies

**Still stuck?** Check the other documentation files or create a GitHub issue!
