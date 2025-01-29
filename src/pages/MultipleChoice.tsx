import { useState, useEffect } from "react";
import { Header1 } from "@/components/ui/header";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { MultipleChoiceLeaderboard } from "@/components/MultipleChoiceLeaderboard";
import { QuestionCard } from "@/components/multiple-choice/QuestionCard";
import { GameControls } from "@/components/multiple-choice/GameControls";
import { GameStats } from "@/components/multiple-choice/GameStats";
import { Question } from "@/components/multiple-choice/types";

const GAME_TIME = 120; // 2 minutes in seconds

const MultipleChoice = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(GAME_TIME);
  const [isGameActive, setIsGameActive] = useState(false);
  const { toast } = useToast();

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

  const handleTimeUp = async () => {
    setIsGameActive(false);
    const finalScore = score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0;
    
    try {
      const { error } = await supabase
        .from('multiple_choice_scores')
        .insert({
          score: finalScore,
          time_taken: GAME_TIME - timeLeft,
          user_id: (await supabase.auth.getUser()).data.user?.id
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error saving score:', error);
    }

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

      const shuffledWords = words.sort(() => Math.random() - 0.5);
      const gameQuestions = shuffledWords.slice(0, 5).map((word) => {
        const incorrectOptions = shuffledWords
          .filter((w) => w.english !== word.english)
          .slice(0, 3)
          .map((w) => w.english);

        return {
          word: word.hebrew,
          translation: word.english,
          options: [...incorrectOptions, word.english].sort(() => Math.random() - 0.5),
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

  const handleAnswer = async () => {
    if (!selectedAnswer) {
      toast({
        title: "Please select an answer",
        variant: "destructive",
      });
      return;
    }

    const isCorrect = selectedAnswer === questions[currentQuestion].translation;
    const newScore = {
      correct: isCorrect ? score.correct + 1 : score.correct,
      total: score.total + 1,
    };
    setScore(newScore);

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
      const finalScore = Math.round((newScore.correct / questions.length) * 100);
      
      try {
        const { error } = await supabase
          .from('multiple_choice_scores')
          .insert({
            score: finalScore,
            time_taken: GAME_TIME - timeLeft,
            user_id: (await supabase.auth.getUser()).data.user?.id
          });

        if (error) throw error;
      } catch (error) {
        console.error('Error saving score:', error);
      }

      toast({
        title: "Quiz completed!",
        description: `You scored ${newScore.correct} out of ${questions.length}`,
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
      <div className="min-h-screen bg-white p-4 pt-20">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <div className="space-y-3">
              <GameStats correct={score.correct} total={score.total} />
              <GameControls
                timeLeft={timeLeft}
                currentQuestion={currentQuestion}
                totalQuestions={questions.length}
              />
              <QuestionCard
                currentQuestion={questions[currentQuestion]}
                selectedAnswer={selectedAnswer}
                setSelectedAnswer={setSelectedAnswer}
                onAnswer={handleAnswer}
                onReset={resetQuiz}
                isGameActive={isGameActive}
                isLastQuestion={currentQuestion === questions.length - 1}
              />
            </div>
          </div>
          <div className="md:col-span-1">
            <MultipleChoiceLeaderboard />
          </div>
        </div>
      </div>
    </>
  );
};

export default MultipleChoice;