'use client';

import React, { useRef, useEffect, useState, Suspense } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, Text, Sphere } from '@react-three/drei';
import * as THREE from 'three';
import { motion } from 'framer-motion';

export interface AvatarState {
  emotion: 'neutral' | 'happy' | 'concerned' | 'empathetic' | 'excited' | 'sad';
  speaking: boolean;
  listening: boolean;
  eyeContact: boolean;
  intensity: number; // 0-1
}

export interface AvatarProps {
  state: AvatarState;
  audioLevel?: number;
  onInteraction?: () => void;
  className?: string;
}

// Emotion to animation mapping
const emotionToAnimation = {
  neutral: {
    mouth: { scale: 1, position: [0, -0.3, 0.8] },
    eyes: { scale: 1, position: [0, 0.2, 0.8] },
    eyebrows: { rotation: 0, position: [0, 0.4, 0.8] },
    color: '#87CEEB'
  },
  happy: {
    mouth: { scale: 1.2, position: [0, -0.25, 0.8] },
    eyes: { scale: 0.9, position: [0, 0.2, 0.8] },
    eyebrows: { rotation: 0.1, position: [0, 0.45, 0.8] },
    color: '#FFD700'
  },
  concerned: {
    mouth: { scale: 0.8, position: [0, -0.35, 0.8] },
    eyes: { scale: 1.1, position: [0, 0.15, 0.8] },
    eyebrows: { rotation: -0.2, position: [0, 0.35, 0.8] },
    color: '#FFA500'
  },
  empathetic: {
    mouth: { scale: 0.9, position: [0, -0.32, 0.8] },
    eyes: { scale: 1.05, position: [0, 0.18, 0.8] },
    eyebrows: { rotation: -0.1, position: [0, 0.38, 0.8] },
    color: '#98FB98'
  },
  excited: {
    mouth: { scale: 1.3, position: [0, -0.2, 0.8] },
    eyes: { scale: 1.2, position: [0, 0.25, 0.8] },
    eyebrows: { rotation: 0.3, position: [0, 0.5, 0.8] },
    color: '#FF69B4'
  },
  sad: {
    mouth: { scale: 0.7, position: [0, -0.4, 0.8] },
    eyes: { scale: 0.8, position: [0, 0.1, 0.8] },
    eyebrows: { rotation: -0.3, position: [0, 0.3, 0.8] },
    color: '#6495ED'
  }
};

