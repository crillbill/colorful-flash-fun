import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Header1 } from "@/components/ui/header";
import { Smile, Puzzle, BookOpen, Search, Brain, PenTool, ListChecks, Mic, Grid3X3, Type, Book } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Header1>Learn Hebrew</Header1>
        </div>
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link to="/greetings" className="transform transition-all duration-300 hover:scale-105">
              <Button variant="ghost" className="w-full h-32 text-xl bg-[#6B46C1] hover:bg-[#6B46C1]/90 text-white shadow-lg hover:shadow-xl">
                <Smile className="w-6 h-6 mr-2" />
                Greetings
              </Button>
            </Link>

            <Link to="/letter-matching" className="transform transition-all duration-300 hover:scale-105">
              <Button variant="ghost" className="w-full h-32 text-xl bg-[#8B5CF6] hover:bg-[#8B5CF6]/90 text-white shadow-lg hover:shadow-xl">
                <Puzzle className="w-6 h-6 mr-2" />
                Letter Matching
              </Button>
            </Link>

            <Link to="/flashcards" className="transform transition-all duration-300 hover:scale-105">
              <Button variant="ghost" className="w-full h-32 text-xl bg-[#D946EF] hover:bg-[#D946EF]/90 text-white shadow-lg hover:shadow-xl">
                <BookOpen className="w-6 h-6 mr-2" />
                Flashcards
              </Button>
            </Link>

            <Link to="/word-search" className="transform transition-all duration-300 hover:scale-105">
              <Button variant="ghost" className="w-full h-32 text-xl bg-[#EC4899] hover:bg-[#EC4899]/90 text-white shadow-lg hover:shadow-xl">
                <Search className="w-6 h-6 mr-2" />
                Word Search
              </Button>
            </Link>

            <Link to="/hangman" className="transform transition-all duration-300 hover:scale-105">
              <Button variant="ghost" className="w-full h-32 text-xl bg-[#F43F5E] hover:bg-[#F43F5E]/90 text-white shadow-lg hover:shadow-xl">
                <Brain className="w-6 h-6 mr-2" />
                Hangman
              </Button>
            </Link>

            <Link to="/sentence-builder" className="transform transition-all duration-300 hover:scale-105">
              <Button variant="ghost" className="w-full h-32 text-xl bg-[#F97316] hover:bg-[#F97316]/90 text-white shadow-lg hover:shadow-xl">
                <PenTool className="w-6 h-6 mr-2" />
                Sentence Builder
              </Button>
            </Link>

            <Link to="/multiple-choice" className="transform transition-all duration-300 hover:scale-105">
              <Button variant="ghost" className="w-full h-32 text-xl bg-[#84CC16] hover:bg-[#84CC16]/90 text-white shadow-lg hover:shadow-xl">
                <ListChecks className="w-6 h-6 mr-2" />
                Multiple Choice
              </Button>
            </Link>

            <Link to="/pronunciation" className="transform transition-all duration-300 hover:scale-105">
              <Button variant="ghost" className="w-full h-32 text-xl bg-[#10B981] hover:bg-[#10B981]/90 text-white shadow-lg hover:shadow-xl">
                <Mic className="w-6 h-6 mr-2" />
                Pronunciation
              </Button>
            </Link>

            <Link to="/memory-game" className="transform transition-all duration-300 hover:scale-105">
              <Button variant="ghost" className="w-full h-32 text-xl bg-[#06B6D4] hover:bg-[#06B6D4]/90 text-white shadow-lg hover:shadow-xl">
                <Grid3X3 className="w-6 h-6 mr-2" />
                Memory Game
              </Button>
            </Link>

            <Link to="/fill-in-the-blank" className="transform transition-all duration-300 hover:scale-105">
              <Button variant="ghost" className="w-full h-32 text-xl bg-[#0EA5E9] hover:bg-[#0EA5E9]/90 text-white shadow-lg hover:shadow-xl">
                <Type className="w-6 h-6 mr-2" />
                Fill in the Blank
              </Button>
            </Link>

            <Link to="/dictionary" className="transform transition-all duration-300 hover:scale-105">
              <Button variant="ghost" className="w-full h-32 text-xl bg-[#8B5CF6] hover:bg-[#8B5CF6]/90 text-white shadow-lg hover:shadow-xl">
                <Book className="w-6 h-6 mr-2" />
                Dictionary
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;