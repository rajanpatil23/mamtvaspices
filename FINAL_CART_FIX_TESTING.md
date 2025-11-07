# 🎯 Final Cart Fix - Complete Testing Guide

## ✅ What Was Fixed

### Issue 1: Guest Cart Not Persisting
**Problem**: Session cookie configuration
**Fix**: Changed `sameSite` from `"none"` to `"lax"` in development

### Issue 2: Guest Cart Not Merging on Login
**Problem**: Session ID changes on login, breaking the link to guest cart
**Fix**: Save old session ID before login, use it to find guest cart

### Issue 3: User Cart Not Persisting After Logout
**Already Working**: Cart is tied to `userId` in database, persists automatically

---

## 🚀 STEP 1: Restart Server (CRITICAL!)

```bash
# Stop the server (Ctrl+C in server terminal)
# Then restart:
cd src/server
npm run dev

# Wait for:
✅ Connected to database
🚀 Server is running on port 5000
```

---

## 🧪 STEP 2: Test Guest Cart

### Test 2.1: Add Item as Guest

1. **Open browser in incognito mode**
2. **Visit**: `http://localhost:3000`
3. **Open DevTools** (F12) → Application → Cookies
4. **Verify**: You see `connect.sid` cookie
5. **Browse products** and **add 1 item to cart**
6. **Check server logs** for:
   ```
   🔍 [CART CONTROLLER] addToCart called
   🔍 [CART CONTROLLER] Extracted sessionId: <some-id>
   🔍 [CART REPOSITORY] Cart created: { sessionId: '<some-id>' }
   🔍 [CART REPOSITORY] Cart item created
   ```

### Test 2.2: View Cart
7. **Click cart icon**
8. **✅ SHOULD SEE YOUR ITEM!**

### Test 2.3: Refresh Page
9. **Press F5** to refresh
10. **✅ Cart should still have the item**

---

## 🧪 STEP 3: Test Guest → Logged-in Merge

### Test 3.1: Add Items as Guest
1. **Stay in incognito mode** (or open new one)
2. **Add 2-3 different products** to cart as guest
3. **Verify items are in cart**

### Test 3.2: Login
4. **Click "Sign In"**
5. **Login with**: `user@example.com` / `password123`
6. **Check server logs** for:
   ```
   🔍 [AUTH] Old session ID before signin: <old-id>
   🔍 [AUTH] Merging cart with old session ID: <old-id>
   🔍 [CART SERVICE] mergeCartsOnLogin called
   🔍 [CART SERVICE] sessionId: <old-id>  ← Should be OLD session ID!
   🔍 [CART SERVICE] Session cart found: { id: '...', cartItems: [...] }
   🔍 [CART REPOSITORY] Session items found: [...]
   🔍 [CART REPOSITORY] Adding new item to user cart
   🔍 [CART REPOSITORY] Session cart deleted
   ```

### Test 3.3: Verify Merge
7. **Check cart**
8. **✅ Should have all 2-3 items from guest session**

---

## 🧪 STEP 4: Test User Cart Persistence

### Test 4.1: Add More Items While Logged In
1. **While still logged in**, add 1-2 more products
2. **Verify** they appear in cart
3. **Total items**: Should be 3-5 items now

### Test 4.2: Logout
4. **Click "Logout"**
5. **Verify** you're logged out (redirected to homepage)

### Test 4.3: Login Again
6. **Login again** with same credentials
7. **Check cart**
8. **✅ Should have ALL items (3-5 items)**

### Test 4.4: Close Browser and Reopen
9. **Close browser completely**
10. **Open new browser window**
11. **Go to** `http://localhost:3000`
12. **Login**
13. **✅ Cart should STILL have all items**

---

## 🧪 STEP 5: Test Edge Cases

### Test 5.1: Same Product in Guest and User Cart
1. **As guest**: Add Product A (quantity: 1)
2. **Login** (user already has Product A with quantity: 2)
3. **✅ Should merge**: Product A quantity should be 3

### Test 5.2: Multiple Logins
1. **Logout**
2. **Add items as guest**
3. **Login**
4. **Logout**
5. **Login again**
6. **✅ All items should persist**

### Test 5.3: Different Users
1. **Logout**
2. **Add items as guest**
3. **Login as** `admin@example.com`
4. **✅ Guest items should merge with admin's cart**
5. **Logout**
6. **Login as** `user@example.com`
7. **✅ User's cart should be separate (not affected by admin's cart)**

---

## 🔍 What to Look For in Server Logs

