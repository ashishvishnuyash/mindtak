import * as tf from '@tensorflow/tfjs';

export interface EmotionData {
  primaryEmotion: string;
  confidence: number;
  sentiment: 'positive' | 'negative' | 'neutral';
  sentimentScore: number;
  stressIndicators: string[];
  riskLevel: 'low' | 'medium' | 'high';
  recommendations: string[];
}

export interface VoiceEmotionFeatures {
  pitch: number[];
  energy: number[];
  spectralCentroid: number[];
  mfcc: number[][];
  tempo: number;
  duration: number;
}

export class MultiModalEmotionDetection {
  private textModel: tf.LayersModel | null = null;
  private voiceModel: tf.LayersModel | null = null;
  private isInitialized = false;

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Load pre-trained models
      this.textModel = await tf.loadLayersModel('/models/text-emotion-model.json');
      this.voiceModel = await tf.loadLayersModel('/models/voice-emotion-model.json');
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize emotion detection models:', error);
      // Fallback to rule-based detection
      this.isInitialized = true;
    }
  }

  async analyzeTextEmotion(text: string): Promise<EmotionData> {
    if (!this.isInitialized) await this.initialize();

    // Preprocess text
    const processedText = this.preprocessText(text);
    
    // Extract features
    const features = this.extractTextFeatures(processedText);
    
    // Get predictions from multiple models
    const predictions = await Promise.all([
      this.geminiAnalysis(text),
      this.transformerAnalysis(features),
      this.ruleBasedAnalysis(text)
    ]);

    return this.ensembleTextAnalysis(predictions);
  }

  async analyzeVoiceEmotion(audioBuffer: ArrayBuffer): Promise<EmotionData> {
    if (!this.isInitialized) await this.initialize();

    try {
      const features = await this.extractAudioFeatures(audioBuffer);
      const prediction = await this.predictVoiceEmotion(features);
      return this.processVoiceEmotion(prediction);
    } catch (error) {
      console.error('Voice emotion analysis failed:', error);
      return this.getDefaultEmotionData();
    }
  }

  async analyzeMultiModal(text: string, audio?: ArrayBuffer): Promise<EmotionData> {
    const textPromise = this.analyzeTextEmotion(text);
    const voicePromise = audio ? this.analyzeVoiceEmotion(audio) : null;

    const [textEmotion, voiceEmotion] = await Promise.all([
      textPromise,
      voicePromise
    ]);

    if (voiceEmotion) {
      return this.fuseEmotionData(textEmotion, voiceEmotion);
    }

    return textEmotion;
  }

  private async geminiAnalysis(text: string): Promise<Partial<EmotionData>> {
    try {
      // This would integrate with Google Gemini API
      const response = await fetch('/api/ai/gemini-emotion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });

      if (!response.ok) throw new Error('Gemini API failed');
      
      return await response.json();
    } catch (error) {
      console.error('Gemini analysis failed:', error);
      return {};
    }
  }

  private async transformerAnalysis(features: number[]): Promise<Partial<EmotionData>> {
    if (!this.textModel) return {};

    try {
      const tensor = tf.tensor2d([features]);
      const prediction = this.textModel.predict(tensor) as tf.Tensor;
      const result = await prediction.data();
      
      tensor.dispose();
      prediction.dispose();

      return this.interpretTextPrediction(Array.from(result));
    } catch (error) {
      console.error('Transformer analysis failed:', error);
      return {};
    }
  }

  private ruleBasedAnalysis(text: string): Partial<EmotionData> {
    const lowerText = text.toLowerCase();
    
    // Stress indicators
    const stressKeywords = [
      'stressed', 'overwhelmed', 'anxious', 'worried', 'pressure',
      'deadline', 'exhausted', 'burned out', 'frustrated', 'difficult'
    ];
    
    // Positive indicators
    const positiveKeywords = [
      'happy', 'excited', 'motivated', 'confident', 'satisfied',
      'accomplished', 'grateful', 'optimistic', 'energetic'
    ];
    
    // Negative indicators
    const negativeKeywords = [
      'sad', 'depressed', 'angry', 'disappointed', 'hopeless',
      'lonely', 'confused', 'scared', 'upset', 'irritated'
    ];

    const stressCount = stressKeywords.filter(word => lowerText.includes(word)).length;
    const positiveCount = positiveKeywords.filter(word => lowerText.includes(word)).length;
    const negativeCount = negativeKeywords.filter(word => lowerText.includes(word)).length;

    let primaryEmotion = 'neutral';
    let sentiment: 'positive' | 'negative' | 'neutral' = 'neutral';
    let riskLevel: 'low' | 'medium' | 'high' = 'low';

    if (stressCount > 0) {
      riskLevel = stressCount > 2 ? 'high' : 'medium';
      primaryEmotion = 'stressed';
      sentiment = 'negative';
    } else if (negativeCount > positiveCount) {
      primaryEmotion = 'negative';
      sentiment = 'negative';
      riskLevel = negativeCount > 2 ? 'medium' : 'low';
    } else if (positiveCount > 0) {
      primaryEmotion = 'positive';
      sentiment = 'positive';
    }

    return {
      primaryEmotion,
      sentiment,
      riskLevel,
      stressIndicators: stressKeywords.filter(word => lowerText.includes(word)),
      confidence: Math.min(0.8, (stressCount + positiveCount + negativeCount) * 0.2)
    };
  }

  private preprocessText(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private extractTextFeatures(text: string): number[] {
    // Simple feature extraction - in production, use more sophisticated methods
    const words = text.split(' ');
    const features = [
      words.length, // Word count
      text.length, // Character count
      words.filter(w => w.length > 6).length, // Complex words
      (text.match(/[.!?]/g) || []).length, // Sentence count
      (text.match(/[A-Z]/g) || []).length, // Capital letters
    ];

    // Pad or truncate to fixed size
    while (features.length < 100) features.push(0);
    return features.slice(0, 100);
  }

  private async extractAudioFeatures(audioBuffer: ArrayBuffer): Promise<VoiceEmotionFeatures> {
    // This would use Web Audio API to extract features
    const audioContext = new AudioContext();
    const audioData = await audioContext.decodeAudioData(audioBuffer);
    
    // Extract basic features (simplified)
    const samples = audioData.getChannelData(0);
    const sampleRate = audioData.sampleRate;
    
    return {
      pitch: this.extractPitch(samples, sampleRate),
      energy: this.extractEnergy(samples),
      spectralCentroid: this.extractSpectralCentroid(samples),
      mfcc: this.extractMFCC(samples),
      tempo: this.extractTempo(samples, sampleRate),
      duration: audioData.duration
    };
  }

  private extractPitch(samples: Float32Array, sampleRate: number): number[] {
    // Simplified pitch extraction using autocorrelation
    const windowSize = Math.floor(sampleRate * 0.025); // 25ms window
    const pitch: number[] = [];
    
    for (let i = 0; i < samples.length - windowSize; i += windowSize) {
      const window = samples.slice(i, i + windowSize);
      const fundamental = this.autocorrelation(window, sampleRate);
      pitch.push(fundamental);
    }
    
    return pitch;
  }

  private extractEnergy(samples: Float32Array): number[] {
    const windowSize = 1024;
    const energy: number[] = [];
    
    for (let i = 0; i < samples.length - windowSize; i += windowSize) {
      let sum = 0;
      for (let j = i; j < i + windowSize; j++) {
        sum += samples[j] * samples[j];
      }
      energy.push(Math.sqrt(sum / windowSize));
    }
    
    return energy;
  }

  private extractSpectralCentroid(samples: Float32Array): number[] {
    // Simplified spectral centroid calculation
    return [0]; // Placeholder
  }

  private extractMFCC(samples: Float32Array): number[][] {
    // Simplified MFCC extraction
    return [[0]]; // Placeholder
  }

  private extractTempo(samples: Float32Array, sampleRate: number): number {
    // Simplified tempo detection
    return 120; // Placeholder
  }

  private autocorrelation(buffer: Float32Array, sampleRate: number): number {
    // Simplified autocorrelation for pitch detection
    let bestCorrelation = 0;
    let bestOffset = 0;
    
    const minPeriod = Math.floor(sampleRate / 800); // 800 Hz max
    const maxPeriod = Math.floor(sampleRate / 80);  // 80 Hz min
    
    for (let offset = minPeriod; offset < maxPeriod; offset++) {
      let correlation = 0;
      for (let i = 0; i < buffer.length - offset; i++) {
        correlation += buffer[i] * buffer[i + offset];
      }
      
      if (correlation > bestCorrelation) {
        bestCorrelation = correlation;
        bestOffset = offset;
      }
    }
    
    return bestOffset > 0 ? sampleRate / bestOffset : 0;
  }

  private async predictVoiceEmotion(features: VoiceEmotionFeatures): Promise<number[]> {
    if (!this.voiceModel) return [0.5, 0.5, 0.5, 0.5, 0.5]; // Default neutral

    try {
      // Flatten features for model input
      const flatFeatures = [
        ...features.pitch.slice(0, 10),
        ...features.energy.slice(0, 10),
        features.tempo,
        features.duration
      ];

      // Pad to expected input size
      while (flatFeatures.length < 50) flatFeatures.push(0);
      
      const tensor = tf.tensor2d([flatFeatures.slice(0, 50)]);
      const prediction = this.voiceModel.predict(tensor) as tf.Tensor;
      const result = await prediction.data();
      
      tensor.dispose();
      prediction.dispose();
      
      return Array.from(result);
    } catch (error) {
      console.error('Voice prediction failed:', error);
      return [0.5, 0.5, 0.5, 0.5, 0.5];
    }
  }

  private processVoiceEmotion(prediction: number[]): EmotionData {
    const emotions = ['happy', 'sad', 'angry', 'neutral', 'stressed'];
    const maxIndex = prediction.indexOf(Math.max(...prediction));
    
    return {
      primaryEmotion: emotions[maxIndex],
      confidence: prediction[maxIndex],
      sentiment: maxIndex < 2 ? 'positive' : maxIndex < 4 ? 'negative' : 'neutral',
      sentimentScore: prediction[0] - prediction[1], // happy - sad
      stressIndicators: prediction[4] > 0.6 ? ['voice_stress'] : [],
      riskLevel: prediction[4] > 0.7 ? 'high' : prediction[4] > 0.4 ? 'medium' : 'low',
      recommendations: this.generateRecommendations(emotions[maxIndex], prediction[maxIndex])
    };
  }

  private interpretTextPrediction(prediction: number[]): Partial<EmotionData> {
    const emotions = ['joy', 'sadness', 'anger', 'fear', 'surprise', 'neutral'];
    const maxIndex = prediction.indexOf(Math.max(...prediction));
    
    return {
      primaryEmotion: emotions[maxIndex],
      confidence: prediction[maxIndex],
      sentiment: maxIndex === 0 ? 'positive' : maxIndex < 4 ? 'negative' : 'neutral'
    };
  }

  private ensembleTextAnalysis(predictions: Partial<EmotionData>[]): EmotionData {
    // Combine predictions from multiple models
    const validPredictions = predictions.filter(p => p.primaryEmotion);
    
    if (validPredictions.length === 0) {
      return this.getDefaultEmotionData();
    }

    // Simple voting mechanism
    const emotionCounts: { [key: string]: number } = {};
    let totalConfidence = 0;
    let sentimentScore = 0;
    const allStressIndicators: string[] = [];
    const allRecommendations: string[] = [];

    validPredictions.forEach(pred => {
      if (pred.primaryEmotion) {
        emotionCounts[pred.primaryEmotion] = (emotionCounts[pred.primaryEmotion] || 0) + 1;
      }
      if (pred.confidence) totalConfidence += pred.confidence;
      if (pred.sentimentScore) sentimentScore += pred.sentimentScore;
      if (pred.stressIndicators) allStressIndicators.push(...pred.stressIndicators);
      if (pred.recommendations) allRecommendations.push(...pred.recommendations);
    });

    const primaryEmotion = Object.keys(emotionCounts).reduce((a, b) => 
      emotionCounts[a] > emotionCounts[b] ? a : b
    );

    const avgConfidence = totalConfidence / validPredictions.length;
    const avgSentimentScore = sentimentScore / validPredictions.length;
    
    let sentiment: 'positive' | 'negative' | 'neutral' = 'neutral';
    if (avgSentimentScore > 0.1) sentiment = 'positive';
    else if (avgSentimentScore < -0.1) sentiment = 'negative';

    const uniqueStressIndicators = [...new Set(allStressIndicators)];
    const riskLevel: 'low' | 'medium' | 'high' = 
      uniqueStressIndicators.length > 3 ? 'high' :
      uniqueStressIndicators.length > 1 ? 'medium' : 'low';

    return {
      primaryEmotion,
      confidence: avgConfidence,
      sentiment,
      sentimentScore: avgSentimentScore,
      stressIndicators: uniqueStressIndicators,
      riskLevel,
      recommendations: [...new Set(allRecommendations)]
    };
  }

  private fuseEmotionData(textEmotion: EmotionData, voiceEmotion: EmotionData): EmotionData {
    // Weighted fusion of text and voice emotion data
    const textWeight = 0.6;
    const voiceWeight = 0.4;

    const fusedConfidence = (textEmotion.confidence * textWeight) + (voiceEmotion.confidence * voiceWeight);
    const fusedSentimentScore = (textEmotion.sentimentScore * textWeight) + (voiceEmotion.sentimentScore * voiceWeight);

    // Choose primary emotion based on higher confidence
    const primaryEmotion = textEmotion.confidence > voiceEmotion.confidence ? 
      textEmotion.primaryEmotion : voiceEmotion.primaryEmotion;

    // Combine stress indicators
    const combinedStressIndicators = [
      ...new Set([...textEmotion.stressIndicators, ...voiceEmotion.stressIndicators])
    ];

    // Determine risk level based on both modalities
    const riskLevels = [textEmotion.riskLevel, voiceEmotion.riskLevel];
    const riskLevel = riskLevels.includes('high') ? 'high' : 
                     riskLevels.includes('medium') ? 'medium' : 'low';

    let sentiment: 'positive' | 'negative' | 'neutral' = 'neutral';
    if (fusedSentimentScore > 0.1) sentiment = 'positive';
    else if (fusedSentimentScore < -0.1) sentiment = 'negative';

    return {
      primaryEmotion,
      confidence: fusedConfidence,
      sentiment,
      sentimentScore: fusedSentimentScore,
      stressIndicators: combinedStressIndicators,
      riskLevel,
      recommendations: [
        ...new Set([...textEmotion.recommendations, ...voiceEmotion.recommendations])
      ]
    };
  }

  private generateRecommendations(emotion: string, confidence: number): string[] {
    const recommendations: { [key: string]: string[] } = {
      stressed: [
        'Take a 5-minute breathing exercise',
        'Consider a short walk or stretch break',
        'Practice mindfulness meditation',
        'Speak with a colleague or supervisor about workload'
      ],
      sad: [
        'Reach out to a trusted friend or colleague',
        'Engage in a favorite hobby or activity',
        'Consider speaking with a mental health professional',
        'Practice self-compassion and self-care'
      ],
      angry: [
        'Take deep breaths and count to ten',
        'Step away from the situation temporarily',
        'Express feelings through journaling',
        'Consider conflict resolution strategies'
      ],
      anxious: [
        'Practice grounding techniques (5-4-3-2-1 method)',
        'Break large tasks into smaller, manageable steps',
        'Use progressive muscle relaxation',
        'Limit caffeine intake'
      ],
      neutral: [
        'Maintain current wellness practices',
        'Set small, achievable goals for the day',
        'Stay connected with colleagues and friends'
      ]
    };

    return recommendations[emotion] || recommendations.neutral;
  }

  private getDefaultEmotionData(): EmotionData {
    return {
      primaryEmotion: 'neutral',
      confidence: 0.5,
      sentiment: 'neutral',
      sentimentScore: 0,
      stressIndicators: [],
      riskLevel: 'low',
      recommendations: ['Continue monitoring your wellness']
    };
  }
}

// Singleton instance
export const emotionDetector = new MultiModalEmotionDetection();