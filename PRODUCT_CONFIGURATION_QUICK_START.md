# 🚀 Product Configuration Quick Start Guide

## ⚡ 5-Minute Setup Guide

### Prerequisites
- Admin account with authentication token
- API endpoint: `http://localhost:5000/api` (or your production URL)

---

## 📋 Quick Setup Checklist

```
□ Step 1: Create Category (2 min)
□ Step 2: Create Attributes & Values (5 min)
□ Step 3: Link Attributes to Category (2 min)
□ Step 4: Create Product with Variants (5 min)
□ Step 5: Test & Verify (1 min)
```

---

## 🎯 Step-by-Step Commands

### Step 1: Create Category

**Using cURL:**
```bash
curl -X POST http://localhost:5000/api/categories \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Spices",
    "description": "Premium quality spices"
  }'
```

**Using Postman:**
1. Method: `POST`
2. URL: `http://localhost:5000/api/categories`
3. Headers: `Authorization: Bearer YOUR_TOKEN`
4. Body (JSON):
```json
{
  "name": "Spices",
  "description": "Premium quality spices"
}
```

**Save the response `id` → This is your `categoryId`**

---

### Step 2: Create Attributes & Values

#### 2A: Create "Weight" Attribute

```bash
curl -X POST http://localhost:5000/api/attributes \
  -H "Content-Type: application/json" \
  -d '{"name": "Weight"}'
```

**Save the response `id` → This is your `weightAttributeId`**

#### 2B: Create Weight Values

```bash
# 100g
curl -X POST http://localhost:5000/api/attributes/value \
  -H "Content-Type: application/json" \
  -d '{
    "attributeId": "YOUR_WEIGHT_ATTRIBUTE_ID",
    "value": "100g"
  }'

# 250g
curl -X POST http://localhost:5000/api/attributes/value \
  -H "Content-Type: application/json" \
  -d '{
    "attributeId": "YOUR_WEIGHT_ATTRIBUTE_ID",
    "value": "250g"
  }'

# 500g
curl -X POST http://localhost:5000/api/attributes/value \
  -H "Content-Type: application/json" \
  -d '{
    "attributeId": "YOUR_WEIGHT_ATTRIBUTE_ID",
    "value": "500g"
  }'
```

**Save each value's `id` → These are your `valueId`s**

#### 2C: Create "Packaging" Attribute

```bash
curl -X POST http://localhost:5000/api/attributes \
  -H "Content-Type: application/json" \
  -d '{"name": "Packaging"}'
```

#### 2D: Create Packaging Values

```bash
# Pouch
curl -X POST http://localhost:5000/api/attributes/value \
  -H "Content-Type: application/json" \
  -d '{
    "attributeId": "YOUR_PACKAGING_ATTRIBUTE_ID",
    "value": "Pouch"
  }'

# Jar
curl -X POST http://localhost:5000/api/attributes/value \
  -H "Content-Type: application/json" \
  -d '{
    "attributeId": "YOUR_PACKAGING_ATTRIBUTE_ID",
    "value": "Jar"
  }'
```

---

### Step 3: Link Attributes to Category

```bash
# Link Weight (Required)
curl -X POST http://localhost:5000/api/attributes/assign-category \
  -H "Content-Type: application/json" \
  -d '{
    "categoryId": "YOUR_CATEGORY_ID",
    "attributeId": "YOUR_WEIGHT_ATTRIBUTE_ID",
    "isRequired": true
  }'

# Link Packaging (Required)
curl -X POST http://localhost:5000/api/attributes/assign-category \
  -H "Content-Type: application/json" \
  -d '{
    "categoryId": "YOUR_CATEGORY_ID",
    "attributeId": "YOUR_PACKAGING_ATTRIBUTE_ID",
    "isRequired": true
  }'
```

---

### Step 4: Create Product with Variants

