import { useState, useMemo, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Edit, MapPin, Phone, Mail as MailIcon, Calendar } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Card } from '@/components/Card/Card'
import { Badge } from '@/components/Badge/Badge'
import { SlideButton } from '@/components/SlideButton/SlideButton'
import { Progress } from '@/components/Progress/Progress'
import { clientService } from '@/services/clientService'
import { EditUserModal } from '@/components/EditUserModal'
import styles from './ClientProfile.module.css'

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
}

const slideUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
}

const getRoleVariant = (status) => {
  if (status === 'VIP') return 'scheduled' // blue
  if (status === 'Inactive' || status === 'INACTIVE') return 'negative' // red
  return 'positive' // green
}

const translateRole = (status) => {
  if (status === 'VIP') return 'VIP'
  if (status === 'Inactive' || status === 'INACTIVE') return 'Inactivo'
  return 'Activo'
}

function formatCurrency(value) {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

export default function ClientProfile() {
  const { id } = useParams()
  const [client, setClient] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activePeriod, setActivePeriod] = useState('1A')
  const [capitalHistory, setCapitalHistory] = useState([])
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  const handleSave = async (updatedData) => {
    try {
      await clientService.updateClient(id || '1', updatedData)
      // Refrescar los datos locales del cliente
      const freshData = await clientService.getClientById(id || '1')
      setClient(freshData)
    } catch (error) {
      console.error('Error al actualizar el cliente:', error)
      throw error
    }
  }

  useEffect(() => {
    let isMounted = true
    async function loadClient() {
      try {
        const data = await clientService.getClientById(id || '1')
        if (isMounted) {
          setClient(data)
          setLoading(false)
        }
      } catch (error) {
        console.error('Error fetching client:', error)
        if (isMounted) setLoading(false)
      }
    }
    loadClient()
    return () => { isMounted = false }
  }, [id])

  useEffect(() => {
    let isMounted = true
    async function loadHistory() {
      try {
        const data = await clientService.getClientCapitalHistory(id || '1', activePeriod)
        if (isMounted) {
          setCapitalHistory(data)
        }
      } catch (error) {
        console.error('Error fetching capital history:', error)
      }
    }
    if (client) {
      loadHistory()
    }
    return () => { isMounted = false }
  }, [id, activePeriod, client])

  const chartData = useMemo(() => {
    return capitalHistory.map(item => {
      let label = item.fecha
      let isBeforeRegistration = false
      try {
        const itemDate = new Date(item.fecha)
        const regDate = client?.fechaRegistro ? new Date(client.fechaRegistro) : null
        
        if (regDate && !isNaN(itemDate.getTime()) && !isNaN(regDate.getTime())) {
          const itemMonth = new Date(itemDate.getFullYear(), itemDate.getMonth(), 1)
          const regMonth = new Date(regDate.getFullYear(), regDate.getMonth(), 1)
          if (itemMonth < regMonth) {
            isBeforeRegistration = true
          }
        }

        if (!isNaN(itemDate.getTime()) && item.fecha.includes('-')) {
          label = itemDate.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })
        }
      } catch (e) {}
      
      return {
        month: label,
        value: isBeforeRegistration ? null : (Number(item.valor) || 0)
      }
    })
  }, [capitalHistory, client])

  const handleExportPdf = async () => {
    try {
      const blob = await clientService.exportClientPdf(id || '1')
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `ficha-usuario-${id || '1'}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error exporting PDF:', error)
    }
  }

  if (loading || !client) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px', color: 'var(--outline)', fontSize: 'var(--body-lg-size)' }}>
        Cargando perfil del cliente...
      </div>
    )
  }

  const initials = `${client.nombre[0]}${client.apellido[0]}`

  return (
    <motion.div initial="hidden" animate="show" variants={stagger} style={{ minWidth: 0 }}>
      <motion.div className={styles.pageHeader} variants={slideUp}>
        <div className={styles.clientInfo}>
          <div className={styles.avatarLg}>{initials}</div>
          <div>
            <h1 className={styles.clientName}>{client.nombre} {client.apellido}</h1>
            <div className={styles.clientId}>
              ID: {client.clientId || `USR-${client.id}`}
              <span style={{ margin: '0 8px', color: 'var(--card-border)' }}>|</span>
              <Badge variant={getRoleVariant(client.accountStatus || client.estadoUsuario)}>
                {translateRole(client.accountStatus || client.estadoUsuario)}
              </Badge>
            </div>
          </div>
        </div>
        <div className={styles.headerActions}>
          <SlideButton onComplete={handleExportPdf} />
        </div>
      </motion.div>


      <div className={styles.contentGrid}>
        {/* Left Column: Portfolio & Charts */}
        <motion.div variants={slideUp} style={{ minWidth: 0 }}>
          <div className={styles.statsGrid}>
            <Card className={styles.statCard}>
              <span className={styles.sectionTitle}>Dinero total (cartera)</span>
              <div className={styles.statContainer}>
                <div className={styles.statValue}>{formatCurrency(client.dineroTotal || 0)}</div>
                {client.dineroChange !== undefined && (
                  <div className={styles.statChangeContainer}>
                    <div className={styles.statChangeRow}>
                      {client.dineroChange === 0 ? (
                        <span className={styles.statChangeNeutral}>Sin cambios</span>
                      ) : (
                        <span className={client.dineroChange > 0 ? styles.statChangeUp : styles.statChangeDown}>
                          {client.dineroChange > 0 ? '↑' : '↓'}{Math.abs(client.dineroChange)}%
                        </span>
                      )}
                      <Progress
                        value={Math.min(100, (Math.abs(client.dineroChange) / 25) * 100)}
                        trend={client.dineroChange > 0 ? 'up' : client.dineroChange < 0 ? 'down' : 'neutral'}
                        className={styles.statProgressInline}
                      />
                    </div>
                    <span className={styles.statSubtext}>último mes</span>
                  </div>
                )}
              </div>
            </Card>
            <Card className={styles.statCard}>
              <span className={styles.sectionTitle}>Beneficio</span>
              <div className={styles.statContainer}>
                <div className={styles.statValue}>{formatCurrency(client.beneficioTotal || 0)}</div>
                {client.beneficioChange !== undefined && (
                  <div className={styles.statChangeContainer}>
                    <div className={styles.statChangeRow}>
                      {client.beneficioChange === 0 ? (
                        <span className={styles.statChangeNeutral}>Sin cambios</span>
                      ) : (
                        <span className={client.beneficioChange > 0 ? styles.statChangeUp : styles.statChangeDown}>
                          {client.beneficioChange > 0 ? '↑' : '↓'}{Math.abs(client.beneficioChange)}%
                        </span>
                      )}
                      <Progress
                        value={Math.min(100, (Math.abs(client.beneficioChange) / 25) * 100)}
                        trend={client.beneficioChange > 0 ? 'up' : client.beneficioChange < 0 ? 'down' : 'neutral'}
                        className={styles.statProgressInline}
                      />
                    </div>
                    <span className={styles.statSubtext}>último mes</span>
                  </div>
                )}
              </div>
            </Card>
            <Card className={styles.statCard}>
              <span className={styles.sectionTitle}>Inversión Inicial</span>
              <div className={styles.statValue}>{formatCurrency(client.inversionInicial || 0)}</div>
            </Card>
          </div>

          <Card className={styles.chartSection}>
            <div className={styles.chartHeader}>
              <span className={styles.sectionTitle}>Historial de Capital</span>
              <div className={styles.periodSelector}>
                {['1D', '1S', '1M', '6M', '1A', 'ALL'].map(period => (
                  <button
                    key={period}
                    className={activePeriod === period ? styles.periodBtnActive : styles.periodBtn}
                    onClick={() => setActivePeriod(period)}
                  >
                    {period}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ width: '100%', minWidth: 0, height: 260 }}>
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="capGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#4edea3" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#4edea3" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="4 4" stroke="#2a2a2a" vertical={false} />
                  <XAxis 
                    dataKey="month" 
                    stroke="#8c90a0" 
                    tick={{ fill: '#8c90a0', fontSize: 12 }} 
                    axisLine={false} 
                    tickLine={false}
                    interval="preserveStartEnd"
                    minTickGap={10}
                  />
                  <YAxis 
                    hide 
                    domain={[
                      dataMin => (dataMin * 0.98),
                      dataMax => (dataMax * 1.02)
                    ]} 
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '8px', color: '#fff' }}
                    formatter={(value) => [formatCurrency(value), 'Capital']}
                  />
                  <Area type="monotone" dataKey="value" stroke="#4edea3" strokeWidth={2} fill="url(#capGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card>
            <span className={styles.sectionTitle} style={{ marginBottom: 'var(--space-md)', display: 'block' }}>
              Distribución de Cartera
            </span>
            <div className={styles.allocationBars}>
              {(client.portfolioDistribution || []).map((alloc) => (
                <div key={alloc.name} className={styles.allocationRow}>
                  <div className={styles.allocationInfo}>
                    <span className={styles.allocationName}>{alloc.name}</span>
                    <span className={styles.allocationValue}>{alloc.value}%</span>
                  </div>
                  <div className={styles.allocationBarBg}>
                    <div
                      className={styles.allocationBarFill}
                      style={{ width: `${alloc.value}%`, backgroundColor: alloc.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Right Column: Details & Timeline */}
        <motion.div variants={slideUp} style={{ minWidth: 0 }}>
          <Card className={styles.detailsCard}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-md)' }}>
              <span className={styles.sectionTitle}>Detalles del Cliente</span>
              <button 
                onClick={() => setIsEditModalOpen(true)} 
                style={{ color: 'var(--primary)' }}
                aria-label="Editar información del cliente"
              >
                <Edit size={16} />
              </button>
            </div>
            <div>
              <div className={styles.detailRow}>
                <MailIcon size={16} className={styles.detailIcon} />
                <span className={styles.detailText}>{client.email}</span>
              </div>
              <div className={styles.detailRow}>
                <Phone size={16} className={styles.detailIcon} />
                <span className={styles.detailText}>{client.telefono}</span>
              </div>
              <div className={styles.detailRow}>
                <MapPin size={16} className={styles.detailIcon} />
                <span className={styles.detailText}>{client.ubicacion || client.direccion}</span>
              </div>
              <div className={styles.detailRow}>
                <Calendar size={16} className={styles.detailIcon} />
                <span className={styles.detailText}>Unido {new Date(client.fechaRegistro).toLocaleDateString('es-ES')}</span>
              </div>
            </div>
          </Card>

          <Card>
            <span className={styles.sectionTitle}>Historial de Interacciones</span>
            {client.interactionHistory && client.interactionHistory.length > 0 ? (
              <div className={styles.timeline}>
                {(client.interactionHistory || []).slice(0, 10).map((interaction) => (
                  <div key={interaction.id} className={styles.timelineItem}>
                    <span className={styles.timelineDate}>{interaction.date}</span>
                    <div className={styles.timelineTitle}>{interaction.title}</div>
                    <div className={styles.timelineDesc}>{interaction.description}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ marginTop: 'var(--space-md)', color: 'var(--outline)', fontSize: 'var(--body-md-size)' }}>
                No hay interacciones recientes.
              </div>
            )}
          </Card>
        </motion.div>
      </div>

      <EditUserModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        userData={client}
        onSave={handleSave}
      />
    </motion.div>
  )
}
