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
    <div className="bg-white/30 p-0.5 rounded-lg">
      {grid.map((row, rowIndex) => (
        <div key={rowIndex} className="flex">
          {row.map((letter, colIndex) => (
            <button
              key={`${rowIndex}-${colIndex}`}
              className={`w-[42px] h-[42px] text-2xl font-bold flex items-center justify-center transition-all duration-300 m-0.5 rounded-md
                ${isCellSelected(rowIndex, colIndex) 
                  ? 'bg-primaryPurple text-white shadow-lg scale-105' 
                  : isCellFound(rowIndex, colIndex) 
                    ? 'bg-green-500 text-white shadow-md scale-105' 
                    : 'bg-white hover:bg-accent-foreground/10 hover:scale-105'}`}
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