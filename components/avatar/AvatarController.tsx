import React, { useEffect, useState, useCallback, useRef } from 'react';
import * as THREE from 'three';
import AvatarModel from './AvatarModel';
import { useLipSync } from './LipSyncController';
import { useTTSLipSync } from './TTSLipSync';

interface AvatarControllerProps {
  message?: string;
  emotion?: string;
  speaking: boolean;
  scale?: number;
  interactive?: boolean;
  showEnvironment?: boolean;
  enableFloating?: boolean;
  quality?: 'low' | 'medium' | 'high';
  // Lip sync props
  lipSyncSource?: 'microphone' | 'playback' | 'text';
  audioElement?: HTMLAudioElement;
  speechText?: string;
  onLipSyncUpdate?: (state: any) => void;
}

export default function AvatarController({ 
  message, 
  emotion = 'IDLE', 
  speaking, 
  scale = 1.5,
  interactive = true,
  showEnvironment = true,
  enableFloating = true,
  quality = 'high',
  lipSyncSource = 'microphone',
  audioElement,
  speechText,
  onLipSyncUpdate
}: AvatarControllerProps) {
  // Track viseme animation timing for more natural mouth movements
  const [visemeActive, setVisemeActive] = useState(false);
  const [speakingIntensity, setSpeakingIntensity] = useState(0);
  
  // Avatar ref for lip sync
  const avatarRef = useRef<THREE.Group>(null);
  
  // Simplified lip sync state
  const [currentViseme, setCurrentViseme] = useState('sil');
  const [lipSyncActive, setLipSyncActive] = useState(false);
  
  // TTS lip sync for enhanced speech
  const { speak: speakWithLipSync, stop: stopTTS, isPlaying: isTTSPlaying } = useTTSLipSync();
  
  // Simple lip sync logic without useFrame
  useEffect(() => {
    if (speaking && lipSyncSource) {
      setLipSyncActive(true);
      
      if (lipSyncSource === 'text' && speechText) {
        // Simple text-based viseme simulation
        const words = speechText.toLowerCase().split(' ');
        let wordIndex = 0;
        
        const interval = setInterval(() => {
          if (wordIndex < words.length) {
            const word = words[wordIndex];
            // Simple phoneme mapping
            if (word.includes('a') || word.includes('e')) {
              setCurrentViseme('aa');
            } else if (word.includes('o') || word.includes('u')) {
              setCurrentViseme('O');
            } else if (word.includes('i')) {
              setCurrentViseme('I');
            } else if (word.includes('p') || word.includes('b') || word.includes('m')) {
              setCurrentViseme('PP');
            } else if (word.includes('f') || word.includes('v')) {
              setCurrentViseme('FF');
            } else if (word.includes('s') || word.includes('z')) {
              setCurrentViseme('SS');
            } else {
              setCurrentViseme('aa');
            }
            wordIndex++;
          } else {
            setCurrentViseme('sil');
            clearInterval(interval);
          }
        }, 200); // Change viseme every 200ms
        
        return () => clearInterval(interval);
      } else if (lipSyncSource === 'microphone') {
        // Simple microphone simulation
        const interval = setInterval(() => {
          const visemes = ['aa', 'E', 'I', 'O', 'U', 'PP', 'FF', 'SS'];
          setCurrentViseme(visemes[Math.floor(Math.random() * visemes.length)]);
        }, 100);
        
        return () => clearInterval(interval);
      }
    } else {
      setLipSyncActive(false);
      setCurrentViseme('sil');
    }
  }, [speaking, lipSyncSource, speechText]);
  
  // Function to simulate natural speech patterns with more variation
  const simulateSpeechPattern = useCallback(() => {
    // Create natural pauses in speech
    const shouldPause = Math.random() < 0.15; // 15% chance of a pause
    
    if (shouldPause) {
      setVisemeActive(false);
      // Longer pause (250-500ms)
      return Math.random() * 250 + 250;
    } else {
      setVisemeActive(true);
      // Normal speaking (80-250ms) - slightly faster for more responsive lip sync
      return Math.random() * 170 + 80;
    }
  }, []);
  
  // Create more natural speaking patterns with pauses
  useEffect(() => {
    if (!speaking) {
      setVisemeActive(false);
      setSpeakingIntensity(0);
      return;
    }
    
    // Initial speaking state
    setVisemeActive(true);
    setSpeakingIntensity(1);
    
    // Use recursive setTimeout for variable timing
    let timeoutId: NodeJS.Timeout;
    let isActive = true;
    
    const updateSpeaking = () => {
      if (!isActive) return;
      
      const nextInterval = simulateSpeechPattern();
      timeoutId = setTimeout(() => {
        if (!isActive) return;
        // Vary speaking intensity for more realism
        setSpeakingIntensity(Math.random() * 0.4 + 0.6); // 0.6-1.0 range
        updateSpeaking();
      }, nextInterval);
    };
    
    updateSpeaking();
    
    return () => {
      isActive = false;
      clearTimeout(timeoutId);
      setVisemeActive(false);
      setSpeakingIntensity(0);
    };
  }, [speaking, simulateSpeechPattern]);
  
  // Use refs for smooth animation
  const animationRef = useRef<number>();
  const headPositionRef = useRef({ x: 0, y: 0 });
  
  // Animate head movement
  useEffect(() => {
    if (!speaking) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      headPositionRef.current = { x: 0, y: 0 };
      return;
    }
    
    const animate = () => {
      // More natural head movement with varied frequencies
      const time = Date.now();
      headPositionRef.current = {
        x: Math.sin(time / 2000) * 2 + Math.sin(time / 1300) * 0.5,
        y: Math.sin(time / 1700) * 1 + Math.sin(time / 900) * 0.3
      };
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [speaking]);
  
  return (
    <div className="avatar-container h-full w-full relative">
      {/* Enhanced subtle head movement when speaking */}
      <div 
        className="h-full w-full transition-all duration-300 ease-in-out"
        style={{
          transform: speaking ? 
            `translate(${headPositionRef.current.x}px, ${headPositionRef.current.y}px) rotate(${headPositionRef.current.x * 0.2}deg)` : 
            'none'
        }}
      >
        <AvatarModel 
          ref={avatarRef}
          emotion={emotion as any} 
          speaking={speaking && (visemeActive || lipSyncActive)} 
          scale={scale}
          interactive={interactive}
          showEnvironment={showEnvironment}
          enableFloating={enableFloating}
          quality={quality}
          lipSyncActive={lipSyncActive}
          currentViseme={currentViseme}
        />
      </div>
    </div>
  );
}