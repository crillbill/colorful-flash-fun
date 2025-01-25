import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Smile, Puzzle, Cards } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-accent to-background p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold text-center mb-8">Learn Hebrew</h1>
        <div className="grid gap-4">
          <Link to="/greetings">
            <Button className="w-full h-16 text-lg" variant="outline">
              <Smile className="mr-2 h-6 w-6" />
              Practice Greetings
            </Button>
          </Link>
          <Link to="/letter-matching">
            <Button className="w-full h-16 text-lg" variant="outline">
              <Puzzle className="mr-2 h-6 w-6" />
              Letter Matching Game
            </Button>
          </Link>
          <Link to="/flashcards">
            <Button className="w-full h-16 text-lg" variant="outline">
              <Cards className="mr-2 h-6 w-6" />
              Flashcards
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Index;