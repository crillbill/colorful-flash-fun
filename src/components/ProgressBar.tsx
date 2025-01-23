interface ProgressBarProps {
  current: number;
  total: number;
}

export const ProgressBar = ({ current, total }: ProgressBarProps) => {
  const progress = (current / total) * 100;

  return (
    <div className="w-full bg-secondary rounded-full h-2.5 mb-6">
      <div
        className="progress-bar bg-primary h-2.5 rounded-full"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};