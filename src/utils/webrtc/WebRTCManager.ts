export class WebRTCManager {
  private pc: RTCPeerConnection | null = null;
  private dc: RTCDataChannel | null = null;
  private audioEl: HTMLAudioElement;

  constructor(private onMessage: (message: any) => void) {
    console.log('WebRTCManager: Initializing');
    this.audioEl = document.createElement("audio");
    this.audioEl.autoplay = true;
  }

  async initialize() {
    try {
      console.log('WebRTCManager: Starting initialization');
      const response = await fetch('https://api.openai.com/v1/audio/speech', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error('Failed to initialize WebRTC connection');
      }

      this.pc = new RTCPeerConnection();
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
    };
  }

  private async createDataChannel() {
    if (!this.pc) return;

    this.dc = this.pc.createDataChannel("audio-channel");
    console.log('WebRTCManager: Created data channel');
    
    this.dc.onopen = () => console.log("WebRTCManager: Data channel is now open");
    this.dc.onerror = (error) => console.error("WebRTCManager: Data channel error:", error);
    this.dc.onclose = () => console.log("WebRTCManager: Data channel closed");
    this.dc.onmessage = (e) => {
      const event = JSON.parse(e.data);
      console.log("WebRTCManager: Received event:", event);
      this.onMessage(event);
    };
  }

  sendData(data: any) {
    if (!this.dc || this.dc.readyState !== 'open') {
      console.warn('WebRTCManager: Data channel not ready');
      return;
    }
    
    this.dc.send(JSON.stringify(data));
  }

  disconnect() {
    this.dc?.close();
    this.pc?.close();
    console.log('WebRTCManager: Disconnected');
  }
}