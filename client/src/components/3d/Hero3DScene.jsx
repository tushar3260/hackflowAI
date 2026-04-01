import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, Float } from '@react-three/drei';
import * as THREE from 'three';

// Generate random points distributed on a sphere
const generateSpherePoints = (count, radius) => {
    const points = [];
    for (let i = 0; i < count; i++) {
        // Spherical coordinate distribution
        const u = Math.random();
        const v = Math.random();
        const theta = 2 * Math.PI * u;
        const phi = Math.acos(2 * v - 1);
        const x = radius * Math.sin(phi) * Math.cos(theta);
        const y = radius * Math.sin(phi) * Math.sin(theta);
        const z = radius * Math.cos(phi);
        points.push(new THREE.Vector3(x, y, z));
    }
    return points;
};

const AINetwork = () => {
    const groupRef = useRef();
    const linesGroupRef = useRef();
    
    // Performance: Small number of nodes
    const NODE_COUNT = 45;
    const RADIUS = 2;
    const MAX_CONNECTION_DISTANCE = 1.6;

    const points = useMemo(() => generateSpherePoints(NODE_COUNT, RADIUS), []);
    
    // Generate static lines connecting close points
    const lineGeometry = useMemo(() => {
        const geometry = new THREE.BufferGeometry();
        const positions = [];
        
        for (let i = 0; i < points.length; i++) {
            for (let j = i + 1; j < points.length; j++) {
                const dist = points[i].distanceTo(points[j]);
                if (dist < MAX_CONNECTION_DISTANCE) {
                    positions.push(
                        points[i].x, points[i].y, points[i].z,
                        points[j].x, points[j].y, points[j].z
                    );
                }
            }
        }
        
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        return geometry;
    }, [points]);
    
    // Animation loop
    useFrame((state) => {
        const time = state.clock.getElapsedTime();

        // Slow overall rotation
        if (groupRef.current) {
            groupRef.current.rotation.y = time * 0.05;
            groupRef.current.rotation.x = time * 0.02;
        }
        
        // Soft pulsing effect on the lines
        if (linesGroupRef.current) {
             linesGroupRef.current.material.opacity = 0.2 + Math.sin(time * 1.5) * 0.15;
        }
    });

    return (
        <group ref={groupRef}>
            {/* Center Core: Indigo Wireframe */}
            <Sphere args={[0.5, 24, 24]}>
                <meshStandardMaterial 
                    color="#4f46e5" 
                    emissive="#4f46e5" 
                    emissiveIntensity={0.5} 
                    wireframe 
                    transparent
                    opacity={0.3}
                />
            </Sphere>

            {/* Center Core: Solid Cyan Inner Glow */}
            <Sphere args={[0.35, 32, 32]}>
                <meshStandardMaterial 
                    color="#06b6d4" 
                    emissive="#06b6d4" 
                    emissiveIntensity={1.5} 
                />
            </Sphere>

            {/* Orbiting Nodes */}
            <points>
                <bufferGeometry>
                    <bufferAttribute 
                        attach="attributes-position"
                        count={points.length}
                        array={new Float32Array(points.flatMap(p => [p.x, p.y, p.z]))}
                        itemSize={3}
                    />
                </bufferGeometry>
                <pointsMaterial 
                    size={0.06} 
                    color="#06b6d4" 
                    transparent 
                    opacity={0.9} 
                    sizeAttenuation 
                    blending={THREE.AdditiveBlending}
                />
            </points>

            {/* Network Connections */}
            <lineSegments ref={linesGroupRef} geometry={lineGeometry}>
                <lineBasicMaterial 
                    color="#7c3aed" 
                    transparent 
                    opacity={0.3} 
                    blending={THREE.AdditiveBlending}
                />
            </lineSegments>
        </group>
    );
};

export default function Hero3DScene() {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
             setIsMobile(window.innerWidth < 768);
        };
        
        // Initial check
        checkMobile();
        
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Fallback/Performance Optimization: Do not render full 3D scene on mobile
    if (isMobile) {
        return null;
    }

    return (
        <div className="absolute inset-0 z-0 pointer-events-none" style={{ mixBlendMode: 'screen' }}>
             <Canvas 
                camera={{ position: [0, 0, 5], fov: 45 }} 
                dpr={[1, 1.5]} // Limit DPR for performance
                gl={{ antialias: false, alpha: true }}
             >
                 <ambientLight intensity={0.2} />
                 <pointLight position={[10, 10, 10]} intensity={1.5} color="#06b6d4" />
                 <pointLight position={[-10, -10, -10]} intensity={1} color="#7c3aed" />
                 
                 <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
                     <AINetwork />
                 </Float>
             </Canvas>
        </div>
    );
}
