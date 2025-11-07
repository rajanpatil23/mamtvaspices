# 🔍 Cart Issues Analysis & Fixes

## 🐛 Issues Identified

### Issue 1: Guest Cart Empty After Adding Items
**Symptom**: Guest user adds item to cart, sees "Added to cart" message, but cart is empty when viewed.

**Root Cause**: Session cookie not being set/persisted properly due to:
1. `sameSite: "none"` requires `secure: true` in ALL environments (not just production)
2. Browser blocking third-party cookies
3. Session not being saved before response

### Issue 2: Logged-in User Cart Empty After Logout/Login
**Symptom**: User adds items to cart, logs out, logs back in - cart is empty.

**Root Cause**: Cart is correctly tied to userId, but:
1. Cart items might not be persisting to database
2. Session might be clearing cart on logout
3. Cart retrieval might have issues

---

## 🔧 Fixes Required

### Fix 1: Update Session Configuration

**File**: `src/server/src/app.ts`

**Current Problem**:
```typescript
cookie: {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production", // ❌ Only secure in production
  sameSite: "none", // ❌ Requires secure: true always
  maxAge: 1000 * 60 * 60 * 24 * 7,
}
```

**Solution**:
```typescript
cookie: {
  httpOnly: true,
  secure: true, // ✅ Always true when sameSite is "none"
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // ✅ Use "lax" in dev
  maxAge: 1000 * 60 * 60 * 24 * 7,
}
```

**OR** (Better for development):
```typescript
cookie: {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  maxAge: 1000 * 60 * 60 * 24 * 7,
}
```

### Fix 2: Ensure Session is Saved Before Response

**File**: `src/server/src/modules/cart/cart.controller.ts`

**Add session save** in `addToCart` method:
```typescript
addToCart = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const sessionId = req.session.id;
  const { variantId, quantity } = req.body;

  const item = await this.cartService.addToCart(
    variantId,
    quantity,
    userId,
    sessionId
  );

  // ✅ Ensure session is saved before responding
  req.session.save((err) => {
    if (err) {
      console.error("Session save error:", err);
    }
    
    sendResponse(res, 200, {
      data: { item },
      message: "Item added to cart successfully",
    });
  });
});
```

### Fix 3: Don't Clear Cart on Logout

**Check**: Verify logout doesn't delete cart items

**File**: `src/server/src/modules/auth/auth.controller.ts`

Ensure logout only destroys session, not cart:
```typescript
signout = asyncHandler(async (req: Request, res: Response) => {
  // ❌ Don't do this: await cartService.clearCart(userId)
  
  req.session.destroy((err) => {
    if (err) {
      console.error("Session destroy error:", err);
    }
    res.clearCookie("connect.sid");
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    
    sendResponse(res, 200, {
      message: "Signed out successfully",
    });
  });
});
```

---

## 🧪 Testing Steps

### Test 1: Guest Cart Persistence

1. **Open browser in incognito mode**
2. **Open DevTools** → Application → Cookies
3. **Visit**: http://localhost:3000
4. **Check**: Should see `connect.sid` cookie
5. **Add item to cart**
6. **Check server logs**: Look for session ID
7. **Refresh page**
8. **Check cart**: Should still have items

**Expected Logs**:
```
🔍 [CART CONTROLLER] addToCart called
🔍 [CART CONTROLLER] Extracted sessionId: abc123...
🔍 [CART SERVICE] getOrCreateCart called
🔍 [CART SERVICE] sessionId: abc123...
🔍 [CART REPOSITORY] Cart created: { id: '...', sessionId: 'abc123...' }
🔍 [CART REPOSITORY] Cart item created: { id: '...', cartId: '...' }
```

### Test 2: Logged-in User Cart Persistence

1. **Login** as user@example.com
2. **Add items to cart**
3. **Check database**: 
   ```sql
   SELECT * FROM Cart WHERE userId = 'user-id';
   SELECT * FROM CartItem WHERE cartId = 'cart-id';
   ```
4. **Logout**
5. **Login again**
6. **Check cart**: Should have same items

**Expected Behavior**:
- Cart tied to `userId` (not `sessionId`)
- Cart items persist in database
- Cart retrieved on login

