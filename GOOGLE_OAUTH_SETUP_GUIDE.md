# 🔐 Google OAuth Login Setup Guide

## 📋 Overview

Your app has Google login functionality built-in, but it requires configuration. This guide will walk you through setting up Google OAuth so users can sign in with their Google accounts.

---

## ✅ What's Already Implemented

Your app already has:
- ✅ Google OAuth strategy configured (`src/server/src/infra/passport/passport.ts`)
- ✅ Google login routes (`/auth/google`, `/auth/google/callback`)
- ✅ Frontend "Sign in with Google" button
- ✅ Automatic user creation/linking
- ✅ Cart merging on login
- ✅ Token generation and cookie management

**What's Missing:** Google OAuth credentials (Client ID and Client Secret)

---

## 🚀 Setup Steps

### Step 1: Create Google Cloud Project

1. **Go to Google Cloud Console:**
   - Visit: https://console.cloud.google.com/

2. **Create a New Project:**
   - Click "Select a project" dropdown at the top
   - Click "New Project"
   - Enter project name: `YourAppName` (e.g., "Mamtva Spices Store")
   - Click "Create"

3. **Wait for project creation** (takes a few seconds)

---

### Step 2: Enable Google+ API

1. **Navigate to APIs & Services:**
   - In the left sidebar, click "APIs & Services" → "Library"

2. **Search for Google+ API:**
   - In the search bar, type "Google+ API"
   - Click on "Google+ API"
   - Click "Enable"

3. **Also enable (recommended):**
   - Search for "Google People API"
   - Click "Enable"

---

### Step 3: Configure OAuth Consent Screen

1. **Go to OAuth Consent Screen:**
   - Left sidebar → "APIs & Services" → "OAuth consent screen"

2. **Choose User Type:**
   - Select "External" (for public apps)
   - Click "Create"

3. **Fill in App Information:**
   ```
   App name: Your App Name (e.g., "Mamtva Spices Store")
   User support email: your-email@example.com
   App logo: (optional, upload your logo)
   
   Application home page: http://localhost:3000 (for development)
   
   Developer contact information:
   Email addresses: your-email@example.com
   ```

4. **Click "Save and Continue"**

5. **Scopes (Step 2):**
   - Click "Add or Remove Scopes"
   - Select these scopes:
     - `userinfo.email`
     - `userinfo.profile`
     - `openid`
   - Click "Update"
   - Click "Save and Continue"

6. **Test Users (Step 3):**
   - Add your email address for testing
   - Click "Add Users"
   - Enter your email
   - Click "Save and Continue"

7. **Summary (Step 4):**
   - Review and click "Back to Dashboard"

---

### Step 4: Create OAuth Credentials

1. **Go to Credentials:**
   - Left sidebar → "APIs & Services" → "Credentials"

2. **Create Credentials:**
   - Click "Create Credentials" → "OAuth client ID"

3. **Configure OAuth Client:**
   ```
   Application type: Web application
   
   Name: Your App OAuth Client (e.g., "Mamtva Store Web Client")
   
   Authorized JavaScript origins:
   - http://localhost:3000 (for development)
   - http://localhost:5000 (for backend)
   - https://yourdomain.com (for production)
   
   Authorized redirect URIs:
   - http://localhost:5000/api/auth/google/callback (development)
   - https://your-backend-url.com/api/auth/google/callback (production)
   ```

4. **Click "Create"**

5. **Save Your Credentials:**
   - A popup will show your:
     - **Client ID** (looks like: `123456789-abc123.apps.googleusercontent.com`)
     - **Client Secret** (looks like: `GOCSPX-abc123xyz789`)
   - **IMPORTANT:** Copy these immediately!
   - Click "Download JSON" (optional, for backup)

---

### Step 5: Configure Environment Variables

#### For Development (Local)

1. **Open your backend `.env` file:**
   ```bash
   cd src/server
   nano .env  # or use your preferred editor
   ```

2. **Add Google OAuth credentials:**
   ```env
   # Google OAuth
   GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your-client-secret-here
   GOOGLE_CALLBACK_URL_DEV=http://localhost:5000/api/auth/google/callback
   GOOGLE_CALLBACK_URL_PROD=https://your-production-backend.com/api/auth/google/callback
   
   # Make sure these are also set
   CLIENT_URL_DEV=http://localhost:3000
   CLIENT_URL_PROD=https://your-production-frontend.com
   NODE_ENV=development
   ```

3. **Save the file**

#### For Production (Render/Vercel/etc.)

1. **Go to your hosting platform's dashboard**

2. **Add Environment Variables:**
   ```
   GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your-client-secret-here
   GOOGLE_CALLBACK_URL_PROD=https://your-backend.com/api/auth/google/callback
   CLIENT_URL_PROD=https://your-frontend.com
   NODE_ENV=production
   ```

