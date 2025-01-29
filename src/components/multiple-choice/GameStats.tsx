import { ScoreDisplay } from "@/components/ScoreDisplay";

interface GameStatsProps {
  correct: number;
  total: number;
}

export const GameStats = ({ correct, total }: GameStatsProps) => {
  return (
    <div className="flex justify-between items-center">
      <ScoreDisplay correct={correct} total={total} />
    </div>
  );
};