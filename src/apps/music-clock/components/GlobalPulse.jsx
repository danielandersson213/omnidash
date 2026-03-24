import { getSpreadColor, getSongKey } from '../utils/colors'
import { getCountry } from '../data/countries'
import styles from './GlobalPulse.module.css'

function art(url, size = 300) {
  return url?.replace('100x100bb', `${size}x${size}bb`) ?? ''
}

export default function GlobalPulse({ spreadData, colorIndex, selectedSong, onSelectSong }) {
  // Only show songs that dominate 2+ countries
  const global = spreadData.filter(d => d.countries.length >= 2).slice(0, 12)

  if (!global.length) return (
    <div className={styles.pulse}>
      <div className={styles.empty}>
        <span className={styles.label}>GLOBAL PULSE</span>
        <span className={styles.emptyText}>— loading charts…</span>
      </div>
    </div>
  )

  return (
    <div className={styles.pulse}>
      <div className={styles.inner}>
        <div className={styles.sectionLabel}>
          <span className={styles.label}>GLOBAL PULSE</span>
          <span className={styles.sub}>songs dominating multiple countries right now</span>
        </div>

        <div className={styles.strip}>
          {global.map((entry, i) => {
            const key = getSongKey(entry.song)
            const color = getSpreadColor(colorIndex, colorIndex[key])
            const isSelected = selectedSong && getSongKey(selectedSong) === key
            const topCountries = entry.countries.slice(0, 6).map(c => getCountry(c)).filter(Boolean)

            return (
              <button
                key={key}
                className={`${styles.item} ${isSelected ? styles.itemSelected : ''}`}
                onClick={() => onSelectSong(isSelected ? null : entry.song)}
                style={{ '--item-color': color }}
              >
                <div className={styles.rank}>#{i + 1}</div>
                <div className={styles.artWrap}>
                  <img
                    src={art(entry.song.artworkUrl100, 120)}
                    alt=""
                    className={styles.art}
                    loading="lazy"
                  />
                  <div className={styles.countBadge} style={{ background: color }}>
                    {entry.countries.length}
                  </div>
                </div>
                <div className={styles.info}>
                  <div className={styles.songName}>{entry.song.name}</div>
                  <div className={styles.artistName}>{entry.song.artistName}</div>
                  <div className={styles.flags}>
                    {topCountries.map(c => (
                      <span key={c.code} title={c.name}>{c.flag}</span>
                    ))}
                    {entry.countries.length > 6 && (
                      <span className={styles.more}>+{entry.countries.length - 6}</span>
                    )}
                  </div>
                </div>
                <div className={styles.colorBar} style={{ background: color }} />
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
