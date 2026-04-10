# Deploy Backend to Fly.io

## Why Fly.io?
- ✅ 1GB RAM (vs Render's 512MB)
- ✅ Better free tier
- ✅ Persistent volumes for uploads
- ✅ Auto-scaling
- ✅ No cold starts

## Prerequisites

1. **Install flyctl CLI:**
   ```bash
   # Windows (PowerShell)
   iwr https://fly.io/install.ps1 -useb | iex
   
   # Mac/Linux
   curl -L https://fly.io/install.sh | sh
   ```

2. **Sign up and login:**
   ```bash
   flyctl auth signup
   # or if you have an account
   flyctl auth login
   ```

## Deployment Steps

### 1. Navigate to backend folder
```bash
cd backend
```

### 2. Launch the app (first time)
```bash
flyctl launch
```

When prompted:
- **App name:** `flashcard-engine-api` (or your choice)
- **Region:** Choose closest to you (e.g., `sjc` for San Jose)
- **PostgreSQL:** No (we're using SQLite)
- **Redis:** No
- **Deploy now:** No (we need to set secrets first)

### 3. Set environment variables (secrets)
```bash
flyctl secrets set GROQ_API_KEY="your-groq-api-key-here"
flyctl secrets set JWT_SECRET="flashcard-engine-super-secret-jwt-key-2026"
flyctl secrets set FRONTEND_URL="https://flashcard-engine-lac.vercel.app"
```

### 4. Deploy
```bash
flyctl deploy
```

### 5. Get your app URL
```bash
flyctl info
```

Your backend will be at: `https://flashcard-engine-api.fly.dev`

### 6. Update Vercel frontend
Go to Vercel dashboard:
- Settings → Environment Variables
- Update `VITE_API_URL` to: `https://flashcard-engine-api.fly.dev`
- Redeploy

## Useful Commands

```bash
# View logs
flyctl logs

# Check status
flyctl status

# SSH into machine
flyctl ssh console

# Scale memory (if needed)
flyctl scale memory 2048

# Stop app
flyctl apps stop flashcard-engine-api

# Restart app
flyctl apps restart flashcard-engine-api
```

## Troubleshooting

**Out of memory?**
```bash
flyctl scale memory 2048
```

**Need persistent storage for uploads?**
```bash
flyctl volumes create uploads --size 1
```

Then update `fly.toml`:
```toml
[mounts]
  source = "uploads"
  destination = "/app/uploads"
```

## Cost

- **Free tier:** 3 shared-cpu-1x machines with 256MB RAM each
- **Paid:** ~$1.94/month for 1GB RAM machine (only when running)
- **Auto-stop:** Machines stop when idle (saves money)
