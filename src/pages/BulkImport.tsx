import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Header1 } from "@/components/ui/header";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface WordEntry {
  rank?: number;
  hebrew: string;
  english: string;
  transliteration?: string;
}

const BulkImport = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [importedCount, setImportedCount] = useState(0);

  const validateHebrewText = (text: string): boolean => {
    const hebrewRegex = /[\u0590-\u05FF]/;
    return hebrewRegex.test(text);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
      setError(null);
      setSuccess(false);
    }
  };

  const parseJsonFile = (jsonContent: string) => {
    const words: WordEntry[] = JSON.parse(jsonContent);
    
    if (!Array.isArray(words)) {
      throw new Error("JSON content must be an array of word entries");
    }
    
    return words.map((entry, index) => {
      if (!entry.hebrew || !entry.english) {
        throw new Error(`Invalid entry at index ${index}. Each entry must contain hebrew and english fields.`);
      }
      
      if (!validateHebrewText(entry.hebrew)) {
        throw new Error(`Invalid Hebrew text at index ${index}`);
      }
      
      return {
        word_number: entry.rank || index + 1,
        hebrew: entry.hebrew,
        english: entry.english,
        transliteration: entry.transliteration || null
      };
    });
  };

  const handleImport = async () => {
    try {
      if (!file) {
        setError("Please select a file to import");
        return;
      }

      setIsLoading(true);
      setError(null);
      setSuccess(false);

      const fileContent = await file.text();
      const words = parseJsonFile(fileContent);
      
      if (words.length === 0) {
        throw new Error("No valid words found to import");
      }

      const { error: supabaseError } = await supabase
        .from('hebrew_bulk_words')
        .insert(words);

      if (supabaseError) {
        console.error('Supabase error:', supabaseError);
        throw new Error("Failed to import words to database");
      }

      setSuccess(true);
      setImportedCount(words.length);
      toast.success(`Successfully imported ${words.length} words!`);
      
      // Clear the form
      setFile(null);
      if (event?.target) {
        (event.target as HTMLFormElement).reset();
      }
      
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
                  Successfully imported {importedCount} words!
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                Upload a JSON file containing an array of word entries in the following format:
              </p>
              <pre className="bg-gray-100 p-4 rounded-md text-sm">
{`[
  {
    "rank": 1,
    "hebrew": "של",
    "english": "of / belongs to",
    "transliteration": "shel"
  }
]`}
              </pre>
            </div>

            <Input
              type="file"
              accept=".json"
              onChange={handleFileChange}
              className="cursor-pointer"
              disabled={isLoading}
            />

            <div className="flex gap-4">
              <Button 
                onClick={handleImport}
                disabled={isLoading || !file}
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