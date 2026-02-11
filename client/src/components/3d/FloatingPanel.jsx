import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Text, RoundedBox } from '@react-three/drei';
import { useNavigate } from 'react-router-dom';
import * as THREE from 'three';

/**
 * FloatingPanel - Interactive 3D panel with hover effects
 * 
 * Props:
 * - position: [x, y, z] coordinates
 * - label: Display text
 * - route: Navigation target
 * - delay: Intro animation delay (seconds)
 * 
 * Hover effects:
 * - Scale: 1.0 → 1.15
 * - Emissive intensity: 0.2 → 1.0
 */
const FloatingPanel = ({ position, label, route, delay = 0, introComplete = true }) => {
    const meshRef = useRef();
    const navigate = useNavigate();
    const [hovered, setHovered] = useState(false);

    useFrame((state) => {
        if (meshRef.current && introComplete) {
            // Gentle bobbing
            meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime + delay) * 0.1;
        }
    });

    const handleClick = () => {
        navigate(route);
    };

    return (
        <Float
            speed={2}
            rotationIntensity={0.2}
            floatIntensity={0.3}
            enabled={introComplete}
        >
            <group
                ref={meshRef}
                position={position}
                scale={introComplete ? (hovered ? 1.15 : 1) : 0}
                onPointerOver={() => {
                    setHovered(true);
                    document.body.style.cursor = 'pointer';
                }}
                onPointerOut={() => {
                    setHovered(false);
                    document.body.style.cursor = 'auto';
                }}
                onClick={handleClick}
            >
                {/* Glass panel */}
                <RoundedBox args={[2, 2.5, 0.1]} radius={0.05} smoothness={4}>
                    <meshPhysicalMaterial
                        color={hovered ? "#111" : "#000"}
                        metalness={0.9}
                        roughness={0.1}
                        transmission={0.6}
                        thickness={0.5}
                        transparent
                        opacity={0.4}
                        emissive={hovered ? "#00f3ff" : "#000"}
                        emissiveIntensity={hovered ? 1 : 0.2}
                    />
                </RoundedBox>

                {/* Neon border */}
                <RoundedBox args={[2.05, 2.55, 0.08]} radius={0.05} smoothness={4}>
                    <meshBasicMaterial
                        color={hovered ? "#00f3ff" : "#333"}
                        transparent
                        opacity={hovered ? 0.8 : 0.3}
                        wireframe
                    />
                </RoundedBox>

                {/* Text label */}
                <Text
                    position={[0, 0, 0.06]}
                    fontSize={0.25}
                    color={hovered ? "#00f3ff" : "#fff"}
                    anchorX="center"
                    anchorY="middle"
                    maxWidth={1.8}
                    textAlign="center"
                    font="/fonts/orbitron.woff"
                >
                    {label}
                </Text>

                {/* Glow effect when hovered */}
                {hovered && (
                    <pointLight
                        position={[0, 0, 0.5]}
                        color="#00f3ff"
                        intensity={2}
                        distance={3}
                    />
                )}
            </group>
        </Float>
    );
};

export default FloatingPanel;
