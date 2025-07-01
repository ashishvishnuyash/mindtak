import { GoogleGenerativeAI } from '@google/generative-ai';

export interface LiveConversationConfig {
  apiKey: string;
  voiceName?: string;
  onMessage?: (message: string) => void;
  onAudioReceived?: (audioData: string) => void;
  onError?: (error: string) => void;
  onConnectionChange?: (connected: boolean) => void;
  onEmotionDetected?: (emotion: any) => void;
}

export interface ConversationContext {
  employeeId: string;
  sessionId: string;
  conversationHistory: ConversationMessage[];
  emotionalState: EmotionalState;
  riskLevel: 'low' | 'medium' | 'high';
}

export interface ConversationMessage {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  emotionData?: any;
  riskIndicators?: string[];
}

export interface EmotionalState {
  primaryEmotion: string;
  confidence: number;
  sentiment: 'positive' | 'negative' | 'neutral';
  stressLevel: number;
  engagementLevel: number;
}

export class GeminiLiveConversation {
  private genAI: GoogleGenerativeAI;
  private model: any;
  private chat: any;
  private config: LiveConversationConfig;
  private context: ConversationContext | null = null;
  private isConnected = false;
  private conversationStartTime: Date = new Date();

  constructor(config: LiveConversationConfig) {
    this.config = config;
    this.genAI = new GoogleGenerativeAI(config.apiKey);
  }

  async connect(context: ConversationContext): Promise<void> {
    try {
      this.context = context;
      this.conversationStartTime = new Date();

      // Initialize the model with mental health context
      this.model = this.genAI.getGenerativeModel({
        model: 'gemini-2.0-flash-exp',
        systemInstruction: this.buildSystemPrompt(context),
        generationConfig: {
          temperature: 0.7,
          topP: 0.8,
          topK: 40,
          maxOutputTokens: 1024,
        },
        safetySettings: [
          {
            category: 'HARM_CATEGORY_HARASSMENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE',
          },
          {
            category: 'HARM_CATEGORY_HATE_SPEECH',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE',
          },
          {
            category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE',
          },
          {
            category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE',
          },
        ],
      });

      this.chat = this.model.startChat({
        history: this.buildChatHistory(context.conversationHistory),
      });

      this.isConnected = true;
      this.config.onConnectionChange?.(true);

      console.log('Gemini Live conversation connected');
    } catch (error) {
      console.error('Failed to connect to Gemini:', error);
      this.config.onError?.(error instanceof Error ? error.message : 'Connection failed');
      throw error;
    }
  }

  async sendMessage(message: string, emotionData?: any): Promise<string> {
    if (!this.isConnected || !this.chat || !this.context) {
      throw new Error('Not connected to Gemini Live');
    }

    try {
      // Enhance message with emotional context
      const enhancedMessage = this.enhanceMessageWithContext(message, emotionData);
      
      // Send message to Gemini
      const result = await this.chat.sendMessage(enhancedMessage);
      const response = result.response.text();

      // Process the response for risk assessment
      await this.processResponse(message, response, emotionData);

      this.config.onMessage?.(response);
      return response;

    } catch (error) {
      console.error('Failed to send message:', error);
      this.config.onError?.(error instanceof Error ? error.message : 'Failed to send message');
      throw error;
    }
  }

  async sendAudio(audioData: ArrayBuffer): Promise<void> {
    if (!this.isConnected) {
      throw new Error('Not connected to Gemini Live');
    }

    try {
      // Convert audio to base64
      const base64Audio = this.arrayBufferToBase64(audioData);
      
      // For now, we'll use speech-to-text and then send as text
      // In a full implementation, this would use Gemini's native audio capabilities
      const transcription = await this.transcribeAudio(base64Audio);
      
      if (transcription) {
        await this.sendMessage(transcription);
      }

    } catch (error) {
      console.error('Failed to process audio:', error);
      this.config.onError?.(error instanceof Error ? error.message : 'Failed to process audio');
    }
  }

