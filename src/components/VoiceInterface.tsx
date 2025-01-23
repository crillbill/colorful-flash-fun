import React, { useEffect, useRef } from 'react';
import { toast } from "sonner";
import { RealtimeChat } from '@/utils/RealtimeAudio';

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

  const handleMessage = (event: any) => {
    console.log('VoiceInterface: Received message:', event);
    
    if (event.type === 'conversation.item.message') {
      const message = event.message.content.toLowerCase();
      const isCorrect = message.includes('correct') && !message.includes('incorrect');
      
      console.log('VoiceInterface: Processing message:', {
        message,
        isCorrect,
        eventType: event.type
      });

      onPronunciationResult(isCorrect);
      
      if (isCorrect) {
        toast.success("Good job!", {
          description: event.message.content,
        });
      } else {
        toast.error("Keep practicing", {
          description: event.message.content,
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
      
      // Wait for connection to establish before sending message
      setTimeout(async () => {
        try {
          if (chatRef.current) {
            console.log('VoiceInterface: Sending initial message for word:', currentWord);
            const prompt = `I will speak the Hebrew word "${currentWord}". Please evaluate my pronunciation and provide detailed feedback. Specifically: 1) Tell me if it was correct or incorrect, 2) What aspects were good or need improvement, 3) If incorrect, how can I fix any issues?`;
            console.log('VoiceInterface: Prompt:', prompt);
            
            await chatRef.current.sendMessage(prompt);
            console.log('VoiceInterface: Initial message sent successfully');
            
            toast.info("Ready to evaluate", {
              description: "Connection established successfully",
            });
          }
        } catch (error) {
          console.error('VoiceInterface: Error sending initial message:', error);
          toast.error("Failed to start evaluation", {
            description: error instanceof Error ? error.message : "Unknown error occurred",
          });
          onPronunciationResult(false);
        }
      }, 1000);
      
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

    // Only cleanup when component unmounts, not when transitioning states
    return () => {
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