import clsx from 'clsx'
import styles from './Card.module.css'

export function Card({ children, className, hoverable = false, ...props }) {
  return (
    <div
      className={clsx(styles.card, hoverable && styles.cardHoverable, className)}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({ title, icon: Icon, action }) {
  return (
    <div className={styles.cardHeader}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
        <span className={styles.cardTitle}>{title}</span>
        {Icon && <Icon className={styles.cardIcon} />}
      </div>
      {action}
    </div>
  )
}
