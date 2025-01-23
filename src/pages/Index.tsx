import { useState } from "react";
import { FlashCard } from "@/components/FlashCard";
import { ProgressBar } from "@/components/ProgressBar";
import { ScoreDisplay } from "@/components/ScoreDisplay";
import { toast } from "sonner";

const flashcards = [
  { question: "What is the capital of France?", answer: "Paris" },
  { question: "What is 2 + 2?", answer: "4" },
  { question: "What planet is known as the Red Planet?", answer: "Mars" },
  { question: "What is the largest mammal?", answer: "Blue Whale" },
  { question: "Who painted the Mona Lisa?", answer: "Leonardo da Vinci" },
];

const Index = () => {
  const [currentCard, setCurrentCard] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [totalAnswered, setTotalAnswered] = useState(0);

  const handleNext = () => {
    if (currentCard === flashcards.length - 1) {
      toast("Congratulations! You've completed all cards!");
      setCurrentCard(0);
    } else {
      setCurrentCard(currentCard + 1);
    }
  };

  const handleCorrect = () => {
    setCorrectAnswers(correctAnswers + 1);
    setTotalAnswered(totalAnswered + 1);
    toast.success("Correct! Well done!");
  };

  const handleIncorrect = () => {
    setTotalAnswered(totalAnswered + 1);
    toast.error("Incorrect. Keep trying!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-accent to-background p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold text-center text-primary mb-8">
          Flash Cards
        </h1>
        
        <ScoreDisplay correct={correctAnswers} total={totalAnswered} />
        <ProgressBar current={currentCard + 1} total={flashcards.length} />
        
        <FlashCard
          question={flashcards[currentCard].question}
          answer={flashcards[currentCard].answer}
          onNext={handleNext}
          onCorrect={handleCorrect}
          onIncorrect={handleIncorrect}
        />
      </div>
    </div>
  );
};

export default Index;