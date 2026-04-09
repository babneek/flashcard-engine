import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Flame, TrendingUp, Target, AlertCircle, Play } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, LineChart, Line } from "recharts";
import { apiGetDashboard } from "@/lib/progress-api";
import { useNavigate } from "react-router-dom";

const COLORS = {
  new: "#94a3b8",
  learning: "#3b82f6",
  review: "#f59e0b",
  mastered: "#10b981",
};

export function ProgressDashboard({ onSwitchToDecks }: { onSwitchToDecks?: () => void }) {
  const [dashboard, setDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const data = await apiGetDashboard();
      setDashboard(data);
    } catch (error) {
      console.error("Failed to load dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Failed to load dashboard data</p>
      </div>
    );
  }

  const masteryData = [
    { name: "New", value: dashboard.mastery.new, color: COLORS.new },
    { name: "Learning", value: dashboard.mastery.learning, color: COLORS.learning },
    { name: "Review", value: dashboard.mastery.review, color: COLORS.review },
    { name: "Mastered", value: dashboard.mastery.mastered, color: COLORS.mastered },
  ].filter(item => item.value > 0);

  const progressPercentage = dashboard.mastery.total > 0
    ? Math.round((dashboard.mastery.mastered / dashboard.mastery.total) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Due Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Due Today</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboard.due_cards}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {dashboard.due_cards === 0 ? "All caught up! 🎉" : "Cards ready to review"}
              </p>
              {dashboard.due_cards > 0 && (
                <Button size="sm" className="mt-3 w-full" onClick={() => onSwitchToDecks?.()}>
                  <Play className="h-4 w-4 mr-2" />
                  Start Review
                </Button>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Streak */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
              <Flame className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold flex items-center gap-2">
                {dashboard.streak.current_streak}
                {dashboard.streak.current_streak > 0 && <span className="text-orange-500">🔥</span>}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Best: {dashboard.streak.longest_streak} days
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Total Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Cards</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboard.mastery.total}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {dashboard.mastery.mastered} mastered ({progressPercentage}%)
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Weak Areas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Weak Areas</CardTitle>
              <AlertCircle className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboard.weak_areas.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {dashboard.weak_areas.length === 0 ? "No weak areas! 💪" : "Decks need attention"}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Mastery Progress */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Overall Progress</CardTitle>
            <CardDescription>Your mastery across all decks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Mastery Level</span>
                  <span className="text-sm text-muted-foreground">{progressPercentage}%</span>
                </div>
                <Progress value={progressPercentage} className="h-3" />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold" style={{ color: COLORS.new }}>
                    {dashboard.mastery.new}
                  </div>
                  <div className="text-xs text-muted-foreground">New</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold" style={{ color: COLORS.learning }}>
                    {dashboard.mastery.learning}
                  </div>
                  <div className="text-xs text-muted-foreground">Learning</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold" style={{ color: COLORS.review }}>
                    {dashboard.mastery.review}
                  </div>
                  <div className="text-xs text-muted-foreground">Review</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold" style={{ color: COLORS.mastered }}>
                    {dashboard.mastery.mastered}
                  </div>
                  <div className="text-xs text-muted-foreground">Mastered</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Mastery Distribution Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Mastery Distribution</CardTitle>
              <CardDescription>Breakdown by category</CardDescription>
            </CardHeader>
            <CardContent>
              {masteryData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={masteryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {masteryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                  No cards yet. Upload a PDF to get started!
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Activity Chart */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.6 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Cards reviewed in the last 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              {dashboard.progress_chart && dashboard.progress_chart.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={dashboard.progress_chart}>
                    <XAxis
                      dataKey="date"
                      tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    />
                    <YAxis />
                    <Tooltip
                      labelFormatter={(value) => new Date(value).toLocaleDateString()}
                      formatter={(value: any) => [value, "Cards"]}
                    />
                    <Bar dataKey="cards_reviewed" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                  No activity yet. Start studying to see your progress!
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Weak Areas */}
      {dashboard.weak_areas.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.7 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Areas Needing Attention</CardTitle>
              <CardDescription>Decks where you're struggling</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dashboard.weak_areas.map((area: any, index: number) => (
                  <div
                    key={area.deck_id}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent transition-colors cursor-pointer"
                    onClick={() => navigate(`/study/${area.deck_id}`)}
                  >
                    <div>
                      <div className="font-medium">{area.deck_name}</div>
                      <div className="text-sm text-muted-foreground">
                        {area.struggling_cards} of {area.total_cards} cards need review
                      </div>
                    </div>
                    <Button size="sm" variant="outline" onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/study/${area.deck_id}`);
                    }}>
                      Practice
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
