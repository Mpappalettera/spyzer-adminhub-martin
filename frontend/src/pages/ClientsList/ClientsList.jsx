import { useState, useEffect, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { clientService } from '@/services/clientService'
import { ClientTable } from '@/components/ClientTable/ClientTable'
import WheelPagination from '@/components/WheelPagination/WheelPagination'
import styles from './ClientsList.module.css'

const ITEMS_PER_PAGE = 5

export default function ClientsList() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const searchQuery = (searchParams.get('search') || '').toLowerCase()
  
  const [currentPage, setCurrentPage] = useState(1)
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    async function loadClients() {
      try {
        const data = await clientService.getClients()
        if (isMounted) {
          setClients(data)
          setLoading(false)
        }
      } catch (error) {
        console.error('Error fetching clients:', error)
        if (isMounted) setLoading(false)
      }
    }
    loadClients()
    return () => { isMounted = false }
  }, [])

  const filteredClients = useMemo(() => {
    if (!searchQuery) return clients;
    return clients.filter(c => 
      `${c.nombre} ${c.apellido}`.toLowerCase().includes(searchQuery) ||
      (c.clientId && c.clientId.toLowerCase().includes(searchQuery)) ||
      (c.email && c.email.toLowerCase().includes(searchQuery))
    );
  }, [clients, searchQuery]);

  // Reset page when search changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery])

  const totalPages = Math.ceil(filteredClients.length / ITEMS_PER_PAGE)
  
  // Slice clients for current page
  const currentClients = filteredClients.slice(
    (currentPage - 1) * ITEMS_PER_PAGE, 
    currentPage * ITEMS_PER_PAGE
  )

  const handleClientSelect = (clientId) => {
    navigate(`/clients/${clientId}`)
  }

  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px', color: 'var(--outline)', fontSize: 'var(--body-lg-size)' }}>
        Cargando directorio de clientes...
      </div>
    )
  }

  return (
    <div className={styles.pageContainer}>
      <motion.div 
        className={styles.pageHeader}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className={styles.pageTitle}>Directorio de Clientes</h1>
      </motion.div>

      <ClientTable 
        clients={currentClients} 
        onClientSelect={handleClientSelect} 
      />

      {totalPages > 1 && (
        <div className={styles.paginationContainer}>
          <WheelPagination 
            totalPages={totalPages} 
            onChange={(idx) => handlePageChange(idx + 1)} 
          />
        </div>
      )}
    </div>
  )
}
