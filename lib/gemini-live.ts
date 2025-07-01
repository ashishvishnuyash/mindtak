import {
  GoogleGenAI,
  LiveServerMessage,
  MediaResolution,
  Modality,
  Session,
} from '@google/genai';

export interface LiveConversationConfig {
  apiKey: string;
  voiceName?: string;
  onMessage?: (message: string) => void;
  onAudioReceived?: (audioData: string) => void;
  onError?: (error: string) => void;
  onConnectionChange?: (connected: boolean) => void;
}

interface WavConversionOptions {
  numChannels: number;
  sampleRate: number;
  bitsPerSample: number;
}

export class GeminiLiveConversation {
  private session: Session | undefined = undefined;
  private responseQueue: LiveServerMessage[] = [];
  private config: LiveConversationConfig;
  private audioParts: string[] = [];
  private isConnected = false;

  constructor(config: LiveConversationConfig) {
    this.config = config;
  }

  async connect(): Promise<void> {
    try {
      const ai = new GoogleGenAI({
        apiKey: this.config.apiKey,
      });

      const model = 'models/gemini-2.5-flash-preview-native-audio-dialog';

      const sessionConfig = {
        responseModalities: [Modality.AUDIO, Modality.TEXT],
        mediaResolution: MediaResolution.MEDIA_RESOLUTION_MEDIUM,
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: this.config.voiceName || 'Zephyr',
            }
          }
        },
        contextWindowCompression: {
          triggerTokens: '25600',
          slidingWindow: { targetTokens: '12800' },
        },
      };

      this.session = await ai.live.connect({
        model,
        callbacks: {
          onopen: () => {
            console.debug('Gemini Live session opened');
            this.isConnected = true;
            this.config.onConnectionChange?.(true);
          },
          onmessage: (message: LiveServerMessage) => {
            this.responseQueue.push(message);
            this.handleModelTurn(message);
          },
          onerror: (e: ErrorEvent) => {
            console.error('Gemini Live error:', e.message);
            this.config.onError?.(e.message);
          },
          onclose: (e: CloseEvent) => {
            console.debug('Gemini Live session closed:', e.reason);
            this.isConnected = false;
            this.config.onConnectionChange?.(false);
          },
        },
        config: sessionConfig
      });

      // Send initial system prompt for mental health context
      await this.sendSystemPrompt();

    } catch (error) {
      console.error('Failed to connect to Gemini Live:', error);
      this.config.onError?.(error instanceof Error ? error.message : 'Connection failed');
      throw error;
    }
  }

  private async sendSystemPrompt(): Promise<void> {
    if (!this.session) return;

    const systemPrompt = `You are a compassionate AI mental health assistant. Your role is to:
    
    1. Provide emotional support and active listening
    2. Help users process their feelings and thoughts
    3. Offer coping strategies and wellness techniques
    4. Recognize signs of distress and provide appropriate guidance
    5. Maintain a warm, empathetic, and non-judgmental tone
    
    Important guidelines:
    - Always prioritize user safety and well-being
    - If someone expresses suicidal thoughts or severe crisis, encourage them to seek immediate professional help
    - Use a conversational, supportive tone
    - Ask follow-up questions to better understand their situation
    - Provide practical, evidence-based mental health techniques
    - Remember that you're a supportive tool, not a replacement for professional therapy
    
    Please respond in a natural, conversational way as if you're having a real-time voice conversation.`;

    this.session.sendClientContent({
      turns: [systemPrompt]
    });
  }

  async sendMessage(message: string): Promise<void> {
    if (!this.session || !this.isConnected) {
      throw new Error('Not connected to Gemini Live');
    }

    try {
      this.session.sendClientContent({
        turns: [message]
      });
    } catch (error) {
      console.error('Failed to send message:', error);
      this.config.onError?.(error instanceof Error ? error.message : 'Failed to send message');
      throw error;
    }
  }

  async sendAudio(audioData: ArrayBuffer): Promise<void> {
    if (!this.session || !this.isConnected) {
      throw new Error('Not connected to Gemini Live');
    }

    try {
      // Convert ArrayBuffer to base64
      const base64Audio = this.arrayBufferToBase64(audioData);
      
      this.session.sendClientContent({
        turns: [{
          inlineData: {
            mimeType: 'audio/wav',
            data: base64Audio
          }
        }]
      });
    } catch (error) {
      console.error('Failed to send audio:', error);
      this.config.onError?.(error instanceof Error ? error.message : 'Failed to send audio');
      throw error;
    }
  }

  private handleModelTurn(message: LiveServerMessage): void {
    if (message.serverContent?.modelTurn?.parts) {
      const part = message.serverContent.modelTurn.parts[0];

      // Handle text response
      if (part?.text) {
        console.log('Received text:', part.text);
        this.config.onMessage?.(part.text);
      }

      // Handle audio response
      if (part?.inlineData) {
        const inlineData = part.inlineData;
        if (inlineData.mimeType?.startsWith('audio/')) {
          console.log('Received audio data');
          this.audioParts.push(inlineData.data ?? '');
          
          // Convert audio to WAV and notify
          try {
            const wavBuffer = this.convertToWav([inlineData.data ?? ''], inlineData.mimeType ?? '');
            const base64Wav = wavBuffer.toString('base64');
            this.config.onAudioReceived?.(base64Wav);
          } catch (error) {
            console.error('Failed to convert audio:', error);
            // Fallback: send raw audio data
            this.config.onAudioReceived?.(inlineData.data ?? '');
          }
        }
      }

      // Handle file data
      if (part?.fileData) {
        console.log(`Received file: ${part.fileData.fileUri}`);
      }
    }
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  private convertToWav(rawData: string[], mimeType: string): Buffer {
    const options = this.parseMimeType(mimeType);
    const dataLength = rawData.reduce((a, b) => a + b.length, 0);
    const wavHeader = this.createWavHeader(dataLength, options);
    const buffer = Buffer.concat(rawData.map(data => Buffer.from(data, 'base64')));

    return Buffer.concat([wavHeader, buffer]);
  }

  private parseMimeType(mimeType: string): WavConversionOptions {
    const [fileType, ...params] = mimeType.split(';').map(s => s.trim());
    const [_, format] = fileType.split('/');

    const options: Partial<WavConversionOptions> = {
      numChannels: 1,
      bitsPerSample: 16,
      sampleRate: 16000, // Default sample rate
    };

    if (format && format.startsWith('L')) {
      const bits = parseInt(format.slice(1), 10);
      if (!isNaN(bits)) {
        options.bitsPerSample = bits;
      }
    }

    for (const param of params) {
      const [key, value] = param.split('=').map(s => s.trim());
      if (key === 'rate') {
        options.sampleRate = parseInt(value, 10);
      }
    }

    return options as WavConversionOptions;
  }

  private createWavHeader(dataLength: number, options: WavConversionOptions): Buffer {
    const {
      numChannels,
      sampleRate,
      bitsPerSample,
    } = options;

    // http://soundfile.sapp.org/doc/WaveFormat
    const byteRate = sampleRate * numChannels * bitsPerSample / 8;
    const blockAlign = numChannels * bitsPerSample / 8;
    const buffer = Buffer.alloc(44);

    buffer.write('RIFF', 0);                      // ChunkID
    buffer.writeUInt32LE(36 + dataLength, 4);     // ChunkSize
    buffer.write('WAVE', 8);                      // Format
    buffer.write('fmt ', 12);                     // Subchunk1ID
    buffer.writeUInt32LE(16, 16);                 // Subchunk1Size (PCM)
    buffer.writeUInt16LE(1, 20);                  // AudioFormat (1 = PCM)
    buffer.writeUInt16LE(numChannels, 22);        // NumChannels
    buffer.writeUInt32LE(sampleRate, 24);         // SampleRate
    buffer.writeUInt32LE(byteRate, 28);           // ByteRate
    buffer.writeUInt16LE(blockAlign, 32);         // BlockAlign
    buffer.writeUInt16LE(bitsPerSample, 34);      // BitsPerSample
    buffer.write('data', 36);                     // Subchunk2ID
    buffer.writeUInt32LE(dataLength, 40);         // Subchunk2Size

    return buffer;
  }

  async handleTurn(): Promise<LiveServerMessage[]> {
    const turn: LiveServerMessage[] = [];
    let done = false;
    while (!done) {
      const message = await this.waitMessage();
      turn.push(message);
      if (message.serverContent && message.serverContent.turnComplete) {
        done = true;
      }
    }
    return turn;
  }

  async waitMessage(): Promise<LiveServerMessage> {
    let done = false;
    let message: LiveServerMessage | undefined = undefined;
    while (!done) {
      message = this.responseQueue.shift();
      if (message) {
        done = true;
      } else {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }
    return message!;
  }

  getAudioParts(): string[] {
    return [...this.audioParts];
  }

  clearAudioParts(): void {
    this.audioParts = [];
  }

  isSessionConnected(): boolean {
    return this.isConnected;
  }

  async disconnect(): Promise<void> {
    if (this.session) {
      this.session.close();
      this.session = undefined;
      this.isConnected = false;
      this.config.onConnectionChange?.(false);
    }
  }
}