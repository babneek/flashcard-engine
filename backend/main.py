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

os.makedirs(UPLOAD_DIR, exist_ok=True)

try:
    app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")
except Exception as e:
    print(f"Warning: Could not mount uploads directory: {e}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(decks_router)
app.include_router(cards_router)
app.include_router(stats_router)
app.include_router(progress_router)


@app.on_event("startup")
def on_startup():
    init_db()


@app.get("/")
@app.head("/")
def root():
    return {"message": "Flashcard Engine API", "version": "1.0.0"}


@app.get("/health")
@app.head("/health")
def health():
    return {"status": "ok"}


@app.get("/debug/config")
def debug_config():
    from config import GROQ_API_KEY, DATABASE_URL
    return {
        "groq_configured": bool(GROQ_API_KEY),
        "groq_key_prefix": GROQ_API_KEY[:8] + "..." if GROQ_API_KEY else "NOT SET",
        "database": "postgresql" if "postgresql" in DATABASE_URL else "sqlite",
        "allowed_origins": ALLOWED_ORIGINS,
    }


@app.get("/debug/test-groq")
def test_groq():
    from config import GROQ_API_KEY
    if not GROQ_API_KEY:
        return {"status": "error", "message": "GROQ_API_KEY not set"}
    try:
        from groq import Groq
        client = Groq(api_key=GROQ_API_KEY)
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": "Say 'Groq works!' and nothing else."}],
            max_tokens=20,
        )
        return {"status": "ok", "response": response.choices[0].message.content}
    except Exception as e:
        return {"status": "error", "message": str(e), "type": type(e).__name__}


@app.delete("/admin/reset-db")
def reset_db():
    """Clears all data - drop and recreate tables."""
    from database.connection import Base, engine
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    return {"status": "ok", "message": "Database cleared!"}
