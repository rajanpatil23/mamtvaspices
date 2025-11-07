# Render Deployment Guide - Complete Setup

This guide will help you deploy both the frontend (Next.js) and backend (Express.js) to Render using a single GitHub repository.

---

## Prerequisites

✅ GitHub repository with your code pushed
✅ Render account (free tier available)
✅ MySQL database on Hostinger (you have this)
✅ Upstash Redis account (you have this)
✅ Cloudinary account (for image uploads)
✅ Stripe account (for payments)

---

## Deployment Architecture

```
GitHub Repository (Single Repo)
    ↓
Render Platform
    ├── Service 1: Backend (Express.js) - src/server/
    └── Service 2: Frontend (Next.js) - src/client/
    
External Services:
    ├── MySQL Database (Hostinger)
    ├── Redis (Upstash)
    ├── Cloudinary (Images)
    └── Stripe (Payments)
```

---

## Step 1: Sign Up for Render

1. Go to [https://render.com](https://render.com)
2. Click "Get Started for Free"
3. Sign up with GitHub (recommended for easy integration)
4. Authorize Render to access your repositories

---

## Step 2: Deploy Backend Service (Express.js)

### 2.1 Create New Web Service

1. Click "New +" → "Web Service"
2. Connect your GitHub repository
3. Select your repository from the list

### 2.2 Configure Backend Service

**Basic Settings:**
- **Name:** `ecommerce-backend` (or your preferred name)
- **Region:** Oregon (US West) - Free tier available
- **Branch:** `main`
- **Root Directory:** `src/server`
- **Environment:** `Node`
- **Build Command:** 
  ```bash
  npm install && npx prisma generate
  ```
- **Start Command:**
  ```bash
  npm start
  ```

**Instance Type:**
- Select: **Free** (512 MB RAM, sleeps after 15 min inactivity)

### 2.3 Add Environment Variables for Backend

Click "Advanced" → "Add Environment Variable" and add these:

#### Required Variables:

```env
NODE_ENV=production
PORT=5000

# Database - Your Hostinger MySQL
DATABASE_URL=mysql://your_username:your_password@your_host:3306/your_database

# Redis - Your Upstash Redis
REDIS_URL=your_upstash_redis_url

# JWT Secrets (Generate strong random strings)
JWT_SECRET=your_strong_random_string_here
REFRESH_TOKEN_SECRET=another_strong_random_string
SESSION_SECRET=session_random_string
COOKIE_SECRET=cookie_random_string

# CORS - Will update after frontend is deployed
ALLOWED_ORIGINS=https://your-frontend-url.onrender.com
COOKIE_DOMAIN=.onrender.com

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret

# Stripe
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
```

**How to generate strong secrets:**
```bash
# In terminal, run:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 2.4 Deploy Backend

1. Click "Create Web Service"
2. Wait for deployment (5-10 minutes)
3. Once deployed, note your backend URL: `https://ecommerce-backend.onrender.com`

### 2.5 Test Backend

Visit: `https://your-backend-url.onrender.com/api/v1/health`

You should see a health check response.

---

## Step 3: Deploy Frontend Service (Next.js)

### 3.1 Create New Web Service

1. Click "New +" → "Web Service"
2. Select the same GitHub repository
3. Click "Connect"

### 3.2 Configure Frontend Service

**Basic Settings:**
- **Name:** `ecommerce-frontend` (or your preferred name)
- **Region:** Oregon (US West)
- **Branch:** `main`
- **Root Directory:** `src/client`
- **Environment:** `Node`
- **Build Command:**
  ```bash
  npm install && npm run build
  ```
- **Start Command:**
  ```bash
  npm start
  ```

**Instance Type:**
- Select: **Free**

### 3.3 Add Environment Variables for Frontend

```env
NODE_ENV=production

# Backend API URL (use your backend URL from Step 2.4)
NEXT_PUBLIC_API_URL=https://ecommerce-backend.onrender.com
```

### 3.4 Deploy Frontend

1. Click "Create Web Service"
2. Wait for deployment (5-10 minutes)
3. Once deployed, note your frontend URL: `https://ecommerce-frontend.onrender.com`

---

## Step 4: Update Backend CORS Settings

Now that you have your frontend URL, update the backend environment variables:

1. Go to your backend service in Render dashboard
2. Click "Environment"
3. Update `ALLOWED_ORIGINS`:
   ```
   https://ecommerce-frontend.onrender.com
   ```
4. Click "Save Changes"
5. Service will automatically redeploy

---

## Step 5: Run Database Migrations (Important!)

Since Render doesn't automatically run Prisma migrations, you need to do this manually:

### Option 1: Using Render Shell (Recommended)

1. Go to your backend service
2. Click "Shell" tab
3. Run:
   ```bash
   cd src/server
   npx prisma migrate deploy
   ```

### Option 2: Add to Build Command

Update your backend build command to:
```bash
npm install && npx prisma generate && npx prisma migrate deploy
```

**Note:** This will run migrations on every deployment.

---

## Step 6: Seed the Database (Optional)

To add test data:

1. Go to backend service → Shell
2. Run:
   ```bash
   cd src/server
   npm run seed
   ```

This will create:
- Superadmin account: `superadmin@example.com` / `password123`
- Admin account: `admin@example.com` / `password123`
- User account: `user@example.com` / `password123`
- Sample products and categories

---

## Step 7: Configure Custom Domains (Optional)

### For Backend:
1. Go to backend service → Settings
2. Click "Custom Domain"
3. Add: `api.yourdomain.com`
4. Follow DNS configuration instructions

### For Frontend:
1. Go to frontend service → Settings
2. Click "Custom Domain"
3. Add: `yourdomain.com` or `www.yourdomain.com`
4. Follow DNS configuration instructions

**Update environment variables after adding custom domains:**
- Backend `ALLOWED_ORIGINS`: `https://yourdomain.com`
- Backend `COOKIE_DOMAIN`: `.yourdomain.com`
- Frontend `NEXT_PUBLIC_API_URL`: `https://api.yourdomain.com`

---

## Step 8: Test Your Deployment

### Test Backend:
1. Visit: `https://your-backend-url.onrender.com/api-docs`
2. You should see Swagger API documentation
3. Test endpoints

### Test Frontend:
1. Visit: `https://your-frontend-url.onrender.com`
2. Browse products
3. Try signing in with test accounts
4. Test cart and checkout

---

## Important Notes

### Free Tier Limitations:
- ⚠️ Services sleep after 15 minutes of inactivity
- ⚠️ First request after sleep takes 30-60 seconds (cold start)
- ⚠️ 750 hours/month per service (enough for 1 service 24/7)
- ⚠️ 512 MB RAM per service

### To Prevent Sleep:
1. Use a service like [UptimeRobot](https://uptimerobot.com) (free)
2. Ping your backend every 10 minutes
3. Or upgrade to paid plan ($7/month per service)

### Database Connection:
- Ensure your Hostinger MySQL allows connections from Render IPs
- Check firewall settings if connection fails

### Redis Connection:
- Upstash Redis works globally
- No special configuration needed

---

## Troubleshooting

### Build Fails:

**Check:**
1. Root directory is set correctly (`src/server` or `src/client`)
2. All dependencies are in `package.json`
3. Build command is correct
4. Check build logs for specific errors

### Backend Can't Connect to Database:

**Solutions:**
1. Verify `DATABASE_URL` format: `mysql://user:pass@host:3306/db`
2. Check Hostinger firewall allows external connections
3. Test connection locally first
4. Check MySQL user has remote access permissions

### Frontend Can't Connect to Backend:

**Solutions:**
1. Verify `NEXT_PUBLIC_API_URL` is correct
2. Check CORS settings in backend
3. Ensure backend is running (check logs)
4. Test backend URL directly in browser

### Service Keeps Crashing:

**Check:**
1. Environment variables are set correctly
2. No missing required variables
3. Check service logs for errors
4. Verify database connection

### Prisma Errors:

**Solutions:**
1. Run `npx prisma generate` in build command
2. Run `npx prisma migrate deploy` after deployment
3. Check `DATABASE_URL` format
4. Ensure schema.prisma is correct

---

## Monitoring and Logs

### View Logs:
1. Go to service in Render dashboard
2. Click "Logs" tab
3. Monitor real-time logs
4. Filter by log level

### Metrics:
1. Click "Metrics" tab
2. View CPU, memory, and bandwidth usage
3. Monitor response times

---

## Updating Your Application

### Automatic Deployments:

Render automatically deploys when you push to GitHub:

```bash
# Make changes locally
git add .
git commit -m "Update feature"
git push origin main

# Render automatically detects and deploys
```

### Manual Deployment:

1. Go to service in Render dashboard
2. Click "Manual Deploy"
3. Select branch
4. Click "Deploy"

---

## Cost Optimization

### Free Tier Strategy:
- Use free tier for both services (1500 hours total)
- Services sleep after 15 min inactivity
- Good for development and low-traffic sites

### Paid Tier ($7/month per service):
- No sleeping
- Better performance
- More RAM (512 MB → 2 GB+)
- Recommended for production

---

## Security Checklist

✅ All `.env` files are in `.gitignore`
✅ Environment variables set in Render dashboard (not in code)
✅ Strong random secrets for JWT and sessions
✅ CORS properly configured
✅ HTTPS enabled (automatic on Render)
✅ Database credentials secure
✅ API keys not exposed in frontend code

---

## Next Steps

1. ✅ Set up monitoring (UptimeRobot)
2. ✅ Configure custom domain
3. ✅ Set up email notifications for deployments
4. ✅ Add health check endpoints
5. ✅ Set up error tracking (Sentry)
6. ✅ Configure CDN for static assets
7. ✅ Set up automated backups

---

## Support Resources

- **Render Docs:** https://render.com/docs
- **Render Community:** https://community.render.com
- **Prisma Docs:** https://www.prisma.io/docs
- **Next.js Docs:** https://nextjs.org/docs

---

## Quick Reference

### Backend URL Structure:
```
https://ecommerce-backend.onrender.com/api/v1/
├── /health          - Health check
├── /api-docs        - API documentation
├── /auth            - Authentication
├── /products        - Products
├── /cart            - Shopping cart
├── /orders          - Orders
└── /graphql         - GraphQL endpoint
```

### Frontend URL:
```
https://ecommerce-frontend.onrender.com
```

---

## Congratulations! 🎉

Your e-commerce platform is now deployed on Render with:
- ✅ Backend API running
- ✅ Frontend application running
- ✅ MySQL database connected (Hostinger)
- ✅ Redis cache connected (Upstash)
- ✅ Automatic deployments from GitHub
- ✅ HTTPS enabled
- ✅ Free hosting

Your application is live and ready to use!
