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
    <Card className="flip-card-back p-6 flex flex-col items-center justify-between bg-accent">
      <h3 className="text-xl font-semibold text-center">{answer}</h3>
      <div className="flex flex-col gap-4 items-center">
        <AudioButton isPlaying={isPlaying} onToggle={onPlayAudio} />
        <div className="flex gap-4">
          <Button
            variant="destructive"
            onClick={(e) => {
              e.stopPropagation();
              onAnswer(false);
            }}
          >
            Incorrect
          </Button>
          <Button
            variant="default"
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