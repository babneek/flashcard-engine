from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
import os
from pydantic import BaseModel
from sqlalchemy.orm import Session
from datetime import datetime
from database.connection import get_db
from models.user import User
from models.deck import Deck
from models.card import Card as CardModel
from routes.auth import get_user_from_token
from services.pdf_processor import save_uploaded_pdf, extract_text_from_pdf
from services.rag_engine import generate_cards_with_rag
from services.card_generator import generate_cards_from_text
from config import MAX_PDF_SIZE_MB, GROQ_API_KEY
import json

router = APIRouter(prefix="/decks", tags=["Decks"])


class CreateDeckRequest(BaseModel):
    name: str
    description: str = ""


class DeckResponse(BaseModel):
    id: str
    name: str
    description: str
    card_count: int
    created_at: str
    last_studied_at: str | None


@router.get("")
def list_decks(user: User = Depends(get_user_from_token), db: Session = Depends(get_db)):
    decks = db.query(Deck).filter(Deck.user_id == user.id).order_by(Deck.updated_at.desc()).all()
    return [
        {
            "id": d.id,
            "name": d.name,
            "description": d.description,
            "cardCount": d.card_count,
            "createdAt": d.created_at.isoformat()[:10] if d.created_at else "",
            "lastStudiedAt": d.last_studied_at.isoformat()[:10] if d.last_studied_at else None,
        }
        for d in decks
    ]


@router.post("")
def create_deck(
    req: CreateDeckRequest,
    user: User = Depends(get_user_from_token),
    db: Session = Depends(get_db),
):
    deck = Deck(user_id=user.id, name=req.name, description=req.description)
    db.add(deck)
    db.commit()
    db.refresh(deck)
    return {
        "id": deck.id,
        "name": deck.name,
        "description": deck.description,
        "cardCount": 0,
        "createdAt": deck.created_at.isoformat()[:10],
        "lastStudiedAt": None,
    }


@router.get("/{deck_id}")
def get_deck(deck_id: str, user: User = Depends(get_user_from_token), db: Session = Depends(get_db)):
    deck = db.query(Deck).filter(Deck.id == deck_id, Deck.user_id == user.id).first()
    if not deck:
        raise HTTPException(status_code=404, detail="Deck not found")
    return {
        "id": deck.id,
        "name": deck.name,
        "description": deck.description,
        "cardCount": deck.card_count,
        "createdAt": deck.created_at.isoformat()[:10],
        "lastStudiedAt": deck.last_studied_at.isoformat()[:10] if deck.last_studied_at else None,
    }


@router.delete("/{deck_id}")
def delete_deck(deck_id: str, user: User = Depends(get_user_from_token), db: Session = Depends(get_db)):
    deck = db.query(Deck).filter(Deck.id == deck_id, Deck.user_id == user.id).first()
    if not deck:
        raise HTTPException(status_code=404, detail="Deck not found")
    db.delete(deck)
    db.commit()
    return {"status": "deleted"}


@router.post("/{deck_id}/upload-pdf")
async def upload_pdf(
    deck_id: str,
    file: UploadFile = File(...),
    subject: str = Form("general"),  # Subject selection
    user: User = Depends(get_user_from_token),
    db: Session = Depends(get_db),
):
    """
    Upload PDF and generate flashcards using RAG (Retrieval-Augmented Generation).
    
    Args:
        deck_id: Deck ID
        file: PDF file
        subject: Subject type - history, mathematics, science, or general (default: general)
    """
    deck = db.query(Deck).filter(Deck.id == deck_id, Deck.user_id == user.id).first()
    if not deck:
        raise HTTPException(status_code=404, detail="Deck not found")

    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")

    content = await file.read()
    if len(content) > MAX_PDF_SIZE_MB * 1024 * 1024:
        raise HTTPException(status_code=400, detail=f"File too large (max {MAX_PDF_SIZE_MB}MB)")

    # Save PDF
    file_path = save_uploaded_pdf(content, file.filename)
    
    # Extract text
    try:
        text = extract_text_from_pdf(file_path, organize_by_topics=False)
        print(f"\n{'='*60}")
        print(f"📚 Processing PDF with RAG Engine")
        print(f"{'='*60}")
        print(f"Subject: {subject.upper()}")
        print(f"Total words: {len(text.split())}")
        print(f"GROQ_API_KEY set: {bool(GROQ_API_KEY)}")
        if GROQ_API_KEY:
            print(f"GROQ_API_KEY prefix: {GROQ_API_KEY[:12]}...")
        
        # Test Groq before full generation
        try:
            from groq import Groq
            test_client = Groq(api_key=GROQ_API_KEY)
            test_resp = test_client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[{"role": "user", "content": "Reply with just: OK"}],
                max_tokens=5,
            )
            print(f"✅ Groq test call succeeded: {test_resp.choices[0].message.content}")
        except Exception as groq_test_err:
            print(f"❌ Groq test call FAILED: {groq_test_err}")
            raise HTTPException(status_code=500, detail=f"Groq API error: {str(groq_test_err)}")
        
        # Generate cards using RAG
        all_cards = generate_cards_with_rag(text, subject=subject, cards_per_chunk=10)
        
        print(f"\n{'='*60}")
        print(f"✅ RAG Processing Complete")
        print(f"{'='*60}")
        print(f"Total cards generated: {len(all_cards)}")
        print(f"Cards per difficulty:")
        
        # Count by difficulty
        difficulty_counts = {}
        for card in all_cards:
            diff = card.get("difficulty", "intermediate")
            difficulty_counts[diff] = difficulty_counts.get(diff, 0) + 1
        
        for diff in ["beginner", "intermediate", "advanced"]:
            count = difficulty_counts.get(diff, 0)
            print(f"  • {diff.capitalize()}: {count}")
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        print(f"❌ Error during RAG processing: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Card generation failed: {str(e)}")

    # Save cards to database
    db_cards = []
    for card_data in all_cards:
        card = CardModel(
            deck_id=deck_id,
            front_text=card_data["front"],
            back_text=card_data["back"],
            card_type=card_data.get("type", "concept"),
        )
        db.add(card)
        db_cards.append(card)

    deck.card_count = (deck.card_count or 0) + len(db_cards)
    deck.source_pdf_url = f"/uploads/{os.path.basename(file_path)}"
    db.commit()

    response = {
        "deck_id": deck_id,
        "cards_generated": len(db_cards),
        "subject": subject,
        "rag_enabled": True,
        "sample_cards": [
            {"front": c.front_text, "back": c.back_text, "type": c.card_type}
            for c in db_cards[:5]
        ],
    }
    
    return response


@router.post("/{deck_id}/generate")
def generate_from_topic(
    deck_id: str,
    user: User = Depends(get_user_from_token),
    db: Session = Depends(get_db),
):
    """Generate cards just from the deck name/description (no PDF needed)."""
    deck = db.query(Deck).filter(Deck.id == deck_id, Deck.user_id == user.id).first()
    if not deck:
        raise HTTPException(status_code=404, detail="Deck not found")

    topic_text = f"{deck.name}. {deck.description}"
    cards_data = generate_cards_from_text(topic_text)

    db_cards = []
    for card_data in cards_data:
        card = CardModel(
            deck_id=deck_id,
            front_text=card_data["front"],
            back_text=card_data["back"],
            card_type=card_data.get("type", "concept"),
        )
        db.add(card)
        db_cards.append(card)

    deck.card_count = (deck.card_count or 0) + len(db_cards)
    db.commit()

    return {
        "deck_id": deck_id,
        "cards_generated": len(db_cards),
    }
