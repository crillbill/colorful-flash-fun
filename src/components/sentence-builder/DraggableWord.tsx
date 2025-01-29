import { Draggable } from "react-beautiful-dnd";

interface Word {
  id: string;
  content: string;
}

interface DraggableWordProps {
  word: Word;
  index: number;
}

export const DraggableWord = ({ word, index }: DraggableWordProps) => {
  return (
    <Draggable key={word.id} draggableId={word.id} index={index}>
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
  );
};