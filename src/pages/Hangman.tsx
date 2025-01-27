import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ProgressBar } from "@/components/ProgressBar";
import { ScoreDisplay } from "@/components/ScoreDisplay";
import { Header1 } from "@/components/ui/header";
import { useColors } from "@/contexts/ColorContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";

interface Word {
  hebrew: string;
  english: string;
  transliteration?: string;
}

const MAX_TRIES = 6;

const BALLOON_COLORS = [
  "#F2FCE2", // Soft Green
  "#FEF7CD", // Soft Yellow
  "#FEC6A1", // Soft Orange
  "#E5DEFF", // Soft Purple
  "#FFDEE2", // Soft Pink
  "#FDE1D3", // Soft Peach
  "#ea384c", // Red (last balloon)
];

const fetchWords = async () => {
  const { data, error } = await supabase
    .from('hebrew_words')
    .select('hebrew, english, transliteration');
  
  if (error) {
    throw error;
  }
  
  return data;
};

const Balloon = ({ color, isPopped }: { color: string; isPopped: boolean }) => {
  return (
    <AnimatePresence>
      {!isPopped && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          exit={{ 
            scale: 1.5, 
            opacity: 0,
            transition: { 
              duration: 0.3,
              ease: "easeOut"
            }
          }}
          className="relative"
        >
          <div 
            className="w-12 h-16 rounded-full relative mb-4 transform transition-transform hover:scale-110"
            style={{ 
              backgroundColor: color,
              boxShadow: `0 4px 6px rgba(0, 0, 0, 0.1)`,
            }}
          >
            <div 
              className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full w-1 h-8"
              style={{ backgroundColor: '#666' }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const Hangman = () => {
  const colors = useColors();
  const { toast } = useToast();
  const [currentWord, setCurrentWord] = useState<Word | null>(null);
  const [guessedLetters, setGuessedLetters] = useState<Set<string>>(new Set());
  const [wrongGuesses, setWrongGuesses] = useState<number>(0);
  const [score, setScore] = useState<{ correct: number; total: number }>({ correct: 0, total: 0 });
  const [showHint, setShowHint] = useState<boolean>(false);

  const { data: words = [], isLoading, error } = useQuery({
    queryKey: ['hangmanWords'],
    queryFn: fetchWords,
  });

  const getNewWord = () => {
    if (words.length > 0) {
      const randomIndex = Math.floor(Math.random() * words.length);
      setCurrentWord(words[randomIndex]);
      setGuessedLetters(new Set());
      setWrongGuesses(0);
      setShowHint(false);
    }
  };

  useEffect(() => {
    if (words.length > 0 && !currentWord) {
      getNewWord();
    }
  }, [words]);

  if (isLoading) {
    return <div className="min-h-screen bg-white p-8 pt-24 flex items-center justify-center">Loading...</div>;
  }

  if (error) {
    return <div className="min-h-screen bg-white p-8 pt-24 flex items-center justify-center">Error loading words</div>;
  }

  if (!currentWord) {
    return <div className="min-h-screen bg-white p-8 pt-24 flex items-center justify-center">No words available</div>;
  }

  const displayWord = currentWord.hebrew
    .split("")
    .map((letter) => (guessedLetters.has(letter) ? letter : "_"))
    .join(" ");

  const handleGuess = (letter: string) => {
    if (guessedLetters.has(letter)) {
      toast({
        title: "Already Guessed",
        description: "You've already tried this letter!",
        variant: "destructive",
      });
      return;
    }

    const newGuessedLetters = new Set(guessedLetters).add(letter);
    setGuessedLetters(newGuessedLetters);

    if (!currentWord.hebrew.includes(letter)) {
      const newWrongGuesses = wrongGuesses + 1;
      setWrongGuesses(newWrongGuesses);

      if (newWrongGuesses >= BALLOON_COLORS.length) {
        toast({
          title: "Game Over",
          description: `The word was: ${currentWord.hebrew} (${currentWord.english})`,
          variant: "destructive",
        });
        setScore((prev) => ({ ...prev, total: prev.total + 1 }));
        setTimeout(getNewWord, 2000);
      }
    } else if (
      currentWord.hebrew.split("").every((letter) => newGuessedLetters.has(letter))
    ) {
      toast({
        title: "Congratulations!",
        description: "You found the word!",
      });
      setScore((prev) => ({
        correct: prev.correct + 1,
        total: prev.total + 1,
      }));
      setTimeout(getNewWord, 2000);
    }
  };

  const hebrewAlphabet = "אבגדהוזחטיכלמנסעפצקרשת";

  return (
    <>
      <Header1 />
      <div className="min-h-screen bg-white p-8 pt-24">
        <div className="max-w-2xl mx-auto space-y-8">
          <ScoreDisplay correct={score.correct} total={score.total} />
          
          <div className="flex justify-center space-x-4 mb-8">
            {BALLOON_COLORS.map((color, index) => (
              <Balloon 
                key={color} 
                color={color} 
                isPopped={index < wrongGuesses}
              />
            ))}
          </div>

          <div className="text-center space-y-4">
            <div className="text-4xl font-bold mb-8">{displayWord}</div>
            
            <div className="mb-4">
              <Button 
                variant="outline" 
                onClick={() => setShowHint(true)}
                disabled={showHint}
              >
                Show Hint
              </Button>
              {showHint && (
                <p className="mt-2 text-muted-foreground">
                  Hint: {currentWord.transliteration || 'No transliteration available'}
                </p>
              )}
            </div>

            <div className="grid grid-cols-8 gap-2 md:grid-cols-11">
              {hebrewAlphabet.split("").map((letter) => (
                <Button
                  key={letter}
                  onClick={() => handleGuess(letter)}
                  disabled={guessedLetters.has(letter)}
                  variant={
                    guessedLetters.has(letter)
                      ? currentWord.hebrew.includes(letter)
                        ? "default"
                        : "destructive"
                      : "outline"
                  }
                  className="w-10 h-10"
                >
                  {letter}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Hangman;