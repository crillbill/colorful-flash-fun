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

type TableOption = "hebrew_words" | "hebrew_phrases" | "hebrew_alphabet";

const ImportWords = () => {
  const [selectedTable, setSelectedTable] = useState<TableOption>("hebrew_words");
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const parseInput = (text: string) => {
    // Split by newlines and filter out empty lines
    const lines = text.split('\n').filter(line => line.trim());
    
    return lines.map(line => {
      // Split by tab or multiple spaces
      const [hebrew, english, transliteration] = line.split(/[\t]+|\s{2,}/);
      
      if (selectedTable === "hebrew_alphabet") {
        return {
          letter: hebrew,
          name: english,
          transliteration: transliteration || null,
        };
      } else {
        return {
          hebrew,
          english,
          transliteration: transliteration || null,
        };
      }
    });
  };

  const handleImport = async () => {
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
                Transliteration is optional.
              </p>
              <Textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={
                  selectedTable === "hebrew_alphabet"
                    ? "א\tAlef\tal-ef\nב\tBet\tbet"
                    : "שלום\tHello\tsha-LOM\nתודה\tThank you\tto-DA"
                }
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

export default ImportWords;