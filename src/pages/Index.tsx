import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Header1 } from "@/components/ui/header";
import { Smile, Puzzle, BookOpen, Search, Brain, PenTool, ListChecks, Mic, Grid3X3, Type, Book } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200">
      <div className="container mx-auto px-4 py-8">
        <Header1 className="text-center mb-12">Learn Hebrew</Header1>
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link to="/greetings" className="transform transition-all duration-300 hover:scale-105">
              <Button className="w-full h-32 text-xl bg-[#6B46C1] hover:bg-[#6B46C1]/90 text-white shadow-lg hover:shadow-xl flex gap-2">
                <Smile className="w-6 h-6" />
                Greetings
              </Button>
            </Link>

            <Link to="/letter-matching" className="transform transition-all duration-300 hover:scale-105">
              <Button className="w-full h-32 text-xl bg-[#8B5CF6] hover:bg-[#8B5CF6]/90 text-white shadow-lg hover:shadow-xl flex gap-2">
                <Puzzle className="w-6 h-6" />
                Letter Matching
              </Button>
            </Link>

            <Link to="/flashcards" className="transform transition-all duration-300 hover:scale-105">
              <Button className="w-full h-32 text-xl bg-[#D946EF] hover:bg-[#D946EF]/90 text-white shadow-lg hover:shadow-xl flex gap-2">
                <BookOpen className="w-6 h-6" />
                Flashcards
              </Button>
            </Link>

            <Link to="/word-search" className="transform transition-all duration-300 hover:scale-105">
              <Button className="w-full h-32 text-xl bg-[#EC4899] hover:bg-[#EC4899]/90 text-white shadow-lg hover:shadow-xl flex gap-2">
                <Search className="w-6 h-6" />
                Word Search
              </Button>
            </Link>

            <Link to="/hangman" className="transform transition-all duration-300 hover:scale-105">
              <Button className="w-full h-32 text-xl bg-[#F43F5E] hover:bg-[#F43F5E]/90 text-white shadow-lg hover:shadow-xl flex gap-2">
                <Brain className="w-6 h-6" />
                Hangman
              </Button>
            </Link>

            <Link to="/sentence-builder" className="transform transition-all duration-300 hover:scale-105">
              <Button className="w-full h-32 text-xl bg-[#F97316] hover:bg-[#F97316]/90 text-white shadow-lg hover:shadow-xl flex gap-2">
                <PenTool className="w-6 h-6" />
                Sentence Builder
              </Button>
            </Link>

            <Link to="/multiple-choice" className="transform transition-all duration-300 hover:scale-105">
              <Button className="w-full h-32 text-xl bg-[#84CC16] hover:bg-[#84CC16]/90 text-white shadow-lg hover:shadow-xl flex gap-2">
                <ListChecks className="w-6 h-6" />
                Multiple Choice
              </Button>
            </Link>

            <Link to="/pronunciation" className="transform transition-all duration-300 hover:scale-105">
              <Button className="w-full h-32 text-xl bg-[#10B981] hover:bg-[#10B981]/90 text-white shadow-lg hover:shadow-xl flex gap-2">
                <Mic className="w-6 h-6" />
                Pronunciation
              </Button>
            </Link>

            <Link to="/memory-game" className="transform transition-all duration-300 hover:scale-105">
              <Button className="w-full h-32 text-xl bg-[#06B6D4] hover:bg-[#06B6D4]/90 text-white shadow-lg hover:shadow-xl flex gap-2">
                <Grid3X3 className="w-6 h-6" />
                Memory Game
              </Button>
            </Link>

            <Link to="/fill-in-the-blank" className="transform transition-all duration-300 hover:scale-105">
              <Button className="w-full h-32 text-xl bg-[#0EA5E9] hover:bg-[#0EA5E9]/90 text-white shadow-lg hover:shadow-xl flex gap-2">
                <Type className="w-6 h-6" />
                Fill in the Blank
              </Button>
            </Link>

            <Link to="/dictionary" className="transform transition-all duration-300 hover:scale-105">
              <Button className="w-full h-32 text-xl bg-[#8B5CF6] hover:bg-[#8B5CF6]/90 text-white shadow-lg hover:shadow-xl flex gap-2">
                <Book className="w-6 h-6" />
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