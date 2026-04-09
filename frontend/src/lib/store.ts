import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Card, Deck, ReviewRecord, DeckStats } from './types';
import { sampleDecks, sampleCards } from './sample-data';
import { updateCardSM2 } from './sm2';

interface FlashcardStore {
  decks: Deck[];
  cards: Card[];
  reviews: ReviewRecord[];

  // Actions
  addDeck: (name: string, description: string) => string;
  deleteDeck: (deckId: string) => void;
  addCards: (cards: Omit<Card, 'id' | 'createdAt'>[]) => void;
  rateCard: (cardId: string, quality: number) => void;
  getDeckCards: (deckId: string) => Card[];
  getDueCards: (deckId: string) => Card[];
  getDeckStats: (deckId: string) => DeckStats;
  getOverallStats: () => { totalCards: number; totalDecks: number; dueToday: number; studiedThisWeek: number };
}

export const useFlashcardStore = create<FlashcardStore>()(
  persist(
    (set, get) => ({
      decks: sampleDecks,
      cards: sampleCards,
      reviews: [],

      addDeck: (name, description) => {
        const id = `deck-${Date.now()}`;
        const deck: Deck = {
          id,
          name,
          description,
          cardCount: 0,
          createdAt: new Date().toISOString().split('T')[0],
          lastStudiedAt: null,
        };
        set((s) => ({ decks: [...s.decks, deck] }));
        return id;
      },

      deleteDeck: (deckId) => {
        set((s) => ({
          decks: s.decks.filter((d) => d.id !== deckId),
          cards: s.cards.filter((c) => c.deckId !== deckId),
        }));
      },

      addCards: (newCards) => {
        const cards: Card[] = newCards.map((c, i) => ({
          ...c,
          id: `card-${Date.now()}-${i}`,
          createdAt: new Date().toISOString().split('T')[0],
        }));
        set((s) => {
          const updatedDecks = s.decks.map((d) => {
            const addedCount = cards.filter((c) => c.deckId === d.id).length;
            return addedCount > 0 ? { ...d, cardCount: d.cardCount + addedCount } : d;
          });
          return { cards: [...s.cards, ...cards], decks: updatedDecks };
        });
      },

      rateCard: (cardId, quality) => {
        set((s) => {
          const card = s.cards.find((c) => c.id === cardId);
          if (!card) return s;

          const updated = updateCardSM2(card, quality);
          const review: ReviewRecord = {
            id: `rev-${Date.now()}`,
            cardId,
            qualityRating: quality,
            reviewedAt: new Date().toISOString(),
          };

          const newCards = s.cards.map((c) =>
            c.id === cardId ? { ...c, ...updated } : c
          );

          const deck = s.decks.find((d) => d.id === card.deckId);
          const newDecks = deck
            ? s.decks.map((d) =>
                d.id === deck.id ? { ...d, lastStudiedAt: new Date().toISOString().split('T')[0] } : d
              )
            : s.decks;

          return { cards: newCards, decks: newDecks, reviews: [...s.reviews, review] };
        });
      },

      getDeckCards: (deckId) => get().cards.filter((c) => c.deckId === deckId),

      getDueCards: (deckId) => {
        const today = new Date().toISOString().split('T')[0];
        return get()
          .cards.filter((c) => c.deckId === deckId && c.nextReviewDate <= today)
          .sort((a, b) => a.nextReviewDate.localeCompare(b.nextReviewDate));
      },

      getDeckStats: (deckId) => {
        const cards = get().cards.filter((c) => c.deckId === deckId);
        const today = new Date().toISOString().split('T')[0];
        const total = cards.length;
        if (total === 0) return { total: 0, mastered: 0, learning: 0, struggling: 0, dueToday: 0, weeklyAccuracy: 0 };

        const mastered = cards.filter((c) => c.repetitions >= 3 && c.interval >= 14).length;
        const dueToday = cards.filter((c) => c.nextReviewDate <= today).length;
        const struggling = cards.filter((c) => c.repetitions === 0 && c.nextReviewDate <= today).length;
        const learning = total - mastered - struggling;

        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const weekReviews = get().reviews.filter(
          (r) => new Date(r.reviewedAt) >= weekAgo && cards.some((c) => c.id === r.cardId)
        );
        const weeklyAccuracy = weekReviews.length > 0
          ? Math.round((weekReviews.filter((r) => r.qualityRating >= 3).length / weekReviews.length) * 100)
          : 0;

        return { total, mastered, learning, struggling, dueToday, weeklyAccuracy };
      },

      getOverallStats: () => {
        const s = get();
        const today = new Date().toISOString().split('T')[0];
        const dueToday = s.cards.filter((c) => c.nextReviewDate <= today).length;
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const studiedThisWeek = s.reviews.filter((r) => new Date(r.reviewedAt) >= weekAgo).length;
        return { totalCards: s.cards.length, totalDecks: s.decks.length, dueToday, studiedThisWeek };
      },
    }),
    { name: 'flashcard-engine-storage' }
  )
);
