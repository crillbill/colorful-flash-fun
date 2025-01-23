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
    console.log('Received message:', event);
    
    if (event.type === 'conversation.item.message') {
      const message = event.message.content.toLowerCase();
      const isCorrect = message.includes('correct') && !message.includes('incorrect');
      
      console.log('Processing message:', message, 'isCorrect:', isCorrect);
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
    }
  };

  const startRecording = async () => {
    try {
      if (chatRef.current) {
        chatRef.current.disconnect();
        chatRef.current = null;
      }

      chatRef.current = new RealtimeChat(handleMessage);
      await chatRef.current.init();
      
      console.log('Recording started for word:', currentWord);
    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error('Failed to start recording');
      onPronunciationResult(false);
    }
  };

  const stopRecording = () => {
    console.log('Stopping recording');
    if (chatRef.current) {
      // Send the evaluation request after stopping the recording
      chatRef.current.sendMessage(`I will speak the Hebrew word "${currentWord}". Please evaluate my pronunciation and provide detailed feedback. Specifically: 1) Tell me if it was correct or incorrect, 2) What aspects were good or need improvement, 3) If incorrect, how can I fix any issues?`);
      chatRef.current.disconnect();
      chatRef.current = null;
    }
  };

  useEffect(() => {
    if (isListening) {
      console.log('Starting new recording session');
      startRecording();
    } else if (!isListening) {  // Added explicit check
      console.log('Ending recording session');
      stopRecording();
      // Force a pronunciation result if we haven't received one yet
      // This will reset the button state in the parent component
      onPronunciationResult(false);
    }

    return () => {
      if (chatRef.current) {
        chatRef.current.disconnect();
        chatRef.current = null;
      }
    };
  }, [isListening, currentWord]);

  return null;
};

export default VoiceInterface;