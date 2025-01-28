import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Header1 } from "@/components/ui/header";
import { toast } from "sonner";
import { useState } from "react";

const SpinTheWheel = () => {
  const [currentWord, setCurrentWord] = useState<{
    hebrew: string;
    english: string;
    transliteration?: string | null;
  } | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);

  const { data: objectWords, isLoading } = useQuery({
    queryKey: ["objectWords"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("hebrew_words")
        .select("hebrew, english, transliteration")
        .eq("is_object", true);

      if (error) {
        toast.error("Failed to load words");
        throw error;
      }

      return data;
    },
  });

  const spinWheel = () => {
    if (!objectWords?.length) return;

    setIsSpinning(true);
    const randomIndex = Math.floor(Math.random() * objectWords.length);
    
    // Simulate wheel spinning animation
    setTimeout(() => {
      setCurrentWord(objectWords[randomIndex]);
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
          Spin the wheel to learn Hebrew object words!
        </p>

        <div className="bg-white rounded-lg shadow-xl p-8 mb-8">
          {currentWord ? (
            <div className="space-y-4">
              <p className="text-3xl font-bold text-primaryPurple">{currentWord.hebrew}</p>
              <p className="text-xl text-gray-600">{currentWord.english}</p>
              {currentWord.transliteration && (
                <p className="text-md text-gray-500">{currentWord.transliteration}</p>
              )}
            </div>
          ) : (
            <p className="text-xl text-gray-500">Spin the wheel to reveal a word!</p>
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
      </div>
    </div>
  );
};

export default SpinTheWheel;