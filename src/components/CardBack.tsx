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
    <Card className="flip-card-back p-8 flex flex-col items-center justify-between bg-gradient-to-br from-softPeach via-softYellow to-softOrange text-gray-800 shadow-xl rounded-xl border border-white/30 h-[250px] backdrop-blur-sm">
      <h3 className="text-3xl font-bold bg-gradient-to-r from-brightOrange to-oceanBlue text-transparent bg-clip-text">
        {answer}
      </h3>
      <div className="flex flex-col gap-6 items-center">
        <AudioButton isPlaying={isPlaying} onToggle={onPlayAudio} />
        <div className="flex gap-4">
          <Button
            variant="outline"
            className="bg-white/80 hover:bg-white text-gray-700 border-red-300 hover:border-red-500 hover:text-red-600 transition-all duration-300 shadow-sm hover:shadow-md"
            onClick={(e) => {
              e.stopPropagation();
              onAnswer(false);
            }}
          >
            Incorrect
          </Button>
          <Button
            variant="default"
            className="bg-gradient-to-r from-vividPurple to-magentaPink hover:from-magentaPink hover:to-vividPurple text-white shadow-md hover:shadow-lg transition-all duration-300 border-0"
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