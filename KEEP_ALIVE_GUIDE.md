# 🔥 Keep Backend Alive Guide

Your Render free tier backend spins down after 15 minutes of inactivity. Here are multiple ways to keep it awake:

---

## Option 1: Browser Tab (Simplest)

**Just open `keep-alive.html` in your browser and keep the tab open!**

1. Open `keep-alive.html` in Chrome/Firefox
2. Keep the tab open (can be in background)
3. The page will ping your backend every 10 minutes
4. You'll see live stats and logs

**Pros:**
- Zero setup
- Visual dashboard
- Works immediately

**Cons:**
- Requires keeping browser tab open
- Stops if computer sleeps

---

## Option 2: UptimeRobot (Recommended - Free & Automated)

**Set up free automated monitoring that keeps your backend alive 24/7:**

### Steps:

1. **Sign up at [UptimeRobot.com](https://uptimerobot.com)** (free account)

2. **Create a new monitor:**
   - Click "Add New Monitor"
   - Monitor Type: **HTTP(s)**
   - Friendly Name: `Flashcard Engine Backend`
   - URL: `https://flashcard-engine-api-gfzf.onrender.com/health`
   - Monitoring Interval: **5 minutes** (free tier)
   - Click "Create Monitor"

3. **Done!** UptimeRobot will ping your backend every 5 minutes forever.

**Pros:**
- ✅ Completely automated
- ✅ Works 24/7 even when your computer is off
- ✅ Free forever
- ✅ Email alerts if backend goes down
- ✅ Uptime statistics dashboard

**Cons:**
- None! This is the best option.

---

## Option 3: Cron-Job.org (Alternative Free Service)

1. **Sign up at [Cron-Job.org](https://cron-job.org)**

2. **Create a new cron job:**
   - URL: `https://flashcard-engine-api-gfzf.onrender.com/health`
   - Schedule: Every 10 minutes
   - Enable the job

3. **Done!** Your backend will be pinged automatically.

**Pros:**
- Free and automated
- Works 24/7

**Cons:**
- Slightly more complex than UptimeRobot

---

## Option 4: Node.js Script (For Local Development)

If you want to run a keep-alive script on your computer:

```bash
# Install Node.js if you haven't already
# Then run:
node keep-alive.js
```

Keep the terminal window open. The script will ping every 10 minutes.

**Pros:**
- Simple script
- Full control

**Cons:**
- Requires keeping terminal open
- Stops if computer sleeps

---

## Option 5: GitHub Actions (Advanced - Free)

Create a GitHub Action that pings your backend every 10 minutes:

1. Create `.github/workflows/keep-alive.yml`:

```yaml
name: Keep Backend Alive

on:
  schedule:
    - cron: '*/10 * * * *'  # Every 10 minutes
  workflow_dispatch:  # Manual trigger

jobs:
  ping:
    runs-on: ubuntu-latest
    steps:
      - name: Ping Backend
        run: |
          curl -f https://flashcard-engine-api-gfzf.onrender.com/health || exit 1
      - name: Log Success
        run: echo "Backend is alive at $(date)"
```

2. Commit and push to GitHub
3. Enable the workflow in Actions tab

**Pros:**
- Completely automated
- Free with GitHub
- Runs in the cloud

**Cons:**
- Requires GitHub repository
- More complex setup

---

## Recommended Setup

**For the hackathon/demo:**
- Use **Option 1** (keep-alive.html) - just open it before your demo

**For long-term production:**
- Use **Option 2** (UptimeRobot) - set it and forget it

---

## Current Backend Status

- **URL:** https://flashcard-engine-api-gfzf.onrender.com
- **Health Check:** https://flashcard-engine-api-gfzf.onrender.com/health
- **Spin-down Time:** 15 minutes of inactivity
- **Cold Start Time:** ~30-60 seconds

---

## Testing

To test if your keep-alive is working:

1. Wait 20 minutes without any activity
2. Try accessing your frontend: https://flashcard-engine-lac.vercel.app
3. If it loads instantly (not after 30-60 seconds), your keep-alive is working!

---

## Notes

- Render's free tier has 750 hours/month of runtime
- With keep-alive, you'll use ~720 hours/month (30 days × 24 hours)
- This is within the free tier limit ✅
- Your backend will stay warm and respond instantly

---

## Quick Start (Right Now)

**Want to keep it alive immediately?**

1. Open `keep-alive.html` in your browser
2. Keep the tab open
3. Done! Your backend will stay awake.

**Want to set it and forget it?**

1. Go to [UptimeRobot.com](https://uptimerobot.com)
2. Sign up (takes 2 minutes)
3. Add monitor with URL: `https://flashcard-engine-api-gfzf.onrender.com/health`
4. Done! Your backend will stay awake 24/7.

---

Happy coding! 🚀
