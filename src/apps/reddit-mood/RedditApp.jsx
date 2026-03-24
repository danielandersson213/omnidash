import { useState, useEffect, useRef, useCallback } from 'react'
import './RedditApp.css'
import AppShell from '../../portal/AppShell'

// ── Constants ──────────────────────────────────────────────────────────────

const SUBREDDITS = [
  { name: 'aww', label: 'aww' },
  { name: 'funny', label: 'funny' },
  { name: 'worldnews', label: 'worldnews' },
  { name: 'gaming', label: 'gaming' },
  { name: 'todayilearned', label: 'todayilearned' },
  { name: 'AskReddit', label: 'AskReddit' },
  { name: 'politics', label: 'politics' },
  { name: 'science', label: 'science' },
  { name: 'movies', label: 'movies' },
  { name: 'technology', label: 'technology' },
  { name: 'wholesomememes', label: 'wholesomememes' },
  { name: 'AmItheAsshole', label: 'AITA' },
  { name: 'mildlyinteresting', label: 'mildlyinteresting' },
  { name: 'relationship_advice', label: 'relationship_advice' },
  { name: 'space', label: 'space' },
  { name: 'Showerthoughts', label: 'Showerthoughts' },
  { name: 'news', label: 'news' },
  { name: 'interestingasfuck', label: 'interestingasfuck' },
]

const MOOD_KEYWORDS = {
  wholesome: ['cute','adorable','sweet','heartwarming','kind','love','puppy','kitten','baby','helped','grateful','beautiful','rescue','wholesome','precious','wonderful','amazing','bless','happy','joy','smile','friend','support','comfort','hug'],
  happy:     ['lol','funny','hilarious','haha','great','awesome','best','win','success','celebrate','perfect','incredible','fantastic','excited','thrilled','good','nice','brilliant','legend','genius','wow'],
  angry:     ['wtf','terrible','awful','disgusting','outrage','banned','wrong','corrupt','lie','hate','worst','unacceptable','shameful','incompetent','disgusted','ridiculous','pathetic','scam','fraud','abuse','evil','stupid','idiot','garbage','trash','criminal'],
  sad:       ['rip','died','death','cancer','loss','tragedy','sad','heartbreak','passed','missing','gone','unfortunate','depressing','grief','devastating','mourning','dead','killed','suffer','painful','hurt'],
  chaotic:   ['breaking','urgent','chaos','disaster','emergency','attack','shocking','unprecedented','drama','explosion','crash','war','crisis','collapse','riot','protest','leaked','exposed','scandal','insane','crazy','wild'],
  anxious:   ['worried','concern','warning','risk','danger','threat','fear','uncertain','alert','serious','problem','struggling','stress','anxiety','panic','scary','afraid','nervous','trouble','failed'],
  chill:     ['relaxing','peaceful','calm','nature','scenery','gentle','quiet','serene','cozy','comfortable','simple','easy','slow','garden','sunset','sunrise','beach','forest','clouds','rain','tea','coffee'],
  curious:   ['interesting','fascinating','weird','strange','odd','discovered','found','new','never','first','mystery','unknown','surprising','unexpected','til','fact','study','research','explain','actually','apparently'],
}

const MOOD_CONFIG = {
  wholesome: { label: 'Wholesome', color: '#ff7eb3', glow: '#e0457a', bg: 'rgba(40,5,20,0.6)',  desc: 'warm and fuzzy all over' },
  happy:     { label: 'Happy',     color: '#ffd700', glow: '#cc9900', bg: 'rgba(40,35,0,0.6)', desc: 'upbeat and riding high' },
  angry:     { label: 'Angry',     color: '#ff4455', glow: '#bb0011', bg: 'rgba(40,0,5,0.6)',  desc: 'fired up and volatile' },
  sad:       { label: 'Melancholy',color: '#5599ff', glow: '#1155cc', bg: 'rgba(0,5,30,0.6)',  desc: 'heavy and blue' },
  chaotic:   { label: 'Chaotic',   color: '#cc44ff', glow: '#8800cc', bg: 'rgba(20,0,40,0.6)', desc: 'spinning out of control' },
  anxious:   { label: 'Anxious',   color: '#ffaa33', glow: '#bb6600', bg: 'rgba(35,20,0,0.6)', desc: 'tense and on edge' },
  chill:     { label: 'Chill',     color: '#44ddaa', glow: '#009966', bg: 'rgba(0,25,15,0.6)', desc: 'calm and easy going' },
  curious:   { label: 'Curious',   color: '#44ccff', glow: '#0088cc', bg: 'rgba(0,15,30,0.6)', desc: 'full of wonder' },
}

const MOOD_EMOJI = {
  wholesome: ['🥰','💕','🐶','🐱','✨','💖','🌸','🤗','🫶','🌼'],
  happy:     ['😄','🎉','🙌','🎊','😂','🔥','✨','🥳','⭐','🎈'],
  angry:     ['😤','💢','🔥','😡','💥','😠','🤬','⚡','🌋','👊'],
  sad:       ['😔','💧','🌧️','😢','💙','🌊','😞','💔','🫂','🥀'],
  chaotic:   ['💥','🤯','🌀','😵','⚡','🔥','💫','🤪','🫠','🎭'],
  anxious:   ['😬','😰','⚠️','😟','🫣','😧','💦','😦','🧠','🌪️'],
  chill:     ['😌','🌿','🍃','✨','🌊','☁️','🫧','🌙','🍵','🌅'],
  curious:   ['🤔','🔍','💡','🧐','✨','🌟','🔭','📚','🤓','🌌'],
}

const FORECAST_LINES = {
  wholesome: [
    'Warmth front moving in from r/aww. Tissues advised.',
    '78% chance of dog photos through the evening.',
    'High pressure system of good vibes. Low turbulence.',
    'Scattered kindness with a chance of crying happy tears.',
  ],
  happy: [
    'Peak comedic activity expected. Stay hydrated.',
    'Clear skies, good memes. Optimal scrolling conditions.',
    'Elevated win rate across most major subreddits.',
    '90% chance of someone having an incredible day.',
  ],
  angry: [
    'Thunderstorm of hot takes. Seek shelter in r/aww.',
    'Category 3 discourse event forming. Do NOT read comments.',
    'Elevated temperature across political subreddits.',
    'Storm advisory: controversial opinion incoming.',
  ],
  sad: [
    'Low pressure front. Stock up on comfort media.',
    'Overcast with a chance of RIP threads.',
    'Melancholy conditions. Hug someone you love.',
    'Extended period of heavy feelings expected.',
  ],
  chaotic: [
    'Unstable conditions. Anything could happen.',
    'Scattered controversy with a 40% chance of drama.',
    'Multiple weather systems colliding. Absolute chaos.',
    'Turbulence warning: do not attempt to follow all threads.',
  ],
  anxious: [
    'Elevated concern levels across most sectors.',
    'Moderate to severe worry index. Breathe.',
    'Warning: doom-scrolling conditions are favorable.',
    'High stress pressure system. Touch grass advised.',
  ],
  chill: [
    'Peaceful conditions. Great day to exist online.',
    'Mild vibes, mostly harmless. 5/5 recommend.',
    'Smooth sailing expected through the evening.',
    'Low drama index. Everyone seems... fine?',
  ],
  curious: [
    'Peak TIL activity. Prepare to learn something useless.',
    'High wonder index. Rabbit holes are forming.',
    'Strong fascination front moving in from r/space.',
    '65% chance of spending 3 hours reading Wikipedia.',
  ],
}

const TENSION_LINES = [
  (a, b) => `r/${a.label} (${a.mood}) is arm-wrestling r/${b.label} (${b.mood})`,
  (a, b) => `r/${a.label} vs r/${b.label} — pick your fighter`,
  (a, b) => `r/${a.label} and r/${b.label} are vibing on completely different planets`,
  (a, b) => `r/${a.label} sent r/${b.label} a strongly worded letter`,
  (a, b) => `r/${a.label} (${a.mood}) and r/${b.label} (${b.mood}) need to talk`,
]

const STOP_WORDS = new Set([
  'the','a','an','in','on','at','to','for','of','and','or','but','is','are',
  'was','were','be','been','has','have','had','do','does','did','will','would',
  'could','should','may','might','it','its','this','that','these','those','i',
  'you','he','she','we','they','me','him','her','us','them','my','your','his',
  'our','their','what','which','who','when','where','why','how','all','each',
  'every','both','few','more','most','other','some','such','no','not','only',
  'same','so','than','too','very','just','with','from','by','as','about','up',
  'out','if','after','before','into','over','under','now','then','here','there',
  'because','while','since','until','between','against','without','within',
  'get','got','new','like','one','two','can','also','been','after','about',
  'people','make','time','know','year','years','day','way','back','go','going',
  'say','says','said','think','want','use','s','t','re','ve','ll','man','guy',
])

// ── Helpers ────────────────────────────────────────────────────────────────

function scoreTitles(titles) {
  const scores = Object.fromEntries(Object.keys(MOOD_KEYWORDS).map(m => [m, 0]))
  const words = titles.join(' ').toLowerCase().split(/\W+/)
  for (const word of words) {
    for (const [mood, keywords] of Object.entries(MOOD_KEYWORDS)) {
      if (keywords.includes(word)) scores[mood]++
    }
  }
  return scores
}

function getDominantMood(scores) {
  let best = 'chill', bestScore = -1
  for (const [mood, score] of Object.entries(scores)) {
    if (score > bestScore) { bestScore = score; best = mood }
  }
  return best
}

function getConfidence(scores, winner) {
  const total = Object.values(scores).reduce((a, b) => a + b, 0)
  return total === 0 ? 0 : (scores[winner] || 0) / total
}

function getConfidenceAdverb(c) {
  if (c > 0.45) return 'overwhelmingly'
  if (c > 0.30) return 'strongly'
  if (c > 0.20) return 'mostly'
  return 'slightly'
}

function getTopTitlesForMood(subredditResults, mood) {
  const keywords = MOOD_KEYWORDS[mood] || []
  const scored = []
  for (const sub of subredditResults) {
    for (const title of (sub.titles || [])) {
      const words = title.toLowerCase().split(/\W+/)
      const hits = words.filter(w => keywords.includes(w)).length
      if (hits > 0) scored.push({ title, sub: sub.label, hits })
    }
  }
  return scored.sort((a, b) => b.hits - a.hits).slice(0, 5)
}

function getTension(results) {
  const moodGroups = {}
  for (const sub of results) {
    if (!moodGroups[sub.mood]) moodGroups[sub.mood] = []
    moodGroups[sub.mood].push(sub)
  }
  const moods = Object.keys(moodGroups).sort((a, b) => moodGroups[b].length - moodGroups[a].length)
  if (moods.length < 2) return null
  const a = moodGroups[moods[0]][0]
  const b = moodGroups[moods[1]][0]
  if (!a || !b || a.mood === b.mood) return null
  return { a, b }
}

function getTensionLine(a, b) {
  const idx = (a.name.charCodeAt(0) + b.name.charCodeAt(0)) % TENSION_LINES.length
  return TENSION_LINES[idx](a, b)
}

function getForecast(mood, history) {
  const lines = FORECAST_LINES[mood] || FORECAST_LINES.chill
  const h = new Date().getHours()
  const slot = h < 12 ? 0 : h < 17 ? 1 : h < 22 ? 2 : 3
  const slots = [
    { time: 'now',     line: lines[slot % lines.length] },
    { time: 'later',   line: lines[(slot + 1) % lines.length] },
    { time: 'tonight', line: lines[(slot + 2) % lines.length] },
  ]
  if (history.length >= 2) {
    const [prev, curr] = history.slice(-2)
    if (prev.mood !== curr.mood) {
      slots[1].line = `Shifting from ${MOOD_CONFIG[prev.mood]?.label} toward ${MOOD_CONFIG[curr.mood]?.label} energy. Hold on.`
    }
  }
  return slots
}

function getTopWords(allTitles, count = 35) {
  const freq = {}
  for (const word of allTitles.join(' ').toLowerCase().split(/\W+/)) {
    if (word.length > 3 && !STOP_WORDS.has(word)) freq[word] = (freq[word] || 0) + 1
  }
  return Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, count).map(([word, count]) => ({ word, count }))
}

let _pid = 0
function createParticles(mood) {
  const emojis = MOOD_EMOJI[mood] || MOOD_EMOJI.chill
  return Array.from({ length: 20 }, () => ({
    id: _pid++,
    emoji: emojis[Math.floor(Math.random() * emojis.length)],
    x: Math.random() * 92 + 4,
    duration: 2.2 + Math.random() * 1.6,
    delay: Math.random() * 0.9,
    size: 1.1 + Math.random() * 0.9,
    spin: Math.random() > 0.5,
  }))
}

