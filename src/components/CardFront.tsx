import { Card } from "@/components/ui/card";
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
    <Card className="flip-card-front p-8 flex flex-col items-center justify-between bg-gradient-to-br from-brightOrange to-softOrange text-white h-[300px] shadow-lg rounded-xl border-0">
      <h2 className="text-6xl font-bold text-center tracking-wide animate-float">{question}</h2>
      <AudioButton 
        isPlaying={isPlaying} 
        onToggle={onPlayAudio}
        disabled={isListening || isProcessing} 
      />
    </Card>
  );
};