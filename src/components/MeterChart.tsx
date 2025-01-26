import { cn } from "@/lib/utils";
import { Frown, Meh, Smile } from "lucide-react";

interface MeterChartProps {
  score: number;
  maxScore?: number;
}

export const MeterChart = ({ score, maxScore = 100 }: MeterChartProps) => {
  // Convert score to percentage for width calculation
  const percentage = (score / maxScore) * 100;
  
  // Get emoji and color based on score
  const getScoreDisplay = (score: number) => {
    if (score >= 80) return { color: "from-green-400 to-green-500", icon: <Smile className="w-4 h-4 text-green-500" /> };
    if (score >= 60) return { color: "from-yellow-400 to-yellow-500", icon: <Meh className="w-4 h-4 text-yellow-500" /> };
    return { color: "from-red-400 to-red-500", icon: <Frown className="w-4 h-4 text-red-500" /> };
  };

  const { color, icon } = getScoreDisplay(score);

  return (
    <div className="w-full max-w-[120px] mx-auto mb-3">
      <div className="relative">
        {/* Background semi-circle */}
        <div className="h-14 bg-secondary rounded-t-full overflow-hidden">
          {/* Score gauge */}
          <div
            className={cn(
              "h-full bg-gradient-to-r transition-all duration-500 ease-out rounded-t-full",
              color
            )}
            style={{ width: `${percentage}%` }}
          />
        </div>
        
        {/* Score display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-xl font-bold">{score}</div>
          <div className="text-[11px] text-muted-foreground -mt-0.5">out of {maxScore}</div>
          <div className="mt-1">{icon}</div>
        </div>
      </div>
    </div>
  );
};