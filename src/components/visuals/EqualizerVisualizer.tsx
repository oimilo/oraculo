'use client';

import { useRef, useEffect, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import { useAudioAnalyser } from '@/hooks/useAudioAnalyser';
import { VISUAL_THEMES } from '@/lib/audio/visualConfig';
import type { NarrativePhase } from '@/types';

// Vibrant emissive colors per phase (brighter than background PHASE_COLORS)
const MESH_COLORS: Record<NarrativePhase, string> = {
  APRESENTACAO: '#b0b0e0',
  INFERNO: '#ff4632',
  PURGATORIO: '#6496c8',
  PARAISO: '#ffd764',
  DEVOLUCAO: '#ffd764',
  ENCERRAMENTO: '#b0b0e0',
};

interface SceneProps {
  analyserRef: React.RefObject<AnalyserNode | null>;
  dataArrayRef: React.RefObject<Uint8Array | null>;
  phase: NarrativePhase;
}

function ReactivePolyhedron({ analyserRef, dataArrayRef, phase }: SceneProps) {
  const groupRef = useRef<THREE.Group>(null);
  const faceMatRef = useRef<THREE.MeshStandardMaterial>(null);
  const wireMatRef = useRef<THREE.MeshBasicMaterial>(null);
  const coreMatRef = useRef<THREE.MeshStandardMaterial>(null);
  const originalPositions = useRef<Float32Array | null>(null);
  const energyRef = useRef(0);
  const targetColor = useRef(new THREE.Color(MESH_COLORS[phase]));
  const currentColor = useRef(new THREE.Color(MESH_COLORS[phase]));

  // Shared geometry — both face mesh and wireframe deform together
  const geometry = useMemo(() => new THREE.IcosahedronGeometry(1.5, 1), []);

  useEffect(() => {
    originalPositions.current = new Float32Array(geometry.attributes.position.array);
    return () => { geometry.dispose(); };
  }, [geometry]);

  useEffect(() => {
    targetColor.current.set(MESH_COLORS[phase]);
  }, [phase]);

  useFrame((_, delta) => {
    if (!groupRef.current || !originalPositions.current) return;

    const analyser = analyserRef.current;
    const dataArray = dataArrayRef.current;
    const positions = geometry.attributes.position;
    const original = originalPositions.current;

    // Audio energy from bass + mids
    let bass = 0, mid = 0;
    if (analyser && dataArray) {
      analyser.getByteFrequencyData(dataArray);
      const len = dataArray.length;
      const bassEnd = Math.floor(len * 0.15);
      const midEnd = Math.floor(len * 0.5);
      for (let i = 0; i < bassEnd; i++) bass += dataArray[i] / 255;
      for (let i = bassEnd; i < midEnd; i++) mid += dataArray[i] / 255;
      bass /= bassEnd;
      mid /= (midEnd - bassEnd);
    }
    const energy = bass * 0.6 + mid * 0.4;
    energyRef.current += (energy - energyRef.current) * 0.12;
    const e = energyRef.current;
    const intensity = VISUAL_THEMES[phase].motionIntensity;

    // Per-vertex displacement from frequency data
    if (dataArray) {
      for (let i = 0; i < positions.count; i++) {
        const ox = original[i * 3];
        const oy = original[i * 3 + 1];
        const oz = original[i * 3 + 2];
        const r = Math.sqrt(ox * ox + oy * oy + oz * oz);
        const nx = ox / r, ny = oy / r, nz = oz / r;

        const theta = Math.atan2(ny, nx);
        const idx = Math.floor(((theta + Math.PI) / (2 * Math.PI)) * dataArray.length * 0.6);
        const amplitude = dataArray[Math.min(idx, dataArray.length - 1)] / 255;
        const d = amplitude * 0.5 * intensity;

        positions.setXYZ(i, ox + nx * d, oy + ny * d, oz + nz * d);
      }
      positions.needsUpdate = true;
    }

    // Rotation — bass accelerates
    groupRef.current.rotation.x += delta * (0.08 + e * 0.25);
    groupRef.current.rotation.y += delta * (0.12 + e * 0.35);

    // Scale pulse
    groupRef.current.scale.setScalar(1 + e * 0.12);

    // Smooth color lerp between phases
    currentColor.current.lerp(targetColor.current, delta * 2);
    const c = currentColor.current;

    if (faceMatRef.current) {
      faceMatRef.current.color.copy(c);
      faceMatRef.current.emissive.copy(c);
      faceMatRef.current.emissiveIntensity = 0.3 + e * 1.5;
      faceMatRef.current.opacity = 0.12 + e * 0.18;
    }
    if (wireMatRef.current) {
      wireMatRef.current.color.copy(c);
      wireMatRef.current.opacity = 0.3 + e * 0.5;
    }
    if (coreMatRef.current) {
      coreMatRef.current.color.copy(c);
      coreMatRef.current.emissive.copy(c);
      coreMatRef.current.emissiveIntensity = 1 + e * 3;
    }
  });

  const initColor = new THREE.Color(MESH_COLORS[phase]);

  return (
    <group ref={groupRef}>
      {/* Translucent flat-shaded faces — geometric facets visible */}
      <mesh geometry={geometry}>
        <meshStandardMaterial
          ref={faceMatRef}
          color={initColor}
          emissive={initColor}
          emissiveIntensity={0.3}
          transparent
          opacity={0.12}
          flatShading
          metalness={0.3}
          roughness={0.4}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* Wireframe — same geometry, deforms with faces */}
      <mesh geometry={geometry}>
        <meshBasicMaterial
          ref={wireMatRef}
          color={initColor}
          wireframe
          transparent
          opacity={0.3}
        />
      </mesh>

      {/* Bright emissive core */}
      <mesh>
        <sphereGeometry args={[0.25, 16, 16]} />
        <meshStandardMaterial
          ref={coreMatRef}
          color={initColor}
          emissive={initColor}
          emissiveIntensity={2}
          transparent
          opacity={0.6}
        />
      </mesh>
    </group>
  );
}

interface EqualizerVisualizerProps {
  phase: NarrativePhase;
  isPlaying: boolean;
}

export default function EqualizerVisualizer({ phase, isPlaying }: EqualizerVisualizerProps) {
  const { analyserRef, dataArrayRef } = useAudioAnalyser({ fftSize: 256, smoothingTimeConstant: 0.82 });

  return (
    <div
      data-testid="equalizer-canvas"
      className="absolute inset-0 w-full h-full"
      aria-hidden="true"
    >
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        gl={{ alpha: true, antialias: true }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.1} />
        <pointLight position={[5, 5, 5]} intensity={0.3} />

        <ReactivePolyhedron
          analyserRef={analyserRef}
          dataArrayRef={dataArrayRef}
          phase={phase}
        />

        <EffectComposer>
          <Bloom
            intensity={1.5}
            luminanceThreshold={0.1}
            luminanceSmoothing={0.9}
            mipmapBlur
          />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
