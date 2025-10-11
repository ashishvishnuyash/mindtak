import React, { useRef, useEffect, useState, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import {
  OrbitControls,
  useGLTF,
  Environment,
  ContactShadows,
  Float,
  Text,
  Sparkles as DreiSparkles
} from '@react-three/drei';
import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';


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
  interactive?: boolean;
  showEnvironment?: boolean;
  enableFloating?: boolean;
  modelType?: 'gltf' | 'fbx';
  modelUrl?: string;
  lipSyncActive?: boolean;
  currentViseme?: string;
}

// Enhanced Interactive Avatar Component
const InteractiveAvatar = React.forwardRef<THREE.Group, AvatarProps>(({
  emotion = 'IDLE',
  speaking = false,
  scale = 1,
  interactive = true,
  enableFloating = true,
  modelType = 'gltf',
  modelUrl,
  lipSyncActive = false,
  currentViseme = 'sil'
}, ref) => {
  const group = useRef<THREE.Group>(null);
  const avatarRef = useRef<THREE.Group>(null);

  // Combine refs
  React.useImperativeHandle(ref, () => avatarRef.current!, []);
  const { gl } = useThree();

  // Model loading state
  const [modelScene, setModelScene] = useState<THREE.Group | null>(null);

  // Load the avatar model
  useEffect(() => {
    const loadModel = async () => {
      try {
        if (modelType === 'fbx') {
          const loader = new FBXLoader();
          const fbxScene = await new Promise<THREE.Group>((resolve, reject) => {
            loader.load(
              modelUrl || '/model/default.fbx',
              resolve,
              undefined,
              reject
            );
          });
          setModelScene(fbxScene);
        } else {
          // Default to GLTF - useGLTF hook handles loading
          const gltfData = useGLTF(modelUrl || '/model/68dce07322326403ec9e4358.glb');
          setModelScene(gltfData.scene);
        }
      } catch (error) {
        console.error('Failed to load model:', error);
        // Fallback to default GLTF
        const gltfData = useGLTF('/model/68dce07322326403ec9e4358.glb');
        setModelScene(gltfData.scene);
      }
    };

    loadModel();
  }, [modelType, modelUrl]);

  // Animation system - initialize after model is loaded
  const [mixer, setMixer] = useState<THREE.AnimationMixer | null>(null);

  useEffect(() => {
    if (modelScene && !mixer) {
      setMixer(new THREE.AnimationMixer(modelScene));
    }
  }, [modelScene, mixer]);
  const [currentAction, setCurrentAction] = useState<THREE.AnimationAction | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Interactive states
  const [isHovered, setIsHovered] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [breathingPhase, setBreathingPhase] = useState(0);

  // Simple speaking animation state
  const [speakingIntensity, setSpeakingIntensity] = useState(0);

  // Enhanced animation loading with smooth transitions
  useEffect(() => {
    if (!mixer) return;

    const loader = new FBXLoader();

    const loadAnimation = async () => {
      try {
        const fbx = await new Promise<THREE.Group>((resolve, reject) => {
          loader.load(
            ANIMATIONS[emotion],
            resolve,
            undefined,
            reject
          );
        });

        if (fbx.animations && fbx.animations.length > 0) {
          const clip = fbx.animations[0];
          const newAction = mixer.clipAction(clip);

          // Smooth transition between animations
          if (currentAction && !isTransitioning) {
            setIsTransitioning(true);

            // Fade out current animation
            currentAction.fadeOut(0.5);

            // Fade in new animation
            newAction.reset().fadeIn(0.5).play();

            setTimeout(() => {
              setIsTransitioning(false);
            }, 500);
          } else {
            newAction.reset().play();
          }

          setCurrentAction(newAction);
        }
      } catch (error) {
        console.error('Failed to load animation:', error);
      }
    };

    loadAnimation();

    return () => {
      if (currentAction) {
        currentAction.stop();
      }
    };
  }, [emotion, mixer, currentAction, isTransitioning]);

  // Enhanced frame updates with multiple animation layers
  useFrame((state, delta) => {
    // Update animation mixer
    if (mixer) {
      mixer.update(delta);
    }

    // Breathing animation
    setBreathingPhase(prev => prev + delta);
    if (avatarRef.current && !speaking) {
      const breathScale = 1 + Math.sin(breathingPhase * 2) * 0.02;
      avatarRef.current.scale.y = breathScale;
    }

    // Blinking animation - trigger every 3-5 seconds
    if (Math.random() < 0.001) { // Small chance each frame
      triggerBlink();
    }

    // Interactive head tracking
    if (interactive && isHovered && avatarRef.current) {
      const targetRotationY = (mousePosition.x - 0.5) * 0.3;
      const targetRotationX = (mousePosition.y - 0.5) * 0.2;

      avatarRef.current.rotation.y = THREE.MathUtils.lerp(
        avatarRef.current.rotation.y,
        targetRotationY,
        delta * 2
      );
      avatarRef.current.rotation.x = THREE.MathUtils.lerp(
        avatarRef.current.rotation.x,
        targetRotationX,
        delta * 2
      );
    }

    // Speaking animation enhancements
    if (speaking && avatarRef.current) {
      // Add subtle body movement during speech
      const bodyMovement = Math.sin(state.clock.elapsedTime * 4) * speakingIntensity * 0.01;
      avatarRef.current.position.y = bodyMovement;

      // Add hand gestures during speech
      const gestureIntensity = Math.sin(state.clock.elapsedTime * 2) * speakingIntensity;
      if (avatarRef.current.children.length > 0) {
        avatarRef.current.traverse((child) => {
          if (child.name.includes('hand') || child.name.includes('arm')) {
            child.rotation.z = gestureIntensity * 0.1;
          }
        });
      }
    }

    // Update speaking intensity
    if (speaking) {
      setSpeakingIntensity(prev => THREE.MathUtils.lerp(prev, 0.8, delta * 3));
    } else {
      setSpeakingIntensity(prev => THREE.MathUtils.lerp(prev, 0, delta * 2));
    }

    // Smooth lip sync blendshape transitions
    if (lipSyncActive && modelScene) {
      let hasChanges = false;
      const newCurrentWeights = { ...currentVisemeWeights };

      Object.keys(targetVisemeWeights).forEach(shapeName => {
        const target = targetVisemeWeights[shapeName] || 0;
        const current = currentVisemeWeights[shapeName] || 0;
        
        if (Math.abs(target - current) > 0.001) {
          const newWeight = THREE.MathUtils.lerp(current, target, delta * 8); // 8 = transition speed
          newCurrentWeights[shapeName] = newWeight;
          hasChanges = true;

          // Apply to avatar mesh
          modelScene.traverse((child) => {
            if (child instanceof THREE.SkinnedMesh && child.morphTargetDictionary && child.morphTargetInfluences) {
              const index = child.morphTargetDictionary[shapeName];
              if (index !== undefined) {
                child.morphTargetInfluences[index] = newWeight;
              }
            }
          });
        }
      });

      if (hasChanges) {
        setCurrentVisemeWeights(newCurrentWeights);
      }
    }
  });

  // Blink function
  const triggerBlink = () => {
    if (avatarRef.current) {
      avatarRef.current.traverse((child) => {
        if (child instanceof THREE.SkinnedMesh && child.morphTargetDictionary) {
          const blinkIndex = child.morphTargetDictionary['eyeBlinkLeft'] ||
            child.morphTargetDictionary['eyesClosed'] ||
            child.morphTargetDictionary['blink'];

          if (blinkIndex !== undefined && child.morphTargetInfluences) {
            // Quick blink animation
            const originalValue = child.morphTargetInfluences[blinkIndex];
            child.morphTargetInfluences[blinkIndex] = 1;

            setTimeout(() => {
              if (child.morphTargetInfluences) {
                child.morphTargetInfluences[blinkIndex] = originalValue;
              }
            }, 150);
          }
        }
      });
    }
  };

  // Mouse interaction handlers
  const handlePointerMove = (event: any) => {
    if (interactive && event.nativeEvent) {
      const rect = gl.domElement.getBoundingClientRect();
      setMousePosition({
        x: (event.nativeEvent.clientX - rect.left) / rect.width,
        y: (event.nativeEvent.clientY - rect.top) / rect.height
      });
    }
  };

  // Enhanced lighting and materials
  useEffect(() => {
    if (modelScene) {
      modelScene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          // Enhance materials for better visual quality
          if (child.material instanceof THREE.MeshStandardMaterial) {
            child.material.roughness = 0.7;
            child.material.metalness = 0.1;
            child.material.envMapIntensity = 0.8;
          }

          // Enable shadows
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
    }
  }, [modelScene]);

  // Lip sync animation state
  const [targetVisemeWeights, setTargetVisemeWeights] = useState<Record<string, number>>({});
  const [currentVisemeWeights, setCurrentVisemeWeights] = useState<Record<string, number>>({});

  // Update target weights when viseme changes
  useEffect(() => {
    if (lipSyncActive && currentViseme !== 'sil') {
      const newWeights: Record<string, number> = {};
      
      // Reset all viseme weights
      ['sil', 'PP', 'FF', 'TH', 'DD', 'kk', 'CH', 'SS', 'nn', 'RR', 'aa', 'E', 'I', 'O', 'U'].forEach(viseme => {
        newWeights[`viseme_${viseme}`] = 0;
      });
      
      // Set current viseme weight
      newWeights[`viseme_${currentViseme}`] = 0.8;
      
      setTargetVisemeWeights(newWeights);
    } else {
      // Reset all weights when not active
      const resetWeights: Record<string, number> = {};
      ['sil', 'PP', 'FF', 'TH', 'DD', 'kk', 'CH', 'SS', 'nn', 'RR', 'aa', 'E', 'I', 'O', 'U'].forEach(viseme => {
        resetWeights[`viseme_${viseme}`] = 0;
      });
      setTargetVisemeWeights(resetWeights);
    }
  }, [lipSyncActive, currentViseme]);

  if (!modelScene) {
    return (
      <group ref={group} scale={[scale, scale, scale]} position={[0, -0.5, 0]}>
        {/* Loading placeholder */}
        <Text
          position={[0, 0, 0]}
          fontSize={0.5}
          color="#4F46E5"
          anchorX="center"
          anchorY="middle"
        >
          Loading...
        </Text>
      </group>
    );
  }

  return (
    <group ref={group} scale={[scale, scale, scale]} position={[0, -0.5, 0]}>
      {enableFloating ? (
        <Float
          speed={speaking ? 2 : 1}
          rotationIntensity={speaking ? 0.5 : 0.2}
          floatIntensity={speaking ? 0.3 : 0.1}
        >
          <group
            ref={avatarRef}
            onPointerMove={handlePointerMove}
            onPointerEnter={() => setIsHovered(true)}
            onPointerLeave={() => setIsHovered(false)}
          >
            <primitive object={modelScene} />
          </group>
        </Float>
      ) : (
        <group
          ref={avatarRef}
          onPointerMove={handlePointerMove}
          onPointerEnter={() => setIsHovered(true)}
          onPointerLeave={() => setIsHovered(false)}
        >
          <primitive object={modelScene} />
        </group>
      )}

      {/* Interactive elements */}
      {speaking && (
        <DreiSparkles
          count={20}
          scale={[2, 2, 2]}
          size={2}
          speed={0.5}
          opacity={0.6}
          color="#4F46E5"
        />
      )}

      {/* Emotion indicator */}
      {emotion !== 'IDLE' && (
        <Text
          position={[0, 2.2, 0]}
          fontSize={0.25}
          color="#4F46E5"
          anchorX="center"
          anchorY="middle"
        >
          {emotion.toLowerCase()}
        </Text>
      )}
    </group>
  );
});

