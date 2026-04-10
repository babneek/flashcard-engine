"""
Background job manager for long-running tasks like PDF processing.
Uses in-memory storage (can be upgraded to Redis for production).
"""
import uuid
import threading
from datetime import datetime
from typing import Dict, Any, Optional, Callable
from enum import Enum


class JobStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class Job:
    def __init__(self, job_id: str, job_type: str):
        self.job_id = job_id
        self.job_type = job_type
        self.status = JobStatus.PENDING
        self.progress = 0
        self.result = None
        self.error = None
        self.created_at = datetime.utcnow()
        self.updated_at = datetime.utcnow()
        self.metadata = {}
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "job_id": self.job_id,
            "job_type": self.job_type,
            "status": self.status,
            "progress": self.progress,
            "result": self.result,
            "error": self.error,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
            "metadata": self.metadata,
        }


class JobManager:
    """Manages background jobs with in-memory storage."""
    
    def __init__(self):
        self.jobs: Dict[str, Job] = {}
        self._lock = threading.Lock()
    
    def create_job(self, job_type: str, metadata: Optional[Dict] = None) -> str:
        """Create a new job and return its ID."""
        job_id = str(uuid.uuid4())
        job = Job(job_id, job_type)
        if metadata:
            job.metadata = metadata
        
        with self._lock:
            self.jobs[job_id] = job
        
        return job_id
    
    def get_job(self, job_id: str) -> Optional[Job]:
        """Get job by ID."""
        with self._lock:
            return self.jobs.get(job_id)
    
    def update_job(
        self,
        job_id: str,
        status: Optional[JobStatus] = None,
        progress: Optional[int] = None,
        result: Optional[Any] = None,
        error: Optional[str] = None,
    ):
        """Update job status and data."""
        with self._lock:
            job = self.jobs.get(job_id)
            if not job:
                return
            
            if status:
                job.status = status
            if progress is not None:
                job.progress = progress
            if result is not None:
                job.result = result
            if error is not None:
                job.error = error
            
            job.updated_at = datetime.utcnow()
    
    def run_job_async(self, job_id: str, task_func: Callable, *args, **kwargs):
        """Run a job function in a background thread."""
        def wrapper():
            try:
                self.update_job(job_id, status=JobStatus.PROCESSING, progress=0)
                result = task_func(job_id, *args, **kwargs)
                self.update_job(job_id, status=JobStatus.COMPLETED, progress=100, result=result)
            except Exception as e:
                error_msg = str(e)
                print(f"❌ Job {job_id} failed: {error_msg}")
                import traceback
                traceback.print_exc()
                self.update_job(job_id, status=JobStatus.FAILED, error=error_msg)
        
        thread = threading.Thread(target=wrapper, daemon=True)
        thread.start()
    
    def cleanup_old_jobs(self, max_age_hours: int = 24):
        """Remove jobs older than max_age_hours."""
        now = datetime.utcnow()
        with self._lock:
            to_remove = []
            for job_id, job in self.jobs.items():
                age_hours = (now - job.created_at).total_seconds() / 3600
                if age_hours > max_age_hours:
                    to_remove.append(job_id)
            
            for job_id in to_remove:
                del self.jobs[job_id]
            
            if to_remove:
                print(f"🧹 Cleaned up {len(to_remove)} old jobs")


# Global job manager instance
job_manager = JobManager()
