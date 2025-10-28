# Quick Deployment Steps

## 🚀 Quick Start (5 minutes)

### 1. Deploy Frontend to Vercel (2 minutes)

```bash
# Make sure code is committed
git add .
git commit -m "Ready for deployment"
git push origin main
```

Then:
1. Go to https://vercel.com
2. Click "Add New Project"
3. Select your GitHub repo: `cosmic-project-forge`
4. Click "Deploy" (use default settings)
5. Done! ✅

Your frontend will be at: `https://cosmic-project-forge.vercel.app`

---

### 2. Deploy Backend to Render (3 minutes)

1. Go to https://render.com/dashboard
2. Click "New +" → "Web Service"
3. Connect your GitHub repo
4. Fill in:
   - **Name**: `cosmic-project-forge-backend`
   - **Build Command**: `cd backend && pip install -r requirements.txt`
   - **Start Command**: `cd backend && python main.py`

5. Add Environment Variables (click "Advanced"):
   ```
   MONGODB_URI=your_mongodb_connection_string_here
   JWT_SECRET_KEY=your-secret-key-here
   JWT_REFRESH_SECRET_KEY=your-refresh-key-here
   PYTHON_VERSION=3.13.1
   ```

6. Click "Create Web Service"
7. Wait 5-10 minutes for build
8. Done! ✅

Your backend will be at: `https://cosmic-project-forge-backend.onrender.com`

---

### 3. Connect Frontend to Backend (1 minute)

1. Copy your Render backend URL
2. Go to Vercel → Your Project → Settings → Environment Variables
3. Add: 
   - **Key**: `VITE_API_BASE_URL`
   - **Value**: `https://your-backend-url.onrender.com`
4. Go to Deployments tab → Click "..." → Redeploy
5. Done! ✅

---

### 4. Update MongoDB Atlas (30 seconds)

1. Go to MongoDB Atlas
2. Network Access → "Add IP Address"
3. Click "Allow Access from Anywhere" (0.0.0.0/0)
4. Confirm
5. Done! ✅

---

## ✅ Test Your Deployment

Visit: `https://cosmic-project-forge.vercel.app`

Try:
- [ ] Homepage loads
- [ ] Can view galaxies
- [ ] Can login/register
- [ ] Can browse projects
- [ ] Chat works at `/chat`

---

## 🆘 Common Issues

### Issue: "Failed to fetch" errors
**Fix**: Make sure you added `VITE_API_BASE_URL` to Vercel and redeployed

### Issue: Backend shows "Application failed to respond"
**Fix**: Check Render logs. Usually missing environment variables or MongoDB connection

### Issue: Backend is slow (30+ seconds)
**This is normal** on Render free tier - first request after 15 min idle takes time

---

## 📝 Environment Variables Needed

### Vercel (Frontend)
- `VITE_API_BASE_URL` - Your Render backend URL

### Render (Backend)
- `MONGODB_URI` - From MongoDB Atlas
- `JWT_SECRET_KEY` - Any random string (32+ characters)
- `JWT_REFRESH_SECRET_KEY` - Another random string
- `PYTHON_VERSION` - 3.13.1

---

## 🎉 That's It!

Your app is now live and deployed! 🚀

For detailed instructions, see: `DEPLOYMENT.md`
