import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Timer } from "lucide-react";
import { Header1 } from "@/components/ui/header";
import { toast } from "sonner";

interface MemoryCard {
  id: number;
  hebrew: string;
  english: string;
  imageUrl: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const initialCards: MemoryCard[] = [
  {
    id: 1,
    hebrew: "כלב",
    english: "dog",
    imageUrl: "https://images.unsplash.com/photo-1543466835-00a7907e9de1",
    isFlipped: false,
    isMatched: false,
  },
  {
    id: 2,
    hebrew: "חתול",
    english: "cat",
    imageUrl: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba",
    isFlipped: false,
    isMatched: false,
  },
  {
    id: 3,
    hebrew: "ציפור",
    english: "bird",
    imageUrl: "https://images.unsplash.com/photo-1444464666168-49d633b86797",
    isFlipped: false,
    isMatched: false,
  },
  {
    id: 4,
    hebrew: "דג",
    english: "fish",
    imageUrl: "https://images.unsplash.com/photo-1524704654690-b56c05c78a00",
    isFlipped: false,
    isMatched: false,
  },
  {
    id: 5,
    hebrew: "סוס",
    english: "horse",
    imageUrl: "https://images.unsplash.com/photo-1534073737927-85f1ebff1f5d",
    isFlipped: false,
    isMatched: false,
  },
  {
    id: 6,
    hebrew: "פרה",
    english: "cow",
    imageUrl: "https://images.unsplash.com/photo-1546445317-29f4545e9d53",
    isFlipped: false,
    isMatched: false,
  },
  {
    id: 7,
    hebrew: "ארנב",
    english: "rabbit",
    imageUrl: "https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308",
    isFlipped: false,
    isMatched: false,
  },
  {
    id: 8,
    hebrew: "אריה",
    english: "lion",
    imageUrl: "https://images.unsplash.com/photo-1546182990-dffeafbe841d",
    isFlipped: false,
    isMatched: false,
  },
  {
    id: 9,
    hebrew: "פיל",
    english: "elephant",
    imageUrl: "https://images.unsplash.com/photo-1557050543-4d5f4e07ef46",
    isFlipped: false,
    isMatched: false,
  },
  {
    id: 10,
    hebrew: "קוף",
    english: "monkey",
    imageUrl: "https://images.unsplash.com/photo-1540573133985-87b6da6d54a9",
    isFlipped: false,
    isMatched: false,
  },
];

const MemoryGame = () => {
  const [cards, setCards] = useState<MemoryCard[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<number>(0);
  const [timer, setTimer] = useState<number>(0);
  const [isGameStarted, setIsGameStarted] = useState<boolean>(false);

  useEffect(() => {
    if (isGameStarted) {
      const interval = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isGameStarted]);

  const shuffleCards = () => {
    const shuffledCards = [...initialCards, ...initialCards].map((card, index) => ({
      ...card,
      id: index + 1,
      isFlipped: false,
      isMatched: false,
    })).sort(() => Math.random() - 0.5);
    setCards(shuffledCards);
    setFlippedCards([]);
    setMatchedPairs(0);
    setTimer(0);
    setIsGameStarted(true);
  };

  const handleCardClick = (cardId: number) => {
    if (!isGameStarted) return;
    
    const clickedCard = cards.find((card) => card.id === cardId);
    if (
      !clickedCard ||
      flippedCards.includes(cardId) ||
      clickedCard.isMatched ||
      flippedCards.length >= 2
    ) {
      return;
    }

    const newFlippedCards = [...flippedCards, cardId];
    setFlippedCards(newFlippedCards);

    if (newFlippedCards.length === 2) {
      const [firstId, secondId] = newFlippedCards;
      const firstCard = cards.find((card) => card.id === firstId);
      const secondCard = cards.find((card) => card.id === secondId);

      if (firstCard && secondCard && firstCard.hebrew === secondCard.hebrew) {
        setCards(cards.map((card) =>
          card.id === firstId || card.id === secondId
            ? { ...card, isMatched: true }
            : card
        ));
        setMatchedPairs((prev) => {
          const newMatchedPairs = prev + 1;
          if (newMatchedPairs === initialCards.length) {
            toast.success("Congratulations! You've completed the game!");
            setIsGameStarted(false);
          }
          return newMatchedPairs;
        });
        setFlippedCards([]);
      } else {
        setTimeout(() => {
          setFlippedCards([]);
        }, 1000);
      }
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

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
                    <div className="flip-card-front w-full h-full flex items-center justify-center bg-primary text-primary-foreground text-2xl font-bold">
                      {card.hebrew}
                    </div>
                    <div className="flip-card-back w-full h-full">
                      <img
                        src={card.imageUrl}
                        alt={card.english}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </Card>
              </div>
            ))}
          </div>

          <div className="text-center text-lg font-semibold">
            Matched Pairs: {matchedPairs} / {initialCards.length}
          </div>
        </div>
      </div>
    </>
  );
};

export default MemoryGame;