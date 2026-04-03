import { useState, useEffect, useRef, createContext, useContext, useCallback } from 'react'
import * as api from './api.js'

/* ═══════════════════════════════════════════
   THEME SYSTEM
   ═══════════════════════════════════════════ */
const ThemeCtx = createContext()
const useTheme = () => useContext(ThemeCtx)

const THEMES = {
  dark: {
    bg: '#0A0A0F',
    bgAlt: 'radial-gradient(ellipse at 20% 0%, rgba(30,144,255,0.04) 0%, transparent 60%), #0A0A0F',
    sidebar: 'rgba(8,8,14,0.95)',
    cardBg: 'rgba(18,18,26,0.7)',
    cardBorder: 'rgba(255,255,255,0.06)',
    cardHover: 'rgba(255,255,255,0.03)',
    text: '#A0A0B8',
    textStrong: '#E0E0F0',
    textWhite: '#FFFFFF',
    textMuted: '#4A4A68',
    textMuted2: '#6A6A88',
    textMuted3: '#2A2A3F',
    accent: '#1E90FF',
    accentGlow: 'rgba(30,144,255,0.3)',
    cyan: '#00E5FF',
    green: '#00FF88',
    red: '#FF3355',
    yellow: '#FFB800',
    divider: 'rgba(255,255,255,0.04)',
    inputBg: 'rgba(255,255,255,0.04)',
    inputBorder: 'rgba(255,255,255,0.08)',
    scoreShadow: '0 0 40px rgba(30,144,255,0.2)',
    scrollThumb: 'rgba(255,255,255,0.08)',
  },
  light: {
    bg: '#F0F2F5',
    bgAlt: 'radial-gradient(ellipse at 20% 0%, rgba(30,144,255,0.06) 0%, transparent 60%), #F0F2F5',
    sidebar: 'rgba(255,255,255,0.95)',
    cardBg: 'rgba(255,255,255,0.85)',
    cardBorder: 'rgba(0,0,0,0.08)',
    cardHover: 'rgba(0,0,0,0.02)',
    text: '#4A5568',
    textStrong: '#1A202C',
    textWhite: '#0A0A0F',
    textMuted: '#A0AEC0',
    textMuted2: '#718096',
    textMuted3: '#CBD5E0',
    accent: '#1E70D0',
    accentGlow: 'rgba(30,112,208,0.2)',
    cyan: '#0099CC',
    green: '#16A34A',
    red: '#DC2626',
    yellow: '#D97706',
    divider: 'rgba(0,0,0,0.06)',
    inputBg: 'rgba(0,0,0,0.03)',
    inputBorder: 'rgba(0,0,0,0.1)',
    scoreShadow: '0 0 40px rgba(30,112,208,0.15)',
    scrollThumb: 'rgba(0,0,0,0.12)',
  },
}

/* ═══════════════════════════════════════════
   MOCK DATA
   ═══════════════════════════════════════════ */
const DODGERS_RECORD = { w: 48, l: 22 }
const DIVISION_POS = '1st NL West'

const STANDINGS = [
  { team: 'Los Angeles Dodgers', w: 48, l: 22, pct: '.686', gb: '—', l10: '7-3', strk: 'W3' },
  { team: 'San Diego Padres', w: 41, l: 29, pct: '.586', gb: '7.0', l10: '5-5', strk: 'L1' },
  { team: 'Arizona Diamondbacks', w: 38, l: 32, pct: '.543', gb: '10.0', l10: '6-4', strk: 'W1' },
  { team: 'San Francisco Giants', w: 33, l: 37, pct: '.471', gb: '15.0', l10: '4-6', strk: 'L2' },
  { team: 'Colorado Rockies', w: 24, l: 46, pct: '.343', gb: '24.0', l10: '3-7', strk: 'L4' },
]

const LIVE_GAME = {
  isLive: true, inning: 'Top 6th',
  away: { name: 'San Diego Padres', abbr: 'SD', runs: 2, hits: 5, errors: 0 },
  home: { name: 'Los Angeles Dodgers', abbr: 'LAD', runs: 5, hits: 9, errors: 0 },
  balls: 2, strikes: 1, outs: 1,
  runners: { first: true, second: false, third: false },
  pitcher: { name: 'Y. Yamamoto', era: '2.85', pitches: 78, id: 808967 },
  batter: { name: 'M. Machado', avg: '.278', id: 592518 },
  innings: [
    { away: 0, home: 2 }, { away: 1, home: 0 }, { away: 0, home: 1 },
    { away: 1, home: 2 }, { away: 0, home: 0 }, { away: null, home: null },
  ],
  plays: [
    { inning: 'Top 6', text: "Machado grounds into fielder's choice, Tatis out at 2nd" },
    { inning: 'Bot 5', text: 'Freeman lines out to center field' },
    { inning: 'Bot 5', text: 'Ohtani crushes a 2-run homer to right field! (HR #28)' },
    { inning: 'Bot 5', text: 'Betts singles sharply to left field' },
    { inning: 'Top 5', text: 'Cronenworth strikes out swinging' },
  ],
}

const RECENT_GAMES = [
  { opp: 'SD', result: 'W', score: '5-2' }, { opp: 'SF', result: 'W', score: '8-3' },
  { opp: 'SF', result: 'L', score: '2-4' }, { opp: 'SF', result: 'W', score: '6-1' },
  { opp: 'ARI', result: 'W', score: '7-5' }, { opp: 'ARI', result: 'L', score: '3-6' },
  { opp: 'ARI', result: 'W', score: '4-2' }, { opp: 'COL', result: 'W', score: '9-0' },
  { opp: 'COL', result: 'W', score: '5-3' }, { opp: 'COL', result: 'L', score: '1-3' },
]

const PLAYERS = [
  { name: 'Shohei Ohtani', pos: 'DH', num: 17, id: 660271, type: 'batter', stats: { avg: '.312', obp: '.398', slg: '.654', ops: '1.052', hr: 28, rbi: 64 }, rating: 99 },
  { name: 'Mookie Betts', pos: 'SS', num: 50, id: 605141, type: 'batter', stats: { avg: '.289', obp: '.378', slg: '.512', ops: '.890', hr: 16, rbi: 48 }, rating: 94 },
  { name: 'Freddie Freeman', pos: '1B', num: 5, id: 518692, type: 'batter', stats: { avg: '.298', obp: '.388', slg: '.498', ops: '.886', hr: 14, rbi: 52 }, rating: 93 },
  { name: 'Will Smith', pos: 'C', num: 16, id: 669257, type: 'batter', stats: { avg: '.275', obp: '.365', slg: '.478', ops: '.843', hr: 12, rbi: 38 }, rating: 86 },
  { name: 'Teoscar Hernández', pos: 'RF', num: 37, id: 606192, type: 'batter', stats: { avg: '.268', obp: '.328', slg: '.492', ops: '.820', hr: 18, rbi: 55 }, rating: 84 },
  { name: 'Max Muncy', pos: '3B', num: 13, id: 571970, type: 'batter', stats: { avg: '.235', obp: '.358', slg: '.445', ops: '.803', hr: 15, rbi: 42 }, rating: 82 },
  { name: 'Yoshinobu Yamamoto', pos: 'SP', num: 18, id: 808967, type: 'pitcher', stats: { era: '2.85', whip: '1.05', so: 112, w: 9 }, rating: 92 },
  { name: 'Walker Buehler', pos: 'SP', num: 21, id: 621111, type: 'pitcher', stats: { era: '3.22', whip: '1.12', so: 98, w: 8 }, rating: 87 },
  { name: 'Tyler Glasnow', pos: 'SP', num: 31, id: 607192, type: 'pitcher', stats: { era: '3.15', whip: '1.08', so: 125, w: 7 }, rating: 89 },
  { name: 'Evan Phillips', pos: 'RP', num: 59, id: 623465, type: 'pitcher', stats: { era: '2.10', whip: '0.92', so: 42, w: 3 }, rating: 85 },
]

const CHAT_MESSAGES = [
  { role: 'user', text: 'How is Ohtani doing this season?' },
  { role: 'ai', text: "Shohei Ohtani is having an incredible 2026 season! He's batting .312 with 28 home runs and 64 RBIs. His OPS of 1.052 leads the NL." },
  { role: 'user', text: "What about Yamamoto's pitching stats?" },
  { role: 'ai', text: "Yoshinobu Yamamoto has been dominant. His 2.85 ERA ranks among the best in the NL, with 112 strikeouts in 98 innings. WHIP of 1.05 shows excellent control." },
]

const NEWS = [
  { title: "Ohtani Hits 28th Homer in Dominant Win Over Padres", source: "MLB.com", time: "2h ago", summary: "Shohei Ohtani launched a towering 2-run blast to right field as the Dodgers cruised to a 5-2 victory at Dodger Stadium." },
  { title: "Dodgers Extend NL West Lead to 7 Games", source: "ESPN", time: "4h ago", summary: "With their third consecutive win, the Dodgers now hold a commanding 7-game lead in the NL West division race." },
  { title: "Yamamoto Named NL Pitcher of the Month", source: "MLB.com", time: "8h ago", summary: "Yoshinobu Yamamoto earned the honor after posting a 1.62 ERA with 38 strikeouts in 5 June starts." },
  { title: "Freeman's Hitting Streak Reaches 15 Games", source: "Dodgers Insider", time: "12h ago", summary: "Freddie Freeman extended his hitting streak to 15 games with a sharp single in the 3rd inning tonight." },
  { title: "Buehler Returns Strong After Injury Rehab", source: "ESPN", time: "1d ago", summary: "Walker Buehler threw 6 scoreless innings in his return, signaling the Dodgers rotation is at full strength." },
  { title: "Betts Wins Gold Glove at Shortstop", source: "MLB.com", time: "1d ago", summary: "Mookie Betts' transition to shortstop has been seamless, earning him his sixth career Gold Glove award." },
]

const SOCIAL_POSTS = [
  { source: 'reddit', sub: 'r/Dodgers', author: 'u/LAbaseballfan', time: '15m', title: 'OHTANI BOMB! This man is not human 🔥', text: 'That home run had an exit velo of 114.2 mph. Absolute moonshot to the pavilion.', upvotes: 2847, comments: 312 },
  { source: 'reddit', sub: 'r/Dodgers', author: 'u/dodgerblue4ever', time: '32m', title: 'Yamamoto is our ACE. Period.', text: '2.85 ERA, nasty splitter, and he just keeps getting better. Best FA signing in years.', upvotes: 1923, comments: 187 },
  { source: 'bluesky', author: 'DodgersNation', handle: '@dodgersnation.bsky', time: '45m', text: '🔵 The Dodgers are 48-22 and running away with the NL West. This team is SPECIAL. #LetsGoDodgers', likes: 892, reposts: 234 },
  { source: 'reddit', sub: 'r/baseball', author: 'u/MLBstats_nerd', time: '1h', title: 'Ohtani is on pace for 65 HRs this season', text: "At his current rate, Ohtani would finish with 65 home runs. That would break the NL record.", upvotes: 4521, comments: 678 },
  { source: 'bluesky', author: 'Dodger Digest', handle: '@dodgerdigest.bsky', time: '1h', text: "Freeman's 15-game hitting streak is the longest by a Dodger this season. The man is locked in. 💪", likes: 456, reposts: 89 },
  { source: 'reddit', sub: 'r/Dodgers', author: 'u/chavez_ravine', time: '2h', title: 'Game Thread: Padres @ Dodgers — Let\'s go!!', text: 'Starting lineup looks stacked tonight. Yamamoto on the mound. Feeling good about this one.', upvotes: 534, comments: 1245 },
  { source: 'bluesky', author: 'MLB Network', handle: '@mlbnetwork.bsky', time: '2h', text: "The Dodgers' rotation ERA of 2.91 is the best in baseball. Yamamoto, Glasnow, and Buehler are dealing. 🔥", likes: 1203, reposts: 412 },
  { source: 'reddit', sub: 'r/baseball', author: 'u/baseballref', time: '3h', title: 'The Dodgers lineup is historically good', text: 'Their .285/.365/.478 slash line as a team would be the best since the 2019 Astros (yes, that team).', upvotes: 3210, comments: 456 },
  { source: 'bluesky', author: 'Fabian Ardaya', handle: '@fabianardaya.bsky', time: '4h', text: 'Will Smith has quietly been one of the best catchers in baseball. His framing metrics are elite and the bat keeps producing.', likes: 678, reposts: 145 },
]

/* ═══════════════════════════════════════════
   MAIN APP
   ═══════════════════════════════════════════ */
// ── Data context so all sections share live data ──
const DataCtx = createContext()
const useData = () => useContext(DataCtx)

