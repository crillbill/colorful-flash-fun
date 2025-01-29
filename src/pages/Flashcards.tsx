import { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";
import FlashCard from "@/components/FlashCard";
import { Header1 } from "@/components/ui/header";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

interface FlashcardData {
  hebrew: string;
  english: string;
  transliteration?: string;
}

const MAX_CARDS = 25;

const fetchFlashcards = async (): Promise<FlashcardData[]> => {
  const { data, error } = await supabase
    .from("hebrew_bulk_words")
    .select("hebrew, english, transliteration");

  if (error) {
    console.error("Error fetching flashcards:", error);
    throw error;
  }

  return (data || []).sort(() => Math.random() - 0.5).slice(0, MAX_CARDS);
};

const Flashcards = () => {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [totalAnswered, setTotalAnswered] = useState(0);
  const [gameActive, setGameActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { data: flashcardsData = [], isLoading: isQueryLoading, error } = useQuery({
    queryKey: ['flashcards'],
    queryFn: fetchFlashcards,
    enabled: gameActive,
  });

  const startGame = () => {
    setCurrentCardIndex(0);
    setCorrectAnswers(0);
    setTotalAnswered(0);
    setGameActive(true);
    toast.success("Starting new game with Hebrew words!");
  };

  const handleNext = () => {
    if (currentCardIndex < flashcardsData.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
    }
  };

  const handleCorrect = () => {
    setCorrectAnswers(correctAnswers + 1);
    setTotalAnswered(totalAnswered + 1);
    handleNext();
  };

  const handleIncorrect = () => {
    setTotalAnswered(totalAnswered + 1);
    handleNext();
  };

  const resetGame = () => {
    setGameActive(false);
    setCurrentCardIndex(0);
    setCorrectAnswers(0);
    setTotalAnswered(0);
  };

  const isGameComplete = currentCardIndex === flashcardsData.length - 1 && 
                        totalAnswered === flashcardsData.length;

  if (error) {
    toast.error("Failed to load flashcards");
    return null;
  }

  return (
    <>
      <Header1 />
      <div className="min-h-screen bg-white p-8 pt-24">
        <div className="max-w-2xl mx-auto space-y-8">
          {!gameActive ? (
            <Card className="border-2 border-primary/20">
              <CardHeader>
                <CardTitle className="text-center text-3xl font-bold bg-gradient-to-r from-primaryPurple via-vividPurple to-magentaPink text-transparent bg-clip-text">
                  Hebrew Flashcards
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col items-center justify-center space-y-4 py-6">
                  <BookOpen className="h-16 w-16 text-primary/60" />
                  <div className="text-center space-y-2">
                    <h3 className="text-xl font-semibold">Ready to Practice?</h3>
                    <p className="text-muted-foreground">
                      Test your knowledge with {MAX_CARDS} Hebrew words
                    </p>
                  </div>
                </div>
                <Button 
                  onClick={startGame} 
                  className="w-full h-12 text-lg"
                  disabled={isLoading}
                >
                  {isLoading ? "Loading..." : "Start Game"}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              {!isGameComplete && flashcardsData.length > 0 ? (
                <FlashCard
                  question={flashcardsData[currentCardIndex].hebrew}
                  answer={flashcardsData[currentCardIndex].english}
                  transliteration={flashcardsData[currentCardIndex].transliteration}
                  onNext={handleNext}
                  onPrevious={handlePrevious}
                  onCorrect={handleCorrect}
                  onIncorrect={handleIncorrect}
                  showPrevious={currentCardIndex > 0}
                  showNext={currentCardIndex < flashcardsData.length - 1}
                />
              ) : (
                <div className="text-center space-y-4">
                  <h2 className="text-2xl font-bold">Game Complete!</h2>
                  <p className="text-lg">
                    You got {correctAnswers} out of {totalAnswered} correct!
                  </p>
                  <Button onClick={resetGame} size="lg">
                    New Game
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Flashcards;