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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-purple-900/20 dark:via-pink-900/20 dark:to-blue-900/20">
      {/* Header */}
      <header className="border-b-2 border-purple-200 dark:border-purple-800 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm sticky top-0 z-10 shadow-lg">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <motion.div 
                className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500 flex items-center justify-center shadow-lg"
                whileHover={{ scale: 1.05, rotate: 5 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <Brain className="w-6 h-6 text-white" />
              </motion.div>
              <div>
                <h1 className="text-2xl font-heading font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent hidden sm:block">
                  Flashcard Engine
                </h1>
                <p className="text-xs text-gray-600 dark:text-gray-400 hidden sm:block">Smart Learning Platform ✨</p>
              </div>
            </div>
            
            <div className="flex-1 max-w-md hidden md:block">
              <SearchBar />
            </div>

            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-purple-600 dark:text-purple-400 hidden lg:block">👋 {email}</span>
              <ThemeToggle />
              <Button 
                onClick={() => navigate('/create')} 
                className="gap-2 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 hover:from-purple-700 hover:via-pink-700 hover:to-blue-700 text-white font-medium shadow-lg hover:shadow-xl transition-all"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">New Deck</span>
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleLogout} 
                title="Logout"
                className="hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <LogOut className="w-4 h-4 text-gray-600 dark:text-gray-400" />
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
          <TabsList className="grid w-full max-w-md grid-cols-2 bg-white dark:bg-gray-800 p-1 rounded-xl shadow-lg border-2 border-purple-200 dark:border-purple-800">
            <TabsTrigger 
              value="progress" 
              className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white font-medium"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Progress
            </TabsTrigger>
            <TabsTrigger 
              value="decks"
              className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white font-medium"
            >
              <BookOpen className="w-4 h-4 mr-2" />
              My Decks
            </TabsTrigger>
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
                  <Card className="border-2 border-dashed border-purple-300 dark:border-purple-700 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-purple-900/20 dark:via-pink-900/20 dark:to-blue-900/20">
                    <CardContent className="p-12 text-center">
                      <motion.div
                        animate={{ y: [0, -10, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <BookOpen className="w-20 h-20 mx-auto text-purple-400 mb-4" />
                      </motion.div>
                      <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent mb-2">
                        Start Your Learning Journey! 🚀
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-6">
                        Create your first deck to begin studying with AI-powered flashcards
                      </p>
                      <Button 
                        onClick={() => navigate('/create')}
                        className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 hover:from-purple-700 hover:via-pink-700 hover:to-blue-700 text-white font-medium px-6 py-3 shadow-lg hover:shadow-xl transition-all"
                      >
                        <Plus className="w-5 h-5 mr-2" /> Create First Deck
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {decks.map((deck, index) => {
                    const stats = deckStats[deck.id] || { total: 0, mastered: 0, dueToday: 0 };
                    const masteryPercent = stats.total > 0 ? Math.round((stats.mastered / stats.total) * 100) : 0;
                    const colors = [
                      { gradient: 'from-purple-500 to-pink-500', bg: 'bg-purple-50 dark:bg-purple-900/20', ring: 'ring-purple-300' },
                      { gradient: 'from-blue-500 to-cyan-500', bg: 'bg-blue-50 dark:bg-blue-900/20', ring: 'ring-blue-300' },
                      { gradient: 'from-green-500 to-emerald-500', bg: 'bg-green-50 dark:bg-green-900/20', ring: 'ring-green-300' },
                      { gradient: 'from-orange-500 to-red-500', bg: 'bg-orange-50 dark:bg-orange-900/20', ring: 'ring-orange-300' },
                      { gradient: 'from-pink-500 to-rose-500', bg: 'bg-pink-50 dark:bg-pink-900/20', ring: 'ring-pink-300' },
                      { gradient: 'from-indigo-500 to-purple-500', bg: 'bg-indigo-50 dark:bg-indigo-900/20', ring: 'ring-indigo-300' },
                    ];
                    const color = colors[index % colors.length];
                    
                    return (
                      <motion.div 
                        key={deck.id} 
                        variants={item}
                        whileHover={{ scale: 1.03, y: -5 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Card
                          className={`group hover:shadow-2xl transition-all duration-300 cursor-pointer border-2 hover:${color.ring} hover:ring-2 bg-white dark:bg-gray-800 overflow-hidden`}
                          onClick={() => navigate(`/deck/${deck.id}`)}
                        >
                          <div className={`h-2 bg-gradient-to-r ${color.gradient}`} />
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <CardTitle className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                                  {deck.name}
                                </CardTitle>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">{deck.description}</p>
                              </div>
                              <span className={`text-xs font-bold bg-gradient-to-r ${color.gradient} text-white px-3 py-1.5 rounded-full whitespace-nowrap shadow-md`}>
                                {deck.cardCount} cards
                              </span>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div>
                              <div className="flex items-center justify-between text-sm mb-2">
                                <span className="font-medium text-gray-700 dark:text-gray-300">⭐ Mastery</span>
                                <span className="font-bold text-lg bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">{masteryPercent}%</span>
                              </div>
                              <div className="h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                <motion.div 
                                  className={`h-full bg-gradient-to-r ${color.gradient} rounded-full`}
                                  initial={{ width: 0 }}
                                  animate={{ width: `${masteryPercent}%` }}
                                  transition={{ duration: 1, delay: 0.2 }}
                                />
                              </div>
                            </div>
                            <div className={`flex items-center justify-between text-sm ${color.bg} p-3 rounded-lg border border-current/10`}>
                              <span className="font-medium text-gray-700 dark:text-gray-300">
                                {stats.dueToday > 0 ? `🔥 ${stats.dueToday} cards due!` : '✅ All caught up!'}
                              </span>
                            </div>
                            <div className="flex gap-2 pt-2">
                              <Button
                                size="sm"
                                className={`flex-1 gap-1 font-medium bg-gradient-to-r ${color.gradient} hover:opacity-90 text-white shadow-md`}
                                onClick={(e) => { e.stopPropagation(); navigate(`/study/${deck.id}`); }}
                                disabled={stats.dueToday === 0}
                              >
                                <Play className="w-4 h-4" /> Study
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="flex-1 gap-1 font-medium border-2"
                                onClick={(e) => { e.stopPropagation(); navigate(`/deck/${deck.id}`); }}
                              >
                                <BarChart3 className="w-4 h-4" /> Stats
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
