import React, { useRef, useLayoutEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial } from '@react-three/drei';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * ScrollAICore - A 3D sphere that rotates and distorts based on scroll position.
 * 
 * @param {Object} props - Position, scale, etc.
 */
const ScrollAICore = (props) => {
    const meshRef = useRef();
    const materialRef = useRef();

    useLayoutEffect(() => {
        if (!meshRef.current) return;

        const el = document.documentElement; // Trigger on whole page scroll

        // Scroll Rotation
        gsap.to(meshRef.current.rotation, {
            y: Math.PI * 4, // 2 full spins
            ease: "none",
            scrollTrigger: {
                trigger: el,
                start: "top top",
                end: "bottom bottom",
                scrub: 1
            }
        });

        // Scroll Distortion Intensity
        if (materialRef.current) {
            gsap.to(materialRef.current, {
                distort: 0.8,
                ease: "power2.inOut",
                scrollTrigger: {
                    trigger: el,
                    start: "top top",
                    end: "center center",
                    scrub: 1
                }
            });
        }
    }, []);

    // Constant background motion
    useFrame((state) => {
        if (meshRef.current) {
            // Slight bobbing independent of scroll
            meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
        }
    });

    return (
        <group {...props}>
            <Sphere ref={meshRef} args={[1.5, 64, 64]}>
                <MeshDistortMaterial
                    ref={materialRef}
                    color="#00f3ff"
                    attach="material"
                    distort={0.3} // Base distortion
                    speed={2}
                    roughness={0}
                    metalness={0.9}
                    emissive="#00f3ff"
                    emissiveIntensity={0.6}
                />
            </Sphere>

            {/* Glow Halo */}
            <pointLight position={[0, 0, 0]} intensity={2} color="#00f3ff" distance={5} />
        </group>
    );
};

export default ScrollAICore;
