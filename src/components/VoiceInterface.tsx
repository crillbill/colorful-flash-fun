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
  const feedbackInProgressRef = useRef<boolean>(false);
  const feedbackQueueRef = useRef<string[]>([]);

  const getHebrewTransliteration = async (hebrewWord: string): Promise<string> => {
    // Replace with a dynamic transliteration API or a more comprehensive mapping
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
    const isMatch = normalizedTranscribed.includes(expectedTransliteration.toLowerCase());
    
    console.log('VoiceInterface: Pronunciation evaluation:', {
      transcribed: normalizedTranscribed,
      expected: expectedTransliteration,
      isMatch
    });

    return isMatch;
  };

  const handleMessage = async (event: any) => {
    console.log('VoiceInterface: Received message:', event);
    
    if (event.text) {
      const transcribedText = event.text.toLowerCase().trim();
      const expectedWord = currentWord;
      const isCorrect = await evaluatePronunciation(transcribedText, expectedWord);
      const expectedTransliteration = await getHebrewTransliteration(expectedWord);
      const englishTranslation = getEnglishTranslation(expectedWord);
      
      console.log('VoiceInterface: Speech evaluation result:', {
        transcribed: transcribedText,
        expected: expectedWord,
        expectedTransliteration,
        isCorrect
      });

      if (isCorrect) {
        console.log('VoiceInterface: Correct pronunciation detected');
      } else {
        console.log('VoiceInterface: Incorrect pronunciation detected');
      }

      onPronunciationResult(isCorrect);
    } else if (event.type === 'error') {
      console.error('VoiceInterface: Error event received:', event);
      onPronunciationResult(false);
    }
  };

  const startRecording = async () => {
    try {
      console.log('VoiceInterface: Starting new recording session');
      
      if (managerRef.current) {
        console.log('VoiceInterface: Cleaning up existing session');
        managerRef.current.disconnect();
        managerRef.current = null;
      }

      console.log('VoiceInterface: Creating new WebRTCManager instance');
      managerRef.current = new WebRTCManager(handleMessage);
      
      console.log('VoiceInterface: Initializing WebRTCManager');
      await managerRef.current.initialize();
      
      managerRef.current.sendData({ type: 'start_recording' });
      
      // Changed to 2-second timeout for recording
      timeoutRef.current = setTimeout(() => {
        console.log('VoiceInterface: Auto-stopping recording after 2 seconds');
        if (managerRef.current) {
          managerRef.current.sendData({ type: 'stop_recording' });
        }
      }, 2000); // Changed from 3000 to 2000 milliseconds
      
    } catch (error) {
      console.error('VoiceInterface: Error starting recording:', error);
      onPronunciationResult(false);
    }
  };

  useEffect(() => {
    if (isListening) {
      console.log('VoiceInterface: isListening changed to true, starting recording');
      startRecording();
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (managerRef.current) {
        console.log('VoiceInterface: Cleaning up recording session on unmount');
        managerRef.current.disconnect();
        managerRef.current = null;
      }
    };
  }, [isListening, currentWord]);

  return null;
};

export default VoiceInterface;