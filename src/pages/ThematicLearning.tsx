import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronRight, ChevronLeft, Info, Loader2 } from 'lucide-react';
import { Header1 } from "@/components/ui/header";
import { supabase } from "@/integrations/supabase/client";

interface Word {
  hebrew: string;
  english: string;
  transliteration: string | null;
  category: string;
}

interface Category {
  name: string;
  words: Word[];
}

const ThematicLearning = () => {
  const [currentCategory, setCurrentCategory] = useState(0);
  const [currentWord, setCurrentWord] = useState(0);
  const [showTranslation, setShowTranslation] = useState(false);

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['categorized-words'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hebrew_categorized_words')
        .select('*')
        .order('rank', { ascending: true });

      if (error) throw error;

      // Group words by category
      const groupedWords = data.reduce((acc: { [key: string]: Word[] }, word) => {
        if (!acc[word.category]) {
          acc[word.category] = [];
        }
        acc[word.category].push(word);
        return acc;
      }, {});

      // Convert to array format
      return Object.entries(groupedWords).map(([name, words]) => ({
        name,
        words
      }));
    }
  });

  const nextWord = () => {
    if (currentWord < (categories[currentCategory]?.words.length || 0) - 1) {
      setCurrentWord(curr => curr + 1);
    } else if (currentCategory < categories.length - 1) {
      setCurrentCategory(curr => curr + 1);
      setCurrentWord(0);
    }
    setShowTranslation(false);
  };

  const prevWord = () => {
    if (currentWord > 0) {
      setCurrentWord(curr => curr - 1);
    } else if (currentCategory > 0) {
      setCurrentCategory(curr => curr - 1);
      setCurrentWord(categories[currentCategory - 1].words.length - 1);
    }
    setShowTranslation(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200">
        <Header1 />
        <div className="container mx-auto px-4 py-16 mt-20 flex justify-center items-center">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </div>
    );
  }

  if (!categories.length) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200">
        <Header1 />
        <div className="container mx-auto px-4 py-16 mt-20">
          <p className="text-center text-lg text-gray-700">
            No categories available yet. Please add some categorized words to get started.
          </p>
        </div>
      </div>
    );
  }

  const currentCategoryData = categories[currentCategory];
  const currentWordData = currentCategoryData?.words[currentWord];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200">
      <Header1 />
      <div className="container mx-auto px-4 py-16 mt-20">
        <div className="w-full max-w-4xl mx-auto">
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>{currentCategoryData.name}</span>
                <span className="text-sm text-gray-500">
                  {currentWord + 1}/{currentCategoryData.words.length}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-6">
                <div className="text-4xl font-bold mb-4">
                  {currentWordData.hebrew}
                </div>
                
                {currentWordData.transliteration && (
                  <div className="text-xl text-gray-600">
                    {currentWordData.transliteration}
                  </div>
                )}

                <Button 
                  onClick={() => setShowTranslation(!showTranslation)}
                  className="w-full"
                >
                  {showTranslation ? "Hide Translation" : "Show Translation"}
                </Button>

                {showTranslation && (
                  <div className="mt-4 space-y-2">
                    <p className="text-xl">{currentWordData.english}</p>
                  </div>
                )}

                <div className="flex justify-between mt-6">
                  <Button 
                    onClick={prevWord}
                    disabled={currentCategory === 0 && currentWord === 0}
                    className="w-24"
                  >
                    <ChevronLeft className="mr-2" /> Prev
                  </Button>
                  <Button 
                    onClick={nextWord}
                    disabled={currentCategory === categories.length - 1 && 
                             currentWord === categories[currentCategory].words.length - 1}
                    className="w-24"
                  >
                    Next <ChevronRight className="ml-2" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.map((category, idx) => (
              <Button
                key={category.name}
                variant={currentCategory === idx ? "default" : "outline"}
                onClick={() => {
                  setCurrentCategory(idx);
                  setCurrentWord(0);
                  setShowTranslation(false);
                }}
                className="h-24"
              >
                {category.name}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThematicLearning;