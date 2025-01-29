import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Header1 } from "@/components/ui/header";
import { Alert, AlertDescription } from "@/components/ui/alert";

type TableOption = "hebrew_words" | "hebrew_phrases" | "hebrew_alphabet" | "hebrew_verbs" | "hebrew_categorized_words";

interface BaseWord {
  hebrew: string;
  english: string;
  transliteration?: string | null;
}

interface CategorizedWord extends BaseWord {
  category: string;
  rank?: number;
}

interface CategoryData {
  [category: string]: {
    rank?: number;
    english: string;
    transliteration?: string;
    hebrew: string;
  }[];
}

const ImportWords = () => {
  const [selectedTable, setSelectedTable] = useState<TableOption>("hebrew_categorized_words");
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateHebrewText = (text: string): boolean => {
    console.log("Validating Hebrew text:", text);
    const hebrewRegex = /[\u0590-\u05FF]/;
    const isValid = hebrewRegex.test(text);
    console.log("Hebrew validation result:", isValid);
    return isValid;
  };

  const validateEnglishText = (text: string): boolean => {
    console.log("Validating English text:", text);
    const englishRegex = /^[a-zA-Z0-9\s.,!?'"-()]+$/;
    const isValid = englishRegex.test(text);
    console.log("English validation result:", isValid);
    return englishRegex.test(text);
  };

  const parseInput = (text: string): BaseWord[] | CategorizedWord[] => {
    console.log("Starting to parse input text");
    setError(null);
    
    try {
      // Try to parse as JSON first
      console.log("Attempting to parse JSON");
      const jsonData = JSON.parse(text);
      console.log("Successfully parsed JSON data:", jsonData);
      
      // Check if it's the new categories format
      if (jsonData.categories) {
        console.log("Found categories format");
        const words: CategorizedWord[] = [];
        
        Object.entries(jsonData.categories).forEach(([category, items]: [string, any[]]) => {
          console.log(`Processing category: ${category}`);
          items.forEach((item: any) => {
            console.log("Processing item:", item);
            
            if (!item.hebrew || !item.english) {
              const error = `Missing required fields (hebrew, english) in category ${category}`;
              console.error(error);
              throw new Error(error);
            }
            
            if (!validateHebrewText(item.hebrew)) {
              const error = `Invalid Hebrew text "${item.hebrew}" in category ${category}`;
              console.error(error);
              throw new Error(error);
            }
            
            words.push({
              hebrew: item.hebrew,
              english: item.english,
              transliteration: item.transliteration || null,
              category: category,
              rank: item.rank
            });
          });
        });
        
        console.log("Processed words:", words);
        return words;
      }
      
      // If it's not the categories format, handle as before
      if (selectedTable === "hebrew_categorized_words") {
        console.log("Processing non-JSON format for categorized words");
        const lines = text.split('\n').filter(line => line.trim());
        return lines.map((line, index) => {
          console.log(`Processing line ${index + 1}:`, line);
          const parts = line.split(/\s{2,}/).map(part => part.trim());
          
          if (parts.length < 2) {
            const error = `Line ${index + 1}: Invalid format. Each line must contain Hebrew and English separated by two spaces.`;
            console.error(error);
            throw new Error(error);
          }

          const [hebrew, english, transliteration] = parts;
          
          if (!hebrew || !english) {
            const error = `Line ${index + 1}: Missing required fields`;
            console.error(error);
            throw new Error(error);
          }
          
          if (!validateHebrewText(hebrew)) {
            const error = `Line ${index + 1}: Text "${hebrew}" must contain Hebrew characters`;
            console.error(error);
            throw new Error(error);
          }

          if (!validateEnglishText(english)) {
            const error = `Line ${index + 1}: Text "${english}" contains invalid characters`;
            console.error(error);
            throw new Error(error);
          }
          
          return {
            hebrew,
            english,
            transliteration: transliteration || null,
          };
        });
      }
      
      // Handle regular text format
      console.log("Processing regular text format");
      const lines = text.split('\n').filter(line => line.trim());
      return lines.map((line, index) => {
        console.log(`Processing line ${index + 1}:`, line);
        const parts = line.split(/\s{2,}/).map(part => part.trim());
        
        if (parts.length < 2) {
          const error = `Line ${index + 1}: Invalid format. Each line must contain Hebrew and English separated by two spaces.`;
          console.error(error);
          throw new Error(error);
        }

        const [hebrew, english, transliteration] = parts;
        
        if (!hebrew || !english) {
          const error = `Line ${index + 1}: Missing required fields`;
          console.error(error);
          throw new Error(error);
        }
        
        if (!validateHebrewText(hebrew)) {
          const error = `Line ${index + 1}: Text "${hebrew}" must contain Hebrew characters`;
          console.error(error);
          throw new Error(error);
        }

        if (!validateEnglishText(english)) {
          const error = `Line ${index + 1}: Text "${english}" contains invalid characters`;
          console.error(error);
          throw new Error(error);
        }
        
        return {
          hebrew,
          english,
          transliteration: transliteration || null,
        };
      });
    } catch (error: any) {
      console.error("Error parsing input:", error);
      throw new Error(`Invalid format: ${error.message}`);
    }
  };

  const handleImport = async () => {
    try {
      console.log("Starting import process");
      setIsLoading(true);
      setError(null);
      
      const entries = parseInput(inputText);
      console.log("Entries to insert:", entries);
      
      if (!entries || entries.length === 0) {
        console.error("No valid entries found");
        toast.error("No valid entries found");
        return;
      }

      console.log(`Inserting ${entries.length} entries into ${selectedTable}`);
      const { data, error: supabaseError } = await supabase
        .from(selectedTable)
        .insert(entries as any);

      console.log("Supabase response:", { data, error: supabaseError });

      if (supabaseError) {
        console.error("Supabase error:", supabaseError);
        throw supabaseError;
      }

      console.log("Import successful");
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

  const getPlaceholderText = () => {
    if (selectedTable === "hebrew_categorized_words") {
      return `{
  "categories": {
    "Animal": [
      {
        "rank": 649,
        "english": "the mouse (female)",
        "transliteration": "ha'akhbara",
        "hebrew": "העכברה"
      }
    ]
  }
}`;
    }
    
    switch (selectedTable) {
      case "hebrew_alphabet":
        return 'א  Alef  al-ef\nב  Bet  bet';
      case "hebrew_verbs":
        return 'ללכת  to walk  la-le-chet';
      default:
        return 'שלום  Hello  sha-LOM\nתודה  Thank you  to-DA';
    }
  };

  return (
    <div className="min-h-screen bg-white p-8 pt-24">
      <Header1 />
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Import Hebrew Content</h2>
          
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">Select Table</label>
            <Select
              value={selectedTable}
              onValueChange={(value) => setSelectedTable(value as TableOption)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a table" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hebrew_words">Words</SelectItem>
                <SelectItem value="hebrew_phrases">Phrases</SelectItem>
                <SelectItem value="hebrew_alphabet">Alphabet</SelectItem>
                <SelectItem value="hebrew_verbs">Verbs</SelectItem>
                <SelectItem value="hebrew_categorized_words">Categorized Words</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Paste your content
            </label>
            <p className="text-sm text-muted-foreground">
              Example format:
            </p>
            <pre className="bg-gray-100 p-2 rounded text-sm">
              {getPlaceholderText()}
            </pre>
            <Textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={getPlaceholderText()}
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
  );
};

export default ImportWords;