import React, { useRef, useLayoutEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Instance, Instances } from '@react-three/drei';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import * as THREE from 'three';

gsap.registerPlugin(ScrollTrigger);

/**
 * ScrollNetwork - A field of floating nodes that move with parallax effect on scroll.
 * Optimized using InstancedMesh via @react-three/drei 'Instances'.
 */
const ScrollNetwork = ({ count = 50, range = 20 }) => {
    const groupRef = useRef();

    // Generate random positions
    const particles = useMemo(() => {
        const temp = [];
        for (let i = 0; i < count; i++) {
            const x = (Math.random() - 0.5) * range;
            const y = (Math.random() - 0.5) * range * 2; // Taller vertical range
            const z = (Math.random() - 0.5) * 10;
            const factor = 0.5 + Math.random(); // Parallax speed factor
            temp.push({ position: [x, y, z], factor });
        }
        return temp;
    }, [count, range]);

    useLayoutEffect(() => {
        if (!groupRef.current) return;

        // Move the entire group up as user scrolls down to simulate moving through the field
        gsap.to(groupRef.current.position, {
            y: 10,
            ease: "none",
            scrollTrigger: {
                trigger: document.documentElement,
                start: "top top",
                end: "bottom bottom",
                scrub: 0.5
            }
        });
    }, []);

    useFrame((state) => {
        // Add subtle rotation to the whole group
        if (groupRef.current) {
            groupRef.current.rotation.y = state.clock.elapsedTime * 0.05;
        }
    });

    return (
        <group ref={groupRef}>
            <Instances range={count}>
                <sphereGeometry args={[0.05, 16, 16]} />
                <meshBasicMaterial color="#bc13fe" transparent opacity={0.6} />

                {particles.map((data, i) => (
                    <Particle key={i} {...data} />
                ))}
            </Instances>
        </group>
    );
};

const Particle = ({ position, factor }) => {
    const ref = useRef();

    // Individual parallax could be added here if needed, 
    // but moving the group is more performant for basic effect.
    // We'll just float them slightly.
    useFrame((state) => {
        if (ref.current) {
            const t = state.clock.elapsedTime;
            ref.current.position.y = position[1] + Math.sin(t * factor) * 0.2;
        }
    });

    return <Instance ref={ref} position={position} />;
};

export default ScrollNetwork;
