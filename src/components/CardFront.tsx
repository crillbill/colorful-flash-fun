import { Button } from "@/components/ui/button";
import { Volume2, ArrowLeft, ArrowRight } from "lucide-react";

interface CardFrontProps {
  question: string;
  english: string;
  isPlaying: boolean;
  isListening: boolean;
  isProcessing: boolean;
  timeLeft: number;
  onPlayAudio: () => void;
  onStartListening: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
  showPrevious?: boolean;
  showNext?: boolean;
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
  onPrevious,
  onNext,
  showPrevious = true,
  showNext = true,
}: CardFrontProps) => {
  return (
    <div className="bg-gradient-to-br from-[#8B5CF6] to-[#D946EF] rounded-lg shadow-lg p-8 flex flex-col items-center justify-between h-full">
      <div className="text-center space-y-4">
        <p className="text-lg text-white/90">How to say "{english}"</p>
        <h2 className="text-4xl font-bold text-white mb-2" dir="rtl">{question}</h2>
      </div>
      <div className="flex items-center gap-4">
        {showPrevious && (
          <Button
            variant="outline"
            size="icon"
            onClick={onPrevious}
            className="hover:bg-white/20 bg-white/10 border-white/30"
          >
            <ArrowLeft className="h-6 w-6 text-white" />
          </Button>
        )}
        <Button
          variant="outline"
          size="icon"
          onClick={onPlayAudio}
          disabled={isPlaying}
          className="hover:bg-white/20 bg-white/10 border-white/30"
        >
          <Volume2 className="h-6 w-6 text-white" />
        </Button>
        {showNext && (
          <Button
            variant="outline"
            size="icon"
            onClick={onNext}
            className="hover:bg-white/20 bg-white/10 border-white/30"
          >
            <ArrowRight className="h-6 w-6 text-white" />
          </Button>
        )}
      </div>
    </div>
  );
};