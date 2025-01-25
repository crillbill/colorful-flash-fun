import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Smile, Puzzle, Library, Search, Skull, ListChecks, GripHorizontal } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-white p-8">
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
              className="w-full h-20 text-2xl font-bold text-white bg-[#F97316] hover:bg-[#F97316]/90 border-none shadow-lg"
            >
              <Smile className="mr-3 h-8 w-8" />
              Practice Greetings
            </Button>
          </Link>
          
          <Link to="/letter-matching" className="transform transition-transform hover:scale-105">
            <Button 
              className="w-full h-20 text-2xl font-bold text-white bg-[#8B5CF6] hover:bg-[#8B5CF6]/90 border-none shadow-lg"
            >
              <Puzzle className="mr-3 h-8 w-8" />
              Letter Matching Game
            </Button>
          </Link>
          
          <Link to="/flashcards" className="transform transition-transform hover:scale-105">
            <Button 
              className="w-full h-20 text-2xl font-bold text-white bg-[#84cc16] hover:bg-[#84cc16]/90 border-none shadow-lg"
            >
              <Library className="mr-3 h-8 w-8" />
              Flashcards
            </Button>
          </Link>
          
          <Link to="/word-search" className="transform transition-transform hover:scale-105">
            <Button 
              className="w-full h-20 text-2xl font-bold text-white bg-[#0EA5E9] hover:bg-[#0EA5E9]/90 border-none shadow-lg"
            >
              <Search className="mr-3 h-8 w-8" />
              Word Search
            </Button>
          </Link>
          
          <Link to="/hangman" className="transform transition-transform hover:scale-105">
            <Button 
              className="w-full h-20 text-2xl font-bold text-white bg-[#D946EF] hover:bg-[#D946EF]/90 border-none shadow-lg"
            >
              <Skull className="mr-3 h-8 w-8" />
              Hangman
            </Button>
          </Link>
          
          <Link to="/multiple-choice" className="transform transition-transform hover:scale-105">
            <Button 
              className="w-full h-20 text-2xl font-bold text-white bg-[#eab308] hover:bg-[#eab308]/90 border-none shadow-lg"
            >
              <ListChecks className="mr-3 h-8 w-8" />
              Multiple Choice Quiz
            </Button>
          </Link>
          
          <Link to="/sentence-builder" className="transform transition-transform hover:scale-105">
            <Button 
              className="w-full h-20 text-2xl font-bold text-white bg-[#1EAEDB] hover:bg-[#1EAEDB]/90 border-none shadow-lg"
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