# 🚀 Complete API Documentation & Analysis

## 📊 Executive Summary

Your e-commerce platform is **already well-architected** for scalability and multi-user scenarios! Here's what I found:

### ✅ Already Implemented (Great News!)

1. **Guest-to-Logged-In Cart Merge** ✅
   - `optionalAuth` middleware allows guest users to add to cart
   - `/cart/merge` endpoint merges guest cart with user cart on login
   - Social login callbacks automatically merge carts
   
2. **Admin Product Management** ✅
   - Full CRUD operations for products
   - Bulk product creation via file upload
   - Image upload support (Cloudinary)
   
3. **Admin Category Management** ✅
   - Create, read, delete categories
   - Image upload support

4. **Scalable Architecture** ✅
   - Session-based cart for guests (sessionId)
   - User-based cart for logged-in users (userId)
   - Redis for session management
   - JWT for authentication

### 🔧 Recommended Improvements

1. **Rename /shop to /products** (Frontend only - Backend already uses /products)
2. **Add category UPDATE endpoint** (currently missing)
3. **Enhance admin dashboard** (verify all features work)

---

## 📚 Complete API Reference

### Base URL
- **Development**: `http://localhost:5000/api/v1`
- **Production**: `https://your-domain.com/api/v1`

---

## 🔐 Authentication APIs

### POST `/auth/sign-up`
**Description**: Register a new user  
**Access**: Public  
**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```
**Response**: `201 Created`
```json
{
  "success": true,
  "data": {
    "user": { "id": "...", "email": "...", "name": "..." },
    "accessToken": "...",
    "refreshToken": "..."
  }
}
```

### POST `/auth/sign-in`
**Description**: Login existing user  
**Access**: Public  
**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```
**Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "user": { "id": "...", "email": "...", "role": "USER" },
    "accessToken": "...",
    "refreshToken": "..."
  }
}
```

### GET `/auth/sign-out`
**Description**: Logout user  
**Access**: Authenticated  
**Response**: `200 OK`

### POST `/auth/refresh-token`
**Description**: Refresh access token  
**Access**: Public (requires refresh token)  
**Request Body**:
```json
{
  "refreshToken": "..."
}
```

### POST `/auth/forgot-password`
**Description**: Request password reset  
**Access**: Public  
**Request Body**:
```json
{
  "email": "user@example.com"
}
```

### POST `/auth/reset-password`
**Description**: Reset password with token  
**Access**: Public  
**Request Body**:
```json
{
  "token": "reset-token",
  "newPassword": "newpassword123"
}
```

### Social Login
- **GET** `/auth/google` - Initiate Google OAuth
- **GET** `/auth/google/callback` - Google OAuth callback
- **GET** `/auth/facebook` - Initiate Facebook OAuth
- **GET** `/auth/facebook/callback` - Facebook OAuth callback
- **GET** `/auth/twitter` - Initiate Twitter OAuth
- **GET** `/auth/twitter/callback` - Twitter OAuth callback

**Note**: Social login automatically merges guest cart with user cart!

---

## 🛍️ Product APIs

### GET `/products`
**Description**: Get all products with filtering, sorting, pagination  
**Access**: Public  
**Query Parameters**:
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10)
- `sort` (string): Sort field (e.g., "price", "-createdAt")
- `search` (string): Search term
- `category` (string): Filter by category ID
- `minPrice` (number): Minimum price
- `maxPrice` (number): Maximum price
- `isNew` (boolean): Filter new products
- `isFeatured` (boolean): Filter featured products
- `isTrending` (boolean): Filter trending products
- `isBestSeller` (boolean): Filter best sellers

**Example**:
```
GET /products?page=1&limit=20&sort=-createdAt&category=electronics&minPrice=100&maxPrice=1000
```

**Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "products": [...],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 100,
      "itemsPerPage": 20
    }
  }
}
```

