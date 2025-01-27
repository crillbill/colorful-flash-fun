import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Puzzle, Shuffle, Check, X } from "lucide-react";
import { ScoreDisplay } from "@/components/ScoreDisplay";
import { ProgressBar } from "@/components/ProgressBar";
import { toast } from "sonner";
import { useColors } from "@/contexts/ColorContext";
import { Header1 } from "@/components/ui/header";
import { supabase } from "@/integrations/supabase/client";

interface HebrewLetter {
  letter: string;
  name: string;
  sound_description: string | null;
  transliteration: string | null;
}

const LetterMatching = () => {
  const colors = useColors();
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [currentRound, setCurrentRound] = useState(1);
  const [currentLetter, setCurrentLetter] = useState<HebrewLetter | null>(null);
  const [options, setOptions] = useState<string[]>([]);
  const [gameActive, setGameActive] = useState(false);
  const [letters, setLetters] = useState<HebrewLetter[]>([]);
  const totalRounds = 10;

  useEffect(() => {
    fetchHebrewLetters();
  }, []);

  const fetchHebrewLetters = async () => {
    try {
      const { data, error } = await supabase
        .from('hebrew_alphabet')
        .select('letter, name, sound_description, transliteration');
      
      if (error) {
        throw error;
      }

      if (data) {
        setLetters(data);
      }
    } catch (error) {
      console.error('Error fetching Hebrew letters:', error);
      toast.error("Failed to load Hebrew letters");
    }
  };

  const shuffleArray = (array: any[]) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const startNewGame = () => {
    if (letters.length === 0) {
      toast.error("Please wait for letters to load");
      return;
    }
    setScore({ correct: 0, total: 0 });
    setCurrentRound(1);
    setGameActive(true);
    setupRound();
    toast("New game started! Match the Hebrew letters to their names.");
  };

  const setupRound = () => {
    if (letters.length === 0) return;
    
    const randomLetter = letters[Math.floor(Math.random() * letters.length)];
    setCurrentLetter(randomLetter);
    
    // Create options including the correct name and some wrong ones
    const wrongOptions = letters
      .filter(l => l.name !== randomLetter.name)
      .map(l => l.name);
    const shuffledOptions = shuffleArray([randomLetter.name, ...wrongOptions.slice(0, 3)]);
    setOptions(shuffledOptions);
  };

  const handleOptionClick = (selectedName: string) => {
    if (!currentLetter || !gameActive) return;

    const isCorrect = selectedName === currentLetter.name;
    setScore(prev => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1
    }));

    if (isCorrect) {
      toast.success("Correct! Well done!", {
        icon: <Check className="h-4 w-4 text-green-500" />
      });
    } else {
      toast.error(`Incorrect. The correct name was "${currentLetter.name}"`, {
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
    <>
      <Header1 />
      <div className="min-h-screen bg-white p-8 pt-24">
        <div className="max-w-2xl mx-auto space-y-8">
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
                    {currentLetter.transliteration && (
                      <div 
                        className="text-xl mb-2"
                        style={{ color: colors.secondaryPurple }}
                      >
                        Transliteration: {currentLetter.transliteration}
                      </div>
                    )}
                    {currentLetter.sound_description && (
                      <div 
                        className="text-md"
                        style={{ color: colors.secondaryPurple }}
                      >
                        Sound: {currentLetter.sound_description}
                      </div>
                    )}
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
    </>
  );
};

export default LetterMatching;