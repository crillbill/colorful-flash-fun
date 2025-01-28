import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Timer } from "lucide-react";
import { Header1 } from "@/components/ui/header";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { CategorySelector, type Category } from "@/components/CategorySelector";

interface MemoryCard {
  id: number;
  hebrew: string;
  english: string;
  transliteration?: string | null;
  isFlipped: boolean;
  isMatched: boolean;
}

interface HebrewWord {
  id: string;
  hebrew: string;
  english: string;
  transliteration: string | null;
}

const fetchHebrewData = async (category: Category) => {
  let query;
  
  switch (category) {
    case "phrases":
      query = supabase.from('hebrew_phrases').select('*');
      break;
    case "words":
      query = supabase.from('hebrew_words').select('*');
      break;
    case "letters":
      query = supabase.from('hebrew_alphabet').select('*');
      break;
    case "verbs":
      query = supabase.from('hebrew_verbs').select('*');
      break;
    case "all":
      const [phrases, words, letters, verbs] = await Promise.all([
        supabase.from('hebrew_phrases').select('*'),
        supabase.from('hebrew_words').select('*'),
        supabase.from('hebrew_alphabet').select('*'),
        supabase.from('hebrew_verbs').select('*')
      ]);
      
      return [
        ...(phrases.data || []),
        ...(words.data || []),
        ...(letters.data || []),
        ...(verbs.data || [])
      ];
  }
  
  const { data, error } = await query;
  
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
  const [category, setCategory] = useState<Category>("words");

  const { data: hebrewData, isLoading, error } = useQuery({
    queryKey: ['hebrewData', category],
    queryFn: () => fetchHebrewData(category),
    enabled: true,
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
    if (!hebrewData || hebrewData.length === 0) {
      toast.error("No words available to start the game");
      return;
    }

    // Take 8 random items for 16 cards (8 pairs) in a 4x4 grid
    const selectedData = hebrewData.length > 8 
      ? hebrewData.sort(() => Math.random() - 0.5).slice(0, 8)
      : hebrewData.slice(0, 8);

    // Create pairs of cards
    const cardPairs = selectedData.flatMap((word: HebrewWord, index) => [
      {
        id: index * 2,
        hebrew: word.hebrew,
        english: word.english,
        transliteration: word.transliteration,
        isFlipped: false,
        isMatched: false,
      },
      {
        id: index * 2 + 1,
        hebrew: word.hebrew,
        english: word.english,
        transliteration: word.transliteration,
        isFlipped: false,
        isMatched: false,
      }
    ]);

    // Shuffle the cards
    const shuffledCards = [...cardPairs].sort(() => Math.random() - 0.5);
    setCards(shuffledCards);
    setFlippedCards([]);
    setMatchedPairs(0);
    setTimer(0);
    setIsGameStarted(true);
    setIsProcessingMatch(false);
  };

  const handleCardClick = (cardId: number) => {
    if (!isGameStarted || isProcessingMatch || flippedCards.includes(cardId)) {
      return;
    }

    const clickedCard = cards.find((card) => card.id === cardId);
    if (!clickedCard || clickedCard.isMatched) {
      return;
    }

    if (flippedCards.length === 1) {
      setIsProcessingMatch(true);
      const [firstId] = flippedCards;
      const firstCard = cards.find((card) => card.id === firstId);

      setFlippedCards([firstId, cardId]);

      if (firstCard && firstCard.hebrew === clickedCard.hebrew) {
        setCards(cards.map((card) =>
          card.id === firstId || card.id === cardId
            ? { ...card, isMatched: true }
            : card
        ));
        setMatchedPairs((prev) => {
          const newMatchedPairs = prev + 1;
          if (newMatchedPairs === 8) { // Updated to match 4x4 grid (8 pairs)
            toast.success("Congratulations! You've completed the game!");
            setIsGameStarted(false);
          }
          return newMatchedPairs;
        });
        setFlippedCards([]);
        setIsProcessingMatch(false);
      } else {
        setTimeout(() => {
          setFlippedCards([]);
          setIsProcessingMatch(false);
        }, 1000);
      }
    } else {
      setFlippedCards([cardId]);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return <div className="min-h-screen bg-white p-4 pt-16 text-center">Loading words...</div>;
  }

  if (error) {
    return <div className="min-h-screen bg-white p-4 pt-16 text-center">Error loading words</div>;
  }

  return (
    <>
      <Header1 />
      <div className="min-h-screen bg-white p-4 pt-16">
        <div className="max-w-4xl mx-auto space-y-4">
          {/* Game controls section */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <CategorySelector value={category} onChange={setCategory} />
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Timer className="w-4 h-4" />
                  {formatTime(timer)}
                </div>
                <Button 
                  onClick={shuffleCards} 
                  size="sm"
                  className="bg-primary h-8 text-sm font-semibold"
                >
                  {isGameStarted ? "Restart Game" : "Start Game"}
                </Button>
                <div className="text-sm font-semibold">
                  Pairs: {matchedPairs}/8
                </div>
              </div>
            </div>
          </div>

          {/* Game grid */}
          <div className="grid grid-cols-4 gap-3">
            {cards.map((card) => (
              <div
                key={card.id}
                className={`flip-card ${
                  card.isMatched || flippedCards.includes(card.id) ? "flipped" : ""
                }`}
                onClick={() => handleCardClick(card.id)}
              >
                <Card className="w-full h-32 cursor-pointer">
                  <div className="flip-card-inner w-full h-full">
                    {/* Front of card (blank) */}
                    <div className="flip-card-front w-full h-full flex items-center justify-center bg-gradient-to-br from-[#8B5CF6] to-[#D946EF]">
                      <span className="text-white text-2xl font-bold">?</span>
                    </div>
                    {/* Back of card (content) */}
                    <div className="flip-card-back w-full h-full flex flex-col items-center justify-center p-2 bg-white text-center gap-1">
                      <span className="text-xl font-bold text-gray-900" dir="rtl">
                        {card.hebrew}
                      </span>
                      <span className="text-xs text-gray-600">
                        {card.transliteration}
                      </span>
                      <span className="text-sm text-gray-800">
                        {card.english}
                      </span>
                    </div>
                  </div>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default MemoryGame;
