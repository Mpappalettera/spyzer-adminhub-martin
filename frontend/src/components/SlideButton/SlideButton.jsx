import React, { useRef, useState } from 'react'
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { Check, X } from 'lucide-react'
import LottieModule from 'lottie-react'
import pdfLottie from '@/assets/lottie/Pdf.json'
import styles from './SlideButton.module.css'

const Lottie = LottieModule.default || LottieModule

const DRAG_CONSTRAINTS = { left: 0, right: 232 }
const DRAG_THRESHOLD = 0.85

export function SlideButton({ onComplete }) {
  const [isDragging, setIsDragging] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [status, setStatus] = useState('idle')
  const lottieRef = useRef(null)

  const dragX = useMotionValue(0)
  const springX = useSpring(dragX, { stiffness: 400, damping: 40, mass: 0.8 })
  const dragProgress = useTransform(springX, [0, DRAG_CONSTRAINTS.right], [0, 1])
  
  const adjustedWidth = useTransform(springX, x => x + 44)

  const handleDragStart = () => {
    if (completed) return
    setIsDragging(true)
    lottieRef.current?.play()
  }

  const handleDragEnd = () => {
    if (completed) return
    setIsDragging(false)
    lottieRef.current?.stop()

    if (dragProgress.get() >= DRAG_THRESHOLD) {
      setCompleted(true)
      setStatus('loading')
      
      setTimeout(() => {
        setStatus('success')
        if (onComplete) onComplete()
        
        setTimeout(() => {
          // Iniciar animación de retorno suave
          dragX.set(0)
          setCompleted(false)
          setStatus('idle')
        }, 1500)
      }, 1500)
      
    } else {
      dragX.set(0)
    }
  }

  const handleDrag = (e, info) => {
    if (completed) return
    const newX = Math.max(0, Math.min(info.offset.x, DRAG_CONSTRAINTS.right))
    dragX.set(newX)
  }

  return (
    <motion.div
      className={styles.track}
      animate={{ width: completed ? 140 : 280 }}
      transition={{ type: 'spring', stiffness: 400, damping: 40 }}
    >
      <motion.span 
        className={styles.trackText}
        animate={{ opacity: completed ? 0 : 1 }}
        transition={{ duration: 0.2 }}
      >
        Desliza para exportar PDF
      </motion.span>
      
      <motion.div
        style={{ width: adjustedWidth }}
        className={styles.fill}
        animate={{ opacity: completed ? 0 : 1 }}
        transition={{ duration: 0.2 }}
      />
      
      <motion.div
        drag={completed ? false : "x"}
        dragConstraints={DRAG_CONSTRAINTS}
        dragElastic={0.05}
        dragMomentum={false}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDrag={handleDrag}
        style={{ x: springX }}
        className={styles.handleWrapper}
        animate={{ opacity: completed ? 0 : 1 }}
        transition={{ duration: 0.2 }}
      >
        <motion.div 
          className={styles.handle}
          animate={{ scale: isDragging ? 1.05 : 1 }}
        >
          <Lottie
            lottieRef={lottieRef}
            animationData={pdfLottie}
            loop={true}
            autoplay={false}
            style={{ width: 24, height: 24 }}
          />
        </motion.div>
      </motion.div>

      <AnimatePresence>
        {completed && (
          <motion.div
            className={styles.completedState}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {status === 'loading' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <div className={styles.loader}></div>
              </motion.div>
            )}
            {status === 'success' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <Check size={24} color="#1C1B1B" />
              </motion.div>
            )}
            {status === 'error' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <X size={24} color="#1C1B1B" />
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
