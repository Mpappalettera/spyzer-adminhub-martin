import { useState, useEffect } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'
import styles from './RadialProgress.module.css'

const RING_CONFIG = [
  { r: 85, strokeWidth: 14 },
  { r: 64, strokeWidth: 12 },
  { r: 45, strokeWidth: 10 },
]

export default function RadialProgress({ rings, centerValue, tooltip, label = "Total" }) {
  const [displayValue, setDisplayValue] = useState(0)
  const [activeTooltip, setActiveTooltip] = useState(tooltip)
  const [hoveredRing, setHoveredRing] = useState(null)

  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  
  const springX = useSpring(mouseX, { stiffness: 100, damping: 15, mass: 0.5 })
  const springY = useSpring(mouseY, { stiffness: 100, damping: 15, mass: 0.5 })

  // Animated counter for the center value
  useEffect(() => {
    let startTime
    const duration = 800

    const step = (timestamp) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress)
      setDisplayValue(Math.floor(ease * centerValue))

      if (progress < 1) {
        requestAnimationFrame(step)
      }
    }

    requestAnimationFrame(step)
  }, [centerValue])

  const handleMouseEnter = (ringData, index) => {
    setHoveredRing(index)
    setActiveTooltip({
      primary: ringData.value.toString(),
      secondary: `${ringData.label || 'Total'}: ${ringData.max}`,
    })
  }

  const handleMouseLeave = () => {
    setHoveredRing(null)
  }

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    mouseX.set(e.clientX - rect.left + 15)
    mouseY.set(e.clientY - rect.top + 15)
  }

  return (
    <div 
      className={styles.container}
      role="img"
      aria-label={`Gráfico radial: ${rings.map(r => `${r.value} de ${r.max}`).join(', ')}`}
      onMouseMove={handleMouseMove}
    >
      <svg 
        className={styles.svg} 
        viewBox="0 0 200 200" 
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Grupos rotados para empezar a las 10h (-150deg) */}
        <g transform="translate(100, 100) rotate(-150)">
          {/* Background tracks */}
          {rings.map((ring, i) => {
            const config = RING_CONFIG[i]
            return (
              <circle
                key={`track-${i}`}
                cx="0"
                cy="0"
                r={config.r}
                className={styles.track}
                strokeWidth={config.strokeWidth}
              />
            )
          })}

          {/* Progress rings */}
          {rings.map((ring, i) => {
            const config = RING_CONFIG[i]
            const circumference = 2 * Math.PI * config.r
            const percent = Math.min(Math.max(ring.value / ring.max, 0), 1)
            const targetOffset = circumference - percent * circumference
            const isHovered = hoveredRing === i
            const strokeWidth = isHovered ? config.strokeWidth + 2 : config.strokeWidth

            return (
              <motion.circle
                key={`progress-${i}`}
                cx="0"
                cy="0"
                r={config.r}
                className={styles.ring}
                stroke={ring.color}
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: targetOffset }}
                transition={{ duration: 1, delay: i * 0.15, ease: [0.22, 1, 0.36, 1] }}
                onMouseEnter={() => handleMouseEnter(ring, i)}
                onMouseLeave={handleMouseLeave}
              />
            )
          })}
        </g>
      </svg>

      <div className={styles.centerValue}>
        <span className={styles.number}>{displayValue}</span>
        <span className={styles.label}>{label}</span>
      </div>

      {/* Flotante Tooltip */}
      <motion.div 
        className={styles.tooltip}
        style={{ x: springX, y: springY }}
        initial={{ opacity: 0 }}
        animate={{ opacity: hoveredRing !== null ? 1 : 0 }}
        transition={{ opacity: { duration: 0.2 } }}
      >
        <span className={styles.tooltipPrimary}>{activeTooltip.primary}</span>
        <span className={styles.tooltipSecondary}>{activeTooltip.secondary}</span>
      </motion.div>
    </div>
  )
}
