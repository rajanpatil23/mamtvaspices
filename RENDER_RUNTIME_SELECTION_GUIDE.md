# 🎯 Render Runtime Selection Guide

## When Creating a Web Service on Render

When you create a new web service on Render, you'll see a screen asking for **"Language/Runtime Environment"**.

---

## ✅ What to Select

### For Backend Service (src/server):
```
Runtime: Node
```

### For Frontend Service (src/client):
```
Runtime: Node
```

---

## 📸 What You'll See

The screen will look something like this:

```
┌─────────────────────────────────────────────┐
│  Select Runtime Environment                 │
├─────────────────────────────────────────────┤
│                                             │
│  ○ Docker                                   │
│  ● Node          ← SELECT THIS              │
│  ○ Python                                   │
│  ○ Ruby                                     │
│  ○ Go                                       │
│  ○ Rust                                     │
│  ○ Elixir                                   │
│  ○ Static Site                              │
│                                             │
└─────────────────────────────────────────────┘
```

---

## 🔍 Why Node?

Both your backend and frontend are Node.js applications:

- **Backend**: Express.js server (Node.js)
- **Frontend**: Next.js application (Node.js)

Render will automatically:
- Detect Node.js version from `package.json`
- Install dependencies with `npm install`
- Run your build and start commands

---

## 📋 Complete Configuration

### Backend Service Configuration:

| Setting | Value |
|---------|-------|
| **Runtime** | `Node` ← **SELECT THIS** |
| **Name** | `mamtvaspices-backend` |
| **Root Directory** | `src/server` |
| **Build Command** | `npm install && npx prisma generate` |
| **Start Command** | `npm start` |

### Frontend Service Configuration:

| Setting | Value |
|---------|-------|
| **Runtime** | `Node` ← **SELECT THIS** |
| **Name** | `mamtvaspices-frontend` |
| **Root Directory** | `src/client` |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm start` |

---

## ⚠️ Common Mistakes to Avoid

### ❌ DON'T Select:
- **Docker** - We're not using Docker on Render
- **Static Site** - Your apps are dynamic, not static
- **Python/Ruby/Go** - Wrong language

### ✅ DO Select:
- **Node** - Correct for both services

---

## 🎯 Step-by-Step Visual Guide

### Step 1: Create Web Service
```
Click: New + → Web Service
```

### Step 2: Connect Repository
```
Select: mamtvaspices
Click: Connect
```

### Step 3: Select Runtime
```
⚠️ THIS IS WHERE YOU ARE NOW ⚠️

Select: Node (click the radio button next to "Node")
```

### Step 4: Configure Service
```
Fill in:
- Name
- Region
- Branch
- Root Directory
- Build Command
- Start Command
```

### Step 5: Add Environment Variables
```
Click: Advanced
Add all environment variables
```

### Step 6: Deploy
```
Click: Create Web Service
Wait for deployment
```

---

## 🆘 If You Don't See Runtime Selection

If Render doesn't ask for runtime, it means:

1. **It auto-detected Node.js** from your `package.json`
   - This is good! Just proceed with configuration

2. **You're in the wrong flow**
   - Make sure you selected "Build and deploy from a Git repository"
   - Not "Deploy from Docker registry"

---

## 📞 Still Stuck?

If you're still seeing the runtime selection and unsure:

1. **Take a screenshot** of what you see
2. **Select Node** - This is correct for your project
3. **Continue** with the configuration steps in RENDER_DEPLOYMENT_CHECKLIST.md

---

## ✅ Quick Answer

**Question:** "What runtime should I select?"

**Answer:** **Node** (for both backend and frontend)

---

**Made with ❤️ for Mamtva Spices**
