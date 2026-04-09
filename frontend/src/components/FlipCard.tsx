import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface FlipCardProps {
  front: string;
  back: string;
  isFlipped: boolean;
  onFlip: () => void;
  className?: string;
}

export function FlipCard({ front, back, isFlipped, onFlip, className }: FlipCardProps) {
  return (
    <div className={cn("perspective-1000 w-full", className)} style={{ perspective: "1000px" }}>
      <motion.div
        className="relative w-full h-full cursor-pointer"
        onClick={onFlip}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{
          duration: 0.6,
          type: "spring",
          stiffness: 100,
          damping: 15,
        }}
        style={{
          transformStyle: "preserve-3d",
        }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {/* Front Side */}
        <motion.div
          className="absolute inset-0"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
          }}
        >
          <Card className="h-full border-2 shadow-xl hover:shadow-2xl transition-shadow">
            <CardContent className="flex items-center justify-center h-full p-8">
              <div className="text-center">
                <p className="text-2xl font-medium leading-relaxed">{front}</p>
                <p className="text-sm text-muted-foreground mt-6">Click to reveal answer</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Back Side */}
        <motion.div
          className="absolute inset-0"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            rotateY: 180,
          }}
        >
          <Card className="h-full border-2 border-primary shadow-xl bg-primary/5">
            <CardContent className="flex items-center justify-center h-full p-8">
              <div className="text-center">
                <p className="text-xl leading-relaxed">{back}</p>
                <p className="text-sm text-muted-foreground mt-6">Rate your answer below</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}
