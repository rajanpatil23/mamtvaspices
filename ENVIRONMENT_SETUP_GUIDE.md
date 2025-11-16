# Environment Variables Setup Guide

This guide explains how to configure environment variables for both backend and frontend.

## 📁 File Structure

```
mig/
├── src/
│   ├── server/
│   │   ├── .env              # Backend environment variables (DO NOT COMMIT)
│   │   └── .env.example      # Backend template (commit this)
│   └── client/
│       ├── .env.local        # Frontend environment variables (DO NOT COMMIT)
│       └── .env.example      # Frontend template (commit this)
```

## 🔧 Backend Configuration (`src/server/.env`)

### Required Variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database (MySQL)
DATABASE_URL="mysql://username:password@localhost:3306/database_name"

# Redis (Session Store)
REDIS_URL="redis://localhost:6379"
# For Upstash Redis (production):
# REDIS_URL="rediss://default:your-password@your-redis-url.upstash.io:6379"

# JWT Secrets
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Session Secret
SESSION_SECRET=your-super-secret-session-key-change-this
COOKIE_SECRET=your-super-secret-cookie-key-change-this

# Cloudinary (Image Uploads)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Stripe (Payments)
STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key
STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-publishable-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret

# Email (Nodemailer)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# CORS
CLIENT_URL=http://localhost:3000
```

## 🎨 Frontend Configuration (`src/client/.env.local`)

### Required Variables:

```env
# API URLs
NEXT_PUBLIC_API_URL_DEV=http://localhost:5000/api/v1
NEXT_PUBLIC_API_URL_PROD=https://your-vps-domain.com/api/v1

# Stripe Public Key (for client-side)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-publishable-key
```

## 🚀 VPS Deployment Configuration

### For Production on VPS:

1. **Backend (`src/server/.env`):**
```env
PORT=5000  # Or whatever port your VPS uses
NODE_ENV=production
DATABASE_URL="mysql://username:password@localhost:3306/production_db"
REDIS_URL="rediss://your-upstash-redis-url"
CLIENT_URL=https://your-domain.com
# ... other production credentials
```

2. **Frontend (`src/client/.env.local`):**
```env
NEXT_PUBLIC_API_URL_PROD=https://your-domain.com/api/v1
# Or if backend is on different port:
# NEXT_PUBLIC_API_URL_PROD=https://your-domain.com:5000/api/v1
```

## 🔄 How It Works

### Backend Port Configuration:
The backend reads the `PORT` from environment variables:
```typescript
const PORT = parseInt(process.env.PORT || '5000', 10);
```

### Frontend API URL Configuration:
The frontend uses different URLs based on environment:
- **Development**: `NEXT_PUBLIC_API_URL_DEV` (defaults to `http://localhost:5000/api/v1`)
- **Production**: `NEXT_PUBLIC_API_URL_PROD` (must be set to your VPS URL)

## 📝 Setup Instructions

### Local Development:

1. **Backend:**
```bash
cd src/server
cp .env.example .env
# Edit .env with your local credentials
```

2. **Frontend:**
```bash
cd src/client
cp .env.example .env.local
# Edit .env.local (usually defaults work for local dev)
```

### VPS Production:

1. **Backend:**
```bash
cd src/server
# Create .env with production credentials
nano .env
# Add all production values
```

2. **Frontend:**
```bash
cd src/client
# Create .env.local with production API URL
nano .env.local
# Set NEXT_PUBLIC_API_URL_PROD to your VPS URL
```

## ⚠️ Important Notes

1. **Never commit `.env` or `.env.local` files** - They contain sensitive credentials
2. **Always commit `.env.example` files** - They serve as templates
3. **Use strong, unique secrets** for JWT, session, and cookie secrets
4. **For production**, use secure HTTPS URLs
5. **Environment variables starting with `NEXT_PUBLIC_`** are exposed to the browser
6. **Backend environment variables** are only accessible on the server

## 🔐 Security Best Practices

1. Generate strong secrets:
```bash
# Generate random secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

2. Use different secrets for development and production
3. Never share your `.env` files
4. Use environment-specific credentials (dev DB, prod DB, etc.)
5. Rotate secrets regularly in production

## 🆘 Troubleshooting

### Backend won't start:
- Check if `PORT` is available
- Verify `DATABASE_URL` is correct
- Ensure `REDIS_URL` is accessible

### Frontend can't connect to backend:
- Verify `NEXT_PUBLIC_API_URL_PROD` matches your backend URL
- Check CORS settings in backend (CLIENT_URL)
- Ensure backend is running and accessible

### API calls fail in production:
- Check if backend URL includes `/api/v1`
- Verify SSL certificates if using HTTPS
- Check firewall rules on VPS