InteractiveAvatar.displayName = 'InteractiveAvatar';

interface AvatarModelProps {
  emotion?: AnimationState;
  speaking?: boolean;
  scale?: number;
  interactive?: boolean;
  showEnvironment?: boolean;
  enableFloating?: boolean;
  quality?: 'low' | 'medium' | 'high';
  modelType?: 'gltf' | 'fbx';
  modelUrl?: string;
  lipSyncActive?: boolean;
  currentViseme?: string;
}

interface AvatarSceneProps extends AvatarModelProps { }

// Enhanced Scene Component
const AvatarScene = React.forwardRef<THREE.Group, AvatarSceneProps>(({
  emotion = 'IDLE',
  speaking = false,
  scale = 1,
  interactive = true,
  showEnvironment = true,
  enableFloating = true,
  quality = 'high',
  modelType = 'gltf',
  modelUrl,
  lipSyncActive = false,
  currentViseme = 'sil'
}, ref) => {
  const { camera } = useThree();

  // Dynamic camera positioning based on emotion - adjusted for better visibility
  useEffect(() => {
    const positions = {
      'IDLE': [0, 1.2, 4],
      'HAPPY': [0.5, 1.4, 3.5],
      'ANGRY': [-0.3, 1.0, 3.2],
      'LAUGHING': [0, 1.5, 3.8],
      'VICTORY': [0, 1.7, 4.2],
      'CLAPPING': [0, 1.3, 3.5],
      'DANCING': [0.8, 1.2, 3.8],
      'SHAKE_FIST': [-0.5, 1.1, 3.4],
      'SITTING_ANGRY': [0, 0.9, 3.5]
    };

    const targetPosition = positions[emotion] || positions['IDLE'];

    // Smooth camera transition
    const startPosition = camera.position.clone();
    const endPosition = new THREE.Vector3(...targetPosition);

    let progress = 0;
    const animateCamera = () => {
      progress += 0.02;
      if (progress <= 1) {
        camera.position.lerpVectors(startPosition, endPosition, progress);
        camera.lookAt(0, 0.8, 0);
        requestAnimationFrame(animateCamera);
      }
    };

    animateCamera();
  }, [emotion, camera]);

  return (
    <>
      {/* Enhanced Lighting Setup */}
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={1.2}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
      <pointLight position={[-10, 0, -20]} intensity={0.5} color="#4F46E5" />
      <pointLight position={[10, 0, -20]} intensity={0.3} color="#EC4899" />

      {/* Environment and Background */}
      {showEnvironment && (
        <>
          <Environment preset="studio" />
          <fog attach="fog" args={['#f0f0f0', 8, 20]} />
        </>
      )}

      {/* Interactive Avatar */}
      <InteractiveAvatar
        ref={ref}
        emotion={emotion}
        speaking={speaking}
        scale={scale}
        interactive={interactive}
        enableFloating={enableFloating}
        modelType={modelType}
        modelUrl={modelUrl}
        lipSyncActive={lipSyncActive}
        currentViseme={currentViseme}
      />

      {/* Ground and Shadows */}
      <ContactShadows
        position={[0, -0.9, 0]}
        opacity={0.4}
        scale={10}
        blur={1.5}
        far={4.5}
      />

      {/* Interactive Controls */}
      <OrbitControls
        enableZoom={interactive}
        enablePan={false}
        minPolarAngle={Math.PI / 8}
        maxPolarAngle={Math.PI / 1.8}
        minAzimuthAngle={-Math.PI / 3}
        maxAzimuthAngle={Math.PI / 3}
        enableDamping
        dampingFactor={0.05}
        target={[0, 0.8, 0]}
      />
    </>
  );
});

