import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AudioButton } from "./AudioButton";

interface CardBackProps {
  answer: string;
  isPlaying: boolean;
  onPlayAudio: () => void;
  onAnswer: (correct: boolean) => void;
}

export const CardBack = ({
  answer,
  isPlaying,
  onPlayAudio,
  onAnswer,
}: CardBackProps) => {
  return (
    <Card className="flip-card-back p-8 flex flex-col items-center justify-between bg-gradient-to-br from-[#F97316] to-[#0EA5E9] text-white shadow-xl rounded-xl border-2 border-white/30">
      <h3 className="text-2xl font-semibold text-center text-white">{answer}</h3>
      <div className="flex flex-col gap-4 items-center">
        <AudioButton isPlaying={isPlaying} onToggle={onPlayAudio} />
        <div className="flex gap-4">
          <Button
            variant="destructive"
            className="shadow-md hover:shadow-lg transition-all"
            onClick={(e) => {
              e.stopPropagation();
              onAnswer(false);
            }}
          >
            Incorrect
          </Button>
          <Button
            variant="default"
            className="bg-gradient-to-r from-[#8B5CF6] to-[#D946EF] text-white shadow-md hover:shadow-lg transition-all border-0"
            onClick={(e) => {
              e.stopPropagation();
              onAnswer(true);
            }}
          >
            Correct
          </Button>
        </div>
      </div>
    </Card>
  );
};