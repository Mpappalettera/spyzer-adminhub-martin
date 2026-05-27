import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Users, UserPlus, Mail, TrendingUp } from 'lucide-react'
import LottieModule from 'lottie-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts'
import { Card } from '@/components/Card/Card'
import { dashboardService as statsService } from '@/services/dashboardService'
import { clientService } from '@/services/clientService'
import { emailService } from '@/services/emailService'
import { SlideButton } from '@/components/SlideButton/SlideButton'
import RadialProgress from '@/components/RadialProgress/RadialProgress'
import WheelPagination from '@/components/WheelPagination/WheelPagination'
import styles from './Dashboard.module.css'

const Lottie = LottieModule.default || LottieModule

const stagger = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
}

const slideUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
}

const kpiIcons = [Users, UserPlus, Mail, TrendingUp]
const kpiKeys = ['totalActiveUsers', 'newRegistrations', 'emailsSent', 'avgRiskProfile']
const kpiLabels = ['USUARIOS TOTALES', 'REGISTROS ÚLTIMO MES', 'CORREOS ENVIADOS ÚLTIMO MES', 'USUARIOS INACTIVOS (MEDIA)']
const sparkWidths = [78, 62, 55, 95]
const sparkColors = ['var(--outline)', 'var(--primary-container)', 'var(--outline)', 'var(--secondary)']

const periods = ['1D', '1S', '1M', '6M', '1A', 'ALL']

const calculateRegistrations = (period, clientsList) => {
  if (!clientsList || clientsList.length === 0) return []

  const now = new Date()
  const data = []

  const getMonthName = (date) => ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'][date.getMonth()]
  const getDayName = (date) => ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'][date.getDay()]

  if (period === '1D') {
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 4 * 60 * 60 * 1000)
      const label = `${String(d.getHours()).padStart(2, '0')}:00`
      
      const startTime = now.getTime() - (i + 1) * 4 * 60 * 60 * 1000
      const endTime = now.getTime() - i * 4 * 60 * 60 * 1000
      
      const count = clientsList.filter(c => {
        const regDate = new Date(c.fechaRegistro).getTime()
        return regDate >= startTime && regDate < endTime
      }).length

      data.push({ date: label, registrations: count })
    }
  } else if (period === '1S') {
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      const label = getDayName(d)

      const startOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
      const endOfDay = startOfDay + 24 * 60 * 60 * 1000

      const count = clientsList.filter(c => {
        const regDate = new Date(c.fechaRegistro).getTime()
        return regDate >= startOfDay && regDate < endOfDay
      }).length

      data.push({ date: label, registrations: count })
    }
  } else if (period === '1M') {
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 5 * 24 * 60 * 60 * 1000)
      const label = `${d.getDate()} ${getMonthName(d)}`

      const startTime = now.getTime() - (i + 1) * 5 * 24 * 60 * 60 * 1000
      const endTime = now.getTime() - i * 5 * 24 * 60 * 60 * 1000

      const count = clientsList.filter(c => {
        const regDate = new Date(c.fechaRegistro).getTime()
        return regDate >= startTime && regDate < endTime
      }).length

      data.push({ date: label, registrations: count })
    }
  } else if (period === '6M') {
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const label = getMonthName(d)

      const count = clientsList.filter(c => {
        const regDate = new Date(c.fechaRegistro)
        return regDate.getFullYear() === d.getFullYear() && regDate.getMonth() === d.getMonth()
      }).length

      data.push({ date: label, registrations: count })
    }
  } else if (period === '1A') {
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const label = getMonthName(d)

      const count = clientsList.filter(c => {
        const regDate = new Date(c.fechaRegistro)
        return regDate.getFullYear() === d.getFullYear() && regDate.getMonth() === d.getMonth()
      }).length

      data.push({ date: label, registrations: count })
    }
  } else if (period === 'ALL') {
    let startYear = now.getFullYear()
    clientsList.forEach(c => {
      const regYear = new Date(c.fechaRegistro).getFullYear()
      if (regYear < startYear) startYear = regYear
    })
    
    if (isNaN(startYear)) startYear = 2025

    for (let y = startYear; y <= now.getFullYear(); y++) {
      const count = clientsList.filter(c => {
        const regDate = new Date(c.fechaRegistro)
        return regDate.getFullYear() === y
      }).length

      data.push({ date: String(y), registrations: count })
    }
  }

  return data
}

