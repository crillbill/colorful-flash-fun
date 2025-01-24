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
  const isRecordingRef = useRef<boolean>(false);

  const getHebrewTransliteration = async (hebrewWord: string): Promise<string> => {
    const transliterations: { [key: string]: string } = {
      'שלום': 'shalom',
      'מה שלומך היום': 'ma shlomcha hayom',
      'מתי ארוחת צהריים': 'matai aruchat tzohorayim',
    };
    return transliterations[hebrewWord.trim()] || hebrewWord;
  };

  const getEnglishTranslation = (hebrewWord: string): string => {
    const translations: { [key: string]: string } = {
      'שלום': 'hello',
      'מה שלומך היום': 'how are you today',
      'מתי ארוחת צהריים': 'what time is lunch',
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

    if (normalizedTranscribed === expectedTransliteration || 
        normalizedTranscribed === expectedTranslation) {
      console.log('VoiceInterface: Exact match found');
      return true;
    }

    if (normalizedTranscribed.includes(expectedTransliteration) || 
        expectedTransliteration.includes(normalizedTranscribed) ||
        normalizedTranscribed.includes(expectedTranslation) ||
        expectedTranslation.includes(normalizedTranscribed)) {
      console.log('VoiceInterface: Partial match found');
      return true;
    }

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

    isRecordingRef.current = false;
    console.log('VoiceInterface: Recording stopped, resources cleaned up');
  };

  const startRecording = async () => {
    try {
      if (isRecordingRef.current) {
        console.log('VoiceInterface: Already recording, stopping first');
        stopRecording();
      }

      console.log('VoiceInterface: Starting new recording session');
      isRecordingRef.current = true;

      managerRef.current = new WebRTCManager(handleMessage);
      await managerRef.current.initialize();
      managerRef.current.sendData({ type: 'start_recording' });

      // Set a strict timeout to stop recording after 2 seconds
      timeoutRef.current = setTimeout(() => {
        console.log('VoiceInterface: Recording timeout reached');
        if (isRecordingRef.current) {
          stopRecording();
        }
      }, 2000);

    } catch (error) {
      console.error('VoiceInterface: Error starting recording:', error);
      isRecordingRef.current = false;
      stopRecording();
      onPronunciationResult(false);
    }
  };

  useEffect(() => {
    console.log('VoiceInterface: Effect triggered with isListening:', isListening);

    if (isListening && !isRecordingRef.current) {
      startRecording();
    } else if (!isListening && isRecordingRef.current) {
      stopRecording();
    }

    // Cleanup function to ensure recording is stopped when component unmounts
    return () => {
      console.log('VoiceInterface: Cleanup effect running');
      if (isRecordingRef.current) {
        stopRecording();
      }
    };
  }, [isListening]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      console.log('VoiceInterface: Component unmounting, cleaning up');
      if (isRecordingRef.current) {
        stopRecording();
      }
    };
  }, []);

  return null;
};

export default VoiceInterface;
