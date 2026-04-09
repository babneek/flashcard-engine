import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, Integer, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from database.connection import Base


class Deck(Base):
    __tablename__ = "decks"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String, nullable=False)
    description = Column(Text, default="")
    source_pdf_url = Column(String, nullable=True)
    pageindex_id = Column(String, nullable=True)
    card_count = Column(Integer, default=0)
    is_favorite = Column(Boolean, default=False)
    is_archived = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_studied_at = Column(DateTime, nullable=True)

    cards = relationship("Card", back_populates="deck", cascade="all, delete-orphan")
