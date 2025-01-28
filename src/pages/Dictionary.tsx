import { useState } from 'react';
import { Search, Book, X } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

interface HebrewWord {
  hebrew: string;
  english: string;
  transliteration: string | null;
}

const Dictionary = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isActive, setIsActive] = useState(false);

  const { data: searchResults, isLoading } = useQuery({
    queryKey: ['hebrewWords', searchTerm],
    queryFn: async () => {
      if (!searchTerm) return [];
      
      console.log('Searching for:', searchTerm); // Debug log
      
      const { data, error } = await supabase
        .from('hebrew_bulk_words')
        .select('hebrew, english, transliteration')
        .ilike('english', `%${searchTerm}%`)
        .limit(10);

      if (error) {
        console.error('Error fetching words:', error);
        return [];
      }

      console.log('Search results:', data); // Debug log
      return data || [];
    },
    enabled: searchTerm.length > 0
  });

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

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6 flex flex-col items-center">
      {/* Main Container */}
      <div className="w-full max-w-3xl">
        {/* Header */}
        <div className={`transition-all duration-300 ${isActive ? 'mb-6' : 'mb-32'}`}>
          <h1 className={`text-center font-bold transition-all duration-300 ${isActive ? 'text-2xl mb-2' : 'text-5xl mb-6'}`}>
            Hebrew Dictionary
          </h1>
          <p className={`text-center text-gray-600 transition-all duration-300 ${isActive ? 'text-sm' : 'text-lg'}`}>
            Discover the meaning of Hebrew words
          </p>
        </div>

        {/* Search Box */}
        <div className="relative group">
          <div className={`absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-xl opacity-70 blur transition-all duration-300 group-hover:opacity-100 ${isActive ? 'blur-md' : 'blur'}`} />
          <div className="relative bg-white rounded-xl shadow-xl overflow-hidden">
            <div className="flex items-center px-6 py-4">
              <Search className={`h-6 w-6 transition-all duration-300 ${isActive ? 'text-purple-500' : 'text-gray-400'}`} />
              <input
                type="text"
                className="w-full px-4 py-2 text-lg focus:outline-none"
                placeholder="Type in English..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={handleSearchFocus}
                onBlur={handleSearchBlur}
              />
              {searchTerm && (
                <button onClick={clearSearch} className="text-gray-400 hover:text-gray-600">
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>

            {/* Results Section - only shown when active */}
            {isActive && (
              <div className="border-t border-gray-100">
                {searchTerm ? (
                  <div className="divide-y divide-gray-100">
                    {isLoading ? (
                      <div className="p-4 text-center text-gray-500">
                        Searching...
                      </div>
                    ) : searchResults && searchResults.length > 0 ? (
                      searchResults.map((result, index) => (
                        <div key={index} className="p-4 hover:bg-gray-50 transition-colors duration-150">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-purple-500 font-medium">word</span>
                            <span className="text-sm text-gray-500">{result.transliteration || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-700">{result.english}</span>
                            <span className="text-2xl font-bold text-gray-800" dir="rtl">{result.hebrew}</span>
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
  );
};

export default Dictionary;