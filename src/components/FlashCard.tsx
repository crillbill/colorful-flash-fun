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
import { Button } from "./ui/button";

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
  const [showHint, setShowHint] = useState(false);
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
      Math.floor(Math.random() * 21) + 80 : // 80-100 for correct
      Math.floor(Math.random() * 20) + 40;  // 40-59 for incorrect
    setPronunciationScore(score);
    
    handleAnswer(isCorrect);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="w-full max-w-sm mx-auto"
      >
        <MeterChart score={pronunciationScore} />
        <div
          className={`flip-card h-[250px] w-full cursor-pointer ${
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

        {/* Hint Section */}
        <div className="relative my-4 text-center">
          <div 
            className={`bg-gray-700/80 backdrop-blur-sm rounded-lg p-4 cursor-pointer transition-all duration-300 ${
              showHint ? 'opacity-0 pointer-events-none' : 'opacity-100'
            }`}
            onClick={() => setShowHint(true)}
          >
            <span className="text-white font-medium">Reveal Hint</span>
          </div>
          <div 
            className={`absolute inset-0 rounded-lg p-4 transition-all duration-300 ${
              showHint ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          >
            <span className="text-gray-300">/hə-ˈbrü/</span>
          </div>
        </div>

        <div className="flex justify-center">
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