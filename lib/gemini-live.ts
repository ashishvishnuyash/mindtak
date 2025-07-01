import {
  GoogleGenerativeAI,
  GenerativeModel,
} from '@google/generative-ai';

export interface LiveConversationConfig {
  apiKey: string;
  voiceName?: string;
  onMessage?: (message: string) => void;
  onAudioReceived?: (audioData: string) => void;
  onError?: (error: string) => void;
  onConnectionChange?: (connected: boolean) => void;
}

export class GeminiLiveConversation {
  private model: GenerativeModel | undefined = undefined;
  private config: LiveConversationConfig;
  private isConnected = false;
  private chat: any = undefined;

  constructor(config: LiveConversationConfig) {
    this.config = config;
  }

  async connect(): Promise<void> {
    try {
      const genAI = new GoogleGenerativeAI(this.config.apiKey);
      
      // Use the standard Gemini model for text-based conversations
      this.model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        systemInstruction: this.getSystemPrompt()
      });

      this.chat = this.model.startChat({
        history: [],
      });

      this.isConnected = true;
      this.config.onConnectionChange?.(true);
      
      console.debug('Gemini conversation initialized');

    } catch (error) {
      console.error('Failed to connect to Gemini:', error);
      this.config.onError?.(error instanceof Error ? error.message : 'Connection failed');
      throw error;
    }
  }

  private getSystemPrompt(): string {
    return `You are a compassionate AI mental health assistant. Your role is to:
    
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
    
    Please respond in a natural, conversational way.`;
  }

  async sendMessage(message: string): Promise<void> {
    if (!this.chat || !this.isConnected) {
      throw new Error('Not connected to Gemini');
    }

    try {
      const result = await this.chat.sendMessage(message);
      const response = await result.response;
      const text = response.text();
      
      if (text) {
        this.config.onMessage?.(text);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      this.config.onError?.(error instanceof Error ? error.message : 'Failed to send message');
      throw error;
    }
  }

  async sendAudio(audioData: ArrayBuffer): Promise<void> {
    // For now, we'll convert audio to text and send as a message
    // This is a placeholder - actual audio processing would require additional setup
    console.log('Audio input received, but audio processing is not yet implemented');
    this.config.onError?.('Audio processing not yet implemented');
  }

  isSessionConnected(): boolean {
    return this.isConnected;
  }

  async disconnect(): Promise<void> {
    this.model = undefined;
    this.chat = undefined;
    this.isConnected = false;
    this.config.onConnectionChange?.(false);
  }

  getAudioParts(): string[] {
    return [];
  }

  clearAudioParts(): void {
    // No-op for now
  }
}