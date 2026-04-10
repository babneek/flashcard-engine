from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
from database.connection import init_db
from routes.auth import router as auth_router
from routes.decks import router as decks_router
from routes.cards import router as cards_router
from routes.stats import router as stats_router
from routes.progress import router as progress_router
from config import ALLOWED_ORIGINS, UPLOAD_DIR

app = FastAPI(title="Flashcard Engine API", version="1.0.0")

# Ensure upload directory exists
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Serve uploaded PDFs
try:
    app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")
except Exception as e:
    print(f"Warning: Could not mount uploads directory: {e}")

# CORS - Allow frontend origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth_router)
app.include_router(decks_router)
app.include_router(cards_router)
app.include_router(stats_router)
app.include_router(progress_router)


@app.on_event("startup")
def on_startup():
    init_db()


@app.get("/")
def root():
    return {"message": "Flashcard Engine API", "version": "1.0.0"}


@app.get("/health")
def health():
    return {"status": "ok"}
