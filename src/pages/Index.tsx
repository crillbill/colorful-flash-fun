import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Header1 } from "@/components/ui/header";

const Index = () => {
  return (
    <>
      <Header1 />
      <div className="min-h-screen bg-white p-8 pt-24">
        <div className="max-w-2xl mx-auto space-y-8">
          <h1 className="text-4xl font-bold text-center mb-12">
            Learn Hebrew
          </h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link to="/flashcards">
              <Button className="w-full h-32 text-xl">Flashcards</Button>
            </Link>
            
            <Link to="/multiple-choice">
              <Button className="w-full h-32 text-xl">Multiple Choice</Button>
            </Link>
            
            <Link to="/word-search">
              <Button className="w-full h-32 text-xl">Word Search</Button>
            </Link>
            
            <Link to="/letter-matching">
              <Button className="w-full h-32 text-xl">Letter Matching</Button>
            </Link>
            
            <Link to="/hangman">
              <Button className="w-full h-32 text-xl">Hangman</Button>
            </Link>
            
            <Link to="/sentence-builder">
              <Button className="w-full h-32 text-xl">Sentence Builder</Button>
            </Link>
            
            <Link to="/greetings">
              <Button className="w-full h-32 text-xl">Greetings</Button>
            </Link>
            
            <Link to="/pronunciation">
              <Button className="w-full h-32 text-xl">Pronunciation Challenge</Button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default Index;