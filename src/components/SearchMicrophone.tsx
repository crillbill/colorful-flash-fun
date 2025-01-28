import React, { useState, useRef, useEffect } from 'react';
import { Mic } from 'lucide-react';
import { toast } from "sonner";

interface SearchMicrophoneProps {
  onTranscription: (text: string) => void;
}

const SearchMicrophone: React.FC<SearchMicrophoneProps> = ({ onTranscription }) => {
  const [isListening, setIsListening] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const formData = new FormData();
        formData.append('file', audioBlob, 'audio.webm');
        formData.append('model', 'whisper-1');

        try {
          const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            },
            body: formData,
          });

          if (!response.ok) {
            throw new Error('Transcription failed');
          }

          const data = await response.json();
          const transcribedText = data.text.toLowerCase()
            .replace(/thanks for watching!?/gi, '')
            .replace(/thank you!?/gi, '')
            .replace(/goodbye!?/gi, '')
            .replace(/hello!?/gi, '')
            .replace(/[.,!?]/g, '')
            .trim();

          if (transcribedText) {
            onTranscription(transcribedText);
          }
        } catch (error) {
          console.error('Transcription error:', error);
          toast.error("Failed to transcribe audio");
        } finally {
          setIsListening(false);
          stream.getTracks().forEach(track => track.stop());
        }
      };

      mediaRecorder.start();
      setIsListening(true);
      toast.info("Listening...", {
        description: "Speak the word you want to search for"
      });

      // Stop recording after 2 seconds
      setTimeout(() => {
        if (mediaRecorder.state === 'recording') {
          mediaRecorder.stop();
        }
      }, 2000);

    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast.error("Could not access microphone");
      setIsListening(false);
    }
  };

  return (
    <button
      onClick={startRecording}
      disabled={isListening}
      className={`p-2 rounded-full hover:bg-gray-100 transition-colors ${
        isListening ? 'text-purple-500 animate-pulse' : 'text-gray-400'
      }`}
      title="Search by voice"
    >
      <Mic className={`h-5 w-5 ${isListening ? 'animate-pulse' : ''}`} />
    </button>
  );
};

export default SearchMicrophone;