import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Header1 } from "@/components/ui/header";

const Index = () => {
  return (
    <>
      <Header1 />
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <Link to="/flashcards">
              <Button className="w-full">Flashcards</Button>
            </Link>
            <Link to="/multiple-choice">
              <Button className="w-full">Multiple Choice</Button>
            </Link>
            <Link to="/word-search">
              <Button className="w-full">Word Search</Button>
            </Link>
            <Link to="/letter-matching">
              <Button className="w-full">Letter Matching</Button>
            </Link>
            <Link to="/fill-in-the-blank">
              <Button className="w-full">Fill in the Blank</Button>
            </Link>
            <Link to="/sentence-builder">
              <Button className="w-full">Sentence Builder</Button>
            </Link>
            <Link to="/hangman">
              <Button className="w-full">Hangman</Button>
            </Link>
            <Link to="/memory-game">
              <Button className="w-full">Memory Game</Button>
            </Link>
            <Link to="/pronunciation-challenge">
              <Button className="w-full">Pronunciation Challenge</Button>
            </Link>
            <Link to="/import-words">
              <Button className="w-full">Import Words</Button>
            </Link>
            <Link to="/import-bulk-words">
              <Button className="w-full">Import Bulk Words</Button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default Index;