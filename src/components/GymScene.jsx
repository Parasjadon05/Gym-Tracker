import { Canvas } from '@react-three/fiber'
import { Float } from '@react-three/drei'

/**
 * Subtle 3D backdrop — athletic, not playful. Low motion, muted materials.
 */
function Plates() {
  return (
    <>
      <Float speed={0.35} rotationIntensity={0.15} floatIntensity={0.35}>
        <mesh position={[-2.2, 0.4, -1.6]} rotation={[0.85, 0.15, 0.12]}>
          <torusGeometry args={[0.65, 0.18, 16, 40]} />
          <meshStandardMaterial color="#3d4556" metalness={0.75} roughness={0.35} />
        </mesh>
      </Float>
      <Float speed={0.4} rotationIntensity={0.18} floatIntensity={0.4}>
        <mesh position={[2.1, -0.15, -1.2]} rotation={[0.25, 0.9, 0.08]}>
          <torusGeometry args={[0.85, 0.22, 16, 40]} />
          <meshStandardMaterial color="#2a3344" metalness={0.8} roughness={0.3} />
        </mesh>
      </Float>
      <Float speed={0.28} rotationIntensity={0.12} floatIntensity={0.25}>
        <mesh position={[0.15, -1.6, -0.8]} rotation={[0.08, 0.5, 0.06]}>
          <boxGeometry args={[2, 0.1, 0.1]} />
          <meshStandardMaterial color="#4a5568" metalness={0.85} roughness={0.25} />
        </mesh>
      </Float>
    </>
  )
}

function GymScene() {
  return (
    <div className="gym-scene" aria-hidden="true">
      <Canvas camera={{ position: [0, 0, 4.6], fov: 55 }} dpr={[1, 1.5]}>
        <ambientLight intensity={0.18} />
        <directionalLight position={[2, 2, 2]} intensity={0.55} color="#e2e8f0" />
        <pointLight position={[-2, -1, 1]} intensity={0.35} color="#0d9488" />
        <Plates />
      </Canvas>
    </div>
  )
}

export default GymScene
