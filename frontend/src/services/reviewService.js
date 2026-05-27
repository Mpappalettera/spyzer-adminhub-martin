import { request, USE_MOCKS } from './api'
import { reviews, reviewStats } from '@/mocks/reviews'

export const reviewService = {
  async getReviews() {
    if (USE_MOCKS) {
      return reviews
    }
    
    // Obtener reviews y usuarios en paralelo para poder mostrar los nombres reales
    const [rawReviews, rawClients] = await Promise.all([
      request('/reviews'),
      request('/usuarios')
    ])

    const clientMap = {}
    rawClients.forEach(c => {
      clientMap[c.id] = `${c.nombre} ${c.apellido}`
    })

    return rawReviews.map(r => {
      // Convertir sentimiento de IA al formato esperado por los estilos CSS del front
      let sentimientoIa = 'neutral'
      if (r.sentimientoIa) {
        const s = r.sentimientoIa.toUpperCase()
        if (s === 'POSITIVO' || s === 'POSITIVE') sentimientoIa = 'positive'
        else if (s === 'NEGATIVO' || s === 'NEGATIVE') sentimientoIa = 'negative'
      }

      return {
        ...r,
        userName: clientMap[r.usuarioId] || 'Usuario Anónimo',
        sentimientoIa,
        timeAgo: r.fecha ? new Date(r.fecha).toLocaleDateString('es-ES') : ''
      }
    })
  },

  async getReviewStats() {
    if (USE_MOCKS) {
      return reviewStats
    }
    const data = await request('/stats/reviews')
    return {
      averageRating: data.notaPromedio || 0,
      totalReviews: data.desglosePorSentimiento ? Object.values(data.desglosePorSentimiento).reduce((acc, val) => acc + val, 0) : 0,
      sentiment: {
        positive: data.desglosePorSentimiento?.POSITIVO || data.desglosePorSentimiento?.positive || 0,
        neutral: data.desglosePorSentimiento?.NEUTRO || data.desglosePorSentimiento?.neutral || 0,
        negative: data.desglosePorSentimiento?.NEGATIVO || data.desglosePorSentimiento?.negative || 0,
      }
    }
  },

  async createReview(reviewData) {
    if (USE_MOCKS) {
      const newReview = {
        id: reviews.length + 1,
        ...reviewData,
        sentimientoIa: 'positive',
        fecha: new Date().toISOString(),
      }
      reviews.unshift(newReview)
      return newReview
    }
    return request('/reviews', {
      method: 'POST',
      body: JSON.stringify(reviewData),
    })
  },
}
