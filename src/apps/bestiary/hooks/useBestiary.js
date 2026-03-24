import { useState, useEffect, useCallback, useRef } from 'react'

const BASE = '/dnd/api/2014'

export function useBestiary() {
  const [allMonsters, setAllMonsters] = useState([])   // [{index, name}]
  const [filtered, setFiltered]       = useState([])
  const [current, setCurrent]         = useState(null) // full monster data
  const [listLoading, setListLoading] = useState(true)
  const [detailLoading, setDetailLoading] = useState(false)
  const [error, setError]             = useState(null)
  const [search, setSearch]           = useState('')
  const [typeFilter, setTypeFilter]   = useState('all')
  const [selectedIndex, setSelectedIndex] = useState(null)

  const cache    = useRef({})
  const allRef   = useRef([])

  // Load full monster list once
  useEffect(() => {
    fetch(`${BASE}/monsters`)
      .then(r => r.json())
      .then(data => {
        const list = data.results ?? []
        allRef.current = list
        setAllMonsters(list)
        setFiltered(list)
        // Pick a random monster to show on load
        if (list.length) {
          const pick = list[Math.floor(Math.random() * list.length)]
          fetchMonster(pick.index)
        }
      })
      .catch(e => setError(e.message))
      .finally(() => setListLoading(false))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const fetchMonster = useCallback(async (index) => {
    if (cache.current[index]) {
      setCurrent(cache.current[index])
      setSelectedIndex(index)
      return
    }
    setDetailLoading(true)
    try {
      const res  = await fetch(`${BASE}/monsters/${index}`)
      const data = await res.json()
      cache.current[index] = data
      setCurrent(data)
      setSelectedIndex(index)
    } catch (e) {
      console.error('Monster fetch failed:', e)
    } finally {
      setDetailLoading(false)
    }
  }, [])

  // Recompute filtered list whenever search or type changes
  useEffect(() => {
    let list = allRef.current
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(m => m.name.toLowerCase().includes(q))
    }
    setFiltered(list)
  }, [search, typeFilter])

  const rollRandom = useCallback(() => {
    const pool = filtered.length ? filtered : allRef.current
    if (!pool.length) return
    const pick = pool[Math.floor(Math.random() * pool.length)]
    fetchMonster(pick.index)
  }, [filtered, fetchMonster])

  return {
    filtered,
    totalCount: allMonsters.length,
    current,
    listLoading,
    detailLoading,
    error,
    search, setSearch,
    selectedIndex,
    fetchMonster,
    rollRandom,
  }
}
