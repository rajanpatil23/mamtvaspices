# ✅ Frontend Deployment Checklist

## 📋 Quick Reference - Copy & Paste

### **Service Configuration:**
```
Name: mamtvaspices-frontend
Region: Singapore
Branch: main
Root Directory: src/client
Runtime: Node
Instance Type: Free
```

### **Commands:**
```
Build Command: npm install && npm run build
Start Command: npm start
```

### **Environment Variables:**
```
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://mamtvaspices-backend.onrender.com
NEXT_PUBLIC_GRAPHQL_URL=https://mamtvaspices-backend.onrender.com/graphql
NEXT_PUBLIC_SOCKET_URL=https://mamtvaspices-backend.onrender.com
```

---

## 🎯 Step-by-Step Checklist

### **Phase 1: Create Service**
- [ ] Go to Render Dashboard
- [ ] Click "New +" → "Web Service"
- [ ] Select GitHub repository: `mamtvaspices`
- [ ] Click "Connect"

### **Phase 2: Basic Settings**
- [ ] Name: `mamtvaspices-frontend`
- [ ] Region: `Singapore` (or closest)
- [ ] Branch: `main`
- [ ] Root Directory: `src/client`
- [ ] Runtime: `Node`

### **Phase 3: Commands**
- [ ] Build Command: `npm install && npm run build`
- [ ] Start Command: `npm start`

### **Phase 4: Environment Variables**
- [ ] Click "Advanced"
- [ ] Add `NODE_ENV=production`
- [ ] Add `NEXT_PUBLIC_API_URL=https://mamtvaspices-backend.onrender.com`
- [ ] Add `NEXT_PUBLIC_GRAPHQL_URL=https://mamtvaspices-backend.onrender.com/graphql`
- [ ] Add `NEXT_PUBLIC_SOCKET_URL=https://mamtvaspices-backend.onrender.com`

### **Phase 5: Deploy**
- [ ] Instance Type: `Free`
- [ ] Click "Create Web Service"
- [ ] Wait for deployment (5-10 minutes)

### **Phase 6: After Backend is Ready**
- [ ] Get actual backend URL from Render
- [ ] Update `NEXT_PUBLIC_API_URL` with real backend URL
- [ ] Update `NEXT_PUBLIC_GRAPHQL_URL` with real backend URL
- [ ] Update `NEXT_PUBLIC_SOCKET_URL` with real backend URL
- [ ] Save changes (auto-redeploys)

### **Phase 7: Testing**
- [ ] Visit frontend URL
- [ ] Check homepage loads
- [ ] Open browser console (F12)
- [ ] Verify no errors
- [ ] Test navigation
- [ ] Try authentication (once backend is ready)

---

## 🔍 Verification Steps

### **1. Frontend Deployed Successfully:**
```
✅ Build completed
✅ Service is "Live"
✅ URL is accessible
✅ Homepage loads
```

### **2. Backend Connection:**
```
✅ Backend service is "Live"
✅ API URL is correct in env vars
✅ No CORS errors in console
✅ API calls succeed
```

### **3. Full Application:**
```
✅ Can browse products
✅ Can sign in/sign up
✅ Can add to cart
✅ Can checkout
```

---

## ⚠️ Troubleshooting

### **Build Fails:**
- Check `Root Directory` is `src/client`
- Verify `package.json` exists in `src/client/`
- Check build logs for specific errors

### **Frontend Loads but Blank:**
- Check browser console for errors
- Verify environment variables are set
- Check Next.js build output in logs

### **API Calls Fail:**
- Verify backend is running
- Check `NEXT_PUBLIC_API_URL` is correct
- Look for CORS errors in console
- Test backend API directly

### **"This site can't be reached":**
- Wait for deployment to complete
- Check service status (should be "Live")
- View logs for startup errors

---

## 📊 Expected Timeline

```
0-2 min:   Creating service
2-5 min:   Installing dependencies
5-8 min:   Building Next.js app
8-10 min:  Starting server
10+ min:   Service is Live! ✅
```

---

## 🎯 Success Criteria

Your frontend is successfully deployed when:

1. ✅ Service status shows "Live" (green)
2. ✅ URL opens and shows homepage
3. ✅ No errors in browser console
4. ✅ Can navigate between pages
5. ✅ API calls work (once backend is ready)

---

## 📝 Notes

- **Free Plan:** Services sleep after 15 min inactivity
- **First Request:** Takes ~30 seconds after sleep
- **Logs:** Check regularly for errors
- **Updates:** Push to GitHub triggers auto-deploy

---

## 🔗 Important URLs

After deployment, save these:

```
Frontend: https://mamtvaspices-frontend.onrender.com
Backend: https://mamtvaspices-backend.onrender.com
API Docs: https://mamtvaspices-backend.onrender.com/api-docs
```

---

## ✅ Final Checklist

Before marking as complete:

- [ ] Frontend service created
- [ ] All environment variables set
- [ ] Build completed successfully
- [ ] Service is "Live"
- [ ] Homepage loads correctly
- [ ] No console errors
- [ ] Backend URL updated (after backend is ready)
- [ ] Full application tested

---

**🎉 Once all checkboxes are ticked, your frontend is deployed!**
