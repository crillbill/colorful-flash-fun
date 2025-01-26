import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { CardFront } from "./CardFront";
import { CardBack } from "./CardBack";
import { MeterChart } from "./MeterChart";
import { VoiceRecordButton } from "./VoiceRecordButton";
import VoiceInterface from "./VoiceInterface";
import { useAudioPlayback } from "@/hooks/useAudioPlayback";
import { useVoiceRecording } from "@/hooks/useVoiceRecording";

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
  const [pronunciationScore, setPronunciationScore] = useState(0);
  const { isPlaying, playAudio } = useAudioPlayback();
  const { 
    isListening, 
    isProcessing, 
    timeLeft, 
    startListening, 
    stopProcessing 
  } = useVoiceRecording();

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
    stopProcessing();
    
    const score = isCorrect ? 
      Math.floor(Math.random() * 16) + 85 : // 85-100 for correct
      Math.floor(Math.random() * 25) + 60;  // 60-84 for close matches
    setPronunciationScore(score);
    
    handleAnswer(isCorrect);
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="w-full max-w-sm mx-auto"
      >
        <MeterChart score={pronunciationScore} />
        <div
          className={`flip-card h-[300px] w-full cursor-pointer ${
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
              onStartListening={startListening}
            />
            <CardBack
              answer={answer}
              isPlaying={isPlaying}
              onPlayAudio={() => playAudio(answer)}
              onAnswer={handleAnswer}
            />
          </div>
        </div>
        <div className="flex justify-center mt-6">
          <VoiceRecordButton
            isListening={isListening}
            isProcessing={isProcessing}
            timeLeft={timeLeft}
            question={question}
            isPlaying={isPlaying}
            onStartListening={startListening}
          />
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