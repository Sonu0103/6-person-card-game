# Quick Deployment Steps

## 🚀 Fast Track Deployment

### 1️⃣ Push to GitHub (5 minutes)

```bash
# In c:\Desktop\card directory
git init
git add .
git commit -m "Initial commit"

# Create repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/card-game-6.git
git branch -M main
git push -u origin main
```

### 2️⃣ Deploy Backend to Render (10 minutes)

1. Go to [render.com](https://render.com) → Sign up/Login
2. Click **New +** → **Web Service**
3. Connect GitHub → Select `card-game-6` repo
4. Settings:
   - **Name**: `card-game-server`
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment Variable**: `PORT` = `3001`
5. Click **Create Web Service**
6. **Copy your Render URL** (e.g., `https://card-game-server.onrender.com`)

### 3️⃣ Update Frontend Config (2 minutes)

Edit `client/.env.production`:
```
VITE_SOCKET_URL=https://YOUR_RENDER_URL.onrender.com
```

Commit and push:
```bash
git add client/.env.production
git commit -m "Add production backend URL"
git push
```

### 4️⃣ Deploy Frontend to Vercel (5 minutes)

1. Go to [vercel.com](https://vercel.com) → Sign up/Login
2. Click **New Project** → Import `card-game-6`
3. Settings:
   - **Framework**: Vite
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add Environment Variable:
   - **Key**: `VITE_SOCKET_URL`
   - **Value**: `https://YOUR_RENDER_URL.onrender.com`
5. Click **Deploy**

### 5️⃣ Update CORS (3 minutes)

Edit `server/index.js` - Update CORS origin:
```javascript
const io = new Server(server, {
    cors: {
        origin: [
            "http://localhost:5173",
            "https://your-project.vercel.app"  // Your Vercel URL
        ],
        methods: ["GET", "POST"]
    }
});
```

Push to GitHub:
```bash
git add server/index.js
git commit -m "Update CORS"
git push
```

Render will auto-redeploy!

### ✅ Done!

Your game is live at: `https://your-project.vercel.app`

---

## 📝 Important Notes

- **First load**: Backend may take 30-60 seconds (free tier sleeps)
- **Auto-deploy**: Push to GitHub = automatic deployment
- **Logs**: Check Render dashboard for backend errors
- **Console**: Press F12 in browser to see frontend errors

## 🔧 Troubleshooting

**Can't connect to backend?**
- Check Render service is running (not sleeping)
- Verify CORS includes your Vercel URL
- Check environment variables are set

**Build failed?**
- Check Vercel build logs
- Ensure all dependencies in package.json
- Verify root directory is set to `client`

---

**Need help?** See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed instructions.
