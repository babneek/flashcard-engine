from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import date, datetime
from database.connection import get_db
from models.user import User
from models.deck import Deck
from models.card import Card
from models.review_history import ReviewHistory
from routes.auth import get_user_from_token
from services.spaced_repetition import update_card_sm2
from services.mastery_service import record_daily_activity

router = APIRouter(prefix="/cards", tags=["Cards"])


class RateCardRequest(BaseModel):
    quality_rating: int  # 0-5
    time_spent_seconds: int = None  # Optional: time spent on card in seconds


@router.get("/deck/{deck_id}")
def get_cards(
    deck_id: str,
    due_only: bool = False,
    user: User = Depends(get_user_from_token),
    db: Session = Depends(get_db),
):
    # Verify deck belongs to user
    deck = db.query(Deck).filter(Deck.id == deck_id, Deck.user_id == user.id).first()
    if not deck:
        raise HTTPException(status_code=404, detail="Deck not found")

    query = db.query(Card).filter(Card.deck_id == deck_id)
    if due_only:
        query = query.filter(Card.next_review_date <= date.today())

    cards = query.order_by(Card.next_review_date.asc()).all()

    return [
        {
            "id": c.id,
            "deckId": c.deck_id,
            "front": c.front_text,
            "back": c.back_text,
            "cardType": c.card_type,
            "easeFactor": c.ease_factor,
            "interval": c.interval,
            "repetitions": c.repetitions,
            "nextReviewDate": c.next_review_date.isoformat() if c.next_review_date else date.today().isoformat(),
            "createdAt": c.created_at.isoformat()[:10] if c.created_at else "",
        }
        for c in cards
    ]


@router.post("/{card_id}/rate")
def rate_card(
    card_id: str,
    req: RateCardRequest,
    user: User = Depends(get_user_from_token),
    db: Session = Depends(get_db),
):
    if req.quality_rating < 0 or req.quality_rating > 5:
        raise HTTPException(status_code=400, detail="Quality rating must be 0-5")

    card = db.query(Card).filter(Card.id == card_id).first()
    if not card:
        raise HTTPException(status_code=404, detail="Card not found")

    # Verify ownership
    deck = db.query(Deck).filter(Deck.id == card.deck_id, Deck.user_id == user.id).first()
    if not deck:
        raise HTTPException(status_code=403, detail="Not authorized")

    # Calculate new SM-2 metrics
    metrics = update_card_sm2(
        ease_factor=card.ease_factor,
        interval=card.interval,
        repetitions=card.repetitions,
        quality_rating=req.quality_rating,
    )

    # Save review history
    review = ReviewHistory(
        card_id=card_id,
        user_id=user.id,
        quality_rating=req.quality_rating,
        time_spent_seconds=req.time_spent_seconds,
        new_ease_factor=metrics["ease_factor"],
        new_interval=metrics["interval"],
        new_next_review_date=metrics["next_review_date"],
    )
    db.add(review)

    # Update card
    card.ease_factor = metrics["ease_factor"]
    card.interval = metrics["interval"]
    card.repetitions = metrics["repetitions"]
    card.next_review_date = metrics["next_review_date"]
    card.updated_at = datetime.utcnow()

    # Update deck last_studied_at
    deck.last_studied_at = datetime.utcnow()

    # Record daily activity for streak tracking
    record_daily_activity(user.id, db)

    db.commit()

    return {
        "status": "success",
        "updated_metrics": {
            "ease_factor": metrics["ease_factor"],
            "interval": metrics["interval"],
            "next_review_date": metrics["next_review_date"].isoformat(),
        },
    }



@router.get("/deck/{deck_id}/time-analytics")
def get_time_analytics(
    deck_id: str,
    user: User = Depends(get_user_from_token),
    db: Session = Depends(get_db),
):
    """Get time-based analytics for cards in a deck"""
    # Verify deck belongs to user
    deck = db.query(Deck).filter(Deck.id == deck_id, Deck.user_id == user.id).first()
    if not deck:
        raise HTTPException(status_code=404, detail="Deck not found")

    # Get all cards with their average time spent
    cards_with_time = (
        db.query(
            Card.id,
            Card.front_text,
            Card.back_text,
            func.avg(ReviewHistory.time_spent_seconds).label("avg_time"),
            func.count(ReviewHistory.id).label("review_count"),
            func.avg(ReviewHistory.quality_rating).label("avg_rating"),
        )
        .join(ReviewHistory, Card.id == ReviewHistory.card_id)
        .filter(Card.deck_id == deck_id)
        .filter(ReviewHistory.time_spent_seconds.isnot(None))
        .group_by(Card.id)
        .all()
    )

    # Categorize cards by time spent
    quick_cards = []  # < 10 seconds
    medium_cards = []  # 10-30 seconds
    slow_cards = []  # > 30 seconds

    for card in cards_with_time:
        card_data = {
            "id": card.id,
            "front": card.front_text[:50] + "..." if len(card.front_text) > 50 else card.front_text,
            "avgTime": round(card.avg_time, 1),
            "reviewCount": card.review_count,
            "avgRating": round(card.avg_rating, 2),
        }

        if card.avg_time < 10:
            quick_cards.append(card_data)
        elif card.avg_time < 30:
            medium_cards.append(card_data)
        else:
            slow_cards.append(card_data)

    # Sort each category by avg time
    quick_cards.sort(key=lambda x: x["avgTime"])
    medium_cards.sort(key=lambda x: x["avgTime"])
    slow_cards.sort(key=lambda x: x["avgTime"], reverse=True)

    return {
        "deckId": deck_id,
        "deckName": deck.name,
        "summary": {
            "quickCards": len(quick_cards),
            "mediumCards": len(medium_cards),
            "slowCards": len(slow_cards),
            "totalAnalyzed": len(cards_with_time),
        },
        "quickCards": quick_cards[:10],  # Top 10 quickest
        "mediumCards": medium_cards[:10],
        "slowCards": slow_cards[:10],  # Top 10 slowest
    }
