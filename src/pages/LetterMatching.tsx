import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Puzzle, Shuffle } from "lucide-react";
import { useState } from "react";
import { ScoreDisplay } from "@/components/ScoreDisplay";
import { ProgressBar } from "@/components/ProgressBar";

const LetterMatching = () => {
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [currentRound, setCurrentRound] = useState(1);
  const totalRounds = 10;

  return (
    <div className="min-h-screen bg-gradient-to-br from-accent to-background p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Letter Matching Game</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <ScoreDisplay correct={score.correct} total={score.total} />
            <ProgressBar current={currentRound} total={totalRounds} />
            
            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" className="h-24 text-lg">
                <Puzzle className="mr-2 h-6 w-6" />
                Start New Game
              </Button>
              <Button variant="outline" className="h-24 text-lg">
                <Shuffle className="mr-2 h-6 w-6" />
                Shuffle Letters
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LetterMatching;