import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Volume2, VolumeX, Mic } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import VoiceInterface from "./VoiceInterface";
import { toast } from "sonner";

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
    let intervalId: NodeJS.Timeout;
    
    if (isListening && timeLeft > 0) {
      intervalId = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    }

    if (timeLeft === 0 && isListening) {
      setIsListening(false);
      setIsProcessing(true);
      setTimeLeft(3);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isListening, timeLeft]);

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
    console.log('Pronunciation result received:', isCorrect);
    setIsProcessing(false);
    setIsListening(false);
    setTimeLeft(3);
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
            <Card className="flip-card-front p-6 flex flex-col items-center justify-between bg-gradient-to-br from-primary/90 to-primary text-primary-foreground">
              <h2 className="text-8xl font-bold text-center">{question}</h2>
              <div className="flex flex-col gap-4 items-center mt-4">
                <Button
                  variant="ghost"
                  size="icon"
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
                <div className="relative">
                  <Button
                    variant={isListening ? "destructive" : isProcessing ? "secondary" : "default"}
                    size="lg"
                    className="gap-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!isListening && !isProcessing) {
                        setIsListening(true);
                        setTimeLeft(3);
                        toast.info("Listening...", {
                          description: "Speak the Hebrew word now",
                        });
                      }
                    }}
                    disabled={isListening || isProcessing}
                  >
                    <Mic className={isListening ? "animate-pulse" : ""} />
                    {isProcessing 
                      ? "Processing..." 
                      : isListening 
                        ? `Speak now... (${timeLeft}s)` 
                        : `Say "${question}"`}
                  </Button>
                  <div className="absolute -bottom-6 left-0 right-0 text-center text-sm text-muted-foreground">
                    {isListening && `${timeLeft} seconds remaining...`}
                    {isProcessing && "Analyzing your pronunciation..."}
                  </div>
                </div>
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
      <VoiceInterface
        currentWord={question}
        onPronunciationResult={handlePronunciationResult}
        isListening={isListening}
      />
    </div>
  );
};