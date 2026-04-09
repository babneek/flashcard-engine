export interface Card {
  id: string;
  deckId: string;
  front: string;
  back: string;
  cardType: 'definition' | 'concept' | 'example' | 'edge_case' | 'application';
  easeFactor: number;
  interval: number;
  repetitions: number;
  nextReviewDate: string; // ISO date string
  createdAt: string;
}

export interface Deck {
  id: string;
  name: string;
  description: string;
  cardCount: number;
  createdAt: string;
  lastStudiedAt: string | null;
}

export interface ReviewRecord {
  id: string;
  cardId: string;
  qualityRating: number;
  reviewedAt: string;
}

export interface DeckStats {
  total: number;
  mastered: number;
  learning: number;
  struggling: number;
  dueToday: number;
  weeklyAccuracy: number;
}
