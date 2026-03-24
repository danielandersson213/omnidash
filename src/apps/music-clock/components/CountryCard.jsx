import { getSpreadColor, getSongKey } from '../utils/colors'
import { getCountry } from '../data/countries'
import styles from './CountryCard.module.css'

function art(url, size = 300) {
  return url?.replace('100x100bb', `${size}x${size}bb`) ?? ''
}

function genreLabel(song) {
  return song.genres?.[0]?.name ?? ''
}

export default function CountryCard({
  country, data, colorIndex, selectedSong, onSelectSong, style
}) {
  const { loading, songs, error } = data

  const top = songs[0]
  const rest = songs.slice(1)
  const topKey = top ? getSongKey(top) : null
  const color = top ? getSpreadColor(colorIndex, colorIndex[topKey]) : null
  const isHighlighted = selectedSong && top && getSongKey(selectedSong) === topKey

  // Which countries also have this as #1?
  // (passed via colorIndex — color != null means it's globally significant)

  if (loading) return (
    <div className={styles.card} style={style}>
      <div className={styles.cardHead}>
        <span className={styles.flag}>{country.flag}</span>
        <div className={styles.nameBlock}>
          <div className={`skeleton ${styles.skelName}`} />
          <div className={`skeleton ${styles.skelCode}`} />
        </div>
      </div>
      <div className={styles.skelArt} />
      <div className={styles.skelInfo}>
        <div className={`skeleton ${styles.skelTitle}`} />
        <div className={`skeleton ${styles.skelArtist}`} />
      </div>
    </div>
  )

  if (error || !top) return (
    <div className={`${styles.card} ${styles.cardError}`} style={style}>
      <div className={styles.cardHead}>
        <span className={styles.flag}>{country.flag}</span>
        <div className={styles.nameBlock}>
          <span className={styles.countryName}>{country.name}</span>
          <span className={styles.countryCode}>{country.code.toUpperCase()}</span>
        </div>
      </div>
      <div className={styles.errorMsg}>no data</div>
    </div>
  )

  return (
    <div
      className={`${styles.card} ${isHighlighted ? styles.highlighted : ''}`}
      style={{ ...style, '--card-color': color ?? 'var(--accent)' }}
      onClick={() => onSelectSong(isHighlighted ? null : top)}
    >
      {color && <div className={styles.spreadBar} style={{ background: color }} />}

      <div className={styles.cardHead}>
        <span className={styles.flag}>{country.flag}</span>
        <div className={styles.nameBlock}>
          <span className={styles.countryName}>{country.name}</span>
          <span className={styles.countryCode}>{country.code.toUpperCase()}</span>
        </div>
        {color && (
          <div className={styles.spreadDot} style={{ background: color }} title="Shared #1 globally" />
        )}
      </div>

      <div className={styles.mainTrack}>
        <div className={styles.artWrap}>
          <img
            src={art(top.artworkUrl100, 300)}
            alt={top.name}
            className={styles.artImg}
            loading="lazy"
          />
          <div className={styles.rankBadge}>#1</div>
        </div>
        <div className={styles.trackInfo}>
          <div className={styles.songTitle}>{top.name}</div>
          <div className={styles.artistName}>{top.artistName}</div>
          {genreLabel(top) && (
            <div
              className={styles.genreTag}
              style={color ? { color, borderColor: color, background: `${color}15` } : {}}
            >
              {genreLabel(top)}
            </div>
          )}
        </div>
      </div>

      {rest.length > 0 && (
        <ol className={styles.restList}>
          {rest.map((s, i) => (
            <li key={s.id ?? i} className={styles.restItem}>
              <span className={styles.restRank}>{i + 2}</span>
              <span className={styles.restTitle}>{s.name}</span>
              <span className={styles.restArtist}>{s.artistName}</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}
