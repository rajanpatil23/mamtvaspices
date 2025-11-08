# 🚀 Render Deployment Checklist - Step by Step

## 📋 Pre-Deployment Information

### ✅ GitHub Repository
**URL:** https://github.com/rajanpatil23/mamtvaspices.git
**Branch:** main
**Status:** ✅ Code pushed successfully (883 files)

### 🔐 Generated Secrets (SAVE THESE!)
```
JWT_SECRET=708c4eae95df33ffc2a619fea9807025eeb687cc8304a7b79be62a83b82bdb36
REFRESH_TOKEN_SECRET=5a56d716ecd25d363e64e4abae16550e1af202c6811e9bcea580280b3845c517
SESSION_SECRET=8f4937ed116cbeb9934c48b3f05ea7ba778de129386f07a905603400c814048c
COOKIE_SECRET=ab9877e178c3344475f5107d5b19f2418f1d0157412deeee95b35dbb33fda01f
```

---

## 🎯 STEP 1: Deploy Backend Service

### 1.1 Create Backend Service

1. Go to: https://dashboard.render.com
2. Click **"New +"** button (top right)
3. Select **"Web Service"**
4. Click **"Build and deploy from a Git repository"** → **Next**

### 1.2 Connect Repository

- If first time: Click **"Connect GitHub"** and authorize Render
- Search for: `mamtvaspices`
- Click **"Connect"** next to your repository

### 1.3 Configure Backend Service

Fill in these settings:

| Field | Value |
|-------|-------|
| **Name** | `mamtvaspices-backend` |
| **Region** | Oregon (US West) or closest to you |
| **Branch** | `main` |
| **Root Directory** | `src/server` |
| **Runtime** | `Node` |
| **Build Command** | `npm install && npx prisma generate` |
| **Start Command** | `npm start` |
| **Instance Type** | `Free` |

**⚠️ IMPORTANT: When asked for "Language/Runtime Environment":**
- Select: **Node**
- Render will auto-detect Node.js from package.json
- If it asks for version, it will use the version from your package.json or default to latest LTS

### 1.4 Add Environment Variables

Click **"Advanced"** → **"Add Environment Variable"**

Add these variables one by one:

```env
# Node Environment
NODE_ENV=production
PORT=5000

# Database (YOUR HOSTINGER MYSQL)
DATABASE_URL=mysql://your_username:your_password@your_host:3306/your_database

# Redis (YOUR UPSTASH REDIS)
REDIS_URL=your_upstash_redis_url

# Security Secrets (USE THE GENERATED ONES ABOVE)
JWT_SECRET=708c4eae95df33ffc2a619fea9807025eeb687cc8304a7b79be62a83b82bdb36
REFRESH_TOKEN_SECRET=5a56d716ecd25d363e64e4abae16550e1af202c6811e9bcea580280b3845c517
SESSION_SECRET=8f4937ed116cbeb9934c48b3f05ea7ba778de129386f07a905603400c814048c
COOKIE_SECRET=ab9877e178c3344475f5107d5b19f2418f1d0157412deeee95b35dbb33fda01f

# JWT Configuration
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d

# Session Configuration
SESSION_MAX_AGE=604800000

# CORS (Will update after frontend deployment)
ALLOWED_ORIGINS=http://localhost:3000
COOKIE_DOMAIN=localhost

# Email (Optional - can add later)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
EMAIL_FROM=noreply@mamtvaspices.com

# Cloudinary (Leave empty for now - add later)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Stripe (Leave empty for now - add later)
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PUBLISHABLE_KEY=

# Frontend URL (Will update after frontend deployment)
FRONTEND_URL=http://localhost:3000
```

### 1.5 Deploy Backend

1. Click **"Create Web Service"**
2. Wait for deployment (5-10 minutes)
3. Watch the logs for any errors
4. **IMPORTANT:** Copy your backend URL when deployment succeeds
   - Format: `https://mamtvaspices-backend.onrender.com`
   - **SAVE THIS URL!** You'll need it for frontend

### 1.6 Verify Backend Deployment

- [ ] Deployment status shows "Live"
- [ ] No errors in logs
- [ ] Copy backend URL: `_______________________________`

---

## 🎯 STEP 2: Run Database Migrations

### 2.1 Access Backend Shell

1. Go to your backend service dashboard
2. Click **"Shell"** tab (top menu)
3. Wait for shell to connect

### 2.2 Run Migrations

In the shell, run:
```bash
npx prisma migrate deploy
```

Wait for migrations to complete. You should see:
```
✓ Migrations applied successfully
```

### 2.3 Verify Database

Run this to check:
```bash
npx prisma db pull
```

Should show your database schema is synced.

- [ ] Migrations completed successfully
- [ ] No errors in migration logs

---

## 🎯 STEP 3: Deploy Frontend Service

### 3.1 Create Frontend Service

1. Go back to: https://dashboard.render.com
2. Click **"New +"** → **"Web Service"**
3. Select your repository: `mamtvaspices`
4. Click **"Connect"**

### 3.2 Configure Frontend Service

Fill in these settings:

