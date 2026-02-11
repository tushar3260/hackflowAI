import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, OrbitControls, PerspectiveCamera, Stars } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import { Calendar, Send, BarChart2, Award } from 'lucide-react'; // Icons

import ParticleField from './ParticleField';
import FloatingNode from './FloatingNode';
import OrbitCard from './OrbitCard';

const HackathonScene = () => {
    return (
        <div className="absolute inset-0 z-0">
            <Canvas>
                <PerspectiveCamera makeDefault position={[0, 0, 8]} fov={50} />

                {/* Lighting */}
                <ambientLight intensity={0.2} />
                <pointLight position={[10, 10, 10]} intensity={1} color="#00f3ff" />
                <pointLight position={[-10, -10, -10]} intensity={0.5} color="#ff00dd" />

                <Suspense fallback={null}>
                    {/* Environment */}
                    {/* <Environment preset="city" />  Can be heavy, maybe skip for performance or use simple color */}
                    <color attach="background" args={['#050505']} />
                    <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
                    <ParticleField />

                    {/* Interactive Elements */}
                    <group position={[0, -0.5, 0]}>
                        {/* Card Layout: Left/Right or Orbit? Let's do semi-circle */}
                        <OrbitCard
                            position={[-3.5, 1, 0]}
                            rotation={[0, 0.2, 0]}
                            label="Register"
                            route="/register"
                            icon={Calendar}
                        />
                        <OrbitCard
                            position={[-1.2, 1, 1]}
                            rotation={[0, 0.1, 0]}
                            label="Submit"
                            route="/dashboard/submission"
                            icon={Send}
                        />
                        <OrbitCard
                            position={[1.2, 1, 1]}
                            rotation={[0, -0.1, 0]}
                            label="Evaluate"
                            route="/dashboard/judge/evaluate/demo"
                            icon={BarChart2}
                        />
                        <OrbitCard
                            position={[3.5, 1, 0]}
                            rotation={[0, -0.2, 0]}
                            label="Leaderboard"
                            route="/leaderboard/demo"
                            icon={Award}
                        />
                    </group>

                    {/* Background Nodes (Decor) */}
                    <FloatingNode position={[-6, 3, -5]} color="#00f3ff" label="Node A" />
                    <FloatingNode position={[6, -2, -8]} color="#ff00dd" label="Node B" />
                    <FloatingNode position={[0, 4, -10]} color="#ffffff" label="Core" />

                </Suspense>

                {/* Post Processing */}
                <EffectComposer>
                    <Bloom luminanceThreshold={0.5} luminanceSmoothing={0.9} height={300} intensity={1.5} />
                    <Vignette eskil={false} offset={0.1} darkness={1.1} />
                </EffectComposer>

                {/* Camera Control - Restricted movement */}
                <OrbitControls
                    enableZoom={false}
                    enablePan={false}
                    maxPolarAngle={Math.PI / 2 + 0.2}
                    minPolarAngle={Math.PI / 2 - 0.2}
                    maxAzimuthAngle={Math.PI / 8}
                    minAzimuthAngle={-Math.PI / 8}
                />
            </Canvas>
        </div>
    );
};

export default HackathonScene;
