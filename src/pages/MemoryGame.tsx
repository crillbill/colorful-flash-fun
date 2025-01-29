import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Timer, Trophy, Brain, Puzzle } from "lucide-react";
import { Header1 } from "@/components/ui/header";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { MemoryGameLeaderboard } from "@/components/MemoryGameLeaderboard";

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

const fetchHebrewData = async () => {
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
};

const MemoryGame = () => {
  const [cards, setCards] = useState<MemoryCard[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<number>(0);
  const [timer, setTimer] = useState<number>(0);
  const [isGameStarted, setIsGameStarted] = useState<boolean>(false);
  const [isProcessingMatch, setIsProcessingMatch] = useState<boolean>(false);

  const { data: hebrewData, isLoading, error } = useQuery({
    queryKey: ['hebrewData'],
    queryFn: fetchHebrewData,
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

    const selectedData = hebrewData.length > 8 
      ? hebrewData.sort(() => Math.random() - 0.5).slice(0, 8)
      : hebrewData.slice(0, 8);

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
          if (newMatchedPairs === 8) {
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

  const saveScore = async (timeTaken: number, pairsMatched: number) => {
    try {
      const { error } = await supabase
        .from('memory_game_scores')
        .insert({
          user_id: (await supabase.auth.getUser()).data.user?.id,
          time_taken: timeTaken,
          pairs_matched: pairsMatched
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error saving score:', error);
      toast.error("Failed to save score");
    }
  };

  useEffect(() => {
    if (matchedPairs === 8 && isGameStarted) {
      setIsGameStarted(false);
      toast.success("Congratulations! You've completed the game!");
      saveScore(timer, matchedPairs);
    }
  }, [matchedPairs, isGameStarted, timer]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-softPurple to-softPink p-4 pt-16 text-center">
        <div className="flex items-center justify-center gap-2">
          <Puzzle className="animate-spin h-6 w-6 text-vividPurple" />
          <span className="text-lg font-medium">Loading words...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-softPurple to-softPink p-4 pt-16 text-center">
        <div className="text-red-500">Error loading words</div>
      </div>
    );
  }

  return (
    <>
      <Header1 />
      <div className="min-h-screen bg-gradient-to-br from-softPurple to-softPink p-4 pt-24">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="mb-8">
            <div className="flex items-center justify-between w-full gap-4 bg-white/80 rounded-lg p-4 shadow-lg">
              <div className="flex items-center gap-2 text-base font-medium text-gray-700">
                <Timer className="w-5 h-5 text-magentaPink" />
                {formatTime(timer)}
              </div>
              <Button 
                onClick={shuffleCards} 
                className="bg-gradient-to-r from-vividPurple to-magentaPink hover:opacity-90 text-white h-10 flex items-center gap-2"
              >
                {isGameStarted ? (
                  <>
                    <Brain className="w-4 h-4" /> Restart Game
                  </>
                ) : (
                  <>
                    <Puzzle className="w-4 h-4" /> Start Game
                  </>
                )}
              </Button>
              <div className="flex items-center gap-2 text-base font-medium text-gray-700 min-w-[100px]">
                <span>🎯 Pairs:</span>
                <span className="text-vividPurple">{matchedPairs}/8</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-3">
            {cards.map((card) => (
              <div
                key={card.id}
                className={`flip-card ${
                  card.isMatched || flippedCards.includes(card.id) ? "flipped" : ""
                }`}
                onClick={() => handleCardClick(card.id)}
              >
                <Card className="w-full h-32 cursor-pointer hover:shadow-lg transition-shadow">
                  <div className="flip-card-inner w-full h-full">
                    <div className="flip-card-front w-full h-full flex items-center justify-center bg-gradient-to-br from-vividPurple to-magentaPink">
                      <span className="text-white text-3xl font-bold">🤔</span>
                    </div>
                    <div className="flip-card-back w-full h-full flex flex-col items-center justify-center p-2 bg-white text-center gap-1">
                      <span className="text-xl font-bold text-gray-900" dir="rtl">
                        {card.hebrew}
                      </span>
                      {card.transliteration && (
                        <span className="text-xs text-gray-600">
                          {card.transliteration}
                        </span>
                      )}
                      <span className="text-sm text-gray-800">
                        {card.english}
                      </span>
                    </div>
                  </div>
                </Card>
              </div>
            ))}
          </div>

          <div className="mt-8">
            <MemoryGameLeaderboard />
          </div>
        </div>
      </div>
    </>
  );
};

export default MemoryGame;