---

### Step 6: Update Authorized Redirect URIs (Production)

When you deploy to production:

1. **Go back to Google Cloud Console:**
   - Navigate to "Credentials"
   - Click on your OAuth 2.0 Client ID

2. **Add Production URLs:**
   ```
   Authorized JavaScript origins:
   - https://your-frontend-domain.com
   - https://your-backend-domain.com
   
   Authorized redirect URIs:
   - https://your-backend-domain.com/api/auth/google/callback
   ```

3. **Click "Save"**

---

### Step 7: Restart Your Server

```bash
# Stop your server (Ctrl+C)

# Restart
cd src/server
npm run dev
```

You should see:
```
✅ Google OAuth configured successfully
```

If credentials are missing, you'll see:
```
⚠️  Google OAuth credentials not set — Google login will not work.
```

---

## 🧪 Testing Google Login

### Test Locally

1. **Start your servers:**
   ```bash
   # Terminal 1 - Backend
   cd src/server
   npm run dev
   
   # Terminal 2 - Frontend
   cd src/client
   npm run dev
   ```

2. **Open your app:**
   - Go to: http://localhost:3000/sign-in

3. **Click "Sign in with Google"**

4. **Expected Flow:**
   ```
   1. Redirects to Google login page
   2. You select/login with your Google account
   3. Google asks for permission (first time only)
   4. Redirects back to your app
   5. You're logged in!
   ```

5. **Check the database:**
   ```bash
   cd src/server
   npx prisma studio
   ```
   - Open "User" table
   - You should see your user with `googleId` filled

---

## 🔍 Troubleshooting

### Error: "redirect_uri_mismatch"

**Problem:** The callback URL doesn't match what's configured in Google Cloud Console.

**Solution:**
1. Check your `.env` file:
   ```env
   GOOGLE_CALLBACK_URL_DEV=http://localhost:5000/api/auth/google/callback
   ```

2. Check Google Cloud Console:
   - Go to Credentials → Your OAuth Client
   - Ensure "Authorized redirect URIs" includes:
     ```
     http://localhost:5000/api/auth/google/callback
     ```

3. Make sure they match EXACTLY (including http/https, port, path)

---

### Error: "Access blocked: This app's request is invalid"

**Problem:** OAuth consent screen not configured properly.

**Solution:**
1. Go to "OAuth consent screen" in Google Cloud Console
2. Make sure status is "Testing" or "Published"
3. Add your email to "Test users" if status is "Testing"
4. Verify all required fields are filled

---

### Error: "Google OAuth credentials not set"

**Problem:** Environment variables not loaded.

**Solution:**
1. Check `.env` file exists in `src/server/`
2. Verify credentials are correct:
   ```bash
   cd src/server
   cat .env | grep GOOGLE
   ```
3. Restart server after adding credentials

---

### Button clicks but nothing happens

**Problem:** Frontend can't reach backend.

**Solution:**
1. Check `src/client/app/lib/constants/config.ts`:
   ```typescript
   export const AUTH_API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
   ```

2. Verify backend is running on port 5000:
   ```bash
   curl http://localhost:5000/api/auth/google
   ```

3. Check browser console for errors

---

### User created but no email

**Problem:** Google account doesn't have public email.

**Solution:**
1. In Google Cloud Console → OAuth consent screen
2. Make sure `userinfo.email` scope is added
3. User needs to grant email permission

---

## 📊 How It Works

### Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    GOOGLE OAUTH FLOW                         │
└─────────────────────────────────────────────────────────────┘

1. USER CLICKS "SIGN IN WITH GOOGLE"
   │
   ↓
2. FRONTEND REDIRECTS TO:
   http://localhost:5000/api/auth/google
   │
   ↓
3. BACKEND (Passport) REDIRECTS TO:
   https://accounts.google.com/o/oauth2/v2/auth?
     client_id=YOUR_CLIENT_ID
     redirect_uri=http://localhost:5000/api/auth/google/callback
     scope=profile email
   │
   ↓
4. USER LOGS IN TO GOOGLE
   │
   ↓
5. GOOGLE REDIRECTS BACK TO:
   http://localhost:5000/api/auth/google/callback?code=AUTH_CODE
   │
   ↓
6. BACKEND EXCHANGES CODE FOR USER INFO
   │
   ↓
7. BACKEND CHECKS DATABASE:
   ├─ User exists? → Link Google ID
   └─ New user? → Create user with Google ID
   │
   ↓
8. BACKEND GENERATES TOKENS:
   ├─ Access Token
   └─ Refresh Token
   │
   ↓
