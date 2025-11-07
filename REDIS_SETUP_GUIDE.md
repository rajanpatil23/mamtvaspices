# Redis Setup Guide for E-Commerce Application

## Overview

During local development, we used an **in-memory Redis mock** to avoid installing Redis. However, for production or proper development, you should use a real Redis instance.

## Why Redis is Important

Your application uses Redis for:
- **Session Storage**: User login sessions
- **Caching**: Improving performance
- **Token Blacklisting**: Managing JWT token revocation

---

## Setup Options

### Option 1: Local Redis Installation (Recommended for Development)

#### **Windows:**

1. **Install Redis using Memurai** (Redis-compatible for Windows):
   ```powershell
   # Download from: https://www.memurai.com/get-memurai
   # Or use Chocolatey:
   choco install memurai-developer
   ```

2. **Or use Docker** (easier):
   ```powershell
   docker run -d --name redis -p 6379:6379 redis:7
   ```

3. **Verify Redis is running**:
   ```powershell
   # If using Memurai, it runs as a Windows service
   # If using Docker:
   docker ps
   ```

#### **macOS:**

```bash
# Using Homebrew
brew install redis

# Start Redis
brew services start redis

# Or run manually
redis-server
```

#### **Linux (Ubuntu/Debian):**

```bash
# Install Redis
sudo apt update
sudo apt install redis-server

# Start Redis
sudo systemctl start redis-server

# Enable auto-start on boot
sudo systemctl enable redis-server

# Check status
sudo systemctl status redis-server
```

---

### Option 2: Cloud Redis (Recommended for Production)

#### **A. Redis Cloud (Free Tier Available)**

1. Sign up at: https://redis.com/try-free/
2. Create a new database
3. Get your connection URL (format: `redis://username:password@host:port`)
4. Add to your `.env`:
   ```env
   REDIS_URL=redis://default:your-password@redis-12345.c123.us-east-1-1.ec2.cloud.redislabs.com:12345
   ```

#### **B. Upstash (Serverless Redis - Free Tier)**

1. Sign up at: https://upstash.com/
2. Create a new Redis database
3. Copy the Redis URL
4. Add to your `.env`:
   ```env
   REDIS_URL=rediss://default:your-token@your-endpoint.upstash.io:6379
   ```

#### **C. AWS ElastiCache**

1. Go to AWS Console → ElastiCache
2. Create a Redis cluster
3. Get the endpoint URL
4. Add to your `.env`:
   ```env
   REDIS_URL=redis://your-cluster.cache.amazonaws.com:6379
   ```

#### **D. Azure Cache for Redis**

1. Go to Azure Portal
2. Create "Azure Cache for Redis"
3. Get connection string
4. Add to your `.env`:
   ```env
   REDIS_URL=redis://:your-access-key@your-cache.redis.cache.windows.net:6380
   ```

---

## Configuration Steps

### 1. Update Your `.env` File

```env
# Add this line to src/server/.env
REDIS_URL=redis://localhost:6379

# For cloud Redis, use the URL provided by your service:
# REDIS_URL=redis://username:password@host:port
```

### 2. Verify Redis Connection

Create a test script to verify Redis is working:

```javascript
// src/server/test-redis-connection.js
require('dotenv').config();
const Redis = require('ioredis');

const redis = new Redis(process.env.REDIS_URL);

redis.on('connect', () => {
  console.log('✅ Connected to Redis successfully!');
  redis.set('test-key', 'Hello Redis!');
  redis.get('test-key', (err, result) => {
    console.log('Test value:', result);
    redis.quit();
    process.exit(0);
  });
});

redis.on('error', (err) => {
  console.error('❌ Redis connection error:', err);
  process.exit(1);
});
```

Run the test:
```bash
cd src/server
node test-redis-connection.js
```

### 3. Restart Your Server

After adding `REDIS_URL` to your `.env`:

```bash
cd src/server
npm run dev
```

You should see:
```
✅ Connected to Redis
🚀 Server is running on port 5000
```

---

## Docker Setup (Easiest for Development)

### Using Docker Compose (Already Configured)

Your project already has a `docker-compose.yml` file with Redis configured:

```yaml
# src/docker-compose.yml
services:
  redis:
    image: redis:7
    ports:
      - "6379:6379"
```

**To use it:**

```bash
# Start only Redis
cd src
docker-compose up redis -d

# Or start everything (client, server, db, redis)
docker-compose up -d
```

**Update your `.env`:**
```env
REDIS_URL=redis://localhost:6379
```

---

## Production Considerations

### 1. **Security**

```env
# Use password-protected Redis in production
REDIS_URL=redis://:your-strong-password@host:6379

# Or use TLS (rediss://)
REDIS_URL=rediss://username:password@host:6380
```

### 2. **Connection Pooling**

The `ioredis` library (already installed) handles connection pooling automatically.

### 3. **Persistence**

For production, enable Redis persistence:

```bash
# In redis.conf
appendonly yes
appendfsync everysec
```

### 4. **Monitoring**

Monitor Redis health:
```bash
redis-cli ping
# Should return: PONG

redis-cli info
# Shows detailed Redis statistics
```

---

## Troubleshooting

### Issue: "Connection refused"

**Solution:**
```bash
# Check if Redis is running
redis-cli ping

# On Windows with Memurai:
# Check Services → Memurai should be "Running"

# On Docker:
docker ps | grep redis
```

### Issue: "NOAUTH Authentication required"

**Solution:**
```env
# Add password to REDIS_URL
REDIS_URL=redis://:your-password@localhost:6379
```

### Issue: In-memory mock still being used

**Solution:**
1. Verify `REDIS_URL` is in your `.env` file
2. Restart the server completely (Ctrl+C, then `npm run dev`)
3. Check server logs for "✅ Connected to Redis"

---

## Comparison: In-Memory Mock vs Real Redis

| Feature | In-Memory Mock | Real Redis |
|---------|---------------|------------|
| **Installation** | None needed | Requires Redis |
| **Performance** | Fast | Very Fast |
| **Persistence** | ❌ Lost on restart | ✅ Persisted |
| **Scalability** | ❌ Single process | ✅ Can scale |
| **Production Ready** | ❌ No | ✅ Yes |
| **Sessions** | Lost on restart | Maintained |
| **Best For** | Quick testing | Development & Production |

---

## Recommended Setup by Environment

### **Local Development:**
- **Option 1**: Docker Redis (easiest)
  ```bash
  docker run -d --name redis -p 6379:6379 redis:7
  ```
- **Option 2**: Memurai (Windows) or native Redis (Mac/Linux)

### **Staging/Production:**
- **Option 1**: Redis Cloud (managed, free tier available)
- **Option 2**: Upstash (serverless, free tier)
- **Option 3**: AWS ElastiCache / Azure Cache (enterprise)

---

## Quick Start Commands

```bash
# 1. Start Redis with Docker (easiest)
docker run -d --name redis -p 6379:6379 redis:7

# 2. Add to .env
echo "REDIS_URL=redis://localhost:6379" >> src/server/.env

# 3. Restart server
cd src/server
npm run dev

# 4. Verify connection
# Look for: "✅ Connected to Redis" in server logs
```

---

## Summary

**What we did during setup:**
- Used in-memory mock (no Redis installation needed)
- Good for quick testing, but sessions are lost on restart

**What you should do for proper setup:**
1. Install Redis locally (Docker recommended) OR use cloud Redis
2. Add `REDIS_URL` to your `.env` file
3. Restart the server
4. Verify connection in server logs

**Result:**
- ✅ Persistent sessions (users stay logged in)
- ✅ Better performance with caching
- ✅ Production-ready setup
