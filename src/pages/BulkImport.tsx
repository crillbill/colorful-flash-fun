import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Header1 } from "@/components/ui/header";
import { Alert, AlertDescription } from "@/components/ui/alert";

const BulkImport = () => {
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateHebrewText = (text: string): boolean => {
    const hebrewRegex = /[\u0590-\u05FF]/;
    return hebrewRegex.test(text);
  };

  const validateEnglishText = (text: string): boolean => {
    const englishRegex = /^[a-zA-Z0-9\s.,!?'"-]+$/;
    return englishRegex.test(text);
  };

  const parseInput = (text: string) => {
    setError(null);
    const lines = text.split('\n').filter(line => line.trim());
    
    const parsedEntries = lines.map((line, index) => {
      const parts = line.split(/\s{2,}/).map(part => part.trim());
      
      if (parts.length < 3) {
        throw new Error(`Line ${index + 1}: Invalid format. Each line must contain Word Number, Hebrew, and English separated by two spaces.`);
      }

      const [wordNumber, hebrew, english, transliteration] = parts;
      
      if (!wordNumber || !hebrew || !english) {
        throw new Error(`Line ${index + 1}: Missing required fields. Format should be: Number  Hebrew  English  Transliteration`);
      }

      const numberValue = parseInt(wordNumber);
      if (isNaN(numberValue)) {
        throw new Error(`Line ${index + 1}: Word number must be a valid number`);
      }
      
      if (!validateHebrewText(hebrew)) {
        throw new Error(`Line ${index + 1}: Text "${hebrew}" must contain Hebrew characters`);
      }

      if (!validateEnglishText(english)) {
        throw new Error(`Line ${index + 1}: Text "${english}" contains invalid characters`);
      }
      
      return {
        word_number: numberValue,
        hebrew,
        english,
        transliteration: transliteration || null,
      };
    });

    return parsedEntries;
  };

  const handleImport = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const entries = parseInput(inputText);
      
      if (entries.length === 0) {
        toast.error("No valid entries found");
        return;
      }

      const { error: supabaseError } = await supabase
        .from('hebrew_bulk_words')
        .insert(entries);

      if (supabaseError) throw supabaseError;

      toast.success(`Successfully imported ${entries.length} entries`);
      setInputText("");
    } catch (error: any) {
      console.error('Import error:', error);
      setError(error.message);
      toast.error(error.message || "Failed to import entries");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Header1 />
      <div className="min-h-screen bg-white p-8 pt-24">
        <div className="max-w-2xl mx-auto space-y-8">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Import Bulk Words</h2>
            
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Paste your content (separate fields with TWO spaces)
              </label>
              <p className="text-sm text-muted-foreground">
                Each entry on a new line. Format: Word Number  Hebrew  English  Transliteration (optional)
              </p>
              <pre className="bg-gray-100 p-2 rounded text-sm">
                1  שָׁלוֹם  Hello  sha-LOM
                2  תּוֹדָה  Thank you  to-DAH
              </pre>
              <Textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="1  שָׁלוֹם  Hello  sha-LOM"
                className="min-h-[200px] font-mono"
              />
            </div>

            <Button 
              onClick={handleImport}
              disabled={isLoading || !inputText.trim()}
            >
              {isLoading ? "Importing..." : "Import"}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default BulkImport;