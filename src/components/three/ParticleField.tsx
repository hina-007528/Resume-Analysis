"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export const ParticleField = ({ count = 2000 }) => {
  const points = useRef<THREE.Points>(null!);

  const particles = useMemo(() => {
    const temp = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      temp[i * 3] = (Math.random() - 0.5) * 10;
      temp[i * 3 + 1] = (Math.random() - 0.5) * 10;
      temp[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    return temp;
  }, [count]);

  useFrame((state) => {
    const time = state.clock.getElapsedTime() * 0.05;
    points.current.rotation.y = time;
    points.current.rotation.x = time * 0.5;
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute
          attach="position"
          args={[particles, 3]}
        />



      </bufferGeometry>
      <pointsMaterial
        size={0.015}
        color="#00F5FF"
        transparent
        opacity={0.4}
        sizeAttenuation
      />
    </points>
  );
};
