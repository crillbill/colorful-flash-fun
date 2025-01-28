import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Header1 } from "@/components/ui/header";
import { useToast } from "@/hooks/use-toast";
import { CategorySelector, type Category } from "@/components/CategorySelector";
import { supabase } from "@/integrations/supabase/client";
import { AudioButton } from "@/components/AudioButton";
import { useAudioPlayback } from "@/hooks/useAudioPlayback";

interface Option {
  hebrew: string;
  english: string;
  transliteration?: string | null;
}

interface Question {
  sentence: string;
  missingWord: string;
  translation: string;
  options: Option[];
}

const FillInTheBlank = () => {
  const [category, setCategory] = useState<Category>("words");
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [showAnswer, setShowAnswer] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { playAudio, isPlaying } = useAudioPlayback();

  useEffect(() => {
    fetchNewQuestion();
  }, [category]);

  const fetchNewQuestion = async () => {
    try {
      setIsLoading(true);
      setShowAnswer(false);
      setSelectedAnswer("");

      let tableQuery;
      switch (category) {
        case "words":
          tableQuery = supabase.from("hebrew_words").select("*");
          break;
        case "verbs":
          tableQuery = supabase.from("hebrew_verbs").select("*");
          break;
        case "phrases":
          tableQuery = supabase.from("hebrew_phrases").select("*");
          break;
        default:
          tableQuery = supabase.from("hebrew_words").select("*");
      }

      const { data, error } = await tableQuery;

      if (error) throw error;

      if (!data || data.length < 4) {
        toast({
          title: "Error",
          description: "Not enough words available for the game",
          variant: "destructive",
        });
        return;
      }

      // Randomly select one word to be the answer
      const words = data.sort(() => Math.random() - 0.5);
      const correctWord = words[0];

      // Get 3 random incorrect options
      const incorrectOptions = words.slice(1, 4);

      // Create the sentence with the blank
      const sentence = `אני אוהב _____`;
      const translation = `I love ${correctWord.english}`;

      const question: Question = {
        sentence,
        missingWord: correctWord.hebrew,
        translation,
        options: [...incorrectOptions, correctWord]
          .sort(() => Math.random() - 0.5)
          .map(word => ({
            hebrew: word.hebrew,
            english: word.english,
            transliteration: word.transliteration
          }))
      };

      setCurrentQuestion(question);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching question:", error);
      toast({
        title: "Error",
        description: "Failed to load question. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAnswer = (hebrew: string) => {
    setSelectedAnswer(hebrew);
    setShowAnswer(true);

    const isCorrect = hebrew === currentQuestion?.missingWord;
    toast({
      title: isCorrect ? "Correct!" : "Incorrect",
      description: isCorrect ? "Great job!" : `The correct answer was: ${currentQuestion?.missingWord}`,
      variant: isCorrect ? "default" : "destructive",
    });
  };

  const handlePlayAudio = async (text: string) => {
    try {
      await playAudio(text);
    } catch (error) {
      console.error("Error playing audio:", error);
      toast({
        title: "Error playing audio",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white p-8 pt-24">
        <Header1 />
        <div className="max-w-2xl mx-auto text-center">
          Loading question...
        </div>
      </div>
    );
  }

  return (
    <>
      <Header1 />
      <div className="min-h-screen bg-white p-8 pt-24">
        <div className="max-w-2xl mx-auto space-y-8">
          <CategorySelector
            value={category}
            onChange={setCategory}
          />

          {currentQuestion && (
            <Card>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-semibold text-center">
                      {currentQuestion.sentence}
                    </h2>
                    <AudioButton
                      isPlaying={isPlaying}
                      onToggle={() => handlePlayAudio(currentQuestion.sentence)}
                      disabled={isPlaying}
                    />
                  </div>
                  <p className="text-gray-600 text-center">
                    {currentQuestion.translation}
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {currentQuestion.options.map((option) => (
                    <Button
                      key={option.hebrew}
                      onClick={() => handleAnswer(option.hebrew)}
                      variant={showAnswer ? (option.hebrew === currentQuestion.missingWord ? "default" : "outline") : "outline"}
                      className="w-full p-4 h-auto"
                      disabled={showAnswer}
                    >
                      <div className="flex flex-col items-center gap-2">
                        <span className="text-lg">{option.hebrew}</span>
                        <span className="text-sm text-gray-600">
                          {option.english}
                          {option.transliteration && ` (${option.transliteration})`}
                        </span>
                      </div>
                    </Button>
                  ))}
                </div>

                {showAnswer && (
                  <Button
                    onClick={fetchNewQuestion}
                    className="w-full mt-4"
                  >
                    Next Question
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
};

export default FillInTheBlank;