import uuid
from datetime import datetime, date
from sqlalchemy import Column, String, Text, Float, Integer, Date, DateTime, ForeignKey, Index
from sqlalchemy.orm import relationship
from database.connection import Base


class Card(Base):
    __tablename__ = "cards"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    deck_id = Column(String, ForeignKey("decks.id", ondelete="CASCADE"), nullable=False, index=True)
    front_text = Column(Text, nullable=False)
    back_text = Column(Text, nullable=False)
    card_type = Column(String(50), default="concept")

    # SM-2 Algorithm Metrics
    ease_factor = Column(Float, default=2.5)
    interval = Column(Integer, default=1)
    repetitions = Column(Integer, default=0)
    next_review_date = Column(Date, default=lambda: date.today())

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    deck = relationship("Deck", back_populates="cards")
    reviews = relationship("ReviewHistory", back_populates="card", cascade="all, delete-orphan")


# Composite index for efficient due-card queries
Index("idx_cards_deck_next_review", Card.deck_id, Card.next_review_date)