// Avatar Face Component
function AvatarFace({ state, audioLevel = 0 }: { state: AvatarState; audioLevel: number }) {
  const faceRef = useRef<THREE.Group>(null);
  const mouthRef = useRef<THREE.Mesh>(null);
  const leftEyeRef = useRef<THREE.Mesh>(null);
  const rightEyeRef = useRef<THREE.Mesh>(null);
  const leftEyebrowRef = useRef<THREE.Mesh>(null);
  const rightEyebrowRef = useRef<THREE.Mesh>(null);

  const [currentEmotion, setCurrentEmotion] = useState<AvatarState['emotion']>('neutral');
  const [blinkTimer, setBlinkTimer] = useState(0);

  useEffect(() => {
    setCurrentEmotion(state.emotion);
  }, [state.emotion]);

  useFrame((frameState, delta) => {
    if (!faceRef.current) return;

    const animation = emotionToAnimation[currentEmotion];
    const intensity = state.intensity;

    // Smooth transitions
    const lerpFactor = delta * 3;

    // Face breathing animation
    const breathingScale = 1 + Math.sin(frameState.clock.elapsedTime * 2) * 0.02;
    faceRef.current.scale.setScalar(breathingScale);

    // Mouth animation based on speaking and audio level
    if (mouthRef.current) {
      const targetScale = state.speaking 
        ? animation.mouth.scale * (1 + audioLevel * 0.5)
        : animation.mouth.scale;
      
      mouthRef.current.scale.lerp(
        new THREE.Vector3(targetScale, targetScale * 0.8, 1),
        lerpFactor
      );

      // Lip sync simulation
      if (state.speaking && audioLevel > 0.1) {
        const lipSync = Math.sin(frameState.clock.elapsedTime * 20) * audioLevel * 0.1;
        mouthRef.current.position.y = animation.mouth.position[1] + lipSync;
      }
    }

    // Eye animation
    if (leftEyeRef.current && rightEyeRef.current) {
      const eyeScale = animation.eyes.scale * (1 + intensity * 0.1);
      leftEyeRef.current.scale.setScalar(eyeScale);
      rightEyeRef.current.scale.setScalar(eyeScale);

      // Blinking animation
      setBlinkTimer(prev => prev + delta);
      if (blinkTimer > 3 + Math.random() * 2) { // Random blink interval
        const blinkScale = Math.max(0.1, 1 - Math.sin(frameState.clock.elapsedTime * 20) * 0.9);
        leftEyeRef.current.scale.y = blinkScale;
        rightEyeRef.current.scale.y = blinkScale;
        
        if (blinkTimer > 3.2) {
          setBlinkTimer(0);
        }
      }

      // Eye contact simulation
      if (state.eyeContact) {
        const lookAtTarget = new THREE.Vector3(0, 0, 1);
        leftEyeRef.current.lookAt(lookAtTarget);
        rightEyeRef.current.lookAt(lookAtTarget);
      }
    }

    // Eyebrow animation
    if (leftEyebrowRef.current && rightEyebrowRef.current) {
      const targetRotation = animation.eyebrows.rotation * intensity;
      leftEyebrowRef.current.rotation.z = THREE.MathUtils.lerp(
        leftEyebrowRef.current.rotation.z,
        targetRotation,
        lerpFactor
      );
      rightEyebrowRef.current.rotation.z = THREE.MathUtils.lerp(
        rightEyebrowRef.current.rotation.z,
        -targetRotation,
        lerpFactor
      );
    }

    // Listening animation
    if (state.listening) {
      const tilt = Math.sin(frameState.clock.elapsedTime * 1.5) * 0.1;
      faceRef.current.rotation.z = tilt;
    } else {
      faceRef.current.rotation.z = THREE.MathUtils.lerp(faceRef.current.rotation.z, 0, lerpFactor);
    }
  });

  const animation = emotionToAnimation[currentEmotion];

  return (
    <group ref={faceRef}>
      {/* Head */}
      <Sphere args={[1, 32, 32]} position={[0, 0, 0]}>
        <meshStandardMaterial color={animation.color} />
      </Sphere>

      {/* Eyes */}
      <Sphere ref={leftEyeRef} args={[0.15, 16, 16]} position={[-0.3, 0.2, 0.8]}>
        <meshStandardMaterial color="#000000" />
      </Sphere>
      <Sphere ref={rightEyeRef} args={[0.15, 16, 16]} position={[0.3, 0.2, 0.8]}>
        <meshStandardMaterial color="#000000" />
      </Sphere>

      {/* Eyebrows */}
      <mesh ref={leftEyebrowRef} position={[-0.3, 0.4, 0.8]}>
        <boxGeometry args={[0.3, 0.05, 0.1]} />
        <meshStandardMaterial color="#654321" />
      </mesh>
      <mesh ref={rightEyebrowRef} position={[0.3, 0.4, 0.8]}>
        <boxGeometry args={[0.3, 0.05, 0.1]} />
        <meshStandardMaterial color="#654321" />
      </mesh>

      {/* Mouth */}
      <Sphere ref={mouthRef} args={[0.2, 16, 8]} position={animation.mouth.position}>
        <meshStandardMaterial color="#8B0000" />
      </Sphere>

      {/* Nose */}
      <Sphere args={[0.08, 8, 8]} position={[0, 0, 0.9]}>
        <meshStandardMaterial color={animation.color} />
      </Sphere>
    </group>
  );
}

// Particle system for emotional aura
function EmotionalAura({ emotion, intensity }: { emotion: AvatarState['emotion']; intensity: number }) {
  const particlesRef = useRef<THREE.Points>(null);
  const particleCount = 100;

  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);

  // Initialize particles
  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 4;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 4;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 4;

    const color = new THREE.Color(emotionToAnimation[emotion].color);
    colors[i * 3] = color.r;
    colors[i * 3 + 1] = color.g;
    colors[i * 3 + 2] = color.b;
  }

  useFrame((state) => {
    if (!particlesRef.current) return;

    const time = state.clock.elapsedTime;
    const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      positions[i3 + 1] += Math.sin(time + i) * 0.01 * intensity;
      
      // Reset particles that go too far
      if (positions[i3 + 1] > 2) {
        positions[i3 + 1] = -2;
      }
    }

    particlesRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={particleCount}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        vertexColors
        transparent
        opacity={intensity * 0.6}
        sizeAttenuation
      />
    </points>
  );
}

