import React from 'react';
import { formatTime } from '@/utils/wordSearchUtils';

interface GameTimerProps {
  timeLeft: number;
}

export const GameTimer: React.FC<GameTimerProps> = ({ timeLeft }) => {
  return (
    <div className="text-base font-semibold">
      Time: {formatTime(timeLeft)}
    </div>
  );
};