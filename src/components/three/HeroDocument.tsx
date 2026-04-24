"use client";

import { useRef } from "react";

import { useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial, PerspectiveCamera, Sphere } from "@react-three/drei";
import * as THREE from "three";

export const HeroDocument = () => {
  const meshRef = useRef<THREE.Mesh>(null!);
  const wireRef = useRef<THREE.Mesh>(null!);
  const coreRef = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    meshRef.current.rotation.y = time * 0.4;
    meshRef.current.rotation.z = time * 0.2;
    
    wireRef.current.rotation.y = -time * 0.3;
    wireRef.current.rotation.x = time * 0.2;
    
    coreRef.current.scale.setScalar(1 + Math.sin(time * 2) * 0.05);
  });

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 8]} />
      <ambientLight intensity={0.2} />
      <pointLight position={[10, 10, 10]} color="#00F5FF" intensity={2} />
      <pointLight position={[-10, -10, -10]} color="#7B2FFF" intensity={2} />
      <spotLight position={[0, 5, 10]} angle={0.15} penumbra={1} intensity={2} color="#00F5FF" />
      
      <Float speed={3} rotationIntensity={1} floatIntensity={2}>
        <group>
          {/* Main Crystal Geometry */}
          <mesh ref={meshRef}>
            <icosahedronGeometry args={[2.2, 1]} />
            <MeshDistortMaterial
              color="#00F5FF"
              speed={3}
              distort={0.3}
              radius={1}
              emissive="#00F5FF"
              emissiveIntensity={0.2}
              transparent
              opacity={0.4}
              metalness={0.9}
              roughness={0.1}
            />
          </mesh>

          {/* Holographic Wireframe */}
          <mesh ref={wireRef}>
            <icosahedronGeometry args={[2.4, 2]} />
            <meshBasicMaterial 
              color="#7B2FFF" 
              wireframe 
              transparent 
              opacity={0.3} 
              blending={THREE.AdditiveBlending}
            />
          </mesh>

          {/* Inner Glowing Core */}
          <Sphere ref={coreRef} args={[0.8, 32, 32]}>
            <meshBasicMaterial 
              color="#00F5FF" 
              transparent 
              opacity={0.8}
              blending={THREE.AdditiveBlending}
            />
            <pointLight distance={5} intensity={5} color="#00F5FF" />
          </Sphere>
        </group>
      </Float>
    </>
  );
};

