import { supabase } from "@/integrations/supabase/client";

export class AudioRecorder {
  private stream: MediaStream | null = null;
  private audioContext: AudioContext | null = null;
  private processor: ScriptProcessorNode | null = null;
  private source: MediaStreamAudioSourceNode | null = null;

  constructor(private onAudioData: (audioData: Float32Array) => void) {}

  async start() {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 24000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      
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
    } catch (error) {
      console.error('Error accessing microphone:', error);
      throw error;
    }
  }

  stop() {
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
  }
}

export class RealtimeChat {
  private pc: RTCPeerConnection | null = null;
  private dc: RTCDataChannel | null = null;
  private audioEl: HTMLAudioElement;
  private recorder: AudioRecorder | null = null;
  private targetWord: string = '';

  constructor(private onMessage: (message: any) => void) {
    this.audioEl = document.createElement("audio");
    this.audioEl.autoplay = true;
  }

  async init(currentWord: string) {
    try {
      this.targetWord = currentWord;
      const { data, error } = await supabase.functions.invoke('realtime-speech');
      
      if (error) {
        console.error("Supabase function error:", error);
        throw error;
      }

      if (!data || !data.client_secret?.value) {
        console.error("Invalid response data:", data);
        throw new Error("Failed to get ephemeral token");
      }

      const EPHEMERAL_KEY = data.client_secret.value;

      this.pc = new RTCPeerConnection();
      this.pc.ontrack = e => this.audioEl.srcObject = e.streams[0];

      const ms = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.pc.addTrack(ms.getTracks()[0]);

      this.dc = this.pc.createDataChannel("oai-events");
      
      this.dc.onopen = () => {
        console.log("Data channel is now open and ready");
        this.sendMessage(`I will speak the Hebrew word "${this.targetWord}". Please evaluate my pronunciation and provide detailed feedback. Specifically: 1) Tell me if it was correct or incorrect, 2) What aspects were good or need improvement, 3) If incorrect, how can I fix any issues?`);
      };
      
      this.dc.onerror = (error) => {
        console.error("Data channel error:", error);
      };
      
      this.dc.onclose = () => {
        console.log("Data channel closed");
      };
      
      this.dc.onmessage = (e) => {
        const event = JSON.parse(e.data);
        console.log("Received event:", event);
        this.onMessage(event);
      };

      const offer = await this.pc.createOffer();
      await this.pc.setLocalDescription(offer);

      const baseUrl = "https://api.openai.com/v1/realtime";
      const model = "gpt-4o-realtime-preview-2024-12-17";
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
        console.error("OpenAI SDP error:", errorText);
        throw new Error(`OpenAI SDP error: ${sdpResponse.status} ${errorText}`);
      }

      const answer = {
        type: "answer" as RTCSdpType,
        sdp: await sdpResponse.text(),
      };
      
      await this.pc.setRemoteDescription(answer);
      console.log("WebRTC connection established");

      this.recorder = new AudioRecorder((audioData) => {
        this.sendAudioData(audioData);
      });
      await this.recorder.start();

    } catch (error) {
      console.error("Error initializing chat:", error);
      throw error;
    }
  }

  private async sendAudioData(audioData: Float32Array) {
    try {
      if (!this.dc || this.dc.readyState !== 'open') {
        console.warn('Data channel not ready, skipping audio data');
        return;
      }
      
      this.dc.send(JSON.stringify({
        type: 'input_audio_buffer.append',
        audio: this.encodeAudioData(audioData)
      }));
    } catch (error) {
      console.error('Error sending audio data:', error);
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

      this.dc.send(JSON.stringify(event));
      this.dc.send(JSON.stringify({type: 'response.create'}));
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  disconnect() {
    console.log('Stopping recording');
    this.recorder?.stop();
    if (this.dc) {
      this.dc.close();
      this.dc = null;
    }
    if (this.pc) {
      this.pc.close();
      this.pc = null;
    }
  }
}