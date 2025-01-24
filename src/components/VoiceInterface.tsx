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
    
    // More lenient matching logic
    const isMatch = transliterations.some(transliteration => {
      const normalizedTransliteration = transliteration.toLowerCase().trim();
      
      // Split into words for partial matching
      const transcribedWords = normalizedTranscribed.split(/\s+/);
      const transliterationWords = normalizedTransliteration.split(/\s+/);
      
      // Check for partial matches in either direction
      return transcribedWords.some(word => 
        transliterationWords.some(expectedWord => 
          word.includes(expectedWord) || 
          expectedWord.includes(word) ||
          // Levenshtein distance for fuzzy matching
          levenshteinDistance(word, expectedWord) <= 2
        )
      );
    });

    console.log('VoiceInterface: Pronunciation evaluation:', {
      transcribed: normalizedTranscribed,
      expectedVariations: transliterations,
      isMatch
    });

    return isMatch;
  };

  // Helper function for fuzzy matching
  const levenshteinDistance = (a: string, b: string): number => {
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;

    const matrix = Array(b.length + 1).fill(null).map(() => Array(a.length + 1).fill(null));

    for (let i = 0; i <= a.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= b.length; j++) matrix[j][0] = j;

    for (let j = 1; j <= b.length; j++) {
      for (let i = 1; i <= a.length; i++) {
        const substitutionCost = a[i - 1] === b[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + substitutionCost
        );
      }
    }

    return matrix[b.length][a.length];
  };

  const getHebrewTransliteration = async (hebrewWord: string): Promise<string[]> => {
    // Map of Hebrew words to their acceptable pronunciation variations
    const transliterations: { [key: string]: string[] } = {
      'שלום': [
        'shalom', 'shalum', 'shalem', 'shulem', 
        'shallom', 'shallum', 'sholom', 'sholum',
        'sha lom', 'sha lum', 'sho lom', 'sho lum'
      ],
      'מה שלומך היום': [
        'ma shlomcha hayom', 'mah shlomcha hayom',
        'ma shlomha hayom', 'ma schlomcha hayom',
        'ma shalom hayom', 'mah shalom hayom',
        'ma shlomech hayom', 'ma shlomha',
        'ma schlom', 'ma shalom'
      ],
      'מתי ארוחת צהריים': [
        'matai aruchat tzohorayim', 'matay aruhat tzohorayim',
        'matai aruhat zohorayim', 'matai aruchat tsohorayim',
        'matai aruha', 'matai tzohorayim', 'matai lunch',
        'matai aruchat', 'matai tsohoraim', 'mata aruchat'
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