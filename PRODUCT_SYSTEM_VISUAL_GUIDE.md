# 🎨 Product System Visual Guide

## 📊 Entity Relationship Diagrams

### High-Level Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    E-COMMERCE PRODUCT SYSTEM                     │
└─────────────────────────────────────────────────────────────────┘

                    ┌──────────────┐
                    │   CATEGORY   │
                    │              │
                    │ • Spices     │
                    │ • Clothing   │
                    │ • Electronics│
                    └──────┬───────┘
                           │
                           │ has many
                           │
            ┌──────────────┼──────────────┐
            │              │              │
            ↓              ↓              ↓
    ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
    │  ATTRIBUTE   │ │   PRODUCT    │ │  ATTRIBUTE   │
    │              │ │              │ │              │
    │ • Weight     │ │ • Turmeric   │ │ • Packaging  │
    │ • Color      │ │ • T-Shirt    │ │ • Size       │
    │ • Brand      │ │ • iPhone     │ │ • Material   │
    └──────┬───────┘ └──────┬───────┘ └──────┬───────┘
           │                │                │
           │ has many       │ has many       │ has many
           │                │                │
           ↓                ↓                ↓
    ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
    │ATTRIBUTE VAL │ │   VARIANT    │ │ATTRIBUTE VAL │
    │              │ │              │ │              │
    │ • 100g       │ │ • TUR-100G   │ │ • Pouch      │
    │ • 250g       │ │ • TUR-250G   │ │ • Jar        │
    │ • 500g       │ │ • TUR-500G   │ │ • Box        │
    └──────────────┘ └──────────────┘ └──────────────┘
```

---

## 🔄 Data Flow Diagrams

### Creating a Product - Complete Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    PRODUCT CREATION FLOW                         │
└─────────────────────────────────────────────────────────────────┘

ADMIN DASHBOARD
      │
      │ 1. Select "Create Product"
      ↓
┌─────────────────┐
│ Select Category │ ← Must exist first
└────────┬────────┘
         │
         │ 2. Category selected: "Spices"
         ↓
┌─────────────────────────────────────┐
│ System loads category attributes:   │
│ • Weight (Required)                 │
│ • Packaging (Required)              │
│ • Organic (Optional)                │
└────────┬────────────────────────────┘
         │
         │ 3. Fill product details
         ↓
┌─────────────────────────────────────┐
│ Product Information:                │
│ • Name: "Turmeric Powder"          │
│ • Description: "Premium..."         │
│ • Flags: isNew, isFeatured         │
└────────┬────────────────────────────┘
         │
         │ 4. Add variants
         ↓
┌─────────────────────────────────────┐
│ Variant 1:                          │
│ • SKU: TUR-100G-POUCH              │
│ • Price: $5.99                      │
│ • Stock: 100                        │
│ • Attributes:                       │
│   - Weight: 100g ✓ (required)      │
│   - Packaging: Pouch ✓ (required)  │
│   - Organic: Yes (optional)        │
└────────┬────────────────────────────┘
         │
         │ 5. Add more variants
         ↓
┌─────────────────────────────────────┐
│ Variant 2:                          │
│ • SKU: TUR-250G-JAR                │
│ • Price: $12.99                     │
│ • Stock: 75                         │
│ • Attributes:                       │
│   - Weight: 250g ✓                 │
│   - Packaging: Jar ✓               │
│   - Organic: Yes                   │
└────────┬────────────────────────────┘
         │
         │ 6. Submit form
         ↓
┌─────────────────────────────────────┐
│ BACKEND VALIDATION:                 │
│ ✓ Product name unique?              │
│ ✓ At least 1 variant?               │
│ ✓ All SKUs unique?                  │
│ ✓ All required attributes present?  │
│ ✓ No duplicate combinations?        │
│ ✓ Prices positive?                  │
│ ✓ Stock non-negative?               │
└────────┬────────────────────────────┘
         │
         │ 7. All validations pass
         ↓
┌─────────────────────────────────────┐
│ DATABASE TRANSACTION:               │
│ 1. Create Product record            │
│ 2. Create Variant 1 record          │
│ 3. Create Variant 1 attributes      │
│ 4. Create Variant 2 record          │
│ 5. Create Variant 2 attributes      │
│ 6. Commit transaction               │
└────────┬────────────────────────────┘
         │
         │ 8. Success!
         ↓
┌─────────────────────────────────────┐
│ PRODUCT CREATED                     │
│ • ID: prod-123                      │
│ • Slug: turmeric-powder             │
│ • 2 variants created                │
│ • Ready for sale                    │
└─────────────────────────────────────┘
```

