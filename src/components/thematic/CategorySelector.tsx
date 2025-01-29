import { Button } from "@/components/ui/button";

interface Category {
  name: string;
  words: Array<{
    hebrew: string;
    english: string;
    transliteration?: string | null;
  }>;
}

interface CategorySelectorProps {
  categories: Category[];
  activeCategory: number;
  onSelect: (idx: number) => void;
}

export const CategorySelector = ({ 
  categories, 
  activeCategory, 
  onSelect 
}: CategorySelectorProps) => {
  return (
    <div className="flex overflow-x-auto gap-2 p-2 mb-6">
      {categories.map((category, idx) => (
        <Button
          key={category.name}
          variant={activeCategory === idx ? "default" : "outline"}
          onClick={() => onSelect(idx)}
          className={`whitespace-nowrap ${
            activeCategory === idx 
              ? 'bg-gradient-to-r from-vividPurple to-magentaPink text-white' 
              : 'hover:bg-softPurple/20'
          }`}
        >
          {category.name} 🏷️
        </Button>
      ))}
    </div>
  );
};