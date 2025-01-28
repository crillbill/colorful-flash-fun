import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Header1 } from "@/components/ui/header";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface Word {
  id: string;
  hebrew: string;
  english: string;
}

interface ImageUpload {
  wordId: string;
  file: File;
}

const ScavengerHuntAdmin = () => {
  const [isUploading, setIsUploading] = useState(false);

  const { data: words = [], isLoading } = useQuery({
    queryKey: ['scavenger-hunt-words'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hebrew_words')
        .select('id, hebrew, english');
      
      if (error) throw error;
      return data;
    },
  });

  const { data: existingImages = [] } = useQuery({
    queryKey: ['scavenger-hunt-images'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('scavenger_hunt_images')
        .select('*');
      
      if (error) throw error;
      return data;
    },
  });

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, wordId: string) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('wordId', wordId);

      const { error } = await supabase.functions.invoke('upload-scavenger-image', {
        body: formData,
      });

      if (error) throw error;
      toast.success('Image uploaded successfully');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="h-8 w-8 animate-spin" />
    </div>;
  }

  return (
    <>
      <Header1 />
      <div className="min-h-screen bg-white p-8 pt-24">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold">Scavenger Hunt Image Management</h1>
            <p className="text-lg text-gray-600">Upload images for each word in the game</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {words.map((word) => {
              const hasImage = existingImages.some(img => img.word_id === word.id);
              return (
                <Card key={word.id} className="hover-card">
                  <CardHeader>
                    <CardTitle className="flex justify-between items-center">
                      <span className="text-xl rtl">{word.hebrew}</span>
                      <span className="text-lg text-gray-600">{word.english}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {hasImage ? (
                        <p className="text-green-600">✓ Image uploaded</p>
                      ) : (
                        <p className="text-yellow-600">No image yet</p>
                      )}
                      <div className="flex items-center space-x-2">
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          id={`file-${word.id}`}
                          onChange={(e) => handleFileUpload(e, word.id)}
                          disabled={isUploading}
                        />
                        <Button
                          asChild
                          variant={hasImage ? "outline" : "default"}
                          disabled={isUploading}
                        >
                          <label htmlFor={`file-${word.id}`}>
                            {isUploading ? (
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : null}
                            {hasImage ? "Replace Image" : "Upload Image"}
                          </label>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};

export default ScavengerHuntAdmin;