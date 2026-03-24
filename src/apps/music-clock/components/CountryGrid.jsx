import { COUNTRIES, REGIONS } from '../data/countries'
import CountryCard from './CountryCard'
import styles from './CountryGrid.module.css'

export default function CountryGrid({
  charts, colorIndex, selectedSong, onSelectSong, activeRegion, onRegionChange
}) {
  const filtered = activeRegion === 'All'
    ? COUNTRIES
    : COUNTRIES.filter(c => c.region === activeRegion)

  return (
    <div className={styles.wrapper}>
      <div className={styles.controls}>
        <div className={styles.regionTabs}>
          {REGIONS.map(r => (
            <button
              key={r}
              className={`${styles.tab} ${activeRegion === r ? styles.tabActive : ''}`}
              onClick={() => onRegionChange(r)}
            >
              {r}
            </button>
          ))}
        </div>
        <div className={styles.countLabel}>
          {filtered.length} countries
        </div>
      </div>

      <div className={styles.grid}>
        {filtered.map((country, i) => (
          <CountryCard
            key={country.code}
            country={country}
            data={charts[country.code]}
            colorIndex={colorIndex}
            selectedSong={selectedSong}
            onSelectSong={onSelectSong}
            style={{ animationDelay: `${Math.min(i * 0.04, 1.2)}s` }}
          />
        ))}
      </div>
    </div>
  )
}
