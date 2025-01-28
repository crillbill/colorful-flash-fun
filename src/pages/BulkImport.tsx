import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Header1 } from "@/components/ui/header";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

interface WordEntry {
  word_number: number;
  hebrew: string;
  english: string;
  transliteration?: string;
}

const BulkImport = () => {
  const navigate = useNavigate();
  const [text, setText] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [importedCount, setImportedCount] = useState(0);

  const validateHebrewText = (text: string): boolean => {
    // Hebrew Unicode range including vowel marks and special characters
    const hebrewRegex = /[\u0590-\u05FF\u0600-\u06FF\u200f\u200e]/;
    return hebrewRegex.test(text);
  };

  const sanitizeText = (text: string): string => {
    // Remove special characters but keep Hebrew, English, spaces, and basic punctuation
    return text.replace(/[^\w\s\u0590-\u05FF\u0600-\u06FF.,'-]/g, '').trim();
  };

  const parseDelimitedText = (content: string): WordEntry[] => {
    console.log("Parsing delimited content:", content);
    
    const lines = content.split('\n').filter(line => line.trim());
    const words: WordEntry[] = [];
    let currentWordNumber = 1;
    
    for (const line of lines) {
      // Skip category headers (lines ending with :)
      if (line.trim().endsWith(':')) continue;
      
      console.log(`Processing line ${currentWordNumber - 1}:`, line);
      
      const [english = '', hebrew = '', transliteration = ''] = line.split('|').map(part => part.trim());
      
      if (!english || !hebrew) {
        console.log("Skipping invalid line:", line);
        continue;
      }
      
      // Sanitize both Hebrew and English text
      const sanitizedHebrew = sanitizeText(hebrew);
      const sanitizedEnglish = sanitizeText(english);
      const sanitizedTransliteration = transliteration ? sanitizeText(transliteration) : null;
      
      if (!validateHebrewText(sanitizedHebrew)) {
        console.log("Invalid Hebrew text:", sanitizedHebrew);
        continue;
      }
      
      words.push({
        word_number: currentWordNumber,
        hebrew: sanitizedHebrew,
        english: sanitizedEnglish,
        transliteration: sanitizedTransliteration
      });
      
      currentWordNumber++;
    }
    
    return words;
  };

  const handleImport = async () => {
    try {
      if (!text.trim()) {
        setError("Please enter some text to import");
        return;
      }

      setIsLoading(true);
      setError(null);
      setSuccess(false);

      console.log("Processing text content:", text);
      
      const words = parseDelimitedText(text);
      console.log("Parsed words:", words);
      
      if (words.length === 0) {
        throw new Error("No valid words found to import");
      }

      // Insert words in chunks to handle large datasets
      const CHUNK_SIZE = 50;
      let successCount = 0;
      
      for (let i = 0; i < words.length; i += CHUNK_SIZE) {
        const chunk = words.slice(i, i + CHUNK_SIZE);
        const { error: supabaseError } = await supabase
          .from('hebrew_word_dump')
          .insert(chunk);

        if (supabaseError) {
          console.error('Supabase error:', supabaseError);
          throw new Error(`Failed to import words (chunk ${i / CHUNK_SIZE + 1})`);
        }
        
        successCount += chunk.length;
      }

      setSuccess(true);
      setImportedCount(successCount);
      toast.success(`Successfully imported ${successCount} words to dump table!`);
      
      // Clear the form
      setText("");
      
    } catch (err) {
      console.error('Import error:', err);
      const errorMessage = err instanceof Error ? err.message : "Failed to import words";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-softPurple via-white to-softPeach p-8">
      <Header1 />
      <div className="max-w-4xl mx-auto mt-16">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Import Bulk Words</h2>
            
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert>
                <AlertDescription className="text-green-600">
                  Successfully imported {importedCount} words to dump table!
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                Paste your word list below with each word on a new line in the following format:
              </p>
              <pre className="bg-gray-100 p-4 rounded-md text-sm">
{`english|hebrew|transliteration
fish|דג|Dag
bird|ציפור|Tzipor`}
              </pre>
              <p className="text-sm text-gray-500">
                Note: Special characters will be automatically removed from the text. Category headers ending with ':' will be skipped.
              </p>
            </div>

            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste your word list here..."
              className="min-h-[400px] font-mono"
              disabled={isLoading}
            />

            <div className="flex gap-4">
              <Button 
                onClick={handleImport}
                disabled={isLoading || !text.trim()}
                className="flex-1"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Importing...
                  </>
                ) : (
                  "Import"
                )}
              </Button>

              <Button
                variant="outline"
                onClick={() => navigate("/")}
                className="flex-1"
              >
                Back to Home
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkImport;
