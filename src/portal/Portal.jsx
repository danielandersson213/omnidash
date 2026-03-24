import { useNavigate } from 'react-router-dom'
import './Portal.css'

const APPS = [
  {
    id: 'zenith',
    path: '/zenith',
    name: 'Zenith',
    tagline: 'World map · Satellites · Lunar phase',
    description: 'Live interactive world map with real-time satellite tracking, city weather, and moon cycle data.',
    icon: '🌍',
    accent: '#5a8ab0',
    bg: 'radial-gradient(ellipse at 30% 60%, rgba(90,138,176,0.15) 0%, transparent 70%)',
  },
  {
    id: 'reddit',
    path: '/reddit',
    name: 'Reddit Mood Ring',
    tagline: 'Sentiment · Subreddits · Vibe',
    description: 'Reads the emotional pulse of Reddit across 17 major subreddits and surfaces the collective mood.',
    icon: '🔮',
    accent: '#c4723a',
    bg: 'radial-gradient(ellipse at 70% 40%, rgba(196,114,58,0.15) 0%, transparent 70%)',
  },
  {
    id: 'music',
    path: '/music',
    name: 'Music World Clock',
    tagline: 'Charts · 38 countries · Apple Music',
    description: 'Real-time Apple Music chart data from 38 countries, showing what the world is listening to right now.',
    icon: '🎵',
    accent: '#e8a020',
    bg: 'radial-gradient(ellipse at 50% 70%, rgba(232,160,32,0.15) 0%, transparent 70%)',
  },
  {
    id: 'github',
    path: '/github',
    name: 'GitHub Trending',
    tagline: 'Repos · Languages · Stars',
    description: 'Top trending repositories on GitHub right now, filtered by language and timeframe.',
    icon: '⌥',
    accent: '#3fb950',
    bg: 'radial-gradient(ellipse at 60% 40%, rgba(63,185,80,0.12) 0%, transparent 70%)',
  },
]

export default function Portal() {
  const navigate = useNavigate()

  return (
    <div className="portal">
      <header className="portal-header">
        <div className="portal-logo">
          <span className="portal-logo-mark">◈</span>
          <span className="portal-logo-name">OmniDash</span>
        </div>
        <p className="portal-sub">Your personal live data dashboard</p>
      </header>

      <main className="portal-grid">
        {APPS.map((app) => (
          <button
            key={app.id}
            className="portal-card"
            style={{ '--card-accent': app.accent, '--card-bg': app.bg }}
            onClick={() => navigate(app.path)}
          >
            <div className="card-glow" />
            <div className="card-icon">{app.icon}</div>
            <div className="card-body">
              <h2 className="card-name">{app.name}</h2>
              <p className="card-tagline">{app.tagline}</p>
              <p className="card-desc">{app.description}</p>
            </div>
            <div className="card-arrow">→</div>
          </button>
        ))}
      </main>
    </div>
  )
}
