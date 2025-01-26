import { useState, useEffect } from "react";
import { toast } from "sonner";

export const useVoiceRecording = () => {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [timeLeft, setTimeLeft] = useState(2);

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
      setTimeLeft(2);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isListening, timeLeft]);

  const startListening = () => {
    if (!isListening && !isProcessing) {
      setIsListening(true);
      setTimeLeft(3);
      toast.info("Listening...", {
        description: "Speak the Hebrew word now",
      });
    }
  };

  const stopProcessing = () => {
    setIsProcessing(false);
    setIsListening(false);
    setTimeLeft(2);
  };

  return {
    isListening,
    isProcessing,
    timeLeft,
    startListening,
    stopProcessing
  };
};