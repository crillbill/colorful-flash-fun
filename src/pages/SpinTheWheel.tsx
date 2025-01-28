import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Header1 } from "@/components/ui/header";
import { toast } from "sonner";
import { useState } from "react";
import { Circle, Trophy } from "lucide-react";
import { CategorySelector, type Category } from "@/components/CategorySelector";

const SpinTheWheel = () => {
  const [currentWord, setCurrentWord] = useState<{
    hebrew: string;
    english: string;
    transliteration?: string | null;
  } | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category>("all");

  const { data: words, isLoading } = useQuery({
    queryKey: ["hebrewWords", selectedCategory],
    queryFn: async () => {
      let query = supabase
        .from("hebrew_words")
        .select("hebrew, english, transliteration")
        .eq("is_object", true);

      // Apply category filter if not "all"
      if (selectedCategory === "words") {
        query = query.not("transliteration", "is", null);
      } else if (selectedCategory === "letters") {
        query = query.eq("transliteration", null);
      }

      const { data, error } = await query;

      if (error) {
        toast.error("Failed to load words");
        throw error;
      }

      return data;
    },
  });

  const spinWheel = () => {
    if (!words?.length) {
      toast.error("No words available in this category");
      return;
    }

    setIsSpinning(true);
    const randomIndex = Math.floor(Math.random() * words.length);
    
    // Simulate wheel spinning animation
    setTimeout(() => {
      setCurrentWord(words[randomIndex]);
      setIsSpinning(false);
      toast.success("The wheel has stopped!");
    }, 1500);
  };

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-softPurple via-white to-softPink p-8">
      <Header1 />
      <div className="max-w-4xl mx-auto mt-16 text-center">
        <h1 className="text-4xl font-bold mb-8 gradient-text">Spin The Wheel</h1>
        <p className="text-lg text-gray-600 mb-8">
          Select a category and spin the wheel to learn Hebrew words!
        </p>

        <div className="mb-8">
          <CategorySelector value={selectedCategory} onChange={setSelectedCategory} />
        </div>

        <div className="bg-white rounded-lg shadow-xl p-8 mb-8 min-h-[200px] flex items-center justify-center">
          {currentWord ? (
            <div className="space-y-4">
              <p className="text-3xl font-bold text-primaryPurple">{currentWord.hebrew}</p>
              <p className="text-xl text-gray-600">{currentWord.english}</p>
              {currentWord.transliteration && (
                <p className="text-md text-gray-500">({currentWord.transliteration})</p>
              )}
              <div className="flex justify-center mt-4">
                <Trophy className="text-yellow-500 w-8 h-8" />
              </div>
            </div>
          ) : (
            <div className="text-xl text-gray-500 flex flex-col items-center gap-4">
              <Circle className="w-16 h-16 text-primaryPurple" />
              <p>Spin the wheel to reveal a word!</p>
            </div>
          )}
        </div>

        <Button
          onClick={spinWheel}
          disabled={isSpinning}
          className={`text-xl px-8 py-6 bg-vividPurple hover:bg-vividPurple/90 ${
            isSpinning ? "animate-spin" : ""
          }`}
        >
          {isSpinning ? "Spinning..." : "Spin the Wheel!"}
        </Button>

        {words && (
          <p className="mt-4 text-sm text-gray-500">
            {words.length} words available in this category
          </p>
        )}
      </div>
    </div>
  );
};

export default SpinTheWheel;