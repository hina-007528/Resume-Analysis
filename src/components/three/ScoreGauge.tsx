'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Torus, Text } from '@react-three/drei';
import * as THREE from 'three';

export const ScoreGauge = ({ score = 78 }: { score?: number }) => {
  const groupRef = useRef<THREE.Group>(null!);
  const ringRef = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    groupRef.current.rotation.y = t * 0.5;
  });

  const percentage = score / 100;

  return (
    <group ref={groupRef}>
      {/* Background Ring */}
      <Torus args={[2, 0.1, 16, 100]} rotation={[Math.PI / 2, 0, 0]}>
        <meshStandardMaterial color="#2a292f" transparent opacity={0.3} />
      </Torus>

      {/* Progress Ring */}
      <Torus 
        ref={ringRef}
        args={[2, 0.12, 16, 100, Math.PI * 2 * percentage]} 
        rotation={[Math.PI / 2, 0, Math.PI / 2]}
      >
        <meshStandardMaterial 
          color="#00F5FF" 
          emissive="#00F5FF" 
          emissiveIntensity={1} 
          metalness={0.8}
        />
      </Torus>

      {/* Center Score Text */}
      <Text
        position={[0, 0, 0]}
        fontSize={0.8}
        color="#00F5FF"
        font="https://fonts.gstatic.com/s/syne/v22/8Ub7Es2oNabd8SjCGSRAnA.woff"
        anchorX="center"
        anchorY="middle"
      >
        {`${score}%`}
      </Text>
    </group>
  );
};
