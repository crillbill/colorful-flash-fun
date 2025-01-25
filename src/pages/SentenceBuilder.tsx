import React, { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ProgressBar } from "@/components/ProgressBar";
import { ScoreDisplay } from "@/components/ScoreDisplay";
import { Undo2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useColors } from "@/contexts/ColorContext";

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
  const colors = useColors();
  const { toast } = useToast();
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
  const [words, setWords] = useState(sentences[0].words);
  const [showHint, setShowHint] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(words);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setWords(items);
  };

  const checkSentence = () => {
    const currentSentence = sentences[currentSentenceIndex];
    const currentOrder = words.map((word) => word.content);
    const isCorrect = currentOrder.every(
      (word, index) => word === currentSentence.correctOrder[index]
    );

    if (isCorrect) {
      toast({
        title: "Correct!",
        description: `Great job! "${currentSentence.translation}"`,
      });
      setScore((prev) => ({
        ...prev,
        correct: prev.correct + 1,
        total: prev.total + 1,
      }));
      nextSentence();
    } else {
      toast({
        title: "Try again",
        description: "The word order is not correct.",
        variant: "destructive",
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
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-accent to-background p-8">
      <div className="fixed top-0 left-0 right-0 h-24 bg-darkCharcoal z-50 flex items-center justify-between px-8">
        <Link to="/">
          <Button variant="ghost" size="icon">
            <Undo2 className="h-6 w-6 text-white" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-white">Sentence Builder</h1>
        <div className="w-10" /> {/* Spacer for alignment */}
      </div>

      <div className="max-w-2xl mx-auto space-y-8 pt-24">
        <ScoreDisplay correct={score.correct} total={score.total} />
        <ProgressBar
          current={currentSentenceIndex + 1}
          total={sentences.length}
        />

        <div className="bg-card p-6 rounded-lg shadow-lg space-y-6">
          <p className="text-lg text-center">
            Translation: {sentences[currentSentenceIndex].translation}
          </p>

          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="words" direction="horizontal">
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="flex flex-wrap gap-4 p-4 min-h-[100px] bg-accent/20 rounded-lg"
                >
                  {words.map((word, index) => (
                    <Draggable
                      key={word.id}
                      draggableId={word.id}
                      index={index}
                    >
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="bg-primary text-primary-foreground p-3 rounded-md cursor-move hover:opacity-80 transition-opacity"
                        >
                          {word.content}
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>

          <div className="flex flex-wrap gap-4 justify-center">
            <Button onClick={checkSentence}>Check Answer</Button>
            <Button variant="outline" onClick={() => setShowHint(true)}>
              Show Hint
            </Button>
            <Button variant="secondary" onClick={resetGame}>
              Reset Game
            </Button>
          </div>

          {showHint && (
            <p className="text-center text-muted-foreground">
              Hint: {sentences[currentSentenceIndex].hint}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SentenceBuilder;
