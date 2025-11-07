# GitHub Deployment Guide

## Step 1: Initialize Git Repository

Open your terminal in the project root directory (`c:/code/mig`) and run:

```bash
git init
```

## Step 2: Configure Git (if not already done)

Set your Git username and email:

```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

## Step 3: Add All Files to Git

```bash
git add .
```

**Important:** The `.gitignore` file will automatically exclude:
- `.env` files (your sensitive credentials)
- `node_modules/` folders
- Build outputs
- IDE files

## Step 4: Create Initial Commit

```bash
git commit -m "Initial commit: E-commerce platform with MySQL and Upstash Redis"
```

## Step 5: Connect to GitHub Repository

Replace `<your-username>` and `<your-repo-name>` with your actual GitHub username and repository name:

```bash
git remote add origin https://github.com/<your-username>/<your-repo-name>.git
```

**Example:**
```bash
git remote add origin https://github.com/johndoe/my-ecommerce.git
```

## Step 6: Rename Branch to Main (if needed)

GitHub uses `main` as the default branch name:

```bash
git branch -M main
```

## Step 7: Push to GitHub

```bash
git push -u origin main
```

**Note:** You may be prompted to authenticate with GitHub. Use:
- Personal Access Token (recommended)
- GitHub Desktop
- SSH key

## Step 8: Verify on GitHub

1. Go to your GitHub repository URL
2. Verify all files are uploaded
3. **CRITICAL:** Check that `.env` files are NOT visible (they should be excluded by .gitignore)

---

## Troubleshooting

### If you get authentication errors:

**Option 1: Use Personal Access Token**
1. Go to GitHub Settings → Developer settings → Personal access tokens
2. Generate new token (classic)
3. Select scopes: `repo` (full control)
4. Copy the token
5. Use it as password when pushing

**Option 2: Use GitHub CLI**
```bash
# Install GitHub CLI first
gh auth login
git push -u origin main
```

### If you accidentally committed .env files:

```bash
# Remove from Git but keep locally
git rm --cached .env
git rm --cached src/server/.env
git rm --cached src/client/.env.local

# Commit the removal
git commit -m "Remove sensitive .env files"

# Push changes
git push
```

---

## Next Steps After Pushing to GitHub

1. ✅ Verify repository on GitHub
2. ✅ Ensure .env files are not visible
3. ✅ Ready to deploy to Render!

---

## Important Security Notes

### Files That Should NEVER Be Committed:
- ❌ `.env` files
- ❌ `node_modules/`
- ❌ Database credentials
- ❌ API keys
- ❌ JWT secrets

### Files That SHOULD Be Committed:
- ✅ `.env.example` (template without real values)
- ✅ Source code
- ✅ `package.json` and `package-lock.json`
- ✅ Documentation files
- ✅ Configuration files (without secrets)

---

## Create .env.example Files

Before pushing, create example environment files:

### Root .env.example:
```env
# Add any root-level environment variables here
```

### src/server/.env.example:
```env
# Database
DATABASE_URL=mysql://username:password@host:port/database

# Redis
REDIS_URL=your_upstash_redis_url

# JWT Secrets
JWT_SECRET=your_jwt_secret
REFRESH_TOKEN_SECRET=your_refresh_token_secret

# Session
SESSION_SECRET=your_session_secret
COOKIE_SECRET=your_cookie_secret

# External Services
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret

STRIPE_SECRET_KEY=your_stripe_secret
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# CORS
ALLOWED_ORIGINS=http://localhost:3000
COOKIE_DOMAIN=localhost
```

### src/client/.env.example:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

---

## Quick Command Reference

```bash
# Check status
git status

# View commit history
git log --oneline

# Check remote URL
git remote -v

# Pull latest changes
git pull origin main

# Push changes
git push origin main
