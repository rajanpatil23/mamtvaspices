# Quick Start: Push to GitHub & Deploy to Render

## 🚀 Step-by-Step Commands

### 1️⃣ Push to GitHub (Run these commands in order)

Open terminal in project root (`c:/code/mig`) and run:

```bash
# Initialize Git repository
git init

# Add all files (respects .gitignore)
git add .

# Create first commit
git commit -m "Initial commit: E-commerce platform ready for deployment"

# Add your GitHub repository (replace with your actual repo URL)
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO-NAME.git

# Rename branch to main
git branch -M main

# Push to GitHub
git push -u origin main
```

**⚠️ Replace `YOUR-USERNAME` and `YOUR-REPO-NAME` with your actual GitHub details!**

Example:
```bash
git remote add origin https://github.com/johndoe/my-ecommerce.git
```

---

### 2️⃣ Verify on GitHub

1. Go to your GitHub repository URL
2. **CRITICAL CHECK:** Ensure `.env` files are NOT visible
3. Verify all code is uploaded

---

### 3️⃣ Deploy to Render

#### Backend Service:

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name:** `ecommerce-backend`
   - **Root Directory:** `src/server`
   - **Build Command:** `npm install && npx prisma generate`
   - **Start Command:** `npm start`
   - **Plan:** Free

5. Add Environment Variables (click "Advanced"):
   ```
   NODE_ENV=production
   PORT=5000
   DATABASE_URL=your_hostinger_mysql_url
   REDIS_URL=your_upstash_redis_url
   JWT_SECRET=generate_random_string
   REFRESH_TOKEN_SECRET=generate_random_string
   SESSION_SECRET=generate_random_string
   COOKIE_SECRET=generate_random_string
   ALLOWED_ORIGINS=https://your-frontend-url.onrender.com
   CLOUDINARY_CLOUD_NAME=your_cloudinary_name
   CLOUDINARY_API_KEY=your_cloudinary_key
   CLOUDINARY_API_SECRET=your_cloudinary_secret
   STRIPE_SECRET_KEY=your_stripe_key
   ```

6. Click "Create Web Service"
7. Wait 5-10 minutes for deployment
8. **Copy your backend URL:** `https://ecommerce-backend.onrender.com`

#### Frontend Service:

1. Click "New +" → "Web Service"
2. Select same repository
3. Configure:
   - **Name:** `ecommerce-frontend`
   - **Root Directory:** `src/client`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Plan:** Free

4. Add Environment Variable:
   ```
   NEXT_PUBLIC_API_URL=https://ecommerce-backend.onrender.com
   ```
   (Use your actual backend URL from step 8 above)

5. Click "Create Web Service"
6. Wait 5-10 minutes for deployment
7. **Your app is live!** 🎉

---

### 4️⃣ Update Backend CORS

1. Go to backend service → Environment
2. Update `ALLOWED_ORIGINS` with your frontend URL
3. Save (auto-redeploys)

---

### 5️⃣ Run Database Migrations

1. Go to backend service → Shell
2. Run:
   ```bash
   npx prisma migrate deploy
   ```

---

### 6️⃣ Seed Database (Optional)

In backend Shell:
```bash
npm run seed
```

Test accounts created:
- `superadmin@example.com` / `password123`
- `admin@example.com` / `password123`
- `user@example.com` / `password123`

---

## 📝 Important URLs

After deployment, save these:

- **Frontend:** `https://ecommerce-frontend.onrender.com`
- **Backend API:** `https://ecommerce-backend.onrender.com/api/v1`
- **API Docs:** `https://ecommerce-backend.onrender.com/api-docs`

---

## 🔧 Generate Random Secrets

Run this in terminal to generate secure secrets:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Run it 4 times for:
1. JWT_SECRET
2. REFRESH_TOKEN_SECRET
3. SESSION_SECRET
4. COOKIE_SECRET

---

## ⚠️ Common Issues

### "Authentication failed" when pushing to GitHub:
- Use Personal Access Token instead of password
- Or use GitHub CLI: `gh auth login`

### ".env files are visible on GitHub":
```bash
git rm --cached .env
git rm --cached src/server/.env
git rm --cached src/client/.env.local
git commit -m "Remove .env files"
git push
```

### "Build failed on Render":
- Check Root Directory is correct
- Verify Build Command
- Check logs for specific errors

### "Can't connect to database":
- Verify DATABASE_URL format
- Check Hostinger allows external connections
- Test connection locally first

---

## 📚 Full Documentation

For detailed guides, see:
- `GITHUB_DEPLOYMENT_GUIDE.md` - Complete GitHub setup
- `RENDER_DEPLOYMENT_GUIDE.md` - Complete Render deployment
- `render.yaml` - Infrastructure as code

---

## ✅ Deployment Checklist

- [ ] `.gitignore` file created
- [ ] `.env.example` files created
- [ ] Code pushed to GitHub
- [ ] `.env` files NOT visible on GitHub
- [ ] Backend service created on Render
- [ ] Frontend service created on Render
- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] Database seeded (optional)
- [ ] CORS updated with frontend URL
- [ ] Both services deployed successfully
- [ ] Application tested and working

---

## 🎉 Success!

Your e-commerce platform is now:
- ✅ Version controlled on GitHub
- ✅ Deployed on Render (free tier)
- ✅ Using MySQL on Hostinger
- ✅ Using Redis on Upstash
- ✅ Automatically deploys on git push
- ✅ HTTPS enabled
- ✅ Ready for production!

**Next Steps:**
1. Set up custom domain (optional)
2. Configure monitoring (UptimeRobot)
3. Set up error tracking (Sentry)
4. Add analytics (Google Analytics)
