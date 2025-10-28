# Deployment Guide

## 🌐 Frontend Deployment (Vercel)

### Prerequisites
- GitHub account
- Vercel account (sign up at https://vercel.com)
- Code pushed to GitHub repository

### Step 1: Push Code to GitHub
```bash
git add .
git commit -m "Prepare for deployment"
git push origin main
```

### Step 2: Deploy to Vercel

#### Option A: Using Vercel Dashboard (Recommended)
1. Go to https://vercel.com
2. Click "Add New Project"
3. Import your GitHub repository: `cosmic-project-forge`
4. Configure project:
   - **Framework Preset**: Vite
   - **Root Directory**: `./` (keep default)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

5. Add Environment Variables (if needed):
   - Click "Environment Variables"
   - Add any frontend env vars (currently none required)

6. Click "Deploy"
7. Wait 2-3 minutes for deployment to complete
8. Your site will be live at: `https://cosmic-project-forge.vercel.app`

#### Option B: Using Vercel CLI
```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy (from project root)
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? (select your account)
# - Link to existing project? No
# - Project name? cosmic-project-forge
# - In which directory is your code? ./
# - Auto-detected settings? Yes

# Deploy to production
vercel --prod
```

### Step 3: Update API URL
After backend is deployed, update the API URL in your frontend:

1. Create `src/config/api.ts` (if not exists):
```typescript
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
```

2. Update all API calls to use `API_URL`:
```typescript
import { API_URL } from '@/config/api';

fetch(`${API_URL}/api/auth/login`, { ... })
```

3. Add environment variable in Vercel:
   - Go to Project Settings → Environment Variables
   - Add: `VITE_API_URL` = `https://your-backend-url.onrender.com`
   - Redeploy

### Vercel Configuration (Optional)
Create `vercel.json` in project root:
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "vite",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

---

## 🖥️ Backend Deployment (Render)

### Prerequisites
- GitHub account
- Render account (sign up at https://render.com)
- MongoDB Atlas account (already set up)

### Step 1: Prepare Backend for Deployment

#### 1.1 Create `render.yaml` in project root:
```yaml
services:
  - type: web
    name: cosmic-project-forge-backend
    env: python
    region: oregon
    plan: free
    branch: main
    buildCommand: "cd backend && pip install -r requirements.txt"
    startCommand: "cd backend && python main.py"
    healthCheckPath: /health
    envVars:
      - key: PYTHON_VERSION
        value: 3.13.1
      - key: MONGODB_URI
        sync: false
      - key: JWT_SECRET_KEY
        sync: false
      - key: JWT_REFRESH_SECRET_KEY
        sync: false
```

#### 1.2 Update `backend/main.py` for production:
```python
if __name__ == "__main__":
    import os
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
```

#### 1.3 Create `backend/requirements.txt` (verify all packages):
```txt
fastapi>=0.115.0
uvicorn[standard]>=0.30.0
motor>=3.6.0
pydantic>=2.10.0
pydantic-settings>=2.6.0
python-jose[cryptography]
passlib[bcrypt]==4.1.3
bcrypt==4.1.3
python-multipart
python-dotenv
email-validator
hashids
```

### Step 2: Deploy to Render

#### Option A: Using Render Dashboard (Recommended)

1. Go to https://render.com/dashboard
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure service:
   - **Name**: `cosmic-project-forge-backend`
   - **Region**: Oregon (or closest to you)
   - **Branch**: `main`
   - **Root Directory**: Leave blank
   - **Runtime**: Python 3
   - **Build Command**: 
     ```bash
     cd backend && pip install -r requirements.txt
     ```
   - **Start Command**: 
     ```bash
     cd backend && python main.py
     ```
   - **Plan**: Free

5. Add Environment Variables:
   - Click "Advanced" → "Add Environment Variable"
   - Add these variables:
     ```
     MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/cosmic_project_forge?retryWrites=true&w=majority
     JWT_SECRET_KEY=your-super-secret-jwt-key-change-this-in-production
     JWT_REFRESH_SECRET_KEY=your-refresh-secret-key-change-this-too
     PYTHON_VERSION=3.13.1
     PORT=8000
     ```

6. Click "Create Web Service"
7. Wait 5-10 minutes for deployment
8. Your API will be live at: `https://cosmic-project-forge-backend.onrender.com`

#### Option B: Using render.yaml (Automatic)

1. Create `render.yaml` (already done above)
2. Push to GitHub
3. Go to Render Dashboard → "New +" → "Blueprint"
4. Connect repository and select `render.yaml`
5. Add environment variables in Render dashboard
6. Click "Apply"

### Step 3: Update CORS Settings

Update `backend/main.py` to allow your Vercel domain:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://cosmic-project-forge.vercel.app",  # Add your Vercel URL
        "https://*.vercel.app",  # Allow all Vercel preview deployments
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)
```

### Step 4: Test Deployment

1. Test backend health endpoint:
   ```bash
   curl https://cosmic-project-forge-backend.onrender.com/health
   ```

2. Test API docs:
   - Visit: `https://cosmic-project-forge-backend.onrender.com/docs`

3. Test frontend:
   - Visit: `https://cosmic-project-forge.vercel.app`
   - Try logging in, browsing galaxies, etc.

---

## 🔧 Post-Deployment Configuration

### Update Frontend API URL

1. In Vercel Dashboard:
   - Go to Project Settings → Environment Variables
   - Add: `VITE_API_URL` = `https://cosmic-project-forge-backend.onrender.com`
   - Redeploy from Deployments tab

2. Or update `src/config/api.ts`:
   ```typescript
   export const API_URL = import.meta.env.VITE_API_URL || 
     import.meta.env.PROD 
       ? 'https://cosmic-project-forge-backend.onrender.com'
       : 'http://localhost:8000';
   ```

### MongoDB Atlas Network Access

1. Go to MongoDB Atlas
2. Network Access → Add IP Address
3. Add Render's IP addresses or allow from anywhere (0.0.0.0/0)
4. Save

---

## 📝 Important Notes

### Render Free Tier Limitations
- Service spins down after 15 minutes of inactivity
- First request after spin-down takes 30-60 seconds
- 750 hours/month free (enough for 1 service)

### Solutions:
1. **Keep-alive service**: Use a service like UptimeRobot to ping your API every 14 minutes
2. **Upgrade to paid plan**: $7/month for always-on service

### Vercel Free Tier
- Unlimited bandwidth
- 100GB bandwidth/month
- Automatic SSL
- Global CDN

---

## 🚨 Troubleshooting

### Backend Issues

**Issue**: Service won't start
- Check build logs in Render dashboard
- Verify all dependencies in requirements.txt
- Check environment variables are set

**Issue**: MongoDB connection fails
- Verify MongoDB URI is correct
- Check IP whitelist in MongoDB Atlas
- Ensure URI is URL-encoded (special characters)

**Issue**: CORS errors
- Update CORS origins in main.py
- Clear browser cache
- Check browser console for exact error

### Frontend Issues

**Issue**: API calls fail
- Verify VITE_API_URL environment variable
- Check Network tab in browser DevTools
- Ensure backend is running

**Issue**: Build fails
- Check build logs in Vercel
- Verify all dependencies in package.json
- Test build locally: `npm run build`

**Issue**: Routes don't work (404 on refresh)
- Ensure vercel.json has rewrite rules
- Or Vercel should auto-detect Vite SPA

---

## 🔄 Continuous Deployment

Both Vercel and Render support automatic deployments:

1. **Push to GitHub** → Automatically deploys
2. **Preview Deployments** (Vercel): Each PR gets a preview URL
3. **Production Branch**: Deploy from `main` branch only

### Enable Auto-Deploy
- Vercel: Already enabled by default
- Render: Enable "Auto-Deploy" in service settings

---

## ✅ Deployment Checklist

### Before Deploying:
- [ ] All code committed and pushed to GitHub
- [ ] MongoDB Atlas IP whitelist updated
- [ ] Environment variables documented
- [ ] CORS settings configured
- [ ] Test locally: `npm run build` (frontend)
- [ ] Test locally: Backend runs in production mode

### During Deployment:
- [ ] Frontend deployed to Vercel
- [ ] Backend deployed to Render
- [ ] Environment variables added to both
- [ ] Custom domains configured (optional)

### After Deployment:
- [ ] Test all major features
- [ ] Check API health endpoint
- [ ] Verify authentication works
- [ ] Test file uploads (if any)
- [ ] Monitor logs for errors
- [ ] Set up monitoring (UptimeRobot)

---

## 🎉 Success!

Your app should now be live:
- **Frontend**: https://cosmic-project-forge.vercel.app
- **Backend**: https://cosmic-project-forge-backend.onrender.com
- **API Docs**: https://cosmic-project-forge-backend.onrender.com/docs

Need help? Check the platform docs:
- [Vercel Docs](https://vercel.com/docs)
- [Render Docs](https://render.com/docs)
