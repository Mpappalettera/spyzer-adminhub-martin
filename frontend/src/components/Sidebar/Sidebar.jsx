import { useRef } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { Menu } from 'lucide-react'
import LottieModule from 'lottie-react'
import logoImg from '@/assets/logo-spyzer.png'
import useAuth from '@/hooks/useAuth'
import styles from './Sidebar.module.css'

// Import Lottie files
import dashboardLottie from '@/assets/lottie/dashboard.json'
import clientLottie from '@/assets/lottie/client.json'
import mailLottie from '@/assets/lottie/mail.json'
import reviewLottie from '@/assets/lottie/Review.json'
import helpLottie from '@/assets/lottie/help.json'
import exitLottie from '@/assets/lottie/exit.json'

const Lottie = LottieModule.default || LottieModule

const navItems = [
  { to: '/dashboard', label: 'Dashboard', lottieData: dashboardLottie },
  { to: '/clients', label: 'Clientes', lottieData: clientLottie },
  { to: '/emails', label: 'Envío correos', lottieData: mailLottie },
  { to: '/reviews', label: 'Reviews', lottieData: reviewLottie },
]

function NavItemLink({ item, isCollapsed, onClose }) {
  const lottieRef = useRef(null)

  return (
    <NavLink
      to={item.to}
      className={({ isActive }) => isActive ? styles.navItemActive : styles.navItem}
      onClick={onClose}
      title={isCollapsed ? item.label : undefined}
      onMouseEnter={() => lottieRef.current?.play()}
      onMouseLeave={() => lottieRef.current?.stop()}
    >
      <Lottie
        lottieRef={lottieRef}
        animationData={item.lottieData}
        loop={true}
        autoplay={false}
        className={styles.navLottieIcon}
      />
      <span className={styles.navLabel}>{item.label}</span>
    </NavLink>
  )
}

function FooterItem({ label, isCollapsed, lottieData, onClick }) {
  const lottieRef = useRef(null)

  return (
    <button
      className={styles.navItem}
      onClick={onClick}
      title={isCollapsed ? label : undefined}
      onMouseEnter={() => lottieRef.current?.play()}
      onMouseLeave={() => lottieRef.current?.stop()}
    >
      <Lottie
        lottieRef={lottieRef}
        animationData={lottieData}
        loop={true}
        autoplay={false}
        className={styles.navLottieIcon}
      />
      <span className={styles.navLabel}>{label}</span>
    </button>
  )
}

export function Sidebar({ isOpen, onClose, isCollapsed, onToggleCollapse }) {
  const { logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <>
      {isOpen && <div className={styles.overlay} onClick={onClose} />}
      <aside className={`${styles.sidebar} ${isOpen ? styles.sidebarOpen : ''} ${isCollapsed ? styles.sidebarCollapsed : ''}`}>
        <div className={styles.sidebarInner}>
          <div className={styles.logo}>
            <button className={styles.toggleBtn} onClick={onToggleCollapse} aria-label="Toggle Sidebar">
              <Menu size={22} />
            </button>
            <div className={`${styles.logoWrapper} ${styles.navLabel}`}>
              <img src={logoImg} alt="Spyzer Logo" className={styles.logoImage} />
              <div className={styles.logoText}>
                <div className={styles.logoTitle}>Spyzer</div>
                <div className={styles.logoSubtitle}>Admin Hub</div>
              </div>
            </div>
          </div>

          <nav className={styles.nav}>
            {navItems.map((item) => (
              <NavItemLink key={item.to} item={item} isCollapsed={isCollapsed} onClose={onClose} />
            ))}
          </nav>

          <div className={styles.footer}>
            <FooterItem label="Soporte" isCollapsed={isCollapsed} lottieData={helpLottie} />
            <FooterItem label="Cerrar sesión" isCollapsed={isCollapsed} lottieData={exitLottie} onClick={handleLogout} />
          </div>
        </div>
      </aside>
    </>
  )
}
