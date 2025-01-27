import { useState, useEffect } from "react";
import FlashCard from "@/components/FlashCard";
import { ScoreDisplay } from "@/components/ScoreDisplay";
import { ProgressBar } from "@/components/ProgressBar";
import { Header1 } from "@/components/ui/header";
import { Button } from "@/components/ui/button";
import { Square, X } from "lucide-react";
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
      if (category === "all") {
        return ["all"];
      }

      let newCategories: Category[];

      if (prev.includes("all")) {
        // If "all" is currently selected and user clicks another category,
        // switch to just that category
        newCategories = [category];
      } else {
        if (prev.includes(category)) {
          // Remove the category if it's already selected
          newCategories = prev.filter(c => c !== category);
        } else {
          // Add the category if it's not selected
          newCategories = [...prev, category];
        }
      }

      // If no categories are selected, default to "all"
      return newCategories.length === 0 ? ["all"] : newCategories;
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
          .select("letter, name, transliteration");
        
        // Transform alphabet data to match FlashcardData interface
        const transformedAlphabet = alphabet?.map(letter => ({
          hebrew: letter.letter,
          english: letter.name,
          transliteration: letter.transliteration
        }));
        
        if (transformedAlphabet) allData.push(...transformedAlphabet);
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

  const CustomCheckbox = ({ 
    id, 
    checked, 
    onChange, 
    label, 
    disabled 
  }: { 
    id: string; 
    checked: boolean; 
    onChange: () => void; 
    label: string;
    disabled?: boolean;
  }) => (
    <div className="flex items-center space-x-2">
      <button
        type="button"
        id={id}
        onClick={onChange}
        disabled={disabled}
        className={`w-5 h-5 border-2 rounded flex items-center justify-center transition-colors
          ${checked 
            ? 'bg-primary border-primary text-primary-foreground' 
            : 'border-primary bg-transparent'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-primary/10'}`
        }
        aria-checked={checked}
        role="checkbox"
      >
        {checked ? (
          <X className="h-3 w-3" />
        ) : (
          <Square className="h-3 w-3 opacity-0" />
        )}
      </button>
      <label
        htmlFor={id}
        className={`text-sm font-medium leading-none select-none
          ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
      >
        {label}
      </label>
    </div>
  );

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
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                    <CustomCheckbox 
                      id="all"
                      checked={selectedCategories.includes("all")}
                      onChange={() => handleCategoryChange("all")}
                      label="All Categories"
                    />
                    <CustomCheckbox 
                      id="words"
                      checked={selectedCategories.includes("words")}
                      onChange={() => handleCategoryChange("words")}
                      disabled={selectedCategories.includes("all")}
                      label="Words"
                    />
                    <CustomCheckbox 
                      id="phrases"
                      checked={selectedCategories.includes("phrases")}
                      onChange={() => handleCategoryChange("phrases")}
                      disabled={selectedCategories.includes("all")}
                      label="Phrases"
                    />
                    <CustomCheckbox 
                      id="verbs"
                      checked={selectedCategories.includes("verbs")}
                      onChange={() => handleCategoryChange("verbs")}
                      disabled={selectedCategories.includes("all")}
                      label="Verbs"
                    />
                    <CustomCheckbox 
                      id="alphabet"
                      checked={selectedCategories.includes("alphabet")}
                      onChange={() => handleCategoryChange("alphabet")}
                      disabled={selectedCategories.includes("all")}
                      label="Alphabet"
                    />
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
