import { Button } from "@/components/ui/button";

interface GameControlsProps {
  onCheck: () => void;
  onShowHint: () => void;
  onReset: () => void;
}

export const GameControls = ({ onCheck, onShowHint, onReset }: GameControlsProps) => {
  return (
    <div className="flex flex-wrap gap-4 justify-center">
      <Button onClick={onCheck}>Check Answer</Button>
      <Button variant="outline" onClick={onShowHint}>
        Show Hint
      </Button>
      <Button variant="secondary" onClick={onReset}>
        Reset Game
      </Button>
    </div>
  );
};