"""
Job status endpoints for tracking background tasks.
"""
from fastapi import APIRouter, HTTPException, Depends
from services.job_manager import job_manager
from routes.auth import get_user_from_token
from models.user import User

router = APIRouter(prefix="/jobs", tags=["Jobs"])


@router.get("/{job_id}")
def get_job_status(job_id: str, user: User = Depends(get_user_from_token)):
    """
    Get the status of a background job.
    
    Returns:
        - status: pending, processing, completed, or failed
        - progress: 0-100
        - result: Job result (only when completed)
        - error: Error message (only when failed)
    """
    job = job_manager.get_job(job_id)
    
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    # Verify user owns this job (check metadata)
    if job.metadata.get("user_id") != user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    return job.to_dict()