9. BACKEND SETS COOKIES & REDIRECTS TO:
   http://localhost:3000 (frontend)
   │
   ↓
10. USER IS LOGGED IN! ✅
```

---

## 🔐 Security Best Practices

### 1. Keep Credentials Secret

```bash
# ❌ NEVER commit to Git
.env

# ✅ Add to .gitignore
echo ".env" >> .gitignore
```

### 2. Use Different Credentials for Dev/Prod

```env
# Development
GOOGLE_CLIENT_ID=dev-client-id
GOOGLE_CLIENT_SECRET=dev-secret

# Production (different credentials)
GOOGLE_CLIENT_ID=prod-client-id
GOOGLE_CLIENT_SECRET=prod-secret
```

### 3. Restrict Authorized Domains

In Google Cloud Console:
```
Development:
- http://localhost:3000
- http://localhost:5000

Production:
- https://yourdomain.com only
```

### 4. Monitor OAuth Usage

- Check Google Cloud Console → "APIs & Services" → "Dashboard"
- Monitor for unusual activity
- Set up alerts for quota limits

---

## 📝 Environment Variables Checklist

Make sure these are set in your `.env` file:

```env
# ✅ Required for Google OAuth
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret

# ✅ Required for callbacks
GOOGLE_CALLBACK_URL_DEV=http://localhost:5000/api/auth/google/callback
GOOGLE_CALLBACK_URL_PROD=https://your-backend.com/api/auth/google/callback

# ✅ Required for redirects
CLIENT_URL_DEV=http://localhost:3000
CLIENT_URL_PROD=https://your-frontend.com

# ✅ Required for environment detection
NODE_ENV=development  # or 'production'

# ✅ Required for JWT tokens
JWT_SECRET=your-jwt-secret-key
JWT_REFRESH_SECRET=your-refresh-secret-key

# ✅ Required for database
DATABASE_URL=mysql://user:password@localhost:3306/database
```

---

## 🎯 Quick Setup Summary

**For the impatient:**

1. **Google Cloud Console** → Create project
2. **Enable APIs** → Google+ API, People API
3. **OAuth Consent Screen** → Configure app info
4. **Credentials** → Create OAuth Client ID
5. **Copy credentials** → Client ID & Secret
6. **Add to `.env`:**
   ```env
   GOOGLE_CLIENT_ID=your-id
   GOOGLE_CLIENT_SECRET=your-secret
   GOOGLE_CALLBACK_URL_DEV=http://localhost:5000/api/auth/google/callback
   ```
7. **Restart server** → `npm run dev`
8. **Test** → Click "Sign in with Google"

---

## 🌐 Production Deployment

### Before Deploying:

1. **Create production OAuth credentials** (separate from dev)
2. **Update authorized URLs** in Google Cloud Console
3. **Set production environment variables** on hosting platform
4. **Test thoroughly** in staging environment
5. **Monitor logs** after deployment

### Production Checklist:

```
□ Production OAuth Client ID created
□ Production callback URL added to Google Console
□ Production environment variables set
□ HTTPS enabled on both frontend and backend
□ Cookies configured for production domain
□ CORS configured correctly
□ Error logging enabled
□ User tested successfully
```

---

## 📞 Need Help?

### Common Issues:

1. **"Invalid credentials"** → Check Client ID/Secret are correct
2. **"Redirect URI mismatch"** → URLs must match exactly
3. **"Access blocked"** → Add email to test users
4. **"Cannot read properties of undefined"** → Check environment variables loaded

### Debug Mode:

Add to your backend:
```typescript
console.log('Google OAuth Config:', {
  clientId: process.env.GOOGLE_CLIENT_ID?.substring(0, 10) + '...',
  hasSecret: !!process.env.GOOGLE_CLIENT_SECRET,
  callbackUrl: process.env.GOOGLE_CALLBACK_URL_DEV
});
```

---

## ✅ Success Indicators

You'll know it's working when:

1. ✅ Server starts without warnings
2. ✅ "Sign in with Google" button redirects to Google
3. ✅ After Google login, redirects back to your app
4. ✅ User is logged in (check cookies in browser DevTools)
5. ✅ User appears in database with `googleId`
6. ✅ Cart merges correctly if user had items before login

---

## 🎉 You're Done!

Your Google OAuth login is now configured and ready to use!

**Next Steps:**
- Set up Facebook OAuth (similar process)
- Set up Twitter OAuth (similar process)
- Configure production credentials before deploying
- Test with multiple Google accounts
- Monitor usage in Google Cloud Console

**Documentation:**
- Google OAuth 2.0: https://developers.google.com/identity/protocols/oauth2
- Passport.js Google Strategy: http://www.passportjs.org/packages/passport-google-oauth20/
