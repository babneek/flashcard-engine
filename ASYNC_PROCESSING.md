# Async PDF Processing Implementation

## Overview
Implemented background job processing to handle long-running PDF uploads without timeout issues.

## Changes Made

### Backend

1. **New: `backend/services/job_manager.py`**
   - In-memory job tracking system
   - Thread-based background processing
   - Job statuses: pending, processing, completed, failed
   - Progress tracking (0-100%)

2. **New: `backend/routes/jobs.py`**
   - `GET /jobs/{job_id}` - Check job status
   - Returns progress, status, result, or error

3. **Updated: `backend/routes/decks.py`**
   - `POST /decks/{deck_id}/upload-pdf` now returns immediately with `job_id`
   - PDF processing happens in background thread
   - Progress updates at key stages (10%, 20%, 30%, 80%, 100%)

4. **Updated: `backend/main.py`**
   - Registered jobs router

### Frontend

1. **Updated: `frontend/src/lib/api.ts`**
   - `apiUploadPdf()` now polls job status every 5 seconds
   - Max 10 minutes timeout (120 attempts × 5 seconds)
   - Returns result when job completes
   - Throws error if job fails

## How It Works

```
User uploads PDF
     ↓
Backend saves file immediately
     ↓
Returns job_id (< 1 second)
     ↓
Background thread processes PDF
     ↓
Frontend polls /jobs/{job_id} every 5s
     ↓
Returns result when complete
```

## Benefits

✅ No timeout issues on Render (30s limit)
✅ No timeout issues on Vercel frontend
✅ User gets immediate feedback
✅ Can handle PDFs of any size
✅ Progress tracking
✅ Better error handling

## Testing Locally

1. Start backend: `cd backend && uvicorn main:app --reload`
2. Start frontend: `cd frontend && npm run dev`
3. Upload a PDF
4. Watch console for job progress logs

## Deployment

No additional dependencies needed. Works with existing setup:
- Render backend (free tier)
- Vercel frontend (free tier)

## Future Improvements

- Add Redis for persistent job storage (survives restarts)
- Add WebSocket for real-time progress updates
- Add job cancellation
- Add job cleanup scheduler
