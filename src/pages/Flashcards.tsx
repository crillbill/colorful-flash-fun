import { useState, useEffect } from "react";
import FlashCard from "@/components/FlashCard";
import { ScoreDisplay } from "@/components/ScoreDisplay";
import { ProgressBar } from "@/components/ProgressBar";
import { Header1 } from "@/components/ui/header";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

type Category = "all" | "words" | "phrases" | "verbs";

interface FlashcardData {
  hebrew: string;
  english: string;
  transliteration?: string;
}

const MAX_CARDS = 25;

const Flashcards = () => {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [totalAnswered, setTotalAnswered] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<Category>("all");
  const [gameActive, setGameActive] = useState(false);
  const [flashcardsData, setFlashcardsData] = useState<FlashcardData[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchFlashcards = async (category: Category) => {
    setIsLoading(true);
    try {
      let allData: FlashcardData[] = [];

      if (category === "all" || category === "words") {
        const { data: words } = await supabase
          .from("hebrew_words")
          .select("hebrew, english, transliteration");
        if (words) allData.push(...words);
      }

      if (category === "all" || category === "phrases") {
        const { data: phrases } = await supabase
          .from("hebrew_phrases")
          .select("hebrew, english, transliteration");
        if (phrases) allData.push(...phrases);
      }

      if (category === "all" || category === "verbs") {
        const { data: verbs } = await supabase
          .from("hebrew_verbs")
          .select("hebrew, english, transliteration");
        if (verbs) allData.push(...verbs);
      }

      // Shuffle and limit to MAX_CARDS
      const shuffledData = allData.sort(() => Math.random() - 0.5).slice(0, MAX_CARDS);
      setFlashcardsData(shuffledData);
      setGameActive(true);
    } catch (error) {
      console.error("Error fetching flashcards:", error);
      toast.error("Failed to load flashcards");
    } finally {
      setIsLoading(false);
    }
  };

  const startGame = async () => {
    setCurrentCardIndex(0);
    setCorrectAnswers(0);
    setTotalAnswered(0);
    await fetchFlashcards(selectedCategory);
    toast.success(`Starting new game with ${selectedCategory} cards!`);
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
    setFlashcardsData([]);
    setCurrentCardIndex(0);
    setCorrectAnswers(0);
    setTotalAnswered(0);
  };

  const isGameComplete = currentCardIndex === flashcardsData.length - 1 && 
                        totalAnswered === flashcardsData.length;

  return (
    <>
      <Header1 />
      <div className="min-h-screen bg-white p-8 pt-24">
        <div className="max-w-2xl mx-auto space-y-8">
          {!gameActive ? (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-center">Hebrew Flashcards</h2>
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700">
                  Select Category
                </label>
                <Select
                  value={selectedCategory}
                  onValueChange={(value: Category) => setSelectedCategory(value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="words">Words</SelectItem>
                    <SelectItem value="phrases">Phrases</SelectItem>
                    <SelectItem value="verbs">Verbs</SelectItem>
                  </SelectContent>
                </Select>
                <Button 
                  onClick={startGame} 
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? "Loading..." : "Start Game"}
                </Button>
              </div>
            </div>
          ) : (
            <>
              <ScoreDisplay correct={correctAnswers} total={totalAnswered} />
              <ProgressBar 
                current={currentCardIndex + 1} 
                total={flashcardsData.length} 
              />

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