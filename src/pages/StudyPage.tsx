import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFlashcardStore } from '@/lib/store';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, RotateCcw, Check, X, Frown, Meh, Smile, ThumbsUp, Star } from 'lucide-react';

const ratingButtons = [
  { label: 'Forgot', value: 0, icon: X, color: 'bg-destructive text-destructive-foreground' },
  { label: 'Hard', value: 1, icon: Frown, color: 'bg-orange-500 text-white' },
  { label: 'Tough', value: 2, icon: Meh, color: 'bg-yellow-500 text-white' },
  { label: 'OK', value: 3, icon: Smile, color: 'bg-accent text-accent-foreground' },
  { label: 'Good', value: 4, icon: ThumbsUp, color: 'bg-primary text-primary-foreground' },
  { label: 'Perfect', value: 5, icon: Star, color: 'bg-ocean-glow text-ocean-deep' },
];

const StudyPage = () => {
  const { deckId } = useParams<{ deckId: string }>();
  const navigate = useNavigate();
  const { decks, getDueCards, rateCard } = useFlashcardStore();
  const deck = decks.find((d) => d.id === deckId);

  const [flipped, setFlipped] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sessionReviewed, setSessionReviewed] = useState(0);
  const [sessionCorrect, setSessionCorrect] = useState(0);
  const [finished, setFinished] = useState(false);

  const dueCards = getDueCards(deckId || '');
  const currentCard = dueCards[currentIndex];

  if (!deck) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Deck not found</p>
      </div>
    );
  }

  const handleRate = (quality: number) => {
    if (!currentCard) return;
    rateCard(currentCard.id, quality);
    setSessionReviewed((p) => p + 1);
    if (quality >= 3) setSessionCorrect((p) => p + 1);
    setFlipped(false);

    if (currentIndex + 1 >= dueCards.length) {
      setFinished(true);
    } else {
      setCurrentIndex((p) => p + 1);
    }
  };

  const progressPercent = dueCards.length > 0 ? Math.round((sessionReviewed / dueCards.length) * 100) : 100;

  if (finished || dueCards.length === 0) {
    const accuracy = sessionReviewed > 0 ? Math.round((sessionCorrect / sessionReviewed) * 100) : 100;
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <Card className="max-w-md w-full">
            <CardContent className="p-8 text-center space-y-6">
              <div className="w-20 h-20 rounded-full bg-accent/20 flex items-center justify-center mx-auto">
                <Check className="w-10 h-10 text-accent" />
              </div>
              <h2 className="text-2xl font-heading font-bold">Session Complete!</h2>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="bg-secondary rounded-lg p-4">
                  <p className="text-2xl font-bold text-foreground">{sessionReviewed}</p>
                  <p className="text-sm text-muted-foreground">Cards Reviewed</p>
                </div>
                <div className="bg-secondary rounded-lg p-4">
                  <p className="text-2xl font-bold text-foreground">{accuracy}%</p>
                  <p className="text-sm text-muted-foreground">Accuracy</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => navigate('/')}>
                  <ArrowLeft className="w-4 h-4 mr-2" /> Dashboard
                </Button>
                <Button className="flex-1" onClick={() => { setCurrentIndex(0); setSessionReviewed(0); setSessionCorrect(0); setFinished(false); }}>
                  <RotateCcw className="w-4 h-4 mr-2" /> Study Again
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-3">
            <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>
            <span className="text-sm text-muted-foreground font-heading">
              {deck.name} — Card {currentIndex + 1}/{dueCards.length}
            </span>
          </div>
          <Progress value={progressPercent} className="h-1.5" />
        </div>
      </header>

      {/* Card */}
      <main className="container mx-auto px-6 py-12 max-w-2xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentCard.id + (flipped ? '-back' : '-front')}
            initial={{ opacity: 0, rotateY: flipped ? -90 : 90 }}
            animate={{ opacity: 1, rotateY: 0 }}
            exit={{ opacity: 0, rotateY: flipped ? 90 : -90 }}
            transition={{ duration: 0.35 }}
          >
            <Card
              className="min-h-[300px] cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => !flipped && setFlipped(true)}
            >
              <CardContent className="p-8 flex flex-col items-center justify-center min-h-[300px] text-center">
                <span className="text-xs uppercase tracking-wider text-muted-foreground mb-4 font-heading">
                  {flipped ? 'Answer' : 'Question'}
                </span>
                <p className="text-xl md:text-2xl font-heading font-semibold leading-relaxed">
                  {flipped ? currentCard.back : currentCard.front}
                </p>
                {!flipped && (
                  <p className="text-sm text-muted-foreground mt-6">Tap to reveal answer</p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Rating buttons */}
        {flipped && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8"
          >
            <p className="text-center text-sm text-muted-foreground mb-4 font-heading">How well did you know this?</p>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
              {ratingButtons.map((btn) => (
                <button
                  key={btn.value}
                  onClick={() => handleRate(btn.value)}
                  className={`${btn.color} rounded-lg p-3 flex flex-col items-center gap-1 transition-transform hover:scale-105 active:scale-95`}
                >
                  <btn.icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{btn.label}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default StudyPage;
