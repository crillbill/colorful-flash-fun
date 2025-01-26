import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Header1 } from "@/components/ui/header";
import { Smile, Puzzle, BookOpen, Search, Brain, PenTool, ListChecks, Mic, Grid3X3 } from "lucide-react";

const Index = () => {
  return (
    <>
      <Header1 />
      <div className="min-h-screen bg-gradient-to-br from-softPurple via-white to-softPeach p-8 pt-24">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold gradient-text animate-float">
              Learn Hebrew
            </h1>
            <p className="text-xl text-muted-foreground">
              Choose your learning adventure
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link to="/greetings" className="transform transition-all duration-300 hover:scale-105">
              <Button className="w-full h-32 text-xl bg-[#F97316] hover:bg-[#F97316]/90 text-white shadow-lg hover:shadow-xl flex gap-2">
                <Smile className="w-6 h-6" />
                Practice Greetings
              </Button>
            </Link>
            
            <Link to="/letter-matching" className="transform transition-all duration-300 hover:scale-105">
              <Button className="w-full h-32 text-xl bg-[#8B5CF6] hover:bg-[#8B5CF6]/90 text-white shadow-lg hover:shadow-xl flex gap-2">
                <Puzzle className="w-6 h-6" />
                Letter Matching Game
              </Button>
            </Link>
            
            <Link to="/flashcards" className="transform transition-all duration-300 hover:scale-105">
              <Button className="w-full h-32 text-xl bg-[#22C55E] hover:bg-[#22C55E]/90 text-white shadow-lg hover:shadow-xl flex gap-2">
                <BookOpen className="w-6 h-6" />
                Flashcards
              </Button>
            </Link>
            
            <Link to="/word-search" className="transform transition-all duration-300 hover:scale-105">
              <Button className="w-full h-32 text-xl bg-[#0EA5E9] hover:bg-[#0EA5E9]/90 text-white shadow-lg hover:shadow-xl flex gap-2">
                <Search className="w-6 h-6" />
                Word Search
              </Button>
            </Link>
            
            <Link to="/hangman" className="transform transition-all duration-300 hover:scale-105">
              <Button className="w-full h-32 text-xl bg-[#D946EF] hover:bg-[#D946EF]/90 text-white shadow-lg hover:shadow-xl flex gap-2">
                <Brain className="w-6 h-6" />
                Hangman
              </Button>
            </Link>
            
            <Link to="/sentence-builder" className="transform transition-all duration-300 hover:scale-105">
              <Button className="w-full h-32 text-xl bg-[#6366F1] hover:bg-[#6366F1]/90 text-white shadow-lg hover:shadow-xl flex gap-2">
                <PenTool className="w-6 h-6" />
                Sentence Builder
              </Button>
            </Link>
            
            <Link to="/multiple-choice" className="transform transition-all duration-300 hover:scale-105">
              <Button className="w-full h-32 text-xl bg-[#EC4899] hover:bg-[#EC4899]/90 text-white shadow-lg hover:shadow-xl flex gap-2">
                <ListChecks className="w-6 h-6" />
                Multiple Choice
              </Button>
            </Link>
            
            <Link to="/pronunciation" className="transform transition-all duration-300 hover:scale-105">
              <Button className="w-full h-32 text-xl bg-[#F59E0B] hover:bg-[#F59E0B]/90 text-white shadow-lg hover:shadow-xl flex gap-2">
                <Mic className="w-6 h-6" />
                Pronunciation Challenge
              </Button>
            </Link>

            <Link to="/memory-game" className="transform transition-all duration-300 hover:scale-105">
              <Button className="w-full h-32 text-xl bg-[#14B8A6] hover:bg-[#14B8A6]/90 text-white shadow-lg hover:shadow-xl flex gap-2">
                <Grid3X3 className="w-6 h-6" />
                Memory Game
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default Index;