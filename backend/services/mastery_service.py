"""
Mastery categorization and progress tracking service
"""
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from models.card import Card
from models.review_history import ReviewHistory
from models.achievement import DailyActivity
from typing import Dict, List


class MasteryCategory:
    NEW = "new"
    LEARNING = "learning"
    REVIEW = "review"
    MASTERED = "mastered"


def get_card_mastery_category(card: Card) -> str:
    """
    Categorize a card based on its SM-2 metrics.
    
    Rules:
    - New: 0 repetitions
    - Learning: 1-2 repetitions AND interval < 7 days
    - Review: 3+ repetitions AND interval 7-20 days
    - Mastered: 3+ repetitions AND interval > 20 days
    """
    if card.repetitions == 0:
        return MasteryCategory.NEW
    
    if card.repetitions <= 2 and card.interval < 7:
        return MasteryCategory.LEARNING
    
    if card.repetitions >= 3:
        if card.interval > 20:
            return MasteryCategory.MASTERED
        elif card.interval >= 7:
            return MasteryCategory.REVIEW
        else:
            return MasteryCategory.LEARNING
    
    return MasteryCategory.LEARNING


def get_deck_mastery_stats(deck_id: str, db: Session) -> Dict:
    """Get mastery statistics for a specific deck."""
    cards = db.query(Card).filter(Card.deck_id == deck_id).all()
    
    stats = {
        MasteryCategory.NEW: 0,
        MasteryCategory.LEARNING: 0,
        MasteryCategory.REVIEW: 0,
        MasteryCategory.MASTERED: 0,
        "total": len(cards)
    }
    
    for card in cards:
        category = get_card_mastery_category(card)
        stats[category] += 1
    
    # Calculate percentages
    if stats["total"] > 0:
        for category in [MasteryCategory.NEW, MasteryCategory.LEARNING, MasteryCategory.REVIEW, MasteryCategory.MASTERED]:
            stats[f"{category}_percentage"] = round((stats[category] / stats["total"]) * 100, 1)
    
    return stats


def get_user_mastery_stats(user_id: str, db: Session) -> Dict:
    """Get mastery statistics across all decks for a user."""
    from models.deck import Deck
    
    decks = db.query(Deck).filter(Deck.user_id == user_id).all()
    
    total_stats = {
        MasteryCategory.NEW: 0,
        MasteryCategory.LEARNING: 0,
        MasteryCategory.REVIEW: 0,
        MasteryCategory.MASTERED: 0,
        "total": 0
    }
    
    for deck in decks:
        deck_stats = get_deck_mastery_stats(deck.id, db)
        total_stats[MasteryCategory.NEW] += deck_stats[MasteryCategory.NEW]
        total_stats[MasteryCategory.LEARNING] += deck_stats[MasteryCategory.LEARNING]
        total_stats[MasteryCategory.REVIEW] += deck_stats[MasteryCategory.REVIEW]
        total_stats[MasteryCategory.MASTERED] += deck_stats[MasteryCategory.MASTERED]
        total_stats["total"] += deck_stats["total"]
    
    # Calculate percentages
    if total_stats["total"] > 0:
        for category in [MasteryCategory.NEW, MasteryCategory.LEARNING, MasteryCategory.REVIEW, MasteryCategory.MASTERED]:
            total_stats[f"{category}_percentage"] = round((total_stats[category] / total_stats["total"]) * 100, 1)
    
    return total_stats


def get_due_cards_count(deck_id: str, db: Session) -> int:
    """Get count of cards due for review in a deck."""
    today = datetime.utcnow().date()
    
    count = db.query(Card).filter(
        and_(
            Card.deck_id == deck_id,
            Card.next_review_date <= today
        )
    ).count()
    
    return count


def get_user_due_cards_count(user_id: str, db: Session) -> int:
    """Get count of cards due for review across all user's decks."""
    from models.deck import Deck
    
    today = datetime.utcnow().date()
    
    count = db.query(Card).join(Deck).filter(
        and_(
            Deck.user_id == user_id,
            Card.next_review_date <= today
        )
    ).count()
    
    return count


