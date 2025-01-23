import { supabase } from "@/integrations/supabase/client";

export class WebRTCManager {
  private isConnected: boolean = false;
  private audioContext: AudioContext;
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];

  constructor(private onMessage: (message: any) => void) {
    console.log('WebRTCManager: Initializing');
    this.audioContext = new AudioContext();
  }

  async initialize() {
    try {
      console.log('WebRTCManager: Starting initialization');
      
      // Test the connection using Supabase's voice-to-text function
      const response = await supabase.functions.invoke('voice-to-text', {
        body: {
          audio: "" // Empty audio for connection test
        }
      });

      if (response.error) {
        console.error('Voice-to-text API error:', response.error);
        throw new Error('Failed to initialize connection');
      }

      await this.setupMediaRecorder();
      this.isConnected = true;
      console.log('WebRTCManager: Initialization complete');
    } catch (error) {
      console.error('WebRTCManager: Error initializing:', error);
      throw error;
    }
  }

  private async setupMediaRecorder() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(stream);
      
      this.mediaRecorder.ondataavailable = async (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.onstop = async () => {
        try {
          const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
          const base64Audio = await this.blobToBase64(audioBlob);
          
          const response = await supabase.functions.invoke('voice-to-text', {
            body: {
              audio: base64Audio
            }
          });

          if (response.error) {
            throw new Error('Failed to process speech');
          }

          this.onMessage(response.data);
        } catch (error) {
          console.error('WebRTCManager: Error processing audio:', error);
          this.onMessage({ type: 'error', message: error.message });
        } finally {
          this.audioChunks = [];
        }
      };

    } catch (error) {
      console.error('WebRTCManager: Error setting up media recorder:', error);
      throw error;
    }
  }

  private async blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          // Remove the data URL prefix
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
    if (!this.isConnected || !this.mediaRecorder) {
      console.warn('WebRTCManager: Not connected or recorder not ready');
      return;
    }
    
    try {
      if (data.type === 'start_recording' && this.mediaRecorder.state === 'inactive') {
        this.audioChunks = [];
        this.mediaRecorder.start();
        console.log('WebRTCManager: Started recording');
      } else if (data.type === 'stop_recording' && this.mediaRecorder.state === 'recording') {
        this.mediaRecorder.stop();
        console.log('WebRTCManager: Stopped recording');
      }
    } catch (error) {
      console.error('WebRTCManager: Error handling data:', error);
      this.onMessage({ type: 'error', message: 'Failed to handle audio recording' });
    }
  }

  disconnect() {
    this.isConnected = false;
    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.stop();
    }
    this.audioChunks = [];
    console.log('WebRTCManager: Disconnected');
  }
}