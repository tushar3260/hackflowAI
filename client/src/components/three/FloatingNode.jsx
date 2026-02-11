import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Text } from '@react-three/drei';

const FloatingNode = ({ position, color = "#00f3ff", label }) => {
    const meshRef = useRef();
    const [hovered, setHover] = useState(false);

    useFrame((state) => {
        const t = state.clock.getElapsedTime();
        // meshRef.current.rotation.x = Math.cos(t / 4) / 2;
        // meshRef.current.rotation.y = Math.sin(t / 4) / 2;
        // meshRef.current.position.y = position[1] + Math.sin(t / 1.5) / 10;

        // Actually Float wrapper handles movement nicely, just rotate locally
        if (meshRef.current) {
            meshRef.current.rotation.y += 0.01;
        }
    });

    return (
        <Float speed={2} rotationIntensity={1} floatIntensity={1}>
            <group position={position}>
                <mesh
                    ref={meshRef}
                    onPointerOver={() => setHover(true)}
                    onPointerOut={() => setHover(false)}
                    scale={hovered ? 1.2 : 1}
                >
                    <icosahedronGeometry args={[0.3, 0]} />
                    <meshStandardMaterial
                        color={hovered ? "#ff00dd" : color}
                        emissive={hovered ? "#ff00dd" : color}
                        emissiveIntensity={hovered ? 2 : 0.5}
                        wireframe
                    />
                </mesh>
                {/* Connecting Line Effect (Optional - maybe simplified for now) */}

                {/* Label */}
                {hovered && (
                    <Text
                        position={[0, 0.6, 0]}
                        fontSize={0.2}
                        color="white"
                        anchorX="center"
                        anchorY="middle"
                    >
                        {label}
                    </Text>
                )}
            </group>
        </Float>
    );
};

export default FloatingNode;
