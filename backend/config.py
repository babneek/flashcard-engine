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
    FRONTEND_URL,
]

# Add Vercel preview URLs if FRONTEND_URL contains vercel.app
if "vercel.app" in FRONTEND_URL:
    ALLOWED_ORIGINS.append("https://*.vercel.app")

# File upload
MAX_PDF_SIZE_MB = 10
UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)
