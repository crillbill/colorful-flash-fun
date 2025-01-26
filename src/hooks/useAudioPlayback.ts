import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useAudioPlayback = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

  const playAudio = async (text: string) => {
    try {
      if (isPlaying) {
        console.log("AudioPlayback: Stopping current audio playback");
        audio?.pause();
        setIsPlaying(false);
        return;
      }

      console.log("AudioPlayback: Initiating audio playback for text:", text);
      
      // Call the Supabase Edge Function for text-to-speech
      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: { 
          text: text.trim(), // Ensure text is trimmed
          voice_id: "EXAVITQu4vr4xnSDxMaL", // Sarah's voice
          model_id: "eleven_multilingual_v2", // Best for Hebrew
          voice_settings: {
            stability: 0.85, // Higher stability for clearer pronunciation
            similarity_boost: 0.75, // Balance between consistency and naturalness
            style: 0.5, // Neutral style
            speed: 0.85 // Slightly slower for clearer pronunciation
          }
        },
      });

      if (error) {
        console.error("AudioPlayback: Supabase text-to-speech error:", error);
        toast.error("Failed to generate audio", {
          description: error.message
        });
        throw error;
      }

      if (!data || !data.audioContent) {
        console.error("AudioPlayback: Invalid audio data received:", data);
        toast.error("Invalid audio data received");
        return;
      }

      const audioContent = data.audioContent;
      const audioBlob = new Blob(
        [Uint8Array.from(atob(audioContent), c => c.charCodeAt(0))],
        { type: 'audio/mp3' }
      );
      const audioUrl = URL.createObjectURL(audioBlob);

      if (audio) {
        audio.pause();
        URL.revokeObjectURL(audio.src);
      }

      const newAudio = new Audio(audioUrl);
      setAudio(newAudio);

      newAudio.onended = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(audioUrl);
      };

      newAudio.onerror = (e) => {
        console.error("AudioPlayback: Audio playback error:", e);
        toast.error("Error playing audio");
        setIsPlaying(false);
      };

      setIsPlaying(true);
      await newAudio.play();
    } catch (error) {
      console.error("AudioPlayback: Audio playback error:", error);
      toast.error("Failed to play audio", {
        description: error instanceof Error ? error.message : "Unknown error occurred"
      });
      setIsPlaying(false);
    }
  };

  return {
    isPlaying,
    playAudio
  };
};