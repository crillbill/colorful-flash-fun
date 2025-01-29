import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { AudioButton } from "@/components/AudioButton";
import { ProgressBar } from "@/components/ProgressBar";
import { ScoreDisplay } from "@/components/ScoreDisplay";
import { GameTimer } from "@/components/GameTimer";
import { useToast } from "@/hooks/use-toast";
import { Header1 } from "@/components/ui/header";
import { useColors } from "@/contexts/ColorContext";
import { supabase } from "@/integrations/supabase/client";
import { useAudioPlayback } from "@/hooks/useAudioPlayback";

interface Question {
  word: string;
  translation: string;
  options: string[];
}

const GAME_TIME = 120; // 2 minutes in seconds

const MultipleChoice = () => {
  const colors = useColors();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(GAME_TIME);
  const [isGameActive, setIsGameActive] = useState(false);
  const { toast } = useToast();
  const { isPlaying, playAudio } = useAudioPlayback();

  useEffect(() => {
    fetchWords();
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isGameActive && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            handleTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isGameActive, timeLeft]);

  const handleTimeUp = () => {
    setIsGameActive(false);
    toast({
      title: "Time's up!",
      description: `Final score: ${score.correct} out of ${score.total}`,
      variant: "destructive",
    });
  };

  const fetchWords = async () => {
    try {
      const { data: words, error } = await supabase
        .from("hebrew_words")
        .select("hebrew, english")
        .limit(20);

      if (error) throw error;

      if (!words || words.length < 4) {
        toast({
          title: "Error",
          description: "Not enough words available for the game",
          variant: "destructive",
        });
        return;
      }

      // Shuffle words and create questions
      const shuffledWords = words.sort(() => Math.random() - 0.5);
      const gameQuestions = shuffledWords.slice(0, 5).map((word) => {
        // Get 3 random incorrect options
        const incorrectOptions = shuffledWords
          .filter((w) => w.english !== word.english)
          .slice(0, 3)
          .map((w) => w.english);

        // Add correct answer and shuffle options
        const options = [...incorrectOptions, word.english].sort(
          () => Math.random() - 0.5
        );

        return {
          word: word.hebrew,
          translation: word.english,
          options,
        };
      });

      setQuestions(gameQuestions);
      setIsLoading(false);
      setIsGameActive(true);
    } catch (error) {
      console.error("Error fetching words:", error);
      toast({
        title: "Error",
        description: "Failed to load words. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAnswer = () => {
    if (!selectedAnswer) {
      toast({
        title: "Please select an answer",
        variant: "destructive",
      });
      return;
    }

    const isCorrect = selectedAnswer === questions[currentQuestion].translation;
    setScore((prev) => ({
      correct: isCorrect ? prev.correct + 1 : prev.correct,
      total: prev.total + 1,
    }));

    toast({
      title: isCorrect ? "Correct!" : "Incorrect",
      description: isCorrect
        ? "Great job!"
        : `The correct answer was: ${questions[currentQuestion].translation}`,
      variant: isCorrect ? "default" : "destructive",
    });

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
      setSelectedAnswer("");
    } else {
      setIsGameActive(false);
      toast({
        title: "Quiz completed!",
        description: `You scored ${score.correct + (isCorrect ? 1 : 0)} out of ${
          questions.length
        }`,
      });
    }
  };

  const handlePlayAudio = async () => {
    try {
      await playAudio(questions[currentQuestion].word);
    } catch (error) {
      console.error("Error playing audio:", error);
      toast({
        title: "Error playing audio",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setSelectedAnswer("");
    setScore({ correct: 0, total: 0 });
    setTimeLeft(GAME_TIME);
    setIsGameActive(true);
    fetchWords();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white p-8 pt-24">
        <div className="max-w-2xl mx-auto text-center">
          Loading questions...
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-white p-8 pt-24">
        <div className="max-w-2xl mx-auto text-center">
          <p>No questions available. Please try again later.</p>
          <Button onClick={fetchWords} className="mt-4">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Header1 />
      <div className="min-h-screen bg-white p-8 pt-24">
        <div className="max-w-2xl mx-auto space-y-8">
          <div className="flex justify-between items-center">
            <ScoreDisplay correct={score.correct} total={score.total} />
            <GameTimer timeLeft={timeLeft} />
          </div>
          <ProgressBar current={currentQuestion + 1} total={questions.length} />

          <Card>
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-center">
                  {questions[currentQuestion].word}
                </h2>
                <AudioButton
                  isPlaying={isPlaying}
                  onToggle={handlePlayAudio}
                  disabled={isPlaying}
                />
              </div>

              <RadioGroup
                value={selectedAnswer}
                onValueChange={setSelectedAnswer}
                className="space-y-4"
              >
                {questions[currentQuestion].options.map((option) => (
                  <div
                    key={option}
                    className="flex items-center space-x-2 border rounded-lg p-4 hover:bg-accent cursor-pointer"
                    onClick={() => setSelectedAnswer(option)}
                  >
                    <RadioGroupItem value={option} id={option} />
                    <label
                      htmlFor={option}
                      className="text-lg cursor-pointer flex-grow"
                    >
                      {option}
                    </label>
                  </div>
                ))}
              </RadioGroup>

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={resetQuiz}>
                  Reset Quiz
                </Button>
                <Button onClick={handleAnswer} disabled={!isGameActive}>
                  {currentQuestion === questions.length - 1
                    ? "Finish Quiz"
                    : "Next Question"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default MultipleChoice;