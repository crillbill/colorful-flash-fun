import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Volume2, VolumeX } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import VoiceInterface from "./VoiceInterface";

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
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleAnswer = (correct: boolean) => {
    if (correct) {
      onCorrect();
    } else {
      onIncorrect();
    }
    setIsFlipped(false);
    onNext();
  };

  const handlePronunciationResult = (isCorrect: boolean) => {
    handleAnswer(isCorrect);
  };

  const playAudio = async (text: string) => {
    try {
      if (isPlaying) {
        audio?.pause();
        setIsPlaying(false);
        return;
      }

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
        setIsPlaying(false);
        URL.revokeObjectURL(audioUrl);
      };

      setIsPlaying(true);
      await newAudio.play();
    } catch (error) {
      console.error('Error playing audio:', error);
      setIsPlaying(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full max-w-md mx-auto"
    >
      <div
        className={`flip-card h-64 w-full cursor-pointer ${
          isFlipped ? "flipped" : ""
        }`}
        onClick={handleFlip}
      >
        <div className="flip-card-inner">
          <Card className="flip-card-front p-6 flex flex-col items-center justify-between bg-gradient-to-br from-primary/90 to-primary text-primary-foreground">
            <h2 className="text-8xl font-bold text-center">{question}</h2>
            <div className="flex gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="mt-4"
                onClick={(e) => {
                  e.stopPropagation();
                  playAudio(question);
                }}
              >
                {isPlaying ? (
                  <VolumeX className="h-6 w-6" />
                ) : (
                  <Volume2 className="h-6 w-6" />
                )}
              </Button>
              <VoiceInterface
                currentWord={question}
                onPronunciationResult={handlePronunciationResult}
              />
            </div>
          </Card>
          <Card className="flip-card-back p-6 flex flex-col items-center justify-between bg-accent">
            <h3 className="text-xl font-semibold text-center">{answer}</h3>
            <div className="flex flex-col gap-4 items-center">
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  playAudio(answer);
                }}
              >
                {isPlaying ? (
                  <VolumeX className="h-6 w-6" />
                ) : (
                  <Volume2 className="h-6 w-6" />
                )}
              </Button>
              <div className="flex gap-4">
                <Button
                  variant="destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAnswer(false);
                  }}
                >
                  Incorrect
                </Button>
                <Button
                  variant="default"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAnswer(true);
                  }}
                >
                  Correct
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </motion.div>
  );
};