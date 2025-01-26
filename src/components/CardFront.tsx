import { Button } from "@/components/ui/button";
import { Mic, Volume2 } from "lucide-react";

interface CardFrontProps {
  question: string;
  english: string;  // Add English prop
  isPlaying: boolean;
  isListening: boolean;
  isProcessing: boolean;
  timeLeft: number;
  onPlayAudio: () => void;
  onStartListening: () => void;
}

export const CardFront = ({
  question,
  english,  // Add English prop
  isPlaying,
  isListening,
  isProcessing,
  timeLeft,
  onPlayAudio,
  onStartListening,
}: CardFrontProps) => {
  return (
    <div className="flip-card-front bg-white rounded-lg shadow-lg p-8 flex flex-col items-center justify-between h-full">
      <div className="text-center space-y-2">
        <h2 className="text-4xl font-bold mb-2">{question}</h2>
        <p className="text-sm text-gray-600">{english}</p>
      </div>
      <div className="flex gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={onPlayAudio}
          disabled={isPlaying}
          className="hover:bg-accent"
        >
          <Volume2 className="h-6 w-6" />
        </Button>
        <Button
          variant={isListening ? "default" : "outline"}
          size="icon"
          onClick={onStartListening}
          disabled={isProcessing}
          className={`relative ${isListening ? "bg-green-500 hover:bg-green-600" : "hover:bg-accent"}`}
        >
          <Mic className="h-6 w-6" />
          {isProcessing && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
          )}
          {isListening && timeLeft > 0 && (
            <div className="absolute -bottom-8 text-sm font-medium">
              {timeLeft}s
            </div>
          )}
        </Button>
      </div>
    </div>
  );
};