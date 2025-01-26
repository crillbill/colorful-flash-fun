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
        {/* Background bar */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#ea384c] via-[#FEC6A1] via-[#FEF7CD] to-[#F2FCE2] shadow-sm" />
        
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
        <span className="text-sm font-medium text-gray-600">
          Score: {score}
        </span>
      </div>
    </div>
  );
};