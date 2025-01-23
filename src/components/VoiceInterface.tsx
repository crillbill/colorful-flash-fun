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
  const feedbackInProgressRef = useRef<boolean>(false);
  const feedbackQueueRef = useRef<string[]>([]);

  const playAudioFeedback = async (text: string) => {
    try {
      if (feedbackInProgressRef.current) {
        console.log('VoiceInterface: Adding feedback to queue:', text);
        feedbackQueueRef.current.push(text);
        return;
      }

      console.log('VoiceInterface: Playing audio feedback with Nova voice:', text);
      feedbackInProgressRef.current = true;

      const response = await supabase.functions.invoke('text-to-speech', {
        body: {
          text,
          voice: "nova", // Explicitly using Nova for feedback
        },
      });

      if (response.error) {
        throw new Error(response.error.message || 'Failed to generate speech');
      }

      const { data: { audioContent } } = response;
      const audio = new Audio(`data:audio/mp3;base64,${audioContent}`);
      
      audio.addEventListener('ended', () => {
        feedbackInProgressRef.current = false;
        const nextFeedback = feedbackQueueRef.current.shift();
        if (nextFeedback) {
          playAudioFeedback(nextFeedback);
        }
      });

      await audio.play();
      console.log('VoiceInterface: Audio feedback completed');
    } catch (error) {
      console.error("VoiceInterface: Error playing audio feedback:", error);
      feedbackInProgressRef.current = false;
    }
  };

  const getHebrewTransliteration = async (hebrewWord: string): Promise<string> => {
    // Replace with a dynamic transliteration API or a more comprehensive mapping
    const transliterations: { [key: string]: string } = {
      'שלום': 'shalom',
      'מה שלומך היום': 'ma shlomcha hayom',
    };
    return transliterations[hebrewWord.trim()] || hebrewWord;
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
      
      console.log('VoiceInterface: Speech evaluation result:', {
        transcribed: transcribedText,
        expected: expectedWord,
        expectedTransliteration,
        isCorrect
      });

      if (isCorrect) {
        await playAudioFeedback(`Excellent! Your pronunciation of ${expectedTransliteration} was perfect!`);
      } else {
        await playAudioFeedback(`I heard "${transcribedText}". For "${expectedTransliteration}", try to pronounce it like this:`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        await playAudioFeedback(expectedWord);
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
      
      // Adjust timeout based on word length
      const timeoutDuration = currentWord.length * 1000; // 1 second per character
      timeoutRef.current = setTimeout(() => {
        console.log('VoiceInterface: Auto-stopping recording after timeout');
        if (managerRef.current) {
          managerRef.current.sendData({ type: 'stop_recording' });
        }
      }, timeoutDuration);
      
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