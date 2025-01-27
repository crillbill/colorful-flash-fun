export type WordLocation = {
  word: string;
  found: boolean;
  cells: { row: number; col: number }[];
};

export type HebrewWord = {
  hebrew: string;
  english: string;
  transliteration: string | null;
};

export type GridCell = {
  row: number;
  col: number;
};