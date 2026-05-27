import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Badge } from '@/components/Badge/Badge'
import styles from './ClientTable.module.css'

export function ClientTable({ clients = [], onClientSelect, className = "" }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
  }

  const containerVariants = {
    visible: {
      transition: {
        staggerChildren: 0.04,
        delayChildren: 0.1,
      },
    }
  }

  const rowVariants = {
    hidden: { 
      opacity: 0, 
      y: 20,
      scale: 0.98,
      filter: "blur(4px)" 
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      filter: "blur(0px)",
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 25,
        mass: 0.7,
      },
    },
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

  return (
    <div className={`${styles.tableContainer} ${className}`}>
      <div className={styles.tableWrapper}>
        {/* Headers */}
        <div className={styles.tableHeader}>
          <div className={styles.headerItem}>Cliente</div>
          <div className={styles.headerItem}>ID</div>
          <div className={styles.headerItem}>Rol</div>
          <div className={styles.headerItem}>Cartera Actual</div>
          <div className={styles.headerItem}>Fecha de Unión</div>
        </div>

        {/* Rows */}
        <motion.div
          key={clients.map(c => c.id).join('-')}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {clients.map((client) => {
            const initials = `${client.nombre[0]}${client.apellido[0]}`

            return (
              <motion.div 
                key={client.id} 
                variants={rowVariants}
                className={styles.tableRow}
                onClick={() => onClientSelect && onClientSelect(client.id)}
              >
                {/* Cliente */}
                <div className={styles.clientInfo}>
                  <div className={styles.avatar}>{initials}</div>
                  <div className={styles.clientDetails}>
                    <span className={styles.clientName}>{client.nombre} {client.apellido}</span>
                  </div>
                </div>

                {/* ID */}
                <div className={styles.cellCenter}>
                  <span className={styles.cellId}>{client.clientId || `USR-${client.id}`}</span>
                </div>

                {/* Rol */}
                <div className={styles.cellCenter}>
                  <Badge variant={getRoleVariant(client.accountStatus || client.estadoUsuario)}>
                    {translateRole(client.accountStatus || client.estadoUsuario)}
                  </Badge>
                </div>

                {/* Cartera Actual */}
                <div className={styles.cellCenter}>
                  <span className={styles.cellText}>{formatCurrency(client.totalCapitalInvested)}</span>
                </div>

                {/* Fecha de Unión */}
                <div className={styles.cellCenter}>
                  <span className={styles.cellText} style={{ color: 'var(--outline)' }}>
                    {formatDate(client.fechaRegistro)}
                  </span>
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </div>
  )
}
