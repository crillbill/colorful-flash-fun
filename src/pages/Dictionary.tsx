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
  const [englishSearchTerm, setEnglishSearchTerm] = useState('');
  const [hebrewSearchTerm, setHebrewSearchTerm] = useState('');
  const [isActive, setIsActive] = useState(false);
  const { toast } = useToast();

  const { data: searchResults, isLoading } = useQuery({
    queryKey: ['hebrewWords', englishSearchTerm, hebrewSearchTerm],
    queryFn: async () => {
      if (!englishSearchTerm && !hebrewSearchTerm) return [];
      
      console.log('Searching for:', { english: englishSearchTerm, hebrew: hebrewSearchTerm });
      
      const trimmedEnglishSearch = englishSearchTerm.trim().toLowerCase();
      const trimmedHebrewSearch = hebrewSearchTerm.trim();
      
      if (!trimmedEnglishSearch && !trimmedHebrewSearch) return [];

      const { data: matches, error } = await supabase
        .from('hebrew_bulk_words')
        .select('hebrew, english, transliteration')
        .or(
          `english.ilike.%${trimmedEnglishSearch}%,` +
          `hebrew.ilike.%${trimmedHebrewSearch}%,` +
          `transliteration.ilike.%${trimmedEnglishSearch}%`
        )
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
      <div className="w-full min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 pt-20 p-6 flex flex-col items-center">
        <div className="w-full max-w-3xl">
          <div className={`transition-all duration-300 ${isActive ? 'mb-6' : 'mb-32'}`}>
            <h1 className={`text-center font-bold transition-all duration-300 ${isActive ? 'text-2xl mb-2' : 'text-5xl mb-6'}`}>
              Hebrew Dictionary
            </h1>
            <p className={`text-center text-gray-600 transition-all duration-300 ${isActive ? 'text-sm' : 'text-lg'}`}>
              Search in English or Hebrew
            </p>
          </div>

          <div className="relative group space-y-12">
            <div className={`absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-xl opacity-70 blur transition-all duration-300 group-hover:opacity-100 ${isActive ? 'blur-md' : 'blur'}`} />
            
            {/* English to Hebrew Search */}
            <div className="relative bg-white rounded-xl shadow-xl overflow-hidden">
              <div className="flex items-center px-6 py-4">
                <Search className={`h-6 w-6 transition-all duration-300 ${isActive ? 'text-purple-500' : 'text-gray-400'}`} />
                <input
                  type="text"
                  className="w-full px-4 py-2 text-lg focus:outline-none"
                  placeholder="English to Hebrew..."
                  value={englishSearchTerm}
                  onChange={(e) => setEnglishSearchTerm(e.target.value)}
                  onFocus={handleSearchFocus}
                  onBlur={handleSearchBlur}
                />
                <div className="flex items-center gap-2">
                  <SearchMicrophone onTranscription={handleVoiceResult} />
                  {englishSearchTerm && (
                    <button onClick={clearSearch} className="text-gray-400 hover:text-gray-600">
                      <X className="h-5 w-5" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Hebrew to English Title */}
            <div className="text-center mt-12 mb-4">
              <h2 className="text-xl font-semibold mb-1">Hebrew to English</h2>
              <p className="text-lg font-medium text-gray-600" dir="rtl">עברית לאנגלית</p>
            </div>

            {/* Hebrew to English Search */}
            <div className="relative bg-white rounded-xl shadow-xl overflow-hidden mt-4">
              <div className="flex items-center px-6 py-4">
                <Search className={`h-6 w-6 transition-all duration-300 ${isActive ? 'text-purple-500' : 'text-gray-400'}`} />
                <input
                  type="text"
                  dir="rtl"
                  className="w-full px-4 py-2 text-lg focus:outline-none text-right"
                  placeholder="חיפוש מעברית לאנגלית..."
                  value={hebrewSearchTerm}
                  onChange={(e) => setHebrewSearchTerm(e.target.value)}
                  onFocus={handleSearchFocus}
                  onBlur={handleSearchBlur}
                />
                {hebrewSearchTerm && (
                  <button onClick={clearSearch} className="text-gray-400 hover:text-gray-600">
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>
            </div>

            {isActive && (
              <div className="relative bg-white rounded-xl shadow-xl overflow-hidden border-t border-gray-100">
                {searchResults ? (
                  <div className="divide-y divide-gray-100">
                    {isLoading ? (
                      <div className="p-4 text-center text-gray-500">
                        Searching...
                      </div>
                    ) : Object.values(groupedResults).length > 0 ? (
                      Object.values(groupedResults).map((result, index) => (
                        <div key={index} className="p-4 hover:bg-gray-50 transition-colors duration-150">
                          <div className="flex justify-between items-center gap-4">
                            <div className="flex-1">
                              <span className="text-sm text-purple-500 font-medium">word</span>
                              <div className="text-sm text-gray-500">
                                {Array.from(result.transliterations).join(', ') || 'N/A'}
                              </div>
                              <div className="mt-1">
                                {Array.from(result.translations).map((translation, i) => (
                                  <span key={i} className="text-gray-700">
                                    {translation}
                                    {i < result.translations.size - 1 && ', '}
                                  </span>
                                ))}
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-4">
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

                            <div className="min-w-[120px] text-right">
                              <span className="text-2xl font-bold text-gray-800" dir="rtl">{result.hebrew}</span>
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
    </>
  );
};

export default Dictionary;