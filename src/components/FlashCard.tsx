import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";

interface FlashCardProps {
  question: string;
  answer: string;
  onNext: () => void;
  onCorrect: () => void;
  onIncorrect: () => void;
}

export const FlashCard = ({
  question,
  answer,
  onNext,
  onCorrect,
  onIncorrect,
}: FlashCardProps) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleAnswer = (correct: boolean) => {
    if (correct) {
      onCorrect();
    } else {
      onIncorrect();
    }
    setIsFlipped(false);
    onNext();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full max-w-md mx-auto"
    >
      <div
        className={`flip-card h-64 w-full cursor-pointer ${
          isFlipped ? "flipped" : ""
        }`}
        onClick={handleFlip}
      >
        <div className="flip-card-inner">
          <Card className="flip-card-front p-6 flex items-center justify-center bg-gradient-to-br from-primary/90 to-primary text-primary-foreground">
            <h2 className="text-2xl font-bold text-center">{question}</h2>
          </Card>
          <Card className="flip-card-back p-6 flex flex-col items-center justify-between bg-accent">
            <h3 className="text-xl font-semibold text-center">{answer}</h3>
            <div className="flex gap-4">
              <Button
                variant="destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  handleAnswer(false);
                }}
              >
                Incorrect
              </Button>
              <Button
                variant="default"
                onClick={(e) => {
                  e.stopPropagation();
                  handleAnswer(true);
                }}
              >
                Correct
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </motion.div>
  );
};