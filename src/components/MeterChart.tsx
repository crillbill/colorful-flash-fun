import { cn } from "@/lib/utils";

interface MeterChartProps {
  score: number;
  maxScore?: number;
}

export const MeterChart = ({ score, maxScore = 100 }: MeterChartProps) => {
  // Convert score to percentage for width calculation
  const percentage = (score / maxScore) * 100;
  
  return (
    <div className="w-full max-w-[300px] mx-auto mb-6">
      <div className="relative h-4">
        {/* Background bar with gradient: red -> yellow -> light green -> dark green */}
        <div 
          className={cn(
            "absolute inset-0 rounded-full bg-gradient-to-r from-[#ea384c] via-[#FEF7CD] via-[#90EE90] to-[#228B22]",
            percentage > 90 && "animate-[pulse_2s_cubic-bezier(0.4,0,0.6,1)_infinite]"
          )}
          style={{
            backgroundSize: '200%',
            backgroundPosition: 'left',
            backgroundImage: 'linear-gradient(to right, #ea384c 0%, #ea384c 30%, #FEF7CD 30%, #FEF7CD 70%, #90EE90 70%, #228B22 100%)'
          }}
        />
        
        {/* White overlay that covers the unfilled portion */}
        <div 
          className="absolute right-0 top-0 bottom-0 bg-white rounded-r-full transition-all duration-500 ease-out"
          style={{ width: `${100 - percentage}%` }}
        />
        
        {/* Score indicator line */}
        <div 
          className="absolute top-[-4px] bottom-[-4px] w-0.5 bg-black transition-all duration-500 ease-out"
          style={{ left: `${percentage}%` }}
        />
      </div>
      
      {/* Score display */}
      <div className="text-center mt-2">
        <span className={cn(
          "text-sm font-medium text-gray-600",
          percentage > 90 && "font-bold"
        )}>
          Score: {score}
        </span>
      </div>
    </div>
  );
};