export default function App() {
  const [activeSection, setActiveSection] = useState('home')
  const [playerFilter, setPlayerFilter] = useState('all')
  const [selectedPlayer, setSelectedPlayer] = useState(null)
  const [profilePlayer, setProfilePlayer] = useState(null)
  const [chatMessages, setChatMessages] = useState(CHAT_MESSAGES)
  const [chatInput, setChatInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [themeMode, setThemeMode] = useState('dark')
  const [showMoreNav, setShowMoreNav] = useState(false)
  const chatEndRef = useRef(null)
  const t = THEMES[themeMode]

  // ── Live data state ──
  const [standings, setStandings] = useState(STANDINGS)
  const [liveGame, setLiveGame] = useState(null) // null = loading, false = no game
  const [lineups, setLineups] = useState({ away: [], home: [] })
  const [todaysGames, setTodaysGames] = useState([])
  const [roster, setRoster] = useState(PLAYERS)
  const [schedule, setSchedule] = useState([])
  const [socialFeed, setSocialFeed] = useState(SOCIAL_POSTS)
  const [news, setNews] = useState(NEWS)
  const [recentGames, setRecentGames] = useState(RECENT_GAMES)
  const [dodgersRecord, setDodgersRecord] = useState(DODGERS_RECORD)
  const [loading, setLoading] = useState(true)
  const [selectedGamePk, setSelectedGamePk] = useState(null)

  // ── Load initial data ──
  useEffect(() => {
    async function loadAll() {
      try {
        const [standingsData, scheduleData, rosterData, socialData, newsData] = await Promise.all([
          api.getStandings().catch(() => null),
          api.getDodgersSchedule(7, 7).catch(() => []),
          api.getDodgersRoster().catch(() => null),
          api.getSocialFeed().catch(() => null),
          api.getNews().catch(() => null),
        ])

        if (standingsData?.length) {
          setStandings(standingsData)
          const dod = standingsData.find(t => t.team?.includes('Dodgers'))
          if (dod) setDodgersRecord({ w: dod.w, l: dod.l })
        }
        if (scheduleData.length) {
          setSchedule(scheduleData)
          // Build recent results
          const recent = scheduleData
            .filter(g => g.status === 'Final')
            .slice(-10)
            .reverse()
            .map(g => {
              const isDodHome = g.home.id === 119
              const dodScore = isDodHome ? g.home.score : g.away.score
              const oppScore = isDodHome ? g.away.score : g.home.score
              const dt = g.date ? new Date(g.date) : null
              const dateStr = dt ? `${dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` : ''
              return {
                opp: isDodHome ? g.away.abbr : g.home.abbr,
                oppId: isDodHome ? g.away.id : g.home.id,
                result: dodScore > oppScore ? 'W' : 'L',
                score: `${g.away.score}-${g.home.score}`,
                dodScore,
                oppScore,
                date: dateStr,
                home: isDodHome,
              }
            })
          if (recent.length) setRecentGames(recent)
        }
        if (rosterData?.length) setRoster(rosterData)
        if (socialData?.length) setSocialFeed(socialData)
        if (newsData?.length) setNews(newsData)
      } catch (e) {
        console.error('Failed to load data:', e)
      }
      setLoading(false)
    }
    loadAll()
  }, [])

  // ── Load today's games and find Dodgers game ──
  useEffect(() => {
    async function loadGames() {
      try {
        const games = await api.getTodaysGames()
        setTodaysGames(games)
        const dodGame = games.find(g =>
          g.teams?.away?.team?.id === 119 || g.teams?.home?.team?.id === 119
        )
        if (dodGame) {
          setSelectedGamePk(dodGame.gamePk)
        } else if (games.length > 0) {
          setSelectedGamePk(games[0].gamePk)
        }
      } catch (e) {
        console.error('Failed to load games:', e)
      }
    }
    loadGames()
  }, [])

  // ── Poll live game data ──
  const loadLiveGame = useCallback(async () => {
    if (!selectedGamePk) return
    try {
      const [data, lineupsData] = await Promise.all([
        api.getLiveGameData(selectedGamePk),
        api.getGameLineups(selectedGamePk),
      ])
      // Enrich pitcher/batter stats
      if (data.pitcher?.id || data.batter?.id) {
        const box = await api.getBoxscoreStats(selectedGamePk, data.pitcher?.id, data.batter?.id)
        if (box.pitcherEra) data.pitcher.era = box.pitcherEra
        if (box.pitcherPitches) data.pitcher.pitches = box.pitcherPitches
        if (box.batterAvg) data.batter.avg = box.batterAvg
        if (box.pitcherGameStats) data.pitcherGameStats = box.pitcherGameStats
      }
      setLiveGame(data)
      setLineups(lineupsData)
    } catch {
      setLiveGame(false)
    }
  }, [selectedGamePk])

  useEffect(() => {
    loadLiveGame()
    const interval = setInterval(loadLiveGame, 30000) // refresh every 30s
    return () => clearInterval(interval)
  }, [loadLiveGame])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages, isTyping])

  const handleChat = () => {
    if (!chatInput.trim()) return
    setChatMessages(prev => [...prev, { role: 'user', text: chatInput }])
    setChatInput('')
    setIsTyping(true)
    setTimeout(() => {
      setIsTyping(false)
      setChatMessages(prev => [...prev, {
        role: 'ai',
        text: 'Great question! Based on the latest stats, the Dodgers are performing at an elite level this season. Their pitching staff has been particularly impressive with a combined ERA under 3.00 in the last 30 days.'
      }])
    }, 2000)
  }

  const dataValue = {
    standings, liveGame, lineups, todaysGames, roster, schedule, socialFeed, news,
    recentGames, dodgersRecord, loading, selectedGamePk, setSelectedGamePk,
    openPlayerProfile: (player) => setProfilePlayer(player),
  }

  const navItems = [
    { id: 'home', icon: '🏠', label: 'HOME' },
    { id: 'calendar', icon: '📅', label: 'CALENDAR' },
    { id: 'live', icon: '🏟️', label: 'LIVE GAME' },
    { id: 'stats', icon: '📊', label: 'STATS CENTER' },
    { id: 'players', icon: '🃏', label: 'PLAYER CARDS' },
    { id: 'social', icon: '📱', label: 'SOCIAL MEDIA' },
    { id: 'bets', icon: '🎰', label: 'BETS' },
    { id: 'chat', icon: '💬', label: 'AI CHAT' },
  ]

  const s = mkStyles(t)

  return (
    <DataCtx.Provider value={dataValue}>
    <ThemeCtx.Provider value={t}>
      <style>{globalCSS(t)}</style>
      <div style={s.layout}>
        {/* SIDEBAR — desktop/tablet */}
        <aside className="sidebar-desktop" style={s.sidebar}>
          <div style={s.sidebarInner}>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div style={s.logoText}>DODGERS</div>
              <div style={s.logoSub}>MLB TRACKER</div>
            </div>
            <div style={s.accentLine} />
            <button onClick={() => setThemeMode(m => m === 'dark' ? 'light' : 'dark')} style={s.themeToggle}>
              <span>{themeMode === 'dark' ? '☀️' : '🌙'}</span>
              <span style={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.08em', color: t.textMuted2 }}>
                {themeMode === 'dark' ? 'LIGHT MODE' : 'DARK MODE'}
              </span>
            </button>
            <nav style={s.nav}>
              {navItems.map(item => (
                <button key={item.id} onClick={() => setActiveSection(item.id)}
                  style={{ ...s.navItem, ...(activeSection === item.id ? s.navItemActive : {}) }}>
                  {activeSection === item.id && <div style={s.navIndicator} />}
                  <span style={{ fontSize: '1.1rem' }}>{item.icon}</span>
                  <span className="nav-label" style={{ textTransform: 'uppercase' }}>{item.label}</span>
                </button>
              ))}
            </nav>
            <div style={s.accentLine} />
            <div style={s.sidebarRecord}>
              <div style={{ fontSize: '0.65rem', fontWeight: 600, color: t.textMuted, letterSpacing: '0.12em', marginBottom: 4 }}>SEASON RECORD</div>
              <div style={{ fontFamily: "'Bebas Neue'", fontSize: '2rem', color: t.textWhite, letterSpacing: '0.05em' }}>{dodgersRecord.w}-{dodgersRecord.l}</div>
              <div style={{ fontSize: '0.7rem', fontWeight: 600, color: t.accent, letterSpacing: '0.08em' }}>{standings.findIndex(s => s.team?.includes('Dodgers')) === 0 ? '1st' : ''} NL West</div>
            </div>
          </div>
        </aside>

        {/* MAIN */}
        <div className="main-wrapper" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div className="ticker-bar"><LiveTicker onNav={setActiveSection} /></div>
          <main className="main-content" style={{ ...s.main, flex: 1 }}>
          {activeSection === 'home' && <HomeSection onNav={setActiveSection} />}
          {activeSection === 'live' && <LiveGame />}
          {activeSection === 'stats' && <StatsCenter />}
          {activeSection === 'players' && <PlayerCards filter={playerFilter} setFilter={setPlayerFilter} selected={selectedPlayer} setSelected={setSelectedPlayer} />}
          {activeSection === 'social' && <SocialMedia />}
          {activeSection === 'calendar' && <CalendarSection />}
          {activeSection === 'bets' && <BetsSection />}
          {activeSection === 'chat' && <ChatSection messages={chatMessages} input={chatInput} setInput={setChatInput} onSend={handleChat} isTyping={isTyping} chatEndRef={chatEndRef} />}
        </main>
        </div>

        {/* BOTTOM NAV — mobile only */}
        <nav className="bottom-nav" style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 999,
          background: t.sidebar, backdropFilter: 'blur(20px)',
          borderTop: `1px solid ${t.cardBorder}`,
          display: 'none', justifyContent: 'space-around', alignItems: 'center',
          padding: '6px 0', paddingBottom: 'env(safe-area-inset-bottom, 6px)',
        }}>
          {navItems.slice(0, 5).map(item => (
            <button key={item.id} onClick={() => setActiveSection(item.id)} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
              padding: '4px 8px', borderRadius: 8,
              color: activeSection === item.id ? t.accent : t.textMuted2,
              transition: 'color 0.2s',
            }}>
              <span style={{ fontSize: '1.2rem' }}>{item.icon}</span>
              <span style={{ fontSize: '0.5rem', fontWeight: 700, letterSpacing: '0.05em', fontFamily: "'DM Sans'" }}>{item.label}</span>
            </button>
          ))}
          {/* More menu */}
          <div style={{ position: 'relative' }}>
            <button onClick={() => setShowMoreNav(p => !p)} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
              padding: '4px 8px', borderRadius: 8,
              color: navItems.slice(5).some(i => i.id === activeSection) ? t.accent : t.textMuted2,
            }}>
              <span style={{ fontSize: '1.2rem' }}>⋯</span>
              <span style={{ fontSize: '0.5rem', fontWeight: 700, letterSpacing: '0.05em', fontFamily: "'DM Sans'" }}>MORE</span>
            </button>
            {showMoreNav && (
              <div style={{
                position: 'absolute', bottom: '100%', right: 0, marginBottom: 8,
                background: t.cardBg, border: `1px solid ${t.cardBorder}`, borderRadius: 12,
                padding: 8, minWidth: 150, backdropFilter: 'blur(20px)',
                boxShadow: `0 -4px 20px ${t.accentGlow}`,
              }}>
                {navItems.slice(5).map(item => (
                  <button key={item.id} onClick={() => { setActiveSection(item.id); setShowMoreNav(false) }} style={{
                    display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                    padding: '10px 12px', border: 'none', borderRadius: 8, cursor: 'pointer',
                    background: activeSection === item.id ? `${t.accent}18` : 'transparent',
                    color: activeSection === item.id ? t.accent : t.textStrong,
                    fontFamily: "'DM Sans'", fontSize: '0.78rem', fontWeight: 600,
                  }}>
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                ))}
                {/* Theme toggle in more menu */}
                <div style={{ borderTop: `1px solid ${t.divider}`, marginTop: 4, paddingTop: 4 }}>
                  <button onClick={() => { setThemeMode(m => m === 'dark' ? 'light' : 'dark'); setShowMoreNav(false) }} style={{
                    display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                    padding: '10px 12px', border: 'none', borderRadius: 8, cursor: 'pointer',
                    background: 'transparent', color: t.textStrong,
                    fontFamily: "'DM Sans'", fontSize: '0.78rem', fontWeight: 600,
                  }}>
                    <span>{themeMode === 'dark' ? '☀️' : '🌙'}</span>
                    <span>{themeMode === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </nav>
      {profilePlayer && <PlayerProfile player={profilePlayer} onClose={() => setProfilePlayer(null)} />}
      </div>
    </ThemeCtx.Provider>
    </DataCtx.Provider>
  )
}

/* ═══════════════════════════════════════════
   HOME SECTION
   ═══════════════════════════════════════════ */
/* ═══════════════════════════════════════════
   LIVE TICKER (News-style bar)
   ═══════════════════════════════════════════ */
function LiveTicker({ onNav }) {
  const t = useTheme()
  const { liveGame, todaysGames } = useData()

  // Build ticker items from all today's games
  const tickerGames = todaysGames.map(gm => {
    const away = gm.teams?.away
    const home = gm.teams?.home
    const status = gm.status?.detailedState || gm.status?.abstractGameState || ''
    const isLive = status === 'In Progress' || status === 'Live'
    const isFinal = status === 'Final' || status.includes('Final')
    const ls = gm.linescore || {}
    const inning = ls.currentInningOrdinal ? `${ls.inningHalf || ''} ${ls.currentInningOrdinal}` : ''
    return {
      awayAbbr: away?.team?.abbreviation || '?',
      homeAbbr: home?.team?.abbreviation || '?',
      awayScore: away?.score ?? 0,
      homeScore: home?.score ?? 0,
      isLive,
      isFinal,
      status,
      inning: inning.trim(),
      isDodgers: away?.team?.id === 119 || home?.team?.id === 119,
    }
  })

  // Also add live game details if available
  const currentPlay = liveGame?.plays?.[0]?.text || ''

  const hasLiveGame = tickerGames.some(g => g.isLive)

  return (
    <div
      onClick={() => onNav('live')}
      style={{
        background: hasLiveGame
          ? `linear-gradient(90deg, ${t.red}18, ${t.accent}12, ${t.red}18)`
          : `${t.cardBg}`,
        borderBottom: `1px solid ${hasLiveGame ? t.red + '33' : t.cardBorder}`,
        padding: '0',
        cursor: 'pointer',
        overflow: 'hidden',
        flexShrink: 0,
        position: 'relative',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', height: 42 }}>
        {/* LIVE badge */}
        <div style={{
          padding: '0 16px', height: '100%',
          display: 'flex', alignItems: 'center', gap: 8,
          background: hasLiveGame ? `${t.red}22` : `${t.accent}15`,
          borderRight: `1px solid ${hasLiveGame ? t.red + '33' : t.cardBorder}`,
          flexShrink: 0,
        }}>
          {hasLiveGame && <span className="live-dot" style={{ width: 7, height: 7, borderRadius: '50%', background: t.red, boxShadow: `0 0 8px ${t.red}88` }} />}
          <span style={{
            fontFamily: "'DM Sans'", fontSize: '0.68rem', fontWeight: 700,
            color: hasLiveGame ? t.red : t.accent,
            letterSpacing: '0.1em',
          }}>
            {hasLiveGame ? 'LIVE' : 'MLB TODAY'}
          </span>
        </div>

        {/* Scrolling scores */}
        <div className="ticker-scroll" style={{
          flex: 1, overflow: 'hidden', position: 'relative', height: '100%',
        }}>
          {tickerGames.length === 0 ? (
            <div style={{
              display: 'flex', alignItems: 'center', height: '100%', padding: '0 20px',
              fontSize: '0.75rem', color: t.textMuted, fontWeight: 500,
            }}>
              <span style={{ marginRight: 8 }}>⚾</span>
              No hay juegos programados hoy — Los Dodgers están <span style={{ color: t.accent, fontWeight: 700, margin: '0 4px' }}>{DODGERS_RECORD.w}-{DODGERS_RECORD.l}</span> en la temporada
            </div>
          ) : (
          <div className="ticker-track" style={{
            display: 'flex', alignItems: 'center', height: '100%',
            animation: `tickerScroll ${Math.max(tickerGames.length * 5, 20)}s linear infinite`,
            width: 'max-content',
          }}>
            {/* Duplicate for seamless loop */}
            {[...tickerGames, ...tickerGames].map((gm, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '0 20px',
                borderRight: `1px solid ${t.divider}`,
                height: '100%', flexShrink: 0,
              }}>
                {/* Live indicator */}
                {gm.isLive && <span style={{ width: 5, height: 5, borderRadius: '50%', background: t.red, boxShadow: `0 0 6px ${t.red}88`, flexShrink: 0 }} />}

                {/* Away */}
                <span style={{
                  fontFamily: "'DM Sans'", fontSize: '0.78rem', fontWeight: 700,
                  color: gm.isDodgers && gm.awayAbbr !== 'LAD' ? t.text : gm.awayAbbr === 'LAD' ? t.accent : t.textStrong,
                  letterSpacing: '0.04em',
                }}>{gm.awayAbbr}</span>

                {/* Score */}
                <span style={{
                  fontFamily: "'JetBrains Mono'", fontSize: '0.85rem', fontWeight: 700,
                  color: t.textWhite, letterSpacing: '0.02em',
                }}>{gm.awayScore}</span>
                <span style={{ color: t.textMuted3, fontSize: '0.7rem' }}>-</span>
                <span style={{
                  fontFamily: "'JetBrains Mono'", fontSize: '0.85rem', fontWeight: 700,
                  color: t.textWhite, letterSpacing: '0.02em',
                }}>{gm.homeScore}</span>

                {/* Home */}
                <span style={{
                  fontFamily: "'DM Sans'", fontSize: '0.78rem', fontWeight: 700,
                  color: gm.isDodgers && gm.homeAbbr !== 'LAD' ? t.text : gm.homeAbbr === 'LAD' ? t.accent : t.textStrong,
                  letterSpacing: '0.04em',
                }}>{gm.homeAbbr}</span>

                {/* Status */}
                <span style={{
                  fontFamily: "'DM Sans'", fontSize: '0.62rem', fontWeight: 600,
                  color: gm.isLive ? t.red : gm.isFinal ? t.green : t.textMuted,
                  letterSpacing: '0.06em',
                  padding: '2px 6px', borderRadius: 4,
                  background: gm.isLive ? `${t.red}15` : gm.isFinal ? `${t.green}12` : 'transparent',
                }}>
                  {gm.isLive ? gm.inning || 'LIVE' : gm.isFinal ? 'FINAL' : gm.status}
                </span>
              </div>
            ))}
          </div>
          )}
        </div>

        {/* Latest play (right side) */}
        {currentPlay && liveGame?.isLive && (
          <div style={{
            padding: '0 16px', height: '100%',
            display: 'flex', alignItems: 'center',
            borderLeft: `1px solid ${t.divider}`,
            maxWidth: 320, flexShrink: 0,
            background: `${t.accent}08`,
          }}>
            <span style={{
              fontSize: '0.7rem', color: t.text, lineHeight: 1.3,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              <span style={{ color: t.accent, fontWeight: 700, marginRight: 6 }}>LAST:</span>
              {currentPlay.length > 60 ? currentPlay.slice(0, 60) + '...' : currentPlay}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

function HomeHighlights() {
  const t = useTheme()
  const { selectedGamePk } = useData()
  const [highlights, setHighlights] = useState([])
  const [activeVideo, setActiveVideo] = useState(null)

  useEffect(() => {
    if (!selectedGamePk) return
    api.getGameHighlights(selectedGamePk).then(h => setHighlights(h)).catch(() => {})
  }, [selectedGamePk])

  if (!highlights.length) return null

  const top3 = highlights.slice(0, 3)

  return (
    <>
      {activeVideo && (
        <div onClick={() => setActiveVideo(null)} style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999, cursor: 'pointer',
        }}>
          <div onClick={e => e.stopPropagation()} style={{ width: '80%', maxWidth: 900 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ fontWeight: 700, color: '#fff', fontSize: '1rem' }}>{activeVideo.title}</div>
              <button onClick={() => setActiveVideo(null)} style={{
                background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff',
                width: 36, height: 36, borderRadius: '50%', cursor: 'pointer', fontSize: '1.2rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>✕</button>
            </div>
            <video src={activeVideo.url} controls autoPlay style={{ width: '100%', borderRadius: 12, background: '#000' }} />
          </div>
        </div>
      )}
      <Card style={{ marginTop: 16, marginBottom: 0 }}>
        <CardHeader>🎬 HIGHLIGHTS</CardHeader>
        <div className="grid-3col" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {top3.map((h, i) => (
            <div key={i} style={{ borderRadius: 12, overflow: 'hidden', cursor: 'pointer', background: t.inputBg, border: `1px solid ${t.accent}22`, boxShadow: `0 0 12px ${t.accentGlow}` }}
              onClick={() => setActiveVideo(h)}>
              <div style={{ position: 'relative', paddingTop: '56.25%', background: '#000' }}>
                <video src={h.url} autoPlay muted loop playsInline
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{
                  position: 'absolute', top: 8, left: 8, background: `${t.accent}dd`, color: '#fff',
                  padding: '2px 8px', borderRadius: 5, fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.06em',
                  boxShadow: `0 0 10px ${t.accentGlow}`,
                }}>▶ HIGHLIGHT</div>
                <div onClick={(e) => { e.stopPropagation(); setActiveVideo(h) }} style={{
                  position: 'absolute', bottom: 6, right: 6, width: 28, height: 28, borderRadius: 6,
                  background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', border: '1px solid rgba(255,255,255,0.15)',
                }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>
                </div>
              </div>
              <div style={{ padding: '8px 10px' }}>
                <div style={{
                  fontWeight: 600, color: t.textStrong, fontSize: '0.78rem', lineHeight: 1.3,
                  display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                }}>{h.title}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </>
  )
}

function HomeNextGame({ onNav }) {
  const t = useTheme()
  const [nextGame, setNextGame] = useState(null)
  const [stars, setStars] = useState({ away: [], home: [] })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getNextDodgersGame().then(async (game) => {
      if (!game) { setLoading(false); return }
      setNextGame(game)
      const [away, home] = await Promise.all([
        api.getTeamRoster(game.away.id).catch(() => []),
        api.getTeamRoster(game.home.id).catch(() => []),
      ])
      const topBat = (r) => r.filter(p => p.type === 'batter').sort((a, b) => parseFloat(b.stats?.ops || 0) - parseFloat(a.stats?.ops || 0))[0]
      const topPit = (r) => r.filter(p => p.type === 'pitcher').sort((a, b) => parseFloat(a.stats?.era || 99) - parseFloat(b.stats?.era || 99))[0]
      setStars({ away: [topBat(away), topPit(away)].filter(Boolean), home: [topBat(home), topPit(home)].filter(Boolean) })
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  if (loading) return <Card><div style={{ textAlign: 'center', padding: 30, color: t.textMuted }}>Cargando...</div></Card>
  if (!nextGame) return (
    <Card style={{ cursor: 'pointer' }} onClick={() => onNav('live')}>
      <div style={{ textAlign: 'center', padding: 30, color: t.textMuted }}>No hay juegos programados</div>
    </Card>
  )

  const ng = nextGame
  const dt = new Date(ng.gameDate)
  const dateStr = dt.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  const timeStr = dt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })

  return (
    <div onClick={() => onNav('live')} style={{
      background: `linear-gradient(135deg, ${t.cardBg}, ${t.accent}06)`,
      border: `1px solid ${t.accent}22`, borderRadius: 16, padding: '20px 24px',
      marginBottom: 16, cursor: 'pointer', position: 'relative', overflow: 'hidden',
      transition: 'all 0.3s ease',
    }}>
      {/* Top accent */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${t.accent}, ${t.cyan}, ${t.accent})`, opacity: 0.4 }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <CardHeader>NEXT GAME</CardHeader>
        <span style={{
          fontFamily: "'DM Sans'", fontSize: '0.6rem', fontWeight: 700, color: t.cyan,
          letterSpacing: '0.1em', padding: '3px 10px', borderRadius: 12,
          background: `${t.cyan}15`, border: `1px solid ${t.cyan}33`,
        }}>⏱ UPCOMING</span>
      </div>

      {/* Teams + VS */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 24 }}>
        <div style={{ textAlign: 'center', flex: 1 }}>
          <TeamLogo abbr={ng.away.abbr} teamId={ng.away.id} size={56} highlight={ng.away.id === 119} />
          <div style={{ fontFamily: "'Oswald'", fontSize: '1rem', fontWeight: 700, color: t.textWhite, letterSpacing: '0.06em', marginTop: 6 }}>{ng.away.name}</div>
          <div style={{ fontFamily: "'JetBrains Mono'", fontSize: '0.72rem', color: t.textMuted }}>{ng.away.record}</div>
        </div>

        <div style={{ textAlign: 'center', flexShrink: 0 }}>
          <div style={{
            fontFamily: "'Bebas Neue'", fontSize: '3rem',
            color: t.accent, lineHeight: 1,
            textShadow: `0 0 20px ${t.accentGlow}`,
          }}>VS</div>
          <div style={{ fontSize: '0.68rem', fontWeight: 600, color: t.text, marginTop: 4 }}>{dateStr}</div>
          <div style={{ fontFamily: "'Bebas Neue'", fontSize: '1.3rem', color: t.textWhite }}>{timeStr}</div>
          <div style={{ fontSize: '0.6rem', color: t.textMuted, marginTop: 2 }}>📍 {ng.venue}</div>
        </div>

        <div style={{ textAlign: 'center', flex: 1 }}>
          <TeamLogo abbr={ng.home.abbr} teamId={ng.home.id} size={56} highlight={ng.home.id === 119} />
          <div style={{ fontFamily: "'Oswald'", fontSize: '1rem', fontWeight: 700, color: t.textWhite, letterSpacing: '0.06em', marginTop: 6 }}>{ng.home.name}</div>
          <div style={{ fontFamily: "'JetBrains Mono'", fontSize: '0.72rem', color: t.textMuted }}>{ng.home.record}</div>
        </div>
      </div>

      {/* Probable pitchers */}
      {(ng.away.probablePitcher || ng.home.probablePitcher) && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginTop: 14, paddingTop: 14, borderTop: `1px solid ${t.divider}` }}>
          {[ng.away, ng.home].map((team, i) => team.probablePitcher && (
            <PlayerLink key={i} playerId={team.probablePitcher.id} playerName={team.probablePitcher.name} playerType="pitcher">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <PlayerHeadshot playerId={team.probablePitcher.id} name={team.probablePitcher.name} size={32} />
                <div>
                  <div style={{ fontSize: '0.6rem', fontWeight: 600, color: t.textMuted, letterSpacing: '0.06em' }}>STARTER</div>
                  <div style={{ fontWeight: 700, color: t.textStrong, fontSize: '0.78rem' }}>{team.probablePitcher.name}</div>
                  <div style={{ fontFamily: "'JetBrains Mono'", fontSize: '0.62rem', color: t.accent }}>{team.probablePitcher.record} · {team.probablePitcher.era} ERA</div>
                </div>
              </div>
            </PlayerLink>
          ))}
        </div>
      )}

      {/* Star players mini */}
      {(stars.away.length > 0 || stars.home.length > 0) && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 12, paddingTop: 12, borderTop: `1px solid ${t.divider}` }}>
          {[...stars.away, ...stars.home].slice(0, 4).map((p, i) => (
            <PlayerLink key={i} playerId={p.id} playerName={p.name} playerType={p.type}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <PlayerHeadshot playerId={p.id} name={p.name} size={28} />
                <div>
                  <div style={{ fontWeight: 600, color: t.textStrong, fontSize: '0.68rem' }}>{p.name.split(' ').pop()}</div>
                  <div style={{ fontFamily: "'JetBrains Mono'", fontSize: '0.58rem', color: t.accent }}>
                    {p.type === 'pitcher' ? `${p.stats.era} ERA` : `${p.stats.avg} AVG`}
                  </div>
                </div>
              </div>
            </PlayerLink>
          ))}
        </div>
      )}
    </div>
  )
}

function HomeBetsPreview({ onNav }) {
  const t = useTheme()
  const [odds, setOdds] = useState([])
  useEffect(() => { api.getMLBOdds().then(d => setOdds(d.games || [])).catch(() => {}) }, [])

  const dodgersGame = odds.find(g => g.away?.includes('Dodgers') || g.home?.includes('Dodgers'))
  const impliedProb = (price) => price > 0 ? (100 / (price + 100) * 100).toFixed(0) : (Math.abs(price) / (Math.abs(price) + 100) * 100).toFixed(0)
  const fmtOdds = (price) => price > 0 ? `+${price}` : `${price}`
  const oddsColor = (price) => price > 0 ? t.green : t.red

  if (!dodgersGame) return (
    <Card style={{ cursor: 'pointer' }} onClick={() => onNav('bets')}>
      <CardHeader>🎰 BETTING</CardHeader>
      <div style={{ textAlign: 'center', padding: 16, color: t.textMuted }}>Cargando odds...</div>
    </Card>
  )

  const h2h = dodgersGame.markets.h2h || {}
  const book = Object.keys(h2h)[0]
  const outcomes = h2h[book] || []
  const dodLine = outcomes.find(o => o.name?.includes('Dodgers'))
  const oppLine = outcomes.find(o => !o.name?.includes('Dodgers'))
  const totals = dodgersGame.markets.totals || {}
  const totBook = Object.keys(totals)[0]
  const totOuts = totals[totBook] || []
  const dt = new Date(dodgersGame.commence)
  const timeStr = dt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })

  return (
    <Card style={{ cursor: 'pointer', borderColor: `${t.yellow}22` }} onClick={() => onNav('bets')}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <CardHeader>🎰 DODGERS ODDS</CardHeader>
        <span style={{ fontSize: '0.6rem', fontWeight: 600, color: t.textMuted }}>{timeStr}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        {/* Away */}
        <div style={{ textAlign: 'center' }}>
          <TeamLogo abbr={dodgersGame.away.split(' ').pop()} size={32} />
          <div style={{ fontSize: '0.65rem', fontWeight: 600, color: t.textStrong, marginTop: 4 }}>{dodgersGame.away.split(' ').pop()}</div>
          {outcomes[0] && <div style={{ fontFamily: "'Bebas Neue'", fontSize: '1.4rem', color: oddsColor(outcomes[0].price) }}>{fmtOdds(outcomes[0].price)}</div>}
        </div>
        {/* Center odds */}
        <div style={{ flex: 1, padding: '0 8px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
            {/* ML */}
            <div style={{ textAlign: 'center', padding: '8px 4px', background: t.inputBg, borderRadius: 8 }}>
              <div style={{ fontSize: '0.5rem', fontWeight: 700, color: t.textMuted, letterSpacing: '0.08em', marginBottom: 4 }}>MONEY</div>
              {dodLine && <div style={{ fontFamily: "'JetBrains Mono'", fontSize: '0.8rem', fontWeight: 700, color: oddsColor(dodLine.price) }}>{fmtOdds(dodLine.price)}</div>}
              <div style={{ fontSize: '0.5rem', color: t.textMuted }}>{dodLine ? impliedProb(dodLine.price) + '%' : ''}</div>
            </div>
            {/* Spread */}
            {dodgersGame.markets.spreads && (() => {
              const sp = Object.values(dodgersGame.markets.spreads)[0]
              const dodSp = sp?.find(o => o.name?.includes('Dodgers'))
              return dodSp ? (
                <div style={{ textAlign: 'center', padding: '8px 4px', background: t.inputBg, borderRadius: 8 }}>
                  <div style={{ fontSize: '0.5rem', fontWeight: 700, color: t.textMuted, letterSpacing: '0.08em', marginBottom: 4 }}>LINE</div>
                  <div style={{ fontFamily: "'JetBrains Mono'", fontSize: '0.8rem', fontWeight: 700, color: t.text }}>{dodSp.point > 0 ? '+' : ''}{dodSp.point}</div>
                  <div style={{ fontFamily: "'JetBrains Mono'", fontSize: '0.6rem', color: oddsColor(dodSp.price) }}>{fmtOdds(dodSp.price)}</div>
                </div>
              ) : <div />
            })()}
            {/* Total */}
            {totOuts.length > 0 && (
              <div style={{ textAlign: 'center', padding: '8px 4px', background: t.inputBg, borderRadius: 8 }}>
                <div style={{ fontSize: '0.5rem', fontWeight: 700, color: t.textMuted, letterSpacing: '0.08em', marginBottom: 4 }}>O/U</div>
                <div style={{ fontFamily: "'JetBrains Mono'", fontSize: '0.8rem', fontWeight: 700, color: t.text }}>{totOuts[0].point}</div>
                <div style={{ fontFamily: "'JetBrains Mono'", fontSize: '0.6rem', color: t.textMuted }}>{fmtOdds(totOuts[0].price)}/{fmtOdds(totOuts[1]?.price)}</div>
              </div>
            )}
          </div>
          {/* Prob bar mini */}
          {dodLine && oppLine && (
            <div style={{ marginTop: 8 }}>
              <div style={{ width: '100%', height: 5, borderRadius: 3, background: t.inputBg, overflow: 'hidden', display: 'flex' }}>
                <div style={{ width: `${impliedProb(oppLine.price)}%`, height: '100%', background: t.red, borderRadius: '3px 0 0 3px' }} />
                <div style={{ flex: 1, height: '100%', background: t.accent, borderRadius: '0 3px 3px 0' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 3, fontSize: '0.52rem', color: t.textMuted }}>
                <span>{impliedProb(oppLine.price)}%</span>
                <span>{impliedProb(dodLine.price)}% LAD</span>
              </div>
            </div>
          )}
        </div>
        {/* Home */}
        <div style={{ textAlign: 'center' }}>
          <TeamLogo abbr={dodgersGame.home.split(' ').pop()} size={32} />
          <div style={{ fontSize: '0.65rem', fontWeight: 600, color: t.textStrong, marginTop: 4 }}>{dodgersGame.home.split(' ').pop()}</div>
          {outcomes[1] && <div style={{ fontFamily: "'Bebas Neue'", fontSize: '1.4rem', color: oddsColor(outcomes[1].price) }}>{fmtOdds(outcomes[1].price)}</div>}
        </div>
      </div>
      <div style={{ textAlign: 'right', marginTop: 8 }}>
        <span style={{ fontSize: '0.68rem', color: t.accent, fontWeight: 600 }}>Ver todas las odds →</span>
      </div>
    </Card>
  )
}

function HomeCalendarPreview({ onNav }) {
  const t = useTheme()
  const { schedule } = useData()
  const now = new Date()
  const month = now.getMonth() + 1
  const year = now.getFullYear()
  const monthNames = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

  // Get next 5 upcoming + last 3 results from schedule
  const upcoming = schedule.filter(g => g.status !== 'Final' && g.status !== 'Postponed').slice(0, 4)
  const recent = schedule.filter(g => g.status === 'Final').slice(-3).reverse()

  return (
    <Card style={{ cursor: 'pointer' }} onClick={() => onNav('calendar')}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <CardHeader>📅 SCHEDULE</CardHeader>
        <span style={{ fontFamily: "'DM Sans'", fontSize: '0.62rem', fontWeight: 700, color: t.accent, letterSpacing: '0.08em' }}>{monthNames[month].toUpperCase()} {year}</span>
      </div>

      {/* Recent results mini */}
      {recent.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: '0.55rem', fontWeight: 700, color: t.textMuted, letterSpacing: '0.1em', marginBottom: 6 }}>RECENT</div>
          {recent.map((g, i) => {
            const isDodHome = g.home.id === 119
            const dodScore = isDodHome ? g.home.score : g.away.score
            const oppScore = isDodHome ? g.away.score : g.home.score
            const won = dodScore > oppScore
            const opp = isDodHome ? g.away : g.home
            const dt = g.date ? new Date(g.date) : null
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0' }}>
                <span style={{ fontSize: '0.6rem', color: t.textMuted, fontFamily: "'JetBrains Mono'", minWidth: 36 }}>{dt ? `${dt.getMonth()+1}/${dt.getDate()}` : ''}</span>
                <span style={{ width: 18, height: 18, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.55rem', fontWeight: 800, background: won ? `${t.green}18` : `${t.red}18`, color: won ? t.green : t.red, border: `1px solid ${won ? t.green+'33' : t.red+'33'}` }}>{won ? 'W' : 'L'}</span>
                <TeamLogo abbr={opp.abbr} teamId={opp.id} size={18} />
                <span style={{ fontSize: '0.68rem', color: t.textStrong, flex: 1 }}>{isDodHome ? 'vs' : '@'} {opp.abbr}</span>
                <span style={{ fontFamily: "'JetBrains Mono'", fontSize: '0.68rem', fontWeight: 700, color: won ? t.green : t.red }}>{dodScore}-{oppScore}</span>
              </div>
            )
          })}
        </div>
      )}

      {/* Upcoming */}
      {upcoming.length > 0 && (
        <div>
          <div style={{ fontSize: '0.55rem', fontWeight: 700, color: t.textMuted, letterSpacing: '0.1em', marginBottom: 6 }}>UPCOMING</div>
          {upcoming.map((g, i) => {
            const isDodHome = g.home.id === 119
            const opp = isDodHome ? g.away : g.home
            const dt = g.date ? new Date(g.date) : null
            const timeStr = dt ? dt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : ''
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0' }}>
                <span style={{ fontSize: '0.6rem', color: t.textMuted, fontFamily: "'JetBrains Mono'", minWidth: 36 }}>{dt ? `${dt.getMonth()+1}/${dt.getDate()}` : ''}</span>
                <TeamLogo abbr={opp.abbr} teamId={opp.id} size={18} />
                <span style={{ fontSize: '0.68rem', color: t.textStrong, flex: 1 }}>{isDodHome ? 'vs' : '@'} {opp.abbr}</span>
                <span style={{ fontSize: '0.6rem', color: t.textMuted }}>{timeStr}</span>
              </div>
            )
          })}
        </div>
      )}

      <div style={{ textAlign: 'right', marginTop: 8 }}>
        <span style={{ fontSize: '0.68rem', color: t.accent, fontWeight: 600 }}>Ver calendario completo →</span>
      </div>
    </Card>
  )
}

function HomeSection({ onNav }) {
  const t = useTheme()
  const { liveGame, lineups, standings: st, recentGames: rg, news: nw, socialFeed: sf, loading } = useData()
  const g = liveGame || LIVE_GAME
  const standings = st?.length ? st : STANDINGS
  const recentGames = rg?.length ? rg : RECENT_GAMES
  const newsData = nw?.length ? nw : NEWS
  const socialData = sf?.length ? sf : SOCIAL_POSTS
  return (
    <div style={{ maxWidth: 1200 }}>
      <SectionHeader icon="🏠" title="DASHBOARD" badge={g.isLive ? <LiveBadge /> : null} />

      {/* Top row: Live/VS + Standings mini */}
      <div className="grid-home-top" style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 16, marginBottom: 16 }}>
        {/* Live game or Next game VS */}
        {g.isLive ? (
          <Card style={{ cursor: 'pointer', borderColor: `${t.red}44` }} onClick={() => onNav('live')}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <CardHeader>LIVE GAME</CardHeader>
              <LiveBadge />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 32 }}>
              <div style={{ textAlign: 'center' }}>
                <TeamLogo abbr={g.away.abbr} />
                <div style={{ fontFamily: "'DM Sans'", fontSize: '0.72rem', fontWeight: 600, color: t.textMuted2, letterSpacing: '0.08em', marginTop: 4 }}>{g.away.abbr}</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: "'Bebas Neue'", fontSize: '3.5rem', color: t.textWhite, lineHeight: 1, textShadow: t.scoreShadow }}>
                  {g.away.runs} <span style={{ color: t.textMuted3, fontSize: '2rem' }}>—</span> {g.home.runs}
                </div>
                <div style={{ fontFamily: "'DM Sans'", fontSize: '0.75rem', fontWeight: 600, color: t.accent, letterSpacing: '0.06em', marginTop: 6 }}>{g.inning}</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <TeamLogo abbr={g.home.abbr} highlight />
                <div style={{ fontFamily: "'DM Sans'", fontSize: '0.72rem', fontWeight: 600, color: t.textMuted2, letterSpacing: '0.08em', marginTop: 4 }}>{g.home.abbr}</div>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 32, marginTop: 16, alignItems: 'center' }}>
              <PlayerLink playerId={g.pitcher?.id} playerName={g.pitcher?.name} playerType="pitcher">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <PlayerHeadshot playerId={g.pitcher?.id} name={g.pitcher?.name || 'P'} size={48} />
                  <div>
                    <div style={{ fontSize: '0.6rem', fontWeight: 600, color: t.textMuted, letterSpacing: '0.08em' }}>PITCHER</div>
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: t.textStrong }}>{g.pitcher?.name || 'TBD'}</div>
                    <div style={{ fontSize: '0.72rem', fontFamily: "'JetBrains Mono'", color: t.accent }}>{g.pitcher?.era ? `ERA ${g.pitcher.era}` : ''}</div>
                  </div>
                </div>
              </PlayerLink>
              <div style={{ width: 1, height: 36, background: t.divider }} />
              <PlayerLink playerId={g.batter?.id} playerName={g.batter?.name} playerType="batter">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <PlayerHeadshot playerId={g.batter?.id} name={g.batter?.name || 'B'} size={48} />
                  <div>
                    <div style={{ fontSize: '0.6rem', fontWeight: 600, color: t.textMuted, letterSpacing: '0.08em' }}>BATTER</div>
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: t.textStrong }}>{g.batter?.name || 'TBD'}</div>
                    <div style={{ fontSize: '0.72rem', fontFamily: "'JetBrains Mono'", color: t.accent }}>{g.batter?.avg ? `AVG ${g.batter.avg}` : ''}</div>
                  </div>
                </div>
              </PlayerLink>
            </div>
          </Card>
        ) : (
          <HomeNextGame onNav={onNav} />
        )}

        {/* Standings mini */}
        <Card>
          <CardHeader>NL WEST STANDINGS</CardHeader>
          {standings.map((tm, i) => {
            const isDod = tm.team?.includes('Dodgers')
            return (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '8px 4px',
                borderRadius: 8,
                background: isDod ? `${t.accent}11` : 'transparent',
              }}>
                <span style={{ fontWeight: 800, color: t.textMuted, width: 18, fontSize: '0.8rem' }}>{i + 1}</span>
                {isDod && <span style={{ width: 6, height: 6, borderRadius: '50%', background: t.accent, boxShadow: `0 0 8px ${t.accentGlow}` }} />}
                <span style={{ flex: 1, fontWeight: 600, color: isDod ? t.accent : t.textStrong, fontSize: '0.8rem' }}>
                  {tm.team.replace('Los Angeles ', 'LA ').replace('San Diego ', 'SD ').replace('Arizona ', 'AZ ').replace('San Francisco ', 'SF ').replace('Colorado ', 'COL ')}
                </span>
                <span style={{ fontFamily: "'JetBrains Mono'", fontSize: '0.75rem', color: t.text }}>{tm.w}-{tm.l}</span>
                <span style={{ fontFamily: "'JetBrains Mono'", fontSize: '0.7rem', color: t.textMuted }}>{tm.gb}</span>
              </div>
            )
          })}
          <div style={{ textAlign: 'right', marginTop: 8 }}>
            <button onClick={() => onNav('stats')} style={{ background: 'none', border: 'none', color: t.accent, fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans'" }}>
              Ver stats completos →
            </button>
          </div>
        </Card>
      </div>

      {/* Lineup on home when live */}
      {g.isLive && (lineups.away.length > 0 || lineups.home.length > 0) && (
        <LineupCard
          away={lineups.away} home={lineups.home}
          awayAbbr={g.away.abbr} homeAbbr={g.home.abbr}
          awayId={g.away.id} homeId={g.home.id}
          isLive={g.isLive}
          batterId={g.batter?.id}
          onDeckId={g.onDeck?.id}
          inHoleId={g.inHole?.id}
          inningHalf={g.inningHalf}
        />
      )}

      {/* Highlights on home when live */}
      {g.isLive && <HomeHighlights />}

      {/* Recent Games + News + Social */}
      <div className="grid-3col grid-home-mid" style={{ display: 'grid', gridTemplateColumns: '280px 1fr 1fr', gap: 16, marginTop: 16 }}>
        {/* LAST 10 GAMES — vertical */}
        <Card>
          <CardHeader>LAST 10 GAMES</CardHeader>
          {recentGames.map((gm, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '8px 4px',
              borderBottom: i < recentGames.length - 1 ? `1px solid ${t.divider}` : 'none',
            }}>
              {/* Date */}
              <span style={{ fontSize: '0.62rem', fontWeight: 600, color: t.textMuted, minWidth: 40, fontFamily: "'JetBrains Mono'" }}>
                {gm.date || ''}
              </span>
              {/* W/L badge */}
              <span style={{
                width: 22, height: 22, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.62rem', fontWeight: 800, flexShrink: 0,
                background: gm.result === 'W' ? `${t.green}18` : `${t.red}18`,
                color: gm.result === 'W' ? t.green : t.red,
                border: `1px solid ${gm.result === 'W' ? t.green + '33' : t.red + '33'}`,
              }}>{gm.result}</span>
              {/* Opponent logo */}
              <TeamLogo abbr={gm.opp} size={24} teamId={gm.oppId} />
              {/* Opponent name */}
              <span style={{ flex: 1, fontSize: '0.75rem', fontWeight: 600, color: t.textStrong }}>{gm.opp}</span>
              {/* Score */}
              <span style={{
                fontFamily: "'JetBrains Mono'", fontSize: '0.75rem', fontWeight: 700,
                color: gm.result === 'W' ? t.green : t.red,
              }}>
                {gm.dodScore ?? '?'}-{gm.oppScore ?? '?'}
              </span>
            </div>
          ))}
        </Card>
        {/* News */}
        <Card>
          <CardHeader>📰 LATEST NEWS</CardHeader>
          {newsData.slice(0, 4).map((n, i) => (
            <div key={i} style={{ padding: '10px 0', borderBottom: i < 3 ? `1px solid ${t.divider}` : 'none' }}>
              <div style={{ fontWeight: 600, color: t.textStrong, fontSize: '0.85rem', lineHeight: 1.4, marginBottom: 4 }}>{n.title}</div>
              <div style={{ fontSize: '0.72rem', color: t.textMuted, marginBottom: 4 }}>{n.source} · {n.time}</div>
              <div style={{ fontSize: '0.78rem', color: t.text, lineHeight: 1.5 }}>{n.summary}</div>
            </div>
          ))}
          <div style={{ textAlign: 'right', marginTop: 8 }}>
            <button onClick={() => onNav('social')} style={{ background: 'none', border: 'none', color: t.accent, fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans'" }}>
              Ver social media →
            </button>
          </div>
        </Card>

        {/* Social preview */}
        <Card>
          <CardHeader>📱 SOCIAL BUZZ</CardHeader>
          {socialData.slice(0, 4).map((p, i) => (
            <div key={i} style={{ padding: '10px 0', borderBottom: i < 3 ? `1px solid ${t.divider}` : 'none' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <span style={{ fontWeight: 600, color: t.text, fontSize: '0.78rem' }}>
                  {({ reddit: '🤖', bluesky: '🦋', facebook: '📘', instagram: '📸' }[p.source] || '🌐')} {p.author}
                </span>
                <SourceBadge source={p.source} sub={p.sub} />
              </div>
              {p.title && <div style={{ fontWeight: 600, color: t.textStrong, fontSize: '0.82rem', marginBottom: 2 }}>{p.title}</div>}
              <div style={{ fontSize: '0.75rem', color: t.text, lineHeight: 1.4 }}>{p.text.slice(0, 120)}{p.text.length > 120 ? '...' : ''}</div>
              <div style={{ display: 'flex', gap: 12, marginTop: 4, fontSize: '0.68rem', color: t.textMuted }}>
                <span>👍 {p.upvotes || p.likes}</span>
                <span>💬 {p.comments || p.reposts}</span>
                <span>{p.time}</span>
              </div>
            </div>
          ))}
          <div style={{ textAlign: 'right', marginTop: 8 }}>
            <button onClick={() => onNav('social')} style={{ background: 'none', border: 'none', color: t.accent, fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans'" }}>
              Ver todo →
            </button>
          </div>
        </Card>
      </div>

      {/* Bets + Calendar previews */}
      <div className="grid-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 16 }}>
        <HomeBetsPreview onNav={onNav} />
        <HomeCalendarPreview onNav={onNav} />
      </div>

      {/* Quick access */}
      <div className="grid-6col" style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 12, marginTop: 16 }}>
        {[
          { icon: '📺', label: 'Live Game', desc: 'Score & plays', id: 'live' },
          { icon: '📊', label: 'Stats', desc: 'Standings & leaders', id: 'stats' },
          { icon: '🃏', label: 'Players', desc: 'Trading cards', id: 'players' },
          { icon: '📅', label: 'Calendar', desc: 'Schedule', id: 'calendar' },
          { icon: '🎰', label: 'Bets', desc: 'Odds & lines', id: 'bets' },
          { icon: '💬', label: 'AI Chat', desc: 'Ask anything', id: 'chat' },
        ].map((q, i) => (
          <Card key={i} style={{ cursor: 'pointer', textAlign: 'center' }} onClick={() => onNav(q.id)}>
            <div style={{ fontSize: '1.8rem', marginBottom: 6 }}>{q.icon}</div>
            <div style={{ fontWeight: 700, color: t.textStrong, fontSize: '0.85rem' }}>{q.label}</div>
            <div style={{ fontSize: '0.68rem', color: t.textMuted, marginTop: 2 }}>{q.desc}</div>
          </Card>
        ))}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════
   SOCIAL MEDIA
   ═══════════════════════════════════════════ */
function SocialMedia() {
  const t = useTheme()
  const { socialFeed: sf, news: nw } = useData()
  const socialPosts = sf?.length ? sf : SOCIAL_POSTS
  const newsData = nw?.length ? nw : NEWS
  const [filter, setFilter] = useState('all')

  const sourceIcon = (s) => ({ reddit: '🤖', bluesky: '🦋', facebook: '📘', instagram: '📸' }[s] || '🌐')
  const sourceName = (s) => ({ reddit: 'Reddit', bluesky: 'Bluesky', facebook: 'Facebook', instagram: 'Instagram' }[s] || s)

  const filtered = filter === 'all' ? socialPosts : socialPosts.filter(p => p.source === filter)

  // Count per source
  const counts = {}
  socialPosts.forEach(p => { counts[p.source] = (counts[p.source] || 0) + 1 })

  const fmtNum = (n) => n >= 1000000 ? (n / 1000000).toFixed(1) + 'M' : n >= 1000 ? (n / 1000).toFixed(1) + 'K' : n

  return (
    <div style={{ maxWidth: 1200 }}>
      <SectionHeader icon="📱" title="SOCIAL MEDIA" />

      {/* Source filters with counts */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {[
          ['all', '🌐 ALL', socialPosts.length],
          ['reddit', '🤖 REDDIT', counts.reddit || 0],
          ['bluesky', '🦋 BLUESKY', counts.bluesky || 0],
          ['facebook', '📘 FACEBOOK', counts.facebook || 0],
          ['instagram', '📸 INSTAGRAM', counts.instagram || 0],
        ].map(([id, label, count]) => (
          <button key={id} onClick={() => setFilter(id)} style={{
            padding: '8px 16px', borderRadius: 10, cursor: 'pointer', fontFamily: "'DM Sans'",
            fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.06em', transition: 'all 0.3s ease',
            border: `1px solid ${filter === id ? t.accent + '44' : t.inputBorder}`,
            background: filter === id ? `${t.accent}22` : t.inputBg,
            color: filter === id ? t.accent : t.textMuted2,
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            {label}
            <span style={{
              fontSize: '0.6rem', padding: '1px 6px', borderRadius: 8,
              background: filter === id ? `${t.accent}33` : t.inputBg,
              color: filter === id ? t.accent : t.textMuted,
            }}>{count}</span>
          </button>
        ))}
      </div>

      {/* News strip */}
      <Card>
        <CardHeader>📰 DODGERS NEWS</CardHeader>
        <div className="grid-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {newsData.map((n, i) => (
            <div key={i} style={{ padding: '12px 0', borderBottom: `1px solid ${t.divider}` }}>
              <div style={{ fontWeight: 600, color: t.textStrong, fontSize: '0.88rem', lineHeight: 1.4, marginBottom: 4 }}>{n.title}</div>
              <div style={{ fontSize: '0.7rem', color: t.textMuted, marginBottom: 6 }}>{n.source} · {n.time}</div>
              <div style={{ fontSize: '0.8rem', color: t.text, lineHeight: 1.5 }}>{n.summary}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* Social feed */}
      <div style={{ marginTop: 16 }}>
        <CardHeader>💬 SOCIAL FEED — {filter === 'all' ? 'ALL SOURCES' : sourceName(filter).toUpperCase()}</CardHeader>
        <div className="grid-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {filtered.map((p, i) => {
            const isIG = p.source === 'instagram'
            const isFB = p.source === 'facebook'
            return (
              <Card key={i} className="social-card" style={
                isIG ? { borderColor: '#E1306C33', background: `linear-gradient(135deg, ${t.cardBg}, #E1306C08)` } :
                isFB ? { borderColor: '#1877F233', background: `linear-gradient(135deg, ${t.cardBg}, #1877F208)` } : {}
              }>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: '1.1rem' }}>{sourceIcon(p.source)}</span>
                    <div>
                      <span style={{ fontWeight: 700, color: t.textStrong, fontSize: '0.82rem' }}>{p.author}</span>
                      {(p.handle || p.page) && (
                        <div style={{ fontSize: '0.62rem', color: t.textMuted }}>{p.handle || p.page}</div>
                      )}
                    </div>
                  </div>
                  <span style={{
                    padding: '2px 8px', borderRadius: 6, fontSize: '0.6rem', fontWeight: 700,
                    background: isIG ? '#E1306C18' : isFB ? '#1877F218' : t.inputBg,
                    color: isIG ? '#E1306C' : isFB ? '#1877F2' : t.textMuted,
                    border: `1px solid ${isIG ? '#E1306C33' : isFB ? '#1877F233' : t.inputBorder}`,
                  }}>{sourceName(p.source)}</span>
                </div>
                {p.title && <div style={{ fontWeight: 700, color: t.textStrong, fontSize: '0.9rem', marginBottom: 6, lineHeight: 1.3 }}>{p.title}</div>}
                <div style={{ fontSize: '0.82rem', color: t.text, lineHeight: 1.6, marginBottom: 10 }}>{p.text}</div>
                <div style={{ display: 'flex', gap: 14, fontSize: '0.72rem', color: t.textMuted, flexWrap: 'wrap' }}>
                  <span>{isIG ? '❤️' : '👍'} {fmtNum(p.upvotes || p.likes || 0)}</span>
                  <span>💬 {fmtNum(p.comments || p.reposts || 0)}</span>
                  {p.shares && <span>🔄 {fmtNum(p.shares)}</span>}
                  <span>🕐 {p.time}</span>
                  <a href={p.url} target="_blank" rel="noopener noreferrer" style={{ color: t.accent, textDecoration: 'none', fontWeight: 600 }}>Ver →</a>
                </div>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════
   LIVE GAME
   ═══════════════════════════════════════════ */
function LiveGame() {
  const t = useTheme()
  const { liveGame, lineups, todaysGames, selectedGamePk, setSelectedGamePk, roster } = useData()
  const g = liveGame || null
  const hasActiveGame = g && (g.isLive || g.isFinal || g.innings?.length > 0)

  // Game selector
  const gameOptions = todaysGames.map(gm => ({
    label: `${gm.teams?.away?.team?.abbreviation || '?'} @ ${gm.teams?.home?.team?.abbreviation || '?'} (${gm.status?.detailedState || ''})`,
    pk: gm.gamePk,
  }))

  return (
    <div style={{ maxWidth: 1200 }}>
      <SectionHeader icon="🏟️" title="LIVE GAME" badge={g?.isLive ? <LiveBadge /> : null} />
      {gameOptions.length > 1 && (
        <div style={{ marginBottom: 16 }}>
          <select value={selectedGamePk || ''} onChange={e => setSelectedGamePk(Number(e.target.value))}
            style={{ padding: '10px 16px', background: t.inputBg, border: `1px solid ${t.inputBorder}`, borderRadius: 12, color: t.textStrong, fontFamily: "'DM Sans'", fontSize: '0.82rem', outline: 'none', width: '100%', maxWidth: 400 }}>
            {gameOptions.map(o => <option key={o.pk} value={o.pk}>{o.label}</option>)}
          </select>
        </div>
      )}

      {/* UPCOMING / NO GAME — ESPN-style VS screen */}
      {!hasActiveGame && <NextGameScreen />}

      {/* ACTIVE GAME */}
      {hasActiveGame && (<>
      {/* ── UNIFIED FIELD CARD: Score + Count + AT BAT + Field ── */}
      {(() => {
        const fieldingTeam = g.inningHalf === 'Top' ? lineups.home : lineups.away
        const defenders = fieldingTeam.filter(p => p.pos && p.pos !== 'DH').map(p => ({ name: p.name, pos: p.pos, id: p.id }))
        return (
          <Card style={{ padding: 24, borderColor: `${t.accent}22`, background: `linear-gradient(135deg, ${t.cardBg}, ${t.accent}06)` }} className="field-card">
            {/* ── SCOREBOARD ── */}
            <div className="field-score" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 36, marginBottom: 16 }}>
              <div style={{ textAlign: 'center' }}><TeamLogo abbr={g.away.abbr} size={48} /><div style={{ fontFamily: "'DM Sans'", fontSize: '0.68rem', fontWeight: 600, color: t.textMuted2, letterSpacing: '0.08em', marginTop: 4 }}>{g.away.abbr}</div></div>
              <div style={{ textAlign: 'center' }}>
                <div className="field-score-num" style={{ fontFamily: "'Bebas Neue'", fontSize: '3.8rem', color: t.textWhite, lineHeight: 1, textShadow: t.scoreShadow }}>{g.away.runs} <span style={{ color: t.textMuted3, margin: '0 8px', fontSize: '2.2rem' }}>—</span> {g.home.runs}</div>
                <div style={{ fontFamily: "'DM Sans'", fontSize: '0.72rem', fontWeight: 600, color: t.accent, letterSpacing: '0.08em', marginTop: 4 }}>{g.inning}</div>
              </div>
              <div style={{ textAlign: 'center' }}><TeamLogo abbr={g.home.abbr} size={48} highlight /><div style={{ fontFamily: "'DM Sans'", fontSize: '0.68rem', fontWeight: 600, color: t.textMuted2, letterSpacing: '0.08em', marginTop: 4 }}>{g.home.abbr}</div></div>
            </div>

            <div style={{ height: 1, background: `linear-gradient(90deg, transparent, ${t.accent}33, transparent)`, marginBottom: 16 }} />

            {/* ── FIELD + SIDEBAR ── */}
            <div className="grid-field-card" style={{ display: 'grid', gridTemplateColumns: '1fr 240px', gap: 20, alignItems: 'start' }}>
              {/* Left: Field SVG */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <BaseballFieldSVG defenders={defenders} runners={g.runners} hitData={g.hitData} batter={g.batter} />
                </div>
                {g.hitData && (
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 6 }}>
                    {g.hitData.launchSpeed && <StatMini label="EXIT VELO" value={`${Math.round(g.hitData.launchSpeed)} mph`} />}
                    {g.hitData.launchAngle != null && <StatMini label="LAUNCH ∠" value={`${g.hitData.launchAngle}°`} />}
                    {g.hitData.totalDistance && <StatMini label="DISTANCE" value={`${Math.round(g.hitData.totalDistance)} ft`} />}
                  </div>
                )}
              </div>

              {/* Right: Count + AT BAT */}
              <div>
                {/* Count */}
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: '0.6rem', fontWeight: 700, color: t.textMuted, letterSpacing: '0.1em', marginBottom: 8 }}>COUNT</div>
                  <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
                    <div>
                      <CountRow label="B" count={g.balls} total={4} color={t.green} />
                      <CountRow label="S" count={g.strikes} total={3} color={t.yellow} />
                      <CountRow label="O" count={g.outs} total={3} color={t.red} />
                    </div>
                    <Diamond runners={g.runners} />
                  </div>
                </div>

                <div style={{ height: 1, background: `linear-gradient(90deg, transparent, ${t.divider}, transparent)`, marginBottom: 14 }} />

                {/* AT BAT matchup */}
                <div style={{ fontSize: '0.6rem', fontWeight: 700, color: t.textMuted, letterSpacing: '0.1em', marginBottom: 10 }}>AT BAT</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <PlayerLink playerId={g.pitcher?.id} playerName={g.pitcher?.name} playerType="pitcher">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 10, background: `${t.accent}08` }}>
                      <PlayerHeadshot playerId={g.pitcher?.id} name={g.pitcher?.name || ''} size={40} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.6rem', fontWeight: 600, color: t.textMuted, letterSpacing: '0.08em' }}>PITCHER</div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: t.textStrong }}>{g.pitcher?.name}</div>
                        <div style={{ fontFamily: "'JetBrains Mono'", fontSize: '0.65rem', color: t.accent }}>{g.pitcher?.era ? `ERA ${g.pitcher.era}` : ''} · {g.pitcher?.pitches}P</div>
                      </div>
                    </div>
                  </PlayerLink>
                  <div style={{ textAlign: 'center' }}>
                    <span style={{ fontFamily: "'Bebas Neue'", fontSize: '1rem', color: t.textMuted3, letterSpacing: '0.1em' }}>VS</span>
                  </div>
                  <PlayerLink playerId={g.batter?.id} playerName={g.batter?.name} playerType="batter">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 10, background: `${t.accent}08` }}>
                      <PlayerHeadshot playerId={g.batter?.id} name={g.batter?.name || ''} size={40} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.6rem', fontWeight: 600, color: t.textMuted, letterSpacing: '0.08em' }}>BATTER</div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: t.textStrong }}>{g.batter?.name}</div>
                        <div style={{ fontFamily: "'JetBrains Mono'", fontSize: '0.65rem', color: t.accent }}>{g.batter?.avg ? `AVG ${g.batter.avg}` : ''}</div>
                      </div>
                    </div>
                  </PlayerLink>
                </div>
              </div>
            </div>
          </Card>
        )
      })()}

      {/* PITCH ANALYSIS */}
      {g.isLive && (
        <div className="grid-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 16 }}>
          <StrikeZone pitches={g.currentAtBatPitches || []} lastPitch={g.lastPitch} />
          <div>
            <LastPitchCard lastPitch={g.lastPitch} />
            <PitcherStatsCard pitcher={g.pitcher} pitcherGameStats={g.pitcherGameStats} />
          </div>
        </div>
      )}

      <Card style={{ marginTop: 16 }}>
        <CardHeader>LINESCORE</CardHeader>
        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '4px', fontFamily: "'JetBrains Mono'", fontSize: '0.8rem' }}>
          <thead><tr>
            <th style={{ color: t.textMuted, fontWeight: 600, fontSize: '0.68rem', padding: '6px 8px', textAlign: 'center' }}></th>
            {(g.innings||[]).map((_, i) => <th key={i} style={{ color: t.textMuted, fontWeight: 600, fontSize: '0.68rem', padding: '6px 8px', textAlign: 'center' }}>{i + 1}</th>)}
            {['R', 'H', 'E'].map(h => <th key={h} style={{ color: t.accent, fontWeight: 700, fontSize: '0.68rem', padding: '6px 8px', textAlign: 'center' }}>{h}</th>)}
          </tr></thead>
          <tbody>
            {[g.away, g.home].map((team, ti) => (
              <tr key={ti}>
                <td style={{ textAlign: 'left', padding: '8px 12px', fontWeight: 700, color: ti === 1 ? t.accent : t.textStrong, fontFamily: "'DM Sans'", fontSize: '0.8rem' }}>{team.abbr}</td>
                {(g.innings||[]).map((inn, i) => <td key={i} style={{ textAlign: 'center', padding: '8px', color: t.text, background: t.inputBg, borderRadius: 6 }}>{(ti === 0 ? inn.away : inn.home) ?? '—'}</td>)}
                <td style={{ textAlign: 'center', padding: '8px', fontWeight: 700, color: t.textWhite, background: `${t.accent}18`, borderRadius: 6 }}>{team.runs}</td>
                <td style={{ textAlign: 'center', padding: '8px', fontWeight: 700, color: t.textWhite, background: `${t.accent}18`, borderRadius: 6 }}>{team.hits}</td>
                <td style={{ textAlign: 'center', padding: '8px', fontWeight: 700, color: t.textWhite, background: `${t.accent}18`, borderRadius: 6 }}>{team.errors}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      {/* LINEUPS */}
      {(lineups.away.length > 0 || lineups.home.length > 0) && (
        <LineupCard
          away={lineups.away} home={lineups.home}
          awayAbbr={g.away.abbr} homeAbbr={g.home.abbr}
          awayId={g.away.id} homeId={g.home.id}
          isLive={g.isLive}
          batterId={g.batter?.id}
          onDeckId={g.onDeck?.id}
          inHoleId={g.inHole?.id}
          inningHalf={g.inningHalf}
        />
      )}
      <StatcastCard liveGame={g} />
      <HighlightsSection gamePk={selectedGamePk} />
      <Card style={{ marginTop: 16 }}>
        <CardHeader>RECENT PLAYS</CardHeader>
        {(g.plays||[]).map((play, i) => (
          <div key={i} style={{ display: 'flex', gap: 14, padding: '10px 0', borderBottom: `1px solid ${t.divider}`, alignItems: 'flex-start' }}>
            <span style={{ fontFamily: "'DM Sans'", fontSize: '0.68rem', fontWeight: 700, color: t.accent, letterSpacing: '0.05em', minWidth: 48 }}>{play.inning}</span>
            <span style={{ fontSize: '0.82rem', color: t.text, lineHeight: 1.4 }}>{play.text}</span>
          </div>
        ))}
      </Card>
      </>)}
    </div>
  )
}

/* ═══════════════════════════════════════════
   LINEUP CARD — SIDE-BY-SIDE BATTING ORDERS
   ═══════════════════════════════════════════ */
function LineupCard({ away, home, awayAbbr, homeAbbr, awayId, homeId, isLive, batterId, onDeckId, inHoleId, inningHalf }) {
  const t = useTheme()
  const battingTeam = inningHalf === 'Top' ? 'away' : inningHalf === 'Bottom' ? 'home' : null

  const getBadge = (side, playerId) => {
    if (!isLive || battingTeam !== side || !playerId) return null
    if (playerId === batterId) return 'AT BAT'
    if (playerId === onDeckId) return 'ON DECK'
    if (playerId === inHoleId) return 'IN HOLE'
    return null
  }

  const rowStyle = (i, badge) => ({
    display: 'grid',
    gridTemplateColumns: '22px 30px 1fr 36px',
    alignItems: 'center',
    gap: 6,
    padding: '6px 8px',
    borderRadius: 8,
    background: badge === 'AT BAT'
      ? `${t.accent}18`
      : badge === 'ON DECK'
      ? `${t.yellow}10`
      : badge === 'IN HOLE'
      ? `${t.textMuted}08`
      : i % 2 === 0 ? `${t.accent}06` : 'transparent',
    border: badge === 'AT BAT' ? `1px solid ${t.accent}44` : '1px solid transparent',
    transition: 'all 0.4s ease',
  })

  const renderTeamLineup = (lineup, abbr, teamId, side) => {
    const isBatting = isLive && battingTeam === side
    const totals = lineup.reduce((acc, p) => ({
      ab: acc.ab + p.gameStats.ab, h: acc.h + p.gameStats.h,
      r: acc.r + p.gameStats.r, rbi: acc.rbi + p.gameStats.rbi,
    }), { ab: 0, h: 0, r: 0, rbi: 0 })

    return (
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Team header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, paddingBottom: 8, borderBottom: `1px solid ${t.divider}` }}>
          <TeamLogo abbr={abbr} teamId={teamId} size={28} highlight={isBatting} />
          <span style={{ fontFamily: "'Oswald'", fontSize: '0.9rem', fontWeight: 700, color: t.textWhite, letterSpacing: '0.06em' }}>{abbr}</span>
          {isLive && (
            <span style={{
              fontSize: '0.5rem', fontWeight: 700, letterSpacing: '0.08em',
              padding: '3px 8px', borderRadius: 6, marginLeft: 'auto',
              background: isBatting ? `${t.accent}18` : t.inputBg,
              color: isBatting ? t.accent : t.textMuted,
              border: `1px solid ${isBatting ? t.accent + '44' : t.cardBorder}`,
            }}>
              {isBatting ? '⚾ BAT' : '🛡️ FLD'}
            </span>
          )}
        </div>

        {lineup.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 20, color: t.textMuted2, fontSize: '0.75rem' }}>No lineup yet</div>
        ) : (<>
          {/* Column headers */}
          <div style={{ display: 'grid', gridTemplateColumns: '22px 30px 1fr 36px', gap: 6, padding: '0 8px 4px' }}>
            <span style={{ fontSize: '0.5rem', fontWeight: 600, color: t.textMuted, letterSpacing: '0.08em' }}>#</span>
            <span />
            <span style={{ fontSize: '0.5rem', fontWeight: 600, color: t.textMuted, letterSpacing: '0.08em' }}>PLAYER</span>
            <span style={{ fontSize: '0.5rem', fontWeight: 600, color: t.textMuted, letterSpacing: '0.08em', textAlign: 'center' }}>POS</span>
          </div>

          {/* Player rows */}
          {lineup.map((p, i) => {
            const badge = getBadge(side, p.id)
            return (
              <PlayerLink key={p.id} playerId={p.id} playerName={p.name} playerType={p.pos === 'P' ? 'pitcher' : 'batter'}>
                <div style={rowStyle(i, badge)} className={badge === 'AT BAT' ? 'lineup-at-bat' : ''}>
                  <span style={{ fontFamily: "'JetBrains Mono'", fontSize: '0.65rem', fontWeight: 700, color: badge === 'AT BAT' ? t.accent : t.textMuted2 }}>{p.order}</span>
                  <div style={{ position: 'relative' }}>
                    <PlayerHeadshot playerId={p.id} name={p.name} size={26} />
                    {badge === 'AT BAT' && (
                      <div className="at-bat-ring" style={{
                        position: 'absolute', top: -2, left: -2, right: -2, bottom: -2,
                        borderRadius: '50%', border: `2px solid ${t.accent}`,
                        boxShadow: `0 0 10px ${t.accentGlow}`,
                      }} />
                    )}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span style={{
                        fontSize: '0.72rem', fontWeight: badge ? 700 : 600,
                        color: badge === 'AT BAT' ? t.accent : t.textStrong,
                        lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>{p.name.split(' ').length > 1 ? `${p.name.split(' ')[0][0]}. ${p.name.split(' ').slice(1).join(' ')}` : p.name}</span>
                      {badge && (
                        <span className={badge === 'AT BAT' ? 'at-bat-badge' : ''} style={{
                          fontSize: '0.42rem', fontWeight: 800, letterSpacing: '0.06em',
                          padding: '1px 4px', borderRadius: 3, flexShrink: 0,
                          background: badge === 'AT BAT' ? t.accent : badge === 'ON DECK' ? `${t.yellow}22` : `${t.textMuted}15`,
                          color: badge === 'AT BAT' ? '#fff' : badge === 'ON DECK' ? t.yellow : t.textMuted,
                          border: badge === 'ON DECK' ? `1px solid ${t.yellow}44` : 'none',
                        }}>{badge}</span>
                      )}
                    </div>
                    <div style={{ fontFamily: "'JetBrains Mono'", fontSize: '0.55rem', color: badge === 'AT BAT' ? `${t.accent}cc` : t.textMuted2, marginTop: 1 }}>
                      {p.gameStats.ab > 0 ? `${p.gameStats.h}-${p.gameStats.ab}` : '—'}
                      {p.gameStats.rbi > 0 ? ` · ${p.gameStats.rbi} RBI` : ''}
                      {p.gameStats.r > 0 ? ` · ${p.gameStats.r} R` : ''}
                      {p.gameStats.so > 0 ? ` · ${p.gameStats.so} K` : ''}
                    </div>
                  </div>
                  <div style={{ fontFamily: "'DM Sans'", fontSize: '0.62rem', fontWeight: 700, color: t.accent, textAlign: 'center', background: `${t.accent}15`, borderRadius: 5, padding: '2px 0' }}>{p.pos}</div>
                </div>
              </PlayerLink>
            )
          })}

          {/* Totals */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 14, marginTop: 10, paddingTop: 8, borderTop: `1px solid ${t.divider}` }}>
            <StatMini label="AB" value={totals.ab} />
            <StatMini label="H" value={totals.h} />
            <StatMini label="R" value={totals.r} />
            <StatMini label="RBI" value={totals.rbi} />
          </div>
        </>)}
      </div>
    )
  }

  return (
    <Card style={{ marginTop: 16 }}>
      <CardHeader>LINEUPS</CardHeader>
      <div className="lineup-horizontal" style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 0 }}>
        {renderTeamLineup(away, awayAbbr, awayId, 'away')}
        <div style={{ width: 1, background: `linear-gradient(180deg, transparent, ${t.accent}33, transparent)`, margin: '0 12px' }} />
        {renderTeamLineup(home, homeAbbr, homeId, 'home')}
      </div>
    </Card>
  )
}

