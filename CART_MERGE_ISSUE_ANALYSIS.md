# 🔍 Cart Merge Issue Analysis

## 🐛 The Problem

**What's Happening:**
1. Guest adds items to cart → Cart tied to `sessionId: ABC123`
2. Guest logs in → Session regenerates → New `sessionId: XYZ789`
3. System tries to merge cart with `sessionId: XYZ789` (doesn't exist!)
4. Result: Guest cart items are lost

**Why It Happens:**
When you login, Express session regenerates the session ID for security. This breaks the link to the guest cart.

---

## ✅ The Solution

We need to **save the old session ID before login**, then use it to find the guest cart.

### Fix 1: Update Auth Controller to Pass Old Session ID

**File**: `src/server/src/modules/auth/auth.controller.ts`

In both `signin` and `signup` methods, we need to:
1. Save the old session ID BEFORE authentication
2. Pass it to the merge function

---

## 🔧 Implementation

### Option A: Store Session ID in Request Body (Frontend Change Required)

**Frontend sends**:
```javascript
// Before login, get session ID
const sessionId = document.cookie
  .split('; ')
  .find(row => row.startsWith('connect.sid='))
  ?.split('=')[1];

// Send with login request
fetch('/api/v1/auth/signin', {
  method: 'POST',
  body: JSON.stringify({
    email,
    password,
    guestSessionId: sessionId // Add this
  })
});
```

**Backend uses it**:
```typescript
const guestSessionId = req.body.guestSessionId || req.session.id;
await this.cartService?.mergeCartsOnLogin(guestSessionId, userId);
```

### Option B: Store Session ID Before Regeneration (Backend Only - RECOMMENDED)

**Modify auth controller to save old session ID**:

```typescript
signin = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;
  
  // ✅ Save old session ID BEFORE login
  const oldSessionId = req.session.id;
  console.log("🔍 Old session ID before login:", oldSessionId);
  
  const { user, accessToken, refreshToken } = await this.authService.signin({
    email,
    password,
  });

  res.cookie("refreshToken", refreshToken, cookieOptions);
  res.cookie("accessToken", accessToken, cookieOptions);

  const userId = user.id;
  
  // ✅ Use OLD session ID to find guest cart
  await this.cartService?.mergeCartsOnLogin(oldSessionId, userId);
  
  console.log("🔍 New session ID after login:", req.session.id);

  sendResponse(res, 200, {
    data: {
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
        avatar: user.avatar,
      },
    },
    message: "User logged in successfully",
  });
});
```

---

## 🧪 Testing the Fix

### Before Fix:
```
1. Guest adds item → sessionId: ABC123
2. Login → sessionId changes to XYZ789
3. Merge tries to find cart with sessionId: XYZ789
4. ❌ No cart found → items lost
```

### After Fix:
```
1. Guest adds item → sessionId: ABC123
2. Save oldSessionId = ABC123
3. Login → sessionId changes to XYZ789
4. Merge uses oldSessionId: ABC123
5. ✅ Cart found → items merged!
```

---

## 🎯 Additional Issue: Cart Persistence After Logout

**Current Behavior:**
- User logs out → Session destroyed
- User logs back in → New session
- Cart should be tied to userId, not session

**This should already work** because:
1. Cart is stored with `userId` in database
2. On login, `getOrCreateCart(userId)` finds existing cart
3. Items should persist

**If it's not working**, the issue might be:
- Logout is clearing cart items (check `signout` method)
- Session is not properly associating with userId

---

## 🔍 Debug Steps

### Step 1: Check Server Logs

When you add item as guest, look for:
```
🔍 [CART REPOSITORY] Cart created: { id: '...', sessionId: 'ABC123' }
```

When you login, look for:
```
🔍 [CART SERVICE] mergeCartsOnLogin called
🔍 [CART SERVICE] sessionId: XYZ789  ← This should be ABC123!
🔍 [CART SERVICE] Session cart found: null  ← This is the problem!
```

### Step 2: Check Database

```sql
-- Check guest cart
SELECT * FROM Cart WHERE sessionId IS NOT NULL;

-- Check user cart
SELECT * FROM Cart WHERE userId = '<user-id>';

-- Check cart items
SELECT ci.*, c.userId, c.sessionId
FROM CartItem ci
JOIN Cart c ON ci.cartId = c.id
ORDER BY ci.createdAt DESC;
```

---

## 🚀 Recommended Fix (Backend Only)

I'll implement Option B - saving the old session ID before login. This requires NO frontend changes and will work immediately.
