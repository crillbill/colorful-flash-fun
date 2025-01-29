import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { CardFront } from "./CardFront";
import { MeterChart } from "./MeterChart";
import { VoiceRecordButton } from "./VoiceRecordButton";
import VoiceInterface from "./VoiceInterface";
import { useAudioPlayback } from "@/hooks/useAudioPlayback";
import { useVoiceRecording } from "@/hooks/useVoiceRecording";

interface FlashCardProps {
  question: string;
  answer: string;
  transliteration?: string;
  onNext: () => void;
  onPrevious: () => void;
  onCorrect: () => void;
  onIncorrect: () => void;
  showPrevious?: boolean;
  showNext?: boolean;
}

export const FlashCard = ({
  question,
  answer,
  transliteration,
  onNext,
  onPrevious,
  onCorrect,
  onIncorrect,
  showPrevious = true,
  showNext = true,
}: FlashCardProps) => {
  const [showHint, setShowHint] = useState(false);
  const [pronunciationScore, setPronunciationScore] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const { isPlaying, playAudio } = useAudioPlayback();
  const { 
    isListening, 
    isProcessing, 
    timeLeft, 
    startListening, 
    stopProcessing 
  } = useVoiceRecording();

  const handleAnswer = (correct: boolean) => {
    if (correct) {
      onCorrect();
    } else {
      onIncorrect();
    }
    
    setShowHint(false);
    setPronunciationScore(0);
    stopProcessing();
    
    onNext();
  };

  const handlePronunciationResult = (transcribedText: string) => {
    stopProcessing();
    
    // Evaluate the transcribed text against the expected word
    const isCorrect = evaluatePronunciation(transcribedText, question);
    
    const score = isCorrect ? 
      Math.floor(Math.random() * 21) + 80 : // 80-100 for correct
      Math.floor(Math.random() * 20) + 60;  // 60-79 for incorrect
    
    setPronunciationScore(score);
    setTotalScore(prevTotal => prevTotal + score);
    setAttempts(prevAttempts => prevAttempts + 1);
    
    setTimeout(() => {
      handleAnswer(isCorrect);
    }, 1500);
  };

  const evaluatePronunciation = (transcribed: string, expected: string): boolean => {
    const normalizedTranscribed = transcribed.toLowerCase().trim();
    const normalizedExpected = expected.toLowerCase().trim();
    
    // Simple exact match or contains check
    return normalizedTranscribed === normalizedExpected || 
           normalizedTranscribed.includes(normalizedExpected) ||
           normalizedExpected.includes(normalizedTranscribed);
  };

  const averageScore = attempts > 0 ? Math.round(totalScore / attempts) : 0;

  return (
    <div className="flex flex-col items-center gap-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="w-full max-w-sm mx-auto"
      >
        {attempts > 0 && (
          <div className="text-center mb-4">
            <p className="text-sm text-gray-600">
              Average Pronunciation Score: <span className="font-semibold">{averageScore}%</span>
              <span className="text-xs ml-2">({attempts} attempts)</span>
            </p>
          </div>
        )}
        <MeterChart score={pronunciationScore} />
        <div className="w-full h-[250px]">
          <CardFront
            question={question}
            english={answer}
            isPlaying={isPlaying}
            isListening={isListening}
            isProcessing={isProcessing}
            timeLeft={timeLeft}
            onPlayAudio={playAudio}
            onStartListening={startListening}
            onPrevious={onPrevious}
            onNext={onNext}
            showPrevious={showPrevious}
            showNext={showNext}
          />
        </div>

        <div className="relative my-4 text-center">
          <button 
            className={`w-full bg-gray-700/80 backdrop-blur-sm rounded-lg p-4 cursor-pointer transition-all duration-300 ${
              showHint ? 'opacity-0 pointer-events-none' : 'opacity-100'
            }`}
            onClick={() => setShowHint(true)}
          >
            <span className="text-white font-medium">Show Pronunciation Guide</span>
          </button>
          <div 
            className={`absolute inset-0 bg-white rounded-lg p-4 transition-all duration-300 ${
              showHint ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          >
            <div className="flex flex-col gap-2">
              <span className="text-black font-medium text-lg">{transliteration || "Pronunciation guide not available"}</span>
              <span className="text-gray-500 text-xs">How to pronounce this word in English</span>
            </div>
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