/* ═══════════════════════════════════════════
   NEXT GAME — ESPN VS SCREEN
   ═══════════════════════════════════════════ */
function NextGameScreen() {
  const t = useTheme()
  const { roster } = useData()
  const [nextGame, setNextGame] = useState(null)
  const [awayRoster, setAwayRoster] = useState([])
  const [homeRoster, setHomeRoster] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getNextDodgersGame().then(async (game) => {
      if (!game) { setLoading(false); return }
      setNextGame(game)
      // Load both rosters for star players
      const [away, home] = await Promise.all([
        api.getTeamRoster(game.away.id).catch(() => []),
        api.getTeamRoster(game.home.id).catch(() => []),
      ])
      setAwayRoster(away)
      setHomeRoster(home)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  if (loading) return <Card><div style={{ textAlign: 'center', padding: 40, color: t.textMuted }}>Buscando próximo juego...</div></Card>
  if (!nextGame) return <Card><div style={{ textAlign: 'center', padding: 40, color: t.textMuted }}>No hay juegos programados</div></Card>

  const ng = nextGame
  const gameDate = new Date(ng.gameDate)
  const dateStr = gameDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
  const timeStr = gameDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })

  // Get top 3 stars per team
  const getStars = (players, type) => {
    const batters = players.filter(p => p.type === 'batter').sort((a, b) => parseFloat(b.stats?.ops || 0) - parseFloat(a.stats?.ops || 0)).slice(0, 2)
    const pitcher = players.filter(p => p.type === 'pitcher').sort((a, b) => parseFloat(a.stats?.era || 99) - parseFloat(b.stats?.era || 99)).slice(0, 1)
    return [...batters, ...pitcher]
  }
  const awayStars = getStars(awayRoster)
  const homeStars = getStars(homeRoster)

  const starCard = (player, align) => (
    <PlayerLink playerId={player.id} playerName={player.name} playerType={player.type}>
      <div style={{ display: 'flex', alignItems: align === 'right' ? 'flex-end' : 'flex-start', flexDirection: 'column', gap: 4 }}>
        <PlayerHeadshot playerId={player.id} name={player.name} size={56} />
        <div style={{ fontWeight: 700, color: t.textStrong, fontSize: '0.85rem', textAlign: align }}>{player.name}</div>
        <div style={{ fontFamily: "'JetBrains Mono'", fontSize: '0.68rem', color: t.accent }}>
          {player.type === 'pitcher'
            ? `${player.stats.era} ERA · ${player.stats.so} SO`
            : `${player.stats.avg} AVG · ${player.stats.hr} HR`
          }
        </div>
        <span style={{
          fontSize: '0.55rem', fontWeight: 700, padding: '2px 6px', borderRadius: 4,
          background: `${t.accent}18`, color: t.accent, border: `1px solid ${t.accent}33`,
        }}>{player.pos}</span>
      </div>
    </PlayerLink>
  )

  return (
    <div>
      {/* Main VS Card */}
      <div style={{
        background: `linear-gradient(135deg, ${t.cardBg}, ${t.accent}06)`,
        border: `1px solid ${t.accent}22`,
        borderRadius: 20, padding: '40px 32px', marginBottom: 16,
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Decorative lines */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${t.accent}, ${t.cyan}, ${t.accent})`, opacity: 0.5 }} />
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 200, height: 200, borderRadius: '50%', border: `1px solid ${t.accent}11`, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 350, height: 350, borderRadius: '50%', border: `1px solid ${t.accent}08`, pointerEvents: 'none' }} />

        {/* UPCOMING label */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <span style={{
            fontFamily: "'DM Sans'", fontSize: '0.65rem', fontWeight: 700,
            color: t.cyan, letterSpacing: '0.15em',
            padding: '5px 16px', borderRadius: 20,
            background: `${t.cyan}15`, border: `1px solid ${t.cyan}33`,
          }}>⏱ UPCOMING</span>
        </div>

        {/* Teams + VS */}
        <div className="vs-screen-teams" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 40 }}>
          {/* Away team */}
          <div style={{ textAlign: 'center', flex: 1 }}>
            <TeamLogo abbr={ng.away.abbr} teamId={ng.away.id} size={90} highlight={ng.away.id === 119} />
            <div style={{ fontFamily: "'Oswald'", fontSize: '1.5rem', fontWeight: 700, color: t.textWhite, letterSpacing: '0.08em', marginTop: 12 }}>
              {ng.away.name}
            </div>
            <div style={{ fontFamily: "'JetBrains Mono'", fontSize: '0.85rem', color: t.text, marginTop: 4 }}>{ng.away.record}</div>
            {ng.away.probablePitcher && (
              <PlayerLink playerId={ng.away.probablePitcher.id} playerName={ng.away.probablePitcher.name} playerType="pitcher">
                <div style={{ marginTop: 12, padding: '10px 16px', background: t.inputBg, borderRadius: 12, border: `1px solid ${t.cardBorder}`, display: 'inline-block' }}>
                  <div style={{ fontSize: '0.58rem', fontWeight: 600, color: t.textMuted, letterSpacing: '0.1em', marginBottom: 4 }}>PROBABLE STARTER</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <PlayerHeadshot playerId={ng.away.probablePitcher.id} name={ng.away.probablePitcher.name} size={36} />
                    <div>
                      <div style={{ fontWeight: 700, color: t.textStrong, fontSize: '0.85rem' }}>{ng.away.probablePitcher.name}</div>
                      <div style={{ fontFamily: "'JetBrains Mono'", fontSize: '0.68rem', color: t.accent }}>
                        {ng.away.probablePitcher.record} · {ng.away.probablePitcher.era} ERA
                      </div>
                    </div>
                  </div>
                </div>
              </PlayerLink>
            )}
          </div>

          {/* VS */}
          <div style={{ textAlign: 'center', flexShrink: 0 }}>
            <div style={{
              fontFamily: "'Bebas Neue'", fontSize: '4.5rem', fontWeight: 400,
              color: t.accent, lineHeight: 1,
              textShadow: `0 0 30px ${t.accentGlow}, 0 0 60px ${t.accentGlow}`,
            }}>VS</div>
            <div style={{ width: 60, height: 2, background: `linear-gradient(90deg, transparent, ${t.accent}, transparent)`, margin: '8px auto', borderRadius: 1 }} />
            <div style={{ fontFamily: "'DM Sans'", fontSize: '0.72rem', fontWeight: 600, color: t.text, marginTop: 8 }}>{dateStr}</div>
            <div style={{ fontFamily: "'Bebas Neue'", fontSize: '1.8rem', color: t.textWhite, marginTop: 2 }}>{timeStr}</div>
            <div style={{ fontSize: '0.68rem', color: t.textMuted, marginTop: 4 }}>📍 {ng.venue}</div>
          </div>

          {/* Home team */}
          <div style={{ textAlign: 'center', flex: 1 }}>
            <TeamLogo abbr={ng.home.abbr} teamId={ng.home.id} size={90} highlight={ng.home.id === 119} />
            <div style={{ fontFamily: "'Oswald'", fontSize: '1.5rem', fontWeight: 700, color: t.textWhite, letterSpacing: '0.08em', marginTop: 12 }}>
              {ng.home.name}
            </div>
            <div style={{ fontFamily: "'JetBrains Mono'", fontSize: '0.85rem', color: t.text, marginTop: 4 }}>{ng.home.record}</div>
            {ng.home.probablePitcher && (
              <PlayerLink playerId={ng.home.probablePitcher.id} playerName={ng.home.probablePitcher.name} playerType="pitcher">
                <div style={{ marginTop: 12, padding: '10px 16px', background: t.inputBg, borderRadius: 12, border: `1px solid ${t.cardBorder}`, display: 'inline-block' }}>
                  <div style={{ fontSize: '0.58rem', fontWeight: 600, color: t.textMuted, letterSpacing: '0.1em', marginBottom: 4 }}>PROBABLE STARTER</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <PlayerHeadshot playerId={ng.home.probablePitcher.id} name={ng.home.probablePitcher.name} size={36} />
                    <div>
                      <div style={{ fontWeight: 700, color: t.textStrong, fontSize: '0.85rem' }}>{ng.home.probablePitcher.name}</div>
                      <div style={{ fontFamily: "'JetBrains Mono'", fontSize: '0.68rem', color: t.accent }}>
                        {ng.home.probablePitcher.record} · {ng.home.probablePitcher.era} ERA
                      </div>
                    </div>
                  </div>
                </div>
              </PlayerLink>
            )}
          </div>
        </div>
      </div>

      {/* Star Players Matchup */}
      {(awayStars.length > 0 || homeStars.length > 0) && (
        <Card>
          <CardHeader>⭐ KEY PLAYERS TO WATCH</CardHeader>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 20, padding: '12px 0' }}>
            {/* Away stars */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'flex-end' }}>
              <div style={{ fontSize: '0.62rem', fontWeight: 700, color: t.textMuted, letterSpacing: '0.1em' }}>{ng.away.abbr}</div>
              {awayStars.map((p, i) => <div key={i}>{starCard(p, 'right')}</div>)}
            </div>
            {/* Divider */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: 2, flex: 1, background: `linear-gradient(180deg, transparent, ${t.accent}33, transparent)`, borderRadius: 1 }} />
            </div>
            {/* Home stars */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'flex-start' }}>
              <div style={{ fontSize: '0.62rem', fontWeight: 700, color: t.textMuted, letterSpacing: '0.1em' }}>{ng.home.abbr}</div>
              {homeStars.map((p, i) => <div key={i}>{starCard(p, 'left')}</div>)}
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════
   HIGHLIGHTS
   ═══════════════════════════════════════════ */
function HighlightsSection({ gamePk }) {
  const t = useTheme()
  const [highlights, setHighlights] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeVideo, setActiveVideo] = useState(null)

  useEffect(() => {
    if (!gamePk) return
    setLoading(true)
    api.getGameHighlights(gamePk).then(h => {
      setHighlights(h)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [gamePk])

  if (loading) return (
    <Card style={{ marginTop: 16 }}>
      <CardHeader>🎬 HIGHLIGHTS</CardHeader>
      <div style={{ textAlign: 'center', padding: 20, color: t.textMuted }}>Cargando highlights...</div>
    </Card>
  )

  if (!highlights.length) return (
    <Card style={{ marginTop: 16 }}>
      <CardHeader>🎬 HIGHLIGHTS</CardHeader>
      <div style={{ textAlign: 'center', padding: 20, color: t.textMuted }}>No hay highlights disponibles aún</div>
    </Card>
  )

  return (
    <>
      {/* Video player modal */}
      {activeVideo && (
        <div onClick={() => setActiveVideo(null)} style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999, cursor: 'pointer',
        }}>
          <div onClick={e => e.stopPropagation()} style={{ width: '80%', maxWidth: 900 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ fontWeight: 700, color: '#fff', fontSize: '1rem' }}>{activeVideo.title}</div>
              <button onClick={() => setActiveVideo(null)} style={{
                background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff',
                width: 36, height: 36, borderRadius: '50%', cursor: 'pointer',
                fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>✕</button>
            </div>
            <video
              src={activeVideo.url}
              controls
              autoPlay
              style={{ width: '100%', borderRadius: 12, background: '#000' }}
            />
            {activeVideo.description && (
              <div style={{ color: '#A0A0B8', fontSize: '0.82rem', marginTop: 8, lineHeight: 1.5 }}>
                {activeVideo.description}
              </div>
            )}
          </div>
        </div>
      )}

      <HighlightsCarousel highlights={highlights} onPlay={setActiveVideo} />
    </>
  )
}

function HighlightsCarousel({ highlights, onPlay }) {
  const t = useTheme()
  const scrollRef = useRef(null)
  const [canScrollL, setCanScrollL] = useState(false)
  const [canScrollR, setCanScrollR] = useState(true)

  const checkScroll = () => {
    const el = scrollRef.current
    if (!el) return
    setCanScrollL(el.scrollLeft > 4)
    setCanScrollR(el.scrollLeft < el.scrollWidth - el.clientWidth - 4)
  }

  useEffect(() => { checkScroll() }, [highlights])

  const scroll = (dir) => {
    const el = scrollRef.current
    if (!el) return
    el.scrollBy({ left: dir * 320, behavior: 'smooth' })
    setTimeout(checkScroll, 400)
  }

  const arrowStyle = (enabled) => ({
    position: 'absolute', top: '50%', transform: 'translateY(-50%)',
    width: 40, height: 40, borderRadius: '50%',
    background: enabled ? `${t.cardBg}ee` : 'transparent',
    border: `1px solid ${enabled ? t.cardBorder : 'transparent'}`,
    color: enabled ? t.textWhite : 'transparent',
    cursor: enabled ? 'pointer' : 'default',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '1.2rem', zIndex: 2,
    backdropFilter: 'blur(8px)',
    boxShadow: enabled ? `0 0 16px ${t.accentGlow}` : 'none',
    transition: 'all 0.3s ease',
    pointerEvents: enabled ? 'auto' : 'none',
  })

  return (
    <Card style={{ marginTop: 16, position: 'relative', overflow: 'visible' }}>
      <CardHeader>🎬 HIGHLIGHTS</CardHeader>

      {/* Left arrow */}
      <div style={{ ...arrowStyle(canScrollL), left: -16 }} onClick={() => scroll(-1)}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 18l-6-6 6-6"/></svg>
      </div>
      {/* Right arrow */}
      <div style={{ ...arrowStyle(canScrollR), right: -16 }} onClick={() => scroll(1)}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 18l6-6-6-6"/></svg>
      </div>

      {/* Carousel track */}
      <div
        ref={scrollRef}
        onScroll={checkScroll}
        style={{
          display: 'flex', gap: 14, overflowX: 'auto', scrollSnapType: 'x mandatory',
          paddingBottom: 4, scrollbarWidth: 'none', msOverflowStyle: 'none',
        }}
        className="hide-scrollbar"
      >
        {highlights.slice(0, 12).map((h, i) => {
          const isAutoplay = i < 3
          return (
          <div
            key={i}
            onClick={() => !isAutoplay && onPlay(h)}
            className="player-card"
            style={{
              minWidth: isAutoplay ? 380 : 300, maxWidth: isAutoplay ? 380 : 300, scrollSnapAlign: 'start',
              borderRadius: 14, overflow: 'hidden', cursor: isAutoplay ? 'default' : 'pointer',
              background: t.inputBg, border: `1px solid ${isAutoplay ? t.accent + '33' : t.cardBorder}`,
              transition: 'all 0.3s ease', flexShrink: 0,
              boxShadow: isAutoplay ? `0 0 20px ${t.accentGlow}` : 'none',
            }}
          >
            {/* Video or Thumbnail */}
            <div style={{ position: 'relative', paddingTop: '56.25%', background: '#000' }}>
              {isAutoplay ? (
                <video
                  src={h.url}
                  autoPlay
                  muted
                  loop
                  playsInline
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : h.thumbnail ? (
                <img src={h.thumbnail} alt={h.title}
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <div style={{
                  position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: `linear-gradient(135deg, ${t.accent}22, ${t.cardBg})`,
                }}>
                  <span style={{ fontSize: '2rem' }}>🎬</span>
                </div>
              )}
              {/* Play button (only for non-autoplay) */}
              {!isAutoplay && (
                <div style={{
                  position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'rgba(0,0,0,0.25)',
                }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: '50%',
                    background: `${t.accent}dd`, display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    boxShadow: `0 0 20px ${t.accentGlow}`,
                    transition: 'transform 0.2s',
                  }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="#fff"><path d="M8 5v14l11-7z" /></svg>
                  </div>
                </div>
              )}
              {/* LIVE / NOW PLAYING badge for autoplay */}
              {isAutoplay && (
                <div style={{
                  position: 'absolute', top: 8, left: 8,
                  background: `${t.accent}dd`, color: '#fff',
                  padding: '3px 10px', borderRadius: 6,
                  fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.08em',
                  fontFamily: "'DM Sans'",
                  boxShadow: `0 0 12px ${t.accentGlow}`,
                }}>▶ NOW PLAYING</div>
              )}
              {/* Expand button for autoplay */}
              {isAutoplay && (
                <div
                  onClick={(e) => { e.stopPropagation(); onPlay(h) }}
                  style={{
                    position: 'absolute', bottom: 8, right: 8,
                    width: 32, height: 32, borderRadius: 8,
                    background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', transition: 'background 0.2s',
                    border: '1px solid rgba(255,255,255,0.15)',
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                    <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>
                  </svg>
                </div>
              )}
              {/* Duration */}
              {h.duration && !isAutoplay && (
                <div style={{
                  position: 'absolute', bottom: 6, right: 6,
                  background: 'rgba(0,0,0,0.75)', color: '#fff',
                  padding: '2px 8px', borderRadius: 4,
                  fontSize: '0.65rem', fontFamily: "'JetBrains Mono'", fontWeight: 600,
                }}>{h.duration}</div>
              )}
            </div>
            {/* Info */}
            <div style={{ padding: '10px 14px' }}>
              <div style={{
                fontWeight: 600, color: t.textStrong, fontSize: '0.82rem',
                lineHeight: 1.3, marginBottom: 4,
                display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
              }}>{h.title}</div>
              {h.blurb && (
                <div style={{
                  fontSize: '0.7rem', color: t.textMuted, lineHeight: 1.4,
                  display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                }}>{h.blurb}</div>
              )}
            </div>
          </div>
          )
        })}
      </div>

      {/* Dot indicators */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 12 }}>
        {highlights.slice(0, 12).map((_, i) => (
          <div key={i} style={{
            width: 6, height: 6, borderRadius: '50%',
            background: t.textMuted, opacity: 0.4,
            transition: 'all 0.3s',
          }} />
        ))}
      </div>
    </Card>
  )
}

/* ═══════════════════════════════════════════
   STATS CENTER
   ═══════════════════════════════════════════ */
function StatsCenter() {
  const t = useTheme()
  const { standings: dodgersSt, recentGames: rg, roster, dodgersRecord } = useData()
  const recentGames = rg?.length ? rg : RECENT_GAMES
  const dodgersPlayers = roster?.length ? roster : PLAYERS

  // State for division/team filtering
  const [viewMode, setViewMode] = useState('team') // 'team' | 'all'
  const [selectedDiv, setSelectedDiv] = useState(203) // NL West default
  const [divStandings, setDivStandings] = useState({})
  const [selectedTeamId, setSelectedTeamId] = useState(119) // Dodgers default
  const [teamRoster, setTeamRoster] = useState(null)
  const [allTeams, setAllTeams] = useState([])
  const [loadingRoster, setLoadingRoster] = useState(false)

  // Load all standings + teams on mount
  useEffect(() => {
    api.getAllStandings().then(setDivStandings).catch(() => {})
    api.getAllTeams().then(setAllTeams).catch(() => {})
  }, [])

  // Load roster when team changes
  useEffect(() => {
    if (selectedTeamId === 119) {
      setTeamRoster(null) // use dodgersPlayers
      return
    }
    setLoadingRoster(true)
    api.getTeamRoster(selectedTeamId).then(r => {
      setTeamRoster(r)
      setLoadingRoster(false)
    }).catch(() => setLoadingRoster(false))
  }, [selectedTeamId])

  const currentStandings = divStandings[selectedDiv] || dodgersSt || STANDINGS
  const currentPlayers = selectedTeamId === 119 ? dodgersPlayers : (teamRoster || [])
  const currentTeam = allTeams.find(t => t.id === selectedTeamId)
  const currentRecord = currentStandings.find(t => t.id === selectedTeamId)

  const batLeaders = currentPlayers.filter(p => p.type === 'batter').sort((a, b) => parseFloat(b.stats?.ops || 0) - parseFloat(a.stats?.ops || 0)).slice(0, 4)
  const pitchLeaders = currentPlayers.filter(p => p.type === 'pitcher').sort((a, b) => parseFloat(a.stats?.era || 99) - parseFloat(b.stats?.era || 99)).slice(0, 4)

  const selectStyle = {
    padding: '8px 14px', background: t.inputBg, border: `1px solid ${t.inputBorder}`,
    borderRadius: 10, color: t.textStrong, fontFamily: "'DM Sans'", fontSize: '0.78rem',
    fontWeight: 600, outline: 'none', cursor: 'pointer',
  }

  return (
    <div style={{ maxWidth: 1200 }}>
      <SectionHeader icon="📊" title="STATS CENTER" />

      {/* ── View mode tabs ── */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <FilterBtn active={viewMode === 'team'} onClick={() => setViewMode('team')}>🏟️ TEAM VIEW</FilterBtn>
        <FilterBtn active={viewMode === 'all'} onClick={() => setViewMode('all')}>🌐 ALL STANDINGS</FilterBtn>
      </div>

      {/* ═══════ ALL STANDINGS VIEW ═══════ */}
      {viewMode === 'all' && (
        <AllStandingsView divStandings={divStandings} onSelectTeam={(id, divId) => {
          setSelectedTeamId(id)
          setSelectedDiv(divId)
          setViewMode('team')
        }} />
      )}

      {/* ═══════ TEAM VIEW ═══════ */}
      {viewMode === 'team' && (<>

      {/* ── Team selector row ── */}
      <Card>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: '0.58rem', fontWeight: 600, color: t.textMuted, letterSpacing: '0.1em', marginBottom: 4 }}>DIVISION</div>
            <select value={selectedDiv} onChange={e => setSelectedDiv(Number(e.target.value))} style={selectStyle}>
              {api.DIVISIONS.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          <div>
            <div style={{ fontSize: '0.58rem', fontWeight: 600, color: t.textMuted, letterSpacing: '0.1em', marginBottom: 4 }}>TEAM</div>
            <select value={selectedTeamId} onChange={e => setSelectedTeamId(Number(e.target.value))} style={selectStyle}>
              <option value={119}>LA Dodgers ⭐</option>
              {currentStandings.filter(t => t.id !== 119).map(t => (
                <option key={t.id} value={t.id}>{t.team}</option>
              ))}
              <optgroup label="── ALL MLB ──">
                {allTeams.filter(t => t.id !== 119 && !currentStandings.find(s => s.id === t.id)).map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </optgroup>
            </select>
          </div>
          {/* Quick back to Dodgers */}
          {selectedTeamId !== 119 && (
            <button onClick={() => { setSelectedTeamId(119); setSelectedDiv(203) }} style={{
              padding: '8px 16px', background: `${t.accent}18`, border: `1px solid ${t.accent}33`,
              borderRadius: 10, color: t.accent, fontFamily: "'DM Sans'", fontSize: '0.75rem',
              fontWeight: 700, cursor: 'pointer', marginTop: 14,
            }}>🔵 Volver a Dodgers</button>
          )}
        </div>
      </Card>

      {/* ── Selected team header ── */}
      <Card style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <TeamLogo abbr={currentTeam?.abbr || 'LAD'} teamId={selectedTeamId} highlight={selectedTeamId === 119} size={52} />
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "'Oswald'", fontSize: '1.3rem', fontWeight: 700, color: t.textWhite, letterSpacing: '0.06em' }}>
            {currentTeam?.name || 'Los Angeles Dodgers'}
          </div>
          {currentRecord && (
            <div style={{ fontFamily: "'JetBrains Mono'", fontSize: '0.82rem', color: t.text, marginTop: 2 }}>
              {currentRecord.w}W - {currentRecord.l}L ({currentRecord.pct}) · GB: {currentRecord.gb}
            </div>
          )}
        </div>
        {currentRecord && (
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: "'Bebas Neue'", fontSize: '2.2rem', color: t.textWhite }}>{currentRecord.w}-{currentRecord.l}</div>
            <div style={{ fontSize: '0.62rem', fontWeight: 600, color: t.textMuted, letterSpacing: '0.08em' }}>RECORD</div>
          </div>
        )}
      </Card>

      {/* ── Season progress (for selected team) ── */}
      {currentRecord && (
        <Card>
          <CardHeader>SEASON PROGRESS</CardHeader>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: '0.62rem', fontWeight: 600, color: t.textMuted, letterSpacing: '0.1em' }}>{currentRecord.w + currentRecord.l} GAMES PLAYED</span>
            <span style={{ fontSize: '0.62rem', fontWeight: 600, color: t.textMuted, letterSpacing: '0.1em' }}>162 TOTAL</span>
          </div>
          <div style={{ width: '100%', height: 6, background: t.inputBg, borderRadius: 3, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${((currentRecord.w + currentRecord.l) / 162) * 100}%`, background: `linear-gradient(90deg, ${t.accent}, ${t.cyan})`, borderRadius: 3, boxShadow: `0 0 12px ${t.accentGlow}` }} />
          </div>
        </Card>
      )}

      {/* ── Dodgers recent games (only when Dodgers selected) ── */}
      {selectedTeamId === 119 && (
        <Card>
          <CardHeader>LAST 10 GAMES</CardHeader>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', padding: '8px 0' }}>
            {recentGames.map((g, i) => (
              <div key={i} style={{ textAlign: 'center', padding: '8px 10px', borderRadius: 10, border: `1px solid ${g.result === 'W' ? t.green + '44' : t.red + '44'}`, background: g.result === 'W' ? t.green + '15' : t.red + '15', minWidth: 48 }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: g.result === 'W' ? t.green : t.red }}>{g.result}</div>
                <div style={{ fontSize: '0.6rem', color: t.text }}>{g.opp}</div>
                <div style={{ fontSize: '0.6rem', fontFamily: "'JetBrains Mono'" }}>{g.score}</div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* ── Division Standings ── */}
      <Card>
        <CardHeader>{api.DIVISIONS.find(d => d.id === selectedDiv)?.name || 'NL WEST'} STANDINGS</CardHeader>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr>
            {['', 'TEAM', 'W', 'L', 'PCT', 'GB', 'L10', 'STRK'].map(h => (
              <th key={h} style={{ fontFamily: "'DM Sans'", fontSize: '0.62rem', fontWeight: 600, color: t.textMuted, letterSpacing: '0.1em', padding: '8px 10px', textAlign: h === 'TEAM' ? 'left' : 'center', borderBottom: `1px solid ${t.divider}` }}>{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {currentStandings.map((tm, i) => {
              const isDod = tm.id === 119
              const isSel = tm.id === selectedTeamId
              return (
                <tr key={i} className="standings-row"
                  onClick={() => { setSelectedTeamId(tm.id) }}
                  style={{ background: isSel ? `${t.accent}11` : 'transparent', cursor: 'pointer' }}>
                  <td style={{ padding: '10px 8px', borderBottom: `1px solid ${t.divider}`, textAlign: 'center' }}>
                    <TeamLogo abbr={tm.abbr} teamId={tm.id} size={28} highlight={isSel} />
                  </td>
                  <td style={{ padding: '10px', fontSize: '0.82rem', fontWeight: 600, color: isDod ? t.accent : isSel ? t.textWhite : t.textStrong, borderBottom: `1px solid ${t.divider}`, textAlign: 'left' }}>
                    {tm.team}
                  </td>
                  {[tm.w, tm.l, tm.pct, tm.gb, tm.l10].map((v, j) => (
                    <td key={j} style={{ padding: '10px', fontFamily: "'JetBrains Mono'", fontSize: '0.82rem', textAlign: 'center', color: t.text, borderBottom: `1px solid ${t.divider}` }}>{v}</td>
                  ))}
                  <td style={{ padding: '10px', fontFamily: "'JetBrains Mono'", fontSize: '0.82rem', textAlign: 'center', color: (tm.strk || '').startsWith('W') ? t.green : t.red, borderBottom: `1px solid ${t.divider}` }}>{tm.strk}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </Card>

      {/* ── Team Leaders ── */}
      {loadingRoster ? (
        <Card><div style={{ textAlign: 'center', padding: 20, color: t.textMuted }}>Cargando roster...</div></Card>
      ) : (
        <>
          {batLeaders.length > 0 && (
            <>
              <CardHeader>BATTING LEADERS — {(currentTeam?.name || 'DODGERS').toUpperCase()}</CardHeader>
              <div className="grid-leaders" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginBottom: 16 }}>
                {batLeaders.map((p, i) => <LeaderCard key={i} player={p} type="batter" />)}
              </div>
            </>
          )}
          {pitchLeaders.length > 0 && (
            <>
              <CardHeader>PITCHING LEADERS — {(currentTeam?.name || 'DODGERS').toUpperCase()}</CardHeader>
              <div className="grid-leaders" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
                {pitchLeaders.map((p, i) => <LeaderCard key={i} player={p} type="pitcher" />)}
              </div>
            </>
          )}
          {currentPlayers.length === 0 && !loadingRoster && (
            <Card><div style={{ textAlign: 'center', padding: 20, color: t.textMuted }}>No hay datos de roster disponibles</div></Card>
          )}
        </>
      )}

      </>)}
    </div>
  )
}

function AllStandingsView({ divStandings, onSelectTeam }) {
  const t = useTheme()
  const leagues = [
    { name: 'AMERICAN LEAGUE', divs: [
      { id: 201, name: 'AL East' }, { id: 202, name: 'AL Central' }, { id: 200, name: 'AL West' },
    ]},
    { name: 'NATIONAL LEAGUE', divs: [
      { id: 204, name: 'NL East' }, { id: 205, name: 'NL Central' }, { id: 203, name: 'NL West' },
    ]},
  ]

  if (!Object.keys(divStandings).length) {
    return <Card><div style={{ textAlign: 'center', padding: 30, color: t.textMuted }}>Cargando standings...</div></Card>
  }

  return (
    <div>
      {leagues.map((league, li) => (
        <div key={li} style={{ marginBottom: 24 }}>
          {/* League header */}
          <div style={{
            fontFamily: "'Oswald'", fontSize: '1.1rem', fontWeight: 700, color: t.textWhite,
            letterSpacing: '0.1em', padding: '10px 0', marginBottom: 8,
            borderBottom: `2px solid ${t.accent}33`,
          }}>{league.name}</div>

          <div className="grid-standings-all" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            {league.divs.map(div => {
              const teams = divStandings[div.id] || []
              return (
                <Card key={div.id} style={{ padding: 14, marginBottom: 0 }}>
                  <div style={{
                    fontFamily: "'DM Sans'", fontSize: '0.7rem', fontWeight: 700,
                    color: t.accent, letterSpacing: '0.08em', marginBottom: 10,
                    paddingBottom: 6, borderBottom: `1px solid ${t.divider}`,
                  }}>{div.name.toUpperCase()}</div>

                  {/* Column headers */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0 0 6px', marginBottom: 2 }}>
                    <span style={{ width: 22 }} />
                    <span style={{ flex: 1, fontSize: '0.55rem', fontWeight: 600, color: t.textMuted, letterSpacing: '0.08em' }}>TEAM</span>
                    <span style={{ width: 30, textAlign: 'center', fontSize: '0.55rem', fontWeight: 600, color: t.textMuted }}>W</span>
                    <span style={{ width: 30, textAlign: 'center', fontSize: '0.55rem', fontWeight: 600, color: t.textMuted }}>L</span>
                    <span style={{ width: 38, textAlign: 'center', fontSize: '0.55rem', fontWeight: 600, color: t.textMuted }}>PCT</span>
                    <span style={{ width: 32, textAlign: 'center', fontSize: '0.55rem', fontWeight: 600, color: t.textMuted }}>GB</span>
                    <span style={{ width: 30, textAlign: 'center', fontSize: '0.55rem', fontWeight: 600, color: t.textMuted }}>STRK</span>
                  </div>

                  {teams.map((tm, i) => {
                    const isDod = tm.id === 119
                    return (
                      <div key={i}
                        onClick={() => onSelectTeam(tm.id, div.id)}
                        className="standings-row"
                        style={{
                          display: 'flex', alignItems: 'center', gap: 6,
                          padding: '6px 4px', borderRadius: 8, cursor: 'pointer',
                          background: isDod ? `${t.accent}11` : 'transparent',
                          borderLeft: isDod ? `3px solid ${t.accent}` : '3px solid transparent',
                          transition: 'all 0.2s',
                        }}
                      >
                        <TeamLogo abbr={tm.abbr} teamId={tm.id} size={22} highlight={isDod} />
                        <span style={{
                          flex: 1, fontSize: '0.72rem', fontWeight: isDod ? 700 : 500,
                          color: isDod ? t.accent : t.textStrong,
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}>{tm.abbr}</span>
                        <span style={{ width: 30, textAlign: 'center', fontFamily: "'JetBrains Mono'", fontSize: '0.72rem', color: t.text, fontWeight: 600 }}>{tm.w}</span>
                        <span style={{ width: 30, textAlign: 'center', fontFamily: "'JetBrains Mono'", fontSize: '0.72rem', color: t.text }}>{tm.l}</span>
                        <span style={{ width: 38, textAlign: 'center', fontFamily: "'JetBrains Mono'", fontSize: '0.68rem', color: t.textMuted }}>{tm.pct}</span>
                        <span style={{ width: 32, textAlign: 'center', fontFamily: "'JetBrains Mono'", fontSize: '0.68rem', color: t.textMuted }}>{tm.gb}</span>
                        <span style={{
                          width: 30, textAlign: 'center', fontFamily: "'JetBrains Mono'", fontSize: '0.68rem', fontWeight: 600,
                          color: (tm.strk || '').startsWith('W') ? t.green : t.red,
                        }}>{tm.strk}</span>
                      </div>
                    )
                  })}
                </Card>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

function LeaderCard({ player: p, type }) {
  const t = useTheme()
  const mainStat = type === 'batter' ? p.stats.avg : p.stats.era
  const mainLabel = type === 'batter' ? 'AVG' : 'ERA'
  const subs = type === 'batter'
    ? [['HR', p.stats.hr], ['RBI', p.stats.rbi], ['OPS', p.stats.ops]]
    : [['SO', p.stats.so], ['WHIP', p.stats.whip], ['W', p.stats.w]]
  return (
    <PlayerLink playerId={p.id} playerName={p.name} playerType={type}>
    <Card style={{ textAlign: 'center', padding: 20 }}>
      <div style={{ margin: '0 auto 10px', display: 'flex', justifyContent: 'center' }}>
        <PlayerHeadshot playerId={p.id} name={p.name} size={56} />
      </div>
      <div style={{ fontWeight: 700, color: t.textStrong, fontSize: '0.9rem', marginBottom: 2 }}>{p.name}</div>
      <div style={{ fontSize: '0.65rem', fontWeight: 600, color: t.textMuted, letterSpacing: '0.08em', marginBottom: 10 }}>{p.pos} #{p.num}</div>
      <div style={{ fontFamily: "'JetBrains Mono'", fontSize: '1.8rem', fontWeight: 700, color: t.textWhite, textShadow: `0 0 20px ${t.accentGlow}` }}>{mainStat}</div>
      <div style={{ fontSize: '0.62rem', fontWeight: 600, color: t.textMuted, letterSpacing: '0.1em' }}>{mainLabel}</div>
      <div style={{ display: 'flex', gap: 16, marginTop: 8, justifyContent: 'center' }}>
        {subs.map(([l, v]) => (
          <div key={l} style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: "'JetBrains Mono'", fontSize: '0.85rem', fontWeight: 600, color: t.text }}>{v}</div>
            <div style={{ fontSize: '0.62rem', fontWeight: 600, color: t.textMuted, letterSpacing: '0.1em' }}>{l}</div>
          </div>
        ))}
      </div>
    </Card>
    </PlayerLink>
  )
}

/* ═══════════════════════════════════════════
   PLAYER CARDS
   ═══════════════════════════════════════════ */
function PlayerCards({ filter, setFilter }) {
  const t = useTheme()
  const { roster, liveGame, openPlayerProfile } = useData()
  const [flipped, setFlipped] = useState({})
  const [teamId, setTeamId] = useState(119)
  const [teamRoster, setTeamRoster] = useState(null)
  const [allTeams, setAllTeams] = useState([])
  const [loadingTeam, setLoadingTeam] = useState(false)

  useEffect(() => { api.getAllTeams().then(setAllTeams).catch(() => {}) }, [])

  useEffect(() => {
    if (teamId === 119) { setTeamRoster(null); return }
    setLoadingTeam(true)
    api.getTeamRoster(teamId).then(r => { setTeamRoster(r); setLoadingTeam(false) }).catch(() => setLoadingTeam(false))
  }, [teamId])

  const dodgersPlayers = roster?.length ? roster : PLAYERS
  const players = teamId === 119 ? dodgersPlayers : (teamRoster || [])
  const filtered = filter === 'all' ? players : filter === 'pitchers' ? players.filter(p => p.type === 'pitcher') : players.filter(p => p.type === 'batter')
  const posColor = (type, pos) => type === 'pitcher' ? t.cyan : ['SS', '2B', '3B', '1B', 'C'].includes(pos) ? t.yellow : t.green
  const currentTeam = allTeams.find(tm => tm.id === teamId)

  // Opponent quick access
  const opponentId = liveGame?.isLive
    ? (liveGame.away?.id === 119 ? liveGame.home?.id : liveGame.away?.id)
    : null
  const opponentAbbr = liveGame?.isLive
    ? (liveGame.away?.id === 119 ? liveGame.home?.abbr : liveGame.away?.abbr)
    : null

  const selectStyle = { padding: '8px 14px', background: t.inputBg, border: `1px solid ${t.inputBorder}`, borderRadius: 10, color: t.textStrong, fontFamily: "'DM Sans'", fontSize: '0.78rem', fontWeight: 600, outline: 'none', cursor: 'pointer' }

  return (
    <div style={{ maxWidth: 1200 }}>
      <SectionHeader icon="🃏" title="PLAYER CARDS" />

      {/* Team selector */}
      <Card>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: '0.55rem', fontWeight: 600, color: t.textMuted, letterSpacing: '0.1em', marginBottom: 4 }}>TEAM</div>
            <select value={teamId} onChange={e => { setTeamId(Number(e.target.value)); setFlipped({}) }} style={selectStyle}>
              <option value={119}>⭐ LA Dodgers</option>
              {opponentId && <option value={opponentId}>⚔️ {opponentAbbr} (Rival)</option>}
              <optgroup label="── ALL MLB ──">
                {allTeams.filter(tm => tm.id !== 119 && tm.id !== opponentId).map(tm => (
                  <option key={tm.id} value={tm.id}>{tm.name}</option>
                ))}
              </optgroup>
            </select>
          </div>
          {/* Type filters */}
          <div style={{ display: 'flex', gap: 6, marginLeft: 8, marginTop: 14 }}>
            {[['all', 'ALL'], ['batters', 'POSITION'], ['pitchers', 'PITCHERS']].map(([id, label]) => (
              <FilterBtn key={id} active={filter === id} onClick={() => setFilter(id)}>{label}</FilterBtn>
            ))}
          </div>
          {/* Quick buttons */}
          {teamId !== 119 && (
            <button onClick={() => { setTeamId(119); setFlipped({}) }} style={{ ...selectStyle, marginTop: 14, background: `${t.accent}18`, borderColor: `${t.accent}33`, color: t.accent }}>🔵 Dodgers</button>
          )}
          {opponentId && teamId !== opponentId && (
            <button onClick={() => { setTeamId(opponentId); setFlipped({}) }} style={{ ...selectStyle, marginTop: 14, background: `${t.red}15`, borderColor: `${t.red}33`, color: t.red }}>⚔️ VS {opponentAbbr}</button>
          )}
        </div>
        {currentTeam && teamId !== 119 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 12, paddingTop: 12, borderTop: `1px solid ${t.divider}` }}>
            <TeamLogo abbr={currentTeam.abbr} teamId={teamId} size={32} />
            <span style={{ fontFamily: "'Oswald'", fontSize: '1rem', fontWeight: 700, color: t.textWhite, letterSpacing: '0.06em' }}>{currentTeam.name}</span>
          </div>
        )}
      </Card>

      {loadingTeam && <Card><div style={{ textAlign: 'center', padding: 20, color: t.textMuted }}>Cargando roster...</div></Card>}

      {/* Player grid */}
      <div className="grid-players" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
        {filtered.map((p, i) => {
          const pc = posColor(p.type, p.pos)
          const isFlipped = flipped[p.id]
          return (
            <div key={p.id || i} className="player-flip" style={{ perspective: 1000, height: 380 }}>
              <div
                onClick={() => setFlipped(prev => ({ ...prev, [p.id]: !prev[p.id] }))}
                style={{
                  width: '100%', height: '100%', position: 'relative',
                  transformStyle: 'preserve-3d',
                  transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0)',
                  transition: 'transform 0.6s cubic-bezier(0.4,0,0.2,1)',
                  cursor: 'pointer',
                }}
              >
                {/* ── FRONT ── */}
                <div style={{
                  position: 'absolute', width: '100%', height: '100%',
                  backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden',
                  background: t.cardBg, border: `1px solid ${t.cardBorder}`,
                  borderRadius: 16, overflow: 'hidden',
                }}>
                  <div style={{ padding: '24px 20px 16px', textAlign: 'center', borderBottom: `2px solid ${pc}`, background: `linear-gradient(180deg, ${t.cardHover}, transparent)` }}>
                    <div style={{ position: 'relative', display: 'inline-block' }}>
                      <PlayerHeadshot playerId={p.id} name={p.name} size={80} />
                      <span style={{ position: 'absolute', bottom: -4, left: '50%', transform: 'translateX(-50%)', fontSize: '0.6rem', fontWeight: 700, color: t.textMuted, background: t.cardBg, padding: '1px 6px', borderRadius: 4, border: `1px solid ${t.cardBorder}` }}>#{p.num}</span>
                    </div>
                  </div>
                  <div style={{ padding: '16px 20px 20px', textAlign: 'center' }}>
                    <div style={{ fontWeight: 700, color: t.textStrong, fontSize: '0.95rem', marginBottom: 6 }}>{p.name}</div>
                    <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 6, fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.08em', marginBottom: 14, background: pc + '22', color: pc, border: `1px solid ${pc}44` }}>{p.pos}</span>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8, marginBottom: 14 }}>
                      {p.type === 'batter'
                        ? [['AVG', p.stats.avg], ['OBP', p.stats.obp], ['SLG', p.stats.slg], ['OPS', p.stats.ops]].map(([l, v]) => <StatMini key={l} label={l} value={v} />)
                        : [['ERA', p.stats.era], ['WHIP', p.stats.whip], ['SO', p.stats.so], ['W', p.stats.w]].map(([l, v]) => <StatMini key={l} label={l} value={v} />)
                      }
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, paddingTop: 8, borderTop: `1px solid ${t.divider}` }}>
                      <div style={{ width: 36, height: 36, background: `linear-gradient(135deg, ${t.accent}, ${t.cyan})`, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 15px ${t.accentGlow}` }}>
                        <span style={{ fontFamily: "'Bebas Neue'", fontSize: '1.2rem', color: '#FFFFFF' }}>{p.rating}</span>
                      </div>
                      <span style={{ fontSize: '0.6rem', fontWeight: 600, color: t.textMuted, letterSpacing: '0.1em' }}>OVERALL</span>
                    </div>
                  </div>
                  <div style={{ position: 'absolute', bottom: 8, right: 10, fontSize: '0.55rem', color: t.textMuted }}>TAP TO FLIP →</div>
                </div>

                {/* ── BACK ── */}
                <div style={{
                  position: 'absolute', width: '100%', height: '100%',
                  backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)',
                  background: `linear-gradient(135deg, ${t.cardBg}, ${t.accent}08)`,
                  border: `1px solid ${t.accent}33`, borderRadius: 16,
                  overflow: 'hidden', display: 'flex', flexDirection: 'column',
                }}>
                  <div style={{ padding: '16px 16px 10px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: `1px solid ${t.divider}` }}>
                    <PlayerHeadshot playerId={p.id} name={p.name} size={40} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, color: t.textWhite, fontSize: '0.9rem' }}>{p.name}</div>
                      <div style={{ fontSize: '0.62rem', color: t.accent, fontWeight: 600 }}>{p.pos} · #{p.num}</div>
                    </div>
                    <div style={{ width: 32, height: 32, background: `linear-gradient(135deg, ${t.accent}, ${t.cyan})`, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontFamily: "'Bebas Neue'", fontSize: '1rem', color: '#fff' }}>{p.rating}</span>
                    </div>
                  </div>
                  <div style={{ padding: '10px 16px', flex: 1, overflowY: 'auto' }}>
                    <div style={{ fontSize: '0.6rem', fontWeight: 700, color: t.textMuted, letterSpacing: '0.1em', marginBottom: 8 }}>SEASON STATS</div>
                    {p.type === 'batter' ? (
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                        {[['AVG', p.stats.avg], ['OBP', p.stats.obp], ['SLG', p.stats.slg], ['OPS', p.stats.ops], ['HR', p.stats.hr], ['RBI', p.stats.rbi]].map(([l, v]) => (
                          <div key={l} style={{ textAlign: 'center', padding: '8px 4px', background: t.inputBg, borderRadius: 8 }}>
                            <div style={{ fontFamily: "'JetBrains Mono'", fontSize: '0.9rem', fontWeight: 700, color: t.textWhite }}>{v}</div>
                            <div style={{ fontSize: '0.55rem', fontWeight: 600, color: t.textMuted, letterSpacing: '0.08em' }}>{l}</div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                        {[['ERA', p.stats.era], ['WHIP', p.stats.whip], ['SO', p.stats.so], ['W', p.stats.w]].map(([l, v]) => (
                          <div key={l} style={{ textAlign: 'center', padding: '8px 4px', background: t.inputBg, borderRadius: 8 }}>
                            <div style={{ fontFamily: "'JetBrains Mono'", fontSize: '0.9rem', fontWeight: 700, color: t.textWhite }}>{v}</div>
                            <div style={{ fontSize: '0.55rem', fontWeight: 600, color: t.textMuted, letterSpacing: '0.08em' }}>{l}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div style={{ padding: '8px 16px 12px', borderTop: `1px solid ${t.divider}` }}>
                    <button
                      onClick={(e) => { e.stopPropagation(); openPlayerProfile(p) }}
                      style={{
                        width: '100%', padding: '10px', border: `1px solid ${t.accent}44`,
                        borderRadius: 10, background: `${t.accent}15`, color: t.accent,
                        fontFamily: "'DM Sans'", fontSize: '0.75rem', fontWeight: 700,
                        cursor: 'pointer', letterSpacing: '0.06em',
                      }}>VER FICHA COMPLETA →</button>
                  </div>
                  <div style={{ position: 'absolute', bottom: 42, right: 10, fontSize: '0.55rem', color: t.textMuted }}>← TAP TO FLIP</div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

    </div>
  )
}

/* ═══════════════════════════════════════════
   PLAYER PROFILE MODAL
   ═══════════════════════════════════════════ */
function PlayerProfile({ player, onClose }) {
  const t = useTheme()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!player?.id) return
    api.getPlayerCareerStats(player.id).then(d => { setData(d); setLoading(false) }).catch(() => setLoading(false))
  }, [player?.id])

  const info = data?.info || {}
  const hitting = data?.hitting || []
  const pitching = data?.pitching || []
  const seasons = player.type === 'pitcher' ? pitching : hitting
  const hasBoth = hitting.length > 0 && pitching.length > 0
  const [tab, setTab] = useState('main')

  return (
    <div onClick={onClose} style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 9999,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        width: '90%', maxWidth: 800, maxHeight: '90vh', overflowY: 'auto',
        background: t.cardBg, border: `1px solid ${t.accent}33`,
        borderRadius: 20, backdropFilter: 'blur(20px)',
      }}>
        {/* Header */}
        <div style={{
          padding: '24px 28px', display: 'flex', gap: 20, alignItems: 'center',
          borderBottom: `1px solid ${t.divider}`,
          background: `linear-gradient(135deg, ${t.accent}12, transparent)`,
        }}>
          <PlayerHeadshot playerId={player.id} name={player.name} size={90} />
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "'Oswald'", fontSize: '1.8rem', fontWeight: 700, color: t.textWhite, letterSpacing: '0.06em' }}>{info.fullName || player.name}</div>
            <div style={{ display: 'flex', gap: 8, marginTop: 6, flexWrap: 'wrap' }}>
              {info.position && <span style={{ padding: '3px 10px', borderRadius: 6, fontSize: '0.65rem', fontWeight: 700, background: `${t.accent}22`, color: t.accent, border: `1px solid ${t.accent}44` }}>{info.position}</span>}
              {info.number && <span style={{ padding: '3px 10px', borderRadius: 6, fontSize: '0.65rem', fontWeight: 700, background: t.inputBg, color: t.text, border: `1px solid ${t.cardBorder}` }}>#{info.number}</span>}
              {info.team && <span style={{ padding: '3px 10px', borderRadius: 6, fontSize: '0.65rem', fontWeight: 700, background: t.inputBg, color: t.text, border: `1px solid ${t.cardBorder}` }}>{info.team}</span>}
            </div>
            {!loading && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, auto)', gap: 16, marginTop: 12 }}>
                {info.age && <div><div style={{ fontFamily: "'JetBrains Mono'", fontSize: '1.1rem', fontWeight: 700, color: t.textWhite }}>{info.age}</div><div style={{ fontSize: '0.55rem', fontWeight: 600, color: t.textMuted, letterSpacing: '0.08em' }}>AGE</div></div>}
                {info.height && <div><div style={{ fontFamily: "'JetBrains Mono'", fontSize: '1.1rem', fontWeight: 700, color: t.textWhite }}>{info.height}</div><div style={{ fontSize: '0.55rem', fontWeight: 600, color: t.textMuted, letterSpacing: '0.08em' }}>HEIGHT</div></div>}
                {info.weight && <div><div style={{ fontFamily: "'JetBrains Mono'", fontSize: '1.1rem', fontWeight: 700, color: t.textWhite }}>{info.weight}lb</div><div style={{ fontSize: '0.55rem', fontWeight: 600, color: t.textMuted, letterSpacing: '0.08em' }}>WEIGHT</div></div>}
                {info.batSide && <div><div style={{ fontFamily: "'JetBrains Mono'", fontSize: '1.1rem', fontWeight: 700, color: t.textWhite }}>{info.batSide[0]}/{info.pitchHand?.[0] || '?'}</div><div style={{ fontSize: '0.55rem', fontWeight: 600, color: t.textMuted, letterSpacing: '0.08em' }}>BAT/THR</div></div>}
              </div>
            )}
          </div>
          <button onClick={onClose} style={{
            background: t.inputBg, border: `1px solid ${t.cardBorder}`, color: t.textStrong,
            width: 36, height: 36, borderRadius: '50%', cursor: 'pointer', fontSize: '1.1rem',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, alignSelf: 'flex-start',
          }}>✕</button>
        </div>

        {/* Bio */}
        {!loading && (
          <div style={{ padding: '16px 28px', display: 'flex', gap: 20, flexWrap: 'wrap', borderBottom: `1px solid ${t.divider}` }}>
            {info.birthCity && <div style={{ fontSize: '0.78rem', color: t.text }}><span style={{ color: t.textMuted, fontSize: '0.65rem', fontWeight: 600 }}>FROM </span>{info.birthCity}{info.birthState ? `, ${info.birthState}` : ''}, {info.birthCountry}</div>}
            {info.birthDate && <div style={{ fontSize: '0.78rem', color: t.text }}><span style={{ color: t.textMuted, fontSize: '0.65rem', fontWeight: 600 }}>BORN </span>{info.birthDate}</div>}
            {info.mlbDebutDate && <div style={{ fontSize: '0.78rem', color: t.text }}><span style={{ color: t.textMuted, fontSize: '0.65rem', fontWeight: 600 }}>MLB DEBUT </span>{info.mlbDebutDate}</div>}
          </div>
        )}

        {/* Tabs if has both hitting + pitching (Ohtani) */}
        {hasBoth && (
          <div style={{ display: 'flex', gap: 6, padding: '12px 28px', borderBottom: `1px solid ${t.divider}` }}>
            <FilterBtn active={tab === 'main'} onClick={() => setTab('main')}>{player.type === 'pitcher' ? 'PITCHING' : 'HITTING'}</FilterBtn>
            <FilterBtn active={tab === 'alt'} onClick={() => setTab('alt')}>{player.type === 'pitcher' ? 'HITTING' : 'PITCHING'}</FilterBtn>
          </div>
        )}

        {/* Career stats table */}
        <div style={{ padding: '16px 28px 24px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: 30, color: t.textMuted }}>Cargando historial...</div>
          ) : (
            <>
              <div style={{ fontSize: '0.65rem', fontWeight: 700, color: t.textMuted, letterSpacing: '0.1em', marginBottom: 12 }}>
                CAREER {tab === 'alt' ? (player.type === 'pitcher' ? 'HITTING' : 'PITCHING') : (player.type === 'pitcher' ? 'PITCHING' : 'HITTING')} STATS
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: "'JetBrains Mono'", fontSize: '0.75rem' }}>
                  <thead>
                    <tr>
                      {(() => {
                        const showPitching = (tab === 'main' && player.type === 'pitcher') || (tab === 'alt' && player.type !== 'pitcher')
                        const cols = showPitching
                          ? ['YEAR', 'TEAM', 'W', 'L', 'ERA', 'G', 'GS', 'IP', 'SO', 'BB', 'WHIP']
                          : ['YEAR', 'TEAM', 'G', 'AB', 'AVG', 'OBP', 'SLG', 'HR', 'RBI', 'R', 'SB']
                        return cols.map(c => (
                          <th key={c} style={{ padding: '8px 8px', textAlign: c === 'TEAM' ? 'left' : 'center', color: t.textMuted, fontWeight: 600, fontSize: '0.6rem', letterSpacing: '0.08em', borderBottom: `1px solid ${t.divider}` }}>{c}</th>
                        ))
                      })()}
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      const showPitching = (tab === 'main' && player.type === 'pitcher') || (tab === 'alt' && player.type !== 'pitcher')
                      const rows = showPitching ? pitching : hitting
                      return rows.map((s, i) => (
                        <tr key={i} className="standings-row" style={{ background: s.teamAbbr === 'LAD' ? `${t.accent}08` : 'transparent' }}>
                          <td style={{ padding: '8px', textAlign: 'center', color: t.textStrong, fontWeight: 600, borderBottom: `1px solid ${t.divider}` }}>{s.season}</td>
                          <td style={{ padding: '8px', textAlign: 'left', borderBottom: `1px solid ${t.divider}` }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <TeamLogo abbr={s.teamAbbr} teamId={s.teamId} size={18} />
                              <span style={{ color: s.teamAbbr === 'LAD' ? t.accent : t.text, fontWeight: 500, fontSize: '0.72rem' }}>{s.teamAbbr}</span>
                            </div>
                          </td>
                          {showPitching ? (
                            <>
                              <td style={tdS(t)}>{s.stats.wins}</td>
                              <td style={tdS(t)}>{s.stats.losses}</td>
                              <td style={{ ...tdS(t), color: t.textWhite, fontWeight: 700 }}>{s.stats.era}</td>
                              <td style={tdS(t)}>{s.stats.gamesPlayed}</td>
                              <td style={tdS(t)}>{s.stats.gamesStarted}</td>
                              <td style={tdS(t)}>{s.stats.inningsPitched}</td>
                              <td style={tdS(t)}>{s.stats.strikeOuts}</td>
                              <td style={tdS(t)}>{s.stats.baseOnBalls}</td>
                              <td style={tdS(t)}>{s.stats.whip}</td>
                            </>
                          ) : (
                            <>
                              <td style={tdS(t)}>{s.stats.gamesPlayed}</td>
                              <td style={tdS(t)}>{s.stats.atBats}</td>
                              <td style={{ ...tdS(t), color: t.textWhite, fontWeight: 700 }}>{s.stats.avg}</td>
                              <td style={tdS(t)}>{s.stats.obp}</td>
                              <td style={tdS(t)}>{s.stats.slg}</td>
                              <td style={tdS(t)}>{s.stats.homeRuns}</td>
                              <td style={tdS(t)}>{s.stats.rbi}</td>
                              <td style={tdS(t)}>{s.stats.runs}</td>
                              <td style={tdS(t)}>{s.stats.stolenBases}</td>
                            </>
                          )}
                        </tr>
                      ))
                    })()}
                  </tbody>
                </table>
              </div>
              {seasons.length === 0 && <div style={{ textAlign: 'center', padding: 20, color: t.textMuted }}>No hay datos disponibles</div>}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

const tdS = (t) => ({ padding: '8px', textAlign: 'center', color: t.text, borderBottom: `1px solid ${t.divider}`, fontSize: '0.72rem' })

/* ═══════════════════════════════════════════
   CHAT
   ═══════════════════════════════════════════ */
/* ═══════════════════════════════════════════
   CALENDAR SECTION
   ═══════════════════════════════════════════ */
function CalendarSection() {
  const t = useTheme()
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [games, setGames] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedDay, setSelectedDay] = useState(null)
  const [teamId, setTeamId] = useState(119)
  const [allTeams, setAllTeams] = useState([])

  useEffect(() => { api.getAllTeams().then(setAllTeams).catch(() => {}) }, [])

  useEffect(() => {
    setLoading(true)
    api.getMonthlySchedule(teamId, year, month).then(g => { setGames(g); setLoading(false); setSelectedDay(null) }).catch(() => setLoading(false))
  }, [year, month, teamId])

  const monthNames = ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
  const firstDayOfWeek = new Date(year, month - 1, 1).getDay()
  const daysInMonth = new Date(year, month, 0).getDate()
  const todayDate = now.getDate()
  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth() + 1

  const gamesByDay = {}
  games.forEach(g => {
    const day = g.dayOfMonth
    if (!gamesByDay[day]) gamesByDay[day] = []
    gamesByDay[day].push(g)
  })

  const prevMonth = () => { if (month === 1) { setMonth(12); setYear(y => y - 1) } else setMonth(m => m - 1) }
  const nextMonth = () => { if (month === 12) { setMonth(1); setYear(y => y + 1) } else setMonth(m => m + 1) }

  const wins = games.filter(g => g.win === true).length
  const losses = games.filter(g => g.win === false).length
  const selectedGames = selectedDay ? (gamesByDay[selectedDay] || []) : []

  const selectStyle = { padding: '8px 14px', background: t.inputBg, border: `1px solid ${t.inputBorder}`, borderRadius: 10, color: t.textStrong, fontFamily: "'DM Sans'", fontSize: '0.78rem', fontWeight: 600, outline: 'none', cursor: 'pointer' }

  return (
    <div style={{ maxWidth: 1200 }}>
      <SectionHeader icon="📅" title="CALENDAR" />

      {/* Controls */}
      <Card>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <select value={teamId} onChange={e => setTeamId(Number(e.target.value))} style={selectStyle}>
            <option value={119}>⭐ LA Dodgers</option>
            <optgroup label="── ALL MLB ──">
              {allTeams.filter(t => t.id !== 119).map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </optgroup>
          </select>
          {teamId !== 119 && (
            <button onClick={() => setTeamId(119)} style={{ ...selectStyle, background: `${t.accent}18`, borderColor: `${t.accent}33`, color: t.accent }}>🔵 Dodgers</button>
          )}
          <div style={{ flex: 1 }} />
          {/* Month record */}
          {(wins > 0 || losses > 0) && (
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: "'JetBrains Mono'", fontSize: '1.2rem', fontWeight: 700, color: t.green }}>{wins}</div>
                <div style={{ fontSize: '0.55rem', fontWeight: 600, color: t.textMuted, letterSpacing: '0.08em' }}>WINS</div>
              </div>
              <div style={{ width: 1, height: 28, background: t.divider }} />
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: "'JetBrains Mono'", fontSize: '1.2rem', fontWeight: 700, color: t.red }}>{losses}</div>
                <div style={{ fontSize: '0.55rem', fontWeight: 600, color: t.textMuted, letterSpacing: '0.08em' }}>LOSSES</div>
              </div>
              <div style={{ width: 1, height: 28, background: t.divider }} />
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: "'JetBrains Mono'", fontSize: '1.2rem', fontWeight: 700, color: t.textWhite }}>{wins + losses > 0 ? (wins / (wins + losses) * 100).toFixed(0) : 0}%</div>
                <div style={{ fontSize: '0.55rem', fontWeight: 600, color: t.textMuted, letterSpacing: '0.08em' }}>WIN%</div>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Calendar grid */}
      <Card style={{ padding: 16 }}>
        {/* Month nav */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <button onClick={prevMonth} style={{ background: t.inputBg, border: `1px solid ${t.inputBorder}`, borderRadius: 8, width: 36, height: 36, cursor: 'pointer', color: t.textStrong, fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>‹</button>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: "'Oswald'", fontSize: '1.4rem', fontWeight: 700, color: t.textWhite, letterSpacing: '0.08em' }}>{monthNames[month].toUpperCase()}</div>
            <div style={{ fontFamily: "'JetBrains Mono'", fontSize: '0.75rem', color: t.textMuted }}>{year}</div>
          </div>
          <button onClick={nextMonth} style={{ background: t.inputBg, border: `1px solid ${t.inputBorder}`, borderRadius: 8, width: 36, height: 36, cursor: 'pointer', color: t.textStrong, fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>›</button>
        </div>

        {loading && <div style={{ textAlign: 'center', padding: 40, color: t.textMuted }}>Cargando calendario...</div>}

        {!loading && (
          <>
            {/* Day names */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 4 }}>
              {dayNames.map(d => (
                <div key={d} style={{ textAlign: 'center', fontSize: '0.58rem', fontWeight: 700, color: t.textMuted, letterSpacing: '0.1em', padding: '6px 0' }}>{d}</div>
              ))}
            </div>

            {/* Calendar cells */}
            <div className="grid-calendar" style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
              {/* Empty cells for offset */}
              {Array.from({ length: firstDayOfWeek }).map((_, i) => <div key={`e${i}`} />)}

              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1
                const dayGames = gamesByDay[day] || []
                const hasGame = dayGames.length > 0
                const isToday = isCurrentMonth && day === todayDate
                const isSelected = selectedDay === day
                const win = dayGames[0]?.win
                const isLive = dayGames.some(g => g.isLive)
                const opp = dayGames[0] ? (dayGames[0].isHome ? dayGames[0].away : dayGames[0].home) : null

                const isHome = dayGames[0]?.isHome
                const homeAwayColor = hasGame ? (isHome ? t.accent : '#FF8C00') : 'transparent'

                return (
                  <div
                    key={day}
                    onClick={() => hasGame && setSelectedDay(isSelected ? null : day)}
                    style={{
                      padding: '6px 4px', borderRadius: 10, minHeight: 78, cursor: hasGame ? 'pointer' : 'default',
                      background: isSelected ? `${t.accent}18` : isToday ? `${t.accent}12` : 'transparent',
                      border: isToday ? `2px solid ${t.accent}88` : `1px solid ${isSelected ? t.accent + '44' : t.divider}`,
                      borderLeft: hasGame && !isToday ? `3px solid ${homeAwayColor}` : undefined,
                      boxShadow: isToday ? `0 0 16px ${t.accentGlow}, inset 0 0 20px ${t.accent}08` : 'none',
                      transition: 'all 0.2s ease',
                      position: 'relative',
                    }}
                  >
                    {/* TODAY label */}
                    {isToday && (
                      <div style={{
                        position: 'absolute', top: -8, left: '50%', transform: 'translateX(-50%)',
                        fontSize: '0.42rem', fontWeight: 800, letterSpacing: '0.1em',
                        padding: '1px 6px', borderRadius: 4,
                        background: t.accent, color: '#fff',
                        boxShadow: `0 0 8px ${t.accentGlow}`,
                      }}>TODAY</div>
                    )}
                    {/* Day number + indicators */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <span style={{
                        fontSize: isToday ? '0.78rem' : '0.72rem', fontWeight: isToday ? 800 : 600,
                        color: isToday ? t.accent : hasGame ? t.textStrong : t.textMuted,
                        ...(isToday ? {
                          background: `${t.accent}22`, borderRadius: '50%',
                          width: 24, height: 24, display: 'inline-flex',
                          alignItems: 'center', justifyContent: 'center',
                          border: `1.5px solid ${t.accent}66`,
                        } : {}),
                      }}>{day}</span>
                      <div style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
                        {hasGame && (
                          <span style={{
                            fontSize: '0.42rem', fontWeight: 800, padding: '1px 4px', borderRadius: 3,
                            letterSpacing: '0.05em',
                            background: isHome ? `${t.accent}22` : '#FF8C0022',
                            color: isHome ? t.accent : '#FF8C00',
                            border: `1px solid ${isHome ? t.accent + '44' : '#FF8C0044'}`,
                          }}>{isHome ? 'HOME' : 'AWAY'}</span>
                        )}
                        {isLive && <span style={{ width: 6, height: 6, borderRadius: '50%', background: t.red, boxShadow: `0 0 6px ${t.red}88` }} className="live-dot" />}
                      </div>
                    </div>

                    {hasGame && (
                      <div style={{ textAlign: 'center' }}>
                        <TeamLogo abbr={opp.abbr} teamId={opp.id} size={22} />
                        <div style={{ fontSize: '0.5rem', fontWeight: 600, color: t.textMuted, marginTop: 2 }}>
                          <span style={{ color: isHome ? t.accent : '#FF8C00', fontWeight: 700 }}>{isHome ? 'vs' : '@'}</span> {opp.abbr}
                        </div>
                        {dayGames[0].isFinal ? (
                          <div style={{ fontSize: '0.58rem', fontWeight: 700, marginTop: 2, color: win ? t.green : t.red }}>
                            {win ? 'W' : 'L'} {isHome
                              ? `${dayGames[0].home.score}-${dayGames[0].away.score}`
                              : `${dayGames[0].away.score}-${dayGames[0].home.score}`}
                          </div>
                        ) : isLive ? (
                          <div style={{ fontSize: '0.55rem', fontWeight: 700, color: t.red, marginTop: 2 }}>LIVE</div>
                        ) : (
                          <div style={{ fontSize: '0.5rem', color: t.textMuted, marginTop: 2 }}>
                            {new Date(dayGames[0].date).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </>
        )}

        {/* Legend */}
        <div style={{ display: 'flex', gap: 20, justifyContent: 'center', marginTop: 14, paddingTop: 12, borderTop: `1px solid ${t.divider}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 16, height: 10, borderRadius: 3, borderLeft: `3px solid ${t.accent}`, background: `${t.accent}15` }} />
            <span style={{ fontSize: '0.62rem', fontWeight: 600, color: t.textMuted }}>🏠 HOME</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 16, height: 10, borderRadius: 3, borderLeft: '3px solid #FF8C00', background: '#FF8C0015' }} />
            <span style={{ fontSize: '0.62rem', fontWeight: 600, color: t.textMuted }}>✈️ AWAY</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 10, height: 10, borderRadius: 3, background: t.green }} />
            <span style={{ fontSize: '0.62rem', fontWeight: 600, color: t.textMuted }}>WIN</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 10, height: 10, borderRadius: 3, background: t.red }} />
            <span style={{ fontSize: '0.62rem', fontWeight: 600, color: t.textMuted }}>LOSS</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: t.red, boxShadow: `0 0 4px ${t.red}88` }} />
            <span style={{ fontSize: '0.62rem', fontWeight: 600, color: t.textMuted }}>LIVE</span>
          </div>
        </div>
      </Card>

      {/* Selected day detail */}
      {selectedDay && selectedGames.length > 0 && (
        <Card style={{ marginTop: 12, borderColor: `${t.accent}33` }}>
          <CardHeader>
            {monthNames[month].toUpperCase()} {selectedDay} — GAME DETAILS
          </CardHeader>
          {selectedGames.map((game, gi) => {
            const opp = game.isHome ? game.away : game.home
            const team = game.isHome ? game.home : game.away
            const dt = new Date(game.date)
            const timeStr = dt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })

            return (
              <div key={gi} style={{
                padding: '16px 0',
                borderBottom: gi < selectedGames.length - 1 ? `1px solid ${t.divider}` : 'none',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  {/* Teams */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
                    <TeamLogo abbr={game.away.abbr} teamId={game.away.id} size={40} highlight={game.away.id === teamId} />
                    <div>
                      <div style={{ fontWeight: 700, color: game.away.id === teamId ? t.accent : t.textStrong, fontSize: '0.9rem' }}>{game.away.name}</div>
                      <div style={{ fontSize: '0.65rem', color: t.textMuted }}>{game.awayRecord}</div>
                    </div>
                  </div>

                  {/* Score / VS */}
                  <div style={{ textAlign: 'center', minWidth: 80 }}>
                    {game.isFinal ? (
                      <>
                        <div style={{ fontFamily: "'Bebas Neue'", fontSize: '2rem', color: t.textWhite }}>{game.away.score} - {game.home.score}</div>
                        <span style={{
                          fontSize: '0.6rem', fontWeight: 700, padding: '2px 10px', borderRadius: 6,
                          background: game.win ? `${t.green}18` : `${t.red}18`,
                          color: game.win ? t.green : t.red,
                          border: `1px solid ${game.win ? t.green + '33' : t.red + '33'}`,
                        }}>{game.win ? 'WIN' : 'LOSS'}</span>
                      </>
                    ) : game.isLive ? (
                      <>
                        <div style={{ fontFamily: "'Bebas Neue'", fontSize: '2rem', color: t.textWhite }}>{game.away.score} - {game.home.score}</div>
                        <span style={{ fontSize: '0.6rem', fontWeight: 700, padding: '2px 10px', borderRadius: 6, background: `${t.red}18`, color: t.red, border: `1px solid ${t.red}33` }}>LIVE</span>
                      </>
                    ) : (
                      <>
                        <div style={{ fontFamily: "'Bebas Neue'", fontSize: '1.8rem', color: t.textMuted3 }}>VS</div>
                        <div style={{ fontSize: '0.72rem', fontWeight: 600, color: t.text }}>{timeStr}</div>
                      </>
                    )}
                  </div>

                  {/* Home */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, justifyContent: 'flex-end' }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 700, color: game.home.id === teamId ? t.accent : t.textStrong, fontSize: '0.9rem' }}>{game.home.name}</div>
                      <div style={{ fontSize: '0.65rem', color: t.textMuted }}>{game.homeRecord}</div>
                    </div>
                    <TeamLogo abbr={game.home.abbr} teamId={game.home.id} size={40} highlight={game.home.id === teamId} />
                  </div>
                </div>

                {/* Details row */}
                <div style={{ display: 'flex', gap: 16, marginTop: 10, fontSize: '0.68rem', color: t.textMuted, justifyContent: 'center' }}>
                  <span>📍 {game.venue}</span>
                  {game.isHome ? <span>🏠 Home</span> : <span>✈️ Away</span>}
                  {game.awayPitcher && <span>⚾ {game.away.abbr}: {game.awayPitcher}</span>}
                  {game.homePitcher && <span>⚾ {game.home.abbr}: {game.homePitcher}</span>}
                </div>
              </div>
            )
          })}
        </Card>
      )}

      {/* Monthly W/L bar chart */}
      {games.some(g => g.isFinal) && (
        <Card style={{ marginTop: 12 }}>
          <CardHeader>📊 MONTHLY RESULTS</CardHeader>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 80, padding: '8px 0' }}>
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1
              const dayGames = gamesByDay[day] || []
              const game = dayGames[0]
              if (!game || !game.isFinal) return (
                <div key={day} style={{ flex: 1, height: 4, background: t.inputBg, borderRadius: 2 }} />
              )
              const won = game.win
              const margin = game.isHome
                ? Math.abs((game.home.score || 0) - (game.away.score || 0))
                : Math.abs((game.away.score || 0) - (game.home.score || 0))
              const h = Math.max(12, Math.min(80, margin * 10 + 20))
              return (
                <div key={day} title={`${monthNames[month]} ${day}: ${won ? 'W' : 'L'}`}
                  style={{
                    flex: 1, height: h, borderRadius: '4px 4px 0 0',
                    background: won ? `linear-gradient(180deg, ${t.green}, ${t.green}88)` : `linear-gradient(180deg, ${t.red}, ${t.red}88)`,
                    cursor: 'pointer', transition: 'all 0.2s',
                  }}
                  onClick={() => setSelectedDay(day)}
                />
              )
            })}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.55rem', color: t.textMuted, marginTop: 4 }}>
            <span>1</span><span>{Math.floor(daysInMonth / 2)}</span><span>{daysInMonth}</span>
          </div>
        </Card>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════
   BETS SECTION
   ═══════════════════════════════════════════ */
