import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Header1 } from "@/components/ui/header";
import { cn } from "@/lib/utils";

const Index = () => {
  const buttonVariants = [
    "bg-gradient-to-r from-primaryPurple to-secondaryPurple hover:from-secondaryPurple hover:to-primaryPurple",
    "bg-gradient-to-r from-vividPurple to-magentaPink hover:from-magentaPink hover:to-vividPurple",
    "bg-gradient-to-r from-brightOrange to-oceanBlue hover:from-oceanBlue hover:to-brightOrange",
    "bg-gradient-to-r from-softPurple to-lightPurple hover:from-lightPurple hover:to-softPurple",
    "bg-gradient-to-r from-softGreen to-softYellow hover:from-softYellow hover:to-softGreen",
    "bg-gradient-to-r from-softOrange to-softPeach hover:from-softPeach hover:to-softOrange",
    "bg-gradient-to-r from-softBlue to-brightBlue hover:from-brightBlue hover:to-softBlue",
    "bg-gradient-to-r from-primaryPurple to-tertiaryPurple hover:from-tertiaryPurple hover:to-primaryPurple",
    "bg-gradient-to-r from-vividPurple to-oceanBlue hover:from-oceanBlue hover:to-vividPurple",
    "bg-gradient-to-r from-magentaPink to-brightOrange hover:from-brightOrange hover:to-magentaPink",
    "bg-gradient-to-r from-softPurple to-primaryPurple hover:from-primaryPurple hover:to-softPurple"
  ];

  return (
    <>
      <Header1 />
      <div className="min-h-screen bg-gradient-to-b from-pureWhite to-softGray">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-center mb-8 gradient-text animate-float">
            Hebrew Learning Games
          </h1>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { path: "/flashcards", label: "Flashcards" },
              { path: "/multiple-choice", label: "Multiple Choice" },
              { path: "/word-search", label: "Word Search" },
              { path: "/letter-matching", label: "Letter Matching" },
              { path: "/fill-in-the-blank", label: "Fill in the Blank" },
              { path: "/sentence-builder", label: "Sentence Builder" },
              { path: "/hangman", label: "Hangman" },
              { path: "/memory-game", label: "Memory Game" },
              { path: "/pronunciation-challenge", label: "Pronunciation Challenge" },
              { path: "/import-words", label: "Import Words" },
              { path: "/import-bulk-words", label: "Import Bulk Words" }
            ].map((item, index) => (
              <Link key={item.path} to={item.path}>
                <Button 
                  className={cn(
                    "w-full h-24 text-lg font-semibold shadow-lg hover-card",
                    "transition-all duration-300 text-white",
                    buttonVariants[index % buttonVariants.length]
                  )}
                >
                  {item.label}
                </Button>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Index;