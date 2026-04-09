import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { Trophy, Star, Flame, Target } from "lucide-react";

interface CelebrationProps {
  show: boolean;
  type: "perfect" | "streak" | "mastered" | "milestone";
  message: string;
  onClose: () => void;
}

const celebrationIcons = {
  perfect: Trophy,
  streak: Flame,
  mastered: Star,
  milestone: Target,
};

const celebrationColors = {
  perfect: "from-yellow-400 to-orange-500",
  streak: "from-orange-400 to-red-500",
  mastered: "from-green-400 to-emerald-500",
  milestone: "from-blue-400 to-purple-500",
};

export function Celebration({ show, type, message, onClose }: CelebrationProps) {
  useEffect(() => {
    if (show) {
      // Trigger confetti
      const duration = 2000;
      const end = Date.now() + duration;

      const colors = {
        perfect: ["#fbbf24", "#f97316"],
        streak: ["#fb923c", "#ef4444"],
        mastered: ["#4ade80", "#10b981"],
        milestone: ["#60a5fa", "#a78bfa"],
      };

      const frame = () => {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: colors[type],
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: colors[type],
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };

      frame();

      // Auto close after 3 seconds
      const timeout = setTimeout(onClose, 3000);
      return () => clearTimeout(timeout);
    }
  }, [show, type, onClose]);

  const Icon = celebrationIcons[type];

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 20,
            }}
            className="relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`bg-gradient-to-br ${celebrationColors[type]} p-12 rounded-3xl shadow-2xl text-white`}>
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 10, -10, 0],
                }}
                transition={{
                  duration: 0.5,
                  repeat: Infinity,
                  repeatDelay: 1,
                }}
                className="flex justify-center mb-6"
              >
                <Icon className="w-24 h-24" />
              </motion.div>
              
              <h2 className="text-3xl font-bold text-center mb-2">
                {type === "perfect" && "Perfect Session!"}
                {type === "streak" && "Streak Milestone!"}
                {type === "mastered" && "Deck Mastered!"}
                {type === "milestone" && "Achievement Unlocked!"}
              </h2>
              
              <p className="text-center text-lg opacity-90">{message}</p>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                className="mt-6 w-full bg-white/20 hover:bg-white/30 backdrop-blur-sm py-2 px-4 rounded-lg transition-colors"
              >
                Continue
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