function BetsSection() {
  const t = useTheme()
  const [odds, setOdds] = useState([])
  const [isLiveOdds, setIsLiveOdds] = useState(false)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('dodgers')
  const [marketTab, setMarketTab] = useState('h2h')

  useEffect(() => {
    api.getMLBOdds().then(d => { setOdds(d.games || []); setIsLiveOdds(d.isLive || false); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  const isDodgersGame = (g) => g.away?.includes('Dodgers') || g.home?.includes('Dodgers')
  const filtered = filter === 'dodgers' ? odds.filter(isDodgersGame) : odds
  const dodgersGames = odds.filter(isDodgersGame)

  // Helpers
  const oddsColor = (price) => price > 0 ? t.green : price < 0 ? t.red : t.text
  const fmtOdds = (price) => price > 0 ? `+${price}` : `${price}`
  const impliedProb = (price) => {
    if (price > 0) return (100 / (price + 100) * 100).toFixed(1)
    return (Math.abs(price) / (Math.abs(price) + 100) * 100).toFixed(1)
  }

  // Mini bar chart component
  const ProbBar = ({ away, home, awayName, homeName }) => {
    const aw = parseFloat(away), hm = parseFloat(home)
    const total = aw + hm
    const awPct = total ? (aw / total * 100) : 50
    return (
      <div style={{ marginTop: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={{ fontSize: '0.62rem', fontWeight: 600, color: t.text }}>{awayName} {away}%</span>
          <span style={{ fontSize: '0.62rem', fontWeight: 600, color: t.text }}>{home}% {homeName}</span>
        </div>
        <div style={{ width: '100%', height: 8, borderRadius: 4, background: t.inputBg, overflow: 'hidden', display: 'flex' }}>
          <div style={{ width: `${awPct}%`, height: '100%', background: `linear-gradient(90deg, ${t.red}, ${t.red}aa)`, borderRadius: '4px 0 0 4px', transition: 'width 0.5s ease' }} />
          <div style={{ flex: 1, height: '100%', background: `linear-gradient(90deg, ${t.accent}aa, ${t.accent})`, borderRadius: '0 4px 4px 0' }} />
        </div>
      </div>
    )
  }

  // Odds movement sparkline (mock visual)
  const OddsSparkline = ({ seed }) => {
    const points = Array.from({ length: 12 }, (_, i) => {
      const base = 50 + Math.sin(seed + i * 0.8) * 15 + Math.cos(seed * 2 + i) * 8
      return Math.max(10, Math.min(90, base))
    })
    const path = points.map((y, i) => `${i === 0 ? 'M' : 'L'} ${i * (100 / 11)} ${100 - y}`).join(' ')
    const trend = points[points.length - 1] > points[0]
    return (
      <svg width="100" height="32" viewBox="0 0 100 100" style={{ overflow: 'visible' }}>
        <defs>
          <linearGradient id={`sg${seed}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={trend ? t.green : t.red} stopOpacity="0.3" />
            <stop offset="100%" stopColor={trend ? t.green : t.red} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={`${path} L 100 100 L 0 100 Z`} fill={`url(#sg${seed})`} />
        <path d={path} fill="none" stroke={trend ? t.green : t.red} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx={100} cy={100 - points[points.length - 1]} r="3" fill={trend ? t.green : t.red} />
      </svg>
    )
  }

  if (loading) return <div style={{ maxWidth: 1200 }}><SectionHeader icon="🎰" title="BETS" /><Card><div style={{ textAlign: 'center', padding: 30, color: t.textMuted }}>Cargando odds...</div></Card></div>

  return (
    <div style={{ maxWidth: 1200 }}>
      <SectionHeader icon="🎰" title="BETS" />

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <FilterBtn active={filter === 'dodgers'} onClick={() => setFilter('dodgers')}>🔵 DODGERS</FilterBtn>
        <FilterBtn active={filter === 'all'} onClick={() => setFilter('all')}>⚾ ALL MLB</FilterBtn>
        <div style={{ width: 1, height: 28, background: t.divider, margin: '0 4px' }} />
        <FilterBtn active={marketTab === 'h2h'} onClick={() => setMarketTab('h2h')}>MONEYLINE</FilterBtn>
        <FilterBtn active={marketTab === 'spreads'} onClick={() => setMarketTab('spreads')}>RUN LINE</FilterBtn>
        <FilterBtn active={marketTab === 'totals'} onClick={() => setMarketTab('totals')}>OVER/UNDER</FilterBtn>
      </div>

      {/* Simulated odds banner */}
      {!isLiveOdds && odds.length > 0 && (
        <Card style={{ padding: '12px 20px', borderColor: `${t.yellow}33`, background: `${t.yellow}08`, marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: '1rem' }}>⚠️</span>
            <div>
              <div style={{ fontWeight: 700, color: t.yellow, fontSize: '0.75rem' }}>ODDS SIMULADAS</div>
              <div style={{ fontSize: '0.68rem', color: t.text, marginTop: 2 }}>
                Basadas en records reales de los equipos de hoy. Para odds en vivo, configura tu API key de <span style={{ color: t.accent }}>the-odds-api.com</span> en api.js
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* No games today */}
      {!loading && odds.length === 0 && (
        <Card><div style={{ textAlign: 'center', padding: 30, color: t.textMuted }}>No hay juegos programados para hoy</div></Card>
      )}

      {/* ── DODGERS SPOTLIGHT (when dodgers filter) ── */}
      {filter === 'dodgers' && dodgersGames.length > 0 && (
        <Card style={{ borderColor: `${t.accent}33`, background: `linear-gradient(135deg, ${t.cardBg}, ${t.accent}06)` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <CardHeader>🔵 DODGERS BETTING SPOTLIGHT</CardHeader>
          </div>
          {dodgersGames.map((game, gi) => {
            const h2h = game.markets.h2h || {}
            const firstBook = Object.keys(h2h)[0]
            const outcomes = h2h[firstBook] || []
            const dodgersLine = outcomes.find(o => o.name?.includes('Dodgers'))
            const oppLine = outcomes.find(o => !o.name?.includes('Dodgers'))
            const dodgersProb = dodgersLine ? impliedProb(dodgersLine.price) : '50.0'
            const oppProb = oppLine ? impliedProb(oppLine.price) : '50.0'
            const spreads = game.markets.spreads || {}
            const totals = game.markets.totals || {}
            const spreadBook = Object.keys(spreads)[0]
            const totalBook = Object.keys(totals)[0]
            const dt = new Date(game.commence)
            const timeStr = dt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
            const dateStr = dt.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })

            return (
              <div key={gi} style={{ marginBottom: gi < dodgersGames.length - 1 ? 20 : 0, paddingBottom: gi < dodgersGames.length - 1 ? 20 : 0, borderBottom: gi < dodgersGames.length - 1 ? `1px solid ${t.divider}` : 'none' }}>
                {/* Teams header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20, marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <TeamLogo abbr={game.away.includes('Dodgers') ? 'LAD' : game.away.split(' ').pop()} size={36} />
                    <div>
                      <div style={{ fontWeight: 700, color: game.away.includes('Dodgers') ? t.accent : t.textStrong, fontSize: '0.9rem' }}>{game.away}</div>
                      {dodgersLine && game.away.includes('Dodgers') && <div style={{ fontFamily: "'Bebas Neue'", fontSize: '1.6rem', color: oddsColor(dodgersLine.price) }}>{fmtOdds(dodgersLine.price)}</div>}
                      {oppLine && !game.away.includes('Dodgers') && <div style={{ fontFamily: "'Bebas Neue'", fontSize: '1.6rem', color: oddsColor(oppLine.price) }}>{fmtOdds(oppLine.price)}</div>}
                    </div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontFamily: "'Bebas Neue'", fontSize: '1.4rem', color: t.textMuted3 }}>VS</div>
                    <div style={{ fontSize: '0.62rem', color: t.textMuted }}>{dateStr}</div>
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color: t.text }}>{timeStr}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 700, color: game.home.includes('Dodgers') ? t.accent : t.textStrong, fontSize: '0.9rem' }}>{game.home}</div>
                      {dodgersLine && game.home.includes('Dodgers') && <div style={{ fontFamily: "'Bebas Neue'", fontSize: '1.6rem', color: oddsColor(dodgersLine.price) }}>{fmtOdds(dodgersLine.price)}</div>}
                      {oppLine && !game.home.includes('Dodgers') && <div style={{ fontFamily: "'Bebas Neue'", fontSize: '1.6rem', color: oddsColor(oppLine.price) }}>{fmtOdds(oppLine.price)}</div>}
                    </div>
                    <TeamLogo abbr={game.home.includes('Dodgers') ? 'LAD' : game.home.split(' ').pop()} size={36} />
                  </div>
                </div>

                {/* Win probability bar */}
                <ProbBar away={oppProb} home={dodgersProb}
                  awayName={game.away.includes('Dodgers') ? game.home.split(' ').pop() : game.away.split(' ').pop()}
                  homeName="Dodgers" />

                {/* Markets grid */}
                <div className="grid-3col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginTop: 16 }}>
                  {/* Moneyline */}
                  <div style={{ background: t.inputBg, borderRadius: 12, padding: '12px', border: `1px solid ${t.cardBorder}` }}>
                    <div style={{ fontSize: '0.58rem', fontWeight: 700, color: t.textMuted, letterSpacing: '0.1em', marginBottom: 8 }}>MONEYLINE</div>
                    {Object.entries(h2h).map(([book, outs]) => (
                      <div key={book} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: '0.72rem' }}>
                        <span style={{ color: t.textMuted, fontSize: '0.62rem' }}>{book}</span>
                        <div style={{ display: 'flex', gap: 12 }}>
                          {outs.map((o, i) => (
                            <span key={i} style={{ fontFamily: "'JetBrains Mono'", fontWeight: 700, color: oddsColor(o.price), fontSize: '0.75rem' }}>{fmtOdds(o.price)}</span>
                          ))}
                        </div>
                      </div>
                    ))}
                    <OddsSparkline seed={gi * 3.7 + 1} />
                  </div>

                  {/* Run line */}
                  <div style={{ background: t.inputBg, borderRadius: 12, padding: '12px', border: `1px solid ${t.cardBorder}` }}>
                    <div style={{ fontSize: '0.58rem', fontWeight: 700, color: t.textMuted, letterSpacing: '0.1em', marginBottom: 8 }}>RUN LINE</div>
                    {spreadBook && spreads[spreadBook].map((o, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, padding: '4px 0' }}>
                        <span style={{ fontSize: '0.72rem', color: t.text }}>{o.name?.split(' ').pop()} {o.point > 0 ? `+${o.point}` : o.point}</span>
                        <span style={{ fontFamily: "'JetBrains Mono'", fontWeight: 700, color: oddsColor(o.price), fontSize: '0.75rem' }}>{fmtOdds(o.price)}</span>
                      </div>
                    ))}
                    <OddsSparkline seed={gi * 2.3 + 5} />
                  </div>

                  {/* Totals */}
                  <div style={{ background: t.inputBg, borderRadius: 12, padding: '12px', border: `1px solid ${t.cardBorder}` }}>
                    <div style={{ fontSize: '0.58rem', fontWeight: 700, color: t.textMuted, letterSpacing: '0.1em', marginBottom: 8 }}>OVER/UNDER</div>
                    {totalBook && totals[totalBook].map((o, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, padding: '4px 0' }}>
                        <span style={{ fontSize: '0.72rem', color: t.text }}>{o.name} {o.point}</span>
                        <span style={{ fontFamily: "'JetBrains Mono'", fontWeight: 700, color: oddsColor(o.price), fontSize: '0.75rem' }}>{fmtOdds(o.price)}</span>
                      </div>
                    ))}
                    <OddsSparkline seed={gi * 5.1 + 9} />
                  </div>
                </div>
              </div>
            )
          })}
        </Card>
      )}

      {/* ── ALL GAMES ODDS ── */}
      <div style={{ marginTop: filter === 'dodgers' ? 16 : 0 }}>
        {filter === 'all' && <CardHeader>ALL MLB ODDS</CardHeader>}
        <div className="grid-bets" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 12 }}>
          {filtered.map((game, gi) => {
            const market = game.markets[marketTab] || {}
            const firstBook = Object.keys(market)[0]
            const outcomes = market[firstBook] || []
            const h2h = game.markets.h2h || {}
            const h2hBook = Object.keys(h2h)[0]
            const h2hOutcomes = h2h[h2hBook] || []
            const awayProb = h2hOutcomes[0] ? impliedProb(h2hOutcomes[0].price) : '50'
            const homeProb = h2hOutcomes[1] ? impliedProb(h2hOutcomes[1].price) : '50'
            const dt = new Date(game.commence)
            const timeStr = dt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
            const isDod = isDodgersGame(game)

            return (
              <Card key={gi} style={isDod ? { borderColor: `${t.accent}33` } : {}}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <span style={{ fontSize: '0.62rem', fontWeight: 600, color: t.textMuted }}>{timeStr}</span>
                  {isDod && <span style={{ fontSize: '0.55rem', fontWeight: 700, color: t.accent, padding: '2px 8px', borderRadius: 4, background: `${t.accent}18` }}>DODGERS</span>}
                </div>

                {/* Teams + odds */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <TeamLogo abbr={game.away.split(' ').pop()} size={24} />
                      <span style={{ fontWeight: 600, color: isDod && game.away.includes('Dodgers') ? t.accent : t.textStrong, fontSize: '0.82rem', flex: 1 }}>{game.away}</span>
                      {outcomes[0] && (
                        <span style={{ fontFamily: "'JetBrains Mono'", fontWeight: 700, fontSize: '0.85rem', color: oddsColor(outcomes[0].price), padding: '4px 10px', background: t.inputBg, borderRadius: 6, border: `1px solid ${t.cardBorder}` }}>
                          {marketTab === 'spreads' && outcomes[0].point != null ? `${outcomes[0].point > 0 ? '+' : ''}${outcomes[0].point} ` : ''}
                          {marketTab === 'totals' ? `O ${outcomes[0].point} ` : ''}
                          {fmtOdds(outcomes[0].price)}
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <TeamLogo abbr={game.home.split(' ').pop()} size={24} />
                      <span style={{ fontWeight: 600, color: isDod && game.home.includes('Dodgers') ? t.accent : t.textStrong, fontSize: '0.82rem', flex: 1 }}>{game.home}</span>
                      {outcomes[1] && (
                        <span style={{ fontFamily: "'JetBrains Mono'", fontWeight: 700, fontSize: '0.85rem', color: oddsColor(outcomes[1].price), padding: '4px 10px', background: t.inputBg, borderRadius: 6, border: `1px solid ${t.cardBorder}` }}>
                          {marketTab === 'spreads' && outcomes[1].point != null ? `${outcomes[1].point > 0 ? '+' : ''}${outcomes[1].point} ` : ''}
                          {marketTab === 'totals' ? `U ${outcomes[1].point} ` : ''}
                          {fmtOdds(outcomes[1].price)}
                        </span>
                      )}
                    </div>
                  </div>
                  <OddsSparkline seed={gi * 4.2 + 3} />
                </div>

                {/* Probability bar */}
                <ProbBar away={awayProb} home={homeProb}
                  awayName={game.away.split(' ').pop()} homeName={game.home.split(' ').pop()} />

                {/* Books comparison */}
                {Object.keys(market).length > 1 && (
                  <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${t.divider}` }}>
                    <div style={{ fontSize: '0.55rem', fontWeight: 600, color: t.textMuted, letterSpacing: '0.08em', marginBottom: 6 }}>SPORTSBOOKS</div>
                    {Object.entries(market).map(([book, outs]) => (
                      <div key={book} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
                        <span style={{ fontSize: '0.62rem', color: t.textMuted }}>{book}</span>
                        <div style={{ display: 'flex', gap: 16 }}>
                          {outs.map((o, i) => (
                            <span key={i} style={{ fontFamily: "'JetBrains Mono'", fontSize: '0.68rem', fontWeight: 600, color: oddsColor(o.price) }}>{fmtOdds(o.price)}</span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      </div>

      {/* ── ODDS OVERVIEW CHARTS ── */}
      <Card style={{ marginTop: 16 }}>
        <CardHeader>📊 DODGERS ODDS TRENDS</CardHeader>
        <div className="grid-3col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
          {/* Win % gauge */}
          <div style={{ textAlign: 'center', padding: 16, background: t.inputBg, borderRadius: 14, border: `1px solid ${t.cardBorder}` }}>
            <div style={{ fontSize: '0.6rem', fontWeight: 700, color: t.textMuted, letterSpacing: '0.1em', marginBottom: 12 }}>WIN PROBABILITY TODAY</div>
            <svg width="120" height="70" viewBox="0 0 120 70">
              <path d="M 10 65 A 50 50 0 0 1 110 65" fill="none" stroke={t.inputBorder} strokeWidth="8" strokeLinecap="round" />
              <path d="M 10 65 A 50 50 0 0 1 110 65" fill="none" stroke={`url(#gaugeGrad)`} strokeWidth="8" strokeLinecap="round"
                strokeDasharray="157" strokeDashoffset={157 * (1 - 0.62)} />
              <defs><linearGradient id="gaugeGrad" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor={t.red} /><stop offset="50%" stopColor={t.yellow} /><stop offset="100%" stopColor={t.green} /></linearGradient></defs>
            </svg>
            <div style={{ fontFamily: "'Bebas Neue'", fontSize: '2rem', color: t.textWhite, marginTop: -8 }}>62%</div>
            <div style={{ fontSize: '0.6rem', color: t.textMuted }}>Based on moneyline</div>
          </div>

          {/* Season trend */}
          <div style={{ textAlign: 'center', padding: 16, background: t.inputBg, borderRadius: 14, border: `1px solid ${t.cardBorder}` }}>
            <div style={{ fontSize: '0.6rem', fontWeight: 700, color: t.textMuted, letterSpacing: '0.1em', marginBottom: 12 }}>ODDS TREND (LAST 10)</div>
            <svg width="160" height="60" viewBox="0 0 160 60">
              {['-155', '-145', '-160', '-140', '-170', '-155', '-150', '-165', '-148', '-158'].map((v, i) => {
                const h = (Math.abs(parseInt(v)) - 130) / 50 * 50
                return <rect key={i} x={i * 16} y={60 - h} width="12" height={h} rx="3"
                  fill={parseInt(v) < -150 ? t.accent : `${t.accent}88`} />
              })}
            </svg>
            <div style={{ fontFamily: "'JetBrains Mono'", fontSize: '0.72rem', color: t.accent, marginTop: 8 }}>AVG: -153</div>
            <div style={{ fontSize: '0.58rem', color: t.textMuted }}>Dodgers moneyline</div>
          </div>

          {/* O/U trend */}
          <div style={{ textAlign: 'center', padding: 16, background: t.inputBg, borderRadius: 14, border: `1px solid ${t.cardBorder}` }}>
            <div style={{ fontSize: '0.6rem', fontWeight: 700, color: t.textMuted, letterSpacing: '0.1em', marginBottom: 12 }}>OVER/UNDER TREND</div>
            <svg width="160" height="60" viewBox="0 0 160 60">
              {[8.5, 9.0, 8.0, 9.5, 8.5, 9.0, 8.5, 11.0, 9.0, 8.5].map((v, i) => {
                const h = (v - 7) / 5 * 55
                const overColor = v >= 9 ? t.green : `${t.green}88`
                return <rect key={i} x={i * 16} y={60 - h} width="12" height={h} rx="3" fill={overColor} />
              })}
              {/* Average line */}
              <line x1="0" y1={60 - ((8.8 - 7) / 5 * 55)} x2="160" y2={60 - ((8.8 - 7) / 5 * 55)} stroke={t.yellow} strokeWidth="1" strokeDasharray="4 4" />
            </svg>
            <div style={{ fontFamily: "'JetBrains Mono'", fontSize: '0.72rem', color: t.green, marginTop: 8 }}>AVG: 8.8</div>
            <div style={{ fontSize: '0.58rem', color: t.textMuted }}>Total runs line</div>
          </div>
        </div>
      </Card>
    </div>
  )
}

/* ═══════════════════════════════════════════
   CHAT
   ═══════════════════════════════════════════ */
function ChatSection({ messages, input, setInput, onSend, isTyping, chatEndRef }) {
  const t = useTheme()
  const suggestions = ['Dodgers record?', 'Who leads in HR?', 'Next game?', 'Ohtani stats?']
  return (
    <div style={{ maxWidth: 1200 }}>
      <SectionHeader icon="💬" title="AI CHAT" />
      <Card className="chat-container" style={{ padding: 0, display: 'flex', flexDirection: 'column', height: 'calc(100vh - 140px)', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px', borderBottom: `1px solid ${t.cardBorder}` }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: `${t.accent}22`, border: `1px solid ${t.accent}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>⚾</div>
          <div>
            <div style={{ fontWeight: 700, color: t.textStrong, fontSize: '0.9rem' }}>MLB Assistant</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: t.green, boxShadow: `0 0 6px ${t.green}88` }} />
              <span style={{ fontSize: '0.7rem', color: t.green }}>Online</span>
            </div>
          </div>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
          {messages.map((msg, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', marginBottom: 12 }}>
              <div style={msg.role === 'user'
                ? { maxWidth: '70%', padding: '12px 16px', background: `linear-gradient(135deg, ${t.accent}, #1A7AD9)`, borderRadius: '16px 16px 4px 16px', color: '#FFFFFF', fontSize: '0.85rem', lineHeight: 1.5 }
                : { maxWidth: '70%', padding: '12px 16px', background: t.inputBg, border: `1px solid ${t.cardBorder}`, borderRadius: '16px 16px 16px 4px', color: t.text, fontSize: '0.85rem', lineHeight: 1.5 }
              }>{msg.text}</div>
            </div>
          ))}
          {isTyping && (
            <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: 12 }}>
              <div style={{ padding: '12px 16px', background: t.inputBg, border: `1px solid ${t.cardBorder}`, borderRadius: '16px 16px 16px 4px' }}>
                <div className="typing-dots"><span /><span /><span /></div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
        <div style={{ display: 'flex', gap: 8, padding: '8px 20px', overflowX: 'auto', flexShrink: 0 }}>
          {suggestions.map((s, i) => (
            <button key={i} onClick={() => setInput(s)} style={{ padding: '6px 14px', background: `${t.accent}14`, border: `1px solid ${t.accent}33`, borderRadius: 20, color: t.accent, fontSize: '0.72rem', fontWeight: 600, fontFamily: "'DM Sans'", cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}>{s}</button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8, padding: '12px 20px 16px', borderTop: `1px solid ${t.cardBorder}`, flexShrink: 0 }}>
          <input type="text" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && onSend()} placeholder="Ask about MLB stats, history, rules..."
            style={{ flex: 1, padding: '12px 16px', background: t.inputBg, border: `1px solid ${t.inputBorder}`, borderRadius: 12, color: t.textStrong, fontSize: '0.85rem', fontFamily: "'DM Sans'", outline: 'none' }} />
          <button onClick={onSend} style={{ width: 44, height: 44, borderRadius: 12, background: `linear-gradient(135deg, ${t.accent}, #00B4FF)`, border: 'none', color: '#FFFFFF', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 15px ${t.accentGlow}`, flexShrink: 0 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 2L11 13" /><path d="M22 2L15 22L11 13L2 9L22 2Z" /></svg>
          </button>
        </div>
      </Card>
    </div>
  )
}

/* ═══════════════════════════════════════════
   SHARED COMPONENTS
   ═══════════════════════════════════════════ */
function Card({ children, style, className, onClick }) {
  const t = useTheme()
  return (
    <div className={className} onClick={onClick} style={{
      background: t.cardBg,
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      border: `1px solid ${t.cardBorder}`,
      borderRadius: 16, padding: 20, marginBottom: 16,
      transition: 'all 0.3s ease',
      ...style,
    }}>{children}</div>
  )
}

function CardHeader({ children }) {
  const t = useTheme()
  return <div style={{ fontFamily: "'DM Sans'", fontSize: '0.72rem', fontWeight: 600, color: t.textMuted, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12, paddingBottom: 8, borderBottom: `1px solid ${t.divider}` }}>{children}</div>
}

function SectionHeader({ icon, title, badge }) {
  const t = useTheme()
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
      <span style={{ fontSize: '1.4rem' }}>{icon}</span>
      <h1 style={{ fontFamily: "'Oswald'", fontSize: '1.6rem', fontWeight: 700, color: t.textWhite, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{title}</h1>
      {badge}
    </div>
  )
}

function LiveBadge() {
  const t = useTheme()
  return (
    <div className="live-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', background: `${t.red}22`, border: `1px solid ${t.red}44`, borderRadius: 20, fontFamily: "'DM Sans'", fontSize: '0.75rem', fontWeight: 700, color: t.red, letterSpacing: '0.1em' }}>
      <span className="live-dot" style={{ width: 8, height: 8, borderRadius: '50%', background: t.red, display: 'inline-block', boxShadow: `0 0 8px ${t.red}99` }} />LIVE
    </div>
  )
}

function PlayerLink({ playerId, playerName, playerType, children }) {
  const { openPlayerProfile } = useData()
  if (!playerId) return children
  return (
    <div
      onClick={(e) => { e.stopPropagation(); openPlayerProfile({ id: playerId, name: playerName || '', type: playerType || 'batter' }) }}
      style={{ cursor: 'pointer' }}
    >
      {children}
    </div>
  )
}

function PlayerHeadshot({ playerId, name, size = 80 }) {
  const t = useTheme()
  const url = `https://midfield.mlbstatic.com/v1/people/${playerId}/spots/120`
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      border: `2px solid ${t.accent}44`,
      overflow: 'hidden', background: t.inputBg,
      boxShadow: `0 0 20px ${t.accentGlow}, inset 0 0 20px ${t.accent}11`,
      position: 'relative',
    }}>
      <img
        src={url}
        alt={name}
        style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center' }}
        onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex' }}
      />
      <div style={{
        display: 'none', width: '100%', height: '100%',
        alignItems: 'center', justifyContent: 'center',
        fontFamily: "'Bebas Neue'", fontSize: size * 0.35, color: t.accent,
        position: 'absolute', top: 0, left: 0,
      }}>
        {name.split(' ').map(n => n[0]).join('')}
      </div>
    </div>
  )
}

const TEAM_IDS = {
  LAD:119, SD:135, ARI:109, SF:137, COL:115, ATL:144, MIA:146, NYM:121, PHI:143, WSH:120,
  CHC:112, CIN:113, MIL:158, PIT:134, STL:138, BAL:110, BOS:111, NYY:147, TB:139, TOR:141,
  CWS:145, CLE:114, DET:116, KC:118, MIN:142, HOU:117, LAA:108, OAK:133, SEA:136, TEX:140,
}

function TeamLogo({ abbr, highlight, size = 60, teamId }) {
  const t = useTheme()
  const id = teamId || TEAM_IDS[abbr] || null
  const logoUrl = id ? `https://www.mlbstatic.com/team-logos/${id}.svg` : null
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      border: `2px solid ${highlight ? t.accent : t.cardBorder}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: t.inputBg, margin: '0 auto',
      boxShadow: highlight ? `0 0 25px ${t.accentGlow}` : 'none',
      transition: 'all 0.3s ease', overflow: 'hidden',
    }}>
      {logoUrl ? (
        <img src={logoUrl} alt={abbr}
          style={{ width: size * 0.65, height: size * 0.65, objectFit: 'contain' }}
          onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block' }}
        />
      ) : null}
      <span style={{
        fontFamily: "'Bebas Neue'", fontSize: size * 0.35, color: highlight ? t.accent : t.textStrong,
        letterSpacing: '0.05em', display: logoUrl ? 'none' : 'block',
      }}>{abbr}</span>
    </div>
  )
}

function CountRow({ label, count, total, color }) {
  const t = useTheme()
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
      <span style={{ fontSize: '0.62rem', fontWeight: 600, color: t.textMuted, letterSpacing: '0.1em', width: 14 }}>{label}</span>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{ width: 14, height: 14, borderRadius: '50%', border: `2px solid ${i < count ? color : t.inputBorder}`, background: i < count ? color : 'transparent', boxShadow: i < count ? `0 0 8px ${color}66` : 'none', transition: 'all 0.3s ease' }} />
      ))}
    </div>
  )
}

function Diamond({ runners }) {
  const t = useTheme()
  const bs = (on) => ({ width: 24, height: 24, transform: 'rotate(45deg)', border: `2px solid ${on ? t.accent : t.inputBorder}`, background: on ? t.accent : 'transparent', boxShadow: on ? `0 0 15px ${t.accentGlow}` : 'none', borderRadius: 3, position: 'absolute', transition: 'all 0.3s ease' })
  return (
    <div style={{ position: 'relative', width: 90, height: 90 }}>
      <div style={{ ...bs(runners.second), left: 33, top: 2 }} />
      <div style={{ ...bs(runners.third), left: 4, top: 33 }} />
      <div style={{ ...bs(runners.first), right: 4, top: 33 }} />
      <div style={{ width: 24, height: 24, transform: 'rotate(45deg)', border: `2px solid ${t.inputBorder}`, borderRadius: 3, position: 'absolute', left: 33, bottom: 2 }} />
    </div>
  )
}

/* ═══════════════════════════════════════════
   STRIKE ZONE VISUALIZATION
   ═══════════════════════════════════════════ */
function StrikeZone({ pitches, lastPitch }) {
  const t = useTheme()
  // Map plate coordinates (feet) to SVG coordinates
  // pX: -2 to 2 feet, pZ: 1.0 to 4.0 feet
  const mapX = (pX) => 100 + (pX * 55)
  const mapY = (pZ) => 190 - ((pZ - 1.0) * 55)
  // Zone box: -0.83 to 0.83 feet wide, ~1.5 to 3.5 feet high
  const zoneLeft = mapX(-0.83), zoneRight = mapX(0.83)
  const zoneTop = mapY(3.5), zoneBot = mapY(1.5)
  const zoneW = zoneRight - zoneLeft, zoneH = zoneBot - zoneTop

  const pitchColor = (p) => {
    if (p.isInPlay) return t.cyan
    if (p.callCode === 'F') return t.yellow
    if (p.isStrike) return t.red
    if (p.isBall) return t.green
    return t.textMuted
  }

  return (
    <Card>
      <CardHeader>STRIKE ZONE</CardHeader>
      <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 0' }}>
        <svg viewBox="0 0 200 220" style={{ width: '100%', maxWidth: 260, height: 'auto' }}>
          {/* Zone background */}
          <rect x={zoneLeft} y={zoneTop} width={zoneW} height={zoneH} fill={`${t.accent}08`} stroke={`${t.accent}44`} strokeWidth="1.5" rx="2" />
          {/* Grid lines 3x3 */}
          {[1, 2].map(i => (
            <g key={i}>
              <line x1={zoneLeft + (zoneW / 3) * i} y1={zoneTop} x2={zoneLeft + (zoneW / 3) * i} y2={zoneBot} stroke={`${t.accent}22`} strokeWidth="0.5" />
              <line x1={zoneLeft} y1={zoneTop + (zoneH / 3) * i} x2={zoneRight} y2={zoneTop + (zoneH / 3) * i} stroke={`${t.accent}22`} strokeWidth="0.5" />
            </g>
          ))}
          {/* Home plate */}
          <polygon points="88,205 100,212 112,205 112,200 88,200" fill="none" stroke={`${t.textMuted}44`} strokeWidth="1" />
          {/* Pitch dots */}
          {pitches.map((p, i) => {
            if (p.pX == null || p.pZ == null) return null
            const isLast = i === pitches.length - 1
            const cx = mapX(p.pX), cy = mapY(p.pZ)
            const color = pitchColor(p)
            return (
              <g key={i}>
                <circle cx={cx} cy={cy} r={isLast ? 8 : 5} fill={color + (isLast ? '99' : '55')} stroke={color} strokeWidth={isLast ? 2 : 1} />
                {isLast && <circle cx={cx} cy={cy} r={12} fill="none" stroke={color} strokeWidth="1" opacity="0.4" className="at-bat-ring" />}
                <text x={cx} y={cy + 3} textAnchor="middle" fill="#fff" fontSize="7" fontWeight="700" fontFamily="JetBrains Mono">{i + 1}</text>
              </g>
            )
          })}
        </svg>
      </div>
      {/* Legend */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 14, paddingTop: 6 }}>
        {[['Strike', t.red], ['Ball', t.green], ['Foul', t.yellow], ['In Play', t.cyan]].map(([label, color]) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: color + '88', border: `1px solid ${color}` }} />
            <span style={{ fontSize: '0.55rem', color: t.textMuted, fontWeight: 600 }}>{label}</span>
          </div>
        ))}
      </div>
    </Card>
  )
}

/* ═══════════════════════════════════════════
   LAST PITCH INFO CARD
   ═══════════════════════════════════════════ */
function LastPitchCard({ lastPitch }) {
  const t = useTheme()
  if (!lastPitch) return null
  const callColor = lastPitch.isInPlay ? t.cyan : lastPitch.isStrike ? t.red : lastPitch.isBall ? t.green : t.textMuted
  return (
    <Card>
      <CardHeader>LAST PITCH</CardHeader>
      <div style={{ display: 'flex', alignItems: 'center', gap: 20, padding: '8px 0' }}>
        {/* Speed */}
        <div style={{ textAlign: 'center', minWidth: 70 }}>
          <div style={{ fontFamily: "'Bebas Neue'", fontSize: '2.8rem', color: t.textWhite, lineHeight: 1, textShadow: `0 0 20px ${t.accentGlow}` }}>{lastPitch.speed ? Math.round(lastPitch.speed) : '—'}</div>
          <div style={{ fontSize: '0.6rem', fontWeight: 700, color: t.textMuted, letterSpacing: '0.1em' }}>MPH</div>
        </div>
        {/* Type + Result */}
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "'DM Sans'", fontSize: '0.9rem', fontWeight: 700, color: t.textStrong, marginBottom: 4 }}>{lastPitch.type || 'Unknown'}</div>
          <span style={{
            display: 'inline-block', padding: '3px 10px', borderRadius: 6,
            fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.06em',
            background: callColor + '22', color: callColor, border: `1px solid ${callColor}44`,
          }}>{lastPitch.call || '—'}</span>
          {lastPitch.spinRate && (
            <div style={{ fontFamily: "'JetBrains Mono'", fontSize: '0.62rem', color: t.textMuted2, marginTop: 6 }}>
              {lastPitch.spinRate} RPM
              {lastPitch.breakVertical ? ` · ${lastPitch.breakVertical.toFixed(1)}" drop` : ''}
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}

/* ═══════════════════════════════════════════
   PITCHER GAME STATS CARD
   ═══════════════════════════════════════════ */
function PitcherStatsCard({ pitcher, pitcherGameStats }) {
  const t = useTheme()
  if (!pitcherGameStats) return null
  const ps = pitcherGameStats
  const strikePct = ps.pitches > 0 ? Math.round((ps.strikes / ps.pitches) * 100) : 0
  const pitchLoad = Math.min(ps.pitches / 110, 1)
  const pitchColor = pitchLoad < 0.6 ? t.green : pitchLoad < 0.8 ? t.yellow : t.red

  return (
    <Card>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <PlayerLink playerId={pitcher?.id} playerName={pitcher?.name} playerType="pitcher">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <PlayerHeadshot playerId={pitcher?.id} name={pitcher?.name || ''} size={36} />
            <div>
              <div style={{ fontWeight: 700, color: t.textStrong, fontSize: '0.85rem' }}>{pitcher?.name}</div>
              <div style={{ fontFamily: "'JetBrains Mono'", fontSize: '0.65rem', color: t.accent }}>ERA {pitcher?.era || '—'}</div>
            </div>
          </div>
        </PlayerLink>
      </div>
      {/* Pitch count bar */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={{ fontSize: '0.58rem', fontWeight: 600, color: t.textMuted, letterSpacing: '0.08em' }}>PITCH COUNT</span>
          <span style={{ fontFamily: "'JetBrains Mono'", fontSize: '0.72rem', fontWeight: 700, color: pitchColor }}>{ps.pitches}<span style={{ color: t.textMuted, fontWeight: 400 }}> / {ps.strikes}K</span></span>
        </div>
        <div style={{ height: 6, borderRadius: 3, background: t.inputBg, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${pitchLoad * 100}%`, borderRadius: 3, background: `linear-gradient(90deg, ${t.green}, ${pitchColor})`, transition: 'width 0.5s ease', boxShadow: `0 0 8px ${pitchColor}66` }} />
        </div>
        <div style={{ textAlign: 'right', marginTop: 2 }}>
          <span style={{ fontFamily: "'JetBrains Mono'", fontSize: '0.58rem', color: t.textMuted2 }}>{strikePct}% strikes</span>
        </div>
      </div>
      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
        {[['IP', ps.ip], ['H', ps.h], ['R', ps.r], ['ER', ps.er], ['BB', ps.bb], ['SO', ps.so], ['HR', ps.hr]].map(([label, val]) => (
          <div key={label} style={{ textAlign: 'center', padding: '6px 2px', background: t.inputBg, borderRadius: 6 }}>
            <div style={{ fontFamily: "'JetBrains Mono'", fontSize: '0.85rem', fontWeight: 700, color: t.textWhite }}>{val}</div>
            <div style={{ fontSize: '0.5rem', fontWeight: 600, color: t.textMuted, letterSpacing: '0.08em' }}>{label}</div>
          </div>
        ))}
      </div>
    </Card>
  )
}

/* ═══════════════════════════════════════════
   BASEBALL FIELD SVG — DEFENSIVE POSITIONS + HIT TRAJECTORY
   ═══════════════════════════════════════════ */
const FIELD_POSITIONS = {
  P: { x: 150, y: 182 }, C: { x: 150, y: 268 }, '1B': { x: 215, y: 178 },
  '2B': { x: 182, y: 138 }, SS: { x: 118, y: 138 }, '3B': { x: 85, y: 178 },
  LF: { x: 55, y: 80 }, CF: { x: 150, y: 42 }, RF: { x: 245, y: 80 },
}

function BaseballFieldSVG({ defenders, runners, hitData, batter }) {
  const t = useTheme()
  // Map hit coordinates to SVG (API: ~250x250 space, home plate ~125,199)
  const mapHitX = (cx) => (cx / 250) * 300
  const mapHitY = (cy) => (cy / 250) * 300

  return (
    <svg viewBox="0 0 300 290" style={{ width: '100%', maxWidth: 500, height: 'auto' }}>
      <defs>
        <radialGradient id="fieldGrad" cx="50%" cy="85%" r="85%">
          <stop offset="0%" stopColor={`${t.green}15`} />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* Outfield grass */}
      <path d={`M 10,250 Q 10,10 150,10 Q 290,10 290,250 Z`} fill="url(#fieldGrad)" />

      {/* Foul lines */}
      <line x1="150" y1="250" x2="10" y2="30" stroke={`${t.textMuted}22`} strokeWidth="1" />
      <line x1="150" y1="250" x2="290" y2="30" stroke={`${t.textMuted}22`} strokeWidth="1" />

      {/* Outfield arc */}
      <path d={`M 30,100 Q 150,0 270,100`} fill="none" stroke={`${t.accent}22`} strokeWidth="1" strokeDasharray="4 4" />

      {/* Infield dirt */}
      <polygon points="150,140 200,185 150,230 100,185" fill={`${t.yellow}06`} stroke={`${t.accent}18`} strokeWidth="1" />

      {/* Base paths */}
      <line x1="150" y1="250" x2="200" y2="185" stroke={`${t.accent}33`} strokeWidth="1" />
      <line x1="200" y1="185" x2="150" y2="140" stroke={`${t.accent}33`} strokeWidth="1" />
      <line x1="150" y1="140" x2="100" y2="185" stroke={`${t.accent}33`} strokeWidth="1" />
      <line x1="100" y1="185" x2="150" y2="250" stroke={`${t.accent}33`} strokeWidth="1" />

      {/* Pitcher's mound */}
      <circle cx="150" cy="195" r="6" fill={`${t.accent}15`} stroke={`${t.accent}44`} strokeWidth="1" />

      {/* Bases */}
      {[
        { x: 200, y: 185, on: runners?.first, label: '1B' },
        { x: 150, y: 140, on: runners?.second, label: '2B' },
        { x: 100, y: 185, on: runners?.third, label: '3B' },
      ].map(base => (
        <rect key={base.label} x={base.x - 7} y={base.y - 7} width={14} height={14}
          transform={`rotate(45 ${base.x} ${base.y})`}
          fill={base.on ? t.accent : 'transparent'} stroke={base.on ? t.accent : `${t.accent}44`}
          strokeWidth={base.on ? 2 : 1}
          filter={base.on ? 'url(#glow)' : undefined}
        />
      ))}
      {/* Home plate */}
      <polygon points="143,248 150,255 157,248 157,244 143,244" fill={`${t.textMuted}33`} stroke={`${t.textMuted}55`} strokeWidth="1" />

      {/* Batter at home plate */}
      {batter?.id && (
        <g>
          <circle cx="165" cy="250" r={10} fill={`${t.cyan}33`} stroke={t.cyan} strokeWidth="1.5" className="at-bat-ring" />
          <text x="165" y="253" textAnchor="middle" fill={t.cyan} fontSize="7" fontWeight="700" fontFamily="DM Sans">BAT</text>
          <text x="165" y="266" textAnchor="middle" fill={t.cyan} fontSize="6.5" fontWeight="600" fontFamily="DM Sans">{(batter.name || '').split(' ').pop()}</text>
        </g>
      )}

      {/* Runners on bases */}
      {[
        { x: 210, y: 175, on: runners?.first, name: runners?.firstName },
        { x: 150, y: 128, on: runners?.second, name: runners?.secondName },
        { x: 90, y: 175, on: runners?.third, name: runners?.thirdName },
      ].map((r, i) => r.on && (
        <g key={i}>
          <circle cx={r.x} cy={r.y} r={9} fill={`${t.cyan}44`} stroke={t.cyan} strokeWidth="1.5" filter="url(#glow)" />
          <text x={r.x} y={r.y + 3} textAnchor="middle" fill="#fff" fontSize="7" fontWeight="800" fontFamily="JetBrains Mono">R</text>
          <text x={r.x} y={r.y - 14} textAnchor="middle" fill={t.cyan} fontSize="6.5" fontWeight="600" fontFamily="DM Sans">{(r.name || '').split(' ').pop()}</text>
        </g>
      ))}

      {/* Defensive players */}
      {defenders.map((d, i) => {
        const pos = FIELD_POSITIONS[d.pos]
        if (!pos) return null
        return (
          <g key={i}>
            <circle cx={pos.x} cy={pos.y} r={10} fill={`${t.accent}22`} stroke={`${t.accent}88`} strokeWidth="1.5" />
            <text x={pos.x} y={pos.y + 3} textAnchor="middle" fill={t.accent} fontSize="8" fontWeight="700" fontFamily="DM Sans">{d.pos}</text>
            <text x={pos.x} y={pos.y + 18} textAnchor="middle" fill={`${t.textMuted}cc`} fontSize="6" fontFamily="DM Sans">{d.name.split(' ').pop()}</text>
          </g>
        )
      })}

      {/* Hit trajectory */}
      {hitData?.coordX != null && hitData?.coordY != null && (
        <g>
          <line x1="150" y1="250" x2={mapHitX(hitData.coordX)} y2={mapHitY(hitData.coordY)}
            stroke={t.cyan} strokeWidth="2" strokeDasharray="6 3" opacity="0.7" className="ball-trajectory" />
          <circle cx={mapHitX(hitData.coordX)} cy={mapHitY(hitData.coordY)} r={8}
            fill={`${t.cyan}44`} stroke={t.cyan} strokeWidth="2" filter="url(#glow)" />
          {hitData.totalDistance && (
            <text x={mapHitX(hitData.coordX)} y={mapHitY(hitData.coordY) - 14}
              textAnchor="middle" fill={t.cyan} fontSize="9" fontWeight="700" fontFamily="JetBrains Mono">
              {Math.round(hitData.totalDistance)} ft
            </text>
          )}
          {hitData.trajectory && (
            <text x={mapHitX(hitData.coordX)} y={mapHitY(hitData.coordY) + 22}
              textAnchor="middle" fill={`${t.textMuted}cc`} fontSize="7" fontFamily="DM Sans">
              {hitData.trajectory.replace('_', ' ')}
            </text>
          )}
        </g>
      )}
    </svg>
  )
}

/* ═══════════════════════════════════════════
   STATCAST 3D — PITCH TRAILS + SPRAY CHART + AT-BAT VIEWER
   ═══════════════════════════════════════════ */
const PITCH_TYPE_COLORS = {
  FF: '#EF4444', SI: '#F97316', FC: '#A855F7', CH: '#22C55E',
  SL: '#EAB308', CU: '#06B6D4', FS: '#EC4899', KC: '#06B6D4',
  ST: '#EAB308', SV: '#EAB308', KN: '#8B5CF6',
}
const PITCH_TYPE_SHORT = {
  FF: '4S', SI: 'SI', FC: 'FC', CH: 'CH', SL: 'SL', CU: 'CU',
  FS: 'FS', KC: 'KC', ST: 'SW', SV: 'SV', KN: 'KN',
}

function PitchTrails3D({ pitches, title }) {
  const t = useTheme()
  const VP = { x: 150, y: 15 }
  const mapToPlate = (pX, pZ) => ({ x: 150 + pX * 52, y: 230 - (pZ - 0.5) * 48 })
  const zTL = mapToPlate(-0.83, 3.5), zTR = mapToPlate(0.83, 3.5)
  const zBL = mapToPlate(-0.83, 1.5), zBR = mapToPlate(0.83, 1.5)

  const trailPath = (pX, pZ) => {
    const end = mapToPlate(pX, pZ)
    const mid = { x: (VP.x + end.x) / 2, y: (VP.y + end.y) / 2 + 22 }
    return `M ${VP.x} ${VP.y} Q ${mid.x} ${mid.y} ${end.x} ${end.y}`
  }
  const ballPositions = (pX, pZ) => {
    const end = mapToPlate(pX, pZ)
    const mid = { x: (VP.x + end.x) / 2, y: (VP.y + end.y) / 2 + 22 }
    return Array.from({ length: 4 }, (_, i) => {
      const p = (i + 1) / 5, q = 1 - p
      return { x: q*q*VP.x + 2*q*p*mid.x + p*p*end.x, y: q*q*VP.y + 2*q*p*mid.y + p*p*end.y, r: 1.5 + p * 3 }
    })
  }
  const pitchColor = (tc) => PITCH_TYPE_COLORS[tc] || t.textMuted
  const typeCounts = {}
  pitches.forEach(p => { const c = p.typeCode || '??'; if (!typeCounts[c]) typeCounts[c] = { count: 0, code: c }; typeCounts[c].count++ })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <svg viewBox="0 0 300 250" style={{ width: '100%', maxWidth: 340, height: 'auto', display: 'block' }}>
        <defs>
          <linearGradient id="moundGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={`${t.accent}06`} /><stop offset="100%" stopColor={`${t.accent}01`} />
          </linearGradient>
          <filter id="ballGlow3d"><feGaussianBlur stdDeviation="1.5" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
        </defs>
        <rect x="0" y="0" width="300" height="250" fill="url(#moundGrad)" rx="6" />
        {[-1, 0, 1].map(i => <line key={i} x1={VP.x} y1={VP.y} x2={150 + i * 100} y2="250" stroke={`${t.accent}06`} strokeWidth="0.5" />)}
        <polygon points={`${zTL.x},${zTL.y} ${zTR.x},${zTR.y} ${zBR.x},${zBR.y} ${zBL.x},${zBL.y}`} fill={`${t.accent}05`} stroke={`${t.accent}44`} strokeWidth="1" />
        {[1, 2].map(i => {
          const f = i / 3
          return (<g key={i}>
            <line x1={zTL.x + (zTR.x - zTL.x) * f} y1={zTL.y} x2={zBL.x + (zBR.x - zBL.x) * f} y2={zBL.y} stroke={`${t.accent}18`} strokeWidth="0.5" />
            <line x1={zTL.x} y1={zTL.y + (zBL.y - zTL.y) * f} x2={zTR.x} y2={zTR.y + (zBR.y - zTR.y) * f} stroke={`${t.accent}18`} strokeWidth="0.5" />
          </g>)
        })}
        <polygon points="142,237 150,244 158,237 158,234 142,234" fill={`${t.textMuted}33`} stroke={`${t.textMuted}55`} strokeWidth="0.8" />
        {pitches.map((p, i) => {
          if (p.pX == null || p.pZ == null) return null
          const color = pitchColor(p.typeCode), balls = ballPositions(p.pX, p.pZ), endPos = mapToPlate(p.pX, p.pZ)
          return (<g key={i} opacity={0.8}>
            <path d={trailPath(p.pX, p.pZ)} fill="none" stroke={color} strokeWidth="1.5" opacity="0.4" />
            {balls.map((b, j) => <circle key={j} cx={b.x} cy={b.y} r={b.r} fill={color} opacity={0.25 + j * 0.12} />)}
            <circle cx={endPos.x} cy={endPos.y} r={5.5} fill={color + 'cc'} stroke="#fff" strokeWidth="1" filter="url(#ballGlow3d)" />
            {(p.callCode === 'C' || p.callCode === 'S') && <text x={endPos.x} y={endPos.y + 3} textAnchor="middle" fill="#fff" fontSize="6" fontWeight="800" fontFamily="JetBrains Mono">K</text>}
          </g>)
        })}
        {title && <text x="8" y="16" fill={t.textWhite} fontSize="9" fontWeight="700" fontFamily="Oswald" letterSpacing="0.04em" opacity="0.7">{title}</text>}
      </svg>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center', marginTop: 6 }}>
        {Object.values(typeCounts).map(tc => (
          <div key={tc.code} style={{ display: 'flex', alignItems: 'center', gap: 3, padding: '2px 6px', background: t.inputBg, borderRadius: 4, border: `1px solid ${t.cardBorder}` }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: pitchColor(tc.code), boxShadow: `0 0 4px ${pitchColor(tc.code)}55` }} />
            <span style={{ fontFamily: "'JetBrains Mono'", fontSize: '0.52rem', fontWeight: 700, color: pitchColor(tc.code) }}>{PITCH_TYPE_SHORT[tc.code] || tc.code}</span>
            <span style={{ fontFamily: "'JetBrains Mono'", fontSize: '0.5rem', color: t.textMuted }}>{tc.count}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function SprayChart({ atBats, teamAbbr }) {
  const t = useTheme()
  const hits = atBats.filter(ab => ab.hitData?.coordX != null)
  if (hits.length === 0) return null
  const mapX = (cx) => (cx / 250) * 240 + 5
  const mapY = (cy) => (cy / 250) * 240 + 5
  const trajectoryColor = (traj) => {
    if (traj === 'fly_ball') return '#3B82F6'
    if (traj === 'line_drive') return '#22C55E'
    if (traj === 'ground_ball') return '#EAB308'
    if (traj === 'popup') return '#A855F7'
    return t.textMuted
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <svg viewBox="0 0 250 230" style={{ width: '100%', maxWidth: 300, height: 'auto', display: 'block' }}>
        <defs>
          <radialGradient id="sprayGrad" cx="50%" cy="90%" r="85%">
            <stop offset="0%" stopColor={`${t.green}08`} /><stop offset="100%" stopColor="transparent" />
          </radialGradient>
        </defs>
        <path d="M 8,210 Q 8,8 125,8 Q 242,8 242,210 Z" fill="url(#sprayGrad)" />
        <line x1="125" y1="210" x2="8" y2="25" stroke={`${t.textMuted}18`} strokeWidth="0.8" />
        <line x1="125" y1="210" x2="242" y2="25" stroke={`${t.textMuted}18`} strokeWidth="0.8" />
        <path d="M 25,85 Q 125,0 225,85" fill="none" stroke={`${t.accent}18`} strokeWidth="0.8" strokeDasharray="3 3" />
        <polygon points="125,120 165,155 125,190 85,155" fill="none" stroke={`${t.accent}10`} strokeWidth="0.5" />
        {hits.map((ab, i) => {
          const hd = ab.hitData, ex = mapX(hd.coordX), ey = mapY(hd.coordY), color = trajectoryColor(hd.trajectory)
          return (<g key={i}>
            <line x1="125" y1="210" x2={ex} y2={ey} stroke={color} strokeWidth="2" opacity="0.5" />
            <circle cx={ex} cy={ey} r={4.5} fill={color + 'aa'} stroke="#fff" strokeWidth="0.8" />
          </g>)
        })}
        <polygon points="119,208 125,214 131,208 131,205 119,205" fill={`${t.textMuted}33`} stroke={`${t.textMuted}44`} strokeWidth="0.8" />
      </svg>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center', marginTop: 6 }}>
        {[['Fly', '#3B82F6'], ['Line', '#22C55E'], ['Ground', '#EAB308'], ['Popup', '#A855F7']].map(([l, c]) => (
          <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <div style={{ width: 8, height: 2.5, borderRadius: 1, background: c }} />
            <span style={{ fontSize: '0.5rem', color: t.textMuted, fontWeight: 600 }}>{l}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function StatcastCard({ liveGame }) {
  const t = useTheme()
  const g = liveGame
  if (!g?.isLive && !g?.isFinal) return null

  const [view, setView] = useState('spray') // 'spray' | 'arsenal'
  const [sprayTeam, setSprayTeam] = useState('away') // which team's spray to show
  const [arsenalSide, setArsenalSide] = useState('away') // which team's pitcher arsenal

  const allAB = g.allAtBats || []
  const awayAbbr = g.away.abbr, homeAbbr = g.home.abbr

  // ── SPRAY CHART data: filter by batting team ──
  const awayBattingABs = allAB.filter(ab => ab.halfInning === 'top')
  const homeBattingABs = allAB.filter(ab => ab.halfInning === 'bottom')
  const sprayABs = sprayTeam === 'away' ? awayBattingABs : homeBattingABs
  const sprayAbbr = sprayTeam === 'away' ? awayAbbr : homeAbbr

  // ── PITCHER ARSENAL data: group all pitches thrown by each pitcher ──
  // Away pitchers pitch when halfInning === 'bottom', home pitchers when halfInning === 'top'
  const getPitcherArsenal = (side) => {
    const pitcherABs = allAB.filter(ab =>
      side === 'home' ? ab.halfInning === 'top' : ab.halfInning === 'bottom'
    )
    // Group by pitcher
    const pitcherMap = {}
    pitcherABs.forEach(ab => {
      if (!ab.pitcherId) return
      if (!pitcherMap[ab.pitcherId]) {
        pitcherMap[ab.pitcherId] = { id: ab.pitcherId, name: ab.pitcherName, pitches: [], abs: 0, ks: 0 }
      }
      pitcherMap[ab.pitcherId].abs++
      if (ab.event === 'Strikeout') pitcherMap[ab.pitcherId].ks++
      pitcherMap[ab.pitcherId].pitches.push(...ab.pitches)
    })
    return Object.values(pitcherMap)
  }

  const arsenalPitchers = getPitcherArsenal(arsenalSide)
  const arsenalAbbr = arsenalSide === 'away' ? awayAbbr : homeAbbr
  // Auto-select current pitcher if visible
  const [selectedPitcherId, setSelectedPitcherId] = useState(null)
  const activePitcher = selectedPitcherId
    ? arsenalPitchers.find(p => p.id === selectedPitcherId)
    : arsenalPitchers[arsenalPitchers.length - 1] // default to most recent pitcher

  const shortName = (name) => {
    const parts = name.split(' ')
    return parts.length > 1 ? `${parts[0][0]}. ${parts.slice(1).join(' ')}` : name
  }

  return (
    <Card style={{ marginTop: 16 }}>
      <CardHeader>STATCAST 3D</CardHeader>

      {/* Main view tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
        <FilterBtn active={view === 'spray'} onClick={() => setView('spray')}>📊 SPRAY CHART</FilterBtn>
        <FilterBtn active={view === 'arsenal'} onClick={() => setView('arsenal')}>⚾ PITCHER ARSENAL</FilterBtn>
      </div>

      {/* ═══ SPRAY CHART ═══ */}
      {view === 'spray' && (<>
        {/* Team selector */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
          <FilterBtn active={sprayTeam === 'away'} onClick={() => setSprayTeam('away')}>{awayAbbr}</FilterBtn>
          <FilterBtn active={sprayTeam === 'home'} onClick={() => setSprayTeam('home')}>{homeAbbr}</FilterBtn>
        </div>

        {sprayABs.some(ab => ab.hitData?.coordX != null) ? (
          <SprayChart atBats={sprayABs} teamAbbr={sprayAbbr} />
        ) : (
          <div style={{ textAlign: 'center', padding: 30, color: t.textMuted2, fontSize: '0.82rem' }}>No balls in play yet for {sprayAbbr}</div>
        )}

        {/* At-bat results list */}
        {sprayABs.length > 0 && (
          <div style={{ marginTop: 12, paddingTop: 10, borderTop: `1px solid ${t.divider}` }}>
            <div style={{ fontSize: '0.58rem', fontWeight: 700, color: t.textMuted, letterSpacing: '0.1em', marginBottom: 8 }}>{sprayAbbr} AT-BATS</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxHeight: 200, overflowY: 'auto' }}>
              {sprayABs.map((ab, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 8px', borderRadius: 6, background: i % 2 === 0 ? `${t.accent}06` : 'transparent' }}>
                  <PlayerHeadshot playerId={ab.batterId} name={ab.batterName} size={22} />
                  <span style={{ fontSize: '0.7rem', fontWeight: 600, color: t.textStrong, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{shortName(ab.batterName)}</span>
                  <span style={{
                    fontSize: '0.55rem', fontWeight: 700, padding: '2px 6px', borderRadius: 4,
                    fontFamily: "'JetBrains Mono'",
                    background: ab.isOut ? `${t.red}12` : `${t.green}12`,
                    color: ab.isOut ? t.red : t.green,
                    border: `1px solid ${ab.isOut ? t.red + '22' : t.green + '22'}`,
                  }}>{ab.event}{ab.rbi > 0 ? ` (${ab.rbi}RBI)` : ''}</span>
                  <span style={{ fontFamily: "'JetBrains Mono'", fontSize: '0.55rem', color: t.textMuted }}>{ab.pitches.length}P</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </>)}

      {/* ═══ PITCHER ARSENAL ═══ */}
      {view === 'arsenal' && (<>
        {/* Team selector */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
          <FilterBtn active={arsenalSide === 'away'} onClick={() => { setArsenalSide('away'); setSelectedPitcherId(null) }}>{awayAbbr} P</FilterBtn>
          <FilterBtn active={arsenalSide === 'home'} onClick={() => { setArsenalSide('home'); setSelectedPitcherId(null) }}>{homeAbbr} P</FilterBtn>
        </div>

        {/* Pitcher selector */}
        {arsenalPitchers.length > 0 && (
          <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
            {arsenalPitchers.map(p => {
              const isActive = activePitcher?.id === p.id
              return (
                <button key={p.id} onClick={() => setSelectedPitcherId(p.id)} style={{
                  padding: '6px 12px', borderRadius: 8, cursor: 'pointer',
                  border: `1px solid ${isActive ? t.accent + '66' : t.cardBorder}`,
                  background: isActive ? `${t.accent}22` : t.inputBg,
                  color: isActive ? t.accent : t.textMuted2,
                  fontFamily: "'DM Sans'", fontSize: '0.68rem', fontWeight: 600,
                  display: 'flex', alignItems: 'center', gap: 6,
                }}>
                  <PlayerHeadshot playerId={p.id} name={p.name} size={20} />
                  {shortName(p.name)}
                  <span style={{ fontFamily: "'JetBrains Mono'", fontSize: '0.5rem', color: t.textMuted, background: `${t.accent}12`, padding: '1px 4px', borderRadius: 3 }}>{p.pitches.length}P</span>
                </button>
              )
            })}
          </div>
        )}

        {activePitcher && activePitcher.pitches.length > 0 ? (
          <>
            <PitchTrails3D
              pitches={activePitcher.pitches}
              title={`${activePitcher.name} — ${activePitcher.pitches.length} pitches · ${activePitcher.ks} K`}
            />
            {/* Pitcher summary */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 10, paddingTop: 8, borderTop: `1px solid ${t.divider}` }}>
              <StatMini label="PITCHES" value={activePitcher.pitches.length} />
              <StatMini label="AB" value={activePitcher.abs} />
              <StatMini label="K" value={activePitcher.ks} />
              <StatMini label="STRIKES" value={activePitcher.pitches.filter(p => p.isStrike || p.isInPlay).length} />
              <StatMini label="BALLS" value={activePitcher.pitches.filter(p => p.isBall).length} />
            </div>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: 30, color: t.textMuted2, fontSize: '0.82rem' }}>
            {arsenalPitchers.length === 0 ? `No pitches yet for ${arsenalAbbr}` : 'Select a pitcher'}
          </div>
        )}
      </>)}
    </Card>
  )
}

function StatMini({ label, value }) {
  const t = useTheme()
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontFamily: "'JetBrains Mono'", fontWeight: 600, color: t.textStrong, fontSize: '0.85rem' }}>{value}</div>
      <div style={{ fontSize: '0.62rem', fontWeight: 600, color: t.textMuted, letterSpacing: '0.1em' }}>{label}</div>
    </div>
  )
}

function FilterBtn({ children, active, onClick }) {
  const t = useTheme()
  return (
    <button onClick={onClick} style={{ padding: '8px 20px', border: `1px solid ${active ? t.accent + '44' : t.inputBorder}`, borderRadius: 10, background: active ? `${t.accent}22` : t.inputBg, color: active ? t.accent : t.textMuted2, fontFamily: "'DM Sans'", fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.08em', cursor: 'pointer', transition: 'all 0.3s ease' }}>
      {children}
    </button>
  )
}

function SourceBadge({ source, sub }) {
  const t = useTheme()
  const label = source === 'reddit' ? (sub || 'Reddit') : source === 'facebook' ? 'Facebook' : source === 'instagram' ? 'Instagram' : 'Bluesky'
  const color = source === 'instagram' ? '#E1306C' : source === 'facebook' ? '#1877F2' : t.textMuted
  return (
    <span style={{ padding: '2px 8px', borderRadius: 6, fontSize: '0.62rem', fontWeight: 600, background: t.inputBg, border: `1px solid ${t.inputBorder}`, color }}>
      {label}
    </span>
  )
}

/* ═══════════════════════════════════════════
   DYNAMIC STYLES
   ═══════════════════════════════════════════ */
function mkStyles(t) {
  return {
    layout: { display: 'flex', height: '100vh', background: t.bg },
    sidebar: { width: 260, minWidth: 260, height: '100vh', background: t.sidebar, backdropFilter: 'blur(20px)', borderRight: `1px solid ${t.cardBorder}`, display: 'flex', flexDirection: 'column' },
    sidebarInner: { display: 'flex', flexDirection: 'column', height: '100%', padding: '28px 16px' },
    logoText: { fontFamily: "'Bebas Neue'", fontSize: '2.2rem', color: t.textWhite, letterSpacing: '0.15em', textShadow: `0 0 30px ${t.accentGlow}, 0 0 60px ${t.accentGlow}` },
    logoSub: { fontFamily: "'DM Sans'", fontSize: '0.7rem', fontWeight: 600, color: t.textMuted, letterSpacing: '0.2em' },
    accentLine: { height: 1, background: `linear-gradient(90deg, transparent, ${t.accent}44, transparent)`, margin: '12px 0' },
    themeToggle: { display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', border: `1px solid ${t.cardBorder}`, borderRadius: 12, background: t.inputBg, cursor: 'pointer', marginBottom: 8, transition: 'all 0.3s ease', width: '100%' },
    nav: { display: 'flex', flexDirection: 'column', gap: 4, flex: 1, marginTop: 8 },
    navItem: { display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', border: 'none', background: 'transparent', borderRadius: 12, cursor: 'pointer', position: 'relative', color: t.textMuted2, fontFamily: "'DM Sans'", fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.06em', transition: 'all 0.3s ease', textAlign: 'left', width: '100%' },
    navItemActive: { background: `${t.accent}18`, color: t.textWhite },
    navIndicator: { position: 'absolute', left: 0, top: '20%', height: '60%', width: 3, background: t.accent, borderRadius: '0 3px 3px 0', boxShadow: `0 0 10px ${t.accentGlow}` },
    sidebarRecord: { background: t.cardBg, backdropFilter: 'blur(20px)', border: `1px solid ${t.cardBorder}`, borderRadius: 16, textAlign: 'center', padding: 16, marginTop: 'auto' },
    main: { flex: 1, overflowY: 'auto', padding: '28px 32px', background: t.bgAlt },
  }
}

/* ═══════════════════════════════════════════
   GLOBAL CSS
   ═══════════════════════════════════════════ */
function globalCSS(t) {
  return `
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&family=Oswald:wght@700&display=swap');
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html, body, #root { height: 100%; width: 100%; overflow: hidden; }
body { font-family: 'DM Sans', sans-serif; background: ${t.bg}; color: ${t.text}; -webkit-font-smoothing: antialiased; }

@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(1.3); }
}
@keyframes typingDot {
  0%, 60%, 100% { opacity: 0.3; transform: translateY(0); }
  30% { opacity: 1; transform: translateY(-4px); }
}
@keyframes atBatGlow {
  0%, 100% { box-shadow: 0 0 0 0 transparent; }
  50% { box-shadow: 0 0 16px ${t.accentGlow}; }
}
@keyframes atBatRing {
  0%, 100% { opacity: 0.6; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.08); }
}
.live-dot { animation: pulse 1.5s ease-in-out infinite; }
.live-badge { animation: pulse 2s ease-in-out infinite alternate; }
@keyframes dashTravel {
  to { stroke-dashoffset: -18; }
}
.lineup-at-bat { animation: atBatGlow 2s ease-in-out infinite; }
.ball-trajectory { animation: dashTravel 0.8s linear infinite; }
.at-bat-ring { animation: atBatRing 1.8s ease-in-out infinite; }
.at-bat-badge { animation: pulse 2s ease-in-out infinite; }
.player-card { cursor: pointer; transition: all 0.3s ease !important; }
.player-card:hover { border-color: ${t.accent}44 !important; box-shadow: 0 4px 20px ${t.accentGlow} !important; }
.social-card { transition: all 0.3s ease !important; }
.social-card:hover { border-color: ${t.accent}33 !important; }
.standings-row { transition: background 0.2s ease; }
.standings-row:hover { background: ${t.cardHover}; }
.typing-dots { display: flex; gap: 4px; padding: 4px 0; }
.typing-dots span { width: 8px; height: 8px; border-radius: 50%; background: ${t.text}; }
.typing-dots span:nth-child(1) { animation: typingDot 1.4s ease-in-out infinite; }
.typing-dots span:nth-child(2) { animation: typingDot 1.4s ease-in-out 0.2s infinite; }
.typing-dots span:nth-child(3) { animation: typingDot 1.4s ease-in-out 0.4s infinite; }
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: ${t.scrollThumb}; border-radius: 3px; }
.hide-scrollbar::-webkit-scrollbar { display: none; }
.hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

@keyframes tickerScroll {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}
.ticker-track:hover { animation-play-state: paused; }
.ticker-scroll::before, .ticker-scroll::after {
  content: ''; position: absolute; top: 0; bottom: 0; width: 32px; z-index: 1; pointer-events: none;
}
.ticker-scroll::before { left: 0; background: linear-gradient(90deg, ${t.bg}, transparent); }
.ticker-scroll::after { right: 0; background: linear-gradient(90deg, transparent, ${t.bg}); }

/* ═══ RESPONSIVE ═══ */

/* Sidebar hidden on mobile, shown as bottom nav */
@media (max-width: 768px) {
  .sidebar-desktop { display: none !important; }
  .bottom-nav { display: flex !important; }
  .main-wrapper { padding-bottom: 64px !important; }
  .main-content { padding: 16px 12px !important; }
  .ticker-bar { display: none !important; }
}
@media (min-width: 769px) {
  .bottom-nav { display: none !important; }
}

/* Grid overrides — mobile */
@media (max-width: 768px) {
  .grid-home-top { grid-template-columns: 1fr !important; }
  .grid-home-mid { grid-template-columns: 1fr !important; }
  .grid-home-bottom { grid-template-columns: 1fr !important; }
  .grid-2col { grid-template-columns: 1fr !important; }
  .grid-3col { grid-template-columns: 1fr !important; }
  .grid-4col { grid-template-columns: 1fr 1fr !important; }
  .grid-6col { grid-template-columns: repeat(3, 1fr) !important; }
  .grid-schedule { grid-template-columns: repeat(3, 1fr) !important; }
  .grid-players { grid-template-columns: 1fr 1fr !important; }
  .grid-standings-all { grid-template-columns: 1fr !important; }
  .grid-leaders { grid-template-columns: 1fr 1fr !important; }
  .grid-bets { grid-template-columns: 1fr !important; }
  .grid-calendar { gap: 2px !important; }
  .grid-calendar > div { min-height: 62px !important; padding: 4px 2px !important; }
  .grid-field-card { grid-template-columns: 1fr !important; gap: 16px !important; }
  .field-card { padding: 16px !important; }
  .field-score { gap: 20px !important; }
  .field-score-num { font-size: 2.8rem !important; }
  .field-score-num span { font-size: 1.6rem !important; }
  .lineup-horizontal { grid-template-columns: 1fr !important; }
  .lineup-horizontal > div:nth-child(2) { width: 100% !important; height: 1px !important; margin: 8px 0 !important; background: linear-gradient(90deg, transparent, ${t.accent}33, transparent) !important; }
  .score-big-resp { font-size: 3rem !important; }
  .score-dash-resp { font-size: 1.8rem !important; }
  .vs-screen-teams { gap: 16px !important; flex-direction: column !important; }
  .vs-screen-teams > div { flex: unset !important; }
  .player-flip { height: 340px !important; }
  .hide-mobile { display: none !important; }
  .flex-col-mobile { flex-direction: column !important; }
  .chat-container { height: calc(100vh - 200px) !important; }
}

/* Tablet */
@media (min-width: 769px) and (max-width: 1024px) {
  .sidebar-desktop { width: 200px !important; min-width: 200px !important; }
  .sidebar-desktop .nav-label { font-size: 0.68rem !important; }
  .main-content { padding: 20px 20px !important; }
  .grid-home-top { grid-template-columns: 1fr 1fr !important; }
  .grid-home-mid { grid-template-columns: 1fr !important; }
  .grid-3col { grid-template-columns: 1fr 1fr !important; }
  .grid-6col { grid-template-columns: repeat(3, 1fr) !important; }
  .grid-schedule { grid-template-columns: repeat(4, 1fr) !important; }
  .grid-standings-all { grid-template-columns: 1fr 1fr !important; }
  .grid-players { grid-template-columns: repeat(3, 1fr) !important; }
  .player-flip { height: 360px !important; }
}
`
}
