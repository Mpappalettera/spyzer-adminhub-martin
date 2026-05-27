import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, CheckCircle, AlertTriangle } from 'lucide-react'
import { clientService } from '@/services/clientService'
import { reviewService } from '@/services/reviewService'
import styles from './ReviewsForm.module.css'

const starDescriptions = {
  1: 'Muy insatisfecho',
  2: 'Insatisfecho',
  3: 'Normal',
  4: 'Satisfecho',
  5: 'Excelente',
}

const cardVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 15 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, scale: 0.95, y: -15, transition: { duration: 0.3 } },
}

export default function ReviewsForm() {
  const [searchParams] = useSearchParams()
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [message, setMessage] = useState('')
  const [clientName, setClientName] = useState('')
  const [viewState, setViewState] = useState('loading') // loading, form, success, error
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Email state & lookup variables
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState('')
  const [resolvedUserId, setResolvedUserId] = useState(null)
  const [isResolvingEmail, setIsResolvingEmail] = useState(false)

  const emailParam = searchParams.get('email') || ''

  const checkEmail = async (emailVal) => {
    const trimmedEmail = emailVal.trim()
    if (!trimmedEmail) {
      setResolvedUserId(null)
      setClientName('')
      setEmailError('')
      return
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(trimmedEmail)) {
      setEmailError('Introduce un correo electrónico válido.')
      setResolvedUserId(null)
      setClientName('')
      return
    }

    setIsResolvingEmail(true)
    setEmailError('')
    try {
      const user = await clientService.getClientById(trimmedEmail)
      if (user && user.id) {
        setResolvedUserId(user.id)
        setClientName(`${user.nombre} ${user.apellido || ''}`.trim())
        setEmailError('')
      } else {
        setResolvedUserId(null)
        setClientName('')
        setEmailError('Este correo electrónico no está registrado en Spyzer.')
      }
    } catch (err) {
      console.error('Error resolving email:', err)
      setResolvedUserId(null)
      setClientName('')
      setEmailError('Error al verificar el correo. Inténtalo de nuevo.')
    } finally {
      setIsResolvingEmail(false)
    }
  }

  useEffect(() => {
    let isMounted = true
    
    async function initForm() {
      if (emailParam) {
        setViewState('loading')
        setEmail(emailParam)
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (emailRegex.test(emailParam.trim())) {
          try {
            const user = await clientService.getClientById(emailParam.trim())
            if (isMounted) {
              if (user && user.id) {
                setResolvedUserId(user.id)
                setClientName(`${user.nombre} ${user.apellido || ''}`.trim())
              } else {
                setEmailError('Este correo electrónico no está registrado en Spyzer.')
              }
              setViewState('form')
            }
          } catch (error) {
            console.error('Error auto-resolving client email:', error)
            if (isMounted) {
              setEmailError('Error al verificar el correo. Inténtalo de nuevo.')
              setViewState('form')
            }
          }
        } else {
          if (isMounted) {
            setEmailError('Introduce un correo electrónico válido.')
            setViewState('form')
          }
        }
      } else {
        if (isMounted) {
          setViewState('form')
        }
      }
    }

    initForm()
    return () => { isMounted = false }
  }, [emailParam])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (rating === 0 || !resolvedUserId || isSubmitting) return

    setIsSubmitting(true)
    try {
      // Map user fields to DTO expected keys: usuarioId, calificacionEstrellas, comentario, fecha
      const reviewPayload = {
        usuarioId: resolvedUserId,
        calificacionEstrellas: rating,
        comentario: message.trim(),
        fecha: new Date().toISOString()
      }

      await reviewService.createReview(reviewPayload)
      setViewState('success')
    } catch (error) {
      console.error('Error submitting review:', error)
      setViewState('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRetry = () => {
    setRating(0)
    setHoveredRating(0)
    setMessage('')
    setViewState('form')
  }

  return (
    <div className={styles.container}>
      <AnimatePresence mode="wait">
        {viewState === 'loading' && (
          <motion.div 
            key="loading" 
            className={styles.card}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div className={styles.spinner} />
            <div className={styles.loadingText}>Cargando formulario de valoración...</div>
          </motion.div>
        )}

        {viewState === 'form' && (
          <motion.div 
            key="form" 
            className={styles.card}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div className={styles.logo}>Spyzer</div>
            <h2 className={styles.greeting}>
              {clientName ? `¡Hola, ${clientName.split(' ')[0]}!` : '¡Danos tu opinión!'}
            </h2>
            <p className={styles.subtitle}>
              Tu opinión nos ayuda a seguir mejorando nuestro servicio todos los días.
            </p>

            <form onSubmit={handleSubmit} style={{ width: '100%' }}>
              {/* Email Verification Group */}
              <div className={styles.inputGroup}>
                <span className={styles.label}>Correo electrónico</span>
                <div style={{ position: 'relative', width: '100%' }}>
                  <input
                    type="email"
                    className={`${styles.input} ${emailError ? styles.inputError : ''}`}
                    placeholder="ejemplo@correo.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      if (emailError) setEmailError('')
                    }}
                    onBlur={(e) => checkEmail(e.target.value)}
                    disabled={isSubmitting}
                    required
                  />
                  {isResolvingEmail && (
                    <div className={styles.inputSpinner} />
                  )}
                </div>
                {emailError && (
                  <span className={styles.errorMessage}>{emailError}</span>
                )}
                {resolvedUserId && (
                  <span className={styles.successMessage}>
                    ✓ Cuenta verificada: {clientName}
                  </span>
                )}
              </div>

              {/* Message Group */}
              <div className={styles.messageGroup}>
                <span className={styles.label}>Mensaje (Opcional)</span>
                <textarea
                  className={styles.textarea}
                  placeholder="Cuéntanos en detalle tu experiencia..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  maxLength={500}
                />
              </div>

              {/* Star Selection Group */}
              <div className={styles.ratingGroup}>
                <span className={styles.label}>Puntuación</span>
                <div className={styles.starsContainer}>
                  {[1, 2, 3, 4, 5].map((index) => {
                    const isFilled = hoveredRating === 0 ? index <= rating : index <= hoveredRating
                    const isHoveredState = hoveredRating > 0 && index <= hoveredRating

                    return (
                      <button
                        key={index}
                        type="button"
                        className={styles.starButton}
                        onClick={() => setRating(index)}
                        onMouseEnter={() => setHoveredRating(index)}
                        onMouseLeave={() => setHoveredRating(0)}
                        aria-label={`Puntuar con ${index} estrellas`}
                      >
                        <Star
                          size={32}
                          className={`${styles.starIcon} ${
                            isHoveredState 
                              ? styles.starHovered 
                              : isFilled 
                                ? styles.starFilled 
                                : ''
                          }`}
                        />
                      </button>
                    )
                  })}
                </div>
                <div className={styles.starFeedback}>
                  {(hoveredRating || rating) ? starDescriptions[hoveredRating || rating] : ''}
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                className={styles.submitBtn}
                disabled={rating === 0 || !resolvedUserId || isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className={styles.spinner} style={{ width: 16, height: 16, borderLeftColor: 'var(--on-primary)' }} />
                    <span>Enviando...</span>
                  </>
                ) : (
                  <span>Enviar valoración</span>
                )}
              </button>
            </form>
          </motion.div>
        )}

        {viewState === 'success' && (
          <motion.div 
            key="success" 
            className={styles.card}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <CheckCircle size={56} className={styles.successIcon} />
            <h2 className={styles.greeting}>
              ¡Muchas gracias{clientName ? `, ${clientName.split(' ')[0]}` : ''}!
            </h2>
            <p className={styles.subtitle} style={{ marginBottom: 0 }}>
              Tu reseña de {rating} ★ se ha guardado correctamente. Valoramos profundamente tu tiempo y tus comentarios.
            </p>
          </motion.div>
        )}

        {viewState === 'error' && (
          <motion.div 
            key="error" 
            className={styles.card}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <AlertTriangle size={56} className={styles.errorIcon} />
            <h2 className={styles.greeting}>Hubo un problema</h2>
            <p className={styles.subtitle}>
              No pudimos procesar tu valoración en este momento. Por favor, inténtalo de nuevo.
            </p>
            <button type="button" className={styles.retryBtn} onClick={handleRetry}>
              Reintentar
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
