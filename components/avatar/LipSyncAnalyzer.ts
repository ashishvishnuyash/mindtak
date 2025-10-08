/**
 * LipSyncAnalyzer - Extracts visemes and audio features for lip sync animation
 * Supports both microphone input and audio playback analysis
 */

export interface VisemeData {
  viseme: string;
  intensity: number;
  timestamp: number;
}

export interface AudioAnalysisResult {
  visemes: VisemeData[];
  duration: number;
  sampleRate: number;
}

// Viseme to Ready Player Me blendshape mapping
export const VISEME_BLENDSHAPE_MAP: Record<string, string> = {
  sil: "viseme_sil", // Silence
  PP: "viseme_PP", // P, B, M sounds
  FF: "viseme_FF", // F, V sounds
  TH: "viseme_TH", // TH sounds
  DD: "viseme_DD", // T, D, N, L sounds
  kk: "viseme_kk", // K, G sounds
  CH: "viseme_CH", // CH, J, SH sounds
  SS: "viseme_SS", // S, Z sounds
  nn: "viseme_nn", // N sounds
  RR: "viseme_RR", // R sounds
  aa: "viseme_aa", // A sounds (cat)
  E: "viseme_E", // E sounds (bed)
  I: "viseme_I", // I sounds (bit)
  O: "viseme_O", // O sounds (hot)
  U: "viseme_U", // U sounds (book)
};

// Phoneme to viseme mapping for basic analysis
const PHONEME_TO_VISEME: Record<string, string> = {
  // Consonants
  p: "PP",
  b: "PP",
  m: "PP",
  f: "FF",
  v: "FF",
  th: "TH",
  dh: "TH",
  t: "DD",
  d: "DD",
  n: "DD",
  l: "DD",
  k: "kk",
  g: "kk",
  ch: "CH",
  jh: "CH",
  sh: "CH",
  zh: "CH",
  s: "SS",
  z: "SS",
  r: "RR",

  // Vowels
  aa: "aa",
  ae: "aa",
  ah: "aa",
  eh: "E",
  er: "E",
  ey: "E",
  ih: "I",
  iy: "I",
  ao: "O",
  ow: "O",
  oy: "O",
  uh: "U",
  uw: "U",
};

export class LipSyncAnalyzer {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private dataArray: Uint8Array | null = null;
  private isAnalyzing = false;
  private animationFrame: number | null = null;

  constructor() {
    this.initializeAudioContext();
  }

  private initializeAudioContext() {
    try {
      this.audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;
      this.analyser.smoothingTimeConstant = 0.8;

      const bufferLength = this.analyser.frequencyBinCount;
      this.dataArray = new Uint8Array(bufferLength) as Uint8Array;
    } catch (error) {
      console.error("Failed to initialize audio context:", error);
    }
  }

