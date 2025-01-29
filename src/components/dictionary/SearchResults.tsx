import { ThumbsUp, ThumbsDown } from 'lucide-react';

interface SearchResultsProps {
  groupedResults: Record<string, { 
    hebrew: string, 
    translations: Set<string>, 
    transliterations: Set<string> 
  }>;
  onFeedback: (hebrew: string, english: string, isPositive: boolean) => Promise<void>;
  isLoading: boolean;
}

export const SearchResults = ({ groupedResults, onFeedback, isLoading }: SearchResultsProps) => {
  if (isLoading) {
    return (
      <div className="p-4 text-center text-gray-500">
        Searching... 🔍
      </div>
    );
  }

  if (Object.values(groupedResults).length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        <p>Start typing to search for Hebrew words ✨</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-100">
      {Object.values(groupedResults).map((result, index) => (
        <div key={index} className="p-4 hover:bg-gray-50 transition-colors duration-150">
          <div className="flex justify-between items-center gap-4">
            <div className="flex-1">
              <span className="text-sm text-vividPurple font-medium">word</span>
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
                onClick={() => onFeedback(result.hebrew, Array.from(result.translations)[0], true)}
                className="p-2 hover:bg-green-50 rounded-full transition-colors"
                aria-label="Correct translation"
              >
                <ThumbsUp className="h-5 w-5 text-green-600" />
              </button>
              <button
                onClick={() => onFeedback(result.hebrew, Array.from(result.translations)[0], false)}
                className="p-2 hover:bg-red-50 rounded-full transition-colors"
                aria-label="Incorrect translation"
              >
                <ThumbsDown className="h-5 w-5 text-red-600" />
              </button>
            </div>

            <div className="min-w-[120px] text-right">
              <span className="text-2xl font-bold text-gray-800 animate-float" dir="rtl">{result.hebrew}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};