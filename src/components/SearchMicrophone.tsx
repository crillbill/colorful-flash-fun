import React, { useState } from 'react';
import { Mic } from 'lucide-react';
import { toast } from "sonner";

interface SearchMicrophoneProps {
  onTranscription: (text: string) => void;
}

const SearchMicrophone: React.FC<SearchMicrophoneProps> = ({ onTranscription }) => {
  const [isListening, setIsListening] = useState(false);

  const startRecording = () => {
    if (!('webkitSpeechRecognition' in window)) {
      toast.error("Speech recognition is not supported in this browser");
      return;
    }

    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      toast.info("Listening...", {
        description: "Speak the word you want to search for"
      });
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript.toLowerCase()
        .replace(/[.,!?]/g, '')
        .trim();

      if (transcript) {
        onTranscription(transcript);
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      toast.error("Failed to recognize speech");
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
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