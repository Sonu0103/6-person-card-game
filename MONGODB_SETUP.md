# MongoDB Setup Guide

## Why MongoDB?
- ✅ **Persistence** - Rooms survive server restarts
- ✅ **Scalability** - Handle multiple server instances
- ✅ **Query Power** - Find available rooms efficiently
- ✅ **Flexibility** - Easy to add features later

## Installation Steps

### 1. Install MongoDB Package
```bash
cd server
npm install mongoose
```

### 2. Get MongoDB Connection String

**Option A: Local MongoDB**
- Install MongoDB locally: https://www.mongodb.com/try/download/community
- Connection string: `mongodb://localhost:27017/card-game`

**Option B: MongoDB Atlas (Free Cloud)**
1. Go to https://www.mongodb.com/cloud/atlas/register
2. Create free account
3. Create a cluster (Free tier)
4. Click "Connect" → "Connect your application"
5. Copy connection string (looks like: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/card-game`)

### 3. Add to Environment Variables

Create/update `server/.env`:
```
PORT=3001
MONGODB_URI=mongodb://localhost:27017/card-game
# OR for Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/card-game
```

### 4. Restart Server
```bash
# Stop current server (Ctrl+C)
npm run dev
```

## What Changes

- Room data stored in MongoDB
- Rooms persist across server restarts
- Easy to query available rooms
- Better for production scaling