def get_weak_areas(user_id: str, db: Session, min_reviews: int = 5) -> List[Dict]:
    """
    Identify decks where user is struggling (average rating < 3.0).
    Only considers cards with at least min_reviews reviews.
    """
    from models.deck import Deck
    
    # Get average quality rating per deck
    weak_decks = []
    
    decks = db.query(Deck).filter(Deck.user_id == user_id).all()
    
    for deck in decks:
        # Get cards with enough reviews
        cards_with_reviews = db.query(Card).filter(
            and_(
                Card.deck_id == deck.id,
                Card.repetitions >= min_reviews
            )
        ).all()
        
        if not cards_with_reviews:
            continue
        
        # Calculate average quality from recent reviews
        struggling_count = 0
        
        for card in cards_with_reviews:
            recent_reviews = db.query(ReviewHistory).filter(
                ReviewHistory.card_id == card.id
            ).order_by(ReviewHistory.reviewed_at.desc()).limit(5).all()
            
            if recent_reviews:
                avg_quality = sum(r.quality_rating for r in recent_reviews) / len(recent_reviews)
                if avg_quality < 3.0:
                    struggling_count += 1
        
        if struggling_count > 0:
            weak_decks.append({
                "deck_id": deck.id,
                "deck_name": deck.name,
                "struggling_cards": struggling_count,
                "total_cards": len(cards_with_reviews)
            })
    
    # Sort by struggling cards count (descending)
    weak_decks.sort(key=lambda x: x["struggling_cards"], reverse=True)
    
    return weak_decks


def calculate_streak(user_id: str, db: Session) -> Dict:
    """
    Calculate current and longest study streak for a user.
    A streak day requires at least one card review.
    """
    activities = db.query(DailyActivity).filter(
        DailyActivity.user_id == user_id
    ).order_by(DailyActivity.activity_date.desc()).all()
    
    if not activities:
        return {"current_streak": 0, "longest_streak": 0}
    
    # Calculate current streak
    current_streak = 0
    today = datetime.utcnow().date()
    check_date = today
    
    for activity in activities:
        activity_date = activity.activity_date.date()
        
        if activity_date == check_date:
            current_streak += 1
            check_date = check_date - timedelta(days=1)
        elif activity_date < check_date:
            # Gap in streak
            break
    
    # Calculate longest streak
    longest_streak = 0
    temp_streak = 0
    prev_date = None
    
    for activity in reversed(activities):
        activity_date = activity.activity_date.date()
        
        if prev_date is None:
            temp_streak = 1
        elif (activity_date - prev_date).days == 1:
            temp_streak += 1
        else:
            longest_streak = max(longest_streak, temp_streak)
            temp_streak = 1
        
        prev_date = activity_date
    
    longest_streak = max(longest_streak, temp_streak)
    
    return {
        "current_streak": current_streak,
        "longest_streak": longest_streak
    }


def record_daily_activity(user_id: str, db: Session):
    """Record that user studied today."""
    today = datetime.utcnow().date()
    
    # Check if activity already exists for today
    existing = db.query(DailyActivity).filter(
        and_(
            DailyActivity.user_id == user_id,
            func.date(DailyActivity.activity_date) == today
        )
    ).first()
    
    if existing:
        existing.cards_reviewed += 1
    else:
        activity = DailyActivity(
            user_id=user_id,
            activity_date=datetime.utcnow(),
            cards_reviewed=1
        )
        db.add(activity)
    
    db.commit()


def get_progress_over_time(user_id: str, db: Session, days: int = 7) -> List[Dict]:
    """Get mastery progress over the last N days."""
    from models.deck import Deck
    
    end_date = datetime.utcnow().date()
    start_date = end_date - timedelta(days=days - 1)
    
    progress = []
    
    for i in range(days):
        date = start_date + timedelta(days=i)
        
        # Count cards reviewed on this date
        reviews_count = db.query(ReviewHistory).join(Card).join(Deck).filter(
            and_(
                Deck.user_id == user_id,
                func.date(ReviewHistory.reviewed_at) == date
            )
        ).count()
        
        progress.append({
            "date": date.isoformat(),
            "cards_reviewed": reviews_count
        })
    
    return progress
