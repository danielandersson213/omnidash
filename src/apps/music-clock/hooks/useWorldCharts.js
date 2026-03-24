import { useState, useEffect, useCallback, useMemo } from 'react'
import { COUNTRIES } from '../data/countries'

const CHART_LIMIT = 5
const BATCH_SIZE = 8
const BATCH_DELAY = 250

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms))
}

async function fetchCountryChart(code) {
  try {
    const url = `/charts/${code}/music/most-played/${CHART_LIMIT}/songs.json`
    const res = await fetch(url)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    return { songs: data.feed?.results ?? [], error: null, loading: false, updatedAt: Date.now() }
  } catch (err) {
    return { songs: [], error: err.message, loading: false, updatedAt: Date.now() }
  }
}

function buildSpreadMap(charts) {
  // Map: songKey -> { song, countries }
  const map = {}
  COUNTRIES.forEach(country => {
    const d = charts[country.code]
    if (!d || d.loading || !d.songs.length) return
    const s = d.songs[0]
    const key = `${s.name}|||${s.artistName}`
    if (!map[key]) map[key] = { song: s, countries: [] }
    map[key].countries.push(country.code)
  })
  return Object.values(map).sort((a, b) => b.countries.length - a.countries.length)
}

// Assign a stable color index to each unique top song
function buildColorIndex(spreadData) {
  const idx = {}
  spreadData.forEach((entry, i) => {
    const key = `${entry.song.name}|||${entry.song.artistName}`
    idx[key] = i
  })
  return idx
}

const initialCharts = Object.fromEntries(
  COUNTRIES.map(c => [c.code, { songs: [], error: null, loading: true, updatedAt: null }])
)

export function useWorldCharts() {
  const [charts, setCharts] = useState(initialCharts)
  const [progress, setProgress] = useState(0)
  const [refreshing, setRefreshing] = useState(false)

  const fetchAll = useCallback(async () => {
    setRefreshing(true)
    setProgress(0)
    let done = 0

    for (let i = 0; i < COUNTRIES.length; i += BATCH_SIZE) {
      const batch = COUNTRIES.slice(i, i + BATCH_SIZE)
      const results = await Promise.all(batch.map(c => fetchCountryChart(c.code)))
      setCharts(prev => {
        const next = { ...prev }
        batch.forEach((c, j) => { next[c.code] = results[j] })
        return next
      })
      done += batch.length
      setProgress(done / COUNTRIES.length)
      if (i + BATCH_SIZE < COUNTRIES.length) await sleep(BATCH_DELAY)
    }
    setRefreshing(false)
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  const spreadData = useMemo(() => buildSpreadMap(charts), [charts])
  const colorIndex = useMemo(() => buildColorIndex(spreadData), [spreadData])

  const totalLoaded = Object.values(charts).filter(d => !d.loading).length
  const totalCountries = COUNTRIES.length

  return { charts, spreadData, colorIndex, progress, refreshing, refresh: fetchAll, totalLoaded, totalCountries }
}
