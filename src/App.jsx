import { Routes, Route } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import Portal from './portal/Portal'

const ZenithApp = lazy(() => import('./apps/zenith/ZenithApp'))
const RedditApp = lazy(() => import('./apps/reddit-mood/RedditApp'))
const MusicApp = lazy(() => import('./apps/music-clock/MusicApp'))
const GithubApp = lazy(() => import('./apps/github-trending/GithubApp'))

function AppLoader() {
  return (
    <div style={{
      width: '100vw', height: '100vh', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      background: '#08090f', color: '#4f8ef7',
      fontFamily: 'system-ui', letterSpacing: '0.1em', fontSize: '14px',
    }}>
      Loading…
    </div>
  )
}

export default function App() {
  return (
    <Suspense fallback={<AppLoader />}>
      <Routes>
        <Route path="/" element={<Portal />} />
        <Route path="/zenith" element={<ZenithApp />} />
        <Route path="/reddit" element={<RedditApp />} />
        <Route path="/music" element={<MusicApp />} />
        <Route path="/github" element={<GithubApp />} />
      </Routes>
    </Suspense>
  )
}
