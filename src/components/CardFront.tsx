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
    <Card className="flip-card-front p-6 flex flex-col items-center justify-between bg-gradient-to-br from-primaryPurple to-vividPurple text-white h-[300px] shadow-lg rounded-xl border-0">
      <h2 className="text-6xl font-bold text-center tracking-wide">{question}</h2>
      <AudioButton 
        isPlaying={isPlaying} 
        onToggle={onPlayAudio}
        disabled={isListening || isProcessing} 
      />
    </Card>
  );
};