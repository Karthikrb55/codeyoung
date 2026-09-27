import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Sphere, Line, Points, PointMaterial } from '@react-three/drei'
import * as THREE from 'three'

// Generate random points on a sphere for the globe particles
function randomPointsOnSphere(count: number, radius: number) {
  const points = []
  for (let i = 0; i < count; i++) {
    const u = Math.random()
    const v = Math.random()
    const theta = u * 2.0 * Math.PI
    const phi = Math.acos(2.0 * v - 1.0)
    const r = Math.cbrt(Math.random()) * radius * 0.95 + radius * 0.05 // Mostly on surface

    const x = r * Math.sin(phi) * Math.cos(theta)
    const y = r * Math.sin(phi) * Math.sin(theta)
    const z = r * Math.cos(phi)

    points.push(new THREE.Vector3(x, y, z))
  }
  return new THREE.BufferGeometry().setFromPoints(points)
}

function GlobePoints() {
  const ref = useRef<THREE.Points>(null)
  
  // Use useMemo to avoid recreating geometry on every render
  const geometry = useMemo(() => randomPointsOnSphere(1500, 2), [])

  useFrame((_state, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * 0.05
    }
  })

  return (
    <Points ref={ref} geometry={geometry}>
      <PointMaterial transparent color="#6366f1" size={0.02} sizeAttenuation={true} depthWrite={false} opacity={0.6} />
    </Points>
  )
}

function ConnectionArcs() {
  const groupRef = useRef<THREE.Group>(null)
  
  useFrame((_state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.05
    }
  })

  // Predefined locations (approximate spherical coordinates)
  // New York, London, India, Tokyo, Sydney
  const locations = [
    new THREE.Vector3(-1.4, 1.2, 0.8).normalize().multiplyScalar(2),
    new THREE.Vector3(1.2, 1.3, 0.5).normalize().multiplyScalar(2),
    new THREE.Vector3(0.5, 0.5, -1.8).normalize().multiplyScalar(2),
    new THREE.Vector3(1.5, 0.8, -1.2).normalize().multiplyScalar(2),
    new THREE.Vector3(1.8, -0.8, -0.5).normalize().multiplyScalar(2),
  ]

  const arcs = []
  for (let i = 0; i < locations.length; i++) {
    for (let j = i + 1; j < locations.length; j++) {
      // Create a quadratic bezier curve between locations
      const start = locations[i]
      const end = locations[j]
      const mid = start.clone().add(end).multiplyScalar(0.5).normalize().multiplyScalar(2.5) // Arc height
      
      const curve = new THREE.QuadraticBezierCurve3(start, mid, end)
      const points = curve.getPoints(50)
      
      arcs.push(
        <Line 
          key={`${i}-${j}`}
          points={points}
          color="#06b6d4"
          opacity={0.3}
          transparent
          lineWidth={1}
        />
      )
    }
  }

  return <group ref={groupRef}>{arcs}</group>
}

export function GlobeScene() {
  return (
    <div className="w-full h-[500px] md:h-[700px] absolute inset-0 -z-10 opacity-70 pointer-events-none">
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        
        {/* Core Sphere - highly transparent */}
        <Sphere args={[1.98, 32, 32]}>
          <meshBasicMaterial color="#0B1020" transparent opacity={0.8} />
        </Sphere>
        
        <GlobePoints />
        <ConnectionArcs />
        
        <OrbitControls 
          enableZoom={false} 
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.5}
          maxPolarAngle={Math.PI / 1.5}
          minPolarAngle={Math.PI / 2.5}
        />
      </Canvas>
    </div>
  )
}
