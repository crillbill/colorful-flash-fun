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
          className="bg-brightOrange text-white p-3 rounded-md cursor-move hover:bg-orange-600 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-1"
        >
          {word.content}
        </div>
      )}
    </Draggable>
  );
};