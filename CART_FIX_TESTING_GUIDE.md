# 🔧 Cart Fix Testing Guide

## ✅ Changes Applied

### 1. Session Cookie Configuration Fixed
**File**: `src/server/src/app.ts`
- Changed `sameSite` from `"none"` to `"lax"` in development
- This allows cookies to work properly in local development without HTTPS

### 2. Session Save Added
**File**: `src/server/src/modules/cart/cart.controller.ts`
- Added `req.session.save()` callback in `addToCart` method
- Ensures session is persisted before sending response

### 3. TypeScript Types Updated
**File**: `src/server/src/types.d.ts`
- Added proper express-session types
- Session now has `save()` method available

---

## 🧪 Testing Steps

### Step 1: Restart the Server

```bash
# Stop the current server (Ctrl+C)
# Then restart:
cd src/server
npm run dev
```

**Expected Output**:
```
✅ Connected to database
⚠️  REDIS_URL not set — using in-memory Redis mock
🚀 Server is running on port 5000
```

### Step 2: Test Guest Cart (Most Important!)

1. **Open Browser in Incognito Mode** (to start fresh)

2. **Open DevTools**:
   - Press F12
   - Go to **Application** tab → **Cookies** → `http://localhost:3000`

3. **Visit Homepage**:
   ```
   http://localhost:3000
   ```

4. **Check for Session Cookie**:
   - You should see a cookie named `connect.sid`
   - Note the value (this is your session ID)

5. **Add Item to Cart**:
   - Browse products
   - Click "Add to Cart" on any product
   - Should see "Added to cart" message

6. **Check Server Logs**:
   Look for these logs in your server terminal:
   ```
   🔍 [CART CONTROLLER] addToCart called
   🔍 [CART CONTROLLER] Extracted sessionId: <some-id>
   🔍 [CART SERVICE] getOrCreateCart called
   🔍 [CART REPOSITORY] Cart created: { id: '...', sessionId: '...' }
   🔍 [CART REPOSITORY] Cart item created
   ✅ [CART CONTROLLER] Session saved successfully
   ```

7. **View Cart**:
   - Click on cart icon
   - **SHOULD NOW SEE YOUR ITEM!** ✅

8. **Refresh Page**:
   - Press F5 to refresh
   - Cart should still have the item ✅

9. **Close and Reopen Browser**:
   - Close incognito window
   - Open new incognito window
   - Go to `http://localhost:3000`
   - Cart should be empty (new session) ✅

### Step 3: Test Logged-in User Cart

1. **Login**:
   ```
   Email: user@example.com
   Password: password123
   ```

2. **Add Items to Cart**:
   - Add 2-3 different products
   - Verify they appear in cart

3. **Check Server Logs**:
   ```
   🔍 [CART CONTROLLER] Extracted userId: <user-id>
   🔍 [CART SERVICE] Looking for cart by userId
   🔍 [CART REPOSITORY] Cart found by userId
   ```

4. **Logout**:
   - Click logout button
   - Should redirect to homepage

5. **Login Again**:
   - Login with same credentials
   - **Cart should still have all items!** ✅

6. **Check Database** (Optional):
   ```sql
   -- Check user's cart
   SELECT c.*, ci.quantity, p.name
   FROM Cart c
   JOIN CartItem ci ON c.id = ci.cartId
   JOIN ProductVariant pv ON ci.variantId = pv.id
   JOIN Product p ON pv.productId = p.id
   WHERE c.userId = '<your-user-id>';
   ```

### Step 4: Test Guest → Logged-in Merge

1. **Start as Guest** (incognito mode):
   - Add 2 items to cart as guest
   - Verify items are in cart

2. **Login**:
   - Login as `user@example.com`
   - Should see merge happening in logs:
   ```
   🔍 [CART SERVICE] mergeCartsOnLogin called
   🔍 [CART REPOSITORY] Session items found
   🔍 [CART REPOSITORY] Merging quantities
   ```

3. **Check Cart**:
   - Cart should have the 2 guest items ✅
   - If user already had items, quantities should be combined

4. **Add More Items**:
   - Add 1 more item while logged in
   - Total should be 3 items

5. **Logout and Login**:
   - Logout
   - Login again
   - **Should still have all 3 items!** ✅

---

## 🐛 Troubleshooting

### Issue: Cart Still Empty for Guest