| Field | Value |
|-------|-------|
| **Name** | `mamtvaspices-frontend` |
| **Region** | Oregon (US West) - **SAME AS BACKEND** |
| **Branch** | `main` |
| **Root Directory** | `src/client` |
| **Runtime** | `Node` |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm start` |
| **Instance Type** | `Free` |

**⚠️ IMPORTANT: When asked for "Language/Runtime Environment":**
- Select: **Node**
- Render will auto-detect Next.js from package.json

### 3.3 Add Frontend Environment Variable

Click **"Advanced"** → **"Add Environment Variable"**

Add this variable (use YOUR backend URL from Step 1.6):

```env
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://mamtvaspices-backend.onrender.com
```

**IMPORTANT:** Replace `mamtvaspices-backend.onrender.com` with your actual backend URL!

### 3.4 Deploy Frontend

1. Click **"Create Web Service"**
2. Wait for deployment (5-10 minutes)
3. Watch the logs for any errors
4. **Copy your frontend URL when deployment succeeds**
   - Format: `https://mamtvaspices-frontend.onrender.com`

### 3.5 Verify Frontend Deployment

- [ ] Deployment status shows "Live"
- [ ] No errors in logs
- [ ] Copy frontend URL: `_______________________________`

---

## 🎯 STEP 4: Update Backend CORS Settings

### 4.1 Update Environment Variables

1. Go to backend service dashboard
2. Click **"Environment"** tab
3. Find and update these variables:

```env
ALLOWED_ORIGINS=https://your-frontend-url.onrender.com
COOKIE_DOMAIN=.onrender.com
FRONTEND_URL=https://your-frontend-url.onrender.com
```

**Replace with your actual frontend URL!**

4. Click **"Save Changes"**
5. Backend will automatically redeploy (2-3 minutes)

- [ ] CORS settings updated
- [ ] Backend redeployed successfully

---

## 🎯 STEP 5: Seed Database (Optional)

### 5.1 Access Backend Shell

1. Go to backend service → **"Shell"** tab
2. Run seeding command:

```bash
npm run seed
```

This creates test accounts:
- Superadmin: `superadmin@example.com` / `password123`
- Admin: `admin@example.com` / `password123`
- User: `user@example.com` / `password123`

- [ ] Database seeded successfully
- [ ] Test accounts created

---

## 🎯 STEP 6: Test Your Deployment

### 6.1 Test Backend API

Open in browser:
```
https://your-backend-url.onrender.com/api/v1/health
```

Should return: `{"status": "ok"}` or similar

### 6.2 Test API Documentation

Open in browser:
```
https://your-backend-url.onrender.com/api-docs
```

Should show Swagger documentation

### 6.3 Test Frontend

Open in browser:
```
https://your-frontend-url.onrender.com
```

Should show Mamtva Spices homepage

### 6.4 Test Authentication

1. Go to frontend URL
2. Click "Sign In"
3. Try logging in with test account:
   - Email: `user@example.com`
   - Password: `password123`

### 6.5 Test Basic Features

- [ ] Homepage loads correctly
- [ ] Can view products
- [ ] Can add items to cart
- [ ] Can view cart
- [ ] Authentication works

---

## 🎯 STEP 7: Monitor and Troubleshoot

### 7.1 Check Logs

If something doesn't work:

1. Go to service dashboard
2. Click **"Logs"** tab
3. Look for errors (red text)
4. Common issues:
   - Database connection errors → Check DATABASE_URL
   - Redis connection errors → Check REDIS_URL
   - CORS errors → Check ALLOWED_ORIGINS
   - Build errors → Check Build Command

### 7.2 Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| **Backend won't start** | Check DATABASE_URL and REDIS_URL are correct |
| **Frontend can't connect** | Verify NEXT_PUBLIC_API_URL matches backend URL |
| **CORS errors** | Update ALLOWED_ORIGINS in backend |
| **Database errors** | Run migrations again in Shell |
| **Build fails** | Check Root Directory is correct |

---

## ✅ Deployment Complete Checklist

- [ ] Backend service deployed and running
- [ ] Frontend service deployed and running
- [ ] Database migrations completed
- [ ] Database seeded (optional)
- [ ] CORS configured correctly
- [ ] Backend API accessible
- [ ] Frontend loads correctly
- [ ] Authentication works
- [ ] Basic features tested

---

## 📝 Your Deployment URLs

Fill these in as you complete deployment:

```
Backend API: https://________________________________.onrender.com
Frontend: https://________________________________.onrender.com
API Docs: https://________________________________.onrender.com/api-docs
GraphQL: https://________________________________.onrender.com/api/v1/graphql
```

---

## 🎉 Success Criteria

Your deployment is successful when:

✅ Both services show "Live" status
✅ Frontend loads without errors
✅ Can log in with test account
✅ Can view products
✅ Can add items to cart
✅ No CORS errors in browser console

---

## ⚠️ Important Notes

### Free Tier Limitations:
- Services sleep after 15 minutes of inactivity
- First request after sleep takes 30-60 seconds
- 750 hours/month per service
- 512 MB RAM per service

### To Prevent Sleep:
Use [UptimeRobot](https://uptimerobot.com) (free) to ping your backend every 10 minutes

### Missing Features (Add Later):
- **Image Uploads:** Need Cloudinary credentials
- **Payments:** Need Stripe credentials
- **Email:** Need SMTP credentials

---

## 🆘 Need Help?

If you encounter issues:

1. Check the logs in Render dashboard
2. Verify all environment variables are correct
3. Ensure DATABASE_URL and REDIS_URL are accessible
4. Check RENDER_DEPLOYMENT_GUIDE.md for detailed troubleshooting
5. Test database connection from your local machine first

---

## 📞 Support Resources

- Render Docs: https://render.com/docs
- Render Community: https://community.render.com
- Render Status: https://status.render.com

---

**Good luck with your deployment! 🚀**

**Made with ❤️ for Mamtva Spices**
