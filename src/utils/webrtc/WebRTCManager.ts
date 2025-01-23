import { supabase } from "@/integrations/supabase/client";

export class WebRTCManager {
  private pc: RTCPeerConnection | null = null;
  private dc: RTCDataChannel | null = null;
  private audioEl: HTMLAudioElement;
  private isConnected: boolean = false;

  constructor(private onMessage: (message: any) => void) {
    console.log('WebRTCManager: Initializing');
    this.audioEl = document.createElement("audio");
    this.audioEl.autoplay = true;
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
        throw new Error('Failed to initialize WebRTC connection');
      }

      this.pc = new RTCPeerConnection({
        iceServers: [
          {
            urls: 'stun:stun.l.google.com:19302'
          }
        ]
      });
      console.log('WebRTCManager: Created peer connection');

      this.setupEventHandlers();
      await this.createDataChannel();
      console.log('WebRTCManager: Initialization complete');
    } catch (error) {
      console.error('WebRTCManager: Error initializing:', error);
      throw error;
    }
  }

  private setupEventHandlers() {
    if (!this.pc) return;

    this.pc.ontrack = e => {
      console.log('WebRTCManager: Received remote track');
      this.audioEl.srcObject = e.streams[0];
    };

    this.pc.oniceconnectionstatechange = () => {
      console.log('WebRTCManager: ICE connection state changed to:', this.pc?.iceConnectionState);
      if (this.pc?.iceConnectionState === 'connected') {
        this.isConnected = true;
      } else if (this.pc?.iceConnectionState === 'disconnected') {
        this.isConnected = false;
      }
    };

    this.pc.onicecandidate = event => {
      if (event.candidate) {
        console.log('WebRTCManager: New ICE candidate:', event.candidate);
      }
    };
  }

  private async createDataChannel() {
    if (!this.pc) return;

    this.dc = this.pc.createDataChannel("audio-channel");
    console.log('WebRTCManager: Created data channel');
    
    this.dc.onopen = () => {
      console.log("WebRTCManager: Data channel is now open");
      this.isConnected = true;
      // Send initial message to test connection
      this.sendData({ type: 'init', message: 'Connection established' });
    };
    
    this.dc.onerror = (error) => {
      console.error("WebRTCManager: Data channel error:", error);
      this.isConnected = false;
    };
    
    this.dc.onclose = () => {
      console.log("WebRTCManager: Data channel closed");
      this.isConnected = false;
    };
    
    this.dc.onmessage = async (e) => {
      try {
        const data = JSON.parse(e.data);
        
        if (data.type === 'audio_data') {
          console.log('WebRTCManager: Received audio data, sending to voice-to-text API');
          
          const response = await supabase.functions.invoke('voice-to-text', {
            body: {
              audio: data.audio
            }
          });

          if (response.error) {
            throw new Error('Failed to process speech');
          }

          const result = response.data;
          this.onMessage(result);
        } else {
          this.onMessage(data);
        }
      } catch (error) {
        console.error("WebRTCManager: Error processing message:", error);
        this.onMessage({ type: 'error', message: error.message });
      }
    };
  }

  sendData(data: any) {
    if (!this.dc || this.dc.readyState !== 'open' || !this.isConnected) {
      console.warn('WebRTCManager: Data channel not ready or not connected');
      return;
    }
    
    try {
      this.dc.send(JSON.stringify(data));
    } catch (error) {
      console.error('WebRTCManager: Error sending data:', error);
      this.onMessage({ type: 'error', message: 'Failed to send audio data' });
    }
  }

  disconnect() {
    this.isConnected = false;
    if (this.dc) {
      this.dc.close();
      this.dc = null;
    }
    if (this.pc) {
      this.pc.close();
      this.pc = null;
    }
    console.log('WebRTCManager: Disconnected');
  }
}