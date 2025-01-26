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

type TableOption = "hebrew_words" | "hebrew_phrases" | "hebrew_alphabet" | "hebrew_verbs";

const ImportWords = () => {
  const navigate = useNavigate();
  const [selectedTable, setSelectedTable] = useState<TableOption>("hebrew_words");
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    checkAuthorization();
  }, []);

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
    // Hebrew characters range from \u0590 to \u05FF
    const hebrewRegex = /[\u0590-\u05FF]/;
    return hebrewRegex.test(text);
  };

  const validateEnglishText = (text: string): boolean => {
    // English text should not contain Hebrew characters
    const hebrewRegex = /[\u0590-\u05FF]/;
    return !hebrewRegex.test(text);
  };

  const parseInput = (text: string) => {
    // Split by newlines and filter out empty lines
    const lines = text.split('\n').filter(line => line.trim());
    
    const parsedEntries = lines.map(line => {
      // Match content between tabs or multiple spaces, preserving content within quotes
      const matches = line.match(/(?:[^\t\s"]+|"[^"]*")+/g) || [];
      
      // Process each part to handle quotes and preserve special characters
      const processedParts = matches.map(part => {
        // Remove surrounding quotes if present, but preserve content exactly as is
        if ((part.startsWith('"') && part.endsWith('"')) || 
            (part.startsWith("'") && part.endsWith("'"))) {
          return part.slice(1, -1);
        }
        return part;
      });

      if (selectedTable === "hebrew_alphabet") {
        const [letter, name, transliteration] = processedParts;
        
        if (!validateHebrewText(letter)) {
          throw new Error(`Invalid Hebrew letter: ${letter}`);
        }
        
        return {
          letter: letter?.trim(),
          name: name?.trim(),
          transliteration: transliteration?.trim() || null,
        };
      } else if (selectedTable === "hebrew_verbs") {
        const [hebrew, english, transliteration, root, tense, conjugation] = processedParts;
        
        if (!validateHebrewText(hebrew)) {
          throw new Error(`Invalid Hebrew text: ${hebrew}`);
        }
        if (!validateEnglishText(english)) {
          throw new Error(`Invalid English text: ${english}`);
        }
        
        return {
          hebrew: hebrew?.trim(),
          english: english?.trim(),
          transliteration: transliteration?.trim() || null,
          root: root?.trim() || null,
          tense: tense?.trim() || null,
          conjugation: conjugation?.trim() || null,
        };
      } else {
        const [hebrew, english, transliteration] = processedParts;
        
        if (!validateHebrewText(hebrew)) {
          throw new Error(`Invalid Hebrew text: ${hebrew}`);
        }
        if (!validateEnglishText(english)) {
          throw new Error(`Invalid English text: ${english}`);
        }
        
        return {
          hebrew: hebrew?.trim(),
          english: english?.trim(),
          transliteration: transliteration?.trim() || null,
        };
      }
    });

    return parsedEntries;
  };

  const handleImport = async () => {
    if (!isAuthorized) {
      toast.error("You are not authorized to import data");
      return;
    }

    try {
      setIsLoading(true);
      const entries = parseInput(inputText);
      
      if (entries.length === 0) {
        toast.error("No valid entries found");
        return;
      }

      const { error } = await supabase
        .from(selectedTable)
        .insert(entries);

      if (error) throw error;

      toast.success(`Successfully imported ${entries.length} entries`);
      setInputText("");
    } catch (error: any) {
      console.error('Import error:', error);
      toast.error(error.message || "Failed to import entries");
    } finally {
      setIsLoading(false);
    }
  };

  const getPlaceholderText = () => {
    switch (selectedTable) {
      case "hebrew_alphabet":
        return 'א\tAlef\tal-ef\nב\tBet\tbet';
      case "hebrew_verbs":
        return 'ללכת\tto walk\tla-le-chet\tה.ל.כ\tpresent\tsingular masculine';
      default:
        return 'שלום\tHello\tsha-LOM\nמה שלומך\tHow are you\tma-shlo-MECH';
    }
  };

  const getInstructions = () => {
    if (selectedTable === "hebrew_verbs") {
      return "Format: Hebrew[tab]English[tab]Transliteration[tab]Root[tab]Tense[tab]Conjugation";
    } else if (selectedTable === "hebrew_alphabet") {
      return "Format: Letter[tab]Name[tab]Transliteration";
    } else {
      return "Format: Hebrew[tab]English[tab]Transliteration";
    }
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
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Paste your content ({getInstructions()})
              </label>
              <p className="text-sm text-muted-foreground">
                Each entry on a new line. Separate fields with a tab or multiple spaces.
                Hebrew text must contain Hebrew characters, and English text must not contain Hebrew characters.
              </p>
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