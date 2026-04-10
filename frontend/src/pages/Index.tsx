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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-purple-900 dark:via-pink-900 dark:to-blue-900">
      {/* Header */}
      <header className="border-b-4 border-rainbow bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-10 shadow-lg">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <motion.div 
                className="w-12 h-12 rounded-2xl bg-gradient-to-br from-yellow-400 via-pink-500 to-purple-600 flex items-center justify-center shadow-xl"
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Brain className="w-6 h-6 text-white" />
              </motion.div>
              <div>
                <h1 className="text-2xl font-heading font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 hidden sm:block">
                  🎓 Smart Cards
                </h1>
                <p className="text-xs text-gray-600 dark:text-gray-400 hidden sm:block">Learn & Have Fun!</p>
              </div>
            </div>
            
            <div className="flex-1 max-w-md hidden md:block">
              <SearchBar />
            </div>

            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-purple-600 dark:text-purple-400 hidden lg:block">👋 {email}</span>
              <ThemeToggle />
              <Button 
                onClick={() => navigate('/create')} 
                className="gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">✨ New Deck</span>
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleLogout} 
                title="Logout"
                className="hover:bg-red-100 dark:hover:bg-red-900"
              >
                <LogOut className="w-4 h-4 text-red-500" />
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
          <TabsList className="grid w-full max-w-md grid-cols-2 bg-white dark:bg-gray-800 p-1 rounded-2xl shadow-lg">
            <TabsTrigger 
              value="progress" 
              className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white font-bold"
            >
              📊 Progress
            </TabsTrigger>
            <TabsTrigger 
              value="decks"
              className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white font-bold"
            >
              📚 My Decks
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
                  <Card className="border-4 border-dashed border-purple-300 dark:border-purple-700 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
                    <CardContent className="p-12 text-center">
                      <motion.div
                        animate={{ y: [0, -10, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <BookOpen className="w-20 h-20 mx-auto text-purple-400 mb-4" />
                      </motion.div>
                      <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-2">
                        🎉 Let's Start Learning!
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-6 text-lg">
                        Create your first deck and start your learning adventure! 🚀
                      </p>
                      <Button 
                        onClick={() => navigate('/create')}
                        className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold text-lg px-8 py-6 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all"
                      >
                        <Plus className="w-5 h-5 mr-2" /> ✨ Create My First Deck
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
                      'from-purple-400 to-pink-400',
                      'from-blue-400 to-cyan-400',
                      'from-green-400 to-emerald-400',
                      'from-orange-400 to-red-400',
                      'from-yellow-400 to-orange-400',
                      'from-indigo-400 to-purple-400',
                    ];
                    const colorClass = colors[index % colors.length];
                    
                    return (
                      <motion.div 
                        key={deck.id} 
                        variants={item}
                        whileHover={{ scale: 1.05, rotate: 1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Card
                          className="group hover:shadow-2xl transition-all duration-300 cursor-pointer border-4 border-transparent hover:border-purple-300 dark:hover:border-purple-600 bg-white dark:bg-gray-800 overflow-hidden"
                          onClick={() => navigate(`/deck/${deck.id}`)}
                        >
                          <div className={`h-3 bg-gradient-to-r ${colorClass}`} />
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <CardTitle className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                                  {deck.name}
                                </CardTitle>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">{deck.description}</p>
                              </div>
                              <span className={`text-xs font-bold bg-gradient-to-r ${colorClass} text-white px-3 py-1.5 rounded-full whitespace-nowrap shadow-md`}>
                                🎴 {deck.cardCount}
                              </span>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div>
                              <div className="flex items-center justify-between text-sm mb-2">
                                <span className="font-bold text-gray-700 dark:text-gray-300">⭐ Mastery</span>
                                <span className="font-black text-lg text-purple-600">{masteryPercent}%</span>
                              </div>
                              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                <motion.div 
                                  className={`h-full bg-gradient-to-r ${colorClass} rounded-full`}
                                  initial={{ width: 0 }}
                                  animate={{ width: `${masteryPercent}%` }}
                                  transition={{ duration: 1, delay: 0.2 }}
                                />
                              </div>
                            </div>
                            <div className="flex items-center justify-between text-sm bg-purple-50 dark:bg-purple-900/20 p-3 rounded-xl">
                              <span className="font-bold text-gray-700 dark:text-gray-300">
                                {stats.dueToday > 0 ? `🔥 ${stats.dueToday} cards due!` : '✅ All caught up!'}
                              </span>
                            </div>
                            <div className="flex gap-2 pt-2">
                              <Button
                                size="sm"
                                className={`flex-1 gap-1 font-bold bg-gradient-to-r ${colorClass} hover:opacity-90 text-white shadow-lg`}
                                onClick={(e) => { e.stopPropagation(); navigate(`/study/${deck.id}`); }}
                                disabled={stats.dueToday === 0}
                              >
                                <Play className="w-4 h-4" /> 🎮 Study
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="flex-1 gap-1 font-bold border-2 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                                onClick={(e) => { e.stopPropagation(); navigate(`/deck/${deck.id}`); }}
                              >
                                <BarChart3 className="w-4 h-4" /> 📊 Stats
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
