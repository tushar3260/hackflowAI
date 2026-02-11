import React, { Suspense, useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { PerspectiveCamera, Stars, Environment, Sparkles } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import AICore from './AICore';
import FloatingPanel from './FloatingPanel';
import ParticleField from './ParticleField';

/**
 * Scene - Main 3D composition with intro animation
 * 
 * Intro sequence timeline (4 seconds):
 * 0-1s: AI Core appears
 * 1-2s: Network lines build  
 * 2-3s: Panels float in
 * 3-4s: Complete
 * 
 * Camera: Slow auto-drift for cinematic feel
 */
const Scene = ({ onIntroComplete }) => {
    const [introStage, setIntroStage] = useState(0);
    const cameraRef = useRef();

    useEffect(() => {
        const timers = [
            setTimeout(() => setIntroStage(1), 1000),  // AI Core
            setTimeout(() => setIntroStage(2), 2000),  // Network
            setTimeout(() => setIntroStage(3), 3000),  // Panels
            setTimeout(() => {
                setIntroStage(4);
                onIntroComplete && onIntroComplete();
            }, 4000)
        ];

        return () => timers.forEach(clearTimeout);
    }, [onIntroComplete]);

    return (
        <div className="fixed inset-0 z-0">
            <Canvas>
                <PerspectiveCamera makeDefault position={[0, 0, 10]} fov={50} ref={cameraRef} />

                {/* Lighting */}
                <ambientLight intensity={0.3} />
                <pointLight position={[10, 10, 10]} intensity={1} color="#00f3ff" />
                <pointLight position={[-10, -10, -10]} intensity={0.5} color="#ff00dd" />

                <Suspense fallback={null}>
                    {/* Background */}
                    <color attach="background" args={['#000000']} />
                    <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

                    {/* Sparkles for extra atmosphere */}
                    <Sparkles
                        count={100}
                        scale={20}
                        size={2}
                        speed={0.3}
                        opacity={0.4}
                        color="#00f3ff"
                    />

                    {introStage >= 1 && <ParticleField />}

                    {/* AI Core (stage 1) */}
                    {introStage >= 1 && <AICore introComplete={introStage >= 4} />}

                    {/* Floating Panels (stage 3) */}
                    {introStage >= 3 && (
                        <>
                            <FloatingPanel
                                position={[-4, 1, 0]}
                                label="Create Hackathon"
                                route="/dashboard/create-hackathon"
                                delay={0}
                                introComplete={introStage >= 4}
                            />
                            <FloatingPanel
                                position={[0, 1, 1]}
                                label="Submit Project"
                                route="/dashboard/submission"
                                delay={0.5}
                                introComplete={introStage >= 4}
                            />
                            <FloatingPanel
                                position={[4, 1, 0]}
                                label="Transparent Judging"
                                route="/leaderboard/demo"
                                delay={1}
                                introComplete={introStage >= 4}
                            />
                        </>
                    )}

                    {/* Network connection lines (stage 2) */}
                    {introStage >= 2 && (
                        <group>
                            <NetworkLine start={[0, 0, 0]} end={[-4, 1, 0]} color="#00f3ff" />
                            <NetworkLine start={[0, 0, 0]} end={[0, 1, 1]} color="#00f3ff" />
                            <NetworkLine start={[0, 0, 0]} end={[4, 1, 0]} color="#00f3ff" />
                        </group>
                    )}
                </Suspense>

                {/* Post-processing */}
                <EffectComposer>
                    <Bloom luminanceThreshold={0.3} luminanceSmoothing={0.9} height={300} intensity={1.2} />
                </EffectComposer>

                {/* Slow camera drift */}
                <CameraRig enabled={introStage >= 4} />
            </Canvas>
        </div>
    );
};

// Camera auto-movement component
function CameraRig({ enabled }) {
    useFrame((state) => {
        if (enabled) {
            state.camera.position.x = Math.sin(state.clock.elapsedTime * 0.1) * 0.5;
            state.camera.position.y = Math.cos(state.clock.elapsedTime * 0.15) * 0.3;
            state.camera.lookAt(0, 0, 0);
        }
    });
    return null;
}

export default Scene;

// Animated Line Component
function NetworkLine({ start, end, color }) {
    const ref = useRef();

    useFrame((state) => {
        if (ref.current) {
            // Animate dash offset to simulate data flow
            ref.current.material.dashOffset -= 0.01;
        }
    });

    const points = React.useMemo(() => [new THREE.Vector3(...start), new THREE.Vector3(...end)], [start, end]);
    const lineGeometry = React.useMemo(() => new THREE.BufferGeometry().setFromPoints(points), [points]);

    return (
        <line ref={ref} geometry={lineGeometry}>
            <lineDashedMaterial
                color={color}
                opacity={0.4}
                transparent
                dashSize={0.2}
                gapSize={0.1}
                scale={1}
            />
        </line>
    );
}
