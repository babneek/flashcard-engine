import { useParams, useNavigate } from 'react-router-dom';
import { useFlashcardStore } from '@/lib/store';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Play, Trash2, BookOpen } from 'lucide-react';

const DeckDetailPage = () => {
  const { deckId } = useParams<{ deckId: string }>();
  const navigate = useNavigate();
  const { decks, getDeckStats, getDeckCards, deleteDeck } = useFlashcardStore();
  const deck = decks.find((d) => d.id === deckId);

  if (!deck) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Deck not found</p>
      </div>
    );
  }

  const stats = getDeckStats(deck.id);
  const cards = getDeckCards(deck.id);
  const masteryPercent = stats.total > 0 ? Math.round((stats.mastered / stats.total) * 100) : 0;

  const statItems = [
    { label: 'Mastered', count: stats.mastered, color: 'bg-ocean-glow', pct: stats.total > 0 ? (stats.mastered / stats.total) * 100 : 0 },
    { label: 'Learning', count: stats.learning, color: 'bg-primary', pct: stats.total > 0 ? (stats.learning / stats.total) * 100 : 0 },
    { label: 'Struggling', count: stats.struggling, color: 'bg-destructive', pct: stats.total > 0 ? (stats.struggling / stats.total) * 100 : 0 },
  ];

  const handleDelete = () => {
    if (window.confirm('Delete this deck and all its cards?')) {
      deleteDeck(deck.id);
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          <div className="flex gap-2">
            <Button size="sm" onClick={() => navigate(`/study/${deck.id}`)} disabled={stats.dueToday === 0}>
              <Play className="w-4 h-4 mr-2" /> Study ({stats.dueToday} due)
            </Button>
            <Button size="sm" variant="destructive" onClick={handleDelete}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-heading font-bold mb-2">{deck.name}</h1>
          <p className="text-muted-foreground mb-8">{deck.description}</p>

          {/* Stats bento */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card className="md:col-span-2">
              <CardHeader><CardTitle className="text-lg font-heading">Mastery Breakdown</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {statItems.map((s) => (
                  <div key={s.label} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>{s.label}</span>
                      <span className="font-semibold">{s.count} cards ({Math.round(s.pct)}%)</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full rounded-full ${s.color}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${s.pct}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <div className="space-y-4">
              <Card className="bg-ocean-deep text-primary-foreground border-0">
                <CardContent className="p-6 text-center">
                  <p className="text-4xl font-heading font-bold">{masteryPercent}%</p>
                  <p className="text-sm opacity-70">Overall Mastery</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-4xl font-heading font-bold text-foreground">{stats.weeklyAccuracy}%</p>
                  <p className="text-sm text-muted-foreground">Weekly Accuracy</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Card list */}
          <h2 className="text-xl font-heading font-semibold mb-4">All Cards ({cards.length})</h2>
          <div className="space-y-2">
            {cards.map((card, i) => (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <Card className="hover:shadow-sm transition-shadow">
                  <CardContent className="p-4 flex items-start gap-4">
                    <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                      <BookOpen className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{card.front}</p>
                      <p className="text-xs text-muted-foreground mt-1 truncate">{card.back}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full shrink-0 ${
                      card.repetitions >= 3 && card.interval >= 14
                        ? 'bg-accent/20 text-accent-foreground'
                        : card.repetitions === 0
                        ? 'bg-destructive/10 text-destructive'
                        : 'bg-secondary text-secondary-foreground'
                    }`}>
                      {card.repetitions >= 3 && card.interval >= 14 ? 'Mastered' : card.repetitions === 0 ? 'New' : 'Learning'}
                    </span>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default DeckDetailPage;