```bash
curl -X POST http://localhost:5000/api/products \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Organic Turmeric Powder",
    "description": "Premium quality organic turmeric",
    "categoryId": "YOUR_CATEGORY_ID",
    "isNew": true,
    "isFeatured": true,
    "variants": [
      {
        "sku": "TUR-100G-POUCH",
        "price": 5.99,
        "stock": 100,
        "lowStockThreshold": 20,
        "images": [],
        "attributes": [
          {
            "attributeId": "YOUR_WEIGHT_ATTRIBUTE_ID",
            "valueId": "YOUR_100G_VALUE_ID"
          },
          {
            "attributeId": "YOUR_PACKAGING_ATTRIBUTE_ID",
            "valueId": "YOUR_POUCH_VALUE_ID"
          }
        ]
      },
      {
        "sku": "TUR-250G-JAR",
        "price": 12.99,
        "stock": 75,
        "lowStockThreshold": 15,
        "images": [],
        "attributes": [
          {
            "attributeId": "YOUR_WEIGHT_ATTRIBUTE_ID",
            "valueId": "YOUR_250G_VALUE_ID"
          },
          {
            "attributeId": "YOUR_PACKAGING_ATTRIBUTE_ID",
            "valueId": "YOUR_JAR_VALUE_ID"
          }
        ]
      }
    ]
  }'
```

---

### Step 5: Verify

```bash
# Get all products
curl http://localhost:5000/api/products

# Get specific product
curl http://localhost:5000/api/products/YOUR_PRODUCT_ID

# Get all variants
curl http://localhost:5000/api/variants
```

---

## 🎨 Visual Workflow

```
┌─────────────────────────────────────────────────────────────┐
│                    SETUP WORKFLOW                            │
└─────────────────────────────────────────────────────────────┘

1. CREATE CATEGORY
   ┌──────────────┐
   │   Spices     │
   └──────────────┘
         │
         ↓
2. CREATE ATTRIBUTES
   ┌──────────────┐    ┌──────────────┐
   │    Weight    │    │  Packaging   │
   └──────────────┘    └──────────────┘
         │                    │
         ↓                    ↓
3. CREATE VALUES
   ┌──────────────┐    ┌──────────────┐
   │ 100g, 250g   │    │ Pouch, Jar   │
   │ 500g, 1kg    │    │ Box          │
   └──────────────┘    └──────────────┘
         │                    │
         └────────┬───────────┘
                  ↓
4. LINK TO CATEGORY
   ┌──────────────────────────────┐
   │ Spices Category              │
   │  ├─ Weight (Required)        │
   │  └─ Packaging (Required)     │
   └──────────────────────────────┘
                  │
                  ↓
5. CREATE PRODUCT
   ┌──────────────────────────────┐
   │ Turmeric Powder              │
   │  ├─ Variant 1: 100g + Pouch  │
   │  ├─ Variant 2: 250g + Jar    │
   │  └─ Variant 3: 500g + Box    │
   └──────────────────────────────┘
```

---

## 📊 Data Flow Example

### Input Data Structure

```json
{
  "category": {
    "name": "Spices",
    "attributes": [
      {
        "name": "Weight",
        "values": ["100g", "250g", "500g"],
        "required": true
      },
      {
        "name": "Packaging",
        "values": ["Pouch", "Jar", "Box"],
        "required": true
      }
    ]
  },
  "product": {
    "name": "Turmeric Powder",
    "variants": [
      {
        "sku": "TUR-100G-POUCH",
        "price": 5.99,
        "stock": 100,
        "attributes": {
          "Weight": "100g",
          "Packaging": "Pouch"
        }
      }
    ]
  }
}
```

### Database Storage

```
┌─────────────────────────────────────────────────────────────┐
│                    DATABASE TABLES                           │
└─────────────────────────────────────────────────────────────┘

Category Table:
┌────────┬─────────┬─────────┐
│   id   │  name   │  slug   │
├────────┼─────────┼─────────┤
│ cat-1  │ Spices  │ spices  │
└────────┴─────────┴─────────┘

Attribute Table:
┌────────┬───────────┬───────────┐
│   id   │   name    │   slug    │
├────────┼───────────┼───────────┤
│ attr-1 │  Weight   │  weight   │
│ attr-2 │ Packaging │ packaging │
└────────┴───────────┴───────────┘

AttributeValue Table:
┌────────┬─────────────┬────────┬────────┐
│   id   │ attributeId │ value  │  slug  │
├────────┼─────────────┼────────┼────────┤
│ val-1  │   attr-1    │  100g  │  100g  │
│ val-2  │   attr-1    │  250g  │  250g  │
│ val-3  │   attr-2    │ Pouch  │ pouch  │
│ val-4  │   attr-2    │  Jar   │  jar   │
└────────┴─────────────┴────────┴────────┘

CategoryAttribute Table:
┌────────┬────────────┬─────────────┬────────────┐
│   id   │ categoryId │ attributeId │ isRequired │
├────────┼────────────┼─────────────┼────────────┤
│  ca-1  │   cat-1    │   attr-1    │    true    │
│  ca-2  │   cat-1    │   attr-2    │    true    │
└────────┴────────────┴─────────────┴────────────┘

Product Table:
┌────────┬──────────────────┬────────────┐
│   id   │      name        │ categoryId │
├────────┼──────────────────┼────────────┤
│ prod-1 │ Turmeric Powder  │   cat-1    │
└────────┴──────────────────┴────────────┘

ProductVariant Table:
┌────────┬───────────┬─────────────────┬───────┬───────┐
│   id   │ productId │      sku        │ price │ stock │
├────────┼───────────┼─────────────────┼───────┼───────┤
│ var-1  │  prod-1   │ TUR-100G-POUCH  │ 5.99  │  100  │
│ var-2  │  prod-1   │ TUR-250G-JAR    │ 12.99 │   75  │
└────────┴───────────┴─────────────────┴───────┴───────┘

ProductVariantAttribute Table:
┌────────┬───────────┬─────────────┬─────────┐
│   id   │ variantId │ attributeId │ valueId │
├────────┼───────────┼─────────────┼─────────┤
│ pva-1  │   var-1   │   attr-1    │  val-1  │
│ pva-2  │   var-1   │   attr-2    │  val-3  │
│ pva-3  │   var-2   │   attr-1    │  val-2  │
│ pva-4  │   var-2   │   attr-2    │  val-4  │
└────────┴───────────┴─────────────┴─────────┘
```