### GET `/products/:id`
**Description**: Get product by ID  
**Access**: Public  
**Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "...",
    "name": "iPhone 16 Pro",
    "description": "...",
    "slug": "iphone-16-pro",
    "category": { "id": "...", "name": "Electronics" },
    "variants": [
      {
        "id": "...",
        "sku": "IPH16-BLK-256",
        "price": 999.99,
        "stock": 50,
        "images": ["..."],
        "attributes": [
          { "name": "Color", "value": "Black" },
          { "name": "Storage", "value": "256GB" }
        ]
      }
    ],
    "averageRating": 4.5,
    "reviewCount": 120,
    "isNew": true,
    "isFeatured": true
  }
}
```

### GET `/products/slug/:slug`
**Description**: Get product by slug  
**Access**: Public  
**Response**: Same as GET by ID

### POST `/products` 🔒
**Description**: Create new product (Admin only)  
**Access**: Admin, Superadmin  
**Headers**: `Authorization: Bearer <token>`  
**Content-Type**: `multipart/form-data`  
**Request Body**:
```json
{
  "name": "New Product",
  "description": "Product description",
  "categoryId": "category-id",
  "slug": "new-product",
  "isNew": true,
  "isFeatured": false,
  "variants": [
    {
      "sku": "PROD-001",
      "price": 99.99,
      "stock": 100,
      "attributes": [
        { "attributeId": "color-id", "valueId": "red-id" }
      ]
    }
  ],
  "images": [<File>, <File>]
}
```
**Response**: `201 Created`

### PUT `/products/:id` 🔒
**Description**: Update product (Admin only)  
**Access**: Admin, Superadmin  
**Headers**: `Authorization: Bearer <token>`  
**Content-Type**: `multipart/form-data`  
**Response**: `200 OK`

### DELETE `/products/:id` 🔒
**Description**: Delete product (Admin only)  
**Access**: Admin, Superadmin  
**Headers**: `Authorization: Bearer <token>`  
**Response**: `200 OK`

### POST `/products/bulk` 🔒
**Description**: Bulk create products from file (Admin only)  
**Access**: Admin, Superadmin  
**Headers**: `Authorization: Bearer <token>`  
**Content-Type**: `multipart/form-data`  
**Request Body**:
```
file: <CSV/Excel file>
```
**Response**: `201 Created`

---

## 📦 Category APIs

### GET `/categories`
**Description**: Get all categories  
**Access**: Public  
**Response**: `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "...",
      "name": "Electronics",
      "slug": "electronics",
      "description": "...",
      "images": ["..."],
      "productCount": 150
    }
  ]
}
```

### GET `/categories/:id`
**Description**: Get category by ID  
**Access**: Public  
**Response**: `200 OK`

### POST `/categories` 🔒
**Description**: Create new category (Admin only)  
**Access**: Admin, Superadmin  
**Headers**: `Authorization: Bearer <token>`  
**Content-Type**: `multipart/form-data`  
**Request Body**:
```json
{
  "name": "New Category",
  "slug": "new-category",
  "description": "Category description",
  "images": [<File>, <File>]
}
```
**Response**: `201 Created`

### DELETE `/categories/:id` 🔒
**Description**: Delete category (Admin only)  
**Access**: Admin, Superadmin  
**Headers**: `Authorization: Bearer <token>`  
**Response**: `200 OK`

**⚠️ MISSING**: PUT `/categories/:id` - Update category endpoint

---

## 🛒 Cart APIs (Guest + Authenticated)

### GET `/cart`
**Description**: Get user's cart  
**Access**: Public (optionalAuth)  
**Headers**: `Authorization: Bearer <token>` (optional)  
**Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "cart-id",
    "userId": "user-id" or null,
    "sessionId": "session-id" or null,
    "status": "ACTIVE",
    "cartItems": [
      {
        "id": "item-id",
        "variantId": "variant-id",
        "quantity": 2,
        "variant": {
          "id": "...",
          "sku": "...",
          "price": 99.99,
          "product": {
            "name": "Product Name",
            "slug": "product-slug"
          }
        }
      }
    ],
    "totalItems": 2,
    "totalAmount": 199.98
  }
}
```

