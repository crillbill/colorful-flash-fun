import { useState } from "react";
import FlashCard from "@/components/FlashCard";
import { ScoreDisplay } from "@/components/ScoreDisplay";
import { ProgressBar } from "@/components/ProgressBar";
import { Button } from "@/components/ui/button";
import { Undo2 } from "lucide-react";
import { Link } from "react-router-dom";

const flashcardsData = [
  { question: "כלב", answer: "Dog" },
  { question: "חתול", answer: "Cat" },
  { question: "בית", answer: "House" },
  { question: "שלום", answer: "Hello/Peace" },
  { question: "מה שלומך היום", answer: "How are you today?" },
  { question: "מתי ארוחת צהריים", answer: "When is lunch?" },
];

const Flashcards = () => {
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
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <Link to="/">
            <Button variant="outline" size="icon">
              <Undo2 className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-4xl font-bold text-center">Hebrew Flashcards</h1>
          <div className="w-10" /> {/* Spacer for alignment */}
        </div>

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