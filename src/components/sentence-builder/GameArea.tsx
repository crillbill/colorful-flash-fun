import { DragDropContext, Droppable } from "react-beautiful-dnd";
import { DraggableWord } from "./DraggableWord";
import { GameControls } from "./GameControls";

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

interface GameAreaProps {
  currentSentence: Sentence;
  words: Word[];
  showHint: boolean;
  onDragEnd: (result: any) => void;
  onCheck: () => void;
  onShowHint: () => void;
  onReset: () => void;
}

export const GameArea = ({
  currentSentence,
  words,
  showHint,
  onDragEnd,
  onCheck,
  onShowHint,
  onReset,
}: GameAreaProps) => {
  return (
    <div className="bg-card p-6 rounded-lg shadow-lg space-y-6">
      <p className="text-lg text-center">
        Translation: {currentSentence.translation}
      </p>

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="words" direction="horizontal">
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="flex flex-wrap gap-4 p-4 min-h-[100px] bg-accent/20 rounded-lg"
            >
              {words.map((word, index) => (
                <DraggableWord key={word.id} word={word} index={index} />
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      <GameControls
        onCheck={onCheck}
        onShowHint={onShowHint}
        onReset={onReset}
      />

      {showHint && (
        <p className="text-center text-muted-foreground">
          Hint: {currentSentence.hint}
        </p>
      )}
    </div>
  );
};