import styles from './MonsterSidebar.module.css'

export default function MonsterSidebar({
  filtered, totalCount, listLoading, search, setSearch,
  selectedIndex, fetchMonster, rollRandom, detailLoading,
}) {
  return (
    <div className={styles.sidebar}>
      {/* Title + roll */}
      <div className={styles.top}>
        <div className={styles.titleRow}>
          <span className={styles.titleGlyph}>⚔</span>
          <span className={styles.title}>Bestiary</span>
        </div>
        <button
          className={styles.rollBtn}
          onClick={rollRandom}
          disabled={detailLoading || listLoading}
        >
          <span className={styles.rollIcon} aria-hidden>⬡</span>
          Roll Random
        </button>
      </div>

      {/* Search */}
      <div className={styles.searchWrap}>
        <input
          type="text"
          className={styles.search}
          placeholder="Search creatures…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        {search && (
          <button className={styles.clearBtn} onClick={() => setSearch('')}>✕</button>
        )}
      </div>

      {/* Count */}
      <div className={styles.count}>
        {listLoading
          ? 'Loading…'
          : `${filtered.length} of ${totalCount} creatures`}
      </div>

      {/* Monster list */}
      <div className={styles.list}>
        {filtered.map(m => (
          <button
            key={m.index}
            className={styles.item}
            data-active={m.index === selectedIndex ? 'true' : 'false'}
            onClick={() => fetchMonster(m.index)}
          >
            {m.name}
          </button>
        ))}
        {!listLoading && filtered.length === 0 && (
          <p className={styles.noResults}>No creatures found</p>
        )}
      </div>
    </div>
  )
}