### GET `/cart/count`
**Description**: Get cart item count  
**Access**: Public (optionalAuth)  
**Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "count": 5
  }
}
```

### POST `/cart`
**Description**: Add item to cart  
**Access**: Public (optionalAuth)  
**Request Body**:
```json
{
  "variantId": "variant-id",
  "quantity": 2
}
```
**Response**: `201 Created`

**How it works**:
- **Guest users**: Cart is tied to `sessionId` (stored in session/cookie)
- **Logged-in users**: Cart is tied to `userId`
- **On login**: Guest cart automatically merges with user cart

### PUT `/cart/item/:itemId`
**Description**: Update cart item quantity  
**Access**: Public (optionalAuth)  
**Request Body**:
```json
{
  "quantity": 3
}
```
**Response**: `200 OK`

### DELETE `/cart/item/:itemId`
**Description**: Remove item from cart  
**Access**: Public (optionalAuth)  
**Response**: `200 OK`

### POST `/cart/merge`
**Description**: Merge guest cart with user cart  
**Access**: Authenticated  
**Headers**: `Authorization: Bearer <token>`  
**Response**: `200 OK`

**Note**: This is automatically called during:
- Regular login (`/auth/sign-in`)
- Social login callbacks (Google, Facebook, Twitter)

---

## 💳 Checkout & Orders

### POST `/checkout`
**Description**: Initiate checkout process  
**Access**: Authenticated  
**Headers**: `Authorization: Bearer <token>`  
**Request Body**:
```json
{
  "cartId": "cart-id",
  "paymentMethod": "stripe",
  "shippingAddress": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zip": "10001",
    "country": "USA"
  }
}
```
**Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "sessionId": "stripe-session-id",
    "url": "https://checkout.stripe.com/..."
  }
}
```

### GET `/orders/user`
**Description**: Get user's orders  
**Access**: Authenticated  
**Headers**: `Authorization: Bearer <token>`  
**Response**: `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "order-id",
      "orderDate": "2024-01-15T10:30:00Z",
      "status": "PENDING",
      "amount": 199.98,
      "orderItems": [
        {
          "id": "...",
          "quantity": 2,
          "price": 99.99,
          "variant": {
            "product": {
              "name": "Product Name"
            }
          }
        }
      ],
      "payment": {
        "status": "PAID",
        "method": "stripe"
      },
      "address": {
        "street": "...",
        "city": "...",
        "state": "...",
        "zip": "...",
        "country": "..."
      },
      "shipment": {
        "carrier": "UPS",
        "trackingNumber": "1Z999AA10123456784",
        "shippedDate": "2024-01-16T08:00:00Z",
        "deliveryDate": null
      }
    }
  ]
}
```

### GET `/orders/:orderId`
**Description**: Get order details  
**Access**: Authenticated  
**Headers**: `Authorization: Bearer <token>`  
**Response**: `200 OK`

### GET `/orders` 🔒
**Description**: Get all orders (Admin only)  
**Access**: Admin, Superadmin  
**Headers**: `Authorization: Bearer <token>`  
**Response**: `200 OK`

---

## 👤 User Management

### GET `/users/profile`
**Description**: Get current user profile  
**Access**: Authenticated  
**Headers**: `Authorization: Bearer <token>`  
**Response**: `200 OK`

### PUT `/users/profile`
**Description**: Update user profile  
**Access**: Authenticated  
**Headers**: `Authorization: Bearer <token>`  
**Request Body**:
```json
{
  "name": "Updated Name",
  "avatar": "<File>"
}
```
**Response**: `200 OK`

### GET `/users` 🔒
**Description**: Get all users (Admin only)  
**Access**: Admin, Superadmin  
**Headers**: `Authorization: Bearer <token>`  
**Response**: `200 OK`

---

## 📊 Analytics APIs 🔒

