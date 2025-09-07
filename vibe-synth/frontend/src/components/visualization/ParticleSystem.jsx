import { useRef, useEffect, useState } from 'react'
import { motion } from 'framer-motion'

const ParticleSystem = ({ 
  audioData, 
  isActive = false, 
  emotionState = 'neutral',
  className = '',
  particleCount = 50 
}) => {
  const canvasRef = useRef(null)
  const particlesRef = useRef([])
  const animationFrameRef = useRef(null)
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 })
  
  // Emotion-based color palettes
  const emotionColors = {
    excited: ['#FFD700', '#FF6B35', '#FF8E53'],
    happy: ['#FFA500', '#FFB347', '#FFCCCB'],
    calm: ['#87CEEB', '#B0E0E6', '#E0F6FF'],
    peaceful: ['#98FB98', '#90EE90', '#F0FFF0'],
    energetic: ['#FF4500', '#FF6347', '#FFB6C1'],
    content: ['#DDA0DD', '#E6E6FA', '#F0E68C'],
    neutral: ['#C0C0C0', '#D3D3D3', '#E5E5E5']
  }
  
  // Particle class
  class Particle {
    constructor(x, y, emotion = 'neutral') {
      this.x = x
      this.y = y
      this.originalX = x
      this.originalY = y
      this.vx = (Math.random() - 0.5) * 2
      this.vy = (Math.random() - 0.5) * 2
      this.size = Math.random() * 4 + 2
      this.originalSize = this.size
      this.life = 1.0
      this.maxLife = Math.random() * 200 + 100
      this.age = 0
      this.color = this.getEmotionColor(emotion)
      this.emotion = emotion
      this.frequency = Math.random() * 0.02 + 0.01
      this.amplitude = Math.random() * 50 + 25
    }
    
    getEmotionColor(emotion) {
      const colors = emotionColors[emotion] || emotionColors.neutral
      return colors[Math.floor(Math.random() * colors.length)]
    }
    
    update(audioMetrics = {}) {
      this.age++
      
      // Audio reactivity
      const volume = audioMetrics.volume || 0
      const emotionalIntensity = audioMetrics.emotionalIntensity || 0
      
      // Movement influenced by audio
      this.vx += (Math.random() - 0.5) * 0.1 * (1 + volume)
      this.vy += (Math.random() - 0.5) * 0.1 * (1 + volume)
      
      // Apply some drag
      this.vx *= 0.98
      this.vy *= 0.98
      
      // Sine wave movement for organic feel
      this.x += this.vx + Math.sin(this.age * this.frequency) * this.amplitude * 0.01
      this.y += this.vy + Math.cos(this.age * this.frequency * 0.7) * this.amplitude * 0.01
      
      // Size pulsing based on audio
      this.size = this.originalSize * (1 + Math.sin(this.age * 0.05) * 0.3 + volume * 0.5)
      
      // Life cycle
      if (this.age > this.maxLife) {
        this.life = Math.max(0, this.life - 0.02)
      }
      
      // Emotional intensity affects behavior
      if (emotionalIntensity > 0.7) {
        // High intensity: more erratic movement
        this.vx += (Math.random() - 0.5) * 0.5
        this.vy += (Math.random() - 0.5) * 0.5
        this.size *= 1.2
      } else if (emotionalIntensity < 0.3) {
        // Low intensity: calmer movement
        this.vx *= 0.95
        this.vy *= 0.95
      }
      
      // Boundary wrapping
      if (this.x < 0) this.x = canvasSize.width
      if (this.x > canvasSize.width) this.x = 0
      if (this.y < 0) this.y = canvasSize.height
      if (this.y > canvasSize.height) this.y = 0
    }
    
    draw(ctx, audioMetrics = {}) {
      const alpha = this.life
      const volume = audioMetrics.volume || 0
      
      ctx.save()
      
      // Glow effect for high volume
      if (volume > 0.5) {
        ctx.shadowColor = this.color
        ctx.shadowBlur = this.size * 2
      }
      
      // Draw particle with emotion-based styling
      ctx.globalAlpha = alpha * (0.6 + volume * 0.4)
      ctx.fillStyle = this.color
      
      if (this.emotion === 'excited' || this.emotion === 'energetic') {
        // Spiky particles for high energy emotions
        this.drawStar(ctx, this.x, this.y, this.size)
      } else if (this.emotion === 'calm' || this.emotion === 'peaceful') {
        // Soft circles for calm emotions
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
        ctx.fill()
      } else {
        // Default circle with some variation
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size * (0.8 + Math.sin(this.age * 0.1) * 0.2), 0, Math.PI * 2)
        ctx.fill()
      }
      
      ctx.restore()
    }
    
    drawStar(ctx, x, y, size) {
      const spikes = 5
      const outerRadius = size
      const innerRadius = size * 0.5
      
      ctx.beginPath()
      for (let i = 0; i < spikes * 2; i++) {
        const radius = i % 2 === 0 ? outerRadius : innerRadius
        const angle = (i * Math.PI) / spikes
        const px = x + Math.cos(angle) * radius
        const py = y + Math.sin(angle) * radius
        
        if (i === 0) ctx.moveTo(px, py)
        else ctx.lineTo(px, py)
      }
      ctx.closePath()
      ctx.fill()
    }
    
    isDead() {
      return this.life <= 0
    }
  }
  
  // Initialize particles
  const initializeParticles = () => {
    particlesRef.current = []
    for (let i = 0; i < particleCount; i++) {
      const x = Math.random() * canvasSize.width
      const y = Math.random() * canvasSize.height
      particlesRef.current.push(new Particle(x, y, emotionState))
    }
  }
  
  // Animation loop
  const animate = () => {
    if (!canvasRef.current) return
    
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    
    // Clear canvas with subtle fade effect
    ctx.fillStyle = 'rgba(17, 24, 39, 0.1)' // Dark overlay for trail effect
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    // Update and draw particles
    particlesRef.current.forEach((particle, index) => {
      particle.update(audioData?.metrics)
      particle.draw(ctx, audioData?.metrics)
      
      // Remove dead particles
      if (particle.isDead()) {
        particlesRef.current.splice(index, 1)
      }
    })
    
    // Add new particles if needed
    while (particlesRef.current.length < particleCount && isActive) {
      const x = Math.random() * canvasSize.width
      const y = Math.random() * canvasSize.height
      particlesRef.current.push(new Particle(x, y, emotionState))
    }
    
    // Draw connections between nearby particles
    if (audioData?.metrics?.emotionalIntensity > 0.5) {
      drawConnections(ctx)
    }
    
    if (isActive) {
      animationFrameRef.current = requestAnimationFrame(animate)
    }
  }
  
  // Draw connections between nearby particles
  const drawConnections = (ctx) => {
    const maxDistance = 100
    const particles = particlesRef.current
    
    ctx.strokeStyle = emotionColors[emotionState][0] + '20' // Semi-transparent
    ctx.lineWidth = 1
    
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x
        const dy = particles[i].y - particles[j].y
        const distance = Math.sqrt(dx * dx + dy * dy)
        
        if (distance < maxDistance) {
          const alpha = 1 - (distance / maxDistance)
          ctx.globalAlpha = alpha * 0.3
          
          ctx.beginPath()
          ctx.moveTo(particles[i].x, particles[i].y)
          ctx.lineTo(particles[j].x, particles[j].y)
          ctx.stroke()
        }
      }
    }
    
    ctx.globalAlpha = 1
  }
  
  // Handle canvas resize
  const handleResize = () => {
    if (!canvasRef.current) return
    
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    
    // Set actual size in memory (scaled to account for extra pixel density)
    const scale = window.devicePixelRatio || 1
    canvas.width = rect.width * scale
    canvas.height = rect.height * scale
    
    // Scale the drawing context so everything draws at the correct size
    const ctx = canvas.getContext('2d')
    ctx.scale(scale, scale)
    
    // Set display size
    canvas.style.width = rect.width + 'px'
    canvas.style.height = rect.height + 'px'
    
    setCanvasSize({ width: rect.width, height: rect.height })
  }
  
  // Effects
  useEffect(() => {
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])
  
  useEffect(() => {
    initializeParticles()
  }, [emotionState, particleCount, canvasSize])
  
  useEffect(() => {
    if (isActive) {
      animate()
    } else {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [isActive])
  
  // Update particle emotions when emotion state changes
  useEffect(() => {
    particlesRef.current.forEach(particle => {
      particle.emotion = emotionState
      particle.color = particle.getEmotionColor(emotionState)
    })
  }, [emotionState])
  
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ background: 'transparent' }}
      />
      
      {/* Emotion indicator */}
      {isActive && (
        <motion.div
          className="absolute top-4 left-4 bg-black/20 backdrop-blur-sm px-3 py-1 rounded-full"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
        >
          <span className="text-sm text-white/80 capitalize">
            {emotionState} vibes
          </span>
        </motion.div>
      )}
      
      {/* Audio intensity indicator */}
      {isActive && audioData?.metrics?.emotionalIntensity > 0.3 && (
        <motion.div
          className="absolute top-4 right-4 bg-black/20 backdrop-blur-sm px-3 py-1 rounded-full"
          animate={{ 
            scale: [1, 1 + audioData.metrics.emotionalIntensity * 0.2, 1] 
          }}
          transition={{ duration: 0.5, repeat: Infinity }}
        >
          <span className="text-sm text-white/80">
            🎵 {Math.round(audioData.metrics.emotionalIntensity * 100)}%
          </span>
        </motion.div>
      )}
    </div>
  )
}

export default ParticleSystem