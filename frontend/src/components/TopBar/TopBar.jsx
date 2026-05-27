import { useState, useEffect, useRef, useMemo } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Menu, ChevronLeft, Bitcoin, DollarSign, Euro, PoundSterling } from 'lucide-react'
import LottieModule from 'lottie-react'
import useAuth from '@/hooks/useAuth'
import styles from './TopBar.module.css'
import notificationLottie from '@/assets/lottie/notification.json'
import LogoLoop from '../LogoLoop/LogoLoop'
import { clientService } from '@/services/clientService'

const Lottie = LottieModule.default || LottieModule

const tickerItems = [
  { 
    node: <div style={{display:'flex', alignItems:'center', gap:'8px', color:'var(--on-surface)', fontSize: '14px'}}><Bitcoin size={18} color="#f7931a"/> <span style={{fontWeight:600}}>BTC</span> <span>$64,320</span> <span style={{color:'var(--gain)'}}>+2.4%</span></div>, 
    title: "Bitcoin" 
  },
  { 
    node: <div style={{display:'flex', alignItems:'center', gap:'8px', color:'var(--on-surface)', fontSize: '14px'}}><DollarSign size={18} color="#627eea"/> <span style={{fontWeight:600}}>ETH</span> <span>$3,450</span> <span style={{color:'var(--gain)'}}>+1.2%</span></div>, 
    title: "Ethereum" 
  },
  { 
    node: <div style={{display:'flex', alignItems:'center', gap:'8px', color:'var(--on-surface)', fontSize: '14px'}}><div style={{width:16, height:16, borderRadius:'50%', background:'#14F195'}}/> <span style={{fontWeight:600}}>SOL</span> <span>$145.20</span> <span style={{color:'var(--gain)'}}>+5.6%</span></div>, 
    title: "Solana" 
  },
  { 
    node: <div style={{display:'flex', alignItems:'center', gap:'8px', color:'var(--on-surface)', fontSize: '14px'}}><Euro size={18} color="#0052B4"/> <span style={{fontWeight:600}}>EUR/USD</span> <span>1.0842</span> <span style={{color:'var(--loss)'}}>-0.1%</span></div>, 
    title: "EUR/USD" 
  },
  { 
    node: <div style={{display:'flex', alignItems:'center', gap:'8px', color:'var(--on-surface)', fontSize: '14px'}}><PoundSterling size={18} color="#8c90a0"/> <span style={{fontWeight:600}}>GBP/USD</span> <span>1.2650</span> <span style={{color:'var(--gain)'}}>+0.3%</span></div>, 
    title: "GBP/USD" 
  }
];