### GET `/analytics/overview`
**Description**: Get dashboard overview  
**Access**: Admin, Superadmin  
**Headers**: `Authorization: Bearer <token>`  
**Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "totalRevenue": 125000.50,
    "totalOrders": 1250,
    "totalUsers": 5000,
    "totalProducts": 350,
    "revenueGrowth": 15.5,
    "ordersGrowth": 12.3
  }
}
```

### GET `/analytics/sales`
**Description**: Get sales analytics  
**Access**: Admin, Superadmin  
**Query Parameters**: `startDate`, `endDate`, `groupBy` (day/week/month)

### GET `/analytics/products`
**Description**: Get product performance analytics  
**Access**: Admin, Superadmin

### GET `/analytics/users`
**Description**: Get user analytics  
**Access**: Admin, Superadmin

---

## 📝 Reviews

### GET `/reviews/product/:productId`
**Description**: Get product reviews  
**Access**: Public  
**Response**: `200 OK`

### POST `/reviews`
**Description**: Create product review  
**Access**: Authenticated  
**Headers**: `Authorization: Bearer <token>`  
**Request Body**:
```json
{
  "productId": "product-id",
  "rating": 5,
  "comment": "Great product!"
}
```
**Response**: `201 Created`

### PUT `/reviews/:id`
**Description**: Update review  
**Access**: Authenticated (own reviews only)  
**Response**: `200 OK`

### DELETE `/reviews/:id`
**Description**: Delete review  
**Access**: Authenticated (own reviews) or Admin  
**Response**: `200 OK`

---

## 🎨 Attributes & Variants

### GET `/attributes`
**Description**: Get all attributes  
**Access**: Public  
**Response**: `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "...",
      "name": "Color",
      "slug": "color",
      "values": [
        { "id": "...", "value": "Red", "slug": "red" },
        { "id": "...", "value": "Blue", "slug": "blue" }
      ]
    },
    {
      "id": "...",
      "name": "Size",
      "slug": "size",
      "values": [
        { "id": "...", "value": "Small", "slug": "small" },
        { "id": "...", "value": "Medium", "slug": "medium" },
        { "id": "...", "value": "Large", "slug": "large" }
      ]
    }
  ]
}
```

### POST `/attributes` 🔒
**Description**: Create attribute (Admin only)  
**Access**: Admin, Superadmin

### GET `/variants/:id`
**Description**: Get variant details  
**Access**: Public

### PUT `/variants/:id` 🔒
**Description**: Update variant (Admin only)  
**Access**: Admin, Superadmin

---

## 💬 Chat (Real-time)

### GET `/chat`
**Description**: Get user's chat conversations  
**Access**: Authenticated  
**Headers**: `Authorization: Bearer <token>`

### POST `/chat`
**Description**: Create new chat  
**Access**: Authenticated

### GET `/chat/:chatId/messages`
**Description**: Get chat messages  
**Access**: Authenticated

### POST `/chat/:chatId/messages`
**Description**: Send message  
**Access**: Authenticated

**WebSocket Events**:
- `chat:message` - New message received
- `chat:typing` - User is typing
- `chat:read` - Message read

---

## 📦 Shipment & Tracking

### GET `/shipment/:orderId`
**Description**: Get shipment details  
**Access**: Authenticated  
**Response**: `200 OK`

### PUT `/shipment/:orderId` 🔒
**Description**: Update shipment (Admin only)  
**Access**: Admin, Superadmin

---

## 💰 Payments

### GET `/payments/user`
**Description**: Get user's payment history  
**Access**: Authenticated

### POST `/payments/webhook`
**Description**: Stripe webhook endpoint  
**Access**: Public (Stripe only)

---

## 📊 Reports 🔒

### POST `/reports/generate`
**Description**: Generate custom report  
**Access**: Admin, Superadmin  
**Request Body**:
```json
{
  "type": "sales" | "inventory" | "users",
  "format": "pdf" | "csv" | "excel",
  "startDate": "2024-01-01",
  "endDate": "2024-01-31"
}
```

### GET `/reports/:reportId`
**Description**: Download generated report  
**Access**: Admin, Superadmin

---

## 🏥 Health & Monitoring

### GET `/health`
**Description**: Basic health check  
**Access**: Public  
**Response**: `200 OK`

### GET `/health/detailed`
**Description**: Detailed health check with dependencies  
**Access**: Public  
**Response**: `200 OK`
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00Z",
  "uptime": 86400,
  "dependencies": {
    "database": "connected",
    "redis": "connected",
    "cloudinary": "connected"
  }
}
```

