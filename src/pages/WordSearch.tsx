import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { ProgressBar } from "@/components/ProgressBar";
import { ScoreDisplay } from "@/components/ScoreDisplay";
import { Header1 } from "@/components/ui/header";
import { useColors } from "@/contexts/ColorContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";

type WordLocation = {
  word: string;
  found: boolean;
  cells: { row: number; col: number }[];
};

type HebrewWord = {
  hebrew: string;
  english: string;
  transliteration: string | null;
};

const GRID_WIDTH = 12;
const GRID_HEIGHT = 10;

const HEBREW_LETTERS = [
  'א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט', 'י',
  'כ', 'ל', 'מ', 'נ', 'ס', 'ע', 'פ', 'צ', 'ק', 'ר',
  'ש', 'ת'
];

const fetchWords = async () => {
  const { data, error } = await supabase
    .from('hebrew_words')
    .select('hebrew, english, transliteration')
    .limit(10);  // Changed from 3 to 10
  
  if (error) {
    throw error;
  }
  
  return data;
};

const WordSearch = () => {
  const colors = useColors();
  const [grid, setGrid] = useState<string[][]>([]);
  const [wordLocations, setWordLocations] = useState<WordLocation[]>([]);
  const [selectedCells, setSelectedCells] = useState<{ row: number; col: number }[]>([]);
  const [score, setScore] = useState({ found: 0, total: 0 });
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const [revealedWords, setRevealedWords] = useState<Set<string>>(new Set());

  const { data: words = [], isLoading, error } = useQuery({
    queryKey: ['wordSearchWords'],
    queryFn: fetchWords,
  });

  useEffect(() => {
    if (words.length > 0) {
      setScore(prev => ({ ...prev, total: words.length }));
      generateGrid();
    }
  }, [words]);

  const generateGrid = () => {
    if (!words.length) return;

    // Initialize empty grid with new dimensions
    const newGrid = Array(GRID_HEIGHT).fill(null).map(() =>
      Array(GRID_WIDTH).fill(null)
    );

    // Place words in random positions
    const newWordLocations: WordLocation[] = [];

    words.forEach(({ hebrew }) => {
      let placed = false;
      let attempts = 0;
      const maxAttempts = 100;

      while (!placed && attempts < maxAttempts) {
        const direction = Math.random() < 0.5 ? "horizontal" : "vertical";
        const row = Math.floor(Math.random() * GRID_HEIGHT);
        const col = Math.floor(Math.random() * GRID_WIDTH);

        if (canPlaceWord(newGrid, hebrew, row, col, direction)) {
          const cells = placeWord(newGrid, hebrew, row, col, direction);
          newWordLocations.push({ word: hebrew, found: false, cells });
          placed = true;
        }
        attempts++;
      }
    });

    // Fill remaining empty cells with random Hebrew letters
    for (let i = 0; i < GRID_HEIGHT; i++) {
      for (let j = 0; j < GRID_WIDTH; j++) {
        if (!newGrid[i][j]) {
          newGrid[i][j] = HEBREW_LETTERS[Math.floor(Math.random() * HEBREW_LETTERS.length)];
        }
      }
    }

    setGrid(newGrid);
    setWordLocations(newWordLocations);
  };

  const canPlaceWord = (grid: string[][], word: string, row: number, col: number, direction: string) => {
    if (direction === "horizontal") {
      if (col + word.length > GRID_WIDTH) return false;
      for (let i = 0; i < word.length; i++) {
        if (grid[row][col + i] && grid[row][col + i] !== word[i]) return false;
      }
    } else {
      if (row + word.length > GRID_HEIGHT) return false;
      for (let i = 0; i < word.length; i++) {
        if (grid[row + i][col] && grid[row + i][col] !== word[i]) return false;
      }
    }
    return true;
  };

  const placeWord = (grid: string[][], word: string, row: number, col: number, direction: string) => {
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

  const handleCellClick = (row: number, col: number) => {
    const newSelectedCells = [...selectedCells, { row, col }];
    setSelectedCells(newSelectedCells);

    // Check if selected cells form a word
    const selectedWord = newSelectedCells.map(cell => grid[cell.row][cell.col]).join("");
    const wordLocation = wordLocations.find(wl => 
      !wl.found && 
      wl.cells.every(cell => 
        newSelectedCells.some(sc => sc.row === cell.row && sc.col === cell.col)
      )
    );

    if (wordLocation) {
      const word = words.find(w => w.hebrew === wordLocation.word);
      if (word) {
        toast({
          title: "Word Found!",
          description: `You found ${word.hebrew} (${word.english})`,
        });
        setWordLocations(prev => 
          prev.map(wl => 
            wl.word === wordLocation.word ? { ...wl, found: true } : wl
          )
        );
        setScore(prev => ({ ...prev, found: prev.found + 1 }));
      }
    }

    // Clear selection after checking
    if (newSelectedCells.length >= 5) {
      setSelectedCells([]);
    }
  };

  const isCellSelected = (row: number, col: number) => {
    return selectedCells.some(cell => cell.row === row && cell.col === col);
  };

  const isCellFound = (row: number, col: number) => {
    return wordLocations.some(wl => 
      wl.found && wl.cells.some(cell => cell.row === row && cell.col === col)
    );
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          toast({
            title: "Time's up!",
            description: "Game Over! Click 'New Game' to play again.",
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleRevealWord = (word: string) => {
    setRevealedWords(prev => {
      const newSet = new Set(prev);
      newSet.add(word);
      return newSet;
    });
  };

  if (isLoading) {
    return <div className="min-h-screen bg-white p-8 pt-24 flex items-center justify-center">Loading...</div>;
  }

  if (error) {
    return <div className="min-h-screen bg-white p-8 pt-24 flex items-center justify-center">Error loading words</div>;
  }

  return (
    <>
      <Header1 />
      <div className="min-h-screen bg-white p-4 pt-24">
        <div className="mx-auto space-y-3 max-w-[500px]">
          <h1 className="text-3xl font-bold text-center">Hebrew Word Search</h1>
          
          <div className="flex justify-between items-center">
            <ScoreDisplay correct={score.found} total={score.total} />
            <div className="text-base font-semibold">
              Time: {formatTime(timeLeft)}
            </div>
          </div>

          <ProgressBar current={score.found} total={score.total} />

          <div className="bg-accent p-0.5">
            {grid.map((row, rowIndex) => (
              <div key={rowIndex} className="flex">
                {row.map((letter, colIndex) => (
                  <button
                    key={`${rowIndex}-${colIndex}`}
                    className={`w-[42px] h-[42px] text-2xl font-bold flex items-center justify-center transition-colors
                      ${isCellSelected(rowIndex, colIndex) ? 'bg-primary text-primary-foreground' : 
                        isCellFound(rowIndex, colIndex) ? 'bg-green-500 text-white' : 'bg-card hover:bg-accent-foreground/10'}`}
                    onClick={() => handleCellClick(rowIndex, colIndex)}
                  >
                    {letter}
                  </button>
                ))}
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-semibold">Words to Find:</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {words.map(({ hebrew, english, transliteration }) => {
                const isFound = wordLocations.find(wl => wl.word === hebrew)?.found;
                const isRevealed = revealedWords.has(hebrew);
                return (
                  <Popover key={hebrew}>
                    <PopoverTrigger asChild>
                      <div
                        className={`p-2 rounded-md cursor-pointer transition-all
                          ${isFound ? 'bg-green-500 text-white' : 'bg-card hover:bg-accent/50'}`}
                        onClick={() => !isFound && handleRevealWord(hebrew)}
                      >
                        <div className="text-base font-bold">
                          {isFound || isRevealed ? hebrew : '• • • •'}
                        </div>
                        {(isFound || isRevealed) && (
                          <>
                            <div className="text-sm">{english}</div>
                            {transliteration && (
                              <div className="text-xs opacity-75">{transliteration}</div>
                            )}
                          </>
                        )}
                      </div>
                    </PopoverTrigger>
                    <PopoverContent className="w-48">
                      <div className="space-y-1">
                        <p className="font-semibold">{hebrew}</p>
                        <p className="text-sm">{english}</p>
                        {transliteration && (
                          <p className="text-xs text-muted-foreground">{transliteration}</p>
                        )}
                      </div>
                    </PopoverContent>
                  </Popover>
                );
              })}
            </div>
          </div>

          <div className="flex justify-center">
            <Button
              onClick={() => {
                setTimeLeft(300);
                setScore({ found: 0, total: words.length });
                setRevealedWords(new Set());
                generateGrid();
              }}
            >
              New Game
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default WordSearch;