function formatNumber(num) {
  if (typeof num !== 'number') return num
  if (num >= 1000000) return new Intl.NumberFormat('es-ES', { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(num / 1000000) + 'M'
  return new Intl.NumberFormat('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num)
}

const DONUT_COLORS = ['#4edea3', '#ff5451', '#8c90a0']

export default function Dashboard() {
  const [activePeriod, setActivePeriod] = useState('1M')
  const [metrics, setMetrics] = useState(null)
  const [clients, setClients] = useState([])
  const [registrations, setRegistrations] = useState([])
  const [riskData, setRiskData] = useState([])
  const [activities, setActivities] = useState([])
  const [activityPage, setActivityPage] = useState(0)
  const [loading, setLoading] = useState(true)


  useEffect(() => {
    let isMounted = true
    async function loadDashboardData() {
      try {
        const [m, d, a, clientsList, campaignsList] = await Promise.all([
          statsService.getDashboardMetrics(),
          statsService.getRiskDistribution(),
          statsService.getRecentActivity(),
          clientService.getClients(),
          emailService.getCampaigns()
        ])

        const totalUsers = clientsList.length
        const now = new Date()
        const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
        const previousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        
        let totalThisMonth = 0
        let totalLastMonth = 0
        let regThisMonth = 0
        let regLastMonth = 0

        clientsList.forEach(c => {
          const regDate = new Date(c.fechaRegistro)
          if (regDate < thisMonth) totalLastMonth++
          if (regDate <= now) totalThisMonth++
          
          if (regDate >= thisMonth && regDate <= now) regThisMonth++
          if (regDate >= previousMonth && regDate < thisMonth) regLastMonth++
        })
        
        let change = 0
        if (totalLastMonth > 0) {
          change = ((totalThisMonth - totalLastMonth) / totalLastMonth) * 100
        } else if (totalThisMonth > 0) {
          change = 100
        }
        
        m.totalActiveUsers = {
          value: totalUsers,
          change: change.toFixed(1),
          trend: change >= 0 ? 'up' : 'down'
        }

        let regChange = 0
        if (regLastMonth > 0) {
          regChange = ((regThisMonth - regLastMonth) / regLastMonth) * 100
        } else if (regThisMonth > 0) {
          regChange = 100
        }

        m.newRegistrations = {
          value: regThisMonth,
          change: regChange.toFixed(1),
          trend: regChange >= 0 ? 'up' : 'down'
        }

        let emailsThisMonth = 0
        let emailsLastMonth = 0
        campaignsList.forEach(c => {
          if (c.estado !== 'SENT' || !c.fechaEnvio) return;
          const sentDate = new Date(c.fechaEnvio)
          const num = parseInt(c.destinatarios) || 0
          if (sentDate >= thisMonth && sentDate <= now) emailsThisMonth += num
          if (sentDate >= previousMonth && sentDate < thisMonth) emailsLastMonth += num
        })
        
        let emailChange = 0
        if (emailsLastMonth > 0) {
          emailChange = ((emailsThisMonth - emailsLastMonth) / emailsLastMonth) * 100
        } else if (emailsThisMonth > 0) {
          emailChange = 100
        }
        
        m.emailsSent = {
          value: emailsThisMonth,
          change: emailChange.toFixed(1),
          trend: emailChange >= 0 ? 'up' : 'down'
        }

        let inactiveThisMonth = 0
        let inactiveLastMonth = 0
        let vipCount = 0
        let activeCount = 0
        let inactiveCount = 0

        clientsList.forEach(c => {
          const isVip = c.segmentos && c.segmentos.includes('Premium')
          const isInactive = c.activo === false
          
          if (isInactive) inactiveCount++
          else if (isVip) vipCount++
          else activeCount++
          
          if (isInactive) {
             const regDate = new Date(c.fechaRegistro)
             if (regDate <= now) inactiveThisMonth++
             if (regDate < thisMonth) inactiveLastMonth++
          }
        })
        
        let inactiveChange = inactiveThisMonth - inactiveLastMonth
        
        m.avgRiskProfile = {
          value: inactiveThisMonth,
          change: inactiveChange,
          trend: inactiveChange >= 0 ? 'up' : 'down',
          isAbsolute: true
        }
        
        const rolesData = [
          { name: 'VIP', value: vipCount },
          { name: 'Inactivos', value: inactiveCount },
          { name: 'Activos', value: activeCount }
        ]

        if (isMounted) {
          setMetrics(m)
          setClients(clientsList)
          setRiskData(rolesData)
          setActivities(a.recentActivity || [])
          setLoading(false)
        }
      } catch (error) {
        console.error('Error cargando los datos del Dashboard:', error)
      }
    }

    loadDashboardData()
    return () => { isMounted = false }
  }, [])

  useEffect(() => {
    if (clients.length > 0) {
      setRegistrations(calculateRegistrations(activePeriod, clients))
    }
  }, [activePeriod, clients])


  const handleExportPdf = async () => {
    try {
      const blob = await statsService.exportDashboardPdf()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'reporte-dashboard.pdf')
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error exporting PDF:', error)
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px', color: 'var(--outline)', fontSize: 'var(--body-lg-size)' }}>
        Cargando métricas de Spyzer AdminHub...
      </div>
    )
  }

  return (
    <motion.div initial="hidden" animate="show" variants={stagger}>
      {/* Header */}
      <motion.div className={styles.pageHeader} variants={slideUp}>
        <div className={styles.headerLeft}>
          <h1>Resumen del Dashboard</h1>
          <p>Métricas de la plataforma y distribución de riesgo en tiempo real.</p>
        </div>
        <div className={styles.headerActions}>
          <SlideButton onComplete={handleExportPdf} />
          <div className={styles.marketBadge}>
            <span className={styles.marketDot} />
            Mercado Abierto
          </div>
        </div>
      </motion.div>


      {/* KPI Cards */}
      <motion.div className={styles.kpiGrid} variants={stagger}>
        {kpiKeys.map((key, i) => {
          const metric = metrics[key]
          const Icon = kpiIcons[i]
          return (
            <motion.div key={key} variants={slideUp}>
              <Card hoverable>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-sm)' }}>
                  <span className={styles.chartTitle}>{kpiLabels[i]}</span>
                  <Icon size={18} style={{ color: 'var(--outline)' }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                  <span className={styles.kpiValue}>{formatNumber(metric?.value)}</span>
                  {metric?.change !== undefined && (
                    <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center' }}>
                      <span className={`${styles.kpiChange} ${metric.trend === 'up' ? styles.kpiUp : styles.kpiDown}`}>
                        {metric.trend === 'up' ? '↑' : '↓'}{Math.abs(metric.change)}{metric.isAbsolute ? '' : '%'}
                      </span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--outline, #8c90a0)', marginTop: '2px', fontWeight: 500, lineHeight: 1 }}>último mes</span>
                    </div>
                  )}
                </div>
                <div className={styles.sparkline}>
                  <div
                    className={styles.sparklineFill}
                    style={{ width: `${sparkWidths[i]}%`, backgroundColor: sparkColors[i] }}
                  />
                </div>
              </Card>
            </motion.div>
          )
        })}
      </motion.div>

      {/* Charts */}
      <motion.div className={styles.chartsGrid} variants={slideUp}>
        {/* Registration Area Chart */}
        <Card>
          <div className={styles.chartHeader}>
            <div>
              <div className={styles.chartTitle}>REGISTROS DE USUARIOS</div>
              <div className={styles.chartSubtitle}>Volumen de adquisición en el tiempo</div>
            </div>
            <div className={styles.periodTabs}>
              {periods.map((p) => (
                <button
                  key={p}
                  className={activePeriod === p ? styles.periodTabActive : styles.periodTab}
                  onClick={() => setActivePeriod(p)}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={340} minWidth={0}>
            <AreaChart data={registrations} margin={{ top: 10, right: 0, left: 0, bottom: 5 }}>
              <defs>
                <linearGradient id="regGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#508dff" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#508dff" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="4 4" stroke="#2a2a2a" vertical={false} />
              <XAxis dataKey="date" hide />
              <YAxis hide />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1a1a1a',
                  border: '1px solid #2a2a2a',
                  borderRadius: '8px',
                  color: '#e5e2e1',
                  fontSize: '14px',
                }}
              />
              <Area
                type="monotone"
                dataKey="registrations"
                stroke="#508dff"
                strokeWidth={2}
                fill="url(#regGradient)"
                dot={false}
                activeDot={{ r: 4, fill: '#508dff', stroke: '#1a1a1a', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* Risk Distribution Radial Progress */}
        <Card>
          <div className={styles.chartTitle}>ESTADO DE USUARIOS</div>
          <div style={{ marginTop: 'var(--space-md)', paddingBottom: 'var(--space-lg)' }}>
            <RadialProgress 
              rings={[
                { value: riskData.find(d => d.name === 'Inactivos')?.value || 0, max: riskData.reduce((acc, curr) => acc + curr.value, 0) || 1, color: 'var(--loss)', label: 'Inactivos' },
                { value: riskData.find(d => d.name === 'Activos')?.value || 0, max: riskData.reduce((acc, curr) => acc + curr.value, 0) || 1, color: 'var(--gain)', label: 'Activos' },
                { value: riskData.find(d => d.name === 'VIP')?.value || 0, max: riskData.reduce((acc, curr) => acc + curr.value, 0) || 1, color: 'var(--primary-container)', label: 'VIP' },
              ]}
              centerValue={riskData.reduce((acc, curr) => acc + curr.value, 0)}
              tooltip={{ primary: 'Total de Usuarios', secondary: 'Distribución actual' }}
            />
          </div>
          <div className={styles.legendList} style={{ marginTop: '20px' }}>
            {[
              { name: 'Inactivos', color: 'var(--loss)', value: riskData.find(d => d.name === 'Inactivos')?.value || 0 },
              { name: 'Activos', color: 'var(--gain)', value: riskData.find(d => d.name === 'Activos')?.value || 0 },
              { name: 'VIP', color: 'var(--primary-container)', value: riskData.find(d => d.name === 'VIP')?.value || 0 },
            ].map((item) => (
              <div key={item.name} className={styles.legendItem} style={{ width: '64px' }}>
                <span className={styles.legendName}>{item.name}</span>
                <div style={{ width: '100%', height: '2px', backgroundColor: item.color, borderRadius: '2px' }} />
                <span className={styles.legendValue}>{item.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Recent Activity */}
      <motion.div variants={slideUp}>
        <Card>
          <div className={styles.activityHeader}>
            <span className={styles.chartTitle}>ACTIVIDAD RECIENTE</span>
          </div>
          <div className={styles.activityList}>
            {activities
              .slice(0, 50) // Máximo 50 elementos (10 páginas)
              .slice(activityPage * 5, (activityPage + 1) * 5)
              .map((item) => (
                <div key={item.id} className={styles.activityRow}>
                  <div className={styles.activityInfo}>
                    <span className={styles.activityUser}>{item.user}</span>
                    <span className={styles.activityDesc}>{item.description}</span>
                  </div>
                  <span className={styles.activityTime}>{item.time}</span>
                </div>
              ))}
          </div>
          <WheelPagination
            totalPages={Math.min(10, Math.ceil(activities.length / 5))}
            visibleCount={5}
            onChange={setActivityPage}
            className={styles.paginationWrapper}
          />
        </Card>
      </motion.div>
    </motion.div>
  )
}
