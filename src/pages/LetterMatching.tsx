import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Puzzle, Shuffle, Check, X, Undo2 } from "lucide-react";
import { ScoreDisplay } from "@/components/ScoreDisplay";
import { ProgressBar } from "@/components/ProgressBar";
import { toast } from "sonner";
import { useColors } from "@/contexts/ColorContext";
import { Link } from "react-router-dom";

interface HebrewLetter {
  letter: string;
  name: string;
  sound: string;
}

const hebrewLetters: HebrewLetter[] = [
  { letter: "א", name: "Alef", sound: "Silent or 'A'" },
  { letter: "ב", name: "Bet", sound: "B" },
  { letter: "ג", name: "Gimel", sound: "G" },
  { letter: "ד", name: "Dalet", sound: "D" },
  { letter: "ה", name: "Hey", sound: "H" },
];

const LetterMatching = () => {
  const colors = useColors();
  
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [currentRound, setCurrentRound] = useState(1);
  const [currentLetter, setCurrentLetter] = useState<HebrewLetter | null>(null);
  const [options, setOptions] = useState<string[]>([]);
  const [gameActive, setGameActive] = useState(false);
  const totalRounds = 10;

  const shuffleArray = (array: any[]) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const startNewGame = () => {
    setScore({ correct: 0, total: 0 });
    setCurrentRound(1);
    setGameActive(true);
    setupRound();
    toast("New game started! Match the Hebrew letters to their sounds.");
  };

  const setupRound = () => {
    const randomLetter = hebrewLetters[Math.floor(Math.random() * hebrewLetters.length)];
    setCurrentLetter(randomLetter);
    
    // Create options including the correct sound and some wrong ones
    const wrongOptions = hebrewLetters
      .filter(l => l.sound !== randomLetter.sound)
      .map(l => l.sound);
    const shuffledOptions = shuffleArray([randomLetter.sound, ...wrongOptions.slice(0, 3)]);
    setOptions(shuffledOptions);
  };

  const handleOptionClick = (selectedSound: string) => {
    if (!currentLetter || !gameActive) return;

    const isCorrect = selectedSound === currentLetter.sound;
    setScore(prev => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1
    }));

    if (isCorrect) {
      toast.success("Correct! Well done!", {
        icon: <Check className="h-4 w-4 text-green-500" />
      });
    } else {
      toast.error(`Incorrect. The correct sound was "${currentLetter.sound}"`, {
        icon: <X className="h-4 w-4 text-red-500" />
      });
    }

    if (currentRound < totalRounds) {
      setCurrentRound(prev => prev + 1);
      setupRound();
    } else {
      setGameActive(false);
      toast("Game Over! Click 'Start New Game' to play again.");
    }
  };

  const shuffleOptions = () => {
    setOptions(shuffleArray([...options]));
  };

  return (
    <div 
      className="min-h-screen p-8"
      style={{ 
        background: `linear-gradient(to bottom right, ${colors.softPurple}, ${colors.softBlue})`
      }}
    >
      <div className="fixed top-0 left-0 right-0 h-24 bg-darkCharcoal z-50 flex items-center justify-between px-8">
        <Link to="/">
          <Button variant="ghost" size="icon">
            <Undo2 className="h-6 w-6 text-white" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-white">Letter Matching</h1>
        <div className="w-10" /> {/* Spacer for alignment */}
      </div>

      <div className="max-w-2xl mx-auto space-y-8 pt-24">
        <Card className="border-2" style={{ borderColor: colors.primaryPurple }}>
          <CardHeader>
            <CardTitle className="text-center" style={{ color: colors.darkPurple }}>
              Letter Matching Game
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <ScoreDisplay correct={score.correct} total={score.total} />
            <ProgressBar current={currentRound} total={totalRounds} />
            
            {gameActive && currentLetter && (
              <div className="space-y-6">
                <div className="text-center">
                  <div 
                    className="text-8xl font-bold mb-4"
                    style={{ color: colors.vividPurple }}
                  >
                    {currentLetter.letter}
                  </div>
                  <div 
                    className="text-xl"
                    style={{ color: colors.secondaryPurple }}
                  >
                    {currentLetter.name}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  {options.map((option, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="h-16 text-lg hover:bg-accent"
                      onClick={() => handleOptionClick(option)}
                      style={{ 
                        borderColor: colors.primaryPurple,
                        color: colors.darkPurple
                      }}
                    >
                      {option}
                    </Button>
                  ))}
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                className="h-16 text-lg"
                onClick={startNewGame}
                style={{ 
                  borderColor: colors.primaryPurple,
                  color: colors.darkPurple
                }}
              >
                <Puzzle className="mr-2 h-6 w-6" />
                Start New Game
              </Button>
              <Button
                variant="outline"
                className="h-16 text-lg"
                onClick={shuffleOptions}
                disabled={!gameActive}
                style={{ 
                  borderColor: colors.primaryPurple,
                  color: colors.darkPurple
                }}
              >
                <Shuffle className="mr-2 h-6 w-6" />
                Shuffle Options
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LetterMatching;
