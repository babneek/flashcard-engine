from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database.connection import get_db
from models.user import User
from routes.auth import get_user_from_token
from services.mastery_service import (
    get_user_mastery_stats,
    get_deck_mastery_stats,
    get_user_due_cards_count,
    get_due_cards_count,
    get_weak_areas,
    calculate_streak,
    get_progress_over_time
)

router = APIRouter(prefix="/progress", tags=["Progress"])


@router.get("/dashboard")
def get_dashboard(user: User = Depends(get_user_from_token), db: Session = Depends(get_db)):
    """Get comprehensive dashboard data for the user."""
    
    # Mastery stats
    mastery_stats = get_user_mastery_stats(user.id, db)
    
    # Due cards
    due_cards = get_user_due_cards_count(user.id, db)
    
    # Streak
    streak = calculate_streak(user.id, db)
    
    # Weak areas
    weak_areas = get_weak_areas(user.id, db)
    
    # Progress over time (last 7 days)
    progress_chart = get_progress_over_time(user.id, db, days=7)
    
    return {
        "mastery": mastery_stats,
        "due_cards": due_cards,
        "streak": streak,
        "weak_areas": weak_areas[:5],  # Top 5 weak areas
        "progress_chart": progress_chart
    }


@router.get("/deck/{deck_id}")
def get_deck_progress(
    deck_id: str,
    user: User = Depends(get_user_from_token),
    db: Session = Depends(get_db)
):
    """Get progress stats for a specific deck."""
    from models.deck import Deck
    
    # Verify deck belongs to user
    deck = db.query(Deck).filter(Deck.id == deck_id, Deck.user_id == user.id).first()
    if not deck:
        raise HTTPException(status_code=404, detail="Deck not found")
    
    mastery_stats = get_deck_mastery_stats(deck_id, db)
    due_cards = get_due_cards_count(deck_id, db)
    
    return {
        "deck_id": deck_id,
        "deck_name": deck.name,
        "mastery": mastery_stats,
        "due_cards": due_cards
    }


@router.get("/streak")
def get_streak(user: User = Depends(get_user_from_token), db: Session = Depends(get_db)):
    """Get user's current and longest streak."""
    return calculate_streak(user.id, db)


@router.get("/weak-areas")
def get_weak_areas_endpoint(user: User = Depends(get_user_from_token), db: Session = Depends(get_db)):
    """Get areas where user is struggling."""
    return {"weak_areas": get_weak_areas(user.id, db)}


@router.get("/chart")
def get_progress_chart(
    days: int = 30,
    user: User = Depends(get_user_from_token),
    db: Session = Depends(get_db)
):
    """Get progress chart data for the last N days."""
    if days > 365:
        days = 365  # Cap at 1 year
    
    return {"progress": get_progress_over_time(user.id, db, days=days)}
