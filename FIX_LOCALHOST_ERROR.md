# 🚨 URGENT FIX: Environment Variable Not Set in Vercel

## The Problem
Your site is connecting to `localhost:3001` instead of your Render backend because the environment variable is **NOT set in Vercel**.

---

## ✅ STEP-BY-STEP FIX (Follow Exactly)

### Step 1: Open Vercel Dashboard

1. Go to: https://vercel.com/dashboard
2. Click on your project name (should be `card-game-6` or similar)

### Step 2: Go to Settings

1. Click the **"Settings"** tab at the top
2. In the left sidebar, click **"Environment Variables"**

### Step 3: Add the Environment Variable

1. You should see a form with:
   - **Key** (input field)
   - **Value** (input field)
   - **Environments** (checkboxes)

2. Fill in EXACTLY:
   - **Key**: `VITE_SOCKET_URL`
   - **Value**: `https://card-game-server-b3lz.onrender.com`
   - **Environments**: ✅ Check ALL THREE boxes:
     - ✅ Production
     - ✅ Preview  
     - ✅ Development

3. Click **"Save"** button

### Step 4: Verify It Was Added

After clicking Save, you should see a new row in the table showing:
```
VITE_SOCKET_URL | https://card-game-server-b3lz.onrender.com | Production, Preview, Development
```

If you see this, it's saved correctly! ✅

### Step 5: Redeploy Your Site

**IMPORTANT:** Just adding the variable is NOT enough. You MUST redeploy!

**Option A - Redeploy from Vercel (Easiest):**

1. Click the **"Deployments"** tab at the top
2. Find the most recent deployment (top of the list)
3. Click the **three dots (⋯)** on the right side
4. Click **"Redeploy"**
5. A popup appears - click **"Redeploy"** again to confirm

**Option B - Push to GitHub:**

Open terminal in `c:\Desktop\card` and run:
```bash
git commit --allow-empty -m "Trigger redeploy with env var"
git push
```

### Step 6: Wait for Deployment

1. Stay on the **Deployments** tab
2. You'll see a new deployment appear with status "Building"
3. Wait 2-3 minutes until it shows **"Ready"** with a green checkmark ✅

### Step 7: Test Your Site

1. Click on the deployment that says **"Ready"**
2. Click **"Visit"** button (or copy the URL)
3. Open your site in a **NEW INCOGNITO/PRIVATE WINDOW** (important!)
4. Enter your name
5. Click "Play vs Bots"

### Step 8: Verify in Console

1. Press **F12** to open browser console
2. Look for Socket.IO connection messages
3. You should see:
   ```
   ✅ GET https://card-game-server-b3lz.onrender.com/socket.io/?EIO=4&transport=polling...
   ```

4. You should **NOT** see:
   ```
   ❌ GET http://localhost:3001/socket.io/?EIO=4&transport=polling...
   ```

---

## 🔍 How to Check if Environment Variable is Set

After Step 3, you can verify by running this in your browser console on the deployed site:

```javascript
console.log(import.meta.env.VITE_SOCKET_URL);
```

**Expected result:**
```
https://card-game-server-b3lz.onrender.com
```

**If you see `undefined`:**
- The variable is NOT set correctly
- Go back to Step 2 and try again
- Make sure you clicked "Save"
- Make sure you redeployed (Step 5)

---

## ⚠️ Common Mistakes

### ❌ Mistake 1: Typo in Variable Name
- Must be exactly: `VITE_SOCKET_URL`
- NOT: `SOCKET_URL`, `REACT_APP_SOCKET_URL`, or `VUE_SOCKET_URL`

### ❌ Mistake 2: Wrong URL Format
- Must start with `https://` (not `http://`)
- Must be your Render URL (not localhost)
- No trailing slash at the end

### ❌ Mistake 3: Forgot to Redeploy
- Adding the variable alone doesn't work
- You MUST redeploy after adding it

### ❌ Mistake 4: Testing in Same Browser Tab
- Browser caches old version
- Always test in NEW INCOGNITO/PRIVATE window after redeploying

---

## 🆘 Still Not Working?

### Check 1: Is the Variable Actually There?

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Do you see `VITE_SOCKET_URL` in the list?
3. Click the **eye icon** to reveal the value
4. Is it `https://card-game-server-b3lz.onrender.com`?

### Check 2: Did You Redeploy?

1. Go to Deployments tab
2. Check the timestamp of the latest deployment
3. It should be AFTER you added the environment variable

### Check 3: Clear Browser Cache

1. Open your site in **Incognito/Private mode**
2. Or clear your browser cache:
   - Chrome: Ctrl+Shift+Delete → Clear cached images and files
   - Then refresh the page

### Check 4: Check Build Logs

1. Go to Deployments → Latest Deployment
2. Click on the **"Building"** section
3. Search for `VITE_SOCKET_URL` in the logs
4. You should see: `VITE_SOCKET_URL: "https://card-game-server-b3lz.onrender.com"`

---

## 📸 Visual Guide

When you're in Vercel Settings → Environment Variables, it should look like this:

```
┌─────────────────────────────────────────────────────────────┐
│ Environment Variables                                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Key:   [VITE_SOCKET_URL                              ]     │
│                                                             │
│ Value: [https://card-game-server-b3lz.onrender.com  ]     │
│                                                             │
│ Environments:                                               │
│ ☑ Production  ☑ Preview  ☑ Development                    │
│                                                             │
│                                    [Save]                   │
└─────────────────────────────────────────────────────────────┘
```

After saving, you should see it in the table:

```
┌──────────────────┬────────────────────────────────────────┬─────────────────────┐
│ Name             │ Value                                  │ Environments        │
├──────────────────┼────────────────────────────────────────┼─────────────────────┤
│ VITE_SOCKET_URL  │ https://card-game-server-b3lz.ond...  │ Production, Prev... │
└──────────────────┴────────────────────────────────────────┴─────────────────────┘
```

---

## ✅ Success Checklist

- [ ] Environment variable `VITE_SOCKET_URL` is visible in Vercel Settings
- [ ] Value is `https://card-game-server-b3lz.onrender.com`
- [ ] All three environments are checked (Production, Preview, Development)
- [ ] Clicked "Save" button
- [ ] Redeployed the site (either from Vercel or GitHub push)
- [ ] Waited for deployment to finish (shows "Ready")
- [ ] Tested in NEW incognito/private window
- [ ] Console shows connection to Render URL (not localhost)
- [ ] Game loads and works!

---

**Once you complete ALL steps above, your game should work! If it still doesn't, let me know which step is failing.**
