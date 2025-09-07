import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import useVibeStore from '../stores/vibeStore'

function ParticleField({ emotion }) {
  const mesh = useRef()
  const { particleCount, primaryColor, visualIntensity, pitch, volume } = useVibeStore()
  
  // Generate particle positions and colors
  const [positions, colors, scales] = useMemo(() => {
    const positions = new Float32Array(particleCount * 3)
    const colors = new Float32Array(particleCount * 3)
    const scales = new Float32Array(particleCount)
    
    for (let i = 0; i < particleCount; i++) {
      // Position in sphere
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      const radius = 3 + Math.random() * 2
      
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta)
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
      positions[i * 3 + 2] = radius * Math.cos(phi)
      
      // Color with slight variation
      colors[i * 3] = primaryColor[0] + (Math.random() - 0.5) * 0.2
      colors[i * 3 + 1] = primaryColor[1] + (Math.random() - 0.5) * 0.2
      colors[i * 3 + 2] = primaryColor[2] + (Math.random() - 0.5) * 0.2
      
      // Random scale
      scales[i] = 0.5 + Math.random() * 0.5
    }
    
    return [positions, colors, scales]
  }, [particleCount, primaryColor])
  
  // Store initial positions for animation
  const initialPositions = useRef(positions.slice())
  
  // Animate particles
  useFrame((state) => {
    if (!mesh.current) return
    
    const time = state.clock.elapsedTime
    const geometry = mesh.current.geometry
    const positionAttribute = geometry.attributes.position
    const colorAttribute = geometry.attributes.color
    
    // Emotion-based animation patterns
    const animationParams = {
      joy: {
        speed: 2,
        amplitude: 2,
        pattern: 'bounce'
      },
      sadness: {
        speed: 0.5,
        amplitude: 0.5,
        pattern: 'drift'
      },
      energy: {
        speed: 3,
        amplitude: 3,
        pattern: 'pulse'
      },
      calm: {
        speed: 1,
        amplitude: 1,
        pattern: 'wave'
      }
    }
    
    const params = animationParams[emotion] || animationParams.calm
    
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3
      const baseX = initialPositions.current[i3]
      const baseY = initialPositions.current[i3 + 1]
      const baseZ = initialPositions.current[i3 + 2]
      
      // Apply animation based on pattern
      switch (params.pattern) {
        case 'bounce':
          positionAttribute.array[i3 + 1] = baseY + Math.sin(time * params.speed + i * 0.1) * params.amplitude * visualIntensity
          break
        case 'drift':
          positionAttribute.array[i3] = baseX + Math.sin(time * params.speed * 0.3 + i * 0.05) * params.amplitude
          positionAttribute.array[i3 + 1] = baseY + Math.cos(time * params.speed * 0.2 + i * 0.05) * params.amplitude
          break
        case 'pulse':
          const scale = 1 + Math.sin(time * params.speed + i * 0.1) * 0.5 * visualIntensity
          positionAttribute.array[i3] = baseX * scale
          positionAttribute.array[i3 + 1] = baseY * scale
          positionAttribute.array[i3 + 2] = baseZ * scale
          break
        case 'wave':
          positionAttribute.array[i3 + 1] = baseY + Math.sin(time * params.speed + baseX * 0.5) * params.amplitude
          break
      }
      
      // React to audio input
      if (volume > 0.1) {
        const audioImpact = volume * 2
        positionAttribute.array[i3] += (Math.random() - 0.5) * audioImpact
        positionAttribute.array[i3 + 1] += (Math.random() - 0.5) * audioImpact
        positionAttribute.array[i3 + 2] += (Math.random() - 0.5) * audioImpact
      }
      
      // Update colors based on intensity
      colorAttribute.array[i3] = primaryColor[0] + Math.sin(time + i) * 0.1 * visualIntensity
      colorAttribute.array[i3 + 1] = primaryColor[1] + Math.cos(time + i) * 0.1 * visualIntensity
      colorAttribute.array[i3 + 2] = primaryColor[2] + Math.sin(time * 0.5 + i) * 0.1 * visualIntensity
    }
    
    positionAttribute.needsUpdate = true
    colorAttribute.needsUpdate = true
    
    // Rotate the entire field
    mesh.current.rotation.y = time * 0.1
    mesh.current.rotation.x = Math.sin(time * 0.2) * 0.1
  })
  
  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={particleCount}
          array={colors}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-scale"
          count={particleCount}
          array={scales}
          itemSize={1}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.15}
        vertexColors
        transparent
        opacity={0.8}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  )
}

export default ParticleField