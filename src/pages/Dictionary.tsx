import { useState } from 'react';
import { Search, Book, X, ThumbsUp, ThumbsDown } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import SearchMicrophone from '@/components/SearchMicrophone';
import { Header1 } from '@/components/ui/header';
import { useToast } from '@/hooks/use-toast';

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
  const [searchTerm, setSearchTerm] = useState('');
  const [isActive, setIsActive] = useState(false);
  const { toast } = useToast();

  const { data: searchResults, isLoading } = useQuery({
    queryKey: ['hebrewWords', searchTerm],
    queryFn: async () => {
      if (!searchTerm) return [];
      
      console.log('Searching for:', searchTerm);
      
      const trimmedSearch = searchTerm.trim().toLowerCase();
      if (!trimmedSearch) return [];

      // First, try to find exact matches
      const { data: exactMatches, error: exactError } = await supabase
        .from('hebrew_bulk_words')
        .select('hebrew, english, transliteration')
        .ilike('english', trimmedSearch)
        .order('word_number', { ascending: true });

      if (exactError) {
        console.error('Error fetching exact matches:', exactError);
        throw exactError;
      }

      // Then, find partial matches if we don't have exact matches
      if (!exactMatches?.length) {
        const { data: partialMatches, error: partialError } = await supabase
          .from('hebrew_bulk_words')
          .select('hebrew, english, transliteration')
          .or(`english.ilike.%${trimmedSearch}%,transliteration.ilike.%${trimmedSearch}%`)
          .order('word_number', { ascending: true });

        if (partialError) {
          console.error('Error fetching partial matches:', partialError);
          throw partialError;
        }

        return partialMatches || [];
      }

      return exactMatches;
    },
    enabled: searchTerm.length > 0
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
        title: "Thank you for your feedback!",
        description: `Your ${isPositive ? 'positive' : 'negative'} feedback has been recorded.`,
        duration: 3000,
      });
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast({
        title: "Error",
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
    if (!searchTerm) {
      setIsActive(false);
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
    setIsActive(false);
  };

  const handleVoiceResult = (text: string) => {
    if (text) {
      console.log('Setting search term to:', text);
      setSearchTerm(text);
      setIsActive(true);
    }
  };

  return (
    <>
      <Header1 />
      <div className="w-full min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 pt-20 p-6 flex flex-col items-center">
        <div className="w-full max-w-3xl">
          <div className={`transition-all duration-300 ${isActive ? 'mb-6' : 'mb-32'}`}>
            <h1 className={`text-center font-bold transition-all duration-300 ${isActive ? 'text-2xl mb-2' : 'text-5xl mb-6'}`}>
              Hebrew Dictionary
            </h1>
            <p className={`text-center text-gray-600 transition-all duration-300 ${isActive ? 'text-sm' : 'text-lg'}`}>
              Search by English or transliteration
            </p>
          </div>

          <div className="relative group">
            <div className={`absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-xl opacity-70 blur transition-all duration-300 group-hover:opacity-100 ${isActive ? 'blur-md' : 'blur'}`} />
            <div className="relative bg-white rounded-xl shadow-xl overflow-hidden">
              <div className="flex items-center px-6 py-4">
                <Search className={`h-6 w-6 transition-all duration-300 ${isActive ? 'text-purple-500' : 'text-gray-400'}`} />
                <input
                  type="text"
                  className="w-full px-4 py-2 text-lg focus:outline-none"
                  placeholder="Type in English or transliteration..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onFocus={handleSearchFocus}
                  onBlur={handleSearchBlur}
                />
                <div className="flex items-center gap-2">
                  <SearchMicrophone onTranscription={handleVoiceResult} />
                  {searchTerm && (
                    <button onClick={clearSearch} className="text-gray-400 hover:text-gray-600">
                      <X className="h-5 w-5" />
                    </button>
                  )}
                </div>
              </div>

              {isActive && (
                <div className="border-t border-gray-100">
                  {searchTerm ? (
                    <div className="divide-y divide-gray-100">
                      {isLoading ? (
                        <div className="p-4 text-center text-gray-500">
                          Searching...
                        </div>
                      ) : Object.values(groupedResults).length > 0 ? (
                        Object.values(groupedResults).map((result, index) => (
                          <div key={index} className="p-4 hover:bg-gray-50 transition-colors duration-150">
                            <div className="flex justify-between items-start mb-2">
                              <span className="text-sm text-purple-500 font-medium">word</span>
                              <div className="text-sm text-gray-500 text-right">
                                {Array.from(result.transliterations).join(', ') || 'N/A'}
                              </div>
                            </div>
                            <div className="flex justify-between items-center">
                              <div className="flex flex-col">
                                {Array.from(result.translations).map((translation, i) => (
                                  <span key={i} className="text-gray-700">
                                    {translation}
                                    {i < result.translations.size - 1 && ','}
                                  </span>
                                ))}
                              </div>
                              <div className="flex items-center gap-6">
                                <div className="flex gap-4">
                                  <button
                                    onClick={() => handleFeedback(result.hebrew, Array.from(result.translations)[0], true)}
                                    className="p-2 hover:bg-green-50 rounded-full transition-colors"
                                    aria-label="Correct translation"
                                  >
                                    <ThumbsUp className="h-5 w-5 text-green-600" />
                                  </button>
                                  <button
                                    onClick={() => handleFeedback(result.hebrew, Array.from(result.translations)[0], false)}
                                    className="p-2 hover:bg-red-50 rounded-full transition-colors"
                                    aria-label="Incorrect translation"
                                  >
                                    <ThumbsDown className="h-5 w-5 text-red-600" />
                                  </button>
                                </div>
                                <span className="text-2xl font-bold text-gray-800 mr-2" dir="rtl">{result.hebrew}</span>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-4 text-center text-gray-500">
                          No results found
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-8 text-center text-gray-500">
                      <Book className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <p>Start typing to search for Hebrew words</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dictionary;