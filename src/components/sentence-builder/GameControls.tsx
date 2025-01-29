import { Button } from "@/components/ui/button";
import { Lightbulb, RotateCcw, CheckCircle } from "lucide-react";

interface GameControlsProps {
  onCheck: () => void;
  onShowHint: () => void;
  onReset: () => void;
}

export const GameControls = ({ onCheck, onShowHint, onReset }: GameControlsProps) => {
  return (
    <div className="flex flex-wrap gap-4 justify-center">
      <Button 
        onClick={onCheck}
        className="bg-brightOrange hover:bg-orange-600 text-white"
      >
        <CheckCircle className="w-4 h-4 mr-2" />
        Check Answer ✨
      </Button>
      <Button 
        variant="outline" 
        onClick={onShowHint}
        className="border-brightOrange text-brightOrange hover:bg-brightOrange/10"
      >
        <Lightbulb className="w-4 h-4 mr-2" />
        Show Hint 💡
      </Button>
      <Button 
        variant="secondary" 
        onClick={onReset}
        className="bg-softGray hover:bg-gray-200"
      >
        <RotateCcw className="w-4 h-4 mr-2" />
        Reset Game 🔄
      </Button>
    </div>
  );
};