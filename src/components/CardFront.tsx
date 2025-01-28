import { Button } from "@/components/ui/button";
import { Volume2, ArrowLeft, ArrowRight } from "lucide-react";
import { AudioButton } from "./AudioButton";

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
    <div className="bg-gradient-to-br from-softPurple via-softBlue to-softPink rounded-xl shadow-lg p-8 flex flex-col items-center justify-between h-full border border-white/20 backdrop-blur-sm transition-all duration-300 hover:shadow-xl">
      <div className="text-center space-y-6 w-full">
        <p className="text-lg text-gray-600 font-medium">
          How to say <span className="text-primaryPurple">"{english}"</span> in Hebrew
        </p>
        <h2 
          className="text-5xl font-bold text-darkPurple mb-2 transition-all duration-300 hover:scale-105" 
          dir="rtl"
        >
          {question}
        </h2>
      </div>
      
      <div className="flex items-center gap-4 mt-6">
        {showPrevious && (
          <Button
            variant="outline"
            size="icon"
            onClick={onPrevious}
            className="bg-white/80 hover:bg-white border-primaryPurple/20 hover:border-primaryPurple transition-all duration-300"
          >
            <ArrowLeft className="h-6 w-6 text-primaryPurple" />
          </Button>
        )}
        <AudioButton
          isPlaying={isPlaying}
          onToggle={onPlayAudio}
          disabled={isListening || isProcessing}
        />
        {showNext && (
          <Button
            variant="outline"
            size="icon"
            onClick={onNext}
            className="bg-white/80 hover:bg-white border-primaryPurple/20 hover:border-primaryPurple transition-all duration-300"
          >
            <ArrowRight className="h-6 w-6 text-primaryPurple" />
          </Button>
        )}
      </div>
    </div>
  );
};