---

## 🔍 Common Queries

### Get All Products in a Category

```bash
curl "http://localhost:5000/api/products?categoryId=YOUR_CATEGORY_ID"
```

### Get Product with All Variants

```bash
curl "http://localhost:5000/api/products/YOUR_PRODUCT_ID"
```

**Response:**
```json
{
  "id": "prod-1",
  "name": "Turmeric Powder",
  "category": {
    "id": "cat-1",
    "name": "Spices"
  },
  "variants": [
    {
      "id": "var-1",
      "sku": "TUR-100G-POUCH",
      "price": 5.99,
      "stock": 100,
      "attributes": [
        {
          "attribute": { "name": "Weight" },
          "value": { "value": "100g" }
        },
        {
          "attribute": { "name": "Packaging" },
          "value": { "value": "Pouch" }
        }
      ]
    }
  ]
}
```

### Get Variant by SKU

```bash
curl "http://localhost:5000/api/variants/sku/TUR-100G-POUCH"
```

### Filter Products

```bash
# New products only
curl "http://localhost:5000/api/products?isNew=true"

# Featured products
curl "http://localhost:5000/api/products?isFeatured=true"

# Best sellers
curl "http://localhost:5000/api/products?isBestSeller=true"

# Pagination
curl "http://localhost:5000/api/products?page=1&limit=10"

# Sorting
curl "http://localhost:5000/api/products?sort=name"
curl "http://localhost:5000/api/products?sort=-createdAt"  # Descending
```

---

## 🎯 Real-World Scenario: Complete Setup

### Scenario: Setting up a Spice Store with 3 Products

