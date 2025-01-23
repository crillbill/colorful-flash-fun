import { supabase } from "@/integrations/supabase/client";

export class WebRTCManager {
  private pc: RTCPeerConnection | null = null;
  private dc: RTCDataChannel | null = null;
  private audioEl: HTMLAudioElement;

  constructor(private onMessage: (message: any) => void) {
    this.audioEl = document.createElement("audio");
    this.audioEl.autoplay = true;
  }

  async initialize() {
    try {
      console.log('WebRTCManager: Starting initialization');
      const { data, error } = await supabase.functions.invoke('realtime-speech');
      
      if (error) {
        console.error("WebRTCManager: Supabase function error:", error);
        throw error;
      }

      if (!data || !data.client_secret?.value) {
        console.error("WebRTCManager: Invalid response data:", data);
        throw new Error("Failed to get ephemeral token");
      }

      const EPHEMERAL_KEY = data.client_secret.value;
      console.log('WebRTCManager: Got ephemeral token');

      await this.setupWebRTCConnection(EPHEMERAL_KEY);
    } catch (error) {
      console.error("WebRTCManager: Error initializing:", error);
      throw error;
    }
  }

  private async setupWebRTCConnection(ephemeralKey: string) {
    this.pc = new RTCPeerConnection();
    console.log('WebRTCManager: Created peer connection');

    this.setupEventHandlers();
    await this.addLocalTrack();
    await this.createDataChannel();
    await this.createAndSetOffer(ephemeralKey);
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

  private async addLocalTrack() {
    const ms = await navigator.mediaDevices.getUserMedia({ audio: true });
    this.pc?.addTrack(ms.getTracks()[0]);
    console.log('WebRTCManager: Added local audio track');
  }

  private async createDataChannel() {
    if (!this.pc) return;

    this.dc = this.pc.createDataChannel("oai-events");
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

  private async createAndSetOffer(ephemeralKey: string) {
    if (!this.pc) return;

    const offer = await this.pc.createOffer();
    await this.pc.setLocalDescription(offer);
    console.log('WebRTCManager: Created and set local description');

    const baseUrl = "https://api.openai.com/v1/realtime";
    const model = "gpt-4o-realtime-preview-2024-12-17";
    
    const sdpResponse = await fetch(`${baseUrl}?model=${model}`, {
      method: "POST",
      body: offer.sdp,
      headers: {
        Authorization: `Bearer ${ephemeralKey}`,
        "Content-Type": "application/sdp"
      },
    });

    if (!sdpResponse.ok) {
      const errorText = await sdpResponse.text();
      throw new Error(`OpenAI SDP error: ${sdpResponse.status} ${errorText}`);
    }

    const answer = {
      type: "answer" as RTCSdpType,
      sdp: await sdpResponse.text(),
    };
    
    await this.pc.setRemoteDescription(answer);
    console.log("WebRTCManager: WebRTC connection established");
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