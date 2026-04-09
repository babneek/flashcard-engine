import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { ArrowLeft, RotateCcw, Check, X, Frown, Meh, Smile, ThumbsUp, Star, Loader2, Sparkles, PartyPopper } from 'lucide-react';
import { apiGetCards, apiRateCard, apiGetDeck } from '@/lib/api';
import { useAuthStore } from '@/lib/auth-store';

const ratingButtons = [
  { label: 'Hard', value: 1, icon: Frown, color: 'bg-orange-500 text-white hover:bg-orange-600', description: 'Need more practice' },
  { label: 'Medium', value: 3, icon: Meh, color: 'bg-yellow-500 text-white hover:bg-yellow-600', description: 'Getting there' },
  { label: 'Easy', value: 5, icon: Smile, color: 'bg-green-500 text-white hover:bg-green-600', description: 'Got it!' },
];

const StudyPage = () => {
  const { deckId } = useParams<{ deckId: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  const [deckName, setDeckName] = useState('');
  const [dueCards, setDueCards] = useState<any[]>([]);
  const [flipped, setFlipped] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sessionReviewed, setSessionReviewed] = useState(0);
  const [sessionCorrect, setSessionCorrect] = useState(0);
  const [finished, setFinished] = useState(false);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(false);
  
  // Time tracking
  const [cardStartTime, setCardStartTime] = useState<number>(Date.now());
  const [suggestedRating, setSuggestedRating] = useState<number | null>(null);
  
  // Active recall feature
  const [showAnswerInput, setShowAnswerInput] = useState(false);
  const [userAnswer, setUserAnswer] = useState('');
  const [answerChecked, setAnswerChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) { navigate('/login'); return; }
    loadCards();
  }, [deckId, isAuthenticated]);

  const loadCards = async () => {
    try {
      const [deck, cards] = await Promise.all([
        apiGetDeck(deckId || ''),
        apiGetCards(deckId || '', true),
      ]);
      setDeckName(deck.name);
      setDueCards(cards);
      if (cards.length === 0) setFinished(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const currentCard = dueCards[currentIndex];

  const calculateSimilarity = (str1: string, str2: string): number => {
    const words1 = str1.split(/\s+/).filter(w => w.length > 3);
    const words2 = str2.split(/\s+/).filter(w => w.length > 3);
    const commonWords = words1.filter(word => words2.includes(word));
    return commonWords.length / Math.max(words1.length, words2.length);
  };

  const extractKeywords = (text: string): string[] => {
    // Remove common words (stop words)
    const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'was', 'were', 'is', 'are', 'been', 'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those'];
    
    const words = text.toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 3 && !stopWords.includes(word));
    
    return words;
  };

  const checkAnswer = () => {
    if (!userAnswer.trim()) return;
    
    const correctAnswer = currentCard.back.toLowerCase();
    const userAnswerLower = userAnswer.toLowerCase();
    const questionLower = currentCard.front.toLowerCase();
    
    // Extract keywords from correct answer (excluding question words)
    const correctKeywords = extractKeywords(correctAnswer);
    const questionKeywords = extractKeywords(questionLower);
    const userKeywords = extractKeywords(userAnswerLower);
    
    // Remove question keywords from correct keywords (to avoid matching question words)
    const relevantKeywords = correctKeywords.filter(kw => !questionKeywords.includes(kw));
    
    // Check 1: Keyword coverage (user must mention key concepts)
    const matchedKeywords = userKeywords.filter(kw => relevantKeywords.includes(kw));
    const keywordCoverage = relevantKeywords.length > 0 
      ? matchedKeywords.length / relevantKeywords.length 
      : 0;
    
    // Check 2: Word similarity (overall similarity)
    const similarity = calculateSimilarity(userAnswerLower, correctAnswer);
    
    // Check 3: Length check (answer should be substantial)
    const hasSubstantialAnswer = userAnswer.trim().split(/\s+/).length >= 3;
    
    // Check 4: Not just repeating the question
    const notJustQuestion = calculateSimilarity(userAnswerLower, questionLower) < 0.7;
    
    // Decision logic:
    // - Must have substantial answer (3+ words)
    // - Must not just repeat the question
    // - Must either:
    //   a) Match 40%+ of key concepts, OR
    //   b) Have 50%+ overall similarity
    const isMatch = hasSubstantialAnswer && 
                    notJustQuestion && 
                    (keywordCoverage >= 0.4 || similarity >= 0.5);
    
    setIsCorrect(isMatch);
    setAnswerChecked(true);
    
    // Calculate time-based suggestion when flipping
    const timeSpent = (Date.now() - cardStartTime) / 1000; // seconds
    let suggested = 3; // Medium by default
    if (timeSpent < 8) suggested = 5; // Easy
    else if (timeSpent > 25) suggested = 1; // Hard
    setSuggestedRating(suggested);
    
    // Auto-flip after 1.5 seconds
    setTimeout(() => setFlipped(true), 1500);
  };

  const handleRate = async (quality: number) => {
    if (!currentCard || rating) return;
    setRating(true);

    try {
      const timeSpent = Math.round((Date.now() - cardStartTime) / 1000); // seconds
      await apiRateCard(currentCard.id, quality, timeSpent);
      setSessionReviewed((p) => p + 1);
      if (quality >= 3) setSessionCorrect((p) => p + 1);
      
      // Reset states
      setFlipped(false);
      setShowAnswerInput(false);
      setUserAnswer('');
      setAnswerChecked(false);
      setIsCorrect(false);
      setSuggestedRating(null);
      setCardStartTime(Date.now()); // Reset timer for next card

      if (currentIndex + 1 >= dueCards.length) {
        setFinished(true);
      } else {
        setCurrentIndex((p) => p + 1);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setRating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const progressPercent = dueCards.length > 0 ? Math.round((sessionReviewed / dueCards.length) * 100) : 100;

  if (finished || dueCards.length === 0) {
    const accuracy = sessionReviewed > 0 ? Math.round((sessionCorrect / sessionReviewed) * 100) : 100;
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <Card className="max-w-md w-full shadow-xl">
            <CardContent className="p-8 text-center space-y-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.2 }}
                className="w-20 h-20 rounded-full bg-gradient-to-br from-accent/20 to-ocean-glow/20 flex items-center justify-center mx-auto"
              >
                <Check className="w-10 h-10 text-accent" />
              </motion.div>
              <h2 className="text-2xl font-heading font-bold">
                {sessionReviewed > 0 ? 'Session Complete!' : 'All Caught Up!'}
              </h2>
              {sessionReviewed > 0 ? (
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="bg-secondary rounded-xl p-4">
                    <p className="text-2xl font-bold text-foreground">{sessionReviewed}</p>
                    <p className="text-sm text-muted-foreground">Cards Reviewed</p>
                  </div>
                  <div className="bg-secondary rounded-xl p-4">
                    <p className="text-2xl font-bold text-foreground">{accuracy}%</p>
                    <p className="text-sm text-muted-foreground">Accuracy</p>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">No cards are due for review right now. Great job!</p>
              )}
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => navigate('/')}>
                  <ArrowLeft className="w-4 h-4 mr-2" /> Dashboard
                </Button>
                {sessionReviewed > 0 && (
                  <Button className="flex-1" onClick={() => { loadCards(); setCurrentIndex(0); setSessionReviewed(0); setSessionCorrect(0); setFinished(false); }}>
                    <RotateCcw className="w-4 h-4 mr-2" /> Study Again
                  </Button>
                )}
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
              {deckName} — Card {currentIndex + 1}/{dueCards.length}
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
              className="min-h-[300px] cursor-pointer hover:shadow-xl transition-all duration-300"
              onClick={() => {
                if (!flipped && !showAnswerInput) {
                  // Calculate time-based suggestion when flipping
                  const timeSpent = (Date.now() - cardStartTime) / 1000; // seconds
                  let suggested = 3; // Medium by default
                  if (timeSpent < 8) suggested = 5; // Easy
                  else if (timeSpent > 25) suggested = 1; // Hard
                  setSuggestedRating(suggested);
                  setFlipped(true);
                }
              }}
            >
              <CardContent className="p-8 flex flex-col items-center justify-center min-h-[300px] text-center">
                <span className="text-xs uppercase tracking-wider text-muted-foreground mb-4 font-heading">
                  {flipped ? 'Answer' : 'Question'}
                </span>
                <p className="text-xl md:text-2xl font-heading font-semibold leading-relaxed">
                  {flipped ? currentCard.back : currentCard.front}
                </p>
                
                {/* Answer checked feedback */}
                {answerChecked && !flipped && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className={`mt-6 p-4 rounded-xl ${isCorrect ? 'bg-green-500/10' : 'bg-orange-500/10'}`}
                  >
                    {isCorrect ? (
                      <div className="flex items-center gap-2 text-green-600">
                        <PartyPopper className="w-6 h-6" />
                        <span className="font-semibold">Great job! 🎉</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-orange-600">
                        <Sparkles className="w-6 h-6" />
                        <span className="font-semibold">Keep trying! 💪</span>
                      </div>
                    )}
                  </motion.div>
                )}
                
                {!flipped && !showAnswerInput && !answerChecked && (
                  <div className="mt-6 space-y-3">
                    <p className="text-sm text-muted-foreground animate-pulse">Tap to reveal answer</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowAnswerInput(true);
                      }}
                      className="gap-2"
                    >
                      <Sparkles className="w-4 h-4" />
                      Try answering first
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Answer Input */}
        {showAnswerInput && !flipped && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 space-y-4"
          >
            <div className="bg-card border border-border rounded-xl p-6 space-y-4">
              <label className="text-sm font-medium text-foreground">Your Answer:</label>
              <Input
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && checkAnswer()}
                placeholder="Type your answer here..."
                className="text-base"
                autoFocus
                disabled={answerChecked}
              />
              <div className="flex gap-2">
                <Button
                  onClick={checkAnswer}
                  disabled={!userAnswer.trim() || answerChecked}
                  className="flex-1 gap-2"
                >
                  <Check className="w-4 h-4" />
                  Check Answer
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowAnswerInput(false);
                    setUserAnswer('');
                  }}
                  disabled={answerChecked}
                >
                  Skip
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Rating buttons */}
        {flipped && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8">
            <p className="text-center text-sm text-muted-foreground mb-2 font-heading">How well did you know this?</p>
            {suggestedRating && (
              <p className="text-center text-xs text-primary mb-4">
                💡 Suggested: {ratingButtons.find(b => b.value === suggestedRating)?.label} (based on time spent)
              </p>
            )}
            <div className="grid grid-cols-3 gap-3">
              {ratingButtons.map((btn) => (
                <button
                  key={btn.value}
                  onClick={() => handleRate(btn.value)}
                  disabled={rating}
                  className={`${btn.color} rounded-xl p-4 flex flex-col items-center gap-2 transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 shadow-lg ${
                    suggestedRating === btn.value ? 'ring-2 ring-primary ring-offset-2' : ''
                  }`}
                >
                  <btn.icon className="w-6 h-6" />
                  <div className="text-center">
                    <span className="text-sm font-bold block">{btn.label}</span>
                    <span className="text-xs opacity-90">{btn.description}</span>
                  </div>
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
