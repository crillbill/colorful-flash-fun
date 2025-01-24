import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Volume2, VolumeX, Mic } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import VoiceInterface from "./VoiceInterface";
import { toast } from "sonner";
import { CardFront } from "./CardFront";
import { CardBack } from "./CardBack";

interface FlashCardProps {
  question: string;
  answer: string;
  onNext: () => void;
  onCorrect: () => void;
  onIncorrect: () => void;
}

export const FlashCard = ({
  question,
  answer,
  onNext,
  onCorrect,
  onIncorrect,
}: FlashCardProps) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [timeLeft, setTimeLeft] = useState(2); // Changed from 3 to 2 seconds
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    console.log("FlashCard: State change detected:", { 
      isListening, 
      timeLeft,
      isProcessing,
      isPlaying,
      isFlipped 
    });

    let intervalId: NodeJS.Timeout;

    if (isListening && timeLeft > 0) {
      console.log("FlashCard: Starting countdown timer:", timeLeft);
      intervalId = setInterval(() => {
        setTimeLeft((prev) => {
          console.log("FlashCard: Countdown update:", prev - 1);
          return prev - 1;
        });
      }, 1000);
    }

    if (timeLeft === 0 && isListening) {
      console.log("FlashCard: Countdown finished, transitioning to processing state");
      setIsListening(false);
      setIsProcessing(true);
      setTimeLeft(2); // Reset to 2 seconds instead of 3
    }

    return () => {
      if (intervalId) {
        console.log("FlashCard: Cleaning up interval timer");
        clearInterval(intervalId);
      }
    };
  }, [isListening, timeLeft]);

  const handleFlip = () => {
    console.log("FlashCard: Card flip triggered, current state:", !isFlipped);
    setIsFlipped(!isFlipped);
  };

  const handleAnswer = (correct: boolean) => {
    console.log("FlashCard: Answer handled:", {
      correct,
      currentQuestion: question,
      currentAnswer: answer
    });
    
    if (correct) {
      console.log("FlashCard: Correct answer registered");
      onCorrect();
    } else {
      console.log("FlashCard: Incorrect answer registered");
      onIncorrect();
    }
    
    setIsFlipped(false);
    onNext();
  };

  const handlePronunciationResult = (isCorrect: boolean) => {
    console.log("FlashCard: Pronunciation result received:", {
      isCorrect,
      currentWord: question,
      processingState: isProcessing
    });
    
    setIsProcessing(false);
    setIsListening(false);
    setTimeLeft(2); // Reset to 2 seconds instead of 3
    handleAnswer(isCorrect);
  };

  const playAudio = async (text: string) => {
    try {
      if (isPlaying) {
        console.log("FlashCard: Stopping current audio playback");
        audio?.pause();
        setIsPlaying(false);
        return;
      }

      console.log("FlashCard: Initiating audio playback for text:", text);
      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: { 
          text,
          voice: 'nova' // Using Nova voice which is better for Hebrew pronunciation
        },
      });

      if (error) {
        console.error("FlashCard: Supabase text-to-speech error:", error);
        toast.error("Failed to generate audio", {
          description: error.message
        });
        throw error;
      }

      if (!data || !data.audioContent) {
        console.error("FlashCard: Invalid audio data received:", data);
        toast.error("Invalid audio data received");
        return;
      }

      console.log("FlashCard: Audio data received, creating blob");
      const audioContent = data.audioContent;
      const audioBlob = new Blob(
        [Uint8Array.from(atob(audioContent), c => c.charCodeAt(0))],
        { type: 'audio/mp3' }
      );
      const audioUrl = URL.createObjectURL(audioBlob);

      if (audio) {
        console.log("FlashCard: Cleaning up previous audio instance");
        audio.pause();
        URL.revokeObjectURL(audio.src);
      }

      console.log("FlashCard: Setting up new audio instance");
      const newAudio = new Audio(audioUrl);
      setAudio(newAudio);

      newAudio.onended = () => {
        console.log("FlashCard: Audio playback completed");
        setIsPlaying(false);
        URL.revokeObjectURL(audioUrl);
      };

      newAudio.onerror = (e) => {
        console.error("FlashCard: Audio playback error:", e);
        toast.error("Error playing audio");
        setIsPlaying(false);
      };

      console.log("FlashCard: Starting audio playback");
      setIsPlaying(true);
      await newAudio.play();
    } catch (error) {
      console.error("FlashCard: Audio playback error:", error);
      toast.error("Failed to play audio", {
        description: error instanceof Error ? error.message : "Unknown error occurred"
      });
      setIsPlaying(false);
    }
  };

  const handleStartListening = () => {
    if (!isListening && !isProcessing) {
      console.log("FlashCard: Starting listening.");
      setIsListening(true);
      setTimeLeft(3);
      toast.info("Listening...", {
        description: "Speak the Hebrew word now",
      });
    }
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="w-full max-w-md mx-auto"
      >
        <div
          className={`flip-card h-[400px] w-full cursor-pointer ${
            isFlipped ? "flipped" : ""
          }`}
          onClick={handleFlip}
        >
          <div className="flip-card-inner">
            <CardFront
              question={question}
              isPlaying={isPlaying}
              isListening={isListening}
              isProcessing={isProcessing}
              timeLeft={timeLeft}
              onPlayAudio={() => playAudio(question)}
              onStartListening={handleStartListening}
            />
            <CardBack
              answer={answer}
              isPlaying={isPlaying}
              onPlayAudio={() => playAudio(answer)}
              onAnswer={handleAnswer}
            />
          </div>
        </div>
      </motion.div>
      <VoiceInterface
        currentWord={question}
        onPronunciationResult={handlePronunciationResult}
        isListening={isListening}
      />
    </div>
  );
};

export default FlashCard;