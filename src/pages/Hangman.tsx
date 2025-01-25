import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ProgressBar } from "@/components/ProgressBar";
import { ScoreDisplay } from "@/components/ScoreDisplay";
import { Header1 } from "@/components/ui/header";
import { useColors } from "@/contexts/ColorContext";

type Category = "animals" | "food" | "places" | "objects";

interface Word {
  hebrew: string;
  english: string;
  hint: string;
  category: Category;
}

const WORDS: Word[] = [
  { hebrew: "מחשב", english: "computer", hint: "You use this to type", category: "objects" },
  { hebrew: "כלב", english: "dog", hint: "A common pet", category: "animals" },
  { hebrew: "חתול", english: "cat", hint: "Another common pet", category: "animals" },
  { hebrew: "פיצה", english: "pizza", hint: "A popular Italian food", category: "food" },
  { hebrew: "ירושלים", english: "Jerusalem", hint: "Israel's capital", category: "places" },
];

const MAX_TRIES = 6;

const Hangman = () => {
  const colors = useColors();
  const { toast } = useToast();
  const [currentWord, setCurrentWord] = useState<Word>(WORDS[0]);
  const [guessedLetters, setGuessedLetters] = useState<Set<string>>(new Set());
  const [wrongGuesses, setWrongGuesses] = useState<number>(0);
  const [score, setScore] = useState<{ correct: number; total: number }>({ correct: 0, total: 0 });
  const [showHint, setShowHint] = useState<boolean>(false);

  const getNewWord = () => {
    const randomIndex = Math.floor(Math.random() * WORDS.length);
    setCurrentWord(WORDS[randomIndex]);
    setGuessedLetters(new Set());
    setWrongGuesses(0);
    setShowHint(false);
  };

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

  useEffect(() => {
    getNewWord();
  }, []);

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
                  Hint: {currentWord.hint}
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

          <div className="text-center text-sm text-muted-foreground">
            Category: {currentWord.category}
          </div>
        </div>
      </div>
    </>
  );
};

export default Hangman;