---

### Customer Shopping Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    CUSTOMER SHOPPING FLOW                        │
└─────────────────────────────────────────────────────────────────┘

CUSTOMER VISITS WEBSITE
      │
      │ 1. Browse categories
      ↓
┌─────────────────────────────────────┐
│ Category Page: "Spices"             │
│                                     │
│ ┌─────────────┐ ┌─────────────┐   │
│ │  Turmeric   │ │ Chili Powder│   │
│ │  From $5.99 │ │  From $4.99 │   │
│ │  [NEW]      │ │ [BESTSELLER]│   │
│ └─────────────┘ └─────────────┘   │
└────────┬────────────────────────────┘
         │
         │ 2. Click "Turmeric"
         ↓
┌─────────────────────────────────────┐
│ Product Detail Page                 │
│                                     │
│ Turmeric Powder                     │
│ ⭐⭐⭐⭐⭐ (127 reviews)            │
│                                     │
│ Select Options:                     │
│ ┌─────────────────────────────┐   │
│ │ Weight:    [100g ▼]         │   │
│ │ Packaging: [Pouch ▼]        │   │
│ │ Organic:   [Yes ▼]          │   │
│ └─────────────────────────────┘   │
│                                     │
│ Price: $5.99                        │
│ Stock: 100 available                │
│ SKU: TUR-100G-POUCH                │
│                                     │
│ [Add to Cart]                       │
└────────┬────────────────────────────┘
         │
         │ 3. Customer changes selection
         ↓
┌─────────────────────────────────────┐
│ Weight:    [250g ▼]  ← Changed     │
│ Packaging: [Jar ▼]   ← Changed     │
│ Organic:   [Yes ▼]                 │
│                                     │
│ Price: $12.99        ← Updated     │
│ Stock: 75 available  ← Updated     │
│ SKU: TUR-250G-JAR   ← Updated     │
└────────┬────────────────────────────┘
         │
         │ 4. Add to cart
         ↓
┌─────────────────────────────────────┐
│ CART                                │
│                                     │
│ ┌─────────────────────────────────┐│
│ │ Turmeric Powder                 ││
│ │ 250g, Jar, Organic              ││
│ │ SKU: TUR-250G-JAR              ││
│ │ Qty: 1 × $12.99 = $12.99       ││
│ └─────────────────────────────────┘│
│                                     │
│ Subtotal: $12.99                    │
│ [Proceed to Checkout]               │
└────────┬────────────────────────────┘
         │
         │ 5. Checkout
         ↓
┌─────────────────────────────────────┐
│ ORDER CREATED                       │
│ • Order ID: ord-456                 │
│ • Variant: var-002                  │
│ • Quantity: 1                       │
│ • Price: $12.99                     │
└────────┬────────────────────────────┘
         │
         │ 6. Stock updated
         ↓
┌─────────────────────────────────────┐
│ INVENTORY UPDATE                    │
│ • Variant: TUR-250G-JAR            │
│ • Old Stock: 75                     │
│ • New Stock: 74                     │
│ • Stock Movement recorded           │
└─────────────────────────────────────┘
```

---

## 🗂️ Database Schema Visualization

### Complete Entity Relationship

```
┌─────────────────────────────────────────────────────────────────┐
│                    DATABASE SCHEMA                               │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────┐
│    Category      │
├──────────────────┤
│ id (PK)          │
│ name             │
│ slug (UNIQUE)    │
│ description      │
│ images (JSON)    │
└────────┬─────────┘
         │
         │ 1:N
         │
         ↓
