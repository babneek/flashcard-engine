import { Card, Deck } from './types';

const today = new Date().toISOString().split('T')[0];

export const sampleDecks: Deck[] = [
  {
    id: 'deck-1',
    name: 'Quadratic Equations',
    description: 'Master quadratic equations, factoring, and the quadratic formula',
    cardCount: 8,
    createdAt: '2026-04-01',
    lastStudiedAt: '2026-04-08',
  },
  {
    id: 'deck-2',
    name: 'French Revolution',
    description: 'Key events, figures, and causes of the French Revolution',
    cardCount: 6,
    createdAt: '2026-04-03',
    lastStudiedAt: '2026-04-07',
  },
];

export const sampleCards: Card[] = [
  // Quadratic Equations
  { id: 'c1', deckId: 'deck-1', front: 'What is a quadratic equation?', back: 'An equation where the highest power of x is 2, written as ax² + bx + c = 0, where a ≠ 0.', cardType: 'definition', easeFactor: 2.5, interval: 1, repetitions: 0, nextReviewDate: today, createdAt: '2026-04-01' },
  { id: 'c2', deckId: 'deck-1', front: 'Why must a ≠ 0 in ax² + bx + c = 0?', back: 'If a = 0, it becomes a linear equation (bx + c = 0), not quadratic. The x² term defines it.', cardType: 'concept', easeFactor: 2.6, interval: 3, repetitions: 2, nextReviewDate: today, createdAt: '2026-04-01' },
  { id: 'c3', deckId: 'deck-1', front: 'What is the quadratic formula?', back: 'x = (-b ± √(b² - 4ac)) / 2a', cardType: 'definition', easeFactor: 2.8, interval: 8, repetitions: 3, nextReviewDate: '2026-04-15', createdAt: '2026-04-01' },
  { id: 'c4', deckId: 'deck-1', front: 'Solve: x² - 5x + 6 = 0', back: 'Factor: (x-2)(x-3) = 0, so x = 2 or x = 3', cardType: 'example', easeFactor: 2.5, interval: 1, repetitions: 0, nextReviewDate: today, createdAt: '2026-04-01' },
  { id: 'c5', deckId: 'deck-1', front: 'What is the discriminant and what does it tell us?', back: 'The discriminant is b² - 4ac. If > 0: two real roots. If = 0: one repeated root. If < 0: no real roots (two complex roots).', cardType: 'concept', easeFactor: 2.3, interval: 1, repetitions: 0, nextReviewDate: today, createdAt: '2026-04-01' },
  { id: 'c6', deckId: 'deck-1', front: 'What does "completing the square" mean?', back: 'Rewriting ax² + bx + c into the form a(x - h)² + k to find the vertex or solve the equation.', cardType: 'definition', easeFactor: 2.7, interval: 6, repetitions: 2, nextReviewDate: '2026-04-12', createdAt: '2026-04-01' },
  { id: 'c7', deckId: 'deck-1', front: 'Can a quadratic equation have exactly one solution?', back: 'Yes, when the discriminant b² - 4ac = 0, giving one repeated (double) root.', cardType: 'edge_case', easeFactor: 2.5, interval: 1, repetitions: 1, nextReviewDate: today, createdAt: '2026-04-01' },
  { id: 'c8', deckId: 'deck-1', front: 'A ball is thrown up with h(t) = -5t² + 20t. When does it hit the ground?', back: 'Set h(t) = 0: -5t(t - 4) = 0, so t = 0 or t = 4. It hits the ground at t = 4 seconds.', cardType: 'application', easeFactor: 2.5, interval: 1, repetitions: 0, nextReviewDate: today, createdAt: '2026-04-01' },
  // French Revolution
  { id: 'c9', deckId: 'deck-2', front: 'When did the French Revolution begin?', back: '1789, with the storming of the Bastille on July 14.', cardType: 'definition', easeFactor: 2.6, interval: 3, repetitions: 2, nextReviewDate: today, createdAt: '2026-04-03' },
  { id: 'c10', deckId: 'deck-2', front: 'What were the three Estates in pre-revolutionary France?', back: 'First Estate: Clergy. Second Estate: Nobility. Third Estate: Common people (97% of population).', cardType: 'concept', easeFactor: 2.5, interval: 1, repetitions: 0, nextReviewDate: today, createdAt: '2026-04-03' },
  { id: 'c11', deckId: 'deck-2', front: 'What was the Reign of Terror?', back: 'A period (1793-1794) led by Robespierre where ~17,000 people were executed by guillotine for being "enemies of the revolution."', cardType: 'concept', easeFactor: 2.4, interval: 1, repetitions: 1, nextReviewDate: today, createdAt: '2026-04-03' },
  { id: 'c12', deckId: 'deck-2', front: 'What was the Tennis Court Oath?', back: 'On June 20, 1789, the Third Estate swore not to disband until they had written a new constitution for France.', cardType: 'definition', easeFactor: 2.8, interval: 14, repetitions: 4, nextReviewDate: '2026-04-25', createdAt: '2026-04-03' },
  { id: 'c13', deckId: 'deck-2', front: 'How did Napoleon rise to power after the Revolution?', back: 'He gained fame as a military leader, then staged a coup d\'état in 1799, becoming First Consul and later Emperor in 1804.', cardType: 'concept', easeFactor: 2.5, interval: 1, repetitions: 0, nextReviewDate: today, createdAt: '2026-04-03' },
  { id: 'c14', deckId: 'deck-2', front: 'What document declared the rights of citizens during the Revolution?', back: 'The Declaration of the Rights of Man and of the Citizen (1789), proclaiming liberty, equality, and sovereignty of the people.', cardType: 'definition', easeFactor: 2.5, interval: 3, repetitions: 1, nextReviewDate: '2026-04-10', createdAt: '2026-04-03' },
];
