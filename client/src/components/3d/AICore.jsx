import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

/**
 * AICore - Central rotating sphere representing the AI judging core
 * 
 * Animation params:
 * - distort: Wave intensity (0.4 = subtle morphing)
 * - speed: Distortion animation speed (2 = moderate)
 * - rotation speed: 0.005 radians/frame
 */
const AICore = ({ introComplete = true }) => {
    const meshRef = useRef();
    const lightRef = useRef();
    const coreRef = useRef();

    useFrame((state) => {
        const t = state.clock.elapsedTime;
        if (meshRef.current) {
            meshRef.current.rotation.y += 0.005;
            meshRef.current.rotation.x = Math.sin(t * 0.3) * 0.1;

            // Pulsing light
            if (lightRef.current) {
                lightRef.current.intensity = 2 + Math.sin(t * 2) * 1;
            }
        }
        if (coreRef.current) {
            coreRef.current.rotation.z -= 0.01;
            coreRef.current.rotation.y -= 0.01;
        }
    });

    return (
        <group scale={introComplete ? 1 : 0}>
            {/* Inner Core Light */}
            <pointLight ref={lightRef} position={[0, 0, 0]} color="#00f3ff" intensity={3} distance={10} />

            {/* Central Glowing Sphere */}
            <Sphere ref={meshRef} args={[1.2, 64, 64]} position={[0, 0, 0]}>
                <MeshDistortMaterial
                    color="#00f3ff"
                    attach="material"
                    distort={0.6}
                    speed={2}
                    roughness={0}
                    metalness={0.9}
                    emissive="#00f3ff"
                    emissiveIntensity={0.8}
                    clearcoat={1}
                    clearcoatRoughness={0.1}
                />
            </Sphere>

            {/* Inner Wireframe Geodesic */}
            <mesh ref={coreRef} scale={[1.1, 1.1, 1.1]}>
                <icosahedronGeometry args={[1.5, 2]} />
                <meshBasicMaterial color="#ffffff" wireframe transparent opacity={0.1} />
            </mesh>

            {/* Outer Orbital Rings */}
            <group rotation={[Math.PI / 3, 0, 0]}>
                <mesh rotation={[0, 0, 0]}>
                    <torusGeometry args={[2.2, 0.02, 16, 100]} />
                    <meshBasicMaterial color="#ff00dd" transparent opacity={0.6} />
                </mesh>
                <mesh rotation={[Math.PI / 2, 0, 0]}>
                    <torusGeometry args={[2.5, 0.01, 16, 100]} />
                    <meshBasicMaterial color="#00f3ff" transparent opacity={0.4} />
                </mesh>
            </group>
        </group>
    );
};

export default AICore;
