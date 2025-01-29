import { Search, X } from 'lucide-react';
import SearchMicrophone from '@/components/SearchMicrophone';

interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onClear: () => void;
  onVoiceResult: (text: string) => void;
  isActive: boolean;
}

export const SearchBar = ({
  searchTerm,
  onSearchChange,
  onClear,
  onVoiceResult,
  isActive
}: SearchBarProps) => {
  return (
    <div className="relative bg-white rounded-xl shadow-xl overflow-hidden">
      <div className="flex items-center px-6 py-4">
        <Search className={`h-6 w-6 transition-all duration-300 ${isActive ? 'text-vividPurple' : 'text-gray-400'}`} />
        <input
          type="text"
          className="w-full px-4 py-2 text-lg focus:outline-none"
          placeholder="Search Hebrew dictionary... 📚"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        <div className="flex items-center gap-2">
          <SearchMicrophone onTranscription={onVoiceResult} />
          {searchTerm && (
            <button onClick={onClear} className="text-gray-400 hover:text-gray-600">
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};