### When Adding to Cart (Guest):
```
🔍 [CART CONTROLLER] Extracted sessionId: ABC123
🔍 [CART SERVICE] Looking for cart by sessionId: ABC123
🔍 [CART REPOSITORY] Cart created: { sessionId: 'ABC123' }
```

### When Logging In:
```
🔍 [AUTH] Old session ID before signin: ABC123  ← OLD session ID
🔍 [AUTH] New session ID after signin: XYZ789   ← NEW session ID
🔍 [AUTH] Merging cart with old session ID: ABC123  ← Using OLD!
🔍 [CART SERVICE] mergeCartsOnLogin called
🔍 [CART SERVICE] sessionId: ABC123  ← Should be OLD session ID
🔍 [CART SERVICE] Session cart found: { id: '...', cartItems: [...] }
🔍 [CART REPOSITORY] Merging quantities: 3
🔍 [CART REPOSITORY] Session cart deleted
```

### When Getting Cart (Logged In):
```
🔍 [CART CONTROLLER] Extracted userId: user-id-123
🔍 [CART SERVICE] Looking for cart by userId: user-id-123
🔍 [CART REPOSITORY] Cart found by userId: { userId: 'user-id-123', cartItems: [...] }
```

---

## ✅ Success Criteria

After all tests, you should have:

### ✅ Guest Users
- [x] Can add items to cart without login
- [x] Cart persists across page refreshes
- [x] Session cookie visible in DevTools
- [x] Cart items saved in database with sessionId

### ✅ Guest → Logged-in Merge
- [x] Guest cart merges with user cart on login
- [x] No items lost during merge
- [x] Duplicate items have quantities combined
- [x] Old session cart is deleted after merge

### ✅ Logged-in Users
- [x] Can add items to cart
- [x] Cart persists after logout/login
- [x] Cart tied to userId in database
- [x] All items remain after closing browser and reopening

---

## 🐛 Troubleshooting

### Issue: Guest cart still empty after adding items

**Check**:
1. Server logs show session ID?
2. Cookie `connect.sid` exists in browser?
3. Server restarted after changes?

**Solution**:
- Clear all cookies
- Restart browser
- Try again

### Issue: Guest cart not merging on login

**Check server logs for**:
```
🔍 [AUTH] Old session ID before signin: <should-not-be-empty>
```

**If empty or undefined**:
- Session might not be initialized
- Check if `saveUninitialized: true` in app.ts

### Issue: User cart empty after logout/login

**Check database**:
```sql
SELECT * FROM Cart WHERE userId = '<user-id>';
SELECT * FROM CartItem WHERE cartId = '<cart-id>';
```

**If no items**:
- Items might not be saving
- Check for errors in server logs during addToCart

---

## 📊 Database Verification

### Check Guest Cart:
```sql
SELECT c.id, c.sessionId, c.userId, COUNT(ci.id) as item_count
FROM Cart c
LEFT JOIN CartItem ci ON c.id = ci.cartId
WHERE c.sessionId IS NOT NULL
GROUP BY c.id
ORDER BY c.createdAt DESC
LIMIT 5;
```

### Check User Cart:
```sql
SELECT c.id, c.userId, u.email, COUNT(ci.id) as item_count
FROM Cart c
LEFT JOIN CartItem ci ON c.id = ci.cartId
LEFT JOIN User u ON c.userId = u.id
WHERE c.userId IS NOT NULL
GROUP BY c.id
ORDER BY c.createdAt DESC
LIMIT 5;
```

### Check Cart Items with Product Names:
```sql
SELECT 
  ci.id,
  ci.quantity,
  p.name as product_name,
  pv.sku,
  c.userId,
  c.sessionId,
  u.email
FROM CartItem ci
JOIN ProductVariant pv ON ci.variantId = pv.id
JOIN Product p ON pv.productId = p.id
JOIN Cart c ON ci.cartId = c.id
LEFT JOIN User u ON c.userId = u.id
ORDER BY ci.createdAt DESC
LIMIT 10;
```

---

## 🎉 Expected Results

After completing all tests:

1. **Guest cart works** ✅
2. **Guest cart merges on login** ✅
3. **User cart persists after logout** ✅
4. **No items are lost** ✅
5. **Duplicate items merge correctly** ✅

---

## 📝 Report Back

After testing, please let me know:

1. ✅ Which tests passed?
2. ❌ Which tests failed?
3. 📋 What do the server logs show?
4. 🗄️ What does the database show?

I'll help debug any remaining issues!
