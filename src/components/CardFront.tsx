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
    <Card className="flip-card-front p-6 flex flex-col items-center justify-between bg-gradient-to-br from-primary/90 to-primary text-primary-foreground h-[300px]">
      <h2 className="text-6xl font-bold text-center">{question}</h2>
      <AudioButton 
        isPlaying={isPlaying} 
        onToggle={onPlayAudio}
        disabled={isListening || isProcessing} 
      />
    </Card>
  );
};