import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { importWords } from "@/utils/importWords";

const Index = () => {
  const handleImport = async () => {
    try {
      const { successCount, errorCount } = await importWords();
      if (successCount > 0) {
        toast.success(`Successfully imported ${successCount} words`, {
          description: errorCount > 0 ? `Failed to import ${errorCount} words` : undefined
        });
      } else {
        toast.error("Failed to import words", {
          description: `${errorCount} words failed to import`
        });
      }
    } catch (error) {
      toast.error("Failed to import words", {
        description: "An unexpected error occurred"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-darkPurple to-charcoalGray flex items-center justify-center">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-white mb-8">Hebrew Learning App</h1>
        <Button 
          onClick={handleImport}
          className="bg-purple-600 hover:bg-purple-700 text-white"
        >
          Import Words
        </Button>
      </div>
    </div>
  );
};

export default Index;