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
  onNext,
  onPrevious,
  onCorrect,
  onIncorrect,
  showPrevious = true,
  showNext = true,
}: FlashCardProps) => {
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

  const handleAnswer = (correct: boolean) => {
    if (correct) {
      onCorrect();
    } else {
      onIncorrect();
    }
    
    // Reset states before moving to next word
    setShowHint(false);
    setPronunciationScore(0);
    stopProcessing();
    
    onNext();
  };

  const handlePronunciationResult = (isCorrect: boolean) => {
    stopProcessing();
    
    // Updated scoring logic: start at 80 for correct matches
    const score = isCorrect ? 
      Math.floor(Math.random() * 21) + 80 : // 80-100 for correct
      Math.floor(Math.random() * 20) + 60;  // 60-79 for incorrect
    
    setPronunciationScore(score);
    console.log('FlashCard: Pronunciation score:', { isCorrect, score });
    
    // Add a slight delay before handling the answer to allow the meter to update
    setTimeout(() => {
      handleAnswer(isCorrect);
    }, 1500);
  };

  const getPhoneticPronunciation = (word: string) => {
    // Map of Hebrew words to their phonetic pronunciations
    const pronunciations: { [key: string]: string } = {
      'שלום': 'sha-LOM',
      'מה שלומך היום': 'ma shlo-MECH ha-YOM',
      'מתי ארוחת צהריים': 'ma-TAI a-ru-CHAT tzo-ho-RA-yim',
      // Add more Hebrew words and their phonetic pronunciations as needed
    };
    return pronunciations[word] || word;
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
        <div className="w-full h-[250px]">
          <CardFront
            question={question}
            english={answer}
            isPlaying={isPlaying}
            isListening={isListening}
            isProcessing={isProcessing}
            timeLeft={timeLeft}
            onPlayAudio={() => playAudio(question)}
            onStartListening={startListening}
            onPrevious={onPrevious}
            onNext={onNext}
            showPrevious={showPrevious}
            showNext={showNext}
          />
        </div>

        {/* Hint Section */}
        <div className="relative my-4 text-center">
          <div 
            className={`bg-gray-700/80 backdrop-blur-sm rounded-lg p-4 cursor-pointer transition-all duration-300 ${
              showHint ? 'opacity-0 pointer-events-none' : 'opacity-100'
            }`}
            onClick={() => setShowHint(true)}
          >
            <span className="text-white font-medium">Reveal Pronunciation</span>
          </div>
          <div 
            className={`absolute inset-0 rounded-lg p-4 transition-all duration-300 ${
              showHint ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          >
            <span className="text-black font-medium">{getPhoneticPronunciation(question)}</span>
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