import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { ProgressBar } from "@/components/ProgressBar";
import { ScoreDisplay } from "@/components/ScoreDisplay";
import { Undo2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useColors } from "@/contexts/ColorContext";

type WordLocation = {
  word: string;
  found: boolean;
  cells: { row: number; col: number }[];
};

const GRID_SIZE = 10;
const WORDS = [
  { hebrew: "שלום", translation: "Shalom (Hello)" },
  { hebrew: "תודה", translation: "Toda (Thank you)" },
  { hebrew: "אהבה", translation: "Ahava (Love)" },
];

const HEBREW_LETTERS = [
  'א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט', 'י',
  'כ', 'ל', 'מ', 'נ', 'ס', 'ע', 'פ', 'צ', 'ק', 'ר',
  'ש', 'ת'
];

const WordSearch = () => {
  const colors = useColors();
  const [grid, setGrid] = useState<string[][]>([]);
  const [wordLocations, setWordLocations] = useState<WordLocation[]>([]);
  const [selectedCells, setSelectedCells] = useState<{ row: number; col: number }[]>([]);
  const [score, setScore] = useState({ found: 0, total: WORDS.length });
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds

  const generateGrid = () => {
    // Initialize empty grid
    const newGrid = Array(GRID_SIZE).fill(null).map(() =>
      Array(GRID_SIZE).fill(null)
    );

    // Place words in random positions
    const newWordLocations: WordLocation[] = [];

    WORDS.forEach(({ hebrew }) => {
      let placed = false;
      let attempts = 0;
      const maxAttempts = 100;

      while (!placed && attempts < maxAttempts) {
        const direction = Math.random() < 0.5 ? "horizontal" : "vertical";
        const row = Math.floor(Math.random() * GRID_SIZE);
        const col = Math.floor(Math.random() * GRID_SIZE);

        if (canPlaceWord(newGrid, hebrew, row, col, direction)) {
          const cells = placeWord(newGrid, hebrew, row, col, direction);
          newWordLocations.push({ word: hebrew, found: false, cells });
          placed = true;
        }
        attempts++;
      }
    });

    // Fill remaining empty cells with random Hebrew letters
    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
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
      if (col + word.length > GRID_SIZE) return false;
      for (let i = 0; i < word.length; i++) {
        if (grid[row][col + i] && grid[row][col + i] !== word[i]) return false;
      }
    } else {
      if (row + word.length > GRID_SIZE) return false;
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
      const word = WORDS.find(w => w.hebrew === wordLocation.word);
      if (word) {
        toast({
          title: "Word Found!",
          description: `You found ${word.hebrew} (${word.translation})`,
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
    generateGrid();
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

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="fixed top-0 left-0 right-0 h-24 bg-darkCharcoal z-50 flex items-center justify-between px-8">
        <Link to="/">
          <Button variant="ghost" size="icon">
            <Undo2 className="h-6 w-6 text-white" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-white">Hebrew Word Search</h1>
        <div className="w-10" /> {/* Spacer for alignment */}
      </div>

      <div className="max-w-4xl mx-auto space-y-8 pt-24">
        <h1 className="text-4xl font-bold text-center">Hebrew Word Search</h1>
        
        <div className="flex justify-between items-center">
          <ScoreDisplay correct={score.found} total={score.total} />
          <div className="text-lg font-semibold">
            Time: {formatTime(timeLeft)}
          </div>
        </div>

        <ProgressBar current={score.found} total={score.total} />

        <div className="grid grid-cols-10 gap-1 bg-accent p-4 rounded-lg">
          {grid.map((row, rowIndex) => (
            row.map((letter, colIndex) => (
              <button
                key={`${rowIndex}-${colIndex}`}
                className={`w-10 h-10 text-lg font-bold rounded flex items-center justify-center transition-colors
                  ${isCellSelected(rowIndex, colIndex) ? 'bg-primary text-primary-foreground' : 
                    isCellFound(rowIndex, colIndex) ? 'bg-green-500 text-white' : 'bg-card hover:bg-accent-foreground/10'}`}
                onClick={() => handleCellClick(rowIndex, colIndex)}
              >
                {letter}
              </button>
            ))
          ))}
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Words to Find:</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {WORDS.map(({ hebrew, translation }) => {
              const isFound = wordLocations.find(wl => wl.word === hebrew)?.found;
              return (
                <div
                  key={hebrew}
                  className={`p-4 rounded-lg ${
                    isFound ? 'bg-green-500 text-white' : 'bg-card'
                  }`}
                >
                  <div className="text-lg font-bold">{hebrew}</div>
                  <div className="text-sm">{translation}</div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex justify-center">
          <Button
            onClick={() => {
              setTimeLeft(300);
              setScore({ found: 0, total: WORDS.length });
              generateGrid();
            }}
          >
            New Game
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WordSearch;
