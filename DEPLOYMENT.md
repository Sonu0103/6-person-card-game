# Deployment Guide

## Frontend Deployment (Vercel)

### Prerequisites
- GitHub repository created
- Vercel account connected to GitHub

### Steps
1. **Push to GitHub**
   ```bash
   cd c:/Desktop/card
   git init
   git add .
   git commit -m "Initial commit - Card Game 6"
   git branch -M main
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

2. **Deploy to Vercel**
   - Go to https://vercel.com
   - Click "Import Project"
   - Select your GitHub repository
   - Configure:
     - **Framework Preset**: Vite
     - **Root Directory**: `client`
     - **Build Command**: `npm run build`
     - **Output Directory**: `dist`
   - Add Environment Variable:
     - `VITE_SOCKET_URL` = Your backend URL (e.g., `https://card-game-server-b3lz.onrender.com`)
   - Click "Deploy"

## Backend Deployment (Render)

### Steps
1. **Create New Web Service on Render**
   - Go to https://render.com
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Configure:
     - **Name**: card-game-server
     - **Root Directory**: `server`
     - **Environment**: Node
     - **Build Command**: `npm install`
     - **Start Command**: `node index.js`
     - **Instance Type**: Free

2. **Add Environment Variables**
   - `PORT` = 3001 (or leave empty, Render assigns automatically)
   - `MONGODB_URI` = Your MongoDB connection string (if using MongoDB Atlas)
     - Example: `mongodb+srv://username:password@cluster.mongodb.net/card-game`

3. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment to complete
   - Copy the service URL (e.g., `https://card-game-server-b3lz.onrender.com`)

## MongoDB Setup (Optional but Recommended)

### MongoDB Atlas (Free Tier)
1. Go to https://www.mongodb.com/cloud/atlas/register
2. Create free cluster
3. Create database user
4. Whitelist IP: `0.0.0.0/0` (allow from anywhere)
5. Get connection string
6. Add to Render environment variables as `MONGODB_URI`

## Update Frontend with Backend URL

After backend is deployed:
1. Update `client/.env.production`:
   ```
   VITE_SOCKET_URL=https://your-backend-url.onrender.com
   ```
2. Redeploy frontend on Vercel (automatic if connected to GitHub)

## Verify Deployment

1. **Frontend**: Visit your Vercel URL
2. **Backend**: Check Render logs for "Server running on port..."
3. **MongoDB**: Verify "MongoDB Connected Successfully" in Render logs
4. **Test**: Create a room and verify it appears in MongoDB Compass

## Common Issues

### CORS Errors
- Backend `index.js` already has CORS configured with `origin: "*"`
- Should work out of the box

### Socket Connection Failed
- Verify `VITE_SOCKET_URL` in Vercel matches your Render backend URL
- Check Render logs for errors
- Ensure backend is running (not sleeping on free tier)

### MongoDB Connection Error
- Verify `MONGODB_URI` is correct
- Check IP whitelist includes `0.0.0.0/0`
- Verify database user has read/write permissions

## Free Tier Limitations

**Render Free Tier:**
- Sleeps after 15 minutes of inactivity
- Takes ~30 seconds to wake up
- 750 hours/month (enough for 1 service running 24/7)

**Vercel Free Tier:**
- 100 GB bandwidth/month
- Automatic deployments from GitHub

**MongoDB Atlas Free Tier:**
- 512 MB storage
- Shared cluster
- More than enough for this project