```bash
#!/bin/bash

# Configuration
API_URL="http://localhost:5000/api"
TOKEN="your_admin_token_here"

# Step 1: Create Category
CATEGORY_RESPONSE=$(curl -s -X POST "$API_URL/categories" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Spices", "description": "Premium spices"}')

CATEGORY_ID=$(echo $CATEGORY_RESPONSE | jq -r '.category.id')
echo "Created Category: $CATEGORY_ID"

# Step 2: Create Weight Attribute
WEIGHT_ATTR=$(curl -s -X POST "$API_URL/attributes" \
  -H "Content-Type: application/json" \
  -d '{"name": "Weight"}')

WEIGHT_ATTR_ID=$(echo $WEIGHT_ATTR | jq -r '.id')
echo "Created Weight Attribute: $WEIGHT_ATTR_ID"

# Step 3: Create Weight Values
for weight in "100g" "250g" "500g" "1kg"; do
  VALUE_RESPONSE=$(curl -s -X POST "$API_URL/attributes/value" \
    -H "Content-Type: application/json" \
    -d "{\"attributeId\": \"$WEIGHT_ATTR_ID\", \"value\": \"$weight\"}")
  
  VALUE_ID=$(echo $VALUE_RESPONSE | jq -r '.id')
  echo "Created Value: $weight ($VALUE_ID)"
  
  # Store in associative array
  declare "WEIGHT_${weight/g/G}_ID=$VALUE_ID"
done

# Step 4: Create Packaging Attribute
PACKAGING_ATTR=$(curl -s -X POST "$API_URL/attributes" \
  -H "Content-Type: application/json" \
  -d '{"name": "Packaging"}')

PACKAGING_ATTR_ID=$(echo $PACKAGING_ATTR | jq -r '.id')
echo "Created Packaging Attribute: $PACKAGING_ATTR_ID"

# Step 5: Create Packaging Values
for packaging in "Pouch" "Jar" "Box"; do
  VALUE_RESPONSE=$(curl -s -X POST "$API_URL/attributes/value" \
    -H "Content-Type: application/json" \
    -d "{\"attributeId\": \"$PACKAGING_ATTR_ID\", \"value\": \"$packaging\"}")
  
  VALUE_ID=$(echo $VALUE_RESPONSE | jq -r '.id')
  echo "Created Value: $packaging ($VALUE_ID)"
  
  declare "PACKAGING_${packaging^^}_ID=$VALUE_ID"
done

# Step 6: Link Attributes to Category
curl -s -X POST "$API_URL/attributes/assign-category" \
  -H "Content-Type: application/json" \
  -d "{
    \"categoryId\": \"$CATEGORY_ID\",
    \"attributeId\": \"$WEIGHT_ATTR_ID\",
    \"isRequired\": true
  }"

curl -s -X POST "$API_URL/attributes/assign-category" \
  -H "Content-Type: application/json" \
  -d "{
    \"categoryId\": \"$CATEGORY_ID\",
    \"attributeId\": \"$PACKAGING_ATTR_ID\",
    \"isRequired\": true
  }"

echo "Linked attributes to category"

# Step 7: Create Products
# Product 1: Turmeric
curl -s -X POST "$API_URL/products" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"Organic Turmeric Powder\",
    \"description\": \"Premium quality organic turmeric\",
    \"categoryId\": \"$CATEGORY_ID\",
    \"isNew\": true,
    \"isFeatured\": true,
    \"variants\": [
      {
        \"sku\": \"TUR-100G-POUCH\",
        \"price\": 5.99,
        \"stock\": 100,
        \"attributes\": [
          {\"attributeId\": \"$WEIGHT_ATTR_ID\", \"valueId\": \"$WEIGHT_100G_ID\"},
          {\"attributeId\": \"$PACKAGING_ATTR_ID\", \"valueId\": \"$PACKAGING_POUCH_ID\"}
        ]
      },
      {
        \"sku\": \"TUR-250G-JAR\",
        \"price\": 12.99,
        \"stock\": 75,
        \"attributes\": [
          {\"attributeId\": \"$WEIGHT_ATTR_ID\", \"valueId\": \"$WEIGHT_250G_ID\"},
          {\"attributeId\": \"$PACKAGING_ATTR_ID\", \"valueId\": \"$PACKAGING_JAR_ID\"}
        ]
      }
    ]
  }"

echo "Created Turmeric product"

# Product 2: Chili Powder
curl -s -X POST "$API_URL/products" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"Red Chili Powder\",
    \"description\": \"Hot and spicy red chili powder\",
    \"categoryId\": \"$CATEGORY_ID\",
    \"isBestSeller\": true,
    \"variants\": [
      {
        \"sku\": \"CHI-100G-POUCH\",
        \"price\": 4.99,
        \"stock\": 150,
        \"attributes\": [
          {\"attributeId\": \"$WEIGHT_ATTR_ID\", \"valueId\": \"$WEIGHT_100G_ID\"},
          {\"attributeId\": \"$PACKAGING_ATTR_ID\", \"valueId\": \"$PACKAGING_POUCH_ID\"}
        ]
      }
    ]
  }"

echo "Created Chili Powder product"

# Product 3: Cumin Seeds
curl -s -X POST "$API_URL/products" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"Cumin Seeds\",
    \"description\": \"Aromatic cumin seeds\",
    \"categoryId\": \"$CATEGORY_ID\",
    \"isTrending\": true,
    \"variants\": [
      {
        \"sku\": \"CUM-100G-POUCH\",
        \"price\": 3.99,
        \"stock\": 200,
        \"attributes\": [
          {\"attributeId\": \"$WEIGHT_ATTR_ID\", \"valueId\": \"$WEIGHT_100G_ID\"},
          {\"attributeId\": \"$PACKAGING_ATTR_ID\", \"valueId\": \"$PACKAGING_POUCH_ID\"}
        ]
      },
      {
        \"sku\": \"CUM-500G-BOX\",
        \"price\": 16.99,
        \"stock\": 50,
        \"attributes\": [
          {\"attributeId\": \"$WEIGHT_ATTR_ID\", \"valueId\": \"$WEIGHT_500G_ID\"},
          {\"attributeId\": \"$PACKAGING_ATTR_ID\", \"valueId\": \"$PACKAGING_BOX_ID\"}
        ]
      }
    ]
  }"

echo "Created Cumin Seeds product"
echo "Setup complete!"
```