┌──────────────────┐         ┌──────────────────┐
│ CategoryAttribute│←────────│   Attribute      │
├──────────────────┤   N:1   ├──────────────────┤
│ id (PK)          │         │ id (PK)          │
│ categoryId (FK)  │         │ name             │
│ attributeId (FK) │         │ slug (UNIQUE)    │
│ isRequired       │         └────────┬─────────┘
└──────────────────┘                  │
                                      │ 1:N
                                      │
                                      ↓
                             ┌──────────────────┐
                             │ AttributeValue   │
                             ├──────────────────┤
                             │ id (PK)          │
                             │ attributeId (FK) │
                             │ value            │
                             │ slug (UNIQUE)    │
                             └────────┬─────────┘
                                      │
                                      │
         ┌────────────────────────────┘
         │
         │
┌────────┴─────────┐
│    Product       │
├──────────────────┤
│ id (PK)          │
│ name             │
│ slug (UNIQUE)    │
│ description      │
│ categoryId (FK)  │──┐
│ isNew            │  │
│ isFeatured       │  │
│ isTrending       │  │
│ isBestSeller     │  │
│ averageRating    │  │
│ reviewCount      │  │
│ salesCount       │  │
└────────┬─────────┘  │
         │            │
         │ 1:N        │ N:1
         │            │
         ↓            │
┌──────────────────┐  │
│ ProductVariant   │  │
├──────────────────┤  │
│ id (PK)          │  │
│ productId (FK)   │──┘
│ sku (UNIQUE)     │
│ price            │
│ stock            │
│ lowStockThreshold│
│ barcode          │
│ warehouseLocation│
│ images (JSON)    │
└────────┬─────────┘
         │
         │ 1:N
         │
         ↓
┌──────────────────────────┐
│ ProductVariantAttribute  │
├──────────────────────────┤
│ id (PK)                  │
│ variantId (FK)           │──→ ProductVariant
│ attributeId (FK)         │──→ Attribute
│ valueId (FK)             │──→ AttributeValue
└──────────────────────────┘
   UNIQUE(variantId, attributeId, valueId)


ADDITIONAL RELATIONS:

ProductVariant ──1:N──→ OrderItem
ProductVariant ──1:N──→ CartItem
ProductVariant ──1:N──→ StockMovement
ProductVariant ──1:N──→ Restock
Product ──1:N──→ Review
Product ──1:N──→ Interaction
```

---

## 📈 Variant Selection Logic

### How Frontend Determines Which Variant to Show

```
┌─────────────────────────────────────────────────────────────────┐
│              VARIANT SELECTION ALGORITHM                         │
└─────────────────────────────────────────────────────────────────┘

INITIAL STATE:
Product: "Turmeric Powder"
Available Variants:
  1. 100g + Pouch + Organic
  2. 100g + Jar + Organic
  3. 250g + Pouch + Organic
  4. 250g + Jar + Organic
  5. 500g + Box + Non-Organic

┌─────────────────────────────────────┐
│ STEP 1: Customer selects Weight     │
│ Selection: 100g                     │
└────────┬────────────────────────────┘
         │
         │ Filter variants
         ↓
┌─────────────────────────────────────┐
│ Matching Variants:                  │
│ ✓ 1. 100g + Pouch + Organic        │
│ ✓ 2. 100g + Jar + Organic          │
│ ✗ 3. 250g + Pouch + Organic        │
│ ✗ 4. 250g + Jar + Organic          │
│ ✗ 5. 500g + Box + Non-Organic      │
└────────┬────────────────────────────┘
         │
         │ Update available options
         ↓