AvatarScene.displayName = 'AvatarScene';

// Main Avatar Model Component
const AvatarModel = React.forwardRef<THREE.Group, AvatarModelProps>(({
  emotion = 'IDLE',
  speaking = false,
  scale = 1,
  interactive = true,
  showEnvironment = true,
  enableFloating = true,
  quality = 'high',
  modelType = 'gltf',
  modelUrl,
  lipSyncActive = false,
  currentViseme = 'sil'
}, ref) => {
  // Performance optimization based on quality setting
  const canvasProps = useMemo(() => {
    const baseProps = {
      shadows: true,
      gl: { antialias: true, alpha: true },
      camera: { position: [0, 1.2, 4] as [number, number, number], fov: 60 }
    };

    switch (quality) {
      case 'low':
        return {
          ...baseProps,
          gl: { antialias: false, alpha: true, powerPreference: 'low-power' as const },
          dpr: 1
        };
      case 'medium':
        return {
          ...baseProps,
          dpr: typeof window !== 'undefined' ? Math.min(window.devicePixelRatio, 1.5) : 1.5
        };
      case 'high':
      default:
        return {
          ...baseProps,
          dpr: typeof window !== 'undefined' ? Math.min(window.devicePixelRatio, 2) : 2
        };
    }
  }, [quality]);

  return (
    <div className="h-full w-full relative">
      <Canvas {...canvasProps}>
        <AvatarScene
          ref={ref}
          emotion={emotion}
          speaking={speaking}
          scale={scale}
          interactive={interactive}
          showEnvironment={showEnvironment}
          enableFloating={enableFloating}
          quality={quality}
          modelType={modelType}
          modelUrl={modelUrl}
          lipSyncActive={lipSyncActive}
          currentViseme={currentViseme}
        />
      </Canvas>

      {/* Performance indicator */}
      {quality === 'low' && (
        <div className="absolute top-2 left-2 bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">
          Performance Mode
        </div>
      )}

      {/* Interactive hints */}
      {interactive && (
        <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
          🖱️ Drag to rotate • 🎭 Interactive avatar
        </div>
      )}

      {/* Lip sync indicator */}
      {lipSyncActive && (
        <div className="absolute top-2 right-2 bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
          🎤 Lip Sync: {currentViseme}
        </div>
      )}

      {/* Avatar visibility indicator */}
      <div className="absolute top-2 left-2 bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
        Avatar: {scale.toFixed(1)}x scale
      </div>
    </div>
  );
});

AvatarModel.displayName = 'AvatarModel';

export default AvatarModel;