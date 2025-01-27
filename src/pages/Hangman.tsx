import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ProgressBar } from "@/components/ProgressBar";
import { ScoreDisplay } from "@/components/ScoreDisplay";
import { Header1 } from "@/components/ui/header";
import { useColors } from "@/contexts/ColorContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

interface Word {
  hebrew: string;
  english: string;
  transliteration?: string;
}

const MAX_TRIES = 6;

const fetchWords = async () => {
  const { data, error } = await supabase
    .from('hebrew_words')
    .select('hebrew, english, transliteration');
  
  if (error) {
    throw error;
  }
  
  return data;
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

      if (newWrongGuesses >= MAX_TRIES) {
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
          <ProgressBar current={wrongGuesses} total={MAX_TRIES} />

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