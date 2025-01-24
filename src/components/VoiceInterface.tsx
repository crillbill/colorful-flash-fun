import React, { useEffect, useRef } from 'react';
import { WebRTCManager } from '@/utils/webrtc/WebRTCManager';

interface VoiceInterfaceProps {
  currentWord: string;
  onPronunciationResult: (isCorrect: boolean) => void;
  isListening: boolean;
}

const VoiceInterface: React.FC<VoiceInterfaceProps> = ({ 
  currentWord, 
  onPronunciationResult,
  isListening
}) => {
  const managerRef = useRef<WebRTCManager | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const getHebrewTransliteration = async (hebrewWord: string): Promise<string> => {
    const transliterations: { [key: string]: string } = {
      'שלום': 'shalom',
      'מה שלומך היום': 'ma shlomcha hayom',
    };
    return transliterations[hebrewWord.trim()] || hebrewWord;
  };

  const getEnglishTranslation = (hebrewWord: string): string => {
    const translations: { [key: string]: string } = {
      'שלום': 'hello',
      'מה שלומך היום': 'how are you today',
    };
    return translations[hebrewWord.trim()] || hebrewWord;
  };

  const evaluatePronunciation = async (transcribed: string, expected: string): Promise<boolean> => {
    const normalizedTranscribed = transcribed.toLowerCase().trim();
    const expectedTransliteration = await getHebrewTransliteration(expected);
    
    // Split both the transcribed and expected text into words
    const transcribedWords = normalizedTranscribed.split(' ');
    const expectedWords = expectedTransliteration.toLowerCase().split(' ');
    
    // More lenient matching: check if any of the transcribed words match any of the expected words
    const hasMatch = expectedWords.some(expectedWord => 
      transcribedWords.some(transcribedWord => {
        // Remove any punctuation and compare
        const cleanExpected = expectedWord.replace(/[.,!?]/g, '');
        const cleanTranscribed = transcribedWord.replace(/[.,!?]/g, '');
        
        // Check for exact match or if the transcribed word contains the expected word
        return cleanTranscribed === cleanExpected || 
               cleanTranscribed.includes(cleanExpected) ||
               cleanExpected.includes(cleanTranscribed);
      })
    );
    
    console.log('VoiceInterface: Pronunciation evaluation:', {
      transcribed: normalizedTranscribed,
      expected: expectedTransliteration,
      transcribedWords,
      expectedWords,
      hasMatch
    });

    return hasMatch;
  };

  const handleMessage = async (event: any) => {
    console.log('VoiceInterface: Received message:', event);
    
    if (event.text) {
      const transcribedText = event.text.toLowerCase().trim();
      const expectedWord = currentWord;
      const isCorrect = await evaluatePronunciation(transcribedText, expectedWord);
      
      console.log('VoiceInterface: Speech evaluation result:', {
        transcribed: transcribedText,
        expected: expectedWord,
        isCorrect
      });

      onPronunciationResult(isCorrect);
    } else if (event.type === 'error') {
      console.error('VoiceInterface: Error event received:', event);
      onPronunciationResult(false);
    }
  };

  const stopRecording = () => {
    console.log('VoiceInterface: Stopping recording');
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = undefined;
    }
    if (managerRef.current) {
      managerRef.current.sendData({ type: 'stop_recording' });
      managerRef.current.disconnect();
      managerRef.current = null;
    }
    console.log('VoiceInterface: Recording stopped');
  };

  const startRecording = async () => {
    try {
      console.log('VoiceInterface: Starting new recording session');
      stopRecording(); // Ensure any existing recording is stopped

      console.log('VoiceInterface: Creating new WebRTCManager instance');
      managerRef.current = new WebRTCManager(handleMessage);
      
      console.log('VoiceInterface: Initializing WebRTCManager');
      await managerRef.current.initialize();
      
      managerRef.current.sendData({ type: 'start_recording' });
      
      // Set timeout to stop recording after 2 seconds
      timeoutRef.current = setTimeout(() => {
        console.log('VoiceInterface: Auto-stopping recording after 2 seconds');
        stopRecording();
      }, 2000);
      
    } catch (error) {
      console.error('VoiceInterface: Error starting recording:', error);
      stopRecording();
      onPronunciationResult(false);
    }
  };

  useEffect(() => {
    if (isListening) {
      console.log('VoiceInterface: isListening changed to true, starting recording');
      startRecording();
    } else {
      console.log('VoiceInterface: isListening changed to false, stopping recording');
      stopRecording();
    }

    return () => {
      console.log('VoiceInterface: Cleaning up on unmount or deps change');
      stopRecording();
    };
  }, [isListening, currentWord]);

  return null;
};

export default VoiceInterface;