### Test 3: Guest to Logged-in Cart Merge

1. **As guest**: Add 2 items to cart
2. **Login**
3. **Check cart**: Should have 2 items
4. **Add 1 more item**
5. **Logout and login again**
6. **Check cart**: Should have all 3 items

---

## 🔍 Debugging Commands

### Check Server Logs
```bash
# In server terminal, look for:
✅ Connected to Redis
🔍 [CART CONTROLLER] addToCart called
🔍 [CART CONTROLLER] Extracted sessionId: ...
```

### Check Database
```sql
-- Check carts
SELECT * FROM Cart ORDER BY createdAt DESC LIMIT 10;

-- Check cart items
SELECT ci.*, p.name as product_name, pv.sku
FROM CartItem ci
JOIN ProductVariant pv ON ci.variantId = pv.id
JOIN Product p ON pv.productId = p.id
ORDER BY ci.createdAt DESC;

-- Check user's cart
SELECT c.*, COUNT(ci.id) as item_count
FROM Cart c
LEFT JOIN CartItem ci ON c.id = ci.cartId
WHERE c.userId = 'user-id'
GROUP BY c.id;
```

### Test API Directly
```bash
# Get cart (guest)
curl -X GET http://localhost:5000/api/v1/cart \
  -H "Cookie: connect.sid=YOUR_SESSION_ID" \
  -v

# Add to cart (guest)
curl -X POST http://localhost:5000/api/v1/cart \
  -H "Content-Type: application/json" \
  -H "Cookie: connect.sid=YOUR_SESSION_ID" \
  -d '{"variantId":"variant-id","quantity":1}' \
  -v

# Get cart (logged in)
curl -X GET http://localhost:5000/api/v1/cart \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -v
```

---

## 🎯 Quick Fix Summary

1. **Update session cookie settings** in `src/server/src/app.ts`
2. **Add session.save()** in cart controller
3. **Verify logout doesn't clear cart**
4. **Restart server** to apply changes
5. **Test in incognito mode** to verify

---

## 📝 Additional Recommendations

### 1. Add Session Debugging Middleware

```typescript
// In src/server/src/app.ts, after session middleware
app.use((req, res, next) => {
  console.log("📍 Session Debug:", {
    sessionID: req.session.id,
    cookie: req.session.cookie,
    userId: req.user?.id,
    path: req.path,
  });
  next();
});
```

### 2. Add Cart Debugging Endpoint

```typescript
// In cart.routes.ts
router.get("/debug", optionalAuth, async (req, res) => {
  const userId = req.user?.id;
  const sessionId = req.session.id;
  
  const cart = await prisma.cart.findFirst({
    where: userId ? { userId } : { sessionId },
    include: { cartItems: true },
  });
  
  res.json({
    userId,
    sessionId,
    cart,
    cookies: req.cookies,
    session: req.session,
  });
});
```

### 3. Frontend: Ensure Credentials

```typescript
// In frontend API calls
fetch('http://localhost:5000/api/v1/cart', {
  credentials: 'include', // ✅ Important!
  headers: {
    'Content-Type': 'application/json',
  },
});

// Or with axios
axios.defaults.withCredentials = true;
```

---

## 🚨 Common Pitfalls

1. **Browser blocking cookies**: Check browser console for cookie warnings
2. **CORS not allowing credentials**: Verify `credentials: true` in CORS config
3. **Session not initialized**: Ensure `saveUninitialized: true`
4. **Redis not connected**: Check for "using in-memory Redis mock" warning
5. **Frontend not sending credentials**: Add `credentials: 'include'` to fetch

---

## ✅ Success Criteria

After fixes, you should see:

1. **Guest users**:
   - ✅ Can add items to cart
   - ✅ Cart persists across page refreshes
   - ✅ Session cookie visible in DevTools
   - ✅ Cart items visible in database

2. **Logged-in users**:
   - ✅ Can add items to cart
   - ✅ Cart persists after logout/login
   - ✅ Cart tied to userId in database
   - ✅ All items remain after re-login

3. **Guest → Logged-in**:
   - ✅ Guest cart merges with user cart on login
   - ✅ No items lost during merge
   - ✅ Duplicate items have quantities combined
