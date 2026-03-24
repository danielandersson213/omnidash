import { useState, useEffect, useCallback, useRef } from 'react'
import AppShell from '../../portal/AppShell'
import './GithubApp.css'

// ── Constants ──────────────────────────────────────────────────────────────

const LANGUAGES = [
  { id: '',           label: 'All'        },
  { id: 'javascript', label: 'JavaScript' },
  { id: 'typescript', label: 'TypeScript' },
  { id: 'python',     label: 'Python'     },
  { id: 'rust',       label: 'Rust'       },
  { id: 'go',         label: 'Go'         },
  { id: 'java',       label: 'Java'       },
  { id: 'c++',        label: 'C++'        },
  { id: 'c',          label: 'C'          },
  { id: 'swift',      label: 'Swift'      },
  { id: 'kotlin',     label: 'Kotlin'     },
  { id: 'ruby',       label: 'Ruby'       },
  { id: 'php',        label: 'PHP'        },
  { id: 'shell',      label: 'Shell'      },
  { id: 'react',      label: 'React',      topic: 'react'      },
  { id: 'vue',        label: 'Vue',        topic: 'vue'        },
  { id: 'nextjs',     label: 'Next.js',    topic: 'nextjs'     },
]

const TIMEFRAMES = [
  { id: 1,  label: 'Today'      },
  { id: 7,  label: 'This week'  },
  { id: 30, label: 'This month' },
]

// GitHub language colors (subset)
const LANG_COLORS = {
  JavaScript: '#f1e05a',
  TypeScript: '#3178c6',
  Python:     '#3572A5',
  Rust:       '#dea584',
  Go:         '#00ADD8',
  Java:       '#b07219',
  'C++':      '#f34b7d',
  C:          '#555555',
  Swift:      '#F05138',
  Kotlin:     '#A97BFF',
  Ruby:       '#701516',
  PHP:        '#4F5D95',
  Shell:      '#89e051',
  HTML:       '#e34c26',
  CSS:        '#563d7c',
  Dockerfile: '#384d54',
  Vue:        '#41b883',
  Svelte:     '#ff3e00',
}

// ── Data fetching ──────────────────────────────────────────────────────────

function daysAgoISO(n) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString().slice(0, 10)
}

async function fetchSearch(query) {
  const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&sort=stars&order=desc&per_page=25`
  const res = await fetch(url, {
    headers: { Accept: 'application/vnd.github+json' },
  })
  if (!res.ok) {
    if (res.status === 403) throw new Error('Rate limited — try again in a minute')
    throw new Error(`GitHub API error ${res.status}`)
  }
  const data = await res.json()
  return data.items.map(r => ({
    id:          r.id,
    fullName:    r.full_name,
    owner:       r.owner.login,
    name:        r.name,
    description: r.description,
    url:         r.html_url,
    stars:       r.stargazers_count,
    forks:       r.forks_count,
    language:    r.language,
    topics:      r.topics?.slice(0, 3) ?? [],
    avatar:      r.owner.avatar_url,
    createdAt:   r.created_at,
    license:     r.license?.spdx_id ?? null,
  }))
}

async function fetchTrending(language, days) {
  const filter = LANGUAGES.find(l => l.id === language)
  const filterPart = !filter || !filter.id ? ''
    : filter.topic ? `+topic:${filter.topic}`
    : `+language:${filter.id}`
  const url = `https://api.github.com/search/repositories?q=created:>${daysAgoISO(days)}${filterPart}&sort=stars&order=desc&per_page=25`
  const res = await fetch(url, {
    headers: { Accept: 'application/vnd.github+json' },
  })
  if (!res.ok) {
    if (res.status === 403) throw new Error('Rate limited — try again in a minute')
    throw new Error(`GitHub API error ${res.status}`)
  }
  const data = await res.json()
  return data.items.map(r => ({
    id:          r.id,
    fullName:    r.full_name,
    owner:       r.owner.login,
    name:        r.name,
    description: r.description,
    url:         r.html_url,
    stars:       r.stargazers_count,
    forks:       r.forks_count,
    language:    r.language,
    topics:      r.topics?.slice(0, 3) ?? [],
    avatar:      r.owner.avatar_url,
    createdAt:   r.created_at,
    license:     r.license?.spdx_id ?? null,
  }))
}

// ── Helpers ────────────────────────────────────────────────────────────────

function fmt(n) {
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k'
  return String(n)
}

function daysAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime()
  const d = Math.floor(diff / 86400000)
  if (d === 0) return 'today'
  if (d === 1) return 'yesterday'
  return `${d}d ago`
}

// ── Components ─────────────────────────────────────────────────────────────

function LangDot({ language }) {
  const color = LANG_COLORS[language] ?? '#666'
  return <span className="lang-dot" style={{ background: color }} />
}

