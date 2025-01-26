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

type TableOption = "hebrew_words" | "hebrew_phrases" | "hebrew_alphabet";

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

  const parseInput = (text: string) => {
    // Split by newlines and filter out empty lines
    const lines = text.split('\n').filter(line => line.trim());
    
    return lines.map(line => {
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

      const [hebrew, english, transliteration] = processedParts;
      
      if (selectedTable === "hebrew_alphabet") {
        return {
          letter: hebrew?.trim(),
          name: english?.trim(),
          transliteration: transliteration?.trim() || null,
        };
      } else {
        return {
          hebrew: hebrew?.trim(),
          english: english?.trim(),
          transliteration: transliteration?.trim() || null,
        };
      }
    });
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
    } catch (error) {
      console.error('Import error:', error);
      toast.error("Failed to import entries");
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
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Paste your content (format: Hebrew[tab]English[tab]Transliteration)
              </label>
              <p className="text-sm text-muted-foreground">
                Each entry on a new line. Separate fields with a tab or multiple spaces.
                You can include special characters like question marks (?) and quotes.
                Use quotes around fields containing spaces or special characters.
                Transliteration is optional.
              </p>
              <Textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={
                  selectedTable === "hebrew_alphabet"
                    ? 'א\tAlef\tal-ef\nב\tBet\tbet'
                    : 'שלום\tHello\tsha-LOM\nמה שלומך?\tHow are you?\tma shlo-MECH'
                }
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