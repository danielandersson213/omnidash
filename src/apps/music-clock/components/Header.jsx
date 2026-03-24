import { useState, useEffect } from 'react'
import styles from './Header.module.css'

function formatTime(d) {
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
}

function formatDate(d) {
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).toUpperCase()
}

export default function Header({ refreshing, progress, onRefresh, totalLoaded, totalCountries }) {
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  const pct = Math.round(progress * 100)

  return (
    <>
      {(refreshing || progress < 1) && (
        <div className="progress-bar" style={{ width: `${pct}%` }} />
      )}

      <header className={styles.header}>
        <div className={styles.left}>
          <div className={styles.liveIndicator}>
            <span className={styles.liveDot} />
            <span className={styles.liveLabel}>LIVE</span>
          </div>
          <h1 className={styles.title}>
            <span className={styles.titleWord}>MUSIC</span>
            <span className={styles.titleWord}>WORLD</span>
            <span className={styles.titleWord}>CLOCK</span>
          </h1>
        </div>

        <div className={styles.center}>
          <div className={styles.clock}>
            <span className={styles.time}>{formatTime(now)}</span>
            <span className={styles.date}>{formatDate(now)} · UTC{now.getTimezoneOffset() <= 0 ? '+' : '-'}{Math.abs(now.getTimezoneOffset() / 60)}</span>
          </div>
          {totalLoaded < totalCountries && (
            <div className={styles.loadStatus}>
              loading {totalLoaded}/{totalCountries} charts…
            </div>
          )}
        </div>

        <div className={styles.right}>
          <div className={styles.stat}>
            <span className={styles.statNum}>{totalLoaded}</span>
            <span className={styles.statLabel}>countries</span>
          </div>
          <button
            className={styles.refreshBtn}
            onClick={onRefresh}
            disabled={refreshing}
            title="Refresh all charts"
          >
            <svg
              width="14" height="14" viewBox="0 0 14 14" fill="none"
              style={{ animation: refreshing ? 'spin 0.8s linear infinite' : 'none' }}
            >
              <path
                d="M13 7A6 6 0 1 1 7 1M7 1l3 3M7 1 4 4"
                stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
              />
            </svg>
            <span>{refreshing ? 'loading' : 'refresh'}</span>
          </button>
        </div>
      </header>
    </>
  )
}
