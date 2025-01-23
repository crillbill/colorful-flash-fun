import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from "sonner";
import { RealtimeChat } from '@/utils/RealtimeAudio';
import { Mic, MicOff } from 'lucide-react';

interface VoiceInterfaceProps {
  currentWord: string;
  onPronunciationResult: (isCorrect: boolean) => void;
}

const VoiceInterface: React.FC<VoiceInterfaceProps> = ({ 
  currentWord, 
  onPronunciationResult 
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const chatRef = useRef<RealtimeChat | null>(null);

  const handleMessage = (event: any) => {
    console.log('Received message:', event);
    
    if (event.type === 'conversation.item.message') {
      const message = event.message.content.toLowerCase();
      const isCorrect = message.includes('correct') && !message.includes('incorrect');
      
      console.log('Processing message:', message, 'isCorrect:', isCorrect);
      
      // Send the result back to the parent component
      onPronunciationResult(isCorrect);
      
      // Show feedback toast
      if (isCorrect) {
        toast.success("Good job!", {
          description: event.message.content,
        });
      } else {
        toast.error("Keep practicing", {
          description: event.message.content,
        });
      }
      
      stopRecording();
    }
  };

  const startRecording = async () => {
    try {
      chatRef.current = new RealtimeChat(handleMessage);
      await chatRef.current.init(currentWord);
      setIsRecording(true);
      
      toast.info("Recording Started", {
        description: "Speak the Hebrew word now",
      });
    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error('Failed to start recording');
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (chatRef.current) {
      chatRef.current.disconnect();
      chatRef.current = null;
      setIsRecording(false);
    }
  };

  useEffect(() => {
    return () => {
      if (chatRef.current) {
        chatRef.current.disconnect();
        chatRef.current = null;
      }
    };
  }, []);

  return null; // We don't need to render anything as the parent component handles the UI
};

export default VoiceInterface;