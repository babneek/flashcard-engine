import { Card } from './types';

export function updateCardSM2(card: Card, qualityRating: number) {
  const easeFactor = Math.max(
    1.3,
    card.easeFactor + (0.1 - (5 - qualityRating) * (0.08 + (5 - qualityRating) * 0.02))
  );

  let interval: number;
  let repetitions: number;

  if (qualityRating < 3) {
    repetitions = 0;
    interval = 1;
  } else {
    if (card.repetitions === 0) {
      interval = 1;
    } else if (card.repetitions === 1) {
      interval = 3;
    } else {
      interval = Math.round(card.interval * easeFactor);
    }
    repetitions = card.repetitions + 1;
  }

  const nextReviewDate = new Date();
  nextReviewDate.setDate(nextReviewDate.getDate() + interval);

  return {
    easeFactor,
    interval,
    repetitions,
    nextReviewDate: nextReviewDate.toISOString().split('T')[0],
  };
}
