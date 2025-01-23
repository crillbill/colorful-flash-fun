import React, { useEffect, useRef } from 'react';
import { RealtimeChat } from '@/utils/RealtimeChat';
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
  const chatRef = useRef<RealtimeChat | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const handleMessage = (event: any) => {
    console.log('VoiceInterface: Received message:', event);
    
    if (event.text) {
      // We got a valid transcription response
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
      
      if (chatRef.current) {
        console.log('VoiceInterface: Cleaning up existing session');
        chatRef.current.disconnect();
        chatRef.current = null;
      }

      console.log('VoiceInterface: Creating new RealtimeChat instance');
      chatRef.current = new RealtimeChat(handleMessage);
      
      console.log('VoiceInterface: Initializing RealtimeChat');
      await chatRef.current.init();
      
      console.log('VoiceInterface: RealtimeChat initialized successfully');
      
      // Set a timeout to automatically stop recording after 5 seconds
      timeoutRef.current = setTimeout(() => {
        console.log('VoiceInterface: Auto-stopping recording after timeout');
        if (chatRef.current) {
          chatRef.current.disconnect();
          chatRef.current = null;
        }
        onPronunciationResult(false);
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
      if (chatRef.current) {
        console.log('VoiceInterface: Cleaning up recording session on unmount');
        chatRef.current.disconnect();
        chatRef.current = null;
      }
    };
  }, [isListening, currentWord]);

  return null;
};

export default VoiceInterface;