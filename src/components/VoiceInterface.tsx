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

  const stopRecording = () => {
    console.log('VoiceInterface: Stopping recording');

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = undefined;
    }

    if (managerRef.current) {
      console.log('VoiceInterface: Sending stop_recording command');
      managerRef.current.sendData({ type: 'stop_recording' });

      // Forcefully stop all media tracks
      const mediaStream = managerRef.current.getMediaStream();
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => {
          console.log('VoiceInterface: Stopping media track:', track.kind);
          track.stop();
        });
      }

      console.log('VoiceInterface: Disconnecting WebRTCManager');
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

  const evaluatePronunciation = async (transcribed: string, expected: string): Promise<boolean> => {
    const normalizedTranscribed = transcribed.toLowerCase().trim();
    const transliterations = await getHebrewTransliteration(expected);
    
    // Check if the transcribed text matches any of the acceptable variations
    const isMatch = transliterations.some(transliteration => {
      const normalizedTransliteration = transliteration.toLowerCase().trim();
      return normalizedTranscribed.includes(normalizedTransliteration) || 
             normalizedTransliteration.includes(normalizedTranscribed);
    });

    console.log('VoiceInterface: Pronunciation evaluation:', {
      transcribed: normalizedTranscribed,
      expectedVariations: transliterations,
      isMatch
    });

    return isMatch;
  };

  const getHebrewTransliteration = async (hebrewWord: string): Promise<string[]> => {
    // Map of Hebrew words to their acceptable pronunciation variations
    const transliterations: { [key: string]: string[] } = {
      'שלום': ['shalom', 'shalum', 'shalem', 'shulem'],
      'מה שלומך היום': [
        'ma shlomcha hayom',
        'mah shlomcha hayom',
        'ma shlomha hayom',
        'ma schlomcha hayom'
      ],
      'מתי ארוחת צהריים': [
        'matai aruchat tzohorayim',
        'matay aruhat tzohorayim',
        'matai aruhat zohorayim',
        'matai aruchat tsohorayim'
      ],
    };
    return transliterations[hebrewWord.trim()] || [hebrewWord];
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

  return null;
};

export default VoiceInterface;