  private buildSystemPrompt(context: ConversationContext): string {
    const riskLevelGuidance = {
      low: 'The user appears to be in a stable emotional state. Provide supportive conversation and wellness tips.',
      medium: 'The user may be experiencing some stress or emotional challenges. Be more attentive and offer specific coping strategies.',
      high: 'The user appears to be in distress. Prioritize their safety, provide immediate support, and consider suggesting professional help if appropriate.'
    };

    return `You are a compassionate AI mental health assistant specialized in workplace wellness. Your role is to provide emotional support, active listening, and evidence-based wellness guidance.

CURRENT CONTEXT:
- User's current risk level: ${context.riskLevel}
- Primary emotion detected: ${context.emotionalState.primaryEmotion}
- Stress level: ${context.emotionalState.stressLevel}/10
- Engagement level: ${context.emotionalState.engagementLevel}/10

GUIDANCE FOR THIS SESSION:
${riskLevelGuidance[context.riskLevel]}

CORE PRINCIPLES:
1. **Safety First**: If the user expresses suicidal thoughts, self-harm, or severe crisis, immediately encourage them to seek professional help or contact emergency services.

2. **Active Listening**: Acknowledge their feelings, validate their experiences, and ask thoughtful follow-up questions.

3. **Evidence-Based Support**: Offer practical, research-backed mental health techniques such as:
   - Cognitive behavioral therapy (CBT) techniques
   - Mindfulness and breathing exercises
   - Stress management strategies
   - Work-life balance tips

4. **Workplace Focus**: Understand that this is a workplace wellness context. Be mindful of:
   - Professional boundaries
   - Work-related stressors
   - Team dynamics
   - Career concerns

5. **Personalized Approach**: Adapt your responses based on:
   - The user's emotional state
   - Their communication style
   - Previous conversation context
   - Risk level indicators

6. **Confidentiality**: Remind users that their conversations are private and secure.

7. **Professional Boundaries**: You are a supportive AI assistant, not a replacement for professional therapy or medical care.

RESPONSE STYLE:
- Use a warm, empathetic, and non-judgmental tone
- Keep responses conversational and natural
- Ask open-ended questions to encourage sharing
- Provide specific, actionable advice when appropriate
- Use the user's name occasionally to personalize the interaction
- Validate their feelings before offering suggestions

CRISIS INDICATORS TO WATCH FOR:
- Expressions of hopelessness or worthlessness
- Mentions of self-harm or suicide
- Severe anxiety or panic symptoms
- Substance abuse references
- Extreme isolation or withdrawal
- Persistent sleep or appetite changes

If you detect any crisis indicators, prioritize safety and gently suggest professional resources while continuing to provide immediate support.

Remember: Your goal is to be a supportive companion in their wellness journey, helping them develop resilience and healthy coping strategies while maintaining appropriate boundaries.`;
  }

