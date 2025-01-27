import { Button } from "@/components/ui/button";
import { Volume2, VolumeX } from "lucide-react";

interface AudioButtonProps {
  isPlaying: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

export const AudioButton = ({ isPlaying, onToggle, disabled }: AudioButtonProps) => {
  return (
    <div onClick={(e) => e.stopPropagation()}>
      <Button
        variant="ghost"
        size="icon"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onToggle();
        }}
        disabled={disabled}
      >
        {isPlaying ? <VolumeX className="h-6 w-6" /> : <Volume2 className="h-6 w-6" />}
      </Button>
    </div>
  );
};