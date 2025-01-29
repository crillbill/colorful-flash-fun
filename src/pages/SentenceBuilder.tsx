import React, { useState, useEffect } from "react";
import { Header1 } from "@/components/ui/header";
import { useToast } from "@/hooks/use-toast";
import { ProgressBar } from "@/components/ProgressBar";
import { ScoreDisplay } from "@/components/ScoreDisplay";
import { GameTimer } from "@/components/GameTimer";
import { SentenceBuilderLeaderboard } from "@/components/SentenceBuilderLeaderboard";
import { supabase } from "@/integrations/supabase/client";
import { GameArea } from "@/components/sentence-builder/GameArea";
import { Leaf, Trophy } from "lucide-react";

interface Word {
  id: string;
  content: string;
}

interface Sentence {
  words: Word[];
  correctOrder: string[];
  translation: string;
  hint?: string;
}

const sentences: Sentence[] = [
  {
    words: [
      { id: "1", content: "אני" },
      { id: "2", content: "אוהב" },
      { id: "3", content: "גלידה" },
    ],
    correctOrder: ["אני", "אוהב", "גלידה"],
    translation: "I love ice cream",
    hint: "Start with the subject (I)",
  },
  {
    words: [
      { id: "1", content: "הילד" },
      { id: "2", content: "משחק" },
      { id: "3", content: "בגן" },
    ],
    correctOrder: ["הילד", "משחק", "בגן"],
    translation: "The child plays in the garden",
    hint: "Start with 'the child'",
  },
  {
    words: [
      { id: "1", content: "היא" },
      { id: "2", content: "לומדת" },
      { id: "3", content: "עברית" },
    ],
    correctOrder: ["היא", "לומדת", "עברית"],
    translation: "She studies Hebrew",
    hint: "Start with the subject (she)",
  },
];

const SentenceBuilder = () => {
  const { toast } = useToast();
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
  const [words, setWords] = useState(sentences[0].words);
  const [showHint, setShowHint] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isGameComplete, setIsGameComplete] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (gameStarted && !isGameComplete) {
      timer = setInterval(() => {
        setTimeElapsed((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [gameStarted, isGameComplete]);

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    if (!gameStarted) setGameStarted(true);

    const items = Array.from(words);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setWords(items);
  };

  const checkSentence = async () => {
    if (!gameStarted) setGameStarted(true);
    
    const currentSentence = sentences[currentSentenceIndex];
    const currentOrder = words.map((word) => word.content);
    const isCorrect = currentOrder.every(
      (word, index) => word === currentSentence.correctOrder[index]
    );

    if (isCorrect) {
      const newScore = { 
        correct: score.correct + 1, 
        total: score.total + 1 
      };
      setScore(newScore);

      if (newScore.correct === sentences.length) {
        setIsGameComplete(true);
        const user = (await supabase.auth.getUser()).data.user;
        if (user) {
          const { error } = await supabase
            .from('sentence_builder_scores')
            .insert({
              user_id: user.id,
              score: 100,
              time_taken: timeElapsed
            });
          
          if (error) {
            console.error('Error saving score:', error);
            toast({
              variant: "destructive",
              title: "Error",
              description: "Failed to save score"
            });
          } else {
            toast({
              title: "🎉 Success!",
              description: "Game complete! Score saved."
            });
          }
        }
      } else {
        toast({
          title: "✨ Correct!",
          description: `Great job! "${currentSentence.translation}"`,
        });
        nextSentence();
      }
    } else {
      toast({
        variant: "destructive",
        title: "❌ Try again",
        description: "The word order is not correct.",
      });
      setScore((prev) => ({ ...prev, total: prev.total + 1 }));
    }
  };

  const nextSentence = () => {
    const nextIndex = (currentSentenceIndex + 1) % sentences.length;
    setCurrentSentenceIndex(nextIndex);
    setWords(sentences[nextIndex].words);
    setShowHint(false);
  };

  const resetGame = () => {
    setCurrentSentenceIndex(0);
    setWords(sentences[0].words);
    setShowHint(false);
    setScore({ correct: 0, total: 0 });
    setTimeElapsed(0);
    setIsGameComplete(false);
    setGameStarted(false);
  };

  return (
    <>
      <Header1 />
      <div className="min-h-screen bg-gradient-to-br from-softOrange to-brightOrange p-8 pt-24">
        <div className="max-w-2xl mx-auto space-y-8">
          <div className="flex justify-between items-center bg-white/80 p-4 rounded-lg shadow-md">
            <ScoreDisplay 
              correct={score.correct} 
              total={score.total} 
              totalWords={sentences.length} 
            />
            <GameTimer timeLeft={timeElapsed} />
          </div>

          <ProgressBar
            current={currentSentenceIndex + 1}
            total={sentences.length}
          />

          {isGameComplete ? (
            <div className="bg-white/90 p-6 rounded-xl shadow-lg">
              <div className="flex items-center gap-2 mb-4">
                <Trophy className="w-6 h-6 text-vividPurple" />
                <h2 className="text-2xl font-bold text-primaryPurple">Sentence Champions 🏆</h2>
              </div>
              <SentenceBuilderLeaderboard />
            </div>
          ) : (
            <GameArea
              currentSentence={sentences[currentSentenceIndex]}
              words={words}
              showHint={showHint}
              onDragEnd={handleDragEnd}
              onCheck={checkSentence}
              onShowHint={() => setShowHint(true)}
              onReset={resetGame}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default SentenceBuilder;