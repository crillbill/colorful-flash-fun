interface ScoreDisplayProps {
  correct: number;
  total: number;
}

export const ScoreDisplay = ({ correct, total }: ScoreDisplayProps) => {
  const percentage = total === 0 ? 0 : Math.round((correct / total) * 100);

  return (
    <div className="text-center mb-4">
      <p className="text-lg font-semibold">
        Score: {correct}/{total} ({percentage}%)
      </p>
      <p className="text-sm text-red-500 mt-1">
        When The Last Balloon Pops, You Lose!
      </p>
    </div>
  );
};