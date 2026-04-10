# 🚀 Quick Deployment Checklist

Follow these steps to deploy your Flashcard Engine in under 15 minutes!

## ✅ Pre-Deployment

- [ ] GitHub repository is up to date
- [ ] You have a Groq API key ([Get one](https://console.groq.com))
- [ ] You have accounts on:
  - [ ] [Render.com](https://render.com) (for backend)
  - [ ] [Vercel.com](https://vercel.com) (for frontend)

---

## 🔧 Backend Deployment (Render) - 5 minutes

### 1. Create Web Service
- [ ] Go to [Render Dashboard](https://dashboard.render.com)
- [ ] Click **"New +"** → **"Web Service"**
- [ ] Connect GitHub: `babneek/flashcard-engine`

### 2. Configure Service
```
Name: flashcard-engine-api
Region: Oregon (US West)
Branch: main
Root Directory: backend
Runtime: Python 3
Build Command: pip install -r requirements.txt
Start Command: uvicorn main:app --host 0.0.0.0 --port $PORT
Instance: Free
```

### 3. Add Environment Variables
```
GROQ_API_KEY = your_groq_api_key_here
JWT_SECRET = generate-a-secure-random-string-here
FRONTEND_URL = https://your-app.vercel.app (update after frontend deploy)
```

### 4. Deploy
- [ ] Click **"Create Web Service"**
- [ ] Wait 5-10 minutes for build
- [ ] Copy your backend URL: `https://flashcard-engine-api.onrender.com`
- [ ] Test: Visit `https://your-backend-url.onrender.com/health`
  - Should return: `{"status": "ok"}`

---

## 🌐 Frontend Deployment (Vercel) - 3 minutes

### 1. Import Project
- [ ] Go to [Vercel Dashboard](https://vercel.com/dashboard)
- [ ] Click **"Add New..."** → **"Project"**
- [ ] Import: `babneek/flashcard-engine`

### 2. Configure Project
```
Framework Preset: Vite
Root Directory: frontend
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

### 3. Add Environment Variable
```
VITE_API_URL = https://your-backend-url.onrender.com
```
(Use the URL from Render backend deployment)

### 4. Deploy
- [ ] Click **"Deploy"**
- [ ] Wait 2-3 minutes
- [ ] Copy your frontend URL: `https://your-app.vercel.app`

---

## 🔄 Update Backend CORS

### 1. Update Render Environment
- [ ] Go back to Render dashboard
- [ ] Open your web service
- [ ] Go to **"Environment"** tab
- [ ] Update `FRONTEND_URL` with your Vercel URL
- [ ] Click **"Save Changes"**

### 2. Redeploy
- [ ] Go to **"Manual Deploy"** → **"Deploy latest commit"**
- [ ] Wait 2-3 minutes

---

## ✅ Test Your Deployment

### 1. Visit Frontend
- [ ] Open your Vercel URL in browser
- [ ] Should see login page

### 2. Create Account
- [ ] Click **"Register"**
- [ ] Email: `test@example.com`
- [ ] Password: `test123`
- [ ] Should redirect to dashboard

### 3. Create Deck
- [ ] Click **"New Deck"**
- [ ] Name: `Test Deck`
- [ ] Upload a PDF or enter topic
- [ ] Wait for cards to generate
- [ ] Should see success message

### 4. Study Cards
- [ ] Click on your deck
- [ ] Click **"Start Review"**
- [ ] Flip cards and rate them
- [ ] Check progress dashboard

### 5. Test Features
- [ ] Dark mode toggle works
- [ ] Search finds decks
- [ ] Progress dashboard shows stats
- [ ] Mobile view is responsive

---

## 🎉 You're Live!

Your Flashcard Engine is now deployed!

**URLs:**
- Frontend: `https://your-app.vercel.app`
- Backend: `https://your-backend-url.onrender.com`
- API Docs: `https://your-backend-url.onrender.com/docs`

**Share your app:**
- [ ] Add URLs to GitHub README
- [ ] Share with friends
- [ ] Submit to Cuemath

---

## 📝 Notes

**Free Tier Limitations:**
- Backend sleeps after 15 min inactivity (30s cold start on first request)
- Database resets when backend sleeps
- 512 MB RAM

**To Upgrade:**
- Render: $7/month for persistent disk + no sleep
- Vercel: Free tier is sufficient for most use cases

**Need Help?**
- Check [DEPLOYMENT.md](DEPLOYMENT.md) for detailed guide
- Check Render logs for backend errors
- Check Vercel logs for frontend errors
- Check browser console for API errors

---

## 🔧 Common Issues

**CORS Error:**
- Ensure FRONTEND_URL in Render matches Vercel URL exactly
- Redeploy backend after updating environment variables

**API Not Found:**
- Check VITE_API_URL in Vercel is correct
- Ensure backend is running (visit /health endpoint)

**Cards Not Generating:**
- Check GROQ_API_KEY is set correctly in Render
- Check Render logs for errors

**Database Resets:**
- This is normal on free tier (ephemeral storage)
- Upgrade to paid tier for persistent disk
