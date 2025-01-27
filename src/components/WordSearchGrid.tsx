import React from 'react';
import type { GridCell } from '@/types/wordSearch';

interface WordSearchGridProps {
  grid: string[][];
  onCellClick: (row: number, col: number) => void;
  isCellSelected: (row: number, col: number) => boolean;
  isCellFound: (row: number, col: number) => boolean;
}

export const WordSearchGrid: React.FC<WordSearchGridProps> = ({
  grid,
  onCellClick,
  isCellSelected,
  isCellFound,
}) => {
  return (
    <div className="bg-accent p-0.5">
      {grid.map((row, rowIndex) => (
        <div key={rowIndex} className="flex">
          {row.map((letter, colIndex) => (
            <button
              key={`${rowIndex}-${colIndex}`}
              className={`w-[42px] h-[42px] text-2xl font-bold flex items-center justify-center transition-colors
                ${isCellSelected(rowIndex, colIndex) ? 'bg-primary text-primary-foreground' : 
                  isCellFound(rowIndex, colIndex) ? 'bg-green-500 text-white' : 'bg-card hover:bg-accent-foreground/10'}`}
              onClick={() => onCellClick(rowIndex, colIndex)}
            >
              {letter}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
};