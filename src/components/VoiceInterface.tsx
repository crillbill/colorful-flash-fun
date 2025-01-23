import React, { useEffect, useRef } from 'react';
import { WebRTCManager } from '@/utils/webrtc/WebRTCManager';
import { toast } from "sonner";

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

  const handleMessage = (event: any) => {
    console.log('VoiceInterface: Received message:', event);
    
    if (event.text) {
      const transcribedText = event.text.toLowerCase().trim();
      const expectedWord = currentWord.toLowerCase().trim();
      const isCorrect = transcribedText.includes(expectedWord);
      
      console.log('VoiceInterface: Comparing:', {
        transcribed: transcribedText,
        expected: expectedWord,
        isCorrect
      });

      onPronunciationResult(isCorrect);
      
      if (isCorrect) {
        toast.success("Good job!", {
          description: `Your pronunciation of "${currentWord}" was correct!`,
        });
      } else {
        toast.error("Keep practicing", {
          description: `I heard "${transcribedText}" - try saying "${currentWord}" again`,
        });
      }
    } else if (event.type === 'error') {
      console.error('VoiceInterface: Error event received:', event);
      toast.error("Error processing pronunciation", {
        description: event.message || "Please try again",
      });
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
      
      toast.info("Ready to evaluate", {
        description: `Speak the word "${currentWord}" clearly`,
      });
      
    } catch (error) {
      console.error('VoiceInterface: Error starting recording:', error);
      toast.error('Failed to start recording', {
        description: error instanceof Error ? error.message : "Unknown error occurred",
      });
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