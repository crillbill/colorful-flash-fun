import { cn } from "@/lib/utils";

interface MeterChartProps {
  score: number;
  maxScore?: number;
}

export const MeterChart = ({ score, maxScore = 10 }: MeterChartProps) => {
  // Convert score to percentage for width calculation
  const percentage = (score / maxScore) * 100;
  
  // Determine color gradient based on score
  const getGradient = (score: number) => {
    if (score >= 8) return "from-green-400 to-green-500";
    if (score >= 6) return "from-yellow-400 to-yellow-500";
    if (score >= 4) return "from-orange-400 to-orange-500";
    return "from-red-400 to-red-500";
  };

  return (
    <div className="w-full max-w-md mx-auto mb-6">
      <div className="flex justify-between mb-2">
        <span className="text-sm font-medium">Pronunciation Score</span>
        <span className="text-sm font-medium">{score}/{maxScore}</span>
      </div>
      <div className="h-4 bg-secondary rounded-full overflow-hidden">
        <div
          className={cn(
            "h-full bg-gradient-to-r transition-all duration-500 ease-out rounded-full",
            getGradient(score)
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};