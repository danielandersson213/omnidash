import { useMemo } from 'react'
import { COUNTRIES } from '../data/countries'
import styles from './GenreBreakdown.module.css'

const GENRE_COLORS = {
  'Pop': '#4D96FF',
  'Hip-Hop/Rap': '#FF6B6B',
  'R&B/Soul': '#C77DFF',
  'Rock': '#FF922B',
  'Electronic': '#20C997',
  'Latin': '#FFD93D',
  'K-Pop': '#F06595',
  'Country': '#A9E34B',
  'Dance': '#74C0FC',
  'Alternative': '#FF6B35',
  'J-Pop': '#FAB005',
  'Metal': '#1EC9E8',
  'Reggaeton': '#6BCB77',
}

function getGenreColor(name) {
  return GENRE_COLORS[name] ?? '#7A736A'
}

export default function GenreBreakdown({ charts }) {
  const genreCounts = useMemo(() => {
    const counts = {}
    COUNTRIES.forEach(c => {
      const d = charts[c.code]
      if (!d || d.loading || !d.songs.length) return
      d.songs.forEach((song, i) => {
        const genre = song.genres?.[0]?.name
        if (!genre) return
        const weight = 5 - i // #1 counts more
        counts[genre] = (counts[genre] ?? 0) + weight
      })
    })
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 12)
  }, [charts])

  if (!genreCounts.length) return null

  const max = genreCounts[0][1]
  const total = genreCounts.reduce((s, [, v]) => s + v, 0)

  return (
    <div className={styles.section}>
      <div className={styles.header}>
        <span className={styles.label}>GENRE LANDSCAPE</span>
        <span className={styles.sub}>weighted by chart position across all countries</span>
      </div>

      <div className={styles.bars}>
        {genreCounts.map(([genre, count]) => (
          <div key={genre} className={styles.row}>
            <div className={styles.genreName}>{genre}</div>
            <div className={styles.barWrap}>
              <div
                className={styles.bar}
                style={{
                  width: `${(count / max) * 100}%`,
                  background: getGenreColor(genre),
                }}
              />
            </div>
            <div className={styles.pct} style={{ color: getGenreColor(genre) }}>
              {Math.round((count / total) * 100)}%
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
