import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface NavigationControlsProps {
  onPrevious: () => void;
  onNext: () => void;
  isFirstItem: boolean;
  isLastItem: boolean;
}

export const NavigationControls = ({
  onPrevious,
  onNext,
  isFirstItem,
  isLastItem,
}: NavigationControlsProps) => {
  return (
    <div className="flex gap-4">
      <Button
        onClick={onPrevious}
        disabled={isFirstItem}
        className="w-32 bg-gradient-to-r from-vividPurple to-magentaPink hover:from-magentaPink hover:to-vividPurple disabled:opacity-50"
      >
        <ChevronLeft className="mr-2" />
        Previous ⬅️
      </Button>

      <Button
        onClick={onNext}
        disabled={isLastItem}
        className="w-32 bg-gradient-to-r from-vividPurple to-magentaPink hover:from-magentaPink hover:to-vividPurple disabled:opacity-50"
      >
        Next ➡️
        <ChevronRight className="ml-2" />
      </Button>
    </div>
  );
};