import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Timer } from "lucide-react";
import { Header1 } from "@/components/ui/header";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

interface MemoryCard {
  id: number;
  hebrew: string;
  english: string;
  imageUrl?: string;
  isFlipped: boolean;
  isMatched: boolean;
  showHebrew: boolean;
}

interface HebrewWord {
  id: string;
  hebrew: string;
  english: string;
}

const fetchHebrewWords = async () => {
  const { data, error } = await supabase
    .from('hebrew_words')
    .select('*')
    .limit(10);
  
  if (error) {
    throw error;
  }
  
  return data;
};

const MemoryGame = () => {
  const [cards, setCards] = useState<MemoryCard[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<number>(0);
  const [timer, setTimer] = useState<number>(0);
  const [isGameStarted, setIsGameStarted] = useState<boolean>(false);
  const [isProcessingMatch, setIsProcessingMatch] = useState<boolean>(false);

  const { data: hebrewWords, isLoading, error } = useQuery({
    queryKey: ['hebrewWords'],
    queryFn: fetchHebrewWords,
  });

  useEffect(() => {
    if (isGameStarted) {
      const interval = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isGameStarted]);

  const shuffleCards = () => {
    if (!hebrewWords || hebrewWords.length === 0) {
      toast.error("No words available to start the game");
      return;
    }

    // Create pairs of cards from hebrew words
    const cardPairs = hebrewWords.flatMap((word: HebrewWord, index) => {
      // First card of the pair shows Hebrew
      const hebrewCard = {
        id: index * 2,
        hebrew: word.hebrew,
        english: word.english,
        isFlipped: false,
        isMatched: false,
        showHebrew: true,
      };
      
      // Second card of the pair shows English
      const englishCard = {
        id: index * 2 + 1,
        hebrew: word.hebrew,
        english: word.english,
        isFlipped: false,
        isMatched: false,
        showHebrew: false,
      };
      
      return [hebrewCard, englishCard];
    });

    // Shuffle the cards
    const shuffledCards = cardPairs.sort(() => Math.random() - 0.5);
    setCards(shuffledCards);
    setFlippedCards([]);
    setMatchedPairs(0);
    setTimer(0);
    setIsGameStarted(true);
    setIsProcessingMatch(false);
  };

  const handleCardClick = (cardId: number) => {
    if (
      !isGameStarted ||
      isProcessingMatch || // Prevent new card flips while processing a match
      flippedCards.includes(cardId)
    ) {
      return;
    }

    const clickedCard = cards.find((card) => card.id === cardId);
    if (!clickedCard || clickedCard.isMatched) {
      return;
    }

    // If we already have one card flipped
    if (flippedCards.length === 1) {
      setIsProcessingMatch(true);
      const [firstId] = flippedCards;
      const firstCard = cards.find((card) => card.id === firstId);

      setFlippedCards([firstId, cardId]);

      if (firstCard && firstCard.hebrew === clickedCard.hebrew) {
        // Match found
        setCards(cards.map((card) =>
          card.id === firstId || card.id === cardId
            ? { ...card, isMatched: true }
            : card
        ));
        setMatchedPairs((prev) => {
          const newMatchedPairs = prev + 1;
          if (newMatchedPairs === hebrewWords.length) {
            toast.success("Congratulations! You've completed the game!");
            setIsGameStarted(false);
          }
          return newMatchedPairs;
        });
        setFlippedCards([]);
        setIsProcessingMatch(false);
      } else {
        // No match, flip cards back after delay
        setTimeout(() => {
          setFlippedCards([]);
          setIsProcessingMatch(false);
        }, 1000);
      }
    } else {
      // First card flip
      setFlippedCards([cardId]);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return <div className="min-h-screen bg-white p-8 pt-24 text-center">Loading words...</div>;
  }

  if (error) {
    return <div className="min-h-screen bg-white p-8 pt-24 text-center">Error loading words</div>;
  }

  return (
    <>
      <Header1 />
      <div className="min-h-screen bg-white p-8 pt-24">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="flex justify-between items-center">
            <Button onClick={shuffleCards} size="lg" className="bg-primary">
              {isGameStarted ? "Restart Game" : "Start Game"}
            </Button>
            <div className="flex items-center gap-2 text-lg font-semibold">
              <Timer className="w-6 h-6" />
              {formatTime(timer)}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {cards.map((card) => (
              <div
                key={card.id}
                className={`flip-card ${
                  card.isMatched || flippedCards.includes(card.id) ? "flipped" : ""
                }`}
                onClick={() => handleCardClick(card.id)}
              >
                <Card className="w-full h-40 cursor-pointer">
                  <div className="flip-card-inner w-full h-full">
                    {/* Front of card */}
                    <div className="flip-card-front w-full h-full flex items-center justify-center bg-gradient-to-br from-[#8B5CF6] to-[#D946EF] text-white text-2xl font-bold">
                      {card.showHebrew ? card.hebrew : card.english}
                    </div>
                    {/* Back of card */}
                    <div className="flip-card-back w-full h-full flex items-center justify-center bg-gradient-to-br from-[#8B5CF6] to-[#D946EF] text-white text-2xl font-bold">
                      {!card.showHebrew ? card.hebrew : card.english}
                    </div>
                  </div>
                </Card>
              </div>
            ))}
          </div>

          <div className="text-center text-lg font-semibold">
            Matched Pairs: {matchedPairs} / {hebrewWords?.length || 0}
          </div>
        </div>
      </div>
    </>
  );
};

export default MemoryGame;
