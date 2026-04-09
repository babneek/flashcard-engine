import { useFlashcardStore } from '@/lib/store';
import { motion } from 'framer-motion';
import { BookOpen, Brain, Clock, TrendingUp, Plus, Play, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { decks, getOverallStats, getDeckStats } = useFlashcardStore();
  const overall = getOverallStats();
  const navigate = useNavigate();

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08 } },
  };
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Brain className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-heading font-bold text-foreground">Flashcard Engine</h1>
          </div>
          <Button onClick={() => navigate('/create')} className="gap-2">
            <Plus className="w-4 h-4" />
            New Deck
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {/* Bento Grid */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          {/* Stats tiles - top row */}
          <motion.div variants={item}>
            <Card className="h-full bg-ocean-deep text-primary-foreground border-0">
              <CardContent className="p-6 flex flex-col justify-between h-full">
                <BookOpen className="w-8 h-8 opacity-80" />
                <div className="mt-4">
                  <p className="text-3xl font-heading font-bold">{overall.totalDecks}</p>
                  <p className="text-sm opacity-70">Total Decks</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={item}>
            <Card className="h-full border-0 bg-ocean-mid text-primary-foreground">
              <CardContent className="p-6 flex flex-col justify-between h-full">
                <TrendingUp className="w-8 h-8 opacity-80" />
                <div className="mt-4">
                  <p className="text-3xl font-heading font-bold">{overall.totalCards}</p>
                  <p className="text-sm opacity-70">Total Cards</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={item}>
            <Card className="h-full border-0 bg-accent text-accent-foreground">
              <CardContent className="p-6 flex flex-col justify-between h-full">
                <Clock className="w-8 h-8 opacity-80" />
                <div className="mt-4">
                  <p className="text-3xl font-heading font-bold">{overall.dueToday}</p>
                  <p className="text-sm opacity-70">Due Today</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={item}>
            <Card className="h-full border-0 bg-secondary">
              <CardContent className="p-6 flex flex-col justify-between h-full">
                <BarChart3 className="w-8 h-8 text-muted-foreground" />
                <div className="mt-4">
                  <p className="text-3xl font-heading font-bold text-foreground">{overall.studiedThisWeek}</p>
                  <p className="text-sm text-muted-foreground">Studied This Week</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Deck list */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
        >
          <h2 className="text-xl font-heading font-semibold text-foreground mb-4">Your Decks</h2>
          {decks.length === 0 ? (
            <motion.div variants={item}>
              <Card className="border-dashed border-2">
                <CardContent className="p-12 text-center">
                  <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-heading font-semibold mb-2">No decks yet</h3>
                  <p className="text-muted-foreground mb-4">Create your first deck to start learning</p>
                  <Button onClick={() => navigate('/create')}>
                    <Plus className="w-4 h-4 mr-2" /> Create Deck
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {decks.map((deck) => {
                const stats = getDeckStats(deck.id);
                const masteryPercent = stats.total > 0 ? Math.round((stats.mastered / stats.total) * 100) : 0;
                return (
                  <motion.div key={deck.id} variants={item}>
                    <Card className="group hover:shadow-lg transition-all duration-300 hover:border-primary/30 cursor-pointer"
                          onClick={() => navigate(`/deck/${deck.id}`)}>
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg font-heading">{deck.name}</CardTitle>
                            <p className="text-sm text-muted-foreground mt-1">{deck.description}</p>
                          </div>
                          <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded-full">
                            {deck.cardCount} cards
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <div className="flex items-center justify-between text-sm mb-2">
                            <span className="text-muted-foreground">Mastery</span>
                            <span className="font-semibold text-foreground">{masteryPercent}%</span>
                          </div>
                          <Progress value={masteryPercent} className="h-2" />
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">
                            {stats.dueToday > 0 ? `${stats.dueToday} cards due` : 'All caught up!'}
                          </span>
                          {deck.lastStudiedAt && (
                            <span className="text-xs text-muted-foreground">
                              Last: {deck.lastStudiedAt}
                            </span>
                          )}
                        </div>
                        <div className="flex gap-2 pt-2">
                          <Button
                            size="sm"
                            className="flex-1 gap-1"
                            onClick={(e) => { e.stopPropagation(); navigate(`/study/${deck.id}`); }}
                            disabled={stats.dueToday === 0}
                          >
                            <Play className="w-3 h-3" /> Study
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 gap-1"
                            onClick={(e) => { e.stopPropagation(); navigate(`/deck/${deck.id}`); }}
                          >
                            <BarChart3 className="w-3 h-3" /> Stats
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
};

export default Dashboard;
