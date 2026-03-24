import { useState } from 'react'
import { useWorldCharts } from './hooks/useWorldCharts'
import Header from './components/Header'
import GlobalPulse from './components/GlobalPulse'
import CountryGrid from './components/CountryGrid'
import SpreadPanel from './components/SpreadPanel'
import GenreBreakdown from './components/GenreBreakdown'
import styles from './App.module.css'
import AppShell from '../../portal/AppShell'

export default function App() {
  const { charts, spreadData, colorIndex, progress, refreshing, refresh, totalLoaded, totalCountries } = useWorldCharts()
  const [selectedSong, setSelectedSong] = useState(null)
  const [activeRegion, setActiveRegion] = useState('All')

  return (
    <AppShell bodyStyle={{ background: '#0D0C0B', fontFamily: "'Syne', sans-serif", color: '#EAE4D9' }}>
    <div className={styles.app}>
      <Header
        refreshing={refreshing}
        progress={progress}
        onRefresh={refresh}
        totalLoaded={totalLoaded}
        totalCountries={totalCountries}
      />

      <GlobalPulse
        spreadData={spreadData}
        colorIndex={colorIndex}
        selectedSong={selectedSong}
        onSelectSong={setSelectedSong}
      />

      <main className={styles.main}>
        <div className={styles.content}>
          <div className={styles.gridArea}>
            <CountryGrid
              charts={charts}
              colorIndex={colorIndex}
              selectedSong={selectedSong}
              onSelectSong={setSelectedSong}
              activeRegion={activeRegion}
              onRegionChange={setActiveRegion}
            />
          </div>

          {selectedSong && (
            <SpreadPanel
              song={selectedSong}
              spreadData={spreadData}
              charts={charts}
              colorIndex={colorIndex}
              onClose={() => setSelectedSong(null)}
            />
          )}
        </div>

        <GenreBreakdown charts={charts} />
      </main>
    </div>
    </AppShell>
  )
}
