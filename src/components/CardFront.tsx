import { Button } from "@/components/ui/button";
import { Volume2 } from "lucide-react";

interface CardFrontProps {
  question: string;
  english: string;
  isPlaying: boolean;
  isListening: boolean;
  isProcessing: boolean;
  timeLeft: number;
  onPlayAudio: () => void;
  onStartListening: () => void;
}

export const CardFront = ({
  question,
  english,
  isPlaying,
  isListening,
  isProcessing,
  timeLeft,
  onPlayAudio,
  onStartListening,
}: CardFrontProps) => {
  return (
    <div className="flip-card-front bg-gradient-to-br from-[#8B5CF6] to-[#D946EF] rounded-lg shadow-lg p-8 flex flex-col items-center justify-between h-full">
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-bold text-white">{question}</h2>
        <p className="text-sm text-white/80">How to say: {english}</p>
      </div>
      <div className="flex gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={onPlayAudio}
          disabled={isPlaying}
          className="hover:bg-white/20 bg-white/10 border-white/30"
        >
          <Volume2 className="h-6 w-6 text-white" />
        </Button>
      </div>
    </div>
  );
};