import { supabase } from "@/integrations/supabase/client";

export class WebRTCManager {
  private pc: RTCPeerConnection | null = null;
  private dc: RTCDataChannel | null = null;
  private audioEl: HTMLAudioElement;
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private isRecording: boolean = false;

  constructor(private onMessage: (message: any) => void) {
    console.log('WebRTCManager: Initializing');
    this.audioEl = document.createElement("audio");
    this.audioEl.autoplay = true;
  }

  async initialize(requireMicrophone: boolean = true) {
    try {
      console.log('WebRTCManager: Starting initialization');

      // Get ephemeral token from our Edge Function
      const tokenResponse = await supabase.functions.invoke("realtime-speech");
      const data = await tokenResponse.data;
      
      if (!data?.client_secret?.value) {
        throw new Error("Failed to get ephemeral token");
      }

      const EPHEMERAL_KEY = data.client_secret.value;

      // Create peer connection
      this.pc = new RTCPeerConnection();

      // Set up remote audio
      this.pc.ontrack = e => {
        console.log('WebRTCManager: Received audio track');
        this.audioEl.srcObject = e.streams[0];
      };

      let audioTrack: MediaStreamTrack;

      if (requireMicrophone) {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          } 
        });

        audioTrack = stream.getTracks()[0];

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
      } else {
        // Create a silent audio track for text-to-speech
        const ctx = new AudioContext();
        const oscillator = ctx.createOscillator();
        const dest = ctx.createMediaStreamDestination();
        oscillator.connect(dest);
        oscillator.start();
        audioTrack = dest.stream.getAudioTracks()[0];
      }

      // Add audio track to peer connection
      this.pc.addTrack(audioTrack, new MediaStream([audioTrack]));

      // Set up data channel
      this.dc = this.pc.createDataChannel("oai-events");
      this.dc.addEventListener("message", (e) => {
        const event = JSON.parse(e.data);
        console.log("Received event:", event);
        this.onMessage(event);
      });

      // Create and set local description
      const offer = await this.pc.createOffer();
      await this.pc.setLocalDescription(offer);

      // Connect to OpenAI's Realtime API
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
        console.error('OpenAI API error:', errorText);
        throw new Error(`OpenAI API error: ${sdpResponse.status} ${errorText}`);
      }

      const answer = {
        type: "answer" as RTCSdpType,
        sdp: await sdpResponse.text(),
      };
      
      await this.pc.setRemoteDescription(answer);
      console.log("WebRTC connection established");

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
      } else if (this.dc?.readyState === 'open') {
        console.log('WebRTCManager: Sending data:', data);
        this.dc.send(JSON.stringify(data));
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
    this.dc?.close();
    this.pc?.close();
    this.audioEl.srcObject = null;
    console.log('WebRTCManager: Disconnected');
  }
}