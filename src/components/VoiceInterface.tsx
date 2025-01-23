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

  const playCorrectPronunciation = async () => {
    try {
      console.log('VoiceInterface: Playing correct pronunciation for:', currentWord);
      const response = await supabase.functions.invoke('text-to-speech', {
        body: {
          text: currentWord,
          voice: "alloy",
        },
      });

      if (response.error) {
        throw new Error(response.error.message || 'Failed to generate speech');
      }

      const { data: { audioContent } } = response;
      const audio = new Audio(`data:audio/mp3;base64,${audioContent}`);
      await audio.play();
      
      console.log('VoiceInterface: Pronunciation playback completed');
    } catch (error) {
      console.error("VoiceInterface: Error playing pronunciation:", error);
    }
  };

  const evaluatePronunciation = (transcribed: string, expected: string): boolean => {
    const normalizedTranscribed = transcribed.toLowerCase().trim();
    const normalizedExpected = expected.toLowerCase().trim();
    const isMatch = normalizedTranscribed.includes(normalizedExpected);
    
    console.log('VoiceInterface: Pronunciation evaluation:', {
      transcribed: normalizedTranscribed,
      expected: normalizedExpected,
      isMatch
    });

    return isMatch;
  };

  const handleMessage = async (event: any) => {
    console.log('VoiceInterface: Received message:', event);
    
    if (event.text) {
      const transcribedText = event.text.toLowerCase().trim();
      const expectedWord = currentWord.toLowerCase().trim();
      const isCorrect = evaluatePronunciation(transcribedText, expectedWord);
      
      console.log('VoiceInterface: Speech evaluation result:', {
        transcribed: transcribedText,
        expected: expectedWord,
        isCorrect
      });

      if (!isCorrect) {
        // Play the correct pronunciation immediately if incorrect
        playCorrectPronunciation();
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
      
      // Set a timeout to automatically stop recording after 5 seconds
      timeoutRef.current = setTimeout(() => {
        console.log('VoiceInterface: Auto-stopping recording after timeout');
        if (managerRef.current) {
          managerRef.current.sendData({ type: 'stop_recording' });
        }
      }, 5000);
      
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