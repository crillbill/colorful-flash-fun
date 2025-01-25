import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { AudioButton } from "@/components/AudioButton";
import { ProgressBar } from "@/components/ProgressBar";
import { ScoreDisplay } from "@/components/ScoreDisplay";
import { useToast } from "@/hooks/use-toast";
import { Header1 } from "@/components/ui/header";
import { useColors } from "@/contexts/ColorContext";

interface Question {
  word: string;
  translation: string;
  options: string[];
}

const questions: Question[] = [
  {
    word: "ספר",
    translation: "Book",
    options: ["Book", "Tree", "Water", "Car"],
  },
  {
    word: "עץ",
    translation: "Tree",
    options: ["Book", "Tree", "House", "Dog"],
  },
  {
    word: "בית",
    translation: "House",
    options: ["Car", "Tree", "House", "Water"],
  },
  {
    word: "מים",
    translation: "Water",
    options: ["Book", "Water", "Car", "Tree"],
  },
  {
    word: "כלב",
    translation: "Dog",
    options: ["Cat", "Dog", "House", "Book"],
  },
];

const MultipleChoice = () => {
  const colors = useColors();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [isPlaying, setIsPlaying] = useState(false);
  const { toast } = useToast();

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
      toast({
        title: "Quiz completed!",
        description: `You scored ${score.correct + (isCorrect ? 1 : 0)} out of ${
          questions.length
        }`,
      });
    }
  };

  const playAudio = async () => {
    try {
      setIsPlaying(true);
      const { data, error } = await supabase.functions.invoke("text-to-speech", {
        body: { text: questions[currentQuestion].word },
      });

      if (error) throw error;

      const audio = new Audio(`data:audio/mp3;base64,${data.audioContent}`);
      audio.onended = () => setIsPlaying(false);
      await audio.play();
    } catch (error) {
      console.error("Error playing audio:", error);
      setIsPlaying(false);
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
  };

  return (
    <>
      <Header1 />
      <div className="min-h-screen bg-white p-8 pt-24">
        <div className="max-w-2xl mx-auto space-y-8">
          <ScoreDisplay correct={score.correct} total={score.total} />
          <ProgressBar current={currentQuestion + 1} total={questions.length} />

          <Card>
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-center">
                  {questions[currentQuestion].word}
                </h2>
                <AudioButton
                  isPlaying={isPlaying}
                  onToggle={playAudio}
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
                <Button onClick={handleAnswer}>
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
