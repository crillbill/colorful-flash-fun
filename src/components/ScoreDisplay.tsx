interface ScoreDisplayProps {
  correct: number;
  total: number;
  totalWords?: number;
}

export const ScoreDisplay = ({ correct, total, totalWords }: ScoreDisplayProps) => {
  const percentage = total === 0 ? 0 : Math.round((correct / total) * 100);

  return (
    <div className="text-center mb-4">
      <p className="text-lg font-semibold">
        Score: {correct}/{total} ({percentage}%)
      </p>
      {totalWords !== undefined && (
        <p className="text-sm text-muted-foreground">
          Total Words: {totalWords}
        </p>
      )}
    </div>
  );
};