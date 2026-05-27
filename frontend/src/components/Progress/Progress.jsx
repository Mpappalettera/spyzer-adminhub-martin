import clsx from 'clsx'
import styles from './Progress.module.css'

export function Progress({ value = 0, trend = 'neutral', className }) {
  // Asegurar que el valor esté entre 0 y 100
  const normalizedValue = Math.min(100, Math.max(0, value))

  const trendClass = {
    up: styles.trendUp,
    down: styles.trendDown,
    neutral: styles.trendNeutral,
  }[trend] || styles.trendNeutral

  return (
    <div className={clsx(styles.progressRoot, className)} data-slot="progress">
      <div
        className={clsx(styles.progressIndicator, trendClass)}
        style={{ width: `${normalizedValue}%` }}
        data-slot="progress-indicator"
      />
    </div>
  )
}
