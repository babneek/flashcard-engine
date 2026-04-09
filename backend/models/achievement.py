from sqlalchemy import Column, String, DateTime, Boolean, ForeignKey, Integer
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
from database.connection import Base


class Achievement(Base):
    __tablename__ = "achievements"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    achievement_type = Column(String, nullable=False)  # e.g., "first_card", "7_day_streak", "deck_mastered"
    achievement_name = Column(String, nullable=False)
    achievement_description = Column(String)
    unlocked_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationship
    user = relationship("User", back_populates="achievements")


class DailyActivity(Base):
    __tablename__ = "daily_activities"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    activity_date = Column(DateTime, nullable=False)
    cards_reviewed = Column(Integer, default=0)
    
    # Relationship
    user = relationship("User", back_populates="daily_activities")


class DeckTag(Base):
    __tablename__ = "deck_tags"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False, unique=True)
    color = Column(String, default="#3B82F6")  # Default blue color
    created_at = Column(DateTime, default=datetime.utcnow)


class DeckTagAssociation(Base):
    __tablename__ = "deck_tag_associations"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    deck_id = Column(String, ForeignKey("decks.id"), nullable=False)
    tag_id = Column(String, ForeignKey("deck_tags.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
