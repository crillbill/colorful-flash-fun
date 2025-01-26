import { Button } from "@/components/ui/button";
import { importWords } from "@/utils/importWords";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";

const ImportWords = () => {
  const [isImporting, setIsImporting] = useState(false);
  const { toast } = useToast();

  const handleImport = async () => {
    setIsImporting(true);
    try {
      const result = await importWords();
      toast({
        title: "Import Complete",
        description: `Successfully imported ${result.successCount} words. Failed to import ${result.errorCount} words.`,
        duration: 5000,
      });
    } catch (error) {
      toast({
        title: "Import Failed",
        description: "There was an error importing the words.",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Import Words</h1>
      <div className="max-w-md mx-auto bg-card p-6 rounded-lg shadow-lg">
        <p className="text-muted-foreground mb-6">
          Click the button below to import the Hebrew word list into the database.
        </p>
        <Button 
          onClick={handleImport} 
          disabled={isImporting}
          className="w-full"
        >
          {isImporting ? "Importing..." : "Start Import"}
        </Button>
      </div>
    </div>
  );
};

export default ImportWords;