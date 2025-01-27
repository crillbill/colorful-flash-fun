import React from 'react';
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import type { HebrewWord } from '@/types/wordSearch';

interface WordListProps {
  words: HebrewWord[];
  foundWords: Set<string>;
  revealedWords: Set<string>;
  onRevealWord: (word: string) => void;
}

export const WordList: React.FC<WordListProps> = ({
  words,
  foundWords,
  revealedWords,
  onRevealWord,
}) => {
  return (
    <div className="space-y-2">
      <h2 className="text-xl font-semibold">Words to Find:</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {words.map(({ hebrew, english, transliteration }) => {
          const isFound = foundWords.has(hebrew);
          const isRevealed = revealedWords.has(hebrew);
          return (
            <Popover key={hebrew}>
              <PopoverTrigger asChild>
                <div
                  className={`p-2 rounded-md cursor-pointer transition-all
                    ${isFound ? 'bg-green-500 text-white' : 'bg-card hover:bg-accent/50'}`}
                  onClick={() => !isFound && onRevealWord(hebrew)}
                >
                  <div className="text-base font-bold">
                    {isFound || isRevealed ? hebrew : '• • • •'}
                  </div>
                  {(isFound || isRevealed) && (
                    <>
                      <div className="text-sm">{english}</div>
                      {transliteration && (
                        <div className="text-xs opacity-75">{transliteration}</div>
                      )}
                    </>
                  )}
                </div>
              </PopoverTrigger>
              <PopoverContent className="w-48">
                <div className="space-y-1">
                  <p className="font-semibold">{hebrew}</p>
                  <p className="text-sm">{english}</p>
                  {transliteration && (
                    <p className="text-xs text-muted-foreground">{transliteration}</p>
                  )}
                </div>
              </PopoverContent>
            </Popover>
          );
        })}
      </div>
    </div>
  );
};