import { supabase } from "@/integrations/supabase/client";

export class AudioRecorder {
  private stream: MediaStream | null = null;
  private audioContext: AudioContext | null = null;
  private processor: ScriptProcessorNode | null = null;
  private source: MediaStreamAudioSourceNode | null = null;

  constructor(private onAudioData: (audioData: Float32Array) => void) {}

  async start() {
    try {
      console.log('AudioRecorder: Requesting microphone access');
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 24000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      
      console.log('AudioRecorder: Microphone access granted');
      
      this.audioContext = new AudioContext({
        sampleRate: 24000,
      });
      
      this.source = this.audioContext.createMediaStreamSource(this.stream);
      this.processor = this.audioContext.createScriptProcessor(4096, 1, 1);
      
      this.processor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        this.onAudioData(new Float32Array(inputData));
      };
      
      this.source.connect(this.processor);
      this.processor.connect(this.audioContext.destination);
      console.log('AudioRecorder: Audio processing pipeline set up');
    } catch (error) {
      console.error('AudioRecorder: Error accessing microphone:', error);
      throw error;
    }
  }

  stop() {
    console.log('AudioRecorder: Stopping recording');
    if (this.source) {
      this.source.disconnect();
      this.source = null;
    }
    if (this.processor) {
      this.processor.disconnect();
      this.processor = null;
    }
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    console.log('AudioRecorder: Recording stopped');
  }
}

export class RealtimeChat {
  private pc: RTCPeerConnection | null = null;
  private dc: RTCDataChannel | null = null;
  private audioEl: HTMLAudioElement;
  private recorder: AudioRecorder | null = null;

  constructor(private onMessage: (message: any) => void) {
    console.log('RealtimeChat: Initializing');
    this.audioEl = document.createElement("audio");
    this.audioEl.autoplay = true;
  }

  async init() {
    try {
      console.log('RealtimeChat: Starting initialization');
      const { data, error } = await supabase.functions.invoke('realtime-speech');
      
      if (error) {
        console.error("RealtimeChat: Supabase function error:", error);
        this.onMessage({ type: 'error', message: error.message });
        throw error;
      }

      if (!data || !data.client_secret?.value) {
        console.error("RealtimeChat: Invalid response data:", data);
        this.onMessage({ type: 'error', message: "Failed to get ephemeral token" });
        throw new Error("Failed to get ephemeral token");
      }

      const EPHEMERAL_KEY = data.client_secret.value;
      console.log('RealtimeChat: Got ephemeral token');

      this.pc = new RTCPeerConnection();
      console.log('RealtimeChat: Created peer connection');

      this.pc.ontrack = e => {
        console.log('RealtimeChat: Received remote track');
        this.audioEl.srcObject = e.streams[0];
      };

      this.pc.oniceconnectionstatechange = () => {
        console.log('RealtimeChat: ICE connection state changed to:', this.pc?.iceConnectionState);
        if (this.pc?.iceConnectionState === 'disconnected') {
          this.onMessage({ type: 'error', message: "Connection lost" });
        }
      };

      const ms = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.pc.addTrack(ms.getTracks()[0]);
      console.log('RealtimeChat: Added local audio track');

      this.dc = this.pc.createDataChannel("oai-events");
      console.log('RealtimeChat: Created data channel');
      
      this.dc.onopen = () => {
        console.log("RealtimeChat: Data channel is now open and ready");
      };
      
      this.dc.onerror = (error) => {
        console.error("RealtimeChat: Data channel error:", error);
        this.onMessage({ type: 'error', message: "Communication error" });
      };
      
      this.dc.onclose = () => {
        console.log("RealtimeChat: Data channel closed");
      };
      
      this.dc.onmessage = (e) => {
        const event = JSON.parse(e.data);
        console.log("RealtimeChat: Received event:", event);
        this.onMessage(event);
      };

      const offer = await this.pc.createOffer();
      await this.pc.setLocalDescription(offer);
      console.log('RealtimeChat: Created and set local description');

      const baseUrl = "https://api.openai.com/v1/realtime";
      const model = "gpt-4o-realtime-preview-2024-12-17";
      console.log('RealtimeChat: Connecting to OpenAI realtime API');
      
      const sdpResponse = await fetch(`${baseUrl}?model=${model}`, {
        method: "POST",
        body: offer.sdp,
        headers: {
          Authorization: `Bearer ${EPHEMERAL_KEY}`,
          "Content-Type": "application/sdp"
        },
      });

      if (!sdpResponse.ok) {
        const errorText = await sdpResponse.text();
        console.error("RealtimeChat: OpenAI SDP error:", errorText);
        this.onMessage({ type: 'error', message: "Failed to establish connection" });
        throw new Error(`OpenAI SDP error: ${sdpResponse.status} ${errorText}`);
      }

      const answer = {
        type: "answer" as RTCSdpType,
        sdp: await sdpResponse.text(),
      };
      
      await this.pc.setRemoteDescription(answer);
      console.log("RealtimeChat: WebRTC connection established");

      this.recorder = new AudioRecorder((audioData) => {
        this.sendAudioData(audioData);
      });
      await this.recorder.start();
      console.log('RealtimeChat: Started audio recorder');

    } catch (error) {
      console.error("RealtimeChat: Error initializing chat:", error);
      this.onMessage({ type: 'error', message: error instanceof Error ? error.message : "Failed to initialize chat" });
      throw error;
    }
  }

  private async sendAudioData(audioData: Float32Array) {
    try {
      if (!this.dc || this.dc.readyState !== 'open') {
        console.warn('RealtimeChat: Data channel not ready, skipping audio data');
        return;
      }
      
      this.dc.send(JSON.stringify({
        type: 'input_audio_buffer.append',
        audio: this.encodeAudioData(audioData)
      }));
    } catch (error) {
      console.error('RealtimeChat: Error sending audio data:', error);
      this.onMessage({ type: 'error', message: "Failed to send audio data" });
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

  async sendMessage(text: string) {
    try {
      console.log('RealtimeChat: Attempting to send message:', text);
      
      if (!this.dc || this.dc.readyState !== 'open') {
        throw new Error('Data channel not ready');
      }

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

      console.log('RealtimeChat: Sending message event:', event);
      this.dc.send(JSON.stringify(event));
      
      console.log('RealtimeChat: Sending response.create event');
      this.dc.send(JSON.stringify({type: 'response.create'}));
      
      console.log('RealtimeChat: Message sent successfully');
    } catch (error) {
      console.error('RealtimeChat: Error sending message:', error);
      throw error;
    }
  }

  disconnect() {
    console.log('RealtimeChat: Starting disconnect');
    this.recorder?.stop();
    this.dc?.close();
    this.pc?.close();
    console.log('RealtimeChat: Disconnect complete');
  }
}
