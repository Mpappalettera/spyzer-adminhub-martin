import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Star, Flag } from 'lucide-react'
import { Card } from '@/components/Card/Card'
import { reviewService } from '@/services/reviewService'
import WheelPagination from '@/components/WheelPagination/WheelPagination'
import styles from './Reviews.module.css'

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
}

const slideUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
}

const filters = ['Todas', '5 ★', '4 ★', '3 ★', '2 ★', '1 ★']

function StarRating({ rating, size = 16 }) {
  return (
    <div className={styles.stars}>
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={size}
          className={s <= rating ? styles.starFilled : styles.starEmpty}
          fill={s <= rating ? 'currentColor' : 'none'}
        />
      ))}
    </div>
  )
}

export default function Reviews() {
  const [activeFilter, setActiveFilter] = useState('Todas')
  const [showFlagged, setShowFlagged] = useState(false)
  const [listadoReviews, setListadoReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(0)

  const ITEMS_PER_PAGE = 5

  useEffect(() => {
    let isMounted = true
    async function loadReviewsData() {
      try {
        const r = await reviewService.getReviews()
        if (isMounted) {
          setListadoReviews(r)
          setLoading(false)
        }
      } catch (error) {
        console.error('Error cargando los datos de las reviews:', error)
      }
    }

    loadReviewsData()
    return () => { isMounted = false }
  }, [])

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px', color: 'var(--outline)', fontSize: 'var(--body-lg-size)' }}>
        Cargando valoraciones y análisis de sentimiento...
      </div>
    )
  }

  // Cálculos dinámicos
  const totalReviews = listadoReviews.length
  const positive = listadoReviews.filter(r => r.sentimientoIa === 'positive').length
  const neutral = listadoReviews.filter(r => r.sentimientoIa === 'neutral').length
  const negative = listadoReviews.filter(r => r.sentimientoIa === 'negative').length
  
  const averageRating = totalReviews > 0 
    ? (listadoReviews.reduce((acc, r) => acc + r.calificacionEstrellas, 0) / totalReviews).toFixed(2)
    : 0

  const filteredReviews = listadoReviews.filter((r) => {
    if (showFlagged) return r.flagged
    if (activeFilter === 'Todas') return true
    const starNum = parseInt(activeFilter)
    return r.calificacionEstrellas === starNum
  }).sort((a, b) => new Date(b.fecha) - new Date(a.fecha))

  const totalPages = Math.ceil(filteredReviews.length / ITEMS_PER_PAGE)
  const paginatedReviews = filteredReviews.slice(currentPage * ITEMS_PER_PAGE, (currentPage + 1) * ITEMS_PER_PAGE)

  return (
    <motion.div initial="hidden" animate="show" variants={stagger}>
      <motion.h1 className={styles.pageTitle} variants={slideUp}>Valoraciones de la App</motion.h1>

      {/* Filters */}
      <motion.div className={styles.filters} variants={slideUp}>
        {filters.map((f) => (
          <button
            key={f}
            className={activeFilter === f && !showFlagged ? styles.filterPillActive : styles.filterPill}
            onClick={() => { setActiveFilter(f); setShowFlagged(false); setCurrentPage(0); }}
          >
            {f}
          </button>
        ))}
        <button
          className={`${showFlagged ? styles.filterPillActive : styles.filterPillFlagged}`}
          onClick={() => { setShowFlagged(!showFlagged); setCurrentPage(0); }}
        >
          <Flag size={14} />
          Reportadas
        </button>
      </motion.div>

      <div className={styles.contentGrid}>
        {/* Review Cards */}
        <motion.div className={styles.reviewList} variants={stagger}>
          {paginatedReviews.map((review) => (
            <motion.div key={review.id} variants={slideUp}>
              <Card className={styles.reviewCard}>
                <div className={styles.reviewHeader}>
                  <div className={styles.reviewAvatar}>
                    {(review.userName || (review.usuario ? `${review.usuario.nombre} ${review.usuario.apellido}` : 'Usuario Anónimo')).split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                  </div>
                  <div className={styles.reviewInfo}>
                    <div>
                      <span className={styles.reviewName}>{review.userName || (review.usuario ? `${review.usuario.nombre} ${review.usuario.apellido}` : 'Usuario Anónimo')}</span>
                      <span className={styles.reviewTime}>{review.timeAgo || (review.fecha ? new Date(review.fecha).toLocaleDateString() : '')}</span>
                      
                      {review.sentimientoIa && (
                        <span className={styles.sentimentBadge} style={{
                          backgroundColor: review.sentimientoIa === 'positive' ? 'rgba(63, 185, 80, 0.15)' : 
                                         review.sentimientoIa === 'negative' ? 'rgba(248, 81, 73, 0.15)' : 
                                         'rgba(139, 148, 158, 0.15)',
                          color: review.sentimientoIa === 'positive' ? 'var(--accent-green)' : 
                                 review.sentimientoIa === 'negative' ? 'var(--accent-red)' : 
                                 'var(--text-secondary)',
                          padding: '2px 8px',
                          borderRadius: '12px',
                          fontSize: '11px',
                          fontWeight: '600',
                          marginLeft: '8px',
                          textTransform: 'uppercase'
                        }}>
                          {review.sentimientoIa === 'positive' ? 'Positivo' : 
                           review.sentimientoIa === 'negative' ? 'Negativo' : 'Neutral'}
                        </span>
                      )}
                    </div>
                    <StarRating rating={review.calificacionEstrellas} />
                  </div>
                </div>
                <p className={styles.reviewText}>{review.comentario}</p>
              </Card>
            </motion.div>
          ))}
          {totalPages > 1 && (
            <WheelPagination 
              key={`${activeFilter}-${showFlagged}`}
              totalPages={totalPages} 
              onChange={setCurrentPage} 
            />
          )}
        </motion.div>

        {/* Stats Sidebar */}
        <motion.div className={styles.statsPanel} variants={slideUp}>
          <Card>
            <span className="label-caps" style={{ color: 'var(--on-surface-variant)' }}>
              VALORACIÓN MEDIA
            </span>
            <div className={styles.avgRating}>
              <span className={styles.avgRatingValue}>{averageRating}</span>
              <div className={styles.avgRatingStars}>
                <StarRating rating={Math.round(averageRating)} />
              </div>
            </div>
            <span className={styles.avgRatingCount}>
              Basado en {totalReviews.toLocaleString()} valoraciones
            </span>
          </Card>

          <Card>
            <span className="label-caps" style={{ color: 'var(--on-surface-variant)', marginBottom: 'var(--space-md)', display: 'block' }}>
              ANÁLISIS DE SENTIMIENTO
            </span>
            {[
              { label: 'Positivo', count: positive, cls: styles.sentimentPositive, color: 'var(--gain)' },
              { label: 'Neutral', count: neutral, cls: styles.sentimentNeutral, color: 'var(--primary)' },
              { label: 'Negativo', count: negative, cls: styles.sentimentNegative, color: 'var(--loss)' },
            ].map((s) => {
              const percentage = totalReviews > 0 ? Math.round((s.count / totalReviews) * 100) : 0;
              return (
                <div key={s.label} className={styles.sentimentRow}>
                  <span className={`${styles.sentimentLabel} ${s.cls}`}>{s.label}</span>
                  <div className={styles.sentimentBar}>
                    <div className={styles.sentimentFill} style={{ width: `${percentage}%`, backgroundColor: s.color }} />
                  </div>
                  <span className={styles.sentimentValue}>{s.count} ({percentage}%)</span>
                </div>
              );
            })}
          </Card>
        </motion.div>
      </div>
    </motion.div>
  )
}
