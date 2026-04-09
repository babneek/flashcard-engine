from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import date, timedelta, datetime
from database.connection import get_db
from models.user import User
from models.deck import Deck
from models.card import Card
from models.review_history import ReviewHistory
from routes.auth import get_user_from_token

router = APIRouter(prefix="/stats", tags=["Stats"])


@router.get("/deck/{deck_id}")
def get_deck_stats(
    deck_id: str,
    user: User = Depends(get_user_from_token),
    db: Session = Depends(get_db),
):
    deck = db.query(Deck).filter(Deck.id == deck_id, Deck.user_id == user.id).first()
    if not deck:
        raise HTTPException(status_code=404, detail="Deck not found")

    today = date.today()
    cards = db.query(Card).filter(Card.deck_id == deck_id).all()
    total = len(cards)

    if total == 0:
        return {
            "total": 0,
            "mastered": 0,
            "learning": 0,
            "struggling": 0,
            "dueToday": 0,
            "weeklyAccuracy": 0,
        }

    mastered = sum(1 for c in cards if c.repetitions >= 3 and c.interval >= 14)
    due_today = sum(1 for c in cards if c.next_review_date and c.next_review_date <= today)
    struggling = sum(1 for c in cards if c.repetitions == 0 and c.next_review_date and c.next_review_date <= today)
    learning = total - mastered - struggling

    # Weekly accuracy
    week_ago = datetime.utcnow() - timedelta(days=7)
    card_ids = [c.id for c in cards]
    week_reviews = (
        db.query(ReviewHistory)
        .filter(
            ReviewHistory.card_id.in_(card_ids),
            ReviewHistory.user_id == user.id,
            ReviewHistory.reviewed_at >= week_ago,
        )
        .all()
    )
    weekly_accuracy = 0
    if week_reviews:
        correct = sum(1 for r in week_reviews if r.quality_rating >= 3)
        weekly_accuracy = round((correct / len(week_reviews)) * 100)

    return {
        "total": total,
        "mastered": mastered,
        "learning": learning,
        "struggling": struggling,
        "dueToday": due_today,
        "weeklyAccuracy": weekly_accuracy,
    }


@router.get("/overall")
def get_overall_stats(
    user: User = Depends(get_user_from_token),
    db: Session = Depends(get_db),
):
    decks = db.query(Deck).filter(Deck.user_id == user.id).all()
    deck_ids = [d.id for d in decks]

    today = date.today()
    all_cards = db.query(Card).filter(Card.deck_id.in_(deck_ids)).all() if deck_ids else []
    due_today = sum(1 for c in all_cards if c.next_review_date and c.next_review_date <= today)

    week_ago = datetime.utcnow() - timedelta(days=7)
    studied_this_week = (
        db.query(ReviewHistory)
        .filter(ReviewHistory.user_id == user.id, ReviewHistory.reviewed_at >= week_ago)
        .count()
    )

    return {
        "totalDecks": len(decks),
        "totalCards": len(all_cards),
        "dueToday": due_today,
        "studiedThisWeek": studied_this_week,
    }