**Check 1: Session Cookie**
```
DevTools → Application → Cookies
Should see: connect.sid cookie
```

**If missing**:
- Clear all cookies
- Restart browser
- Try again

**Check 2: Server Logs**
```
Look for: "Session saved successfully"
```

**If not present**:
- Server might not have restarted
- Stop server (Ctrl+C) and restart

**Check 3: CORS**
```
DevTools → Console
Look for CORS errors
```

**If CORS errors**:
- Verify server is running on port 5000
- Verify client is running on port 3000

### Issue: Cart Empty After Logout/Login

**Check 1: Database**
```sql
SELECT * FROM Cart WHERE userId = '<user-id>';
SELECT * FROM CartItem WHERE cartId = '<cart-id>';
```

**If no cart items**:
- Items might not be saving
- Check server logs for errors during addToCart

**Check 2: User ID**
```
Server logs should show:
🔍 [CART CONTROLLER] Extracted userId: <consistent-id>
```

**If userId changes**:
- Authentication might be broken
- Check JWT token

### Issue: Session Not Persisting

**Check 1: Redis Connection**
```
Server logs should show:
⚠️  REDIS_URL not set — using in-memory session store
```

**This is OK for development!**

**Check 2: Session Configuration**
```typescript
// In src/server/src/app.ts
saveUninitialized: true  // ✅ Should be true
```

---

## 📊 Success Criteria

After all fixes, you should have:

### ✅ Guest Users
- [x] Can add items to cart
- [x] Cart persists across page refreshes
- [x] Session cookie visible in DevTools
- [x] Cart items saved in database with sessionId

### ✅ Logged-in Users
- [x] Can add items to cart
- [x] Cart persists after logout/login
- [x] Cart tied to userId in database
- [x] All items remain after re-login

### ✅ Guest → Logged-in
- [x] Guest cart merges with user cart on login
- [x] No items lost during merge
- [x] Duplicate items have quantities combined

---

## 🔍 Debug Commands

### Check Session in Browser Console
```javascript
// In browser console
document.cookie
// Should see: connect.sid=...
```

### Test API Directly
```bash
# Get cart (will create session)
curl -X GET http://localhost:5000/api/v1/cart \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -v

# Add to cart (use session from above)
curl -X POST http://localhost:5000/api/v1/cart \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"variantId":"<variant-id>","quantity":1}' \
  -v

# Get cart again (should have item)
curl -X GET http://localhost:5000/api/v1/cart \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -v
```

### Check Database
```sql
-- All carts
SELECT * FROM Cart ORDER BY createdAt DESC LIMIT 10;

-- Cart items with product names
SELECT 
  ci.id,
  ci.quantity,
  p.name as product_name,
  pv.sku,
  c.userId,
  c.sessionId
FROM CartItem ci
JOIN ProductVariant pv ON ci.variantId = pv.id
JOIN Product p ON pv.productId = p.id
JOIN Cart c ON ci.cartId = c.id
ORDER BY ci.createdAt DESC;

-- User's cart
SELECT 
  c.id as cart_id,
  c.userId,
  COUNT(ci.id) as item_count,
  SUM(ci.quantity) as total_quantity
FROM Cart c
LEFT JOIN CartItem ci ON c.id = ci.cartId
WHERE c.userId = '<user-id>'
GROUP BY c.id;
```

---

## 📝 Next Steps

If cart is working:
1. ✅ Test checkout flow
2. ✅ Test order creation
3. ✅ Test payment integration (if configured)

If cart still not working:
1. Share server logs from addToCart
2. Share browser console errors
3. Share database query results
4. We'll debug further!

---

## 🎯 Quick Test Script

Run this in your browser console after adding an item:

```javascript
// Check if session cookie exists
const hasCookie = document.cookie.includes('connect.sid');
console.log('Session cookie exists:', hasCookie);

// Fetch cart
fetch('http://localhost:5000/api/v1/cart', {
  credentials: 'include'
})
.then(r => r.json())
.then(data => {
  console.log('Cart data:', data);
  console.log('Cart items:', data.data?.cart?.cartItems);
  console.log('Item count:', data.data?.cart?.cartItems?.length || 0);
});
```

Expected output:
```
Session cookie exists: true
Cart data: { success: true, data: { cart: { ... } } }
Cart items: [{ id: '...', quantity: 1, ... }]
Item count: 1