  /**
   * Analyze microphone input for real-time lip sync
   */
  async startMicrophoneAnalysis(
    onVisemeUpdate: (viseme: VisemeData) => void
  ): Promise<boolean> {
    if (!this.audioContext || !this.analyser) return false;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100,
        },
      });

      const source = this.audioContext.createMediaStreamSource(stream);
      source.connect(this.analyser);

      this.isAnalyzing = true;
      this.analyzeRealTime(onVisemeUpdate);

      return true;
    } catch (error) {
      console.error("Failed to access microphone:", error);
      return false;
    }
  }

  /**
   * Analyze audio element for playback lip sync
   */
  analyzeAudioElement(
    audioElement: HTMLAudioElement,
    onVisemeUpdate: (viseme: VisemeData) => void
  ): boolean {
    if (!this.audioContext || !this.analyser) return false;

    try {
      const source = this.audioContext.createMediaElementSource(audioElement);
      source.connect(this.analyser);
      source.connect(this.audioContext.destination);

      this.isAnalyzing = true;
      this.analyzeRealTime(onVisemeUpdate);

      return true;
    } catch (error) {
      console.error("Failed to analyze audio element:", error);
      return false;
    }
  }

  /**
   * Real-time audio analysis loop
   */
  private analyzeRealTime(onVisemeUpdate: (viseme: VisemeData) => void) {
    if (!this.isAnalyzing || !this.analyser || !this.dataArray) return;

    // Create a properly typed array for Web Audio API
    const frequencyData = new Uint8Array(this.dataArray.length);
    this.analyser.getByteFrequencyData(frequencyData);

    // Calculate audio energy and frequency characteristics
    const audioEnergy = this.calculateAudioEnergy(frequencyData);
    const dominantFrequency = this.getDominantFrequency(frequencyData);

    // Map audio characteristics to visemes
    const viseme = this.mapAudioToViseme(audioEnergy, dominantFrequency);

    if (viseme) {
      onVisemeUpdate({
        viseme: viseme.viseme,
        intensity: viseme.intensity,
        timestamp: Date.now(),
      });
    }

    this.animationFrame = requestAnimationFrame(() =>
      this.analyzeRealTime(onVisemeUpdate)
    );
  }

  /**
   * Calculate overall audio energy
   */
  private calculateAudioEnergy(dataArray: Uint8Array): number {
    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
      sum += dataArray[i] * dataArray[i];
    }
    return Math.sqrt(sum / dataArray.length) / 255;
  }

  /**
   * Get dominant frequency range
   */
  private getDominantFrequency(dataArray: Uint8Array): number {
    let maxIndex = 0;
    let maxValue = 0;

    for (let i = 0; i < dataArray.length; i++) {
      if (dataArray[i] > maxValue) {
        maxValue = dataArray[i];
        maxIndex = i;
      }
    }

    // Convert bin index to frequency (assuming 44.1kHz sample rate)
    const nyquist = 22050;
    return (maxIndex / dataArray.length) * nyquist;
  }

  /**
   * Map audio characteristics to visemes using frequency analysis
   */
  private mapAudioToViseme(
    energy: number,
    frequency: number
  ): { viseme: string; intensity: number } | null {
    // Silence threshold
    if (energy < 0.01) {
      return { viseme: "sil", intensity: 0 };
    }

    // Frequency-based viseme mapping (simplified)
    let viseme = "aa"; // Default vowel

    if (frequency < 500) {
      // Low frequencies - typically vowels like 'U', 'O'
      viseme = energy > 0.3 ? "O" : "U";
    } else if (frequency < 1000) {
      // Mid-low frequencies - vowels like 'aa', 'E'
      viseme = energy > 0.4 ? "aa" : "E";
    } else if (frequency < 2000) {
      // Mid frequencies - vowels like 'I', consonants
      viseme = energy > 0.5 ? "I" : "E";
    } else if (frequency < 4000) {
      // High frequencies - consonants like 'SS', 'FF'
      viseme = energy > 0.6 ? "SS" : "FF";
    } else {
      // Very high frequencies - fricatives and sibilants
      viseme = "SS";
    }

    return {
      viseme,
      intensity: Math.min(energy * 2, 1), // Amplify but cap at 1
    };
  }

  /**
   * Analyze text for basic phoneme-to-viseme mapping
   * This is a fallback when audio analysis isn't available
   */
  analyzeText(text: string): VisemeData[] {
    const words = text.toLowerCase().split(/\s+/);
    const visemes: VisemeData[] = [];
    let timestamp = 0;
    const avgWordDuration = 500; // ms per word

    words.forEach((word, wordIndex) => {
      // Simple phonetic analysis - this is very basic
      // In production, you'd want to use a proper phonetic dictionary
      const phonemes = this.textToPhonemes(word);

      phonemes.forEach((phoneme, phonemeIndex) => {
        const viseme = PHONEME_TO_VISEME[phoneme] || "aa";
        const duration = avgWordDuration / phonemes.length;

        visemes.push({
          viseme,
          intensity: 0.7 + Math.random() * 0.3, // Add some variation
          timestamp: timestamp + phonemeIndex * duration,
        });
      });

      timestamp += avgWordDuration;

      // Add pause between words
      if (wordIndex < words.length - 1) {
        visemes.push({
          viseme: "sil",
          intensity: 0,
          timestamp: timestamp,
        });
        timestamp += 100; // 100ms pause
      }
    });

    return visemes;
  }

  /**
   * Very basic text to phoneme conversion
   * In production, use a proper phonetic library
   */
  private textToPhonemes(word: string): string[] {
    // This is extremely simplified - just for demonstration
    const phonemes: string[] = [];

    for (let i = 0; i < word.length; i++) {
      const char = word[i];

      switch (char) {
        case "a":
          phonemes.push("aa");
          break;
        case "e":
          phonemes.push("eh");
          break;
        case "i":
          phonemes.push("ih");
          break;
        case "o":
          phonemes.push("ao");
          break;
        case "u":
          phonemes.push("uh");
          break;
        case "p":
        case "b":
        case "m":
          phonemes.push("p");
          break;
        case "f":
        case "v":
          phonemes.push("f");
          break;
        case "t":
        case "d":
        case "n":
        case "l":
          phonemes.push("t");
          break;
        case "k":
        case "g":
          phonemes.push("k");
          break;
        case "s":
        case "z":
          phonemes.push("s");
          break;
        case "r":
          phonemes.push("r");
          break;
        default:
          phonemes.push("aa");
          break;
      }
    }

    return phonemes;
  }

  /**
   * Stop analysis and cleanup
   */
  stopAnalysis() {
    this.isAnalyzing = false;

    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }

    if (this.audioContext && this.audioContext.state !== "closed") {
      this.audioContext.close();
    }
  }

  /**
   * Resume audio context if suspended (required by some browsers)
   */
  async resumeAudioContext() {
    if (this.audioContext && this.audioContext.state === "suspended") {
      await this.audioContext.resume();
    }
  }
}
