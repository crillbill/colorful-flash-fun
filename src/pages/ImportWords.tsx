import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "react-router-dom";
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
}

interface AlphabetEntry extends BaseWord {
  letter: string;
  name: string;
  sound_description?: string | null;
}

const ImportWords = () => {
  const navigate = useNavigate();
  const [selectedTable, setSelectedTable] = useState<TableOption>("hebrew_words");
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkAuthorization = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setIsAuthorized(false);
        toast.error("Please log in to import data");
        return;
      }
      
      if (session.user.email === 'crillbill@gmail.com') {
        setIsAuthorized(true);
      } else {
        setIsAuthorized(false);
        toast.error("You are not authorized to import data");
      }
    } catch (error) {
      console.error('Authorization check error:', error);
      setIsAuthorized(false);
      toast.error("Error checking authorization");
    }
  };

  const handleSignIn = () => {
    navigate("/login");
  };

  const validateHebrewText = (text: string): boolean => {
    const hebrewRegex = /[\u0590-\u05FF]/;
    return hebrewRegex.test(text);
  };

  const validateEnglishText = (text: string): boolean => {
    const englishRegex = /^[a-zA-Z0-9\s.,!?'"-]+$/;
    return englishRegex.test(text);
  };

  const parseInput = (text: string): BaseWord[] | CategorizedWord[] | AlphabetEntry[] => {
    setError(null);
    
    if (selectedTable === "hebrew_categorized_words") {
      try {
        const jsonData = JSON.parse(text);
        if (!Array.isArray(jsonData)) {
          throw new Error("JSON must be an array of word objects");
        }
        
        const validatedData = jsonData.map((item: any, index) => {
          if (!item.hebrew || !item.english || !item.category) {
            throw new Error(`Item ${index + 1}: Missing required fields (hebrew, english, category)`);
          }
          
          if (!validateHebrewText(item.hebrew)) {
            throw new Error(`Item ${index + 1}: Invalid Hebrew text "${item.hebrew}"`);
          }
          
          if (!validateEnglishText(item.english)) {
            throw new Error(`Item ${index + 1}: Invalid English text "${item.english}"`);
          }
          
          const entry: CategorizedWord = {
            hebrew: item.hebrew,
            english: item.english,
            transliteration: item.transliteration || null,
            category: item.category
          };
          
          return entry;
        });
        
        return validatedData;
      } catch (error: any) {
        throw new Error(`Invalid JSON format: ${error.message}`);
      }
    } else if (selectedTable === "hebrew_alphabet") {
      const lines = text.split('\n').filter(line => line.trim());
      
      return lines.map((line, index) => {
        const parts = line.split(/\s{2,}/).map(part => part.trim());
        
        if (parts.length < 3) {
          throw new Error(`Line ${index + 1}: Invalid format. Each line must contain Letter, Name, and Transliteration separated by two spaces.`);
        }

        const [letter, name, transliteration] = parts;
        
        const entry: AlphabetEntry = {
          letter,
          name,
          hebrew: letter,
          english: name,
          transliteration: transliteration || null
        };
        
        return entry;
      });
    } else {
      const lines = text.split('\n').filter(line => line.trim());
      
      return lines.map((line, index) => {
        const parts = line.split(/\s{2,}/).map(part => part.trim());
        
        if (parts.length < 2) {
          throw new Error(`Line ${index + 1}: Invalid format. Each line must contain Hebrew and English separated by two spaces. Found: "${line}"`);
        }

        const [hebrew, english, transliteration] = parts;
        
        if (!hebrew || !english) {
          throw new Error(`Line ${index + 1}: Missing required fields. Format should be: Hebrew  English  Transliteration`);
        }
        
        if (!validateHebrewText(hebrew)) {
          throw new Error(`Line ${index + 1}: Text "${hebrew}" must contain Hebrew characters`);
        }

        if (!validateEnglishText(english)) {
          throw new Error(`Line ${index + 1}: Text "${english}" contains invalid characters. Only English letters, numbers, and basic punctuation are allowed.`);
        }
        
        const entry: BaseWord = {
          hebrew,
          english,
          transliteration: transliteration || null,
        };
        
        return entry;
      });
    }
  };

  const handleImport = async () => {
    if (!isAuthorized) {
      toast.error("You are not authorized to import data");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const entries = parseInput(inputText);
      
      if (!entries || entries.length === 0) {
        toast.error("No valid entries found");
        return;
      }

      const { error: supabaseError } = await supabase
        .from(selectedTable)
        .insert(entries as any); // Type assertion needed due to Supabase client typing limitations

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

  const getPlaceholderText = () => {
    if (selectedTable === "hebrew_categorized_words") {
      return `[
  {
    "hebrew": "ספר",
    "english": "book",
    "transliteration": "sefer",
    "category": "objects"
  },
  {
    "hebrew": "שולחן",
    "english": "table",
    "transliteration": "shulchan",
    "category": "furniture"
  }
]`;
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

  const getInstructions = () => {
    if (selectedTable === "hebrew_categorized_words") {
      return "Format: JSON array of objects with hebrew, english, transliteration (optional), and category fields";
    }
    return "Format: Hebrew  English  Transliteration (separate fields with TWO spaces)";
  };

  return (
    <>
      <Header1 />
      <div className="min-h-screen bg-white p-8 pt-24">
        <div className="max-w-2xl mx-auto space-y-8">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Import Hebrew Content</h2>
            
            {!isAuthorized && (
              <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 space-y-4" role="alert">
                <p>Only admin users (crillbill@gmail.com) can import data. Please log in with the correct account.</p>
                <Button onClick={handleSignIn}>
                  Sign In
                </Button>
              </div>
            )}
            
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
                Paste your content ({getInstructions()})
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
              disabled={isLoading || !inputText.trim() || !isAuthorized}
            >
              {isLoading ? "Importing..." : "Import"}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ImportWords;