export function TopBar({ onMenuClick, searchPlaceholder = 'Buscar (Ej: Alex Mercer)' }) {
  const { user } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [scrolled, setScrolled] = useState(false)
  const lottieRef = useRef(null)
  const searchContainerRef = useRef(null)
  
  const [searchTerm, setSearchTerm] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const [allClients, setAllClients] = useState([])

  useEffect(() => {
    let isMounted = true
    async function loadClients() {
      try {
        const data = await clientService.getClients()
        if (isMounted) {
          setAllClients(data)
        }
      } catch (error) {
        console.error('Error loading clients for TopBar search', error)
      }
    }
    loadClients()
    return () => { isMounted = false }
  }, [])

  const isClientProfile = location.pathname.startsWith('/clients/') && location.pathname !== '/clients'

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    
    handleScroll() // Check on mount
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (location.pathname === '/clients') {
      setSearchTerm(searchParams.get('search') || '')
    } else {
      setSearchTerm('')
    }
  }, [location.pathname, searchParams])

  const searchResults = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    if (!term) return []
    return allClients.filter(c => 
      `${c.nombre} ${c.apellido}`.toLowerCase().includes(term) ||
      (c.clientId && c.clientId.toLowerCase().includes(term)) ||
      (c.email && c.email.toLowerCase().includes(term))
    ).slice(0, 5) // limit to 5 results
  }, [searchTerm, allClients])

  const handleSearchChange = (e) => {
    const val = e.target.value
    setSearchTerm(val)
    setShowDropdown(true)
    if (location.pathname === '/clients') {
      navigate(`/clients?search=${encodeURIComponent(val)}`, { replace: true })
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && searchTerm.trim()) {
      setShowDropdown(false)
      const term = searchTerm.trim().toLowerCase()
      // Buscar match exacto de nombre + apellido
      const exactMatch = allClients.find(c => 
        `${c.nombre} ${c.apellido}`.toLowerCase() === term
      )
      
      if (exactMatch) {
        navigate(`/clients/${exactMatch.id}`)
      } else if (location.pathname !== '/clients') {
        navigate(`/clients?search=${encodeURIComponent(searchTerm)}`)
      }
    }
  }

  const handleResultClick = (id) => {
    setShowDropdown(false)
    navigate(`/clients/${id}`)
    if (location.pathname !== '/clients') {
      setSearchTerm('')
    }
  }

  const handleBackClick = () => {
    navigate('/clients')
  }

  const initials = user?.nombre
    ? user.nombre.slice(0, 2).toUpperCase()
    : 'AD'

  const showSearch = location.pathname !== '/dashboard' && location.pathname !== '/'

  return (
    <header className={`${styles.topbar} ${scrolled ? styles.scrolled : ''}`}>
      <button className={styles.menuButton} onClick={onMenuClick}>
        <Menu size={22} />
      </button>

      {showSearch ? (
        <div className={styles.searchGroup}>
          <AnimatePresence>
            {isClientProfile && (
              <motion.button 
                initial={{ width: 0, opacity: 0, marginRight: 0 }}
                animate={{ width: 32, opacity: 1, marginRight: 16 }}
                exit={{ width: 0, opacity: 0, marginRight: 0 }}
                className={styles.backButton} 
                onClick={handleBackClick} 
                aria-label="Volver al directorio"
              >
                <ChevronLeft size={20} />
              </motion.button>
            )}
          </AnimatePresence>
          <div className={styles.searchContainer} ref={searchContainerRef}>
            <Search className={styles.searchIcon} />
            <input
              type="text"
              className={styles.searchInput}
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={handleSearchChange}
              onKeyDown={handleKeyDown}
              onFocus={() => setShowDropdown(true)}
            />
            {showDropdown && searchResults.length > 0 && (
              <div className={styles.searchResults}>
                {searchResults.map(client => (
                  <button 
                    key={client.id} 
                    className={styles.searchResultItem}
                    onClick={() => handleResultClick(client.id)}
                  >
                    <span className={styles.resultName}>{client.nombre} {client.apellido}</span>
                    <span className={styles.resultId}>{client.clientId || `USR-${client.id}`}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div style={{ flex: 1, overflow: 'hidden', margin: '0 24px', display: 'flex', alignItems: 'center', height: '100%', maskImage: 'linear-gradient(to right, transparent, black 5%, black 95%, transparent)', WebkitMaskImage: 'linear-gradient(to right, transparent, black 5%, black 95%, transparent)' }}>
          <LogoLoop
            logos={tickerItems}
            speed={40}
            direction="left"
            logoHeight={24}
            gap={48}
            hoverSpeed={10}
            scaleOnHover={true}
          />
        </div>
      )}

      <div className={styles.rightSection}>
        <button 
          className={styles.notificationBtn}
          onMouseEnter={() => {
            lottieRef.current?.goToAndPlay(0, true)
          }}
        >
          <Lottie
            lottieRef={lottieRef}
            animationData={notificationLottie}
            loop={false}
            autoplay={false}
            style={{ width: 24, height: 24 }}
          />
          <span className={styles.notificationDot} />
        </button>

        <div className={styles.userSection}>
          <span className={styles.userEmail}>
            {user?.email || 'demo@spyzer.com'}
          </span>
          <span className={styles.userRole}>
            {user?.rol === 'ADMIN' ? 'Administrador' : ''}
          </span>
          <div className={styles.avatar}>{initials}</div>
        </div>
      </div>
    </header>
  )
}
