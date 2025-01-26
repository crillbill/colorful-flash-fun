import { Button } from "@/components/ui/button";
import { Mic } from "lucide-react";

interface VoiceRecordButtonProps {
  isListening: boolean;
  isProcessing: boolean;
  timeLeft: number;
  question: string;
  isPlaying: boolean;
  onStartListening: () => void;
}

export const VoiceRecordButton = ({
  isListening,
  isProcessing,
  timeLeft,
  question,
  isPlaying,
  onStartListening
}: VoiceRecordButtonProps) => {
  return (
    <div className="relative">
      <Button
        variant={isListening ? "destructive" : isProcessing ? "secondary" : "default"}
        size="lg"
        className={`gap-2 shadow-md hover:shadow-lg transition-all ${
          !isListening && !isProcessing 
            ? "bg-gradient-to-r from-[#8B5CF6] to-[#D946EF] text-white border-0" 
            : ""
        }`}
        onClick={(e) => {
          e.stopPropagation();
          onStartListening();
        }}
        disabled={isListening || isProcessing || isPlaying}
      >
        <Mic className={isListening ? "animate-pulse" : ""} />
        {isProcessing 
          ? "Processing..." 
          : isListening 
            ? `Speak now... (${timeLeft}s)` 
            : `Say "${question}"`}
      </Button>
      <div className="absolute -bottom-6 left-0 right-0 text-center text-sm text-mediumGray">
        {isListening && `${timeLeft} seconds remaining...`}
        {isProcessing && "Analyzing your pronunciation..."}
      </div>
    </div>
  );
};