  private buildChatHistory(messages: ConversationMessage[]): any[] {
    return messages.slice(-10).map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    }));
  }

  private enhanceMessageWithContext(message: string, emotionData?: any): string {
    if (!emotionData || !this.context) return message;

    // Add emotional context to help the AI respond appropriately
    const contextualInfo = [];

    if (emotionData.primaryEmotion && emotionData.primaryEmotion !== 'neutral') {
      contextualInfo.push(`[Emotional context: User seems ${emotionData.primaryEmotion}]`);
    }

    if (emotionData.stressIndicators && emotionData.stressIndicators.length > 0) {
      contextualInfo.push(`[Stress indicators detected: ${emotionData.stressIndicators.join(', ')}]`);
    }

    if (emotionData.riskLevel && emotionData.riskLevel !== 'low') {
      contextualInfo.push(`[Risk level: ${emotionData.riskLevel}]`);
    }

    const enhancedMessage = contextualInfo.length > 0 
      ? `${contextualInfo.join(' ')}\n\nUser message: ${message}`
      : message;

    return enhancedMessage;
  }

  private async processResponse(userMessage: string, aiResponse: string, emotionData?: any): Promise<void> {
    if (!this.context) return;

    // Analyze the conversation for risk indicators
    const riskIndicators = this.detectRiskIndicators(userMessage, aiResponse);
    
    // Update conversation history
    const userMsg: ConversationMessage = {
      id: `user_${Date.now()}`,
      content: userMessage,
      sender: 'user',
      timestamp: new Date(),
      emotionData,
      riskIndicators
    };

    const aiMsg: ConversationMessage = {
      id: `ai_${Date.now()}`,
      content: aiResponse,
      sender: 'ai',
      timestamp: new Date()
    };

    this.context.conversationHistory.push(userMsg, aiMsg);

    // Update emotional state based on conversation
    if (emotionData) {
      this.updateEmotionalState(emotionData);
    }

    // Check for escalation needs
    if (riskIndicators.length > 0) {
      await this.handleRiskEscalation(riskIndicators);
    }

    // Emit emotion detection event
    if (emotionData) {
      this.config.onEmotionDetected?.(emotionData);
    }
  }

  private detectRiskIndicators(userMessage: string, aiResponse: string): string[] {
    const indicators: string[] = [];
    const lowerMessage = userMessage.toLowerCase();

    // Crisis language detection
    const crisisKeywords = [
      'suicide', 'kill myself', 'end it all', 'not worth living',
      'hopeless', 'can\'t go on', 'want to die', 'hurt myself'
    ];

    const severeStressKeywords = [
      'can\'t cope', 'breaking down', 'falling apart', 'overwhelmed completely',
      'can\'t handle', 'too much pressure', 'breaking point'
    ];

    const isolationKeywords = [
      'no one cares', 'all alone', 'nobody understands', 'isolated',
      'no friends', 'no support', 'abandoned'
    ];

    if (crisisKeywords.some(keyword => lowerMessage.includes(keyword))) {
      indicators.push('crisis_language');
    }

    if (severeStressKeywords.some(keyword => lowerMessage.includes(keyword))) {
      indicators.push('severe_stress');
    }

    if (isolationKeywords.some(keyword => lowerMessage.includes(keyword))) {
      indicators.push('social_isolation');
    }

    // Pattern detection for repeated negative themes
    if (this.context && this.context.conversationHistory.length > 4) {
      const recentMessages = this.context.conversationHistory
        .slice(-4)
        .filter(msg => msg.sender === 'user')
        .map(msg => msg.content.toLowerCase());

      const negativePatterns = recentMessages.filter(msg => 
        msg.includes('bad') || msg.includes('terrible') || 
        msg.includes('awful') || msg.includes('horrible')
      );

      if (negativePatterns.length >= 3) {
        indicators.push('persistent_negativity');
      }
    }

    return indicators;
  }

  private updateEmotionalState(emotionData: any): void {
    if (!this.context) return;

    this.context.emotionalState = {
      primaryEmotion: emotionData.primaryEmotion || this.context.emotionalState.primaryEmotion,
      confidence: emotionData.confidence || this.context.emotionalState.confidence,
      sentiment: emotionData.sentiment || this.context.emotionalState.sentiment,
      stressLevel: this.calculateStressLevel(emotionData),
      engagementLevel: this.calculateEngagementLevel(emotionData)
    };

    // Update risk level based on emotional state
    this.context.riskLevel = this.calculateRiskLevel(this.context.emotionalState);
  }

  private calculateStressLevel(emotionData: any): number {
    let stressLevel = this.context?.emotionalState.stressLevel || 5;

    if (emotionData.stressIndicators && emotionData.stressIndicators.length > 0) {
      stressLevel = Math.min(10, stressLevel + emotionData.stressIndicators.length);
    }

    if (emotionData.primaryEmotion === 'stressed' || emotionData.primaryEmotion === 'anxious') {
      stressLevel = Math.min(10, stressLevel + 2);
    }

    if (emotionData.sentiment === 'positive') {
      stressLevel = Math.max(1, stressLevel - 1);
    }

    return stressLevel;
  }

  private calculateEngagementLevel(emotionData: any): number {
    let engagement = this.context?.emotionalState.engagementLevel || 5;

    if (emotionData.confidence > 0.7) {
      engagement = Math.min(10, engagement + 1);
    }

    if (emotionData.primaryEmotion === 'happy' || emotionData.primaryEmotion === 'excited') {
      engagement = Math.min(10, engagement + 2);
    }

    if (emotionData.primaryEmotion === 'sad' || emotionData.primaryEmotion === 'withdrawn') {
      engagement = Math.max(1, engagement - 2);
    }

    return engagement;
  }

  private calculateRiskLevel(emotionalState: EmotionalState): 'low' | 'medium' | 'high' {
    if (emotionalState.stressLevel >= 8 || emotionalState.engagementLevel <= 3) {
      return 'high';
    }
    
    if (emotionalState.stressLevel >= 6 || emotionalState.engagementLevel <= 5) {
      return 'medium';
    }
    
    return 'low';
  }

  private async handleRiskEscalation(riskIndicators: string[]): Promise<void> {
    if (riskIndicators.includes('crisis_language')) {
      // Immediate crisis response
      const crisisMessage = `I'm very concerned about what you've shared. Your safety is the most important thing right now. Please consider reaching out to:

• National Suicide Prevention Lifeline: 988
• Crisis Text Line: Text HOME to 741741
• Emergency Services: 911

You don't have to go through this alone. There are people who want to help you.`;

      this.config.onMessage?.(crisisMessage);
      
      // Log crisis event for immediate attention
      await this.logCrisisEvent(riskIndicators);
    }
    
    if (riskIndicators.includes('severe_stress') || riskIndicators.includes('persistent_negativity')) {
      // Escalate to supervisor or HR (anonymously)
      await this.logHighRiskEvent(riskIndicators);
    }
  }

  private async logCrisisEvent(indicators: string[]): Promise<void> {
    // In a real implementation, this would trigger immediate alerts
    console.warn('CRISIS EVENT DETECTED:', {
      sessionId: this.context?.sessionId,
      indicators,
      timestamp: new Date(),
      requiresImmediateAttention: true
    });
  }

  private async logHighRiskEvent(indicators: string[]): Promise<void> {
    // Log for supervisor/HR attention while maintaining anonymity
    console.warn('HIGH RISK EVENT:', {
      sessionId: this.context?.sessionId,
      indicators,
      timestamp: new Date(),
      riskLevel: this.context?.riskLevel
    });
  }

  private async transcribeAudio(base64Audio: string): Promise<string | null> {
    try {
      // This would integrate with Google Speech-to-Text API
      const response = await fetch('/api/ai/speech-to-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ audio: base64Audio })
      });

      if (!response.ok) throw new Error('Transcription failed');
      
      const result = await response.json();
      return result.transcription;
    } catch (error) {
      console.error('Audio transcription failed:', error);
      return null;
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

  getConversationSummary(): any {
    if (!this.context) return null;

    const duration = Date.now() - this.conversationStartTime.getTime();
    const messageCount = this.context.conversationHistory.length;
    
    return {
      sessionId: this.context.sessionId,
      duration: Math.round(duration / 1000), // seconds
      messageCount,
      finalEmotionalState: this.context.emotionalState,
      finalRiskLevel: this.context.riskLevel,
      riskIndicators: this.context.conversationHistory
        .flatMap(msg => msg.riskIndicators || [])
        .filter((indicator, index, arr) => arr.indexOf(indicator) === index)
    };
  }

  isSessionConnected(): boolean {
    return this.isConnected;
  }

  async disconnect(): Promise<void> {
    if (this.isConnected) {
      // Save conversation summary
      const summary = this.getConversationSummary();
      if (summary) {
        await this.saveConversationSummary(summary);
      }

      this.isConnected = false;
      this.config.onConnectionChange?.(false);
      this.chat = null;
      this.model = null;
      this.context = null;
    }
  }

  private async saveConversationSummary(summary: any): Promise<void> {
    try {
      await fetch('/api/conversations/summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(summary)
      });
    } catch (error) {
      console.error('Failed to save conversation summary:', error);
    }
  }
}