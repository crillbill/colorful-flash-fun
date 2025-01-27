import { useState, useEffect } from "react";
import FlashCard from "@/components/FlashCard";
import { ScoreDisplay } from "@/components/ScoreDisplay";
import { ProgressBar } from "@/components/ProgressBar";
import { Header1 } from "@/components/ui/header";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

type Category = "all" | "words" | "phrases" | "verbs" | "alphabet";

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
  const [selectedCategories, setSelectedCategories] = useState<Category[]>(["all"]);
  const [gameActive, setGameActive] = useState(false);
  const [flashcardsData, setFlashcardsData] = useState<FlashcardData[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleCategoryChange = (category: Category) => {
    setSelectedCategories(prev => {
      // If selecting "all", uncheck everything else
      if (category === "all") {
        return ["all"];
      }
      
      // If selecting a specific category while "all" is checked, uncheck "all"
      let newCategories = prev.filter(c => c !== "all");
      
      // Toggle the selected category
      if (newCategories.includes(category)) {
        newCategories = newCategories.filter(c => c !== category);
      } else {
        newCategories.push(category);
      }
      
      // If no categories selected, default to "all"
      if (newCategories.length === 0) {
        return ["all"];
      }
      
      return newCategories;
    });
  };

  const fetchFlashcards = async (categories: Category[]) => {
    setIsLoading(true);
    try {
      let allData: FlashcardData[] = [];

      // If "all" is selected or no categories selected, fetch from all tables
      const fetchAll = categories.includes("all") || categories.length === 0;

      if (fetchAll || categories.includes("words")) {
        const { data: words } = await supabase
          .from("hebrew_words")
          .select("hebrew, english, transliteration");
        if (words) allData.push(...words);
      }

      if (fetchAll || categories.includes("phrases")) {
        const { data: phrases } = await supabase
          .from("hebrew_phrases")
          .select("hebrew, english, transliteration");
        if (phrases) allData.push(...phrases);
      }

      if (fetchAll || categories.includes("verbs")) {
        const { data: verbs } = await supabase
          .from("hebrew_verbs")
          .select("hebrew, english, transliteration");
        if (verbs) allData.push(...verbs);
      }

      if (fetchAll || categories.includes("alphabet")) {
        const { data: alphabet } = await supabase
          .from("hebrew_alphabet")
          .select("letter as hebrew, name as english, transliteration");
        if (alphabet) allData.push(...alphabet);
      }

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
    await fetchFlashcards(selectedCategories);
    toast.success(`Starting new game with selected categories!`);
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
              <div className="space-y-6">
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Select Categories
                  </label>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="all"
                        checked={selectedCategories.includes("all")}
                        onCheckedChange={() => handleCategoryChange("all")}
                      />
                      <label
                        htmlFor="all"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        All Categories
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="words"
                        checked={selectedCategories.includes("words")}
                        onCheckedChange={() => handleCategoryChange("words")}
                        disabled={selectedCategories.includes("all")}
                      />
                      <label
                        htmlFor="words"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Words
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="phrases"
                        checked={selectedCategories.includes("phrases")}
                        onCheckedChange={() => handleCategoryChange("phrases")}
                        disabled={selectedCategories.includes("all")}
                      />
                      <label
                        htmlFor="phrases"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Phrases
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="verbs"
                        checked={selectedCategories.includes("verbs")}
                        onCheckedChange={() => handleCategoryChange("verbs")}
                        disabled={selectedCategories.includes("all")}
                      />
                      <label
                        htmlFor="verbs"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Verbs
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="alphabet"
                        checked={selectedCategories.includes("alphabet")}
                        onCheckedChange={() => handleCategoryChange("alphabet")}
                        disabled={selectedCategories.includes("all")}
                      />
                      <label
                        htmlFor="alphabet"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Alphabet
                      </label>
                    </div>
                  </div>
                </div>
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