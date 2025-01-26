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
    <Card className="flip-card-front p-6 flex flex-col items-center justify-between bg-gradient-to-br from-[#8B5CF6] to-[#D946EF] text-white h-[250px] shadow-xl rounded-xl border-2 border-white/30">
      <h2 className="text-5xl font-bold text-center tracking-wide animate-float text-white">{question}</h2>
      <AudioButton 
        isPlaying={isPlaying} 
        onToggle={onPlayAudio}
        disabled={isListening || isProcessing} 
      />
    </Card>
  );
};