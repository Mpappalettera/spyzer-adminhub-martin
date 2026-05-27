import { request, USE_MOCKS } from './api'
import { clients } from '@/mocks/clients'

export const clientService = {
  async getClients() {
    if (USE_MOCKS) {
      return clients
    }
    const raw = await request('/usuarios')
    return raw.map(u => ({
      ...u,
      totalCapitalInvested: u.capitalTotal || 0,
      accountStatus: u.estadoUsuario === 'INACTIVO' ? 'Inactive' : (u.estadoUsuario === 'VIP' ? 'VIP' : 'Active'),
      activo: u.estadoUsuario !== 'INACTIVO',
      segmentos: u.estadoUsuario === 'VIP' ? ['Premium'] : []
    }))
  },

  async getClientById(id) {
    if (USE_MOCKS) {
      if (String(id).includes('@')) {
        return clients.find((c) => c.email.toLowerCase() === id.toLowerCase()) || null
      }
      return clients.find((c) => c.id === parseInt(id)) || clients[0]
    }

    let user
    if (String(id).includes('@')) {
      user = await request(`/usuarios/email/${id}`)
    } else {
      user = await request(`/usuarios/${id}`)
    }

    const userId = user.id
    const mappedUser = {
      ...user,
      totalCapitalInvested: user.capitalTotal || 0,
      accountStatus: user.estadoUsuario === 'INACTIVO' ? 'Inactive' : (user.estadoUsuario === 'VIP' ? 'VIP' : 'Active'),
      activo: user.estadoUsuario !== 'INACTIVO',
      segmentos: user.estadoUsuario === 'VIP' ? ['Premium'] : []
    }

    // Consultamos las métricas financieras asociadas
    const metricas = await request(`/usuarios/${userId}/metricas`).catch(() => null)

    // Mapa de colores específicos por activo/moneda
    const colors = {
      BTC: '#F7931A',
      ETH: '#627EEA',
      AAPL: '#A2AAAD',
      TSLA: '#CC0000',
      AMZN: '#FF9900',
      MSFT: '#F25022',
      SOL: '#00FFA3',
      default: '#8C90A0'
    }

    let portfolioDistribution = []
    let dineroTotal = 0
    let beneficioTotal = 0
    let inversionInicial = 0

    if (metricas) {
      inversionInicial = metricas.invertido || 0
      dineroTotal = (metricas.liquidezActual || 0) + (metricas.valorActualAcciones || 0)
      beneficioTotal = metricas.gananciaPerdida || 0

      if (metricas.distribucionCarteraPorcentaje) {
        portfolioDistribution = Object.keys(metricas.distribucionCarteraPorcentaje).map(key => ({
          name: key,
          value: metricas.distribucionCarteraPorcentaje[key],
          color: colors[key.toUpperCase()] || colors.default
        }))
      }
    }

    // Consultamos el historial de actividades asociadas
    const actividades = await request(`/usuarios/${userId}/actividades`).catch(() => [])

    // Mapeamos las actividades a la estructura de interactionHistory
    const interactionHistory = (actividades || []).map((act, index) => {
      let title = 'Evento'
      if (act.tipoEvento === 'TRADING') {
        if (act.descripcion && act.descripcion.startsWith('COMPRA')) {
          title = 'Compra'
        } else if (act.descripcion && act.descripcion.startsWith('VENTA')) {
          title = 'Venta'
        } else {
          title = 'Operación de Trading'
        }
      } else if (act.tipoEvento === 'EMAIL') {
        title = 'Campaña de Email'
      } else if (act.tipoEvento) {
        title = act.tipoEvento
      }
      return {
        id: index + 1,
        date: act.fecha ? new Date(act.fecha).toLocaleDateString('es-ES') : '',
        title,
        description: act.descripcion ? act.descripcion.replace(/(\d+\.\d+)/g, (match) => {
          return new Intl.NumberFormat('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(parseFloat(match));
        }) : act.descripcion
      }
    })

    // Agregamos el registro de la cuenta al final si no está ya registrado
    if (mappedUser.fechaRegistro) {
      interactionHistory.push({
        id: interactionHistory.length + 1,
        date: new Date(mappedUser.fechaRegistro).toLocaleDateString('es-ES'),
        title: 'Registro de Cuenta',
        description: 'El cliente se ha registrado en la plataforma Spyzer.'
      })
    }

    let dineroChange = 0;
    let beneficioChange = 0;
    try {
      if (!USE_MOCKS) {
        const historial1M = await request(`/usuarios/${userId}/historial-capital?period=1M`);
        if (historial1M && historial1M.length > 0) {
          const first = historial1M[0].capitalTotal || 0;
          const last = historial1M[historial1M.length - 1].capitalTotal || 0;
          if (first > 0) {
            dineroChange = parseFloat((((last - first) / first) * 100).toFixed(2));
          } else if (last > 0) {
            dineroChange = 100;
          }
          beneficioChange = dineroChange; // Aproximamos el cambio de beneficio al de capital
        }
      } else {
        dineroChange = 5.2;
        beneficioChange = 3.1;
      }
    } catch (e) {
      console.warn('No se pudo cargar el cambio a 1M', e);
    }

    return {
      ...mappedUser,
      inversionInicial,
      dineroTotal,
      beneficioTotal,
      dineroChange,
      beneficioChange,
      portfolioDistribution,
      capitalSetup: dineroTotal || 50000,
      interactionHistory
    }
  },

  async processSegments(id) {
    if (USE_MOCKS) {
      return { success: true, message: 'Segmentos procesados con éxito' }
    }
    return request(`/usuarios/${id}/segmentos/procesar`, {
      method: 'POST',
    })
  },

  async getClientCapitalHistory(id, period) {
    if (USE_MOCKS) {
      const baseValue = 50000
      const labels = {
        '1D': ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
        '1S': ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'],
        '1M': ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4', 'Sem 5'],
        '6M': ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
        '1A': ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
        'ALL': ['2023', '2024', '2025', '2026']
      }[period] || ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun']

      let currentVal = baseValue
      return labels.map(label => {
        const change = Math.floor(Math.random() * 20000) - 5000
        currentVal = Math.max(10000, currentVal + change)
        return { fecha: label, valor: currentVal }
      })
    }

    let backendPeriod = '6M'
    if (period === '1M' || period === '1D' || period === '1S') {
      backendPeriod = '1M'
    } else if (period === '1A' || period === 'ALL') {
      backendPeriod = '1Y'
    }

    return request(`/usuarios/${id}/historial-capital?period=${backendPeriod}`)
  },

  async exportClientPdf(id) {
    if (USE_MOCKS) {
      return new Blob(['Reporte Mock PDF Cliente'], { type: 'application/pdf' })
    }
    return request(`/usuarios/${id}/export-pdf`)
  },

  async updateClient(id, clientData) {
    if (USE_MOCKS) {
      const idx = clients.findIndex(c => c.id === parseInt(id))
      if (idx !== -1) {
        clients[idx] = {
          ...clients[idx],
          ...clientData,
          ubicacion: clientData.direccion
        }
        return clients[idx]
      }
      return null
    }
    return request(`/usuarios/${id}`, {
      method: 'PUT',
      body: JSON.stringify(clientData)
    })
  },
}

