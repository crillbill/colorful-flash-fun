import React, { useEffect, useRef } from 'react';
import { WebRTCManager } from '@/utils/webrtc/WebRTCManager';

interface VoiceInterfaceProps {
  currentWord: string;
  onPronunciationResult: (text: string) => void;
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

      // Set a timeout to automatically stop recording after 2 seconds
      timeoutRef.current = setTimeout(() => {
        console.log('VoiceInterface: Recording timeout reached');
        stopRecording();
      }, 2000);

    } catch (error) {
      console.error('VoiceInterface: Error starting recording:', error);
      isRecordingRef.current = false;
      stopRecording();
      onPronunciationResult('');
    }
  };

  const handleMessage = async (event: any) => {
    console.log('VoiceInterface: Received message:', event);

    if (event.text) {
      // Clean up the transcribed text by removing common phrases and punctuation
      let transcribedText = event.text.toLowerCase()
        .replace(/thanks for watching!?/gi, '')
        .replace(/thank you!?/gi, '')
        .replace(/goodbye!?/gi, '')
        .replace(/hello!?/gi, '')
        .trim();

      // Remove any remaining punctuation
      transcribedText = transcribedText.replace(/[.,!?]/g, '').trim();

      console.log('VoiceInterface: Cleaned transcribed text:', transcribedText);
      
      if (transcribedText) {
        onPronunciationResult(transcribedText);
      } else {
        // If after cleaning there's no text, try using the original text
        const originalText = event.text.toLowerCase().trim();
        console.log('VoiceInterface: Using original text:', originalText);
        onPronunciationResult(originalText);
      }
    } else if (event.type === 'error') {
      console.error('VoiceInterface: Error event received:', event);
      onPronunciationResult('');
    }
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