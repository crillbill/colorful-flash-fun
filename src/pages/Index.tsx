import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Header1 } from "@/components/ui/header";

const Index = () => {
  return (
    <>
      <Header1 />
      <div className="min-h-screen bg-gradient-to-br from-softPurple via-white to-softPeach p-8 pt-24">
        <div className="max-w-2xl mx-auto space-y-8">
          <h1 className="text-4xl font-bold text-center mb-12 gradient-text animate-float">
            Learn Hebrew
          </h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link to="/flashcards" className="transform transition-all duration-300 hover:scale-105">
              <Button className="w-full h-32 text-xl bg-gradient-to-r from-primaryPurple to-vividPurple hover:from-vividPurple hover:to-primaryPurple text-white shadow-lg">
                Flashcards
              </Button>
            </Link>
            
            <Link to="/multiple-choice" className="transform transition-all duration-300 hover:scale-105">
              <Button className="w-full h-32 text-xl bg-gradient-to-r from-oceanBlue to-brightBlue hover:from-brightBlue hover:to-oceanBlue text-white shadow-lg">
                Multiple Choice
              </Button>
            </Link>
            
            <Link to="/word-search" className="transform transition-all duration-300 hover:scale-105">
              <Button className="w-full h-32 text-xl bg-gradient-to-r from-magentaPink to-brightOrange hover:from-brightOrange hover:to-magentaPink text-white shadow-lg">
                Word Search
              </Button>
            </Link>
            
            <Link to="/letter-matching" className="transform transition-all duration-300 hover:scale-105">
              <Button className="w-full h-32 text-xl bg-gradient-to-r from-vividPurple to-oceanBlue hover:from-oceanBlue hover:to-vividPurple text-white shadow-lg">
                Letter Matching
              </Button>
            </Link>
            
            <Link to="/hangman" className="transform transition-all duration-300 hover:scale-105">
              <Button className="w-full h-32 text-xl bg-gradient-to-r from-brightOrange to-magentaPink hover:from-magentaPink hover:to-brightOrange text-white shadow-lg">
                Hangman
              </Button>
            </Link>
            
            <Link to="/sentence-builder" className="transform transition-all duration-300 hover:scale-105">
              <Button className="w-full h-32 text-xl bg-gradient-to-r from-primaryPurple to-oceanBlue hover:from-oceanBlue hover:to-primaryPurple text-white shadow-lg">
                Sentence Builder
              </Button>
            </Link>
            
            <Link to="/greetings" className="transform transition-all duration-300 hover:scale-105">
              <Button className="w-full h-32 text-xl bg-gradient-to-r from-brightBlue to-vividPurple hover:from-vividPurple hover:to-brightBlue text-white shadow-lg">
                Greetings
              </Button>
            </Link>
            
            <Link to="/pronunciation" className="transform transition-all duration-300 hover:scale-105">
              <Button className="w-full h-32 text-xl bg-gradient-to-r from-magentaPink to-primaryPurple hover:from-primaryPurple hover:to-magentaPink text-white shadow-lg">
                Pronunciation Challenge
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default Index;