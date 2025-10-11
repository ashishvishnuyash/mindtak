import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
// Fix the import for FBXLoader
import { FBXLoader } from 'three/examples/jsm/Addons.js';
import { useLipSync } from './LipSyncController';

// Animation mapping to emotional states
const ANIMATIONS = {
  IDLE: '/animation/Talking On Phone.fbx',
  HAPPY: '/animation/Excited.fbx',
  ANGRY: '/animation/Angry.fbx',
  LAUGHING: '/animation/Laughing.fbx',
  DANCING: '/animation/Dancing.fbx',
  VICTORY: '/animation/Victory.fbx',
  CLAPPING: '/animation/Standing Clap.fbx',
  SHAKE_FIST: '/animation/Shake Fist.fbx',
  SITTING_ANGRY: '/animation/Sitting Angry.fbx',
};

type AnimationState = keyof typeof ANIMATIONS;

interface AvatarProps {
  emotion?: AnimationState;
  speaking?: boolean;
  scale?: number;
  lipSyncSource?: 'microphone' | 'playback' | 'text';
  audioElement?: HTMLAudioElement;
  speechText?: string;
}

function Avatar({ 
  emotion = 'IDLE', 
  speaking = false, 
  scale = 1,
  lipSyncSource = 'microphone',
  audioElement,
  speechText
}: AvatarProps) {
  const group = useRef<THREE.Group>(null);
  const { scene, camera } = useThree();
  
  // Load the avatar model
  const { scene: modelScene } = useGLTF('/model/68dce07322326403ec9e4358.glb');
  
  // Load the animation
  const [mixer] = useState(() => new THREE.AnimationMixer(modelScene));
  const [animationClip, setAnimationClip] = useState<THREE.AnimationClip | null>(null);

  // Initialize lip sync
  const lipSyncState = useLipSync({
    avatarRef: group,
    audioSource: lipSyncSource,
    audioElement,
    text: speechText,
    speaking,
    onLipSyncUpdate: (state) => {
      // Optional: Handle lip sync state updates
      console.log('Lip sync update:', state.currentViseme, state.intensity);
    }
  });
  
  // Load animation based on emotion
  useEffect(() => {
    const loader = new FBXLoader();
    loader.load(ANIMATIONS[emotion], (fbx) => {
      if (fbx.animations && fbx.animations.length > 0) {
        const clip = fbx.animations[0];
        setAnimationClip(clip);
        
        // Play the animation
        const action = mixer.clipAction(clip);
        action.reset().play();
      }
    });
    
    return () => {
      mixer.stopAllAction();
    };
  }, [emotion, mixer]);
  
  // Update the animation mixer on each frame
  useFrame((_, delta) => {
    mixer.update(delta);
  });
  
  // Position the camera to focus on the avatar
  useEffect(() => {
    if (group.current) {
      camera.position.set(0, 1.5, 3);
      camera.lookAt(0, 1, 0);
    }
  }, [camera]);
  
  return (
    <group ref={group} scale={[scale, scale, scale]} position={[0, -1, 0]}>
      <primitive object={modelScene} />
    </group>
  );
}

interface AvatarModelProps {
  emotion?: AnimationState;
  speaking?: boolean;
  scale?: number;
  lipSyncSource?: 'microphone' | 'playback' | 'text';
  audioElement?: HTMLAudioElement;
  speechText?: string;
}

export default function AvatarModel({ 
  emotion = 'IDLE', 
  speaking = false, 
  scale = 1,
  lipSyncSource = 'microphone',
  audioElement,
  speechText
}: AvatarModelProps) {
  return (
    <div className="h-full w-full">
      <Canvas shadows>
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={1} castShadow />
        <Avatar 
          emotion={emotion} 
          speaking={speaking} 
          scale={scale}
          lipSyncSource={lipSyncSource}
          audioElement={audioElement}
          speechText={speechText}
        />
        <OrbitControls enableZoom={false} enablePan={false} minPolarAngle={Math.PI / 4} maxPolarAngle={Math.PI / 2} />
      </Canvas>
    </div>
  );
}