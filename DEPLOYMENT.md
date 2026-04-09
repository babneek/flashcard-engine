# 🚀 Deployment Guide

This guide will help you deploy the Flashcard Engine to production.

## Architecture

- **Backend**: Render (FastAPI)
- **Frontend**: Vercel (React + Vite)
- **Database**: SQLite (on Render disk)

---

## 📦 Backend Deployment (Render)

### Step 1: Create Render Account
1. Go to [render.com](https://render.com)
2. Sign up with GitHub

### Step 2: Create New Web Service
1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository: `babneek/flashcard-engine`
3. Configure the service:

**Basic Settings:**
- **Name**: `flashcard-engine-api`
- **Region**: Oregon (US West) or closest to you
- **Branch**: `main`
- **Root Directory**: `backend`
- **Runtime**: Python 3
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`

**Instance Type:**
- Select **Free** tier

### Step 3: Environment Variables
Add these environment variables in Render dashboard:

```
GROQ_API_KEY=your_groq_api_key_here
JWT_SECRET=your-super-secret-jwt-key-change-this
FRONTEND_URL=https://your-app.vercel.app
```

**Important**: 
- Get your Groq API key from [console.groq.com](https://console.groq.com)
- Generate a secure JWT_SECRET (use a password generator)
- You'll update FRONTEND_URL after deploying frontend

### Step 4: Deploy
1. Click **"Create Web Service"**
2. Wait for deployment (5-10 minutes)
3. Note your backend URL: `https://flashcard-engine-api.onrender.com`

### Step 5: Test Backend
Visit: `https://your-backend-url.onrender.com/health`

Should return: `{"status": "ok"}`

---

## 🌐 Frontend Deployment (Vercel)

### Step 1: Create Vercel Account
1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub

### Step 2: Import Project
1. Click **"Add New..."** → **"Project"**
2. Import `babneek/flashcard-engine`
3. Configure the project:

**Framework Preset:** Vite

**Root Directory:** `frontend`

**Build Settings:**
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

### Step 3: Environment Variables
Add this environment variable:

```
VITE_API_URL=https://your-backend-url.onrender.com
```

Replace with your actual Render backend URL from Step 4 above.

### Step 4: Deploy
1. Click **"Deploy"**
2. Wait for deployment (2-3 minutes)
3. Note your frontend URL: `https://your-app.vercel.app`

### Step 5: Update Backend CORS
1. Go back to Render dashboard
2. Update `FRONTEND_URL` environment variable with your Vercel URL
3. Trigger a manual deploy to apply changes

---

## ✅ Post-Deployment Checklist

### Test the Application

1. **Visit your frontend URL**
   - Should load the login page

2. **Register a new account**
   - Email: `test@example.com`
   - Password: `test123`

3. **Create a deck**
   - Upload a PDF or enter a topic
   - Verify cards are generated

4. **Study cards**
   - Test the flashcard interface
   - Rate some cards
   - Check progress dashboard

### Verify Features

- [ ] User registration and login
- [ ] PDF upload and card generation
- [ ] Flashcard study interface
- [ ] Progress dashboard
- [ ] Time analytics
- [ ] Dark mode toggle
- [ ] Search functionality
- [ ] Mobile responsiveness

---

## 🔧 Configuration

### Backend Environment Variables

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `GROQ_API_KEY` | Groq API key for AI generation | Yes | `gsk_...` |
| `JWT_SECRET` | Secret key for JWT tokens | Yes | `super-secret-key` |
| `FRONTEND_URL` | Frontend URL for CORS | Yes | `https://app.vercel.app` |
| `DATABASE_URL` | Database connection (auto) | No | `sqlite:///./flashcard_engine.db` |

### Frontend Environment Variables

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `VITE_API_URL` | Backend API URL | Yes | `https://api.onrender.com` |

---

## 🐛 Troubleshooting

### Backend Issues

**Problem**: Build fails on Render
- **Solution**: Check Python version (should be 3.11+)
- **Solution**: Verify all dependencies in requirements.txt

**Problem**: CORS errors
- **Solution**: Ensure FRONTEND_URL matches your Vercel URL exactly
- **Solution**: Redeploy backend after updating environment variables

**Problem**: Database errors
- **Solution**: Render free tier has ephemeral storage - database resets on sleep
- **Solution**: Upgrade to paid tier for persistent disk

### Frontend Issues

**Problem**: API calls fail
- **Solution**: Verify VITE_API_URL is set correctly
- **Solution**: Check browser console for CORS errors
- **Solution**: Ensure backend is running (visit /health endpoint)

**Problem**: Build fails on Vercel
- **Solution**: Check Node.js version (should be 18+)
- **Solution**: Verify package.json has all dependencies

**Problem**: 404 on refresh
- **Solution**: Already handled by vercel.json rewrites
- **Solution**: If still occurs, check vercel.json is in frontend folder

---

## 📊 Monitoring

### Render Dashboard
- View logs: Click on your service → "Logs" tab
- Monitor usage: Check "Metrics" tab
- Restart service: "Manual Deploy" → "Clear build cache & deploy"

### Vercel Dashboard
- View deployments: Project → "Deployments"
- Check logs: Click on deployment → "View Function Logs"
- Analytics: "Analytics" tab (requires upgrade)

---

## 🔄 Continuous Deployment

Both Render and Vercel are configured for automatic deployment:

1. **Push to GitHub main branch**
2. **Render automatically rebuilds backend**
3. **Vercel automatically rebuilds frontend**
4. **Changes go live in 2-5 minutes**

---

## 💰 Cost Breakdown

### Free Tier (Current Setup)
- **Render**: Free (750 hours/month, sleeps after 15 min inactivity)
- **Vercel**: Free (100 GB bandwidth, unlimited deployments)
- **Total**: $0/month

### Limitations
- Backend sleeps after 15 minutes of inactivity (30s cold start)
- Database resets when backend sleeps
- 512 MB RAM on backend

### Recommended Upgrade (Production)
- **Render**: $7/month (persistent disk, no sleep)
- **Vercel**: Free tier is sufficient
- **Total**: $7/month

---

## 🔐 Security Checklist

- [ ] Change JWT_SECRET from default
- [ ] Use strong Groq API key
- [ ] Enable HTTPS only (automatic on Render/Vercel)
- [ ] Set secure CORS origins
- [ ] Don't commit .env files
- [ ] Rotate API keys periodically

---

## 📈 Scaling Considerations

### When to Upgrade

**Render Backend:**
- Upgrade when you need:
  - Persistent database
  - No cold starts
  - More RAM (1GB+)
  - Custom domain

**Vercel Frontend:**
- Free tier handles:
  - 100 GB bandwidth/month
  - Unlimited deployments
  - Automatic HTTPS
  - Global CDN

### Database Migration

When ready for production, migrate from SQLite to PostgreSQL:

1. **Add PostgreSQL on Render**
   - Create PostgreSQL database
   - Get connection URL

2. **Update Backend**
   - Set `DATABASE_URL` environment variable
   - SQLAlchemy automatically handles PostgreSQL

3. **Run Migrations**
   - No code changes needed!
   - Database tables auto-create on startup

---

## 🎉 Success!

Your Flashcard Engine is now live! 

- **Frontend**: https://your-app.vercel.app
- **Backend**: https://your-api.onrender.com
- **API Docs**: https://your-api.onrender.com/docs

Share your app and start learning! 🚀📚
