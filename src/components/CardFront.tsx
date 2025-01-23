import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mic } from "lucide-react";
import { AudioButton } from "./AudioButton";

interface CardFrontProps {
  question: string;
  isPlaying: boolean;
  isListening: boolean;
  isProcessing: boolean;
  timeLeft: number;
  onPlayAudio: () => void;
  onStartListening: () => void;
}

export const CardFront = ({
  question,
  isPlaying,
  isListening,
  isProcessing,
  timeLeft,
  onPlayAudio,
  onStartListening,
}: CardFrontProps) => {
  return (
    <Card className="flip-card-front p-6 flex flex-col items-center justify-between bg-gradient-to-br from-primary/90 to-primary text-primary-foreground">
      <h2 className="text-8xl font-bold text-center">{question}</h2>
      <div className="flex flex-col gap-4 items-center mt-4">
        <AudioButton isPlaying={isPlaying} onToggle={onPlayAudio} />
        <div className="relative">
          <Button
            variant={isListening ? "destructive" : isProcessing ? "secondary" : "default"}
            size="lg"
            className="gap-2"
            onClick={(e) => {
              e.stopPropagation();
              onStartListening();
            }}
            disabled={isListening || isProcessing}
          >
            <Mic className={isListening ? "animate-pulse" : ""} />
            {isProcessing 
              ? "Processing..." 
              : isListening 
                ? `Speak now... (${timeLeft}s)` 
                : `Say "${question}"`}
          </Button>
          <div className="absolute -bottom-6 left-0 right-0 text-center text-sm text-muted-foreground">
            {isListening && `${timeLeft} seconds remaining...`}
            {isProcessing && "Analyzing your pronunciation..."}
          </div>
        </div>
      </div>
    </Card>
  );
};