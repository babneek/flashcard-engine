import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, Clock, Target, Award } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface SessionSummaryProps {
  cardsReviewed: number;
  accuracy: number;
  duration: number; // in seconds
  cardsImproved: number;
  deckId: string;
  onContinue?: () => void;
}

export function SessionSummary({
  cardsReviewed,
  accuracy,
  duration,
  cardsImproved,
  deckId,
  onContinue,
}: SessionSummaryProps) {
  const navigate = useNavigate();

  const getMotivationalMessage = () => {
    if (accuracy >= 90) return "Excellent work! 🌟";
    if (accuracy >= 70) return "Great job! Keep it up! 💪";
    return "Keep practicing! You're improving! 📚";
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="max-w-2xl mx-auto"
    >
      <Card className="shadow-xl">
        <CardHeader className="text-center pb-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="mx-auto mb-4 w-20 h-20 rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center"
          >
            <Award className="w-10 h-10 text-white" />
          </motion.div>
          <CardTitle className="text-3xl font-bold">Session Complete!</CardTitle>
          <p className="text-lg text-muted-foreground mt-2">{getMotivationalMessage()}</p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Accuracy */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Accuracy</span>
              <span className="text-2xl font-bold">{accuracy}%</span>
            </div>
            <Progress value={accuracy} className="h-3" />
          </motion.div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-center p-4 rounded-lg bg-secondary"
            >
              <Target className="w-6 h-6 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold">{cardsReviewed}</div>
              <div className="text-xs text-muted-foreground">Cards Reviewed</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-center p-4 rounded-lg bg-secondary"
            >
              <Clock className="w-6 h-6 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold">{formatDuration(duration)}</div>
              <div className="text-xs text-muted-foreground">Time Spent</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="text-center p-4 rounded-lg bg-secondary col-span-2 md:col-span-1"
            >
              <TrendingUp className="w-6 h-6 mx-auto mb-2 text-green-500" />
              <div className="text-2xl font-bold">{cardsImproved}</div>
              <div className="text-xs text-muted-foreground">Cards Improved</div>
            </motion.div>
          </div>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="flex gap-3 pt-4"
          >
            {onContinue && (
              <Button onClick={onContinue} className="flex-1" size="lg">
                Continue Studying
              </Button>
            )}
            <Button
              onClick={() => navigate("/")}
              variant="outline"
              className="flex-1"
              size="lg"
            >
              Back to Dashboard
            </Button>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
