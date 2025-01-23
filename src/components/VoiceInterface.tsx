import React, { useEffect, useRef } from 'react';
import { WebRTCManager } from '@/utils/webrtc/WebRTCManager';
import { supabase } from "@/integrations/supabase/client";

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

  const playAudioFeedback = async (text: string) => {
    try {
      console.log('VoiceInterface: Playing audio feedback:', text);
      const response = await supabase.functions.invoke('text-to-speech', {
        body: {
          text,
          voice: "nova", // Using a female voice for feedback
        },
      });

      if (response.error) {
        throw new Error(response.error.message || 'Failed to generate speech');
      }

      const { data: { audioContent } } = response;
      const audio = new Audio(`data:audio/mp3;base64,${audioContent}`);
      await audio.play();
      
      console.log('VoiceInterface: Audio feedback completed');
    } catch (error) {
      console.error("VoiceInterface: Error playing audio feedback:", error);
    }
  };

  const getHebrewTransliteration = (hebrewWord: string): string => {
    const transliterations: { [key: string]: string } = {
      'שלום': 'shalom',
      // Add more Hebrew words and their transliterations as needed
    };
    return transliterations[hebrewWord.trim()] || hebrewWord;
  };

  const evaluatePronunciation = (transcribed: string, expected: string): boolean => {
    const normalizedTranscribed = transcribed.toLowerCase().trim();
    const expectedTransliteration = getHebrewTransliteration(expected);
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
      const isCorrect = evaluatePronunciation(transcribedText, expectedWord);
      
      console.log('VoiceInterface: Speech evaluation result:', {
        transcribed: transcribedText,
        expected: expectedWord,
        isCorrect
      });

      if (isCorrect) {
        await playAudioFeedback("Excellent! Your pronunciation of Shalom was perfect!");
      } else {
        // First provide feedback about what was heard
        await playAudioFeedback(`I heard ${transcribedText}. The correct pronunciation is Shalom, let me demonstrate.`);
        // Short pause before playing the correct pronunciation
        await new Promise(resolve => setTimeout(resolve, 1000));
        // Then play the correct pronunciation with a different voice
        const response = await supabase.functions.invoke('text-to-speech', {
          body: {
            text: currentWord,
            voice: "alloy", // Using the original voice for the word demonstration
          },
        });
        if (!response.error) {
          const { data: { audioContent } } = response;
          const audio = new Audio(`data:audio/mp3;base64,${audioContent}`);
          await audio.play();
        }
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
      
      timeoutRef.current = setTimeout(() => {
        console.log('VoiceInterface: Auto-stopping recording after timeout');
        if (managerRef.current) {
          managerRef.current.sendData({ type: 'stop_recording' });
        }
      }, 2000);
      
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