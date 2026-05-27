import clsx from 'clsx'
import styles from './Badge.module.css'

export function Badge({ variant = 'moderate', children }) {
  return (
    <span className={clsx(styles.badge, styles[variant])}>
      {children}
    </span>
  )
}
