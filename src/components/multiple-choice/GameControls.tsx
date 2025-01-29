import { GameTimer } from "@/components/GameTimer";
import { ProgressBar } from "@/components/ProgressBar";

interface GameControlsProps {
  timeLeft: number;
  currentQuestion: number;
  totalQuestions: number;
}

export const GameControls = ({
  timeLeft,
  currentQuestion,
  totalQuestions,
}: GameControlsProps) => {
  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <GameTimer timeLeft={timeLeft} />
      </div>
      <ProgressBar current={currentQuestion + 1} total={totalQuestions} />
    </div>
  );
};