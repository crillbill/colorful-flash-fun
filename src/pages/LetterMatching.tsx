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
  hebrew: string;
  english: string;
}

const LetterMatching = () => {
  const colors = useColors();
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [currentRound, setCurrentRound] = useState(1);
  const [currentLetter, setCurrentLetter] = useState<HebrewLetter | null>(null);
  const [options, setOptions] = useState<string[]>([]);
  const [gameActive, setGameActive] = useState(false);
  const [letters, setLetters] = useState<HebrewLetter[]>([]);
  const [remainingLetters, setRemainingLetters] = useState<HebrewLetter[]>([]);
  const [totalRounds, setTotalRounds] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showTransliteration, setShowTransliteration] = useState(false);

  useEffect(() => {
    fetchHebrewLetters();
  }, []);

  const fetchHebrewLetters = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('hebrew_alphabet')
        .select('letter, name, sound_description, transliteration, hebrew, english');
      
      if (error) {
        console.error('Supabase error:', error);
        toast.error("Failed to load Hebrew letters. Please try refreshing the page.");
        throw error;
      }

      if (!data || data.length === 0) {
        toast.error("No Hebrew letters found in the database.");
        return;
      }

      console.log('Fetched letters:', data);
      setLetters(data);
      setTotalRounds(data.length);
    } catch (error) {
      console.error('Error fetching Hebrew letters:', error);
      toast.error("Failed to load Hebrew letters. Please try refreshing the page.");
    } finally {
      setIsLoading(false);
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
    setRemainingLetters(shuffleArray([...letters]));
    setShowTransliteration(false);
    setupRound();
    toast("New game started! Match all Hebrew letters to their names.");
  };

  const setupRound = () => {
    if (remainingLetters.length === 0) return;
    
    const nextLetter = remainingLetters[0];
    setCurrentLetter(nextLetter);
    
    // Get wrong options from the letters array, excluding the correct answer
    const wrongOptions = letters
      .filter(l => l.name !== nextLetter.name)
      .map(l => l.name);
    
    // Take 3 random wrong options and add the correct answer
    const shuffledOptions = shuffleArray([nextLetter.name, ...wrongOptions.slice(0, 3)]);
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

    setRemainingLetters(prev => prev.slice(1));
    setShowTransliteration(false);

    if (currentRound < totalRounds) {
      setCurrentRound(prev => prev + 1);
      setupRound();
    } else {
      setGameActive(false);
      toast("Game Over! You've completed all Hebrew letters. Click 'Start New Game' to play again.");
    }
  };

  const shuffleOptions = () => {
    setOptions(shuffleArray([...options]));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white p-8 pt-24">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-lg" style={{ color: colors.darkPurple }}>
            Loading Hebrew letters...
          </p>
        </div>
      </div>
    );
  }

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
                    <div className="flex flex-col items-center gap-2">
                      <div 
                        className="text-8xl font-bold"
                        style={{ color: colors.vividPurple }}
                      >
                        {currentLetter.letter}
                      </div>
                      
                      <div className="relative my-4 text-center w-full">
                        <button 
                          className={`w-full bg-gray-700/80 backdrop-blur-sm rounded-lg p-4 cursor-pointer transition-all duration-300 ${
                            showTransliteration ? 'opacity-0 pointer-events-none' : 'opacity-100'
                          }`}
                          onClick={() => setShowTransliteration(true)}
                        >
                          <span className="text-white font-medium">Show Pronunciation Guide</span>
                        </button>
                        <div 
                          className={`absolute inset-0 bg-white rounded-lg p-4 transition-all duration-300 ${
                            showTransliteration ? 'opacity-100' : 'opacity-0 pointer-events-none'
                          }`}
                        >
                          <div className="flex flex-col gap-2">
                            <span className="text-black font-medium text-lg">
                              {currentLetter.transliteration || "Pronunciation guide not available"}
                            </span>
                            <span className="text-gray-500 text-xs">How to pronounce this letter</span>
                          </div>
                        </div>
                      </div>
                      
                      {currentLetter.sound_description && (
                        <div 
                          className="text-md mt-2"
                          style={{ color: colors.secondaryPurple }}
                        >
                          Sound: {currentLetter.sound_description}
                        </div>
                      )}
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
    </>
  );
};

export default LetterMatching;