function RepoCard({ repo, rank }) {
  return (
    <a
      className="repo-card"
      href={repo.url}
      target="_blank"
      rel="noopener noreferrer"
    >
      <div className="repo-rank">#{rank}</div>

      <div className="repo-top">
        <img className="repo-avatar" src={repo.avatar} alt={repo.owner} loading="lazy" />
        <div className="repo-name-wrap">
          <span className="repo-owner">{repo.owner}</span>
          <span className="repo-sep">/</span>
          <span className="repo-name">{repo.name}</span>
        </div>
        <span className="repo-arrow">↗</span>
      </div>

      {repo.description && (
        <p className="repo-desc">{repo.description}</p>
      )}

      {repo.topics.length > 0 && (
        <div className="repo-topics">
          {repo.topics.map(t => <span key={t} className="repo-topic">{t}</span>)}
        </div>
      )}

      <div className="repo-meta">
        {repo.language && (
          <span className="repo-lang">
            <LangDot language={repo.language} />
            {repo.language}
          </span>
        )}
        <span className="repo-stat">⭐ {fmt(repo.stars)}</span>
        <span className="repo-stat">⑂ {fmt(repo.forks)}</span>
        {repo.license && <span className="repo-stat repo-license">{repo.license}</span>}
        <span className="repo-created">{daysAgo(repo.createdAt)}</span>
      </div>
    </a>
  )
}

function Skeleton() {
  return (
    <div className="repo-card skeleton">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="skel-line" style={{ width: `${[60, 90, 75, 40][i]}%` }} />
      ))}
    </div>
  )
}

// ── App ────────────────────────────────────────────────────────────────────

export default function GithubApp() {
  const [language,    setLanguage]    = useState('')
  const [days,        setDays]        = useState(7)
  const [repos,       setRepos]       = useState([])
  const [loading,     setLoading]     = useState(true)
  const [error,       setError]       = useState(null)
  const [query,       setQuery]       = useState('')
  const [activeQuery, setActiveQuery] = useState('')
  const inputRef = useRef(null)

  const loadTrending = useCallback(async (lang, d) => {
    setLoading(true)
    setError(null)
    try {
      setRepos(await fetchTrending(lang, d))
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  const loadSearch = useCallback(async (q) => {
    setLoading(true)
    setError(null)
    try {
      setRepos(await fetchSearch(q))
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!activeQuery) loadTrending(language, days)
  }, [language, days, activeQuery, loadTrending])

  useEffect(() => {
    if (activeQuery) loadSearch(activeQuery)
  }, [activeQuery, loadSearch])

  function handleSearch(e) {
    e.preventDefault()
    const q = query.trim()
    if (q) setActiveQuery(q)
  }

  function clearSearch() {
    setQuery('')
    setActiveQuery('')
    inputRef.current?.focus()
  }

  const timeLabel = TIMEFRAMES.find(t => t.id === days)?.label ?? ''
  const subLabel = loading ? 'Fetching…'
    : error ? 'Error'
    : activeQuery ? `${repos.length} results for "${activeQuery}"`
    : `${repos.length} repos · ${timeLabel.toLowerCase()}`

  return (
    <AppShell bodyStyle={{ background: '#0a0d14', color: '#cdd6e0', fontFamily: 'system-ui, sans-serif' }}>
      <div className="gh-root">

        <header className="gh-header">
          <div className="gh-title-row">
            <span className="gh-icon">⌥</span>
            <h1 className="gh-title">GitHub Trending</h1>
          </div>
          <p className="gh-sub">{subLabel}</p>
        </header>

        <div className="gh-controls">
          <form className="gh-search-row" onSubmit={handleSearch}>
            <input
              ref={inputRef}
              className="gh-search"
              type="text"
              placeholder="Search repositories…"
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
            {activeQuery
              ? <button type="button" className="gh-search-clear" onClick={clearSearch} title="Clear search">✕</button>
              : <button type="submit" className="gh-search-btn" disabled={!query.trim()}>Search</button>
            }
          </form>

          {!activeQuery && (
            <>
              <div className="gh-pill-group">
                {TIMEFRAMES.map(t => (
                  <button
                    key={t.id}
                    className={`gh-pill${days === t.id ? ' active' : ''}`}
                    onClick={() => setDays(t.id)}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              <div className="gh-lang-row">
                {LANGUAGES.map(l => (
                  <button
                    key={l.id}
                    className={`gh-lang-btn${language === l.id ? ' active' : ''}`}
                    onClick={() => setLanguage(l.id)}
                  >
                    {l.id && <LangDot language={l.label} />}
                    {l.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {error ? (
          <div className="gh-error">
            <span>⚠</span>
            <p>{error}</p>
          </div>
        ) : (
          <div className="gh-grid">
            {loading
              ? Array.from({ length: 12 }).map((_, i) => <Skeleton key={i} />)
              : repos.map((repo, i) => <RepoCard key={repo.id} repo={repo} rank={i + 1} />)
            }
          </div>
        )}

      </div>
    </AppShell>
  )
}
