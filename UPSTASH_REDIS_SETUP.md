# Upstash Redis Configuration for Your E-Commerce App

## Your Upstash Redis URL

You have:
```
redis://default:AUYeAAIncDI0ZWU1NTg3OTA0Nzc0NzQ0ODA1NTQxNDcwZjlmMGI0M3AyMTc5NTA@uncommon-lark-17950.upstash.io:6379
```

## Important: Use TLS for Upstash

Upstash requires TLS (secure connection). Your URL should use `rediss://` (with double 's') instead of `redis://`:

```
rediss://default:AUYeAAIncDI0ZWU1NTg3OTA0Nzc0NzQ0ODA1NTQxNDcwZjlmMGI0M3AyMTc5NTA@uncommon-lark-17950.upstash.io:6379
```

## Setup Steps

### 1. Add to Your Environment File

Open `src/server/.env` and add this line:

```env
REDIS_URL=rediss://default:AUYeAAIncDI0ZWU1NTg3OTA0Nzc0NzQ0ODA1NTQxNDcwZjlmMGI0M3AyMTc5NTA@uncommon-lark-17950.upstash.io:6379
```

**Note:** Changed `redis://` to `rediss://` (with double 's' for TLS)

### 2. Update Redis Configuration (if needed)

Your application uses `ioredis` which should handle TLS automatically. However, if you encounter connection issues, you may need to update the Redis client configuration.

Check `src/server/src/infra/cache/redis.ts` - it should work as-is, but if needed, you can configure TLS options:

```typescript
import Redis from "ioredis";

const redisUrl = process.env.REDIS_URL;

let client: any;

if (redisUrl) {
  const redis = new Redis(redisUrl, {
    tls: {
      rejectUnauthorized: false // For Upstash
    },
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
      const delay = Math.min(times * 50, 2000);
      return delay;
    }
  });

  redis
    .on("connect", () => console.log("✅ Connected to Redis (Upstash)"))
    .on("error", (err) => console.error("❌ Redis error:", err));

  client = redis;
}
```

### 3. Restart Your Server

```bash
cd src/server
npm run dev
```

### 4. Verify Connection

You should see in the server logs:
```
✅ Connected to Redis (Upstash)
🚀 Server is running on port 5000
```

## Testing the Connection

### Option 1: Using redis-cli (from your command)

```bash
redis-cli --tls -u rediss://default:AUYeAAIncDI0ZWU1NTg3OTA0Nzc0NzQ0ODA1NTQxNDcwZjlmMGI0M3AyMTc5NTA@uncommon-lark-17950.upstash.io:6379 ping
```

Should return: `PONG`

### Option 2: Using Node.js Test Script

Create `src/server/test-upstash-redis.js`:

```javascript
require('dotenv').config();
const Redis = require('ioredis');

const redis = new Redis(process.env.REDIS_URL, {
  tls: {
    rejectUnauthorized: false
  }
});

redis.on('connect', () => {
  console.log('✅ Connected to Upstash Redis successfully!');
  
  // Test set/get
  redis.set('test-key', 'Hello from Upstash!', 'EX', 60);
  redis.get('test-key', (err, result) => {
    if (err) {
      console.error('❌ Error:', err);
    } else {
      console.log('✅ Test value:', result);
    }
    redis.quit();
    process.exit(0);
  });
});

redis.on('error', (err) => {
  console.error('❌ Redis connection error:', err);
  process.exit(1);
});
```

Run it:
```bash
cd src/server
node test-upstash-redis.js
```

## Upstash Dashboard

You can monitor your Redis usage at:
- **Dashboard**: https://console.upstash.com/
- View commands, memory usage, and connection stats
- Check logs and metrics

## Common Issues & Solutions

### Issue 1: "Connection timeout"

**Solution:**
```env
# Make sure you're using rediss:// (with TLS)
REDIS_URL=rediss://default:YOUR_PASSWORD@uncommon-lark-17950.upstash.io:6379
```

### Issue 2: "ECONNREFUSED"

**Solution:**
- Check your Upstash dashboard to ensure the database is active
- Verify the URL is correct (copy from Upstash dashboard)
- Check your internet connection

### Issue 3: "TLS/SSL error"

**Solution:**
Update `src/server/src/infra/cache/redis.ts`:

```typescript
const redis = new Redis(redisUrl, {
  tls: {
    rejectUnauthorized: false
  }
});
```

## Environment Variables Summary

Your `src/server/.env` should have:

```env
# Database
DATABASE_URL=mysql://u788338702_ecommerce:Ecommerce@srv1991.hstgr.io:3306/u788338702_ecommerce

# Redis (Upstash)
REDIS_URL=rediss://default:AUYeAAIncDI0ZWU1NTg3OTA0Nzc0NzQ0ODA1NTQxNDcwZjlmMGI0M3AyMTc5NTA@uncommon-lark-17950.upstash.io:6379

# JWT Secrets
ACCESS_TOKEN_SECRET=mysecret123
REFRESH_TOKEN_SECRET=myrefreshsecret123

# Session
SESSION_SECRET=mysessionsecret123
COOKIE_SECRET=mycookiesecret123

# Server
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:3000
CORS_ORIGIN=http://localhost:3000
```

## Benefits of Using Upstash

✅ **Serverless** - Pay only for what you use
✅ **Global** - Low latency worldwide
✅ **Free Tier** - 10,000 commands/day free
✅ **Managed** - No maintenance required
✅ **Secure** - TLS encryption by default
✅ **Persistent** - Data is saved across restarts

## Next Steps

1. ✅ Add `REDIS_URL` to `src/server/.env` (use `rediss://` with TLS)
2. ✅ Restart your server
3. ✅ Check logs for "✅ Connected to Redis"
4. ✅ Test login - sessions should now persist!
5. ✅ Monitor usage in Upstash dashboard

Your application will now use real Redis instead of the in-memory mock! 🎉
