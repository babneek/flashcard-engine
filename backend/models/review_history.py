import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, Date, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from database.connection import Base


class ReviewHistory(Base):
    __tablename__ = "review_history"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    card_id = Column(String, ForeignKey("cards.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    quality_rating = Column(Integer, nullable=False)
    reviewed_at = Column(DateTime, default=datetime.utcnow)
    
    # Time tracking for difficulty analysis
    time_spent_seconds = Column(Integer, nullable=True)  # Time spent on this card in seconds

    # Snapshot of computed metrics for analytics/debugging
    new_ease_factor = Column(Float, nullable=True)
    new_interval = Column(Integer, nullable=True)
    new_next_review_date = Column(Date, nullable=True)

    card = relationship("Card", back_populates="reviews")
