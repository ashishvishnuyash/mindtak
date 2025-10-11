/**
 * TTSLipSync - Enhanced Text-to-Speech with lip sync integration
 * Provides better timing and viseme mapping for TTS audio
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { LipSyncAnalyzer, VisemeData } from './LipSyncAnalyzer';

export interface TTSLipSyncOptions {
  voice?: SpeechSynthesisVoice;
  rate?: number;
  pitch?: number;
  volume?: number;
  onStart?: () => void;
  onEnd?: () => void;
  onVisemeUpdate?: (viseme: VisemeData) => void;
}

export class TTSLipSync {
  private utterance: SpeechSynthesisUtterance | null = null;
  private analyzer: LipSyncAnalyzer | null = null;
  private audioContext: AudioContext | null = null;
  private isPlaying = false;

  constructor() {
    this.analyzer = new LipSyncAnalyzer();
  }

  /**
   * Speak text with lip sync analysis
   */
  async speak(text: string, options: TTSLipSyncOptions = {}): Promise<void> {
    if (this.isPlaying) {
      this.stop();
    }

    return new Promise((resolve, reject) => {
      try {
        this.utterance = new SpeechSynthesisUtterance(text);
        
        // Configure voice settings
        if (options.voice) this.utterance.voice = options.voice;
        this.utterance.rate = options.rate || 0.9;
        this.utterance.pitch = options.pitch || 1;
        this.utterance.volume = options.volume || 1;

        // Set up event handlers
        this.utterance.onstart = () => {
          this.isPlaying = true;
          options.onStart?.();
          
          // Start lip sync analysis if we have viseme callback
          if (options.onVisemeUpdate) {
            this.startLipSyncAnalysis(text, options.onVisemeUpdate);
          }
        };

        this.utterance.onend = () => {
          this.isPlaying = false;
          options.onEnd?.();
          resolve();
        };

        this.utterance.onerror = (event) => {
          this.isPlaying = false;
          reject(new Error(`TTS Error: ${event.error}`));
        };

        // Start speaking
        window.speechSynthesis.speak(this.utterance);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Start lip sync analysis for TTS
   */
  private startLipSyncAnalysis(text: string, onVisemeUpdate: (viseme: VisemeData) => void) {
    if (!this.analyzer) return;

    // Generate viseme sequence from text
    const visemes = this.analyzer.analyzeText(text);
    let startTime = Date.now();
    let currentIndex = 0;

    const updateVisemes = () => {
      if (!this.isPlaying || currentIndex >= visemes.length) return;

      const elapsed = Date.now() - startTime;
      const currentViseme = visemes[currentIndex];

      if (elapsed >= currentViseme.timestamp) {
        onVisemeUpdate(currentViseme);
        currentIndex++;
      }

      if (this.isPlaying) {
        requestAnimationFrame(updateVisemes);
      }
    };

    requestAnimationFrame(updateVisemes);
  }

  /**
   * Stop current speech
   */
  stop() {
    if (this.isPlaying) {
      window.speechSynthesis.cancel();
      this.isPlaying = false;
    }
  }

  /**
   * Check if currently speaking
   */
  isSpeaking(): boolean {
    return this.isPlaying;
  }

  /**
   * Get available voices
   */
  static getVoices(): SpeechSynthesisVoice[] {
    return window.speechSynthesis.getVoices();
  }

  /**
   * Get recommended voice for lip sync (clearer pronunciation)
   */
  static getRecommendedVoice(): SpeechSynthesisVoice | null {
    const voices = TTSLipSync.getVoices();
    
    // Prefer English voices with good quality
    const preferredVoices = [
      'Google US English',
      'Microsoft Zira - English (United States)',
      'Alex',
      'Samantha'
    ];

    for (const voiceName of preferredVoices) {
      const voice = voices.find(v => v.name.includes(voiceName));
      if (voice) return voice;
    }

    // Fallback to first English voice
    return voices.find(v => v.lang.startsWith('en')) || voices[0] || null;
  }
}

/**
 * React hook for TTS with lip sync
 */
export function useTTSLipSync() {
  const ttsRef = useRef<TTSLipSync | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentViseme, setCurrentViseme] = useState<VisemeData | null>(null);

  useEffect(() => {
    ttsRef.current = new TTSLipSync();
    
    return () => {
      if (ttsRef.current) {
        ttsRef.current.stop();
      }
    };
  }, []);

  const speak = useCallback(async (text: string, options: Omit<TTSLipSyncOptions, 'onStart' | 'onEnd' | 'onVisemeUpdate'> = {}) => {
    if (!ttsRef.current) return;

    try {
      await ttsRef.current.speak(text, {
        ...options,
        onStart: () => setIsPlaying(true),
        onEnd: () => {
          setIsPlaying(false);
          setCurrentViseme(null);
        },
        onVisemeUpdate: (viseme) => setCurrentViseme(viseme)
      });
    } catch (error) {
      console.error('TTS Error:', error);
      setIsPlaying(false);
      setCurrentViseme(null);
    }
  }, []);

  const stop = useCallback(() => {
    if (ttsRef.current) {
      ttsRef.current.stop();
      setIsPlaying(false);
      setCurrentViseme(null);
    }
  }, []);

  return {
    speak,
    stop,
    isPlaying,
    currentViseme,
    isSpeaking: () => ttsRef.current?.isSpeaking() || false
  };
}

/**
 * TTS Lip Sync Component
 */
interface TTSLipSyncComponentProps {
  text: string;
  autoPlay?: boolean;
  voice?: SpeechSynthesisVoice;
  rate?: number;
  pitch?: number;
  volume?: number;
  onVisemeUpdate?: (viseme: VisemeData) => void;
  onPlayingChange?: (playing: boolean) => void;
  children?: (state: { isPlaying: boolean; currentViseme: VisemeData | null; speak: () => void; stop: () => void }) => React.ReactNode;
}

export default function TTSLipSyncComponent({
  text,
  autoPlay = false,
  voice,
  rate,
  pitch,
  volume,
  onVisemeUpdate,
  onPlayingChange,
  children
}: TTSLipSyncComponentProps) {
  const { speak, stop, isPlaying, currentViseme } = useTTSLipSync();

  // Auto-play effect
  useEffect(() => {
    if (autoPlay && text) {
      speak(text, { voice, rate, pitch, volume });
    }
  }, [autoPlay, text, voice, rate, pitch, volume, speak]);

  // Notify parent of viseme updates
  useEffect(() => {
    if (currentViseme && onVisemeUpdate) {
      onVisemeUpdate(currentViseme);
    }
  }, [currentViseme, onVisemeUpdate]);

  // Notify parent of playing state changes
  useEffect(() => {
    if (onPlayingChange) {
      onPlayingChange(isPlaying);
    }
  }, [isPlaying, onPlayingChange]);

  const handleSpeak = useCallback(() => {
    speak(text, { voice, rate, pitch, volume });
  }, [text, voice, rate, pitch, volume, speak]);

  if (children) {
    return <>{children({ isPlaying, currentViseme, speak: handleSpeak, stop })}</>;
  }

  return (
    <div className="tts-lip-sync-controls">
      <button
        onClick={isPlaying ? stop : handleSpeak}
        disabled={!text}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {isPlaying ? 'Stop' : 'Speak'}
      </button>
      
      {currentViseme && (
        <div className="mt-2 text-sm text-gray-600">
          Current viseme: {currentViseme.viseme} (intensity: {currentViseme.intensity.toFixed(2)})
        </div>
      )}
    </div>
  );
}