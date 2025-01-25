import { useState } from "react";
import FlashCard from "@/components/FlashCard";
import { ScoreDisplay } from "@/components/ScoreDisplay";
import { ProgressBar } from "@/components/ProgressBar";
import { Button } from "@/components/ui/button";
import { Undo2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useColors } from "@/contexts/ColorContext";

const flashcardsData = [
  { question: "כלב", answer: "Dog" },
  { question: "חתול", answer: "Cat" },
  { question: "בית", answer: "House" },
  { question: "שלום", answer: "Hello/Peace" },
  { question: "מה שלומך היום", answer: "How are you today?" },
  { question: "מתי ארוחת צהריים", answer: "When is lunch?" },
];

const Flashcards = () => {
  const colors = useColors();
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [totalAnswered, setTotalAnswered] = useState(0);

  const handleNext = () => {
    if (currentCardIndex < flashcardsData.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
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
    setCurrentCardIndex(0);
    setCorrectAnswers(0);
    setTotalAnswered(0);
  };

  const isGameComplete = currentCardIndex === flashcardsData.length - 1 && totalAnswered === flashcardsData.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-accent to-background p-8">
      <div className="fixed top-0 left-0 right-0 h-24 bg-darkCharcoal z-50 flex items-center justify-between px-8">
        <Link to="/">
          <Button variant="ghost" size="icon">
            <Undo2 className="h-6 w-6 text-white" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-white">Hebrew Flashcards</h1>
        <div className="w-10" /> {/* Spacer for alignment */}
      </div>

      <div className="max-w-2xl mx-auto space-y-8 pt-24">
        <ScoreDisplay correct={correctAnswers} total={totalAnswered} />
        <ProgressBar current={currentCardIndex + 1} total={flashcardsData.length} />

        {!isGameComplete ? (
          <FlashCard
            question={flashcardsData[currentCardIndex].question}
            answer={flashcardsData[currentCardIndex].answer}
            onNext={handleNext}
            onCorrect={handleCorrect}
            onIncorrect={handleIncorrect}
          />
        ) : (
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold">Game Complete!</h2>
            <p className="text-lg">
              You got {correctAnswers} out of {totalAnswered} correct!
            </p>
            <Button onClick={resetGame} size="lg">
              Play Again
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Flashcards;
