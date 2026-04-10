import os
from dotenv import load_dotenv

load_dotenv()

# Database
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./flashcard_engine.db")

# JWT
JWT_SECRET = os.getenv("JWT_SECRET", "super-secret-key-change-in-production")
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 72

# AI Service Keys
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
PAGEINDEX_API_KEY = os.getenv("PAGEINDEX_API_KEY", "")

# CORS
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:8080")
ALLOWED_ORIGINS = [
    "http://localhost:8080",
    "http://localhost:5173",
    "http://localhost:3000",
    "https://flashcard-engine-lac.vercel.app",  # Production frontend
]

# Add frontend URL if provided and not already in list
if FRONTEND_URL and FRONTEND_URL not in ALLOWED_ORIGINS:
    ALLOWED_ORIGINS.append(FRONTEND_URL)

# For development: allow all origins if FRONTEND_URL is localhost
if "localhost" in FRONTEND_URL:
    ALLOWED_ORIGINS.append("*")

# File upload
MAX_PDF_SIZE_MB = 10
UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)
