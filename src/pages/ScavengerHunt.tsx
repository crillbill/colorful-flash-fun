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
import { Loader2 } from "lucide-react";

interface ScavengerItem {
  id: string;
  hebrew: string;
  english: string;
  transliteration: string | null;
  created_at: string;
  updated_at: string;
}

interface ImageItem {
  id: string;
  word_id: string;
  image_path: string;
}

const ScavengerHunt = () => {
  const [category, setCategory] = useState<Category>("words");
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [score, setScore] = useState({ correct: 0, total: 0 });

  const { data: items = [], isLoading: isLoadingItems } = useQuery({
    queryKey: ['scavengerHuntItems', category],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hebrew_words')
        .select('*')
        .in('english', ['table', 'chair', 'computer', 'book', 'desk']);

      if (error) throw error;
      return data as ScavengerItem[];
    },
  });

  const { data: images = [], isLoading: isLoadingImages } = useQuery({
    queryKey: ['scavengerHuntImages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('scavenger_hunt_images')
        .select('*');

      if (error) throw error;
      return data as ImageItem[];
    },
  });

  const handleImageClick = async (imageId: string) => {
    const currentItem = items[currentItemIndex];
    const isCorrect = images.find(img => img.id === imageId)?.word_id === currentItem.id;
    
    setScore(prev => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1
    }));

    if (isCorrect) {
      toast.success("Correct! Well done!");
    } else {
      toast.error(`Incorrect. The correct answer was ${currentItem.english}`);
    }

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

  const isLoading = isLoadingItems || isLoadingImages;

  if (isLoading) {
    return <div className="min-h-screen bg-white p-8 pt-24 flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin" />
    </div>;
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
            <h1 className="text-4xl font-bold">Find the Object</h1>
            <p className="text-lg text-gray-600">Click on the image that matches the Hebrew word</p>
          </div>

          <ScoreDisplay correct={score.correct} total={score.total} />
          <ProgressBar current={currentItemIndex + 1} total={items.length} />

          <Card className="p-6">
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold mb-2 rtl">{currentItem.hebrew}</h2>
              <p className="text-lg text-gray-600">
                {currentItem.transliteration && `(${currentItem.transliteration})`}
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {images.map((image) => {
                const imageUrl = supabase.storage
                  .from('scavenger_hunt_images')
                  .getPublicUrl(image.image_path).data.publicUrl;

                return (
                  <button
                    key={image.id}
                    onClick={() => handleImageClick(image.id)}
                    className="relative aspect-square overflow-hidden rounded-lg hover:opacity-90 transition-opacity"
                  >
                    <img
                      src={imageUrl}
                      alt="Game option"
                      className="w-full h-full object-cover"
                    />
                  </button>
                );
              })}
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