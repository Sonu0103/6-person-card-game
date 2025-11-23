# 🔧 Deployment Troubleshooting Guide

## Error: `GET http://localhost:3001/socket.io/?EIO=4&transport=polling&t=... net::ERR_BLOCKED_BY_CLIENT`

### Problem
Your deployed frontend is trying to connect to `localhost:3001` instead of your Render backend URL.

### Root Cause
Vercel doesn't automatically read `.env.production` files. You must set environment variables in the Vercel dashboard.

---

## ✅ Solution: Set Environment Variable in Vercel

### Step 1: Go to Vercel Dashboard

1. Open [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click on your project (card-game-6)
3. Go to **Settings** tab
4. Click **Environment Variables** in the left sidebar

### Step 2: Add Environment Variable

1. Click **Add New**
2. Fill in:
   - **Key**: `VITE_SOCKET_URL`
   - **Value**: `https://card-game-server-b3lz.onrender.com` (your Render URL)
   - **Environment**: Select **Production**, **Preview**, and **Development**
3. Click **Save**

### Step 3: Redeploy

**Option A: Trigger Redeploy from Vercel**
1. Go to **Deployments** tab
2. Click the **⋯** menu on the latest deployment
3. Click **Redeploy**
4. Select **Use existing Build Cache** → **Redeploy**

**Option B: Push to GitHub (Recommended)**
```bash
# Make a small change to trigger redeploy
git commit --allow-empty -m "Trigger redeploy with env var"
git push
```

### Step 4: Verify

1. Wait 2-3 minutes for deployment
2. Open your Vercel URL
3. Press **F12** to open browser console
4. Look for Socket.IO connection - should now connect to your Render URL
5. You should see: `GET https://card-game-server-b3lz.onrender.com/socket.io/...`

---

## 🔍 How to Check if Environment Variable is Set

### Method 1: Check in Browser Console

After deployment, open your Vercel site and run in console:
```javascript
console.log(import.meta.env.VITE_SOCKET_URL)
```

Should show: `https://card-game-server-b3lz.onrender.com`

### Method 2: Check Vercel Build Logs

1. Go to **Deployments** tab
2. Click on latest deployment
3. Click **Building** section
4. Look for: `VITE_SOCKET_URL=https://...`

---

## 🚨 Common Mistakes

### ❌ Wrong: Only setting in `.env.production`
Vercel ignores `.env.production` files. You MUST set in dashboard.

### ❌ Wrong: Forgetting to redeploy
After adding env var, you must redeploy for changes to take effect.

### ❌ Wrong: Using wrong environment variable name
Must be `VITE_SOCKET_URL` (not `SOCKET_URL` or `REACT_APP_SOCKET_URL`)

### ✅ Correct: Set in Vercel Dashboard + Redeploy

---

## 🔧 Additional Checks

### 1. Verify Render Backend is Running

Open your Render URL directly in browser:
```
https://card-game-server-b3lz.onrender.com
```

You should see: `Cannot GET /` (this is normal - backend has no root route)

### 2. Check CORS Settings

Make sure `server/index.js` includes your Vercel URL:
```javascript
const io = new Server(server, {
    cors: {
        origin: [
            "http://localhost:5173",
            "https://card-game-6-2o8rv4wm5-sonu0103s-projects.vercel.app"
        ],
        methods: ["GET", "POST"]
    }
});
```

### 3. Check Browser Console for Errors

Press **F12** and look for:
- ✅ Good: `WebSocket connection to 'wss://card-game-server-b3lz.onrender.com/socket.io/...'`
- ❌ Bad: `WebSocket connection to 'ws://localhost:3001/socket.io/...'`

---

## 📋 Quick Checklist

- [ ] Environment variable `VITE_SOCKET_URL` set in Vercel dashboard
- [ ] Value is your Render URL (starts with `https://`)
- [ ] Redeployed after setting env var
- [ ] CORS includes your Vercel URL in `server/index.js`
- [ ] Render backend is running (not sleeping)
- [ ] Browser console shows connection to Render URL (not localhost)

---

## 🆘 Still Not Working?

### Check Vercel Environment Variables

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Verify `VITE_SOCKET_URL` exists
3. Click **Edit** to verify the value is correct
4. Make sure it's enabled for **Production** environment

### Force Clean Rebuild

1. Go to Vercel Dashboard → Your Project → Settings
2. Scroll to **Build & Development Settings**
3. Toggle **Ignore Build Step** OFF (if it was ON)
4. Go to Deployments → Redeploy → **Clear cache and redeploy**

### Check Build Logs

1. Go to Deployments → Latest Deployment
2. Click **Building** section
3. Search for `VITE_SOCKET_URL`
4. Should see: `VITE_SOCKET_URL: "https://card-game-server-b3lz.onrender.com"`

---

## 💡 Pro Tip

After setting environment variables in Vercel, always do a **fresh deployment** (not just redeploy). The easiest way:

```bash
git commit --allow-empty -m "Force redeploy"
git push
```

This ensures Vercel picks up the new environment variables.

---

**Need more help?** Check the main [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) or Vercel's [Environment Variables docs](https://vercel.com/docs/projects/environment-variables).
