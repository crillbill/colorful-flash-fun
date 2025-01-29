interface ProgressBarProps {
  current: number;
  total: number;
}

export const ProgressBar = ({ current, total }: ProgressBarProps) => {
  return (
    <div className="w-full h-2 bg-softGray rounded-full mb-6">
      <div 
        className="h-full bg-gradient-to-r from-vividPurple to-magentaPink rounded-full transition-all duration-300"
        style={{
          width: `${((current + 1) / total) * 100}%`
        }}
      />
    </div>
  );
};