// Main Avatar Component
export function AvatarSystem({ state, audioLevel = 0, onInteraction, className }: AvatarProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <motion.div
      className={`relative w-full h-full ${className}`}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      onClick={onInteraction}
    >
      {/* Status Indicator */}
      <div className="absolute top-4 left-4 z-10">
        <motion.div
          className={`w-3 h-3 rounded-full ${
            state.speaking ? 'bg-green-500' : 
            state.listening ? 'bg-blue-500' : 
            'bg-gray-400'
          }`}
          animate={{
            scale: state.speaking || state.listening ? [1, 1.2, 1] : 1,
          }}
          transition={{
            duration: 0.5,
            repeat: state.speaking || state.listening ? Infinity : 0,
          }}
        />
      </div>

      {/* Emotion Label */}
      <div className="absolute top-4 right-4 z-10">
        <motion.div
          className="bg-black/20 backdrop-blur-sm rounded-lg px-3 py-1"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          key={state.emotion}
        >
          <span className="text-white text-sm font-medium capitalize">
            {state.emotion}
          </span>
        </motion.div>
      </div>

      {/* 3D Avatar */}
      <Canvas
        camera={{ position: [0, 0, 3], fov: 50 }}
        style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
      >
        <Suspense fallback={null}>
          {/* Lighting */}
          <ambientLight intensity={0.6} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <pointLight position={[-10, -10, -5]} intensity={0.5} />

          {/* Avatar Face */}
          <AvatarFace state={state} audioLevel={audioLevel} />

          {/* Emotional Aura */}
          <EmotionalAura emotion={state.emotion} intensity={state.intensity} />

          {/* Controls */}
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            enableRotate={true}
            autoRotate={false}
            maxPolarAngle={Math.PI / 2}
            minPolarAngle={Math.PI / 2}
          />
        </Suspense>
      </Canvas>

      {/* Audio Visualizer */}
      {state.speaking && audioLevel > 0 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
          <div className="flex items-end space-x-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <motion.div
                key={i}
                className="w-2 bg-white rounded-full"
                animate={{
                  height: [8, 8 + audioLevel * 20 * (i + 1), 8],
                }}
                transition={{
                  duration: 0.3,
                  repeat: Infinity,
                  delay: i * 0.1,
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Loading State */}
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
        </div>
      )}
    </motion.div>
  );
}

// Avatar Controller Hook
export function useAvatarController() {
  const [state, setState] = useState<AvatarState>({
    emotion: 'neutral',
    speaking: false,
    listening: false,
    eyeContact: true,
    intensity: 0.5,
  });

  const updateEmotion = (emotion: AvatarState['emotion'], intensity: number = 0.5) => {
    setState(prev => ({ ...prev, emotion, intensity }));
  };

  const setSpeaking = (speaking: boolean) => {
    setState(prev => ({ ...prev, speaking, listening: !speaking }));
  };

  const setListening = (listening: boolean) => {
    setState(prev => ({ ...prev, listening, speaking: !listening }));
  };

  const setEyeContact = (eyeContact: boolean) => {
    setState(prev => ({ ...prev, eyeContact }));
  };

  const reset = () => {
    setState({
      emotion: 'neutral',
      speaking: false,
      listening: false,
      eyeContact: true,
      intensity: 0.5,
    });
  };

  return {
    state,
    updateEmotion,
    setSpeaking,
    setListening,
    setEyeContact,
    reset,
  };
}

// Emotion mapping utility
export function mapEmotionToAvatar(emotionData: any): AvatarState['emotion'] {
  const emotion = emotionData?.primaryEmotion?.toLowerCase() || 'neutral';
  
  const emotionMap: { [key: string]: AvatarState['emotion'] } = {
    happy: 'happy',
    joy: 'happy',
    excited: 'excited',
    sad: 'sad',
    depressed: 'sad',
    worried: 'concerned',
    anxious: 'concerned',
    stressed: 'concerned',
    angry: 'concerned',
    empathetic: 'empathetic',
    caring: 'empathetic',
    supportive: 'empathetic',
    neutral: 'neutral',
    calm: 'neutral',
  };

  return emotionMap[emotion] || 'neutral';
}