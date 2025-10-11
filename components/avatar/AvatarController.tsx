import React, { useEffect, useState, useCallback, useRef } from 'react';
import AvatarModel from './AvatarModel';

interface AvatarControllerProps {
  message?: string;
  emotion?: string;
  speaking: boolean;
  scale?: number;
  lipSyncSource?: 'microphone' | 'playback' | 'text';
  audioElement?: HTMLAudioElement;
  speechText?: string;
}

export default function AvatarController({ 
  message, 
  emotion = 'IDLE', 
  speaking, 
  scale = 1.5,
  lipSyncSource = 'microphone',
  audioElement,
  speechText
}: AvatarControllerProps) {
  // Track viseme animation timing for more natural mouth movements
  const [visemeActive, setVisemeActive] = useState(false);
  const [speakingIntensity, setSpeakingIntensity] = useState(0);
  
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
    
    const updateSpeaking = () => {
      const nextInterval = simulateSpeechPattern();
      timeoutId = setTimeout(() => {
        // Vary speaking intensity for more realism
        setSpeakingIntensity(Math.random() * 0.4 + 0.6); // 0.6-1.0 range
        updateSpeaking();
      }, nextInterval);
    };
    
    updateSpeaking();
    
    return () => {
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
          emotion={emotion as any} 
          speaking={speaking && visemeActive} 
          scale={scale}
          lipSyncSource={lipSyncSource}
          audioElement={audioElement}
          speechText={speechText || message}
        />
      </div>
    </div>
  );
}