┌─────────────────────────────────────┐
│ Available Packaging:                │
│ • Pouch (from variant 1)            │
│ • Jar (from variant 2)              │
│                                     │
│ Available Organic:                  │
│ • Yes (from variants 1, 2)          │
└────────┬────────────────────────────┘
         │
         │ STEP 2: Customer selects Packaging
         │ Selection: Jar
         ↓
┌─────────────────────────────────────┐
│ Matching Variants:                  │
│ ✗ 1. 100g + Pouch + Organic        │
│ ✓ 2. 100g + Jar + Organic          │ ← MATCH!
└────────┬────────────────────────────┘
         │
         │ Only 1 variant matches
         ↓
┌─────────────────────────────────────┐
│ SELECTED VARIANT:                   │
│ • ID: var-002                       │
│ • SKU: TUR-100G-JAR                │
│ • Price: $7.99                      │
│ • Stock: 50                         │
│ • Images: [jar-image.jpg]           │
│                                     │
│ Auto-select remaining:              │
│ • Organic: Yes (only option)        │
└─────────────────────────────────────┘
```

---

## 🎯 Attribute Inheritance

### How Attributes Flow Through the System

```
┌─────────────────────────────────────────────────────────────────┐
│                  ATTRIBUTE INHERITANCE                           │
└─────────────────────────────────────────────────────────────────┘

LEVEL 1: GLOBAL ATTRIBUTES
┌─────────────────────────────────────┐
│ All Attributes in System:           │
│ • Weight                            │
│ • Packaging                         │
│ • Color                             │
│ • Size                              │
│ • Material                          │
│ • Brand                             │
│ • Organic                           │
│ • Origin                            │
└────────┬────────────────────────────┘
         │
         │ Assigned to categories
         ↓
LEVEL 2: CATEGORY ATTRIBUTES
┌─────────────────────────────────────┐
│ Category: "Spices"                  │
│ Allowed Attributes:                 │
│ • Weight (Required)                 │
│ • Packaging (Required)              │
│ • Organic (Optional)                │
│ • Origin (Optional)                 │
│                                     │
│ NOT allowed:                        │
│ ✗ Color (for clothing)              │
│ ✗ Size (for clothing)               │
│ ✗ Material (for clothing)           │
└────────┬────────────────────────────┘
         │
         │ Products inherit
         ↓
LEVEL 3: PRODUCT ATTRIBUTES
┌─────────────────────────────────────┐
│ Product: "Turmeric Powder"          │
│ Category: "Spices"                  │
│                                     │
│ Must use these attributes:          │
│ • Weight (Required from category)   │
│ • Packaging (Required from category)│
│                                     │
│ Can use these attributes:           │
│ • Organic (Optional from category)  │
│ • Origin (Optional from category)   │
└────────┬────────────────────────────┘
         │
         │ Variants implement
         ↓
LEVEL 4: VARIANT ATTRIBUTES
┌─────────────────────────────────────┐
│ Variant 1: TUR-100G-POUCH          │
│ • Weight: 100g ✓                   │
│ • Packaging: Pouch ✓               │
│ • Organic: Yes                      │
│                                     │
│ Variant 2: TUR-250G-JAR            │
│ • Weight: 250g ✓                   │
│ • Packaging: Jar ✓                 │
│ • Organic: Yes                      │
│ • Origin: India                     │
└─────────────────────────────────────┘

VALIDATION RULES:
✓ Variant MUST have all required attributes
✓ Variant CAN have optional attributes
✗ Variant CANNOT have attributes not in category
✗ Variant CANNOT skip required attributes
```

---

## 🔍 Search & Filter Flow

### How Customers Find Products

```
┌─────────────────────────────────────────────────────────────────┐
│                    SEARCH & FILTER SYSTEM                        │
└─────────────────────────────────────────────────────────────────┘

CUSTOMER SEARCH: "turmeric"
         │
         ↓
