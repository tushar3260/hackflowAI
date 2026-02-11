import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html, Float } from '@react-three/drei';
import { useNavigate } from 'react-router-dom';

// Note: Icons passed as props need to be React components
const OrbitCard = ({ position, label, route, icon: Icon, delay = 0 }) => {
    const groupRef = useRef();
    const navigate = useNavigate();
    const [hovered, setHover] = useState(false);

    useFrame((state) => {
        // subtle bobbing is handled by Float, but we can add rotation
    });

    return (
        <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5} floatingRange={[-0.1, 0.1]}>
            <group ref={groupRef} position={position}>
                {/* 3D Glass Plane */}
                <mesh
                    onClick={() => navigate(route)}
                    onPointerOver={() => { document.body.style.cursor = 'pointer'; setHover(true); }}
                    onPointerOut={() => { document.body.style.cursor = 'auto'; setHover(false); }}
                >
                    <boxGeometry args={[2.2, 3.2, 0.05]} />
                    <meshPhysicalMaterial
                        color={hovered ? "#111" : "#000"}
                        roughness={0.1}
                        metalness={0.9}
                        transmission={0.5} // Glass
                        thickness={0.5}
                        transparent
                        opacity={0.4}
                        emissive={hovered ? "#00f3ff" : "#000"}
                        emissiveIntensity={hovered ? 0.2 : 0}
                    />
                </mesh>

                {/* Border Glow */}
                <mesh position={[0, 0, 0]} scale={[1.02, 1.02, 1]}>
                    <boxGeometry args={[2.2, 3.2, 0.04]} />
                    <meshBasicMaterial
                        color={hovered ? "#00f3ff" : "#333"}
                        transparent
                        opacity={hovered ? 0.8 : 0.2}
                        wireframe
                    />
                </mesh>

                {/* Content Overlay */}
                <Html
                    transform
                    occlude
                    distanceFactor={1.5}
                    position={[0, 0, 0.06]}
                    style={{
                        pointerEvents: 'none',
                        width: '300px',
                        height: '400px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    <div className={`
                        flex flex-col items-center justify-center text-center select-none
                        transition-all duration-300
                        ${hovered ? 'scale-110 text-neon-blue' : 'text-gray-400 scale-100'}
                    `}>
                        <div className="mb-6 p-4 rounded-full bg-black/20 backdrop-blur-sm border border-white/10">
                            {Icon && <Icon size={48} className={hovered ? "text-neon-pink drop-shadow-[0_0_10px_rgba(255,0,255,0.8)]" : ""} />}
                        </div>
                        <h3 className="text-2xl font-bold tracking-wider uppercase font-sans mb-2">{label}</h3>
                        {hovered && <div className="text-xs text-neon-blue animate-pulse">Click to Access</div>}
                    </div>
                </Html>
            </group>
        </Float>
    );
};

export default OrbitCard;
