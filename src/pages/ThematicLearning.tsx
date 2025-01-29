import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  BookOpen, 
  Rotate3D, 
  ChevronRight, 
  ChevronLeft,
  Volume2
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
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

const FlashCard = ({ word, isFlipped, onFlip }: { word: Word; isFlipped: boolean; onFlip: () => void }) => {
  return (
    <div 
      className={`flip-card w-full max-w-md h-72 ${isFlipped ? 'flipped' : ''}`}
      onClick={onFlip}
    >
      <div className="flip-card-inner w-full h-full">
        {/* Front of card */}
        <div className="flip-card-front">
          <Card className="w-full h-full flex flex-col justify-center items-center p-6 cursor-pointer bg-gradient-to-br from-softPurple via-softBlue to-softPink">
            <div className="text-4xl font-bold mb-4 text-vividPurple">{word.hebrew} ✨</div>
            <div className="text-xl text-magentaPink">{word.transliteration} 🎵</div>
            <Button 
              variant="ghost" 
              size="icon"
              className="absolute top-4 right-4 hover:bg-white/20"
              onClick={(e) => {
                e.stopPropagation();
                // Add pronunciation logic here
              }}
            >
              <Volume2 className="h-5 w-5 text-primaryPurple" />
            </Button>
          </Card>
        </div>

        {/* Back of card */}
        <div className="flip-card-back">
          <Card className="w-full h-full flex flex-col justify-between p-6 cursor-pointer bg-gradient-to-br from-softPeach via-softYellow to-softOrange">
            <div className="text-2xl font-semibold mb-4 text-brightOrange">{word.english} 🌟</div>
            <div className="space-y-3">
              <div className="text-oceanBlue">
                <p className="text-sm font-semibold mb-1">Category 📚</p>
                <p>{word.category} ✨</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

const CategorySelector = ({ 
  categories, 
  activeCategory, 
  onSelect 
}: { 
  categories: Category[]; 
  activeCategory: number; 
  onSelect: (idx: number) => void;
}) => {
  return (
    <div className="flex overflow-x-auto gap-2 p-2 mb-6">
      {categories.map((category, idx) => (
        <Button
          key={category.name}
          variant={activeCategory === idx ? "default" : "outline"}
          onClick={() => onSelect(idx)}
          className={`whitespace-nowrap ${
            activeCategory === idx 
              ? 'bg-gradient-to-r from-vividPurple to-magentaPink text-white' 
              : 'hover:bg-softPurple/20'
          }`}
        >
          {category.name} 🏷️
        </Button>
      ))}
    </div>
  );
};

const ThematicLearning = () => {
  const [currentCategory, setCurrentCategory] = useState(0);
  const [currentWord, setCurrentWord] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [studyMode, setStudyMode] = useState<'learn' | 'review'>('learn');

  const { data: words = [], isLoading } = useQuery({
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
    setIsFlipped(false);
    if (currentWord < (words[currentCategory]?.words.length || 0) - 1) {
      setCurrentWord(curr => curr + 1);
    } else if (currentCategory < words.length - 1) {
      setCurrentCategory(curr => curr + 1);
      setCurrentWord(0);
    }
  };

  const prevWord = () => {
    setIsFlipped(false);
    if (currentWord > 0) {
      setCurrentWord(curr => curr - 1);
    } else if (currentCategory > 0) {
      setCurrentCategory(curr => curr - 1);
      setCurrentWord(words[currentCategory - 1].words.length - 1);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!words.length) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="text-center">No words available.</div>
      </div>
    );
  }

  const currentCategoryData = words[currentCategory];
  const currentWordData = currentCategoryData.words[currentWord];

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Study Mode Toggle */}
      <div className="flex justify-center gap-4 mb-6">
        <Button
          variant={studyMode === 'learn' ? "default" : "outline"}
          onClick={() => setStudyMode('learn')}
          className={`w-32 ${
            studyMode === 'learn' 
              ? 'bg-gradient-to-r from-vividPurple to-magentaPink hover:from-magentaPink hover:to-vividPurple' 
              : 'hover:bg-softPurple/20'
          }`}
        >
          <BookOpen className="mr-2 h-4 w-4" />
          Learn 📚
        </Button>
        <Button
          variant={studyMode === 'review' ? "default" : "outline"}
          onClick={() => setStudyMode('review')}
          className={`w-32 ${
            studyMode === 'review' 
              ? 'bg-gradient-to-r from-vividPurple to-magentaPink hover:from-magentaPink hover:to-vividPurple' 
              : 'hover:bg-softPurple/20'
          }`}
        >
          <Rotate3D className="mr-2 h-4 w-4" />
          Review 🔄
        </Button>
      </div>

      {/* Category Selector */}
      <CategorySelector 
        categories={words}
        activeCategory={currentCategory}
        onSelect={(idx) => {
          setCurrentCategory(idx);
          setCurrentWord(0);
          setIsFlipped(false);
        }}
      />

      {/* Progress Bar */}
      <div className="w-full h-2 bg-softGray rounded-full mb-6">
        <div 
          className="h-full bg-gradient-to-r from-vividPurple to-magentaPink rounded-full transition-all duration-300"
          style={{
            width: `${((currentWord + 1) / currentCategoryData.words.length) * 100}%`
          }}
        />
      </div>

      {/* Flashcard and Navigation Container */}
      <div className="flex flex-col items-center gap-6">
        {/* Flashcard */}
        <FlashCard 
          word={currentWordData}
          isFlipped={isFlipped}
          onFlip={() => setIsFlipped(!isFlipped)}
        />

        {/* Navigation Controls */}
        <div className="flex gap-4">
          <Button
            onClick={prevWord}
            disabled={currentCategory === 0 && currentWord === 0}
            className="w-32 bg-gradient-to-r from-vividPurple to-magentaPink hover:from-magentaPink hover:to-vividPurple disabled:opacity-50"
          >
            <ChevronLeft className="mr-2" />
            Previous ⬅️
          </Button>

          <Button
            onClick={nextWord}
            disabled={
              currentCategory === words.length - 1 &&
              currentWord === words[currentCategory].words.length - 1
            }
            className="w-32 bg-gradient-to-r from-vividPurple to-magentaPink hover:from-magentaPink hover:to-vividPurple disabled:opacity-50"
          >
            Next ➡️
            <ChevronRight className="ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ThematicLearning;