┌─────────────────────────────────────┐
│ SEARCH ALGORITHM:                   │
│ 1. Search in Product.name           │
│ 2. Search in Product.description    │
│ 3. Search in Category.name          │
│ 4. Search in Attribute values       │
└────────┬────────────────────────────┘
         │
         │ Results found
         ↓
┌─────────────────────────────────────┐
│ MATCHING PRODUCTS:                  │
│ • Turmeric Powder (name match)      │
│ • Golden Milk Mix (description)     │
│ • Curry Powder (contains turmeric)  │
└────────┬────────────────────────────┘
         │
         │ Customer applies filters
         ↓
┌─────────────────────────────────────┐
│ FILTERS APPLIED:                    │
│ ☑ Category: Spices                  │
│ ☑ Weight: 100g, 250g                │
│ ☑ Organic: Yes                      │
│ ☑ Price: $5 - $15                   │
└────────┬────────────────────────────┘
         │
         │ Filter logic
         ↓
┌─────────────────────────────────────┐
│ FILTER ALGORITHM:                   │
│                                     │
│ FOR EACH product:                   │
│   IF product.category = "Spices"    │
│   AND product has variants WHERE:   │
│     - weight IN [100g, 250g]        │
│     - organic = Yes                 │
│     - price BETWEEN 5 AND 15        │
│   THEN include in results           │
└────────┬────────────────────────────┘
         │
         │ Final results
         ↓
┌─────────────────────────────────────┐
│ FILTERED RESULTS:                   │
│                                     │
│ 1. Turmeric Powder                  │
│    • 100g Pouch - $5.99             │
│    • 250g Jar - $12.99              │
│                                     │
│ 2. Golden Milk Mix                  │
│    • 100g Pouch - $8.99             │
│                                     │
│ (Curry Powder excluded - no organic)│
└─────────────────────────────────────┘
```

---

## 📦 Inventory Management Flow

### Stock Tracking System

```
┌─────────────────────────────────────────────────────────────────┐
│                  INVENTORY MANAGEMENT                            │
└─────────────────────────────────────────────────────────────────┘

INITIAL STATE:
Variant: TUR-100G-POUCH
Stock: 100 units
Low Stock Threshold: 20 units

┌─────────────────────────────────────┐
│ EVENT 1: Customer Order             │
│ Quantity: 5 units                   │
└────────┬────────────────────────────┘
         │
         ↓
┌─────────────────────────────────────┐
│ STOCK UPDATE:                       │
│ • Old Stock: 100                    │
│ • Ordered: -5                       │
│ • New Stock: 95                     │
│                                     │
│ STOCK MOVEMENT CREATED:             │
│ • Variant: TUR-100G-POUCH          │
│ • Quantity: -5                      │
│ • Reason: "order"                   │
│ • Order ID: ord-123                 │
│ • Timestamp: 2024-01-15 10:30       │
└────────┬────────────────────────────┘
         │
         │ Check threshold
         ↓
┌─────────────────────────────────────┐
│ THRESHOLD CHECK:                    │
│ Current: 95 > Threshold: 20         │
│ Status: ✓ OK                        │
└─────────────────────────────────────┘

... more orders ...

┌─────────────────────────────────────┐
│ EVENT 2: Multiple Orders            │
│ Total sold: 80 units                │
└────────┬────────────────────────────┘
         │
         ↓
┌─────────────────────────────────────┐
│ STOCK UPDATE:                       │
│ • Old Stock: 95                     │
│ • Sold: -80                         │
│ • New Stock: 15                     │
└────────┬────────────────────────────┘
         │
         │ Check threshold
         ↓
┌─────────────────────────────────────┐
│ THRESHOLD CHECK:                    │
│ Current: 15 < Threshold: 20         │
│ Status: ⚠️ LOW STOCK ALERT          │
│                                     │
│ NOTIFICATION SENT:                  │
│ • To: Admin Dashboard               │
│ • Message: "TUR-100G-POUCH low"    │
│ • Action: "Reorder needed"          │
└────────┬────────────────────────────┘
         │
         │ Admin restocks
         ↓
┌─────────────────────────────────────┐
│ EVENT 3: Restock                    │
│ Quantity: 100 units                 │
│ Notes: "Supplier shipment"          │
└────────┬────────────────────────────┘
         │
         ↓
┌─────────────────────────────────────┐
│ RESTOCK PROCESS:                    │
│                                     │
│ 1. CREATE RESTOCK RECORD:           │
│    • Variant: TUR-100G-POUCH       │
│    • Quantity: +100                 │
│    • Notes: "Supplier shipment"     │
│    • User: admin-123                │
│    • Timestamp: 2024-01-16 09:00    │
│                                     │
│ 2. UPDATE STOCK:                    │
│    • Old Stock: 15                  │
│    • Added: +100                    │
│    • New Stock: 115                 │
│                                     │
│ 3. CREATE STOCK MOVEMENT:           │
│    • Variant: TUR-100G-POUCH       │
│    • Quantity: +100                 │
│    • Reason: "restock"              │
│    • User: admin-123                │
│                                     │
│ 4. CHECK THRESHOLD:                 │
│    • Current: 115 > Threshold: 20   │
│    • Status: ✓ OK                   │
│    • Alert cleared                  │
└─────────────────────────────────────┘

STOCK HISTORY:
┌─────────────────────────────────────┐
│ Date       │ Event    │ Qty │ Stock │
├────────────┼──────────┼─────┼───────┤
│ 2024-01-15 │ Order    │  -5 │   95  │
│ 2024-01-15 │ Order    │ -10 │   85  │
│ 2024-01-15 │ Order    │ -15 │   70  │
│ 2024-01-15 │ Order    │ -20 │   50  │
│ 2024-01-15 │ Order    │ -35 │   15  │← Low!
│ 2024-01-16 │ Restock  │+100 │  115  │← Fixed
└─────────────────────────────────────┘
```

---

## 🎨 UI Component Hierarchy

### Dashboard Product Management

```
┌─────────────────────────────────────────────────────────────────┐
│                    DASHBOARD LAYOUT                              │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ SIDEBAR                    │ MAIN CONTENT                        │
├────────────────────────────┼─────────────────────────────────────┤
│ Dashboard                  │ ┌─────────────────────────────────┐ │
│ > Products                 │ │ Products Page                   │ │
│   - List Products          │ │                                 │ │
│   - Add Product            │ │ [+ New Product]  [Import CSV]   │ │
│ > Categories               │ │                                 │ │
│ > Attributes               │ │ ┌─────────────────────────────┐ │ │
│ > Variants                 │ │ │ Product List Table          │ │ │
│ > Orders                   │ │ ├─────┬──────┬───────┬────────┤ │ │
│ > Inventory                │ │ │Name │Cat   │Vars   │Actions │ │ │
│ > Analytics                │ │ ├─────┼──────┼───────┼────────┤ │ │
│                            │ │ │Turm │Spices│  3    │[E][D]  │ │ │
│                            │ │ │Chili│Spices│  2    │[E][D]  │ │ │
│                            │ │ └─────┴──────┴───────┴────────┘ │ │
│                            │ └─────────────────────────────────┘ │
└────────────────────────────┴─────────────────────────────────────┘

CLICK "New Product" →

┌─────────────────────────────────────────────────────────────────┐
│ Create Product Modal                                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│ Product Information                                              │
│ ┌──────────────────────────────────────────────────────────────┐│
│ │ Name: [_________________________________]                     ││
│ │ Category: [Spices ▼]                                         ││
│ │ Description: [_____________________________________]          ││
│ │              [_____________________________________]          ││
│ │                                                               ││
│ │ Flags: ☑ New  ☑ Featured  ☐ Trending  ☐ Best Seller        ││
│ └──────────────────────────────────────────────────────────────┘│
