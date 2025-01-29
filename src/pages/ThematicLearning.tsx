import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { StudyModeToggle } from '@/components/thematic/StudyModeToggle';
import { CategorySelector } from '@/components/thematic/CategorySelector';
import { ProgressBar } from '@/components/thematic/ProgressBar';
import { NavigationControls } from '@/components/thematic/NavigationControls';
import FlashCard from '@/components/FlashCard';

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

      const groupedWords = data.reduce((acc: { [key: string]: any[] }, word) => {
        if (!acc[word.category]) {
          acc[word.category] = [];
        }
        acc[word.category].push(word);
        return acc;
      }, {});

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
      <StudyModeToggle 
        studyMode={studyMode} 
        onModeChange={setStudyMode} 
      />

      <CategorySelector 
        categories={words}
        activeCategory={currentCategory}
        onSelect={(idx) => {
          setCurrentCategory(idx);
          setCurrentWord(0);
          setIsFlipped(false);
        }}
      />

      <ProgressBar 
        current={currentWord} 
        total={currentCategoryData.words.length} 
      />

      <div className="flex flex-col items-center gap-6">
        <FlashCard 
          word={currentWordData}
          isFlipped={isFlipped}
          onFlip={() => setIsFlipped(!isFlipped)}
        />

        <NavigationControls 
          onPrevious={prevWord}
          onNext={nextWord}
          isFirstItem={currentCategory === 0 && currentWord === 0}
          isLastItem={
            currentCategory === words.length - 1 &&
            currentWord === words[currentCategory].words.length - 1
          }
        />
      </div>
    </div>
  );
};

export default ThematicLearning;