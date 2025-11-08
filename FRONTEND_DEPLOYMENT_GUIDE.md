# 🎨 Frontend Deployment Guide - Render

## 🚀 Deploy Next.js Frontend on Render

While your backend is building, let's deploy the frontend!

---

## 📋 Step-by-Step Instructions

### **Step 1: Create New Web Service**

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"Web Service"**
3. Select your GitHub repository: **`mamtvaspices`**
4. Click **"Connect"**

---

### **Step 2: Configure Service Settings**

Fill in these details:

```
Name: mamtvaspices-frontend
Region: Singapore (or closest to you)
Branch: main
Root Directory: src/client
Runtime: Node
```

---

### **Step 3: Build & Start Commands**

```
Build Command: npm install && npm run build

Start Command: npm start
```

---

### **Step 4: Instance Type**

```
Instance Type: Free
```

---

### **Step 5: Environment Variables**

Click **"Advanced"** → **"Add Environment Variable"**

Add these variables:

```
NODE_ENV=production

NEXT_PUBLIC_API_URL=https://mamtvaspices-backend.onrender.com

NEXT_PUBLIC_GRAPHQL_URL=https://mamtvaspices-backend.onrender.com/graphql

NEXT_PUBLIC_SOCKET_URL=https://mamtvaspices-backend.onrender.com
```

**⚠️ Important:** Replace `mamtvaspices-backend` with your actual backend service name from Render!

---

### **Step 6: Deploy**

1. Click **"Create Web Service"**
2. Wait for deployment (5-10 minutes)
3. Your frontend will be live at: `https://mamtvaspices-frontend.onrender.com`

---

## 🔧 After Backend is Ready

Once your backend is deployed and working:

### **Update Frontend Environment Variables:**

1. Go to your frontend service → **Settings** → **Environment**
2. Update `NEXT_PUBLIC_API_URL` with your actual backend URL
3. Click **"Save Changes"**
4. Render will automatically redeploy

---

## ✅ Complete Configuration Summary

### **Frontend Service:**
```
Name: mamtvaspices-frontend
Root Directory: src/client
Runtime: Node

Build Command: npm install && npm run build
Start Command: npm start

Instance Type: Free
```

### **Environment Variables:**
```
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://mamtvaspices-backend.onrender.com
NEXT_PUBLIC_GRAPHQL_URL=https://mamtvaspices-backend.onrender.com/graphql
NEXT_PUBLIC_SOCKET_URL=https://mamtvaspices-backend.onrender.com
```

---

## 🎯 What Happens Next

1. **Frontend builds** (5-10 minutes)
2. **Backend finishes building** (may take longer due to TypeScript compilation)
3. **Update frontend env vars** with actual backend URL
4. **Test the application** end-to-end

---

## 🔗 URLs After Deployment

- **Frontend:** `https://mamtvaspices-frontend.onrender.com`
- **Backend API:** `https://mamtvaspices-backend.onrender.com/api/v1`
- **API Docs:** `https://mamtvaspices-backend.onrender.com/api-docs`

---

## ⚠️ Common Issues & Solutions

### **Issue 1: Build Fails - "Cannot find module"**

**Solution:** Make sure `Root Directory` is set to `src/client`

---

### **Issue 2: Frontend loads but API calls fail**

**Solution:** 
1. Check backend is running
2. Verify `NEXT_PUBLIC_API_URL` is correct
3. Check CORS settings in backend

---

### **Issue 3: "This site can't be reached"**

**Solution:** 
1. Wait for deployment to complete
2. Check service status in Render dashboard
3. View logs for errors

---

## 📱 Testing After Deployment

### **1. Check Frontend Loads:**
- Visit: `https://mamtvaspices-frontend.onrender.com`
- Should see homepage

### **2. Check API Connection:**
- Open browser console (F12)
- Look for API calls
- Should connect to backend

### **3. Test Authentication:**
- Try to sign in
- Should work once backend is ready

---

## 🎉 Next Steps

1. ✅ Deploy frontend (follow this guide)
2. ⏳ Wait for backend to finish building
3. 🔄 Update frontend env vars with backend URL
4. 🧪 Test the application
5. 🎊 Celebrate your deployment!

---

## 💡 Pro Tips

1. **Free Plan Limitations:**
   - Services sleep after 15 minutes of inactivity
   - First request after sleep takes ~30 seconds
   - Consider upgrading for production

2. **Custom Domain:**
   - You can add custom domain in Settings
   - Free SSL certificate included

3. **Monitoring:**
   - Check logs regularly
   - Set up alerts for errors

---

## 📞 Need Help?

- Check Render logs for errors
- Review environment variables
- Verify backend is running
- Test API endpoints directly

---

**Ready to deploy? Follow the steps above! 🚀**
