'use client';

import { useRef, useEffect, useMemo } from 'react';
import { Canvas, useFrame, extend } from '@react-three/fiber';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import { useAudioAnalyser } from '@/hooks/useAudioAnalyser';
import { VISUAL_THEMES } from '@/lib/audio/visualConfig';
import type { NarrativePhase } from '@/types';

// ── Phase colors ──────────────────────────────────────────────
const PHASE_COLORS: Record<NarrativePhase, [number, number, number]> = {
  APRESENTACAO: [0.69, 0.69, 0.88],
  INFERNO:      [1.0,  0.27, 0.20],
  PURGATORIO:   [0.39, 0.59, 0.78],
  PARAISO:      [1.0,  0.84, 0.39],
  DEVOLUCAO:    [1.0,  0.84, 0.39],
  ENCERRAMENTO: [0.69, 0.69, 0.88],
};

// ── GLSL: 3D Simplex Noise (Ashima Arts) ──────────────────────
const simplexNoise3D = /* glsl */`
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
  const vec2 C = vec2(1.0/6.0, 1.0/3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute(permute(permute(
    i.z + vec4(0.0, i1.z, i2.z, 1.0))
    + i.y + vec4(0.0, i1.y, i2.y, 1.0))
    + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}
`;

// ── Vertex Shader: noise-based displacement along normals ─────
const vertexShader = /* glsl */`
${simplexNoise3D}

uniform float uTime;
uniform float uAudioLevel;
uniform float uBass;
uniform float uIntensity;

varying vec3 vNormal;
varying vec3 vPosition;
varying float vDisplacement;

void main() {
  vNormal = normalize(normalMatrix * normal);

  // Multi-octave noise for organic displacement
  float noise1 = snoise(position * 1.5 + uTime * 0.4) * 0.6;
  float noise2 = snoise(position * 3.0 + uTime * 0.8) * 0.3;
  float noise3 = snoise(position * 6.0 + uTime * 1.2) * 0.1;
  float noiseVal = noise1 + noise2 + noise3;

  // Audio drives displacement magnitude — silent = smooth sphere, loud = spiky
  float displacement = noiseVal * (0.05 + uAudioLevel * 0.65) * uIntensity;

  // Bass adds extra low-frequency bulge
  displacement += uBass * 0.15 * sin(position.y * 2.0 + uTime);

  vec3 newPosition = position + normal * displacement;
  vPosition = newPosition;
  vDisplacement = displacement;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
}
`;

// ── Fragment Shader: fresnel glow + phase color ───────────────
const fragmentShader = /* glsl */`
uniform vec3 uColor;
uniform float uAudioLevel;
uniform float uTime;
uniform float uFresnelPower;

varying vec3 vNormal;
varying vec3 vPosition;
varying float vDisplacement;

void main() {
  // Fresnel: brighter at glancing angles (edges glow)
  vec3 viewDir = normalize(cameraPosition - vPosition);
  float fresnel = pow(1.0 - abs(dot(viewDir, vNormal)), uFresnelPower);

  // Base color with displacement-driven brightness
  float dispBrightness = 0.3 + abs(vDisplacement) * 3.0;

  // Core glow — center of the mesh is subtly brighter
  float coreDist = length(vPosition) / 1.5;
  float coreGlow = smoothstep(1.0, 0.0, coreDist) * 0.2;

  // Combine: fresnel edge glow + displacement brightness + core
  float intensity = fresnel * (0.8 + uAudioLevel * 1.5) + dispBrightness * 0.3 + coreGlow;

  // Final color with emissive-style output for bloom to pick up
  vec3 finalColor = uColor * intensity;

  // Add white-hot highlights on extreme displacement
  float hotSpot = smoothstep(0.15, 0.4, abs(vDisplacement));
  finalColor += vec3(1.0) * hotSpot * 0.3 * uAudioLevel;

  float alpha = 0.15 + fresnel * 0.6 + uAudioLevel * 0.25;

  gl_FragColor = vec4(finalColor, alpha);
}
`;

// ── Inner Glow Shader (backside additive halo) ────────────────
const glowVertexShader = /* glsl */`
varying vec3 vNormal;
varying vec3 vPosition;

void main() {
  vNormal = normalize(normalMatrix * normal);
  vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const glowFragmentShader = /* glsl */`
uniform vec3 uColor;
uniform float uAudioLevel;
uniform float uOpacity;

varying vec3 vNormal;
varying vec3 vPosition;

void main() {
  vec3 viewDir = normalize(-vPosition);
  float fresnel = pow(1.0 - abs(dot(viewDir, vNormal)), 2.0);
  float glow = fresnel * (0.5 + uAudioLevel * 0.8);
  gl_FragColor = vec4(uColor * glow * 2.0, glow * uOpacity);
}
`;

// ── Floating particle (ambient dust) ──────────────────────────
function FloatingParticles({ phase, audioLevel }: { phase: NarrativePhase; audioLevel: React.RefObject<number> }) {
  const pointsRef = useRef<THREE.Points>(null);
  const count = 120;

  const { positions, sizes, offsets } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const sz = new Float32Array(count);
    const off = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      // Spread particles in a sphere around origin
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 2.5 + Math.random() * 4;
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
      sz[i] = Math.random() * 2 + 0.5;
      off[i] = Math.random() * Math.PI * 2;
    }
    return { positions: pos, sizes: sz, offsets: off };
  }, []);

  useFrame(({ clock }) => {
    if (!pointsRef.current) return;
    const t = clock.getElapsedTime();
    const geo = pointsRef.current.geometry;
    const posArr = geo.attributes.position.array as Float32Array;
    const al = audioLevel.current ?? 0;

    for (let i = 0; i < count; i++) {
      const baseX = positions[i * 3];
      const baseY = positions[i * 3 + 1];
      const baseZ = positions[i * 3 + 2];
      const off = offsets[i];

      // Gentle orbital drift + audio-driven expansion
      const drift = 1 + al * 0.3;
      posArr[i * 3] = baseX * drift + Math.sin(t * 0.2 + off) * 0.3;
      posArr[i * 3 + 1] = baseY * drift + Math.cos(t * 0.15 + off) * 0.3;
      posArr[i * 3 + 2] = baseZ * drift + Math.sin(t * 0.1 + off * 2) * 0.3;
    }
    geo.attributes.position.needsUpdate = true;

    // Rotate entire particle system slowly
    pointsRef.current.rotation.y = t * 0.02;
  });

  const color = new THREE.Color(...PHASE_COLORS[phase]);

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions.slice(), 3]}
          count={count}
        />
      </bufferGeometry>
      <pointsMaterial
        color={color}
        size={0.04}
        transparent
        opacity={0.6}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// ── Main reactive sphere scene ────────────────────────────────
interface SceneProps {
  analyserRef: React.RefObject<AnalyserNode | null>;
  dataArrayRef: React.RefObject<Uint8Array | null>;
  phase: NarrativePhase;
}

function ReactiveOrb({ analyserRef, dataArrayRef, phase }: SceneProps) {
  const mainMatRef = useRef<THREE.ShaderMaterial>(null);
  const wireMatRef = useRef<THREE.ShaderMaterial>(null);
  const glowMatRef = useRef<THREE.ShaderMaterial>(null);
  const groupRef = useRef<THREE.Group>(null);
  const energyRef = useRef(0);
  const bassRef = useRef(0);
  const audioLevelRef = useRef(0);
  const targetColor = useRef(new THREE.Vector3(...PHASE_COLORS[phase]));
  const currentColor = useRef(new THREE.Vector3(...PHASE_COLORS[phase]));

  // Higher detail icosahedron for smoother noise displacement
  const geometry = useMemo(() => {
    const geo = new THREE.IcosahedronGeometry(1.5, 4);
    geo.computeVertexNormals();
    return geo;
  }, []);

  useEffect(() => {
    const [r, g, b] = PHASE_COLORS[phase];
    targetColor.current.set(r, g, b);
  }, [phase]);

  useEffect(() => {
    return () => { geometry.dispose(); };
  }, [geometry]);

  // Shared uniforms for the main shader
  // eslint-disable-next-line react-hooks/exhaustive-deps -- uniforms are stable refs, updated in useFrame
  const mainUniforms = useMemo(() => ({
    uTime: { value: 0 },
    uAudioLevel: { value: 0 },
    uBass: { value: 0 },
    uIntensity: { value: VISUAL_THEMES[phase].motionIntensity },
    uColor: { value: new THREE.Vector3(...PHASE_COLORS[phase]) },
    uFresnelPower: { value: 2.5 },
  }), []);

  // eslint-disable-next-line react-hooks/exhaustive-deps -- uniforms are stable refs, updated in useFrame
  const glowUniforms = useMemo(() => ({
    uColor: { value: new THREE.Vector3(...PHASE_COLORS[phase]) },
    uAudioLevel: { value: 0 },
    uOpacity: { value: 0.4 },
  }), []);

  useFrame(({ clock }, delta) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();

    // Extract audio energy
    const analyser = analyserRef.current;
    const dataArray = dataArrayRef.current;
    let bass = 0, mid = 0;
    if (analyser && dataArray) {
      analyser.getByteFrequencyData(dataArray as Uint8Array<ArrayBuffer>);
      const len = dataArray.length;
      const bassEnd = Math.floor(len * 0.15);
      const midEnd = Math.floor(len * 0.5);
      for (let i = 0; i < bassEnd; i++) bass += dataArray[i] / 255;
      for (let i = bassEnd; i < midEnd; i++) mid += dataArray[i] / 255;
      bass /= bassEnd || 1;
      mid /= (midEnd - bassEnd) || 1;
    }

    const energy = bass * 0.6 + mid * 0.4;
    energyRef.current += (energy - energyRef.current) * 0.12;
    bassRef.current += (bass - bassRef.current) * 0.15;
    audioLevelRef.current = energyRef.current;
    const e = energyRef.current;

    // Smooth color transition
    currentColor.current.lerp(targetColor.current, delta * 2);
    const cc = currentColor.current;

    // Update shader uniforms
    if (mainMatRef.current) {
      mainMatRef.current.uniforms.uTime.value = t;
      mainMatRef.current.uniforms.uAudioLevel.value = e;
      mainMatRef.current.uniforms.uBass.value = bassRef.current;
      mainMatRef.current.uniforms.uIntensity.value = VISUAL_THEMES[phase].motionIntensity;
      mainMatRef.current.uniforms.uColor.value.copy(cc);
    }
    if (wireMatRef.current) {
      wireMatRef.current.uniforms.uTime.value = t;
      wireMatRef.current.uniforms.uAudioLevel.value = e;
      wireMatRef.current.uniforms.uBass.value = bassRef.current;
      wireMatRef.current.uniforms.uIntensity.value = VISUAL_THEMES[phase].motionIntensity;
      wireMatRef.current.uniforms.uColor.value.copy(cc);
    }
    if (glowMatRef.current) {
      glowMatRef.current.uniforms.uAudioLevel.value = e;
      glowMatRef.current.uniforms.uColor.value.copy(cc);
    }

    // Rotation — slow idle, bass accelerates
    groupRef.current.rotation.x += delta * (0.05 + e * 0.2);
    groupRef.current.rotation.y += delta * (0.08 + e * 0.3);

    // Subtle scale pulse on bass
    groupRef.current.scale.setScalar(1 + e * 0.08);
  });

  return (
    <group ref={groupRef}>
      {/* Main body — noise-displaced with fresnel glow */}
      <mesh geometry={geometry}>
        <shaderMaterial
          ref={mainMatRef}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          uniforms={mainUniforms}
          transparent
          side={THREE.FrontSide}
          depthWrite={false}
        />
      </mesh>

      {/* Wireframe overlay — same displacement, thin lines */}
      <mesh geometry={geometry}>
        <shaderMaterial
          ref={wireMatRef}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          uniforms={{
            uTime: { value: 0 },
            uAudioLevel: { value: 0 },
            uBass: { value: 0 },
            uIntensity: { value: VISUAL_THEMES[phase].motionIntensity },
            uColor: { value: new THREE.Vector3(...PHASE_COLORS[phase]) },
            uFresnelPower: { value: 3.0 },
          }}
          transparent
          wireframe
          depthWrite={false}
        />
      </mesh>

      {/* Inner glow — backside additive halo */}
      <mesh>
        <sphereGeometry args={[1.8, 32, 32]} />
        <shaderMaterial
          ref={glowMatRef}
          vertexShader={glowVertexShader}
          fragmentShader={glowFragmentShader}
          uniforms={glowUniforms}
          transparent
          side={THREE.BackSide}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Floating particles */}
      <FloatingParticles phase={phase} audioLevel={audioLevelRef} />
    </group>
  );
}

// ── Exported component ────────────────────────────────────────
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
        <ReactiveOrb
          analyserRef={analyserRef}
          dataArrayRef={dataArrayRef}
          phase={phase}
        />

        <EffectComposer>
          <Bloom
            intensity={2.0}
            luminanceThreshold={0.05}
            luminanceSmoothing={0.9}
            mipmapBlur
          />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
