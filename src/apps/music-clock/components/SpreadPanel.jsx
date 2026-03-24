import { getSpreadColor, getSongKey } from '../utils/colors'
import { getCountry, COUNTRIES } from '../data/countries'
import styles from './SpreadPanel.module.css'

function art(url, size = 400) {
  return url?.replace('100x100bb', `${size}x${size}bb`) ?? ''
}

function genreLabel(song) {
  return song.genres?.[0]?.name ?? ''
}

export default function SpreadPanel({ song, spreadData, charts, colorIndex, onClose }) {
  if (!song) return null

  const key = getSongKey(song)
  const color = getSpreadColor(colorIndex, colorIndex[key])
  const entry = spreadData.find(d => getSongKey(d.song) === key)
  const countries = entry?.countries ?? []

  // Also find where the song appears in top 5 (not #1)
  const inTop5 = []
  COUNTRIES.forEach(c => {
    const d = charts[c.code]
    if (!d || d.loading) return
    const pos = d.songs.findIndex(s => getSongKey(s) === key)
    if (pos === 0) return // already counted above
    if (pos > 0) inTop5.push({ country: getCountry(c.code), position: pos + 1 })
  })
  inTop5.sort((a, b) => a.position - b.position)

  const domColor = color ?? 'var(--accent)'

  return (
    <div className={styles.panel} style={{ '--panel-color': domColor }}>
      <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </button>

      <div className={styles.panelInner}>
        {/* Art + info */}
        <div className={styles.hero}>
          <div className={styles.artWrap}>
            <img src={art(song.artworkUrl100)} alt={song.name} className={styles.art} />
            <div className={styles.artGlow} style={{ background: domColor }} />
          </div>
          <div className={styles.heroInfo}>
            <div className={styles.heroTitle}>{song.name}</div>
            <div className={styles.heroArtist}>{song.artistName}</div>
            {genreLabel(song) && (
              <div className={styles.heroGenre} style={{ color: domColor, borderColor: domColor, background: `${domColor}18` }}>
                {genreLabel(song)}
              </div>
            )}
            <div className={styles.heroCounts}>
              <div className={styles.heroCount} style={{ color: domColor }}>
                <span className={styles.heroNum}>{countries.length}</span>
                <span className={styles.heroLabel}>at #1</span>
              </div>
              {inTop5.length > 0 && (
                <div className={styles.heroCount}>
                  <span className={styles.heroNum}>{inTop5.length}</span>
                  <span className={styles.heroLabel}>in top 5</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Countries at #1 */}
        {countries.length > 0 && (
          <div className={styles.section}>
            <div className={styles.sectionTitle}>
              <div className={styles.dot} style={{ background: domColor }} />
              At #1 in {countries.length} {countries.length === 1 ? 'country' : 'countries'}
            </div>
            <div className={styles.countryList}>
              {countries.map(code => {
                const c = getCountry(code)
                if (!c) return null
                return (
                  <div key={code} className={styles.countryRow}>
                    <span className={styles.cFlag}>{c.flag}</span>
                    <span className={styles.cName}>{c.name}</span>
                    <span className={styles.cRegion}>{c.region}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Also in top 5 */}
        {inTop5.length > 0 && (
          <div className={styles.section}>
            <div className={styles.sectionTitle}>
              <div className={styles.dot} style={{ background: 'var(--text-muted)' }} />
              Also charting in top 5
            </div>
            <div className={styles.countryList}>
              {inTop5.slice(0, 12).map(({ country, position }) => (
                <div key={country.code} className={styles.countryRow}>
                  <span className={styles.cFlag}>{country.flag}</span>
                  <span className={styles.cName}>{country.name}</span>
                  <span className={styles.cPos}>#{position}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Spread bar */}
        {countries.length + inTop5.length > 0 && (
          <div className={styles.spreadViz}>
            <div className={styles.spreadLabel}>reach</div>
            <div className={styles.spreadBar}>
              <div
                className={styles.spreadFill}
                style={{
                  width: `${((countries.length + inTop5.length) / COUNTRIES.length) * 100}%`,
                  background: domColor,
                }}
              />
            </div>
            <div className={styles.spreadPct} style={{ color: domColor }}>
              {Math.round(((countries.length + inTop5.length) / COUNTRIES.length) * 100)}%
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
