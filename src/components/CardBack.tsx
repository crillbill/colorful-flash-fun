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
    <Card className="flip-card-back p-6 flex flex-col items-center justify-between bg-gradient-to-br from-softPurple to-lightPurple shadow-lg rounded-xl border-0">
      <h3 className="text-xl font-semibold text-center text-darkPurple">{answer}</h3>
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
            className="bg-gradient-to-r from-primaryPurple to-vividPurple text-white shadow-md hover:shadow-lg transition-all border-0"
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