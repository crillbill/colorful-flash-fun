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

  const cleanText = (text: string): string => {
    return text.toLowerCase()
      .replace(/[.,!?]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  };

  const evaluatePronunciation = async (transcribed: string, expected: string): Promise<boolean> => {
    // If the transcribed text contains Hebrew characters, it's likely correct
    if (/[\u0590-\u05FF]/.test(transcribed)) {
      console.log('VoiceInterface: Hebrew characters detected in transcription:', transcribed);
      return true;
    }

    const normalizedTranscribed = cleanText(transcribed);
    const expectedTransliteration = cleanText(await getHebrewTransliteration(expected));
    const expectedTranslation = cleanText(getEnglishTranslation(expected));
    
    console.log('VoiceInterface: Detailed comparison:', {
      transcribed: normalizedTranscribed,
      transliteration: expectedTransliteration,
      translation: expectedTranslation,
      containsHebrew: /[\u0590-\u05FF]/.test(transcribed)
    });

    // Check for exact matches
    if (normalizedTranscribed === expectedTransliteration || 
        normalizedTranscribed === expectedTranslation) {
      console.log('VoiceInterface: Exact match found');
      return true;
    }

    // Check if transcribed text contains the expected text
    if (normalizedTranscribed.includes(expectedTransliteration) || 
        expectedTransliteration.includes(normalizedTranscribed) ||
        normalizedTranscribed.includes(expectedTranslation) ||
        expectedTranslation.includes(normalizedTranscribed)) {
      console.log('VoiceInterface: Partial match found');
      return true;
    }

    // Split into words and check for partial matches
    const transcribedWords = normalizedTranscribed.split(' ');
    const transliterationWords = expectedTransliteration.split(' ');
    const translationWords = expectedTranslation.split(' ');

    const hasMatch = transcribedWords.some(transcribedWord => {
      const matchesTransliteration = transliterationWords.some(expectedWord => 
        transcribedWord.includes(expectedWord) || expectedWord.includes(transcribedWord)
      );
      const matchesTranslation = translationWords.some(translationWord =>
        transcribedWord.includes(translationWord) || translationWord.includes(transcribedWord)
      );
      return matchesTransliteration || matchesTranslation;
    });

    console.log('VoiceInterface: Word-by-word comparison result:', {
      transcribedWords,
      transliterationWords,
      translationWords,
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
      
      // Set timeout to stop recording after 5 seconds (increased from 3)
      timeoutRef.current = setTimeout(() => {
        console.log('VoiceInterface: Auto-stopping recording after 5 seconds');
        stopRecording();
      }, 5000);
      
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