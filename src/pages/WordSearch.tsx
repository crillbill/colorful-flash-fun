import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { ProgressBar } from "@/components/ProgressBar";
import { ScoreDisplay } from "@/components/ScoreDisplay";
import { Header1 } from "@/components/ui/header";
import { useColors } from "@/contexts/ColorContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { WordSearchGrid } from "@/components/WordSearchGrid";
import { WordList } from "@/components/WordList";
import { GameTimer } from "@/components/GameTimer";
import { generateGrid } from "@/utils/wordSearchUtils";
import { GRID_WIDTH, GRID_HEIGHT } from "@/utils/constants";
import type { WordLocation, HebrewWord, GridCell } from "@/types/wordSearch";

const fetchWords = async () => {
  const { data, error } = await supabase
    .from('hebrew_words')
    .select('hebrew, english, transliteration')
    .limit(10);
  
  if (error) {
    throw error;
  }
  
  return data;
};

const WordSearch = () => {
  const colors = useColors();
  const [grid, setGrid] = useState<string[][]>([]);
  const [wordLocations, setWordLocations] = useState<WordLocation[]>([]);
  const [selectedCells, setSelectedCells] = useState<GridCell[]>([]);
  const [score, setScore] = useState({ found: 0, total: 0 });
  const [timeLeft, setTimeLeft] = useState(300);
  const [revealedWords, setRevealedWords] = useState<Set<string>>(new Set());

  const { data: words = [], isLoading, error } = useQuery({
    queryKey: ['wordSearchWords'],
    queryFn: fetchWords,
  });

  useEffect(() => {
    if (words.length > 0) {
      setScore(prev => ({ ...prev, total: words.length }));
      initializeGrid();
    }
  }, [words]);

  const initializeGrid = () => {
    if (!words.length) return;
    const { grid: newGrid, wordLocations: newWordLocations } = generateGrid(words, GRID_WIDTH, GRID_HEIGHT);
    setGrid(newGrid);
    setWordLocations(newWordLocations);
  };

  const handleCellClick = (row: number, col: number) => {
    const newSelectedCells = [...selectedCells, { row, col }];
    setSelectedCells(newSelectedCells);

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

    if (newSelectedCells.length >= 5) {
      setSelectedCells([]);
    }
  };

  const isCellSelected = (row: number, col: number) => {
    return selectedCells.some(cell => cell.row === row && cell.col === col);
  };

  const isCellFound = (row: number, col: number) => {
    return wordLocations.some(wl => 
      wl.found && wl.cells.some(cell => cell.row === row && cell.col === cell)
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

  const handleRevealWord = (word: string) => {
    setRevealedWords(prev => new Set(prev).add(word));
  };

  const handleNewGame = () => {
    setTimeLeft(300);
    setScore({ found: 0, total: words.length });
    setRevealedWords(new Set());
    initializeGrid();
  };

  if (isLoading) {
    return <div className="min-h-screen bg-white p-8 pt-24 flex items-center justify-center">Loading...</div>;
  }

  if (error) {
    return <div className="min-h-screen bg-white p-8 pt-24 flex items-center justify-center">Error loading words</div>;
  }

  const foundWordsSet = new Set(
    wordLocations.filter(wl => wl.found).map(wl => wl.word)
  );

  return (
    <>
      <Header1 />
      <div className="min-h-screen bg-white p-4 pt-24">
        <div className="mx-auto space-y-3 max-w-[500px]">
          <h1 className="text-3xl font-bold text-center">Hebrew Word Search</h1>
          
          <div className="flex justify-between items-center">
            <ScoreDisplay correct={score.found} total={score.total} />
            <GameTimer timeLeft={timeLeft} />
          </div>

          <ProgressBar current={score.found} total={score.total} />

          <WordSearchGrid
            grid={grid}
            onCellClick={handleCellClick}
            isCellSelected={isCellSelected}
            isCellFound={isCellFound}
          />

          <WordList
            words={words}
            foundWords={foundWordsSet}
            revealedWords={revealedWords}
            onRevealWord={handleRevealWord}
          />

          <div className="flex justify-center">
            <Button onClick={handleNewGame}>
              New Game
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default WordSearch;