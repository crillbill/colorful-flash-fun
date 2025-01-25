import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Smile, Puzzle, Library, Search, Skull, ListChecks, GripHorizontal } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E5DEFF] to-[#FDE1D3] p-8">
      <div className="max-w-2xl mx-auto space-y-12">
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-[#9b87f5] to-[#F97316] text-transparent bg-clip-text">
            Learn Hebrew
          </h1>
          <p className="text-lg text-gray-600">Choose your learning adventure</p>
        </div>
        
        <div className="grid gap-6">
          <Link to="/greetings" className="transform transition-transform hover:scale-105">
            <Button 
              className="w-full h-20 text-lg bg-gradient-to-r from-[#FEC6A1] to-[#F97316] hover:from-[#F97316] hover:to-[#FEC6A1] border-none shadow-lg"
            >
              <Smile className="mr-3 h-8 w-8" />
              Practice Greetings
            </Button>
          </Link>
          
          <Link to="/letter-matching" className="transform transition-transform hover:scale-105">
            <Button 
              className="w-full h-20 text-lg bg-gradient-to-r from-[#9b87f5] to-[#E5DEFF] hover:from-[#E5DEFF] hover:to-[#9b87f5] border-none shadow-lg"
            >
              <Puzzle className="mr-3 h-8 w-8" />
              Letter Matching Game
            </Button>
          </Link>
          
          <Link to="/flashcards" className="transform transition-transform hover:scale-105">
            <Button 
              className="w-full h-20 text-lg bg-gradient-to-r from-[#F2FCE2] to-[#c1c161] hover:from-[#c1c161] hover:to-[#F2FCE2] border-none shadow-lg"
            >
              <Library className="mr-3 h-8 w-8" />
              Flashcards
            </Button>
          </Link>
          
          <Link to="/word-search" className="transform transition-transform hover:scale-105">
            <Button 
              className="w-full h-20 text-lg bg-gradient-to-r from-[#D3E4FD] to-[#0EA5E9] hover:from-[#0EA5E9] hover:to-[#D3E4FD] border-none shadow-lg"
            >
              <Search className="mr-3 h-8 w-8" />
              Word Search
            </Button>
          </Link>
          
          <Link to="/hangman" className="transform transition-transform hover:scale-105">
            <Button 
              className="w-full h-20 text-lg bg-gradient-to-r from-[#FFDEE2] to-[#d299c2] hover:from-[#d299c2] hover:to-[#FFDEE2] border-none shadow-lg"
            >
              <Skull className="mr-3 h-8 w-8" />
              Hangman
            </Button>
          </Link>
          
          <Link to="/multiple-choice" className="transform transition-transform hover:scale-105">
            <Button 
              className="w-full h-20 text-lg bg-gradient-to-r from-[#FEF7CD] to-[#e6b980] hover:from-[#e6b980] hover:to-[#FEF7CD] border-none shadow-lg"
            >
              <ListChecks className="mr-3 h-8 w-8" />
              Multiple Choice Quiz
            </Button>
          </Link>
          
          <Link to="/sentence-builder" className="transform transition-transform hover:scale-105">
            <Button 
              className="w-full h-20 text-lg bg-gradient-to-r from-[#accbee] to-[#e7f0fd] hover:from-[#e7f0fd] hover:to-[#accbee] border-none shadow-lg"
            >
              <GripHorizontal className="mr-3 h-8 w-8" />
              Sentence Builder
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Index;