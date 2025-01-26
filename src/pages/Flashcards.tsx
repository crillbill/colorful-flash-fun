import { useState } from "react";
import FlashCard from "@/components/FlashCard";
import { ScoreDisplay } from "@/components/ScoreDisplay";
import { ProgressBar } from "@/components/ProgressBar";
import { Header1 } from "@/components/ui/header";
import { useColors } from "@/contexts/ColorContext";
import { Button } from "@/components/ui/button";

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
    setCurrentCardIndex(0);
    setCorrectAnswers(0);
    setTotalAnswered(0);
  };

  const isGameComplete = currentCardIndex === flashcardsData.length - 1 && totalAnswered === flashcardsData.length;

  return (
    <>
      <Header1 />
      <div className="min-h-screen bg-white p-8 pt-24">
        <div className="max-w-2xl mx-auto space-y-8">
          <ScoreDisplay correct={correctAnswers} total={totalAnswered} />
          <ProgressBar current={currentCardIndex + 1} total={flashcardsData.length} />

          {!isGameComplete ? (
            <FlashCard
              question={flashcardsData[currentCardIndex].question}
              answer={flashcardsData[currentCardIndex].answer}
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
                Play Again
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Flashcards;