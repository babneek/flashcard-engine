import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Brain, Plus, Play, BarChart3, LogOut, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';
import { apiGetDecks, apiGetDeckStats } from '@/lib/api';
import { useAuthStore } from '@/lib/auth-store';
import { ProgressDashboard } from '@/components/ProgressDashboard';
import { ThemeToggle } from '@/components/ThemeToggle';
import { SearchBar } from '@/components/SearchBar';

interface DeckData {
  id: string;
  name: string;
  description: string;
  cardCount: number;
  createdAt: string;
  lastStudiedAt: string | null;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { isAuthenticated, email, logout } = useAuthStore();
  const [decks, setDecks] = useState<DeckData[]>([]);
  const [deckStats, setDeckStats] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("progress");

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    loadData();
  }, [isAuthenticated]);

  const loadData = async () => {
    try {
      const decksData = await apiGetDecks();
      setDecks(decksData);

      // Load stats for each deck
      const statsMap: Record<string, any> = {};
      await Promise.all(
        decksData.map(async (d: DeckData) => {
          try {
            statsMap[d.id] = await apiGetDeckStats(d.id);
          } catch {
            statsMap[d.id] = { total: 0, mastered: 0, learning: 0, struggling: 0, dueToday: 0, weeklyAccuracy: 0 };
          }
        })
      );
      setDeckStats(statsMap);
    } catch (err) {
      console.error('Failed to load dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08 } },
  };
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground font-heading">Loading your decks...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-ocean-light flex items-center justify-center shadow-lg shadow-primary/20">
                <Brain className="w-5 h-5 text-primary-foreground" />
              </div>
              <h1 className="text-2xl font-heading font-bold text-foreground hidden sm:block">Flashcard Engine</h1>
            </div>
            
            <div className="flex-1 max-w-md hidden md:block">
              <SearchBar />
            </div>

            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground hidden lg:block">{email}</span>
              <ThemeToggle />
              <Button onClick={() => navigate('/create')} className="gap-2">
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">New Deck</span>
              </Button>
              <Button variant="ghost" size="icon" onClick={handleLogout} title="Logout">
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          {/* Mobile Search */}
          <div className="mt-4 md:hidden">
            <SearchBar />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="progress">Progress</TabsTrigger>
            <TabsTrigger value="decks">Decks</TabsTrigger>
          </TabsList>

          <TabsContent value="progress" className="space-y-6">
            <ProgressDashboard onSwitchToDecks={() => setActiveTab("decks")} />
          </TabsContent>

          <TabsContent value="decks" className="space-y-6">
            {/* Deck list */}
            <motion.div variants={container} initial="hidden" animate="show">
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
                    const stats = deckStats[deck.id] || { total: 0, mastered: 0, dueToday: 0 };
                    const masteryPercent = stats.total > 0 ? Math.round((stats.mastered / stats.total) * 100) : 0;
                    return (
                      <motion.div key={deck.id} variants={item}>
                        <Card
                          className="group hover:shadow-lg transition-all duration-300 hover:border-primary/30 cursor-pointer hover:-translate-y-1"
                          onClick={() => navigate(`/deck/${deck.id}`)}
                        >
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                              <div>
                                <CardTitle className="text-lg font-heading">{deck.name}</CardTitle>
                                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{deck.description}</p>
                              </div>
                              <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded-full whitespace-nowrap">
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
                                <span className="text-xs text-muted-foreground">Last: {deck.lastStudiedAt}</span>
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
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Dashboard;
