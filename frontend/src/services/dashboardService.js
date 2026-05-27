import { request, USE_MOCKS } from './api'
import { recentActivity, registrationData, dashboardMetrics, riskDistribution } from '@/mocks/dashboard'

export const dashboardService = {
  async getDashboardMetrics() {
    if (USE_MOCKS) {
      return dashboardMetrics
    }
    return request('/stats/kpis')
  },

  async getRiskDistribution() {
    if (USE_MOCKS) {
      return riskDistribution
    }
    return request('/stats/instrumentos')
  },

  async getRecentActivity() {
    if (USE_MOCKS) {
      return {
        totalOperaciones: recentActivity.length,
        volumenPorMoneda: [
          { moneda: 'USD', volumen: 450000 },
          { moneda: 'EUR', volumen: 320000 },
        ],
        calculatedDesde: new Date().toISOString(),
        recentActivity: recentActivity,
      }
    }
    
    // Obtener en paralelo el resumen 24h y los eventos recientes
    const [summary, events] = await Promise.all([
      request('/stats/actividades/ultimas-24h'),
      request('/stats/actividad-reciente')
    ])

    // Mapear los eventos al formato esperado por el frontend
    const mappedEvents = events.map((ev, index) => {
      let type = 'system'
      if (ev.tipoEvento === 'TRADING') type = 'trade'
      else if (ev.tipoEvento === 'USUARIO') type = 'registration'
      else if (ev.tipoEvento === 'CAMPANA') type = 'email'
      else if (ev.tipoEvento === 'REVIEW') type = 'review'

      // Formatear fecha amigable/relativa
      const date = new Date(ev.fecha)
      const diffMs = new Date() - date
      const diffMins = Math.floor(diffMs / 60000)
      const diffHrs = Math.floor(diffMs / 3600000)
      const diffDays = Math.floor(diffMs / 86400000)

      let timeStr = ''
      if (diffMins < 1) timeStr = 'ahora mismo'
      else if (diffMins < 60) timeStr = `hace ${diffMins} min`
      else if (diffHrs < 24) timeStr = `hace ${diffHrs} ${diffHrs === 1 ? 'hora' : 'horas'}`
      else timeStr = `hace ${diffDays} ${diffDays === 1 ? 'día' : 'días'}`

      return {
        id: index + 1,
        type,
        user: ev.tipoEvento === 'TRADING' ? 'Trading Client' : 'Sistema',
        description: (ev.description || ev.descripcion || '').replace(/(\d+\.\d+)/g, (match) => {
          return new Intl.NumberFormat('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(parseFloat(match));
        }),
        time: timeStr
      }
    })

    return {
      totalOperaciones: summary.totalOperaciones,
      volumenPorMoneda: (summary.volumenPorMoneda || []).map(v => ({
        moneda: v.instrumento,
        volumen: v.volumenTotal
      })),
      calculatedDesde: summary.calculadoDesde,
      recentActivity: mappedEvents
    }
  },

  async getRegistrationsByMonth() {
    if (USE_MOCKS) {
      return registrationData
    }
    const raw = await request('/stats/usuarios/por-mes')
    // El frontend espera { date: 'YYYY-MM-DD', registrations: cantidad }
    return raw.map(item => ({
      date: `${item.anio}-${String(item.mes).padStart(2, '0')}-01`,
      registrations: item.totalUsuarios
    }))
  },

  async exportDashboardPdf() {
    if (USE_MOCKS) {
      return new Blob(['Reporte Mock PDF'], { type: 'application/pdf' })
    }
    return request('/stats/export')
  },
}
