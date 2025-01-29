import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Puzzle, Shuffle } from "lucide-react";
import { toast } from "sonner";
import { useColors } from "@/contexts/ColorContext";
import { Header1 } from "@/components/ui/header";
import { supabase } from "@/integrations/supabase/client";
import { GameTimer } from "@/components/GameTimer";
import { Leaderboard } from "@/components/Leaderboard";
import { ColorProvider } from "@/contexts/ColorContext";

interface HebrewLetter {
  letter: string;
  name: string;
  sound_description: string | null;
  transliteration: string | null;
  hebrew: string;
  english: string;
}

const GAME_TIME = 300; // 5 minutes in seconds

const LetterMatchingContent = () => {
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
  const [timeLeft, setTimeLeft] = useState(GAME_TIME);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    checkAuth();
  }, []);

  useEffect(() => {
    fetchHebrewLetters();
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (gameActive && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            endGame();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [gameActive, timeLeft]);

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

      setLetters(data);
      setTotalRounds(data.length);
    } catch (error) {
      console.error('Error fetching Hebrew letters:', error);
      toast.error("Failed to load Hebrew letters. Please try refreshing the page.");
    } finally {
      setIsLoading(false);
    }
  };

  const saveScore = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('pronunciation_scores')
        .insert([
          {
            user_id: user.id,
            word: 'letter_matching',
            score: Math.round((score.correct / score.total) * 100),
            time_taken: GAME_TIME - timeLeft
          }
        ]);

      if (error) throw error;
      toast.success("Score saved successfully!");
    } catch (error) {
      console.error('Error saving score:', error);
      toast.error("Failed to save score");
    }
  };

  const endGame = async () => {
    setGameActive(false);
    if (user) {
      await saveScore();
    } else {
      toast("Sign in to save your score!", {
        description: "Your progress won't be saved without an account"
      });
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
    setTimeLeft(GAME_TIME);
    setupRound();
    toast("New game started! Match all Hebrew letters to their names.");
  };

  const setupRound = () => {
    if (remainingLetters.length === 0) return;
    
    const nextLetter = remainingLetters[0];
    setCurrentLetter(nextLetter);
    
    const wrongOptions = letters
      .filter(l => l.name !== nextLetter.name)
      .map(l => l.name);
    
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
      toast.success("Correct! Well done!");
    } else {
      toast.error(`Incorrect. The correct name was "${currentLetter.name}"`);
    }

    setRemainingLetters(prev => prev.slice(1));
    setShowTransliteration(false);

    if (currentRound < totalRounds) {
      setCurrentRound(prev => prev + 1);
      setupRound();
    } else {
      endGame();
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
        <div className="max-w-6xl mx-auto space-y-8">
          <Card className="border-2" style={{ borderColor: colors.primaryPurple }}>
            <CardHeader>
              <CardTitle className="text-center" style={{ color: colors.darkPurple }}>
                Letter Matching Game
              </CardTitle>
              {gameActive && <GameTimer timeLeft={timeLeft} />}
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <p className="text-lg font-semibold">
                  Score: {score.correct}/{score.total} ({Math.round((score.correct / score.total) * 100)}%)
                </p>
              </div>
              
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
                      
                      <div className="relative my-4 text-center">
                        <button 
                          className={`inline-flex px-4 py-2 bg-gray-700/80 backdrop-blur-sm rounded-lg cursor-pointer transition-all duration-300 ${
                            showTransliteration ? 'opacity-0 pointer-events-none' : 'opacity-100'
                          }`}
                          onClick={() => setShowTransliteration(true)}
                        >
                          <span className="text-white font-medium">Reveal Hint</span>
                        </button>
                        <div 
                          className={`absolute inset-0 bg-white rounded-lg p-4 transition-all duration-300 ${
                            showTransliteration ? 'opacity-100' : 'opacity-0 pointer-events-none'
                          }`}
                        >
                          <span className="text-black font-medium text-lg">
                            {currentLetter.transliteration}
                          </span>
                        </div>
                      </div>
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

          <Leaderboard />
        </div>
      </div>
    </>
  );
};

const LetterMatching = () => {
  return (
    <ColorProvider>
      <LetterMatchingContent />
    </ColorProvider>
  );
};

export default LetterMatching;