---

## 📱 Frontend Usage

### How Customers See It

```
1. Customer visits: /shop/spices

2. Sees products:
   ┌─────────────────────────────┐
   │ Organic Turmeric Powder     │
   │ ⭐⭐⭐⭐⭐ (127 reviews)      │
   │ From $5.99                  │
   │ [NEW] [FEATURED]            │
   └─────────────────────────────┘

3. Clicks product → Product detail page

4. Selects options:
   Weight: [100g ▼] [250g] [500g]
   Packaging: [Pouch ▼] [Jar] [Box]
   
   → Shows: $5.99, 100 in stock

5. Adds to cart → Variant "TUR-100G-POUCH" added

6. Checkout → Order created with specific variant
```

### Frontend Components

**Product Listing:**
```typescript
// Fetches products
GET /api/products?categoryId=xxx

// Displays:
- Product name
- Starting price (lowest variant price)
- Product flags (NEW, FEATURED, etc.)
- Average rating
```

**Product Detail:**
```typescript
// Fetches single product with variants
GET /api/products/:id

// Displays:
- Product info
- Attribute selectors (dropdowns)
- Selected variant price & stock
- Add to cart button
```

**Cart:**
```typescript
// Adds specific variant
POST /api/cart
{
  "variantId": "var-123",
  "quantity": 1
}

// Cart stores:
- Variant ID (not product ID)
- Quantity
- Price snapshot
```

---

## ✅ Validation Checklist

Before going live, verify:

```
□ All categories have at least one attribute
□ All attributes have at least one value
□ All products have at least one variant
□ All variants have unique SKUs
□ All variants have unique attribute combinations
□ All required attributes are assigned to variants
□ All prices are positive
□ All stock quantities are non-negative
□ All images are uploaded and accessible
□ Test ordering a variant
□ Test stock reduction after order
□ Test low stock alerts
```

---

## 🎓 Best Practices

### SKU Naming Convention

```
Format: [PRODUCT]-[ATTR1]-[ATTR2]-[ATTR3]

Examples:
✅ TUR-100G-POUCH
✅ CHI-250G-JAR-ORGANIC
✅ CUM-500G-BOX

❌ turmeric_100g (not descriptive)
❌ 12345 (not human-readable)
❌ TUR-100G-POUCH-ORGANIC-INDIA-PREMIUM (too long)
```

### Attribute Organization

```
Required Attributes:
- Core product differentiators
- Example: Weight, Size, Color

Optional Attributes:
- Additional features
- Example: Organic, Origin, Brand
```

### Stock Management

```
Set lowStockThreshold based on:
- Average daily sales
- Reorder lead time
- Safety buffer

Example:
- Sells 10 units/day
- Reorder takes 5 days
- Set threshold: 50-60 units
```

---

## 🆘 Need Help?

### Common Issues

**Issue: Can't create product**
- ✅ Check if category exists
- ✅ Verify all required attributes are included
- ✅ Ensure SKUs are unique
- ✅ Check authentication token

**Issue: Variant not showing**
- ✅ Verify stock > 0
- ✅ Check if all required attributes are set
- ✅ Ensure attribute combination is unique

**Issue: Can't update variant**
- ✅ Check if variant exists
- ✅ Verify new SKU is unique (if changing)
- ✅ Ensure new attribute combination is unique

### Support Resources

- 📚 Full Guide: `PRODUCT_SYSTEM_COMPREHENSIVE_GUIDE.md`
- 🔧 API Collections: `collections/` folder
- 📖 Database Schema: `src/server/prisma/schema.prisma`
- 🐛 Issue Tracker: GitHub Issues

---

## 🎉 You're Ready!

You now have everything you need to:
- ✅ Set up categories
- ✅ Create attributes
- ✅ Build products with variants
- ✅ Manage inventory
- ✅ Handle customer orders

**Next Steps:**
1. Run the setup script above
2. Test in your dashboard
3. Add more products
4. Launch your store! 🚀
