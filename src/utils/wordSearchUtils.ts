import { HEBREW_LETTERS } from './constants';
import type { WordLocation } from '@/types/wordSearch';

export const canPlaceWord = (
  grid: string[][],
  word: string,
  row: number,
  col: number,
  direction: string,
  gridWidth: number,
  gridHeight: number
) => {
  if (direction === "horizontal") {
    if (col + word.length > gridWidth) return false;
    for (let i = 0; i < word.length; i++) {
      if (grid[row][col + i] && grid[row][col + i] !== word[i]) return false;
    }
  } else {
    if (row + word.length > gridHeight) return false;
    for (let i = 0; i < word.length; i++) {
      if (grid[row + i][col] && grid[row + i][col] !== word[i]) return false;
    }
  }
  return true;
};

export const placeWord = (
  grid: string[][],
  word: string,
  row: number,
  col: number,
  direction: string
): { row: number; col: number }[] => {
  const cells: { row: number; col: number }[] = [];
  for (let i = 0; i < word.length; i++) {
    if (direction === "horizontal") {
      grid[row][col + i] = word[i];
      cells.push({ row, col: col + i });
    } else {
      grid[row + i][col] = word[i];
      cells.push({ row: row + i, col });
    }
  }
  return cells;
};

export const generateGrid = (
  words: { hebrew: string }[],
  gridWidth: number,
  gridHeight: number
): { grid: string[][], wordLocations: WordLocation[] } => {
  const newGrid = Array(gridHeight).fill(null).map(() =>
    Array(gridWidth).fill(null)
  );

  const newWordLocations: WordLocation[] = [];

  words.forEach(({ hebrew }) => {
    let placed = false;
    let attempts = 0;
    const maxAttempts = 100;

    while (!placed && attempts < maxAttempts) {
      const direction = Math.random() < 0.5 ? "horizontal" : "vertical";
      const row = Math.floor(Math.random() * gridHeight);
      const col = Math.floor(Math.random() * gridWidth);

      if (canPlaceWord(newGrid, hebrew, row, col, direction, gridWidth, gridHeight)) {
        const cells = placeWord(newGrid, hebrew, row, col, direction);
        newWordLocations.push({ word: hebrew, found: false, cells });
        placed = true;
      }
      attempts++;
    }
  });

  // Fill remaining empty cells with random Hebrew letters
  for (let i = 0; i < gridHeight; i++) {
    for (let j = 0; j < gridWidth; j++) {
      if (!newGrid[i][j]) {
        newGrid[i][j] = HEBREW_LETTERS[Math.floor(Math.random() * HEBREW_LETTERS.length)];
      }
    }
  }

  return { grid: newGrid, wordLocations: newWordLocations };
};

export const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};