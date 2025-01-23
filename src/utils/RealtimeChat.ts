import { AudioRecorder } from "./audio/AudioRecorder";
import { WebRTCManager } from "./webrtc/WebRTCManager";

export class RealtimeChat {
  private recorder: AudioRecorder | null = null;
  private webrtc: WebRTCManager | null = null;

  constructor(private onMessage: (message: any) => void) {
    console.log('RealtimeChat: Initializing');
  }

  async init() {
    try {
      console.log('RealtimeChat: Starting initialization');
      
      this.webrtc = new WebRTCManager(this.onMessage);
      await this.webrtc.initialize();
      
      this.recorder = new AudioRecorder((audioData) => {
        this.sendAudioData(audioData);
      });
      await this.recorder.start();
      
      console.log('RealtimeChat: Initialization complete');
    } catch (error) {
      console.error("RealtimeChat: Error initializing chat:", error);
      this.onMessage({ type: 'error', message: error instanceof Error ? error.message : "Failed to initialize chat" });
      throw error;
    }
  }

  private encodeAudioData(float32Array: Float32Array): string {
    const int16Array = new Int16Array(float32Array.length);
    for (let i = 0; i < float32Array.length; i++) {
      const s = Math.max(-1, Math.min(1, float32Array[i]));
      int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }
    
    const uint8Array = new Uint8Array(int16Array.buffer);
    let binary = '';
    const chunkSize = 0x8000;
    
    for (let i = 0; i < uint8Array.length; i += chunkSize) {
      const chunk = uint8Array.subarray(i, Math.min(i + chunkSize, uint8Array.length));
      binary += String.fromCharCode.apply(null, Array.from(chunk));
    }
    
    return btoa(binary);
  }

  private sendAudioData(audioData: Float32Array) {
    try {
      this.webrtc?.sendData({
        type: 'input_audio_buffer.append',
        audio: this.encodeAudioData(audioData)
      });
    } catch (error) {
      console.error('RealtimeChat: Error sending audio data:', error);
      this.onMessage({ type: 'error', message: "Failed to send audio data" });
    }
  }

  async sendMessage(text: string) {
    try {
      console.log('RealtimeChat: Sending message:', text);
      
      const event = {
        type: 'conversation.item.create',
        item: {
          type: 'message',
          role: 'user',
          content: [
            {
              type: 'input_text',
              text
            }
          ]
        }
      };

      this.webrtc?.sendData(event);
      this.webrtc?.sendData({type: 'response.create'});
      
      console.log('RealtimeChat: Message sent successfully');
    } catch (error) {
      console.error('RealtimeChat: Error sending message:', error);
      throw error;
    }
  }

  disconnect() {
    console.log('RealtimeChat: Starting disconnect');
    this.recorder?.stop();
    this.webrtc?.disconnect();
    console.log('RealtimeChat: Disconnect complete');
  }
}