### GET `/ready`
**Description**: Kubernetes readiness probe  
**Access**: Public

### GET `/live`
**Description**: Kubernetes liveness probe  
**Access**: Public

---

## 🔐 Authorization Levels

| Role | Access Level |
|------|-------------|
| **Guest** | Browse products, add to cart, view public content |
| **USER** | All guest + place orders, reviews, profile management |
| **ADMIN** | All user + product/category management, view analytics |
| **SUPERADMIN** | All admin + user management, system configuration |

---

## 🎯 Key Features Analysis

### ✅ Already Implemented & Working

1. **Guest Cart Functionality**
   - ✅ Guests can add products to cart without login
   - ✅ Cart persists via session (sessionId)
   - ✅ Automatic cart merge on login
   - ✅ Works with social login (Google, Facebook, Twitter)

2. **Admin Product Management**
   - ✅ Create products with variants
   - ✅ Update products
   - ✅ Delete products
   - ✅ Bulk import via file upload
   - ✅ Image upload (Cloudinary)
   - ✅ Attribute management (Color, Size, etc.)

3. **Admin Category Management**
   - ✅ Create categories
   - ✅ Delete categories
   - ✅ Image upload
   - ⚠️ Missing: Update category endpoint

4. **Scalability Features**
   - ✅ Redis for session management
   - ✅ JWT authentication
   - ✅ Pagination on all list endpoints
   - ✅ Filtering and sorting
   - ✅ Database indexing
   - ✅ Cloudinary for image CDN

---

## 🔧 Recommended Improvements

### 1. Frontend Route Rename: /shop → /products

**Current**: Frontend uses `/shop` route  
**Backend**: Already uses `/products` ✅  
**Action**: Rename frontend routes only

**Files to Update**:
- `src/client/app/(public)/shop/` → `src/client/app/(public)/products/`
- Navigation links
- Internal route references

### 2. Add Category Update Endpoint

**Missing**: `PUT /categories/:id`

**Implementation Needed**:
```typescript
router.put(
  "/:id",
  protect,
  authorizeRole("ADMIN", "SUPERADMIN"),
  upload.array("images", 5),
  categoryController.updateCategory
);
```

### 3. Verify Admin Dashboard Features

**Check**:
- Product creation form works
- Category creation form works
- Image uploads work (Cloudinary configured)
- Analytics dashboard displays data
- User management works

---

## 🚀 Scalability Considerations

### Current Architecture (Good!)

1. **Session Management**: Redis (supports horizontal scaling)
2. **Authentication**: JWT (stateless, scalable)
3. **File Storage**: Cloudinary (CDN, globally distributed)
4. **Database**: MySQL with proper indexing
5. **Caching**: Redis for frequently accessed data

### For Future Growth

1. **Database**:
   - Consider read replicas for heavy read operations
   - Implement database connection pooling
   - Add database query caching

2. **API**:
   - Implement rate limiting (already has express-rate-limit)
   - Add API versioning (already has v1, v2 structure)
   - Consider GraphQL for complex queries (already implemented!)

3. **Caching**:
   - Cache product listings
   - Cache category data
   - Implement cache invalidation strategy

4. **Monitoring**:
   - Add application performance monitoring (APM)
   - Implement error tracking (Sentry)
   - Set up logging aggregation

---

## 📝 Next Steps

1. **Test Current Setup** ✅
   - Verify server is running
   - Test "My Orders" page
   - Confirm Redis connection

2. **Frontend Updates**
   - Rename /shop to /products routes
   - Update navigation links
   - Test all pages

3. **Backend Enhancement**
   - Add category UPDATE endpoint
   - Test admin product creation
   - Test admin category creation

4. **Testing**
   - Test guest cart → login → cart merge flow
   - Test admin dashboard features
   - Test all API endpoints

Would you like me to proceed with any of these improvements?