const REFRESH_MS = 5 * 60 * 1000

// ── Component ──────────────────────────────────────────────────────────────

export default function App() {
  const [subredditMoods, setSubredditMoods]   = useState([])
  const [overallMood, setOverallMood]         = useState('chill')
  const [confidence, setConfidence]           = useState(0)
  const [topTitles, setTopTitles]             = useState([])
  const [trendingWords, setTrendingWords]     = useState([])
  const [moodHistory, setMoodHistory]         = useState([])
  const [tension, setTension]                 = useState(null)
  const [particles, setParticles]             = useState([])
  const [loading, setLoading]                 = useState(true)
  const [lastUpdated, setLastUpdated]         = useState(null)
  const [countdown, setCountdown]             = useState(REFRESH_MS)
  const [pulse, setPulse]                     = useState(false)
  const nextRefresh  = useRef(Date.now() + REFRESH_MS)
  const prevMoodRef  = useRef(null)

  const fetchData = useCallback(async () => {
    setPulse(true)
    const results = [], allTitles = []

    for (const sub of SUBREDDITS) {
      try {
        const res = await fetch(`/reddit/r/${sub.name}/hot.json?limit=25&raw_json=1`)
        if (!res.ok) throw new Error(res.status)
        const data = await res.json()
        const titles = (data.data?.children || []).map(p => p.data.title)
        allTitles.push(...titles)
        const scores = scoreTitles(titles)
        results.push({ ...sub, mood: getDominantMood(scores), scores, titles })
      } catch {
        results.push({ ...sub, mood: 'chill', scores: {}, titles: [] })
      }
      await new Promise(r => setTimeout(r, 150))
    }

    const agg = Object.fromEntries(Object.keys(MOOD_KEYWORDS).map(m => [m, 0]))
    for (const r of results) for (const [m, s] of Object.entries(r.scores)) agg[m] += s

    const newMood = getDominantMood(agg)
    const conf    = getConfidence(agg, newMood)

    setTimeout(() => {
      setSubredditMoods(results)
      setOverallMood(newMood)
      setConfidence(conf)
      setTopTitles(getTopTitlesForMood(results, newMood))
      setTrendingWords(getTopWords(allTitles))
      setTension(getTension(results))
      setMoodHistory(h => [...h.slice(-7), { mood: newMood, time: new Date() }])
      setLastUpdated(new Date())
      setLoading(false)
      setPulse(false)
      nextRefresh.current = Date.now() + REFRESH_MS
    }, 400)
  }, [])

  useEffect(() => {
    fetchData()
    const id = setInterval(fetchData, REFRESH_MS)
    return () => clearInterval(id)
  }, [fetchData])

  useEffect(() => {
    const id = setInterval(() => setCountdown(Math.max(0, nextRefresh.current - Date.now())), 1000)
    return () => clearInterval(id)
  }, [])

  // Emoji shower on mood change
  useEffect(() => {
    if (prevMoodRef.current && prevMoodRef.current !== overallMood) {
      const p = createParticles(overallMood)
      setParticles(p)
      setTimeout(() => setParticles([]), 4500)
    }
    prevMoodRef.current = overallMood
  }, [overallMood])

  const mood     = MOOD_CONFIG[overallMood]
  const adverb   = getConfidenceAdverb(confidence)
  const forecast = getForecast(overallMood, moodHistory)
  const totalSec = Math.ceil(countdown / 1000)
  const mm       = String(Math.floor(totalSec / 60)).padStart(2, '0')
  const ss       = String(totalSec % 60).padStart(2, '0')

  return (
    <AppShell bodyStyle={{ background: '#060608', fontFamily: "'Inter', system-ui, sans-serif", color: '#e0e0e8', overflowY: 'auto', height: '100%' }}>
    <div className="app" style={{ '--mc': mood.color, '--mg': mood.glow, '--mb': mood.bg }}>
      <div className="grain" />

      {/* Emoji shower */}
      {particles.length > 0 && (
        <div className="particles" aria-hidden="true">
          {particles.map(p => (
            <span
              key={p.id}
              className={`particle ${p.spin ? 'spin' : ''}`}
              style={{
                left: `${p.x}%`,
                fontSize: `${p.size}rem`,
                animationDuration: `${p.duration}s`,
                animationDelay: `${p.delay}s`,
              }}
            >{p.emoji}</span>
          ))}
        </div>
      )}

      <header>
        <h1 className="site-title">Reddit Mood Ring</h1>
        <p className="site-sub">what is the internet feeling right now?</p>
      </header>

      {loading ? (
        <div className="loading-wrap">
          <div className="loading-orb" />
          <p className="loading-text">reading the vibes<span className="dots" /></p>
        </div>
      ) : (
        <main>

          {/* ── Orb ── */}
          <div className={`orb-wrap ${pulse ? 'pulse' : ''}`}>
            <div className="ring r3" />
            <div className="ring r2" />
            <div className="ring r1" />
            <div className="orb">
              <div className="orb-surface">
                <div className="orb-blob" />
                <div className="orb-shine" />
              </div>
              <div className="orb-label">
                <span className="orb-text">{mood.label}</span>
                <span className="orb-pct">{Math.round(confidence * 100)}%</span>
              </div>
            </div>
          </div>

          {/* ── Mood line ── */}
          <p className="mood-line">
            the internet is <em>{adverb}</em> feeling <em>{mood.desc}</em>
          </p>

          {/* ── Why so X? ── */}
          {topTitles.length > 0 && (
            <section className="panel why-panel">
              <p className="panel-label">why so {mood.label.toLowerCase()}?</p>
              <ul className="why-list">
                {topTitles.map(({ title, sub }, i) => (
                  <li key={i} className="why-item">
                    <span className="why-sub">r/{sub}</span>
                    <span className="why-title">"{title}"</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* ── Mood history trail ── */}
          {moodHistory.length > 1 && (
            <section className="panel">
              <p className="panel-label">mood trail</p>
              <div className="trail">
                {moodHistory.map((h, i) => (
                  <div
                    key={i}
                    className={`trail-orb ${i === moodHistory.length - 1 ? 'trail-current' : ''}`}
                    style={{ '--hc': MOOD_CONFIG[h.mood]?.color ?? '#555' }}
                    title={`${MOOD_CONFIG[h.mood]?.label} · ${h.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                  >
                    <span className="trail-name">{MOOD_CONFIG[h.mood]?.label}</span>
                    <span className="trail-time">{h.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ── Subreddit chips ── */}
          <div className="chips">
            {subredditMoods.map(sub => (
              <div
                key={sub.name}
                className="chip"
                style={{ '--sc': MOOD_CONFIG[sub.mood]?.color ?? '#666' }}
                title={sub.mood}
              >
                <span className="chip-dot" />
                <span className="chip-name">r/{sub.label}</span>
                <span className="chip-mood">{sub.mood}</span>
              </div>
            ))}
          </div>

          {/* ── Tension ── */}
          {tension && (
            <p className="tension">
              ⚡ {getTensionLine(tension.a, tension.b)}
            </p>
          )}

          {/* ── Word cloud ── */}
          {trendingWords.length > 0 && (
            <section className="panel cloud-panel">
              <p className="panel-label">trending words</p>
              <div className="cloud">
                {trendingWords.map(({ word, count }) => (
                  <span
                    key={word}
                    className="cloud-word"
                    style={{
                      fontSize: `${Math.max(0.7, Math.min(2.1, (count / trendingWords[0].count) * 1.9 + 0.5))}rem`,
                      opacity: 0.3 + (count / trendingWords[0].count) * 0.7,
                    }}
                  >{word}</span>
                ))}
              </div>
            </section>
          )}

          {/* ── Forecast ── */}
          <section className="panel forecast-panel">
            <p className="panel-label">mood forecast</p>
            <div className="forecast">
              {forecast.map(({ time, line }, i) => (
                <div key={i} className="forecast-slot">
                  <span className="forecast-time">{time}</span>
                  <span className="forecast-line">{line}</span>
                </div>
              ))}
            </div>
          </section>

          {/* ── Footer ── */}
          <footer className="foot">
            {lastUpdated && (
              <span>updated {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            )}
            <span className="sep">·</span>
            <span>next scan in {mm}:{ss}</span>
          </footer>

        </main>
      )}
    </div>
    </AppShell>
  )
}
