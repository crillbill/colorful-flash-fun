import { useState, useEffect } from "react";
import { motion } from "framer-motion";
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
  const [timeLeft, setTimeLeft] = useState(3);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    console.log("isListening or timeLeft changed:", { isListening, timeLeft });
    let intervalId: NodeJS.Timeout;
    
    if (isListening && timeLeft > 0) {
      intervalId = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    }

    if (timeLeft === 0 && isListening) {
      console.log("Time's up! Switching to processing state.");
      setIsListening(false);
      setIsProcessing(true);
      setTimeLeft(3);
    }

    return () => {
      if (intervalId) {
        console.log("Clearing interval.");
        clearInterval(intervalId);
      }
    };
  }, [isListening, timeLeft]);

  const handleFlip = () => {
    console.log("Flipping card.");
    setIsFlipped(!isFlipped);
  };

  const handleAnswer = (correct: boolean) => {
    console.log("Handling answer:", correct ? "Correct" : "Incorrect");
    if (correct) {
      onCorrect();
    } else {
      onIncorrect();
    }
    setIsFlipped(false);
    onNext();
  };

  const handlePronunciationResult = (isCorrect: boolean) => {
    console.log("Pronunciation result received. Correct?", isCorrect);
    setIsProcessing(false);
    setIsListening(false);
    setTimeLeft(3);
    handleAnswer(isCorrect);
  };

  const playAudio = async (text: string) => {
    try {
      if (isPlaying) {
        console.log("Pausing audio.");
        audio?.pause();
        setIsPlaying(false);
        return;
      }

      console.log("Fetching audio for text:", text);
      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: { text },
      });

      if (error) throw error;

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
        console.log("Audio playback ended.");
        setIsPlaying(false);
        URL.revokeObjectURL(audioUrl);
      };

      console.log("Playing audio.");
      setIsPlaying(true);
      await newAudio.play();
    } catch (error) {
      console.error('Error playing audio:', error);
      setIsPlaying(false);
    }
  };

  const handleStartListening = () => {
    if (!isListening && !isProcessing) {
      console.log("Starting listening.");
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