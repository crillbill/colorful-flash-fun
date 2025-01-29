import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup } from "@/components/ui/radio-group";
import { Question } from "./types";

interface QuestionCardProps {
  currentQuestion: Question;
  selectedAnswer: string;
  setSelectedAnswer: (answer: string) => void;
  onAnswer: () => void;
  onReset: () => void;
  isGameActive: boolean;
  isLastQuestion: boolean;
}

export const QuestionCard = ({
  currentQuestion,
  selectedAnswer,
  setSelectedAnswer,
  onAnswer,
  onReset,
  isGameActive,
  isLastQuestion,
}: QuestionCardProps) => {
  return (
    <Card className="shadow-sm">
      <CardContent className="p-4">
        <div className="mb-2">
          <h2 className="text-lg font-semibold">
            {currentQuestion?.word}
          </h2>
        </div>

        <RadioGroup
          value={selectedAnswer}
          onValueChange={setSelectedAnswer}
          className="space-y-2"
        >
          {currentQuestion?.options.map((option) => (
            <div
              key={option}
              className="flex items-center space-x-2 border rounded-md p-2 hover:bg-accent cursor-pointer"
              onClick={() => setSelectedAnswer(option)}
            >
              <input
                type="radio"
                value={option}
                checked={selectedAnswer === option}
                onChange={() => setSelectedAnswer(option)}
                className="text-primary"
              />
              <label className="text-sm cursor-pointer flex-grow">
                {option}
              </label>
            </div>
          ))}
        </RadioGroup>

        <div className="flex justify-between mt-3 pt-2 border-t">
          <Button variant="outline" onClick={onReset} size="sm">
            Reset Quiz
          </Button>
          <Button onClick={onAnswer} disabled={!isGameActive} size="sm">
            {isLastQuestion ? "Finish Quiz" : "Next Question"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};