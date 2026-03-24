import AppShell from '../../portal/AppShell'
import MonsterSidebar from './components/MonsterSidebar'
import StatBlock from './components/StatBlock'
import { useBestiary } from './hooks/useBestiary'
import styles from './BestiaryApp.module.css'

export default function BestiaryApp() {
  const bestiary = useBestiary()

  if (bestiary.error) {
    return (
      <AppShell bodyStyle={{ background: '#0B0909' }}>
        <div className={styles.errorState}>
          <p>Could not reach the D&D 5e API — {bestiary.error}</p>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell bodyStyle={{ background: '#0B0909' }}>
      <div className={styles.app}>
        <MonsterSidebar
          filtered={bestiary.filtered}
          totalCount={bestiary.totalCount}
          listLoading={bestiary.listLoading}
          search={bestiary.search}
          setSearch={bestiary.setSearch}
          selectedIndex={bestiary.selectedIndex}
          fetchMonster={bestiary.fetchMonster}
          rollRandom={bestiary.rollRandom}
          detailLoading={bestiary.detailLoading}
        />

        <main className={styles.main}>
          <div className={styles.card}>
            <StatBlock
              monster={bestiary.current}
              loading={bestiary.detailLoading}
            />
          </div>
        </main>
      </div>
    </AppShell>
  )
}
