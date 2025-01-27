import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

export type Category = "phrases" | "words" | "letters" | "verbs" | "all";

interface CategorySelectorProps {
  value: Category;
  onChange: (value: Category) => void;
}

export const CategorySelector = ({ value, onChange }: CategorySelectorProps) => {
  return (
    <div className="mb-8">
      <RadioGroup
        defaultValue="phrases"
        value={value}
        onValueChange={(val) => onChange(val as Category)}
        className="flex flex-wrap gap-4"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="phrases" id="phrases" />
          <Label htmlFor="phrases">Phrases</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="words" id="words" />
          <Label htmlFor="words">Words</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="letters" id="letters" />
          <Label htmlFor="letters">Letters</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="verbs" id="verbs" />
          <Label htmlFor="verbs">Verbs</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="all" id="all" />
          <Label htmlFor="all">All</Label>
        </div>
      </RadioGroup>
    </div>
  );
};