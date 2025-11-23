# Deployment Guide - Card Game 6

This guide will help you deploy your card game with:
- **Backend (Server)**: Render.com (Free tier with WebSocket support)
- **Frontend (Client)**: Vercel (Free tier)

---

## Prerequisites

1. **GitHub Account** - Create one at [github.com](https://github.com)
2. **Render Account** - Sign up at [render.com](https://render.com)
3. **Vercel Account** - Sign up at [vercel.com](https://vercel.com)
4. **Git installed** on your computer

---

## Step 1: Prepare Your Code for Deployment

### 1.1 Update Environment Variables

The backend needs to know the production URL. We'll set this up in Render later.

### 1.2 Update Frontend to Use Environment Variable

The frontend needs to connect to your deployed backend instead of localhost.

**File: `client/.env.production`** (already created for you)

---

## Step 2: Push Your Code to GitHub

### 2.1 Initialize Git Repository (if not already done)

Open terminal in `c:\Desktop\card` and run:

```bash
git init
git add .
git commit -m "Initial commit - Card Game 6"
```

### 2.2 Create GitHub Repository

1. Go to [github.com/new](https://github.com/new)
2. Name it: `card-game-6`
3. Keep it **Public** (required for free tier)
4. **Don't** initialize with README
5. Click "Create repository"

### 2.3 Push to GitHub

Copy the commands from GitHub and run them:

```bash
git remote add origin https://github.com/YOUR_USERNAME/card-game-6.git
git branch -M main
git push -u origin main
```

---

## Step 3: Deploy Backend to Render

### 3.1 Create New Web Service

1. Go to [render.com/dashboard](https://dashboard.render.com)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub account if not already connected
4. Select your `card-game-6` repository

### 3.2 Configure the Service

Fill in the following:

- **Name**: `card-game-server` (or any name you like)
- **Region**: Choose closest to you
- **Branch**: `main`
- **Root Directory**: `server`
- **Runtime**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Instance Type**: `Free`

### 3.3 Add Environment Variables

Click **"Advanced"** and add:

- **Key**: `PORT`
- **Value**: `3001`

### 3.4 Deploy

1. Click **"Create Web Service"**
2. Wait 5-10 minutes for deployment
3. Once deployed, copy your service URL (e.g., `https://card-game-server.onrender.com`)

> **Note**: Free tier services sleep after 15 minutes of inactivity. First request may take 30-60 seconds to wake up.

---

## Step 4: Deploy Frontend to Vercel

### 4.1 Update Frontend Environment Variable

Before deploying, update the backend URL in your frontend:

**File: `client/.env.production`**
```
VITE_SOCKET_URL=https://YOUR_RENDER_URL.onrender.com
```

Replace `YOUR_RENDER_URL` with your actual Render service URL.

Commit this change:
```bash
git add client/.env.production
git commit -m "Update production backend URL"
git push
```

### 4.2 Deploy to Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click **"Import Git Repository"**
3. Select your `card-game-6` repository
4. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

### 4.3 Add Environment Variable

1. Go to **Settings** → **Environment Variables**
2. Add:
   - **Key**: `VITE_SOCKET_URL`
   - **Value**: `https://YOUR_RENDER_URL.onrender.com`
3. Click **"Save"**

### 4.4 Deploy

1. Click **"Deploy"**
2. Wait 2-3 minutes
3. Your site will be live at `https://your-project.vercel.app`

---

## Step 5: Update CORS Settings

After deployment, update your backend to allow requests from your Vercel domain.

**File: `server/index.js`** - Update the CORS configuration:

```javascript
const io = new Server(server, {
    cors: {
        origin: [
            "http://localhost:5173",
            "https://your-project.vercel.app"  // Add your Vercel URL
        ],
        methods: ["GET", "POST"]
    }
});
```

Commit and push:
```bash
git add server/index.js
git commit -m "Update CORS for production"
git push
```

Render will automatically redeploy.

---

## Step 6: Test Your Deployment

1. Open your Vercel URL: `https://your-project.vercel.app`
2. Enter your name and click "Play vs Bots"
3. The game should connect to your Render backend

---

## Troubleshooting

### Backend Issues

**Problem**: "Application failed to respond"
- Check Render logs: Dashboard → Your Service → Logs
- Ensure `npm start` script exists in `server/package.json`

**Problem**: WebSocket connection fails
- Verify CORS settings include your Vercel URL
- Check that PORT is set to 3001 in Render environment variables

### Frontend Issues

**Problem**: "Cannot connect to server"
- Verify `VITE_SOCKET_URL` is set correctly in Vercel
- Check that Render service is running (not sleeping)
- Open browser console (F12) to see connection errors

**Problem**: Build fails
- Check Vercel build logs
- Ensure all dependencies are in `package.json`
- Verify Node version compatibility

---

## Free Tier Limitations

### Render (Backend)
- ✅ 750 hours/month free
- ⚠️ Sleeps after 15 min inactivity
- ⚠️ 30-60 sec cold start time
- ✅ WebSocket support

### Vercel (Frontend)
- ✅ Unlimited bandwidth
- ✅ Instant deployments
- ✅ Automatic HTTPS
- ✅ No sleep time

---

## Keeping Your Backend Awake (Optional)

To prevent Render from sleeping, you can use a free service like [UptimeRobot](https://uptimerobot.com):

1. Sign up at uptimerobot.com
2. Add a new monitor
3. Monitor Type: HTTP(s)
4. URL: Your Render service URL
5. Monitoring Interval: 5 minutes

This will ping your backend every 5 minutes to keep it awake.

---

## Future Updates

To update your deployed app:

1. Make changes locally
2. Commit and push to GitHub:
   ```bash
   git add .
   git commit -m "Your update message"
   git push
   ```
3. Render and Vercel will automatically redeploy!

---

## Custom Domain (Optional)

### For Frontend (Vercel)
1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions

### For Backend (Render)
1. Upgrade to paid plan ($7/month)
2. Add custom domain in Render dashboard

---

## Support

If you encounter issues:
- **Render Docs**: [render.com/docs](https://render.com/docs)
- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- Check browser console (F12) for errors
- Check Render logs for backend errors

---

**Congratulations! Your card game is now live! 🎉**
