export const dashboardMetrics = {
  totalActiveUsers: { value: 142893, change: 12.4, trend: 'up' },
  newRegistrations: { value: 3241, change: 4.1, trend: 'up' },
  emailsSent: { value: 892000, change: -1.2, trend: 'down' },
  avgRiskProfile: { value: 'Moderate+', label: 'Stable' },
}

export const registrationData = [
  { date: '2024-01-01', registrations: 120 },
  { date: '2024-01-02', registrations: 98 },
  { date: '2024-01-03', registrations: 145 },
  { date: '2024-01-04', registrations: 167 },
  { date: '2024-01-05', registrations: 134 },
  { date: '2024-01-06', registrations: 89 },
  { date: '2024-01-07', registrations: 178 },
  { date: '2024-01-08', registrations: 210 },
  { date: '2024-01-09', registrations: 195 },
  { date: '2024-01-10', registrations: 230 },
  { date: '2024-01-11', registrations: 245 },
  { date: '2024-01-12', registrations: 198 },
  { date: '2024-01-13', registrations: 267 },
  { date: '2024-01-14', registrations: 289 },
  { date: '2024-01-15', registrations: 312 },
  { date: '2024-01-16', registrations: 278 },
  { date: '2024-01-17', registrations: 334 },
  { date: '2024-01-18', registrations: 356 },
  { date: '2024-01-19', registrations: 301 },
  { date: '2024-01-20', registrations: 289 },
  { date: '2024-01-21', registrations: 378 },
  { date: '2024-01-22', registrations: 412 },
  { date: '2024-01-23', registrations: 389 },
  { date: '2024-01-24', registrations: 445 },
  { date: '2024-01-25', registrations: 423 },
  { date: '2024-01-26', registrations: 467 },
  { date: '2024-01-27', registrations: 498 },
  { date: '2024-01-28', registrations: 512 },
  { date: '2024-01-29', registrations: 534 },
  { date: '2024-01-30', registrations: 489 },
]

export const riskDistribution = [
  { name: 'Moderate', value: 45, color: 'var(--outline)' },
  { name: 'Conservative', value: 35, color: 'var(--secondary)' },
  { name: 'Aggressive', value: 20, color: 'var(--tertiary-container)' },
]

const activityTypes = ['registration', 'trade', 'email', 'review', 'system']
const names = ['Carlos Mendoza', 'Elena Rostova', 'James Wilson', 'Sofia Martinez', 'David Chen', 'Maria Garcia', 'Tom Baker', 'Laura Palmer', 'Richard Roe', 'Jane Smith']
const actions = {
  registration: ['New user registered', 'New user registered via referral', 'Account verified'],
  trade: ['Executed BUY order — AAPL x 150', 'Executed SELL order — TSLA x 80', 'Executed BUY order — BTC x 0.5', 'Executed BUY order — ETH x 4.2', 'Executed SELL order — AMZN x 25'],
  email: ['Campaign "Q3 Update" sent', 'Security alert sent', 'Welcome email sent'],
  review: ['Left a 5-star review', 'Left a 4-star review', 'Reported a bug in iOS app'],
  system: ['Weekly backup completed successfully', 'Server capacity scaled up', 'Database optimized']
}

export const recentActivity = Array.from({ length: 50 }).map((_, i) => {
  const type = activityTypes[i % activityTypes.length]
  const user = type === 'system' || type === 'email' ? 'System' : names[i % names.length]
  const descOpts = actions[type]
  const description = descOpts[i % descOpts.length]
  
  // Distribuir el tiempo para que parezca realista
  let timeStr = ''
  if (i < 5) {
    timeStr = `hace ${(i + 1) * 2} minutos`
  } else if (i < 15) {
    timeStr = `hace ${Math.floor(i * 1.5)} minutos`
  } else if (i < 30) {
    timeStr = `hace ${Math.floor(i / 3)} horas`
  } else {
    const totalHours = Math.floor(i / 1.5)
    if (totalHours >= 24) {
      const days = Math.floor(totalHours / 24)
      const hours = totalHours % 24
      const daysStr = days === 1 ? '1 día' : `${days} días`
      const hoursStr = hours === 1 ? '1 hora' : `${hours} horas`
      timeStr = `hace ${daysStr} y ${hoursStr}`
    } else {
      timeStr = `hace ${totalHours} horas`
    }
  }

  return {
    id: i + 1,
    type,
    user,
    description,
    time: timeStr
  }
})
