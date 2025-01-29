import { useState } from 'react';
import { Book } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Header1 } from '@/components/ui/header';
import { useToast } from '@/hooks/use-toast';
import { SearchBar } from '@/components/dictionary/SearchBar';
import { SearchResults } from '@/components/dictionary/SearchResults';

interface HebrewWord {
  hebrew: string;
  english: string;
  transliteration: string | null;
}

const groupByHebrew = (words: HebrewWord[]) => {
  return words.reduce((acc, curr) => {
    if (!acc[curr.hebrew]) {
      acc[curr.hebrew] = {
        hebrew: curr.hebrew,
        translations: new Set([curr.english]),
        transliterations: new Set([curr.transliteration].filter(Boolean))
      };
    } else {
      acc[curr.hebrew].translations.add(curr.english);
      if (curr.transliteration) {
        acc[curr.hebrew].transliterations.add(curr.transliteration);
      }
    }
    return acc;
  }, {} as Record<string, { 
    hebrew: string, 
    translations: Set<string>, 
    transliterations: Set<string> 
  }>);
};

const Dictionary = () => {
  const [englishSearchTerm, setEnglishSearchTerm] = useState('');
  const [hebrewSearchTerm, setHebrewSearchTerm] = useState('');
  const [isActive, setIsActive] = useState(false);
  const { toast } = useToast();

  const { data: searchResults, isLoading } = useQuery({
    queryKey: ['hebrewWords', englishSearchTerm, hebrewSearchTerm],
    queryFn: async () => {
      if (!englishSearchTerm && !hebrewSearchTerm) return [];
      
      const trimmedEnglishSearch = englishSearchTerm.trim().toLowerCase();
      const trimmedHebrewSearch = hebrewSearchTerm.trim();
      
      if (!trimmedEnglishSearch && !trimmedHebrewSearch) return [];

      const { data: matches, error } = await supabase
        .from('hebrew_bulk_words')
        .select('hebrew, english, transliteration')
        .or(`english.ilike.%${trimmedEnglishSearch}%,english.ilike.% ${trimmedEnglishSearch}%,english.ilike.${trimmedEnglishSearch}%`)
        .order('word_number', { ascending: true });

      if (error) {
        console.error('Error fetching matches:', error);
        throw error;
      }

      return matches || [];
    },
    enabled: englishSearchTerm.length > 0 || hebrewSearchTerm.length > 0
  });

  const handleFeedback = async (hebrew: string, english: string, isPositive: boolean) => {
    try {
      const { error } = await supabase.rpc('update_word_feedback', {
        p_hebrew: hebrew,
        p_english: english,
        p_is_positive: isPositive
      });

      if (error) throw error;

      toast({
        title: "Thank you for your feedback! ✨",
        description: `Your ${isPositive ? 'positive' : 'negative'} feedback has been recorded.`,
        duration: 3000,
      });
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast({
        title: "Error 😕",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const groupedResults = searchResults ? groupByHebrew(searchResults) : {};

  const handleSearchFocus = () => {
    setIsActive(true);
  };

  const handleSearchBlur = () => {
    if (!englishSearchTerm && !hebrewSearchTerm) {
      setIsActive(false);
    }
  };

  const clearSearch = () => {
    setEnglishSearchTerm('');
    setHebrewSearchTerm('');
    setIsActive(false);
  };

  const handleVoiceResult = (text: string) => {
    setEnglishSearchTerm(text);
    setIsActive(true);
  };

  return (
    <>
      <Header1 />
      <div className="w-full min-h-screen bg-gradient-to-br from-[#8B5CF6]/10 to-[#D946EF]/10 pt-20 p-6 flex flex-col items-center">
        <div className="w-full max-w-3xl">
          <div className={`transition-all duration-300 ${isActive ? 'mb-6' : 'mb-32'}`}>
            <h1 className={`text-center font-bold transition-all duration-300 ${isActive ? 'text-2xl mb-2' : 'text-5xl mb-6'}`}>
              Hebrew Dictionary 📚
            </h1>
            <p className={`text-center text-gray-600 transition-all duration-300 ${isActive ? 'text-sm' : 'text-lg'}`}>
              Search in English or Hebrew 🔍
            </p>
          </div>

          <div className="relative space-y-12">
            <SearchBar
              searchTerm={englishSearchTerm}
              onSearchChange={setEnglishSearchTerm}
              onClear={clearSearch}
              onVoiceResult={handleVoiceResult}
              isActive={isActive}
            />

            {isActive && (
              <div className="relative bg-white rounded-xl shadow-xl overflow-hidden border-t border-gray-100">
                {searchResults ? (
                  <SearchResults
                    groupedResults={groupedResults}
                    onFeedback={handleFeedback}
                    isLoading={isLoading}
                  />
                ) : (
                  <div className="p-8 text-center text-gray-500">
                    <Book className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p>Start typing to search for Hebrew words 📖</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Dictionary;