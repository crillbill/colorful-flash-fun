import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Header1 } from "@/components/ui/header";
import { useNavigate } from "react-router-dom";

interface BulkWord {
  word_number: number;
  hebrew: string;
  english: string;
  transliteration?: string;
}

const ImportBulkWords = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);

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

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!isAuthorized) {
      toast.error("You are not authorized to import data");
      return;
    }

    const file = event.target.files?.[0];
    if (!file) {
      toast.error("Please select a file");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const text = await file.text();
      const data: BulkWord[] = JSON.parse(text);

      // Validate data structure
      if (!Array.isArray(data)) {
        throw new Error("Invalid file format. Expected an array of words.");
      }

      // Process in batches of 100
      const batchSize = 100;
      const batches = [];
      
      for (let i = 0; i < data.length; i += batchSize) {
        batches.push(data.slice(i, i + batchSize));
      }

      let successCount = 0;
      let errorCount = 0;

      for (const batch of batches) {
        const { error: insertError } = await supabase
          .from('hebrew_bulk_words')
          .insert(batch.map(word => ({
            word_number: word.word_number,
            hebrew: word.hebrew,
            english: word.english,
            transliteration: word.transliteration || null
          })));

        if (insertError) {
          console.error('Batch insert error:', insertError);
          errorCount += batch.length;
        } else {
          successCount += batch.length;
        }
      }

      if (successCount > 0) {
        toast.success(`Successfully imported ${successCount} words`);
      }
      if (errorCount > 0) {
        toast.error(`Failed to import ${errorCount} words`);
      }

    } catch (error: any) {
      console.error('Import error:', error);
      setError(error.message || "Failed to import words");
      toast.error(error.message || "Failed to import words");
    } finally {
      setIsLoading(false);
      event.target.value = ''; // Reset file input
    }
  };

  const handleSignIn = () => {
    navigate("/login");
  };

  return (
    <>
      <Header1 />
      <div className="min-h-screen bg-white p-8 pt-24">
        <div className="max-w-2xl mx-auto space-y-8">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Import Bulk Hebrew Words</h2>
            
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
              <label className="text-sm font-medium">Upload JSON File</label>
              <p className="text-sm text-muted-foreground">
                The file should contain an array of objects with word_number, hebrew, english, and optional transliteration fields.
              </p>
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                disabled={isLoading || !isAuthorized}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-primary file:text-white
                  hover:file:bg-primary/90
                  disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            {isLoading && (
              <div className="text-center">
                <p>Importing words... Please wait.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ImportBulkWords;