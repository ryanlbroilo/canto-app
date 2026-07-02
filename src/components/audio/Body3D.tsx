import { Canvas, useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'
import { breathAt } from '../../audio/breathCycle'

// Cena 3D (react-three-fiber) — carregada sob demanda (lazy) só nos exercícios de
// corpo, pra não inchar o bundle principal. Uma figura humana estilizada, iluminada
// como estúdio, que RESPIRA: peito e barriga expandem no inspire, o corpo sobe de
// leve e um brilho interno acende. Um balanço lento revela a profundidade 3D.

const WARM = '#efe1c9'
const GLOW = new THREE.Color('#8fe9c6')

function Figure({ startedAt }: { startedAt: number }) {
  const root = useRef<THREE.Group>(null)
  const chest = useRef<THREE.Group>(null)
  const belly = useRef<THREE.Group>(null)
  const chestMat = useRef<THREE.MeshStandardMaterial>(null)
  const bellyMat = useRef<THREE.MeshStandardMaterial>(null)

  useFrame(() => {
    const el = (performance.now() - startedAt) / 1000
    const b = breathAt(el).breath // 0..1
    if (chest.current) chest.current.scale.set(1 + b * 0.13, 1 + b * 0.05, 1 + b * 0.13)
    if (belly.current) belly.current.scale.set(1 + b * 0.16, 1 + b * 0.045, 1 + b * 0.16)
    if (chestMat.current) chestMat.current.emissiveIntensity = 0.04 + b * 0.4
    if (bellyMat.current) bellyMat.current.emissiveIntensity = 0.04 + b * 0.34
    if (root.current) {
      root.current.position.y = -0.25 + b * 0.06 // sobe de leve no inspire
      root.current.rotation.y = Math.sin(el * 0.3) * 0.34 // balanço 3D suave
    }
  })

  return (
    <group ref={root} position={[0, -0.25, 0]}>
      {/* cabeça + pescoço */}
      <mesh position={[0, 1.42, 0]} scale={[1, 1.12, 1]}>
        <sphereGeometry args={[0.24, 32, 32]} />
        <meshStandardMaterial color={WARM} roughness={0.55} metalness={0.05} />
      </mesh>
      <mesh position={[0, 1.22, 0]}>
        <cylinderGeometry args={[0.085, 0.1, 0.16, 20]} />
        <meshStandardMaterial color={WARM} roughness={0.6} metalness={0.05} />
      </mesh>

      {/* ombros */}
      <mesh position={[-0.33, 1.03, 0]}>
        <sphereGeometry args={[0.15, 24, 24]} />
        <meshStandardMaterial color={WARM} roughness={0.6} metalness={0.05} />
      </mesh>
      <mesh position={[0.33, 1.03, 0]}>
        <sphereGeometry args={[0.15, 24, 24]} />
        <meshStandardMaterial color={WARM} roughness={0.6} metalness={0.05} />
      </mesh>

      {/* peito (expande + acende no inspire) */}
      <group ref={chest} position={[0, 0.82, 0]}>
        <mesh scale={[0.44, 0.52, 0.32]}>
          <sphereGeometry args={[1, 40, 40]} />
          <meshStandardMaterial ref={chestMat} color={WARM} roughness={0.5} metalness={0.06} emissive={GLOW} emissiveIntensity={0.04} />
        </mesh>
      </group>

      {/* barriga (expande mais — a dica: barriga sai) */}
      <group ref={belly} position={[0, 0.34, 0]}>
        <mesh scale={[0.38, 0.44, 0.3]}>
          <sphereGeometry args={[1, 40, 40]} />
          <meshStandardMaterial ref={bellyMat} color={WARM} roughness={0.5} metalness={0.06} emissive={GLOW} emissiveIntensity={0.04} />
        </mesh>
      </group>

      {/* quadril */}
      <mesh position={[0, 0.0, 0]} scale={[0.36, 0.28, 0.28]}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial color={WARM} roughness={0.6} metalness={0.05} />
      </mesh>

      {/* braços relaxados ao lado */}
      <mesh position={[-0.46, 0.58, 0.02]} rotation={[0, 0, 0.14]}>
        <capsuleGeometry args={[0.085, 0.72, 6, 14]} />
        <meshStandardMaterial color={WARM} roughness={0.62} metalness={0.05} />
      </mesh>
      <mesh position={[0.46, 0.58, 0.02]} rotation={[0, 0, -0.14]}>
        <capsuleGeometry args={[0.085, 0.72, 6, 14]} />
        <meshStandardMaterial color={WARM} roughness={0.62} metalness={0.05} />
      </mesh>

      {/* pernas */}
      <mesh position={[-0.16, -0.62, 0]}>
        <capsuleGeometry args={[0.13, 0.9, 6, 16]} />
        <meshStandardMaterial color={WARM} roughness={0.62} metalness={0.05} />
      </mesh>
      <mesh position={[0.16, -0.62, 0]}>
        <capsuleGeometry args={[0.13, 0.9, 6, 16]} />
        <meshStandardMaterial color={WARM} roughness={0.62} metalness={0.05} />
      </mesh>
    </group>
  )
}

export default function Body3D({ startedAt }: { startedAt: number }) {
  return (
    <Canvas
      camera={{ position: [0, 0.15, 4.3], fov: 34 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
      style={{ width: '100%', height: '100%' }}
    >
      <ambientLight intensity={0.55} />
      {/* key quente */}
      <directionalLight position={[3.5, 6, 5]} intensity={1.25} color="#fff3dd" />
      {/* rim fria (dá contorno premium) */}
      <directionalLight position={[-4, 3, -3]} intensity={0.6} color="#7fb2ff" />
      {/* preenchimento suave por baixo */}
      <pointLight position={[0, -2, 2]} intensity={0.3} color="#e9b44c" />
      <Figure startedAt={startedAt} />
    </Canvas>
  )
}
