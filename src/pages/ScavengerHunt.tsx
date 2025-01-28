import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Header1 } from "@/components/ui/header";
import { toast } from "sonner";
import { CategorySelector, Category } from "@/components/CategorySelector";
import { ProgressBar } from "@/components/ProgressBar";
import { ScoreDisplay } from "@/components/ScoreDisplay";

interface ScavengerItem {
  id: string;
  hebrew: string;
  english: string;
  transliteration: string | null;
  category: 'animals' | 'objects';
  hint: string | null;
}

const PLACEHOLDER_IMAGES = [
  'https://images.unsplash.com/photo-1582562124811-c09040d0a901',
  'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9',
  'https://images.unsplash.com/photo-1466721591366-2d5fba72006d',
  'https://images.unsplash.com/photo-1493962853295-0fd70327578a'
];

const ScavengerHunt = () => {
  const [category, setCategory] = useState<Category>("all");
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [score, setScore] = useState({ correct: 0, total: 0 });

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['scavengerHuntItems', category],
    queryFn: async () => {
      const query = supabase
        .from('hebrew_scavenger_hunt')
        .select('*');

      if (category !== 'all') {
        query.eq('category', category);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as ScavengerItem[];
    },
  });

  const handleImageClick = (imageIndex: number) => {
    const currentItem = items[currentItemIndex];
    const isCorrect = imageIndex === 0; // First image is always correct for demo
    
    setScore(prev => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1
    }));

    if (isCorrect) {
      toast.success("Correct! Well done!");
    } else {
      toast.error(`Incorrect. The correct answer was ${currentItem.english}`);
    }

    // Move to next item
    if (currentItemIndex < items.length - 1) {
      setCurrentItemIndex(prev => prev + 1);
    } else {
      toast("Game Over! Click 'New Game' to play again.");
    }
  };

  const handleNewGame = () => {
    setCurrentItemIndex(0);
    setScore({ correct: 0, total: 0 });
    toast("New game started! Find the matching images!");
  };

  if (isLoading) {
    return <div className="min-h-screen bg-white p-8 pt-24 flex items-center justify-center">Loading...</div>;
  }

  const currentItem = items[currentItemIndex];

  if (!currentItem) {
    return (
      <div className="min-h-screen bg-white p-8 pt-24">
        <Header1 />
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">No items available</h2>
          <CategorySelector value={category} onChange={setCategory} />
        </div>
      </div>
    );
  }

  return (
    <>
      <Header1 />
      <div className="min-h-screen bg-white p-8 pt-24">
        <div className="max-w-2xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold">Scavenger Hunt</h1>
            <CategorySelector value={category} onChange={setCategory} />
          </div>

          <ScoreDisplay correct={score.correct} total={score.total} />
          <ProgressBar current={currentItemIndex + 1} total={items.length} />

          <Card className="p-6">
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold mb-2 rtl">{currentItem.hebrew}</h2>
              <p className="text-lg text-gray-600">
                {currentItem.transliteration && `(${currentItem.transliteration})`}
              </p>
              {currentItem.hint && (
                <p className="text-sm text-gray-500 mt-2">Hint: {currentItem.hint}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              {PLACEHOLDER_IMAGES.map((image, index) => (
                <button
                  key={index}
                  onClick={() => handleImageClick(index)}
                  className="relative aspect-square overflow-hidden rounded-lg hover:opacity-90 transition-opacity"
                >
                  <img
                    src={`${image}?w=300&h=300&fit=crop`}
                    alt={`Option ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </Card>

          <div className="flex justify-center">
            <Button onClick={handleNewGame}>
              New Game
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ScavengerHunt;