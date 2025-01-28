import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Header1 } from "@/components/ui/header";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const BulkImport = () => {
  const navigate = useNavigate();
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateHebrewText = (text: string): boolean => {
    const hebrewRegex = /[\u0590-\u05FF]/;
    return hebrewRegex.test(text);
  };

  const parseInput = (text: string) => {
    const lines = text.trim().split('\n');
    const words = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const [hebrew, english, transliteration] = line.split(',').map(item => item?.trim());
      
      if (!hebrew || !english) {
        throw new Error(`Invalid format at line ${i + 1}. Each line must contain at least Hebrew and English words separated by commas.`);
      }
      
      if (!validateHebrewText(hebrew)) {
        throw new Error(`Invalid Hebrew text at line ${i + 1}`);
      }
      
      words.push({
        word_number: i + 1,
        hebrew,
        english,
        transliteration: transliteration || null
      });
    }
    
    return words;
  };

  const handleImport = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const words = parseInput(inputText);
      
      if (words.length === 0) {
        throw new Error("No valid words found to import");
      }

      const { error: supabaseError } = await supabase
        .from('hebrew_bulk_words')
        .insert(words);

      if (supabaseError) throw supabaseError;

      toast.success("Words imported successfully!");
      setInputText("");
      navigate("/");
    } catch (err) {
      console.error('Import error:', err);
      setError(err instanceof Error ? err.message : "Failed to import words");
      toast.error("Failed to import words");
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

            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                Enter your words in the following format (one per line):
                <br />
                Hebrew word, English translation, Transliteration (optional)
              </p>
              <p className="text-sm text-gray-500 italic">
                Example: שָׁלוֹם, hello, shalom
              </p>
            </div>

            <Textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Enter your words here..."
              className="min-h-[200px]"
            />

            <Button 
              onClick={handleImport}
              disabled={isLoading || !inputText.trim()}
            >
              {isLoading ? "Importing..." : "Import"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkImport;