const BASE = 'https://statsapi.mlb.com/api/v1'
const DODGERS_ID = 119

// ── Helpers ──
async function fetchJSON(url) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`MLB API error: ${res.status}`)
  return res.json()
}

function today() {
  const d = new Date()
  return `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}/${d.getFullYear()}`
}

// ── Schedule / Games ──
export async function getTodaysGames() {
  const date = today()
  const data = await fetchJSON(`${BASE}/schedule?sportId=1&date=${date}&hydrate=linescore,team`)
  const games = []
  for (const d of data.dates || []) {
    for (const g of d.games || []) {
      games.push(g)
    }
  }
  return games
}

export async function getDodgersGameToday() {
  const games = await getTodaysGames()
  return games.find(g =>
    g.teams?.away?.team?.id === DODGERS_ID || g.teams?.home?.team?.id === DODGERS_ID
  ) || null
}

export async function getDodgersSchedule(daysBack = 5, daysAhead = 7) {
  const start = new Date()
  start.setDate(start.getDate() - daysBack)
  const end = new Date()
  end.setDate(end.getDate() + daysAhead)
  const fmt = d => `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}/${d.getFullYear()}`
  const data = await fetchJSON(`${BASE}/schedule?sportId=1&teamId=${DODGERS_ID}&startDate=${fmt(start)}&endDate=${fmt(end)}&hydrate=linescore,team`)
  const games = []
  for (const d of data.dates || []) {
    for (const g of d.games || []) {
      games.push({
        gamePk: g.gamePk,
        date: g.gameDate,
        status: g.status?.detailedState || g.status?.abstractGameState || '',
        away: {
          name: g.teams?.away?.team?.name || '',
          abbr: g.teams?.away?.team?.abbreviation || '',
          id: g.teams?.away?.team?.id,
          score: g.teams?.away?.score ?? 0,
        },
        home: {
          name: g.teams?.home?.team?.name || '',
          abbr: g.teams?.home?.team?.abbreviation || '',
          id: g.teams?.home?.team?.id,
          score: g.teams?.home?.score ?? 0,
        },
      })
    }
  }
  return games
}

// ── Live Game Feed ──
export async function getLiveGameData(gamePk) {
  const data = await fetchJSON(`https://statsapi.mlb.com/api/v1.1/game/${gamePk}/feed/live`)
  return parseLiveGame(data)
}

function parseLiveGame(data) {
  const gd = data.gameData || {}
  const ld = data.liveData || {}
  const ls = ld.linescore || {}
  const offense = ls.offense || {}
  const defense = ls.defense || {}
  const allPlays = ld.plays?.allPlays || []
  const status = gd.status?.detailedState || ''

  const innings = (ls.innings || []).map(inn => ({
    away: inn.away?.runs ?? null,
    home: inn.home?.runs ?? null,
  }))

  const recentPlays = allPlays.slice(-8).reverse().map(play => ({
    inning: `${(play.about?.halfInning || '').slice(0, 3).toUpperCase()} ${play.about?.inning || ''}`,
    text: play.result?.description || '',
    event: play.result?.event || '',
    rbi: play.result?.rbi || 0,
  }))

  // ── All at-bats with pitch data (for Statcast replay) ──
  const allAtBats = allPlays.filter(p => p.about && p.result).map(play => {
    const pitches = (play.playEvents || []).filter(e => e.isPitch).map(e => ({
      speed: e.pitchData?.startSpeed || null,
      type: e.details?.type?.description || '',
      typeCode: e.details?.type?.code || '',
      call: e.details?.call?.description || '',
      callCode: e.details?.call?.code || '',
      isStrike: e.details?.isStrike || false,
      isBall: e.details?.isBall || false,
      isInPlay: e.details?.isInPlay || false,
      pX: e.pitchData?.coordinates?.pX ?? null,
      pZ: e.pitchData?.coordinates?.pZ ?? null,
      zone: e.pitchData?.zone ?? null,
    }))
    const hitEvent = [...(play.playEvents || [])].reverse().find(e => e.hitData?.coordinates?.coordX)
    return {
      batterId: play.matchup?.batter?.id,
      batterName: play.matchup?.batter?.fullName || '',
      pitcherId: play.matchup?.pitcher?.id,
      pitcherName: play.matchup?.pitcher?.fullName || '',
      inning: play.about?.inning,
      halfInning: play.about?.halfInning,
      event: play.result?.event || '',
      description: play.result?.description || '',
      isOut: play.result?.isOut || false,
      rbi: play.result?.rbi || 0,
      pitches,
      hitData: hitEvent ? {
        launchSpeed: hitEvent.hitData.launchSpeed || null,
        launchAngle: hitEvent.hitData.launchAngle || null,
        totalDistance: hitEvent.hitData.totalDistance || null,
        trajectory: hitEvent.hitData.trajectory || '',
        coordX: hitEvent.hitData.coordinates?.coordX ?? null,
        coordY: hitEvent.hitData.coordinates?.coordY ?? null,
      } : null,
    }
  })

  // ── Current play pitch-by-pitch data ──
  const currentPlay = ld.plays?.currentPlay || {}
  const playEvents = currentPlay.playEvents || []
  const pitchEvents = playEvents.filter(e => e.isPitch)
  const lastPitchEvent = pitchEvents[pitchEvents.length - 1] || null

  const lastPitch = lastPitchEvent ? {
    speed: lastPitchEvent.pitchData?.startSpeed || null,
    endSpeed: lastPitchEvent.pitchData?.endSpeed || null,
    type: lastPitchEvent.details?.type?.description || '',
    typeCode: lastPitchEvent.details?.type?.code || '',
    call: lastPitchEvent.details?.call?.description || '',
    callCode: lastPitchEvent.details?.call?.code || '',
    isStrike: lastPitchEvent.details?.isStrike || false,
    isBall: lastPitchEvent.details?.isBall || false,
    isInPlay: lastPitchEvent.details?.isInPlay || false,
    pX: lastPitchEvent.pitchData?.coordinates?.pX ?? null,
    pZ: lastPitchEvent.pitchData?.coordinates?.pZ ?? null,
    zone: lastPitchEvent.pitchData?.zone ?? null,
    spinRate: lastPitchEvent.pitchData?.breaks?.spinRate || null,
    breakVertical: lastPitchEvent.pitchData?.breaks?.breakVerticalInduced || null,
    breakHorizontal: lastPitchEvent.pitchData?.breaks?.breakHorizontal || null,
  } : null

  const currentAtBatPitches = pitchEvents.map(e => ({
    speed: e.pitchData?.startSpeed || null,
    type: e.details?.type?.description || '',
    typeCode: e.details?.type?.code || '',
    call: e.details?.call?.description || '',
    callCode: e.details?.call?.code || '',
    isStrike: e.details?.isStrike || false,
    isBall: e.details?.isBall || false,
    isInPlay: e.details?.isInPlay || false,
    pX: e.pitchData?.coordinates?.pX ?? null,
    pZ: e.pitchData?.coordinates?.pZ ?? null,
    zone: e.pitchData?.zone ?? null,
  }))

  // ── Hit data (ball in play) ──
  const lastHitEvent = [...playEvents].reverse().find(e => e.hitData?.coordinates?.coordX)
  const hitData = lastHitEvent ? {
    launchSpeed: lastHitEvent.hitData.launchSpeed || null,
    launchAngle: lastHitEvent.hitData.launchAngle || null,
    totalDistance: lastHitEvent.hitData.totalDistance || null,
    trajectory: lastHitEvent.hitData.trajectory || '',
    hardness: lastHitEvent.hitData.hardness || '',
    coordX: lastHitEvent.hitData.coordinates?.coordX ?? null,
    coordY: lastHitEvent.hitData.coordinates?.coordY ?? null,
  } : null

  return {
    isLive: status === 'In Progress' || status === 'Live',
    isFinal: status === 'Final' || status.includes('Final'),
    status,
    inning: `${ls.inningHalf || ''} ${ls.currentInningOrdinal || ''}`.trim(),
    away: {
      name: gd.teams?.away?.name || '',
      abbr: gd.teams?.away?.abbreviation || '',
      id: gd.teams?.away?.id,
      runs: ls.teams?.away?.runs ?? 0,
      hits: ls.teams?.away?.hits ?? 0,
      errors: ls.teams?.away?.errors ?? 0,
    },
    home: {
      name: gd.teams?.home?.name || '',
      abbr: gd.teams?.home?.abbreviation || '',
      id: gd.teams?.home?.id,
      runs: ls.teams?.home?.runs ?? 0,
      hits: ls.teams?.home?.hits ?? 0,
      errors: ls.teams?.home?.errors ?? 0,
    },
    balls: ls.balls ?? 0,
    strikes: ls.strikes ?? 0,
    outs: ls.outs ?? 0,
    runners: {
      first: !!offense.first,
      second: !!offense.second,
      third: !!offense.third,
      firstName: offense.first?.fullName || null,
      secondName: offense.second?.fullName || null,
      thirdName: offense.third?.fullName || null,
    },
    pitcher: {
      name: defense.pitcher?.fullName || 'TBD',
      id: defense.pitcher?.id,
      era: '', // filled from boxscore
      pitches: 0,
    },
    batter: {
      name: offense.batter?.fullName || 'TBD',
      id: offense.batter?.id,
      avg: '',
    },
    onDeck: {
      name: offense.onDeck?.fullName || '',
      id: offense.onDeck?.id,
    },
    inHole: {
      name: offense.inHole?.fullName || '',
      id: offense.inHole?.id,
    },
    inningHalf: ls.inningHalf || '',
    lastPitch,
    currentAtBatPitches,
    hitData,
    allAtBats,
    innings,
    plays: recentPlays,
  }
}

// ── Game lineups from boxscore ──
export async function getGameLineups(gamePk) {
  try {
    const data = await fetchJSON(`${BASE}/game/${gamePk}/boxscore`)
    const parseTeam = (team) => {
      const order = team?.battingOrder || []
      const players = team?.players || {}
      return order.map((id, i) => {
        const p = players[`ID${id}`] || {}
        const pos = p.position?.abbreviation || ''
        const batting = p.stats?.batting || {}
        const seasonBatting = p.seasonStats?.batting || {}
        return {
          id,
          name: p.person?.fullName || '',
          num: p.jerseyNumber || '',
          pos,
          order: i + 1,
          gameStats: {
            ab: batting.atBats ?? 0,
            h: batting.hits ?? 0,
            r: batting.runs ?? 0,
            rbi: batting.rbi ?? 0,
            bb: batting.baseOnBalls ?? 0,
            so: batting.strikeOuts ?? 0,
          },
          avg: seasonBatting.avg || '',
        }
      })
    }
    return {
      away: parseTeam(data.teams?.away),
      home: parseTeam(data.teams?.home),
    }
  } catch {
    return { away: [], home: [] }
  }
}

// Enrich pitcher/batter with stats from boxscore
export async function getBoxscoreStats(gamePk, pitcherId, batterId) {
  try {
    const data = await fetchJSON(`${BASE}/game/${gamePk}/boxscore`)
    const result = { pitcherEra: '', pitcherPitches: 0, batterAvg: '', pitcherGameStats: null }
    const findInTeam = (team) => {
      const players = team?.players || {}
      for (const key of Object.keys(players)) {
        const p = players[key]
        if (p.person?.id === pitcherId) {
          const ps = p.stats?.pitching || {}
          result.pitcherEra = ps.era || ''
          result.pitcherPitches = ps.numberOfPitches || 0
          result.pitcherGameStats = {
            ip: ps.inningsPitched || '0',
            h: ps.hits ?? 0,
            r: ps.runs ?? 0,
            er: ps.earnedRuns ?? 0,
            bb: ps.baseOnBalls ?? 0,
            so: ps.strikeOuts ?? 0,
            hr: ps.homeRuns ?? 0,
            pitches: ps.numberOfPitches ?? 0,
            strikes: ps.strikes ?? 0,
          }
        }
        if (p.person?.id === batterId) {
          result.batterAvg = p.seasonStats?.batting?.avg || ''
        }
      }
    }
    findInTeam(data.teams?.away)
    findInTeam(data.teams?.home)
    return result
  } catch {
    return { pitcherEra: '', pitcherPitches: 0, batterAvg: '' }
  }
}

// ── Division map ──
export const DIVISIONS = [
  { id: 201, name: 'AL East' }, { id: 202, name: 'AL Central' }, { id: 200, name: 'AL West' },
  { id: 204, name: 'NL East' }, { id: 205, name: 'NL Central' }, { id: 203, name: 'NL West' },
]

// ── Standings ──
let _standingsCache = null
let _standingsCacheTime = 0

export async function getAllStandings() {
  // Cache for 2 min
  if (_standingsCache && Date.now() - _standingsCacheTime < 120000) return _standingsCache
  const year = new Date().getFullYear()
  const data = await fetchJSON(`${BASE}/standings?leagueId=103,104&season=${year}&hydrate=team`)
  const result = {}
  for (const record of data.records || []) {
    const divId = record.division?.id
    if (!divId) continue
    result[divId] = record.teamRecords.map(tr => ({
      team: tr.team?.name || '',
      abbr: tr.team?.abbreviation || '',
      id: tr.team?.id,
      w: tr.wins,
      l: tr.losses,
      pct: tr.winningPercentage || '',
      gb: tr.gamesBack || '—',
      l10: `${tr.records?.splitRecords?.find(r => r.type === 'lastTen')?.wins || '?'}-${tr.records?.splitRecords?.find(r => r.type === 'lastTen')?.losses || '?'}`,
      strk: tr.streak?.streakCode || '',
    }))
  }
  _standingsCache = result
  _standingsCacheTime = Date.now()
  return result
}

export async function getStandings(divisionId = 203) {
  const all = await getAllStandings()
  return all[divisionId] || []
}

// ── Team roster (any team) ──
export async function getTeamRoster(teamId = DODGERS_ID) {
  const data = await fetchJSON(`${BASE}/teams/${teamId}/roster?rosterType=active&hydrate=person(stats(type=season,group=[hitting,pitching]))`)
  return parseRoster(data)
}

function parseRoster(data) {
  return (data.roster || []).map(entry => {
    const p = entry.person || {}
    const pos = entry.position?.abbreviation || ''
    const isPitcher = entry.position?.type === 'Pitcher'
    const statGroups = p.stats || []
    let battingStats = {}
    let pitchingStats = {}
    for (const sg of statGroups) {
      const splits = sg.splits || []
      if (splits.length > 0) {
        const stat = splits[splits.length - 1]?.stat || {}
        if (sg.group?.displayName === 'hitting') battingStats = stat
        if (sg.group?.displayName === 'pitching') pitchingStats = stat
      }
    }
    return {
      name: p.fullName || '',
      pos,
      num: p.primaryNumber || '',
      id: p.id,
      type: isPitcher ? 'pitcher' : 'batter',
      stats: isPitcher
        ? { era: pitchingStats.era || '—', whip: pitchingStats.whip || '—', so: pitchingStats.strikeOuts ?? 0, w: pitchingStats.wins ?? 0 }
        : { avg: battingStats.avg || '—', obp: battingStats.obp || '—', slg: battingStats.slg || '—', ops: battingStats.ops || '—', hr: battingStats.homeRuns ?? 0, rbi: battingStats.rbi ?? 0 },
      rating: isPitcher
        ? Math.min(99, Math.max(60, Math.round(95 - (parseFloat(pitchingStats.era) || 4) * 5)))
        : Math.min(99, Math.max(60, Math.round((parseFloat(battingStats.ops) || 0.7) * 100))),
    }
  })
}

// ── All MLB teams ──
let _teamsCache = null
export async function getAllTeams() {
  if (_teamsCache) return _teamsCache
  const data = await fetchJSON(`${BASE}/teams?sportId=1`)
  _teamsCache = (data.teams || []).map(t => ({
    id: t.id,
    name: t.name,
    abbr: t.abbreviation,
    division: t.division?.id,
    league: t.league?.id,
  })).sort((a, b) => a.name.localeCompare(b.name))
  return _teamsCache
}

// ── Roster ──
export async function getDodgersRoster() {
  return getTeamRoster(DODGERS_ID)
}

// ── Player search/info ──
export async function getPlayerInfo(playerId) {
  const data = await fetchJSON(`${BASE}/people/${playerId}`)
  const p = (data.people || [])[0]
  if (!p) return null
  return {
    fullName: p.fullName,
    birthDate: p.birthDate,
    age: p.currentAge,
    birthCity: p.birthCity,
    birthCountry: p.birthCountry,
    height: p.height,
    weight: p.weight,
    position: p.primaryPosition?.name,
    team: p.currentTeam?.name || 'Free Agent',
    number: p.primaryNumber,
    batSide: p.batSide?.description,
    pitchHand: p.pitchHand?.description,
    mlbDebutDate: p.mlbDebutDate,
  }
}

// ── Player full career stats ──
export async function getPlayerCareerStats(playerId) {
  const [hitData, pitchData, infoData] = await Promise.all([
    fetchJSON(`${BASE}/people/${playerId}/stats?stats=yearByYear&group=hitting`).catch(() => ({})),
    fetchJSON(`${BASE}/people/${playerId}/stats?stats=yearByYear&group=pitching`).catch(() => ({})),
    fetchJSON(`${BASE}/people/${playerId}?hydrate=currentTeam`).catch(() => ({})),
  ])

  const person = (infoData.people || [])[0] || {}
  const info = {
    fullName: person.fullName, birthDate: person.birthDate, age: person.currentAge,
    birthCity: person.birthCity, birthCountry: person.birthCountry, birthState: person.birthStateProvince,
    height: person.height, weight: person.weight,
    position: person.primaryPosition?.name, posAbbr: person.primaryPosition?.abbreviation,
    team: person.currentTeam?.name || 'Free Agent', teamId: person.currentTeam?.id,
    number: person.primaryNumber, batSide: person.batSide?.description,
    pitchHand: person.pitchHand?.description, mlbDebutDate: person.mlbDebutDate,
    active: person.active, draftYear: person.draftYear,
    nickname: person.nickName,
  }

  const parseSeasons = (data) => {
    const stats = data.stats?.[0]?.splits || []
    return stats.filter(s => s.team).map(s => ({
      season: s.season,
      team: s.team?.name || '',
      teamAbbr: s.team?.abbreviation || '',
      teamId: s.team?.id,
      league: s.league?.name || '',
      stats: s.stat || {},
    }))
  }

  return {
    info,
    hitting: parseSeasons(hitData),
    pitching: parseSeasons(pitchData),
  }
}

// ── Game Highlights ──
export async function getGameHighlights(gamePk) {
  try {
    const data = await fetchJSON(`${BASE}/game/${gamePk}/content`)
    const items = data.highlights?.highlights?.items || []
    return items
      .filter(item => {
        const playbacks = item.playbacks || []
        return playbacks.some(pb => pb.name === 'mp4AvcPlayback' || pb.name === 'HTTP_CLOUD_WIRED_60')
      })
      .map(item => {
        const playbacks = item.playbacks || []
        const mp4 = playbacks.find(pb => pb.name === 'mp4AvcPlayback')
          || playbacks.find(pb => pb.name === 'HTTP_CLOUD_WIRED_60')
          || playbacks.find(pb => pb.name === 'HTTP_CLOUD_WIRED')
          || playbacks[0]
        const thumb = (item.image?.cuts || []).find(c => c.width >= 320 && c.width <= 640)
          || (item.image?.cuts || [])[0]
        return {
          title: item.title || '',
          description: item.description || '',
          duration: item.duration || '',
          url: mp4?.url || '',
          thumbnail: thumb?.src || '',
          blurb: item.blurb || '',
        }
      })
      .filter(h => h.url)
  } catch {
    return []
  }
}

// ── Social: Reddit ──
export async function fetchRedditPosts(subreddit = 'Dodgers', sort = 'hot', limit = 15) {
  try {
    const res = await fetch(`https://www.reddit.com/r/${subreddit}/${sort}.json?limit=${limit}`, {
      headers: { 'User-Agent': 'MLBDashboard/1.0' },
    })
    if (!res.ok) return []
    const data = await res.json()
    return (data.data?.children || []).map(c => {
      const d = c.data || {}
      return {
        source: 'reddit',
        sub: `r/${subreddit}`,
        author: `u/${d.author || ''}`,
        time: timeAgo(d.created_utc),
        title: d.title || '',
        text: (d.selftext || '').slice(0, 300),
        upvotes: d.score || 0,
        comments: d.num_comments || 0,
        url: `https://reddit.com${d.permalink || ''}`,
      }
    })
  } catch {
    return []
  }
}

// ── Social: Bluesky ──
export async function fetchBlueskyPosts(query = 'Dodgers', limit = 15) {
  try {
    const res = await fetch(`https://public.api.bsky.app/xrpc/app.bsky.feed.searchPosts?q=${encodeURIComponent(query)}&limit=${limit}&sort=latest`)
    if (!res.ok) return []
    const data = await res.json()
    return (data.posts || []).map(post => {
      const record = post.record || {}
      const author = post.author || {}
      return {
        source: 'bluesky',
        author: author.displayName || author.handle || '',
        handle: `@${author.handle || ''}`,
        time: timeAgo(new Date(record.createdAt).getTime() / 1000),
        text: record.text || '',
        likes: post.likeCount || 0,
        reposts: post.repostCount || 0,
        url: `https://bsky.app/profile/${author.handle}/post/${(post.uri || '').split('/').pop()}`,
      }
    })
  } catch {
    return []
  }
}

// ── Social: Facebook (mock — requires Graph API token) ──
export function getFacebookPosts() {
  return [
    { source: 'facebook', author: 'Los Angeles Dodgers', page: '@Dodgers', time: '1h ago', text: '5 straight wins! This team is on FIRE 🔥🔵 #LetsGoDodgers', likes: 12400, comments: 892, shares: 1240, image: 'https://www.mlbstatic.com/team-logos/119.svg', url: 'https://facebook.com/Dodgers' },
    { source: 'facebook', author: 'Los Angeles Dodgers', page: '@Dodgers', time: '4h ago', text: 'Tonight\'s lineup is STACKED. Ohtani batting 2nd, Freeman at cleanup. Let\'s get it! ⚾', likes: 8700, comments: 645, shares: 890, url: 'https://facebook.com/Dodgers' },
    { source: 'facebook', author: 'Los Angeles Dodgers', page: '@Dodgers', time: '8h ago', text: 'Yamamoto\'s last 5 starts: 1.92 ERA, 38 SO. NL Pitcher of the Month! 🏆', likes: 15200, comments: 1100, shares: 2100, url: 'https://facebook.com/Dodgers' },
    { source: 'facebook', author: 'MLB', page: '@MLB', time: '2h ago', text: 'The Dodgers lead the NL West by 7 games. Is this the best team in baseball? 🤔', likes: 22000, comments: 3400, shares: 1800, url: 'https://facebook.com/MLB' },
    { source: 'facebook', author: 'ESPN', page: '@ESPN', time: '5h ago', text: 'Shohei Ohtani is on pace for 65 HRs this season. Historic. Simply historic. 🐐', likes: 34000, comments: 5200, shares: 4100, url: 'https://facebook.com/ESPN' },
  ]
}

// ── Social: Instagram (mock — requires Graph API token) ──
export function getInstagramPosts() {
  return [
    { source: 'instagram', author: 'Los Angeles Dodgers', handle: '@dodgers', time: '30m ago', text: 'Game day vibes at Dodger Stadium 🏟️🔵 #ITFDB', likes: 45000, comments: 1200, image: 'https://www.mlbstatic.com/team-logos/119.svg', url: 'https://instagram.com/dodgers' },
    { source: 'instagram', author: 'Los Angeles Dodgers', handle: '@dodgers', time: '3h ago', text: 'Ohtani goes deep AGAIN! 💣 28 on the season. #ShoTime', likes: 67000, comments: 3400, url: 'https://instagram.com/dodgers' },
    { source: 'instagram', author: 'Shohei Ohtani', handle: '@shoheiohtani', time: '6h ago', text: 'Great team win tonight! 🙏⚾ Thank you Dodger fans!', likes: 890000, comments: 12000, url: 'https://instagram.com/shoheiohtani' },
    { source: 'instagram', author: 'MLB', handle: '@mlb', time: '1h ago', text: 'The Dodgers rotation is the BEST in baseball. Yamamoto, Glasnow, Buehler. 🔥', likes: 120000, comments: 8900, url: 'https://instagram.com/mlb' },
    { source: 'instagram', author: 'Mookie Betts', handle: '@maborjr', time: '8h ago', text: 'Another day at the office ⚾💪 #DodgerBlue', likes: 230000, comments: 5600, url: 'https://instagram.com/maborjr' },
  ]
}

export async function getSocialFeed() {
  const [reddit1, reddit2, bluesky] = await Promise.all([
    fetchRedditPosts('Dodgers', 'hot', 8),
    fetchRedditPosts('baseball', 'hot', 4),
    fetchBlueskyPosts('Dodgers', 8),
  ])
  const facebook = getFacebookPosts()
  const instagram = getInstagramPosts()
  const combined = [
    ...reddit1,
    ...reddit2,
    ...bluesky.map(p => ({
      source: 'bluesky', sub: '', author: p.author, handle: p.handle,
      time: p.time, title: '', text: p.text, upvotes: p.likes, comments: p.reposts, url: p.url,
    })),
    ...facebook.map(p => ({
      source: 'facebook', sub: '', author: p.author, page: p.page,
      time: p.time, title: '', text: p.text, upvotes: p.likes, comments: p.comments, shares: p.shares, url: p.url,
    })),
    ...instagram.map(p => ({
      source: 'instagram', sub: '', author: p.author, handle: p.handle,
      time: p.time, title: '', text: p.text, upvotes: p.likes, comments: p.comments, url: p.url,
    })),
  ]
  return combined
}

// ── News (RSS via proxy-free approach — use MLB.com JSON) ──
// ── Next Dodgers game ──
export async function getNextDodgersGame() {
  const start = new Date()
  const end = new Date()
  end.setDate(end.getDate() + 10)
  const fmt = d => `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}/${d.getFullYear()}`
  const data = await fetchJSON(`${BASE}/schedule?sportId=1&teamId=${DODGERS_ID}&startDate=${fmt(start)}&endDate=${fmt(end)}&hydrate=probablePitcher,team`)
  for (const d of data.dates || []) {
    for (const g of d.games || []) {
      const status = g.status?.abstractGameState || ''
      if (status === 'Preview' || status === 'Scheduled' || status === 'Pre-Game') {
        const away = g.teams?.away || {}
        const home = g.teams?.home || {}
        return {
          gamePk: g.gamePk,
          gameDate: g.gameDate,
          venue: g.venue?.name || '',
          away: {
            name: away.team?.name || '',
            abbr: away.team?.abbreviation || '',
            id: away.team?.id,
            record: `${away.leagueRecord?.wins || 0}-${away.leagueRecord?.losses || 0}`,
            probablePitcher: away.probablePitcher ? {
              name: away.probablePitcher.fullName,
              id: away.probablePitcher.id,
              era: away.probablePitcher.stats?.[0]?.splits?.[0]?.stat?.era || '',
              record: `${away.probablePitcher.stats?.[0]?.splits?.[0]?.stat?.wins || 0}-${away.probablePitcher.stats?.[0]?.splits?.[0]?.stat?.losses || 0}`,
            } : null,
          },
          home: {
            name: home.team?.name || '',
            abbr: home.team?.abbreviation || '',
            id: home.team?.id,
            record: `${home.leagueRecord?.wins || 0}-${home.leagueRecord?.losses || 0}`,
            probablePitcher: home.probablePitcher ? {
              name: home.probablePitcher.fullName,
              id: home.probablePitcher.id,
              era: home.probablePitcher.stats?.[0]?.splits?.[0]?.stat?.era || '',
              record: `${home.probablePitcher.stats?.[0]?.splits?.[0]?.stat?.wins || 0}-${home.probablePitcher.stats?.[0]?.splits?.[0]?.stat?.losses || 0}`,
            } : null,
          },
        }
      }
    }
  }
  return null
}

export async function getNews() {
  try {
    const data = await fetchJSON('https://statsapi.mlb.com/api/v1/news?teamId=119&numItems=12')
    return (data.articles || []).map(a => ({
      title: a.headline || a.title || '',
      source: a.source || 'MLB.com',
      time: timeAgo(new Date(a.date || a.publishedDate || Date.now()).getTime() / 1000),
      summary: a.blurb || a.subhead || '',
      url: a.url || '#',
    }))
  } catch {
    return []
  }
}

// ── Monthly schedule (any team) ──
export async function getMonthlySchedule(teamId = DODGERS_ID, year, month) {
  const startDate = `${String(month).padStart(2,'0')}/01/${year}`
  const lastDay = new Date(year, month, 0).getDate()
  const endDate = `${String(month).padStart(2,'0')}/${lastDay}/${year}`
  const data = await fetchJSON(`${BASE}/schedule?sportId=1&teamId=${teamId}&startDate=${startDate}&endDate=${endDate}&hydrate=team,linescore,probablePitcher`)
  const games = []
  for (const d of data.dates || []) {
    for (const g of d.games || []) {
      const away = g.teams?.away || {}
      const home = g.teams?.home || {}
      const status = g.status?.detailedState || g.status?.abstractGameState || ''
      const isFinal = status === 'Final' || status.includes('Final')
      const isLive = status === 'In Progress' || status === 'Live'
      games.push({
        gamePk: g.gamePk,
        date: g.gameDate,
        dayOfMonth: new Date(g.gameDate).getDate(),
        status,
        isFinal, isLive,
        away: { name: away.team?.name || '', abbr: away.team?.abbreviation || '', id: away.team?.id, score: away.score ?? null },
        home: { name: home.team?.name || '', abbr: home.team?.abbreviation || '', id: home.team?.id, score: home.score ?? null },
        isHome: home.team?.id === teamId,
        venue: g.venue?.name || '',
        awayPitcher: away.probablePitcher?.fullName || null,
        homePitcher: home.probablePitcher?.fullName || null,
        awayRecord: away.leagueRecord ? `${away.leagueRecord.wins}-${away.leagueRecord.losses}` : '',
        homeRecord: home.leagueRecord ? `${home.leagueRecord.wins}-${home.leagueRecord.losses}` : '',
        win: isFinal && teamId === home.team?.id ? (home.score > away.score) : isFinal && teamId === away.team?.id ? (away.score > home.score) : null,
      })
    }
  }
  return games
}

// ── Odds / Betting ──
// Ready to connect with The Odds API (https://the-odds-api.com)
// Set ODDS_API_KEY to enable live odds data
const ODDS_API_KEY = '00ed96d12253a8c1f9dbeaf27ad98120'

export async function getMLBOdds() {
  // Try live odds API first
  if (ODDS_API_KEY) {
    try {
      const res = await fetch(`https://api.the-odds-api.com/v4/sports/baseball_mlb/odds/?apiKey=${ODDS_API_KEY}&regions=us&markets=h2h,spreads,totals&oddsFormat=american&bookmakers=draftkings,fanduel,betmgm`)
      if (res.ok) {
        const data = await res.json()
        return { games: data.map(g => parseOddsGame(g)), isLive: true }
      }
    } catch {}
  }
  // Fallback: generate simulated odds from real schedule
  const simulated = await generateOddsFromSchedule()
  return { games: simulated, isLive: false }
}

function parseOddsGame(g) {
  const markets = {}
  for (const bm of g.bookmakers || []) {
    for (const mk of bm.markets || []) {
      if (!markets[mk.key]) markets[mk.key] = {}
      markets[mk.key][bm.title] = mk.outcomes
    }
  }
  return { id: g.id, away: g.away_team, home: g.home_team, commence: g.commence_time, markets }
}

async function generateOddsFromSchedule() {
  try {
    // Get today's real MLB schedule
    const date = today()
    const data = await fetchJSON(`${BASE}/schedule?sportId=1&date=${date}&hydrate=team,probablePitcher,linescore`)
    const games = []
    for (const d of data.dates || []) {
      for (const g of d.games || []) {
        const away = g.teams?.away || {}
        const home = g.teams?.home || {}
        const awayName = away.team?.name || ''
        const homeName = home.team?.name || ''
        const awayW = away.leagueRecord?.wins || 40
        const awayL = away.leagueRecord?.losses || 40
        const homeW = home.leagueRecord?.wins || 40
        const homeL = home.leagueRecord?.losses || 40

        // Calculate simulated odds based on records + home advantage
        const awayPct = awayW / (awayW + awayL || 1)
        const homePct = homeW / (homeW + homeL || 1)
        const homeAdv = 0.04 // ~4% home advantage
        const rawHomeProb = (homePct + homeAdv) / (awayPct + homePct + homeAdv)
        const homeProb = Math.max(0.25, Math.min(0.8, rawHomeProb))
        const awayProb = 1 - homeProb

        const toAmericanOdds = (prob) => prob >= 0.5
          ? Math.round(-100 * prob / (1 - prob))
          : Math.round(100 * (1 - prob) / prob)

        const homeML = toAmericanOdds(homeProb)
        const awayML = toAmericanOdds(awayProb)
        // Add small variations for different books
        const vary = () => Math.floor(Math.random() * 8) - 4
        const totalRuns = (8 + Math.round((awayPct + homePct) * 3 * 2) / 2)

        games.push({
          id: String(g.gamePk),
          away: awayName,
          home: homeName,
          commence: g.gameDate,
          status: g.status?.detailedState || '',
          markets: {
            h2h: {
              DraftKings: [{ name: homeName, price: homeML }, { name: awayName, price: awayML }],
              FanDuel: [{ name: homeName, price: homeML + vary() }, { name: awayName, price: awayML + vary() }],
              BetMGM: [{ name: homeName, price: homeML + vary() }, { name: awayName, price: awayML + vary() }],
            },
            spreads: {
              DraftKings: [
                { name: homeName, price: homeML > 0 ? -130 + vary() : -110 + vary(), point: -1.5 },
                { name: awayName, price: homeML > 0 ? 110 + vary() : -110 + vary(), point: 1.5 },
              ],
              FanDuel: [
                { name: homeName, price: homeML > 0 ? -125 + vary() : -108 + vary(), point: -1.5 },
                { name: awayName, price: homeML > 0 ? 105 + vary() : -112 + vary(), point: 1.5 },
              ],
            },
            totals: {
              DraftKings: [{ name: 'Over', price: -110 + vary(), point: totalRuns }, { name: 'Under', price: -110 + vary(), point: totalRuns }],
              FanDuel: [{ name: 'Over', price: -108 + vary(), point: totalRuns }, { name: 'Under', price: -112 + vary(), point: totalRuns }],
            },
          },
        })
      }
    }
    return games
  } catch {
    return []
  }
}

// ── Util ──
function timeAgo(unixSeconds) {
  const now = Date.now() / 1000
  const diff = now - unixSeconds
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}
