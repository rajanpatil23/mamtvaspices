# 🚀 Deployment Quick Reference Card

## 📌 Essential Information - Keep This Handy!

---

## 🔗 Your URLs

### GitHub Repository
```
https://github.com/rajanpatil23/mamtvaspices.git
```

### Render Dashboard
```
https://dashboard.render.com
```

### After Deployment (Fill these in):
```
Backend:  https://________________________________.onrender.com
Frontend: https://________________________________.onrender.com
API Docs: https://________________________________.onrender.com/api-docs
```

---

## 🔐 Your Generated Secrets

**⚠️ SAVE THESE - You'll need them for Render deployment!**

```env
JWT_SECRET=708c4eae95df33ffc2a619fea9807025eeb687cc8304a7b79be62a83b82bdb36
REFRESH_TOKEN_SECRET=5a56d716ecd25d363e64e4abae16550e1af202c6811e9bcea580280b3845c517
SESSION_SECRET=8f4937ed116cbeb9934c48b3f05ea7ba778de129386f07a905603400c814048c
COOKIE_SECRET=ab9877e178c3344475f5107d5b19f2418f1d0157412deeee95b35dbb33fda01f
```

---

## 🎯 Quick Deployment Steps

### 1️⃣ Deploy Backend (5-10 min)
```
1. Go to Render Dashboard
2. New + → Web Service
3. Connect: mamtvaspices repo
4. Configure:
   - Name: mamtvaspices-backend
   - Root: src/server
   - Build: npm install && npx prisma generate
   - Start: npm start
5. Add environment variables (see below)
6. Create Web Service
7. SAVE YOUR BACKEND URL!
```

### 2️⃣ Run Migrations (2 min)
```
1. Backend service → Shell tab
2. Run: npx prisma migrate deploy
```

### 3️⃣ Deploy Frontend (5-10 min)
```
1. New + → Web Service
2. Connect: mamtvaspices repo
3. Configure:
   - Name: mamtvaspices-frontend
   - Root: src/client
   - Build: npm install && npm run build
   - Start: npm start
4. Add env: NEXT_PUBLIC_API_URL=<your-backend-url>
5. Create Web Service
```

### 4️⃣ Update CORS (2 min)
```
1. Backend → Environment
2. Update ALLOWED_ORIGINS with frontend URL
3. Save (auto-redeploys)
```

### 5️⃣ Seed Database (Optional, 2 min)
```
1. Backend → Shell
2. Run: npm run seed
```

---

## 📋 Backend Environment Variables

**Copy-paste these into Render (update YOUR values):**

```env
NODE_ENV=production
PORT=5000

# YOUR CREDENTIALS (Update these!)
DATABASE_URL=mysql://username:password@host:3306/database
REDIS_URL=your_upstash_redis_url

# GENERATED SECRETS (Use the ones above!)
JWT_SECRET=708c4eae95df33ffc2a619fea9807025eeb687cc8304a7b79be62a83b82bdb36
REFRESH_TOKEN_SECRET=5a56d716ecd25d363e64e4abae16550e1af202c6811e9bcea580280b3845c517
SESSION_SECRET=8f4937ed116cbeb9934c48b3f05ea7ba778de129386f07a905603400c814048c
COOKIE_SECRET=ab9877e178c3344475f5107d5b19f2418f1d0157412deeee95b35dbb33fda01f

# JWT & SESSION
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d
SESSION_MAX_AGE=604800000

# CORS (Update after frontend deployment!)
ALLOWED_ORIGINS=https://your-frontend-url.onrender.com
COOKIE_DOMAIN=.onrender.com
FRONTEND_URL=https://your-frontend-url.onrender.com

# OPTIONAL (Leave empty for now)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=
EMAIL_PASSWORD=
EMAIL_FROM=noreply@mamtvaspices.com
```

---

## 📋 Frontend Environment Variable

```env
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://your-backend-url.onrender.com
```

**⚠️ Replace with your actual backend URL!**

---

## 🧪 Test Accounts (After Seeding)

```
Superadmin:
  Email: superadmin@example.com
  Password: password123

Admin:
  Email: admin@example.com
  Password: password123

User:
  Email: user@example.com
  Password: password123
```

---

## ✅ Deployment Checklist

```
□ Backend deployed
□ Migrations run
□ Frontend deployed
□ CORS updated
□ Database seeded
□ Backend API tested
□ Frontend tested
□ Login tested
```

---

## 🆘 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| Backend won't start | Check DATABASE_URL and REDIS_URL |
| Frontend can't connect | Verify NEXT_PUBLIC_API_URL |
| CORS errors | Update ALLOWED_ORIGINS in backend |
| Build fails | Check Root Directory setting |
| Database errors | Run migrations in Shell |

---

## 📚 Documentation Files

1. **RENDER_DEPLOYMENT_CHECKLIST.md** ← Start here! Step-by-step guide
2. **RENDER_DEPLOYMENT_GUIDE.md** ← Detailed instructions
3. **DEPLOYMENT_SUCCESS_SUMMARY.md** ← Overview & next steps
4. **QUICK_START_DEPLOYMENT.md** ← Quick reference
5. **This file** ← Quick reference card

---

## 🎯 Success Criteria

Your deployment works when:

✅ Both services show "Live" in Render
✅ Frontend loads at your URL
✅ Can log in with test account
✅ Can view products
✅ Can add to cart
✅ No errors in browser console

---

## ⚠️ Remember

- **Free tier sleeps after 15 min** → First request takes 30-60 sec
- **Use UptimeRobot** to keep services awake (free)
- **Add Cloudinary later** for image uploads
- **Add Stripe later** for payments
- **Check logs** if something doesn't work

---

## 🎉 You're Ready!

1. Open **RENDER_DEPLOYMENT_CHECKLIST.md**
2. Follow steps 1-7
3. Test your deployment
4. Celebrate! 🎊

---

**Made with ❤️ for Mamtva Spices**

**Good luck! 🚀**
