import { Button } from "@/components/ui/button";
import { BookOpen, Rotate3D } from "lucide-react";

interface StudyModeToggleProps {
  studyMode: 'learn' | 'review';
  onModeChange: (mode: 'learn' | 'review') => void;
}

export const StudyModeToggle = ({ studyMode, onModeChange }: StudyModeToggleProps) => {
  return (
    <div className="flex justify-center gap-4 mb-6">
      <Button
        variant={studyMode === 'learn' ? "default" : "outline"}
        onClick={() => onModeChange('learn')}
        className={`w-32 ${
          studyMode === 'learn' 
            ? 'bg-gradient-to-r from-vividPurple to-magentaPink hover:from-magentaPink hover:to-vividPurple' 
            : 'hover:bg-softPurple/20'
        }`}
      >
        <BookOpen className="mr-2 h-4 w-4" />
        Learn 📚
      </Button>
      <Button
        variant={studyMode === 'review' ? "default" : "outline"}
        onClick={() => onModeChange('review')}
        className={`w-32 ${
          studyMode === 'review' 
            ? 'bg-gradient-to-r from-vividPurple to-magentaPink hover:from-magentaPink hover:to-vividPurple' 
            : 'hover:bg-softPurple/20'
        }`}
      >
        <Rotate3D className="mr-2 h-4 w-4" />
        Review 🔄
      </Button>
    </div>
  );
};