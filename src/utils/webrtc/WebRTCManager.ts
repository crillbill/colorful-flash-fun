import { supabase } from "@/integrations/supabase/client";

export class WebRTCManager {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private isRecording: boolean = false;

  constructor(private onMessage: (message: any) => void) {
    console.log('WebRTCManager: Initializing');
  }

  async initialize(requireMicrophone: boolean = true) {
    try {
      console.log('WebRTCManager: Starting initialization');
      
      if (requireMicrophone) {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          } 
        });

        this.mediaRecorder = new MediaRecorder(stream);
        
        this.mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            this.audioChunks.push(event.data);
          }
        };

        this.mediaRecorder.onstop = async () => {
          try {
            const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
            const base64Audio = await this.blobToBase64(audioBlob);
            
            console.log('WebRTCManager: Processing audio data');
            const response = await supabase.functions.invoke('voice-to-text', {
              body: { audio: base64Audio }
            });

            if (response.error) {
              throw new Error(response.error.message);
            }

            console.log('WebRTCManager: Audio processing complete', response.data);
            this.onMessage(response.data);
          } catch (error) {
            console.error('WebRTCManager: Error processing audio:', error);
            this.onMessage({ type: 'error', message: error.message });
          } finally {
            this.audioChunks = [];
            this.isRecording = false;
          }
        };
      }

      console.log('WebRTCManager: Initialization complete');
      return true;
    } catch (error) {
      console.error('WebRTCManager: Error initializing:', error);
      throw error;
    }
  }

  private async blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          const base64String = reader.result.split(',')[1];
          resolve(base64String);
        } else {
          reject(new Error('Failed to convert blob to base64'));
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  sendData(data: any) {
    try {
      if (data.type === 'start_recording' && !this.isRecording) {
        if (!this.mediaRecorder) {
          throw new Error('MediaRecorder not initialized. Did you call initialize with requireMicrophone=true?');
        }
        this.audioChunks = [];
        this.mediaRecorder.start();
        this.isRecording = true;
        console.log('WebRTCManager: Started recording');
      } else if (data.type === 'stop_recording' && this.isRecording) {
        if (!this.mediaRecorder) {
          throw new Error('MediaRecorder not initialized');
        }
        this.mediaRecorder.stop();
        console.log('WebRTCManager: Stopped recording');
      }
    } catch (error) {
      console.error('WebRTCManager: Error handling data:', error);
      this.onMessage({ type: 'error', message: 'Failed to handle audio recording' });
    }
  }

  disconnect() {
    if (this.mediaRecorder && this.isRecording) {
      this.mediaRecorder.stop();
    }
    this.audioChunks = [];
    this.isRecording = false;
    console.log('WebRTCManager: Disconnected');
  }
}