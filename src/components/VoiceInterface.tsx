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
    const normalizedTranscribed = cleanText(transcribed);
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
      const transcribedText = cleanText(event.text);
      const isCorrect = await evaluatePronunciation(transcribedText, currentWord);
      const expectedTransliteration = await getHebrewTransliteration(currentWord);

      console.log('VoiceInterface: Speech evaluation result:', {
        transcribed: transcribedText,
        expected: currentWord,
        expectedTransliteration,
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
        stopRecording();
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