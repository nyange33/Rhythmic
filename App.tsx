import { useState, useRef, useEffect } from 'react'

const PLAYLISTS = [
  { id: 1, name: 'Late Night Drive', author: 'curated by you', cover: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop&auto=format' },
  { id: 2, name: 'Focus Mode', author: 'by Spotify', cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&h=300&fit=crop&auto=format' },
  { id: 3, name: 'Morning Ritual', author: 'curated by you', cover: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=300&h=300&fit=crop&auto=format' },
  { id: 4, name: 'Deep House Vol.4', author: 'by NightOwl', cover: 'https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=300&h=300&fit=crop&auto=format' },
  { id: 5, name: 'Cinematic Moods', author: 'by SoundLab', cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop&auto=format' },
  { id: 6, name: 'Workout Beats', author: 'curated by you', cover: 'https://images.unsplash.com/photo-1526478806334-5fd488fcaabc?w=300&h=300&fit=crop&auto=format' },
]

const LIKED_TRACKS = [
  { id: 1, title: 'Midnight City', artist: 'M83', duration: '4:03', cover: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=80&h=80&fit=crop&auto=format' },
  { id: 2, title: 'Breathe', artist: 'Télépopmusik', duration: '3:47', cover: 'https://images.unsplash.com/photo-1500099817043-86d46000d58f?w=80&h=80&fit=crop&auto=format' },
  { id: 3, title: 'Intro', artist: 'The xx', duration: '2:07', cover: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=80&h=80&fit=crop&auto=format' },
  { id: 4, title: 'Digital Love', artist: 'Daft Punk', duration: '4:58', cover: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=80&h=80&fit=crop&auto=format' },
  { id: 5, title: 'Crystalised', artist: 'The xx', duration: '3:53', cover: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=80&h=80&fit=crop&auto=format' },
  { id: 6, title: 'Oblivion', artist: 'Grimes', duration: '5:02', cover: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=80&h=80&fit=crop&auto=format' },
  { id: 7, title: 'Blue (Da Ba Dee)', artist: 'Eiffel 65', duration: '3:40', cover: 'https://images.unsplash.com/photo-1487537708369-f04818b67cbb?w=80&h=80&fit=crop&auto=format' },
  { id: 8, title: 'Around the World', artist: 'Daft Punk', duration: '7:09', cover: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=80&h=80&fit=crop&auto=format' },
  { id: 9, title: 'Get Lucky', artist: 'Daft Punk ft. Pharrell', duration: '6:09', cover: 'https://images.unsplash.com/photo-1528489496900-d841974f5290?w=80&h=80&fit=crop&auto=format' },
  { id: 10, title: 'Loneliness', artist: 'Lost Frequencies', duration: '3:21', cover: 'https://images.unsplash.com/photo-1534330207526-8e81f10ec6fc?w=80&h=80&fit=crop&auto=format' },
  { id: 11, title: 'Sunset Lover', artist: 'Petit Biscuit', duration: '3:55', cover: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&auto=format' },
  { id: 12, title: 'Ghost', artist: 'Indigo De Souza', duration: '4:12', cover: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=80&h=80&fit=crop&auto=format' },
]

const CURRENT_TRACK = {
  title: 'Midnight City',
  artist: 'M83',
  duration: 243,
  cover: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=120&h=120&fit=crop&auto=format',
}

function formatTime(s: number) {
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${m}:${sec.toString().padStart(2, '0')}`
}

function IconHeadphones() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 18v-6a9 9 0 0 1 18 0v6"/>
      <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3z"/>
      <path d="M3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/>
    </svg>
  )
}

function IconMic() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/>
      <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
      <line x1="12" y1="19" x2="12" y2="22"/>
    </svg>
  )
}

function IconHeart() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>
  )
}

function IconList() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="8" y1="6" x2="21" y2="6"/>
      <line x1="8" y1="12" x2="21" y2="12"/>
      <line x1="8" y1="18" x2="21" y2="18"/>
      <line x1="3" y1="6" x2="3.01" y2="6"/>
      <line x1="3" y1="12" x2="3.01" y2="12"/>
      <line x1="3" y1="18" x2="3.01" y2="18"/>
    </svg>
  )
}

function IconUsers() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  )
}

function IconUser() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  )
}

function IconRefresh() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 4 23 10 17 10"/>
      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
    </svg>
  )
}

function IconSearch() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/>
      <line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  )
}

function IconPlay() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
      <polygon points="5 3 19 12 5 21 5 3"/>
    </svg>
  )
}

function IconPause() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
      <rect x="6" y="4" width="4" height="16"/>
      <rect x="14" y="4" width="4" height="16"/>
    </svg>
  )
}

function IconPrev() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <polygon points="19 20 9 12 19 4 19 20"/>
      <line x1="5" y1="19" x2="5" y2="5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/>
    </svg>
  )
}

function IconNext() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <polygon points="5 4 15 12 5 20 5 4"/>
      <line x1="19" y1="5" x2="19" y2="19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/>
    </svg>
  )
}

function IconVolume({ level }: { level: number }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
      {level > 0 && <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>}
      {level > 50 && <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>}
    </svg>
  )
}

function IconArtist() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <circle cx="12" cy="10" r="3"/>
      <path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662"/>
    </svg>
  )
}

function IconAddPlaylist() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"/>
      <line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  )
}

function IconEqualizer() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="4" y1="21" x2="4" y2="14"/>
      <line x1="4" y1="10" x2="4" y2="3"/>
      <line x1="12" y1="21" x2="12" y2="12"/>
      <line x1="12" y1="8" x2="12" y2="3"/>
      <line x1="20" y1="21" x2="20" y2="16"/>
      <line x1="20" y1="12" x2="20" y2="3"/>
      <line x1="1" y1="14" x2="7" y2="14"/>
      <line x1="9" y1="8" x2="15" y2="8"/>
      <line x1="17" y1="16" x2="23" y2="16"/>
    </svg>
  )
}

export default function App() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(67)
  const [volume, setVolume] = useState(75)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [activePage, setActivePage] = useState<'home' | 'library'>('home')
  const [liked, setLiked] = useState(false)
  const [repeat, setRepeat] = useState(false)
  const [notifications, setNotifications] = useState(3)
  const [notifOpen, setNotifOpen] = useState(false)
  const notifRef = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const timerRef = useRef<number | null>(null)

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = window.setInterval(() => {
        setCurrentTime(t => {
          if (t >= CURRENT_TRACK.duration) {
            setIsPlaying(false)
            return 0
          }
          return t + 1
        })
      }, 1000)
    } else {
      if (timerRef.current) clearInterval(timerRef.current)
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [isPlaying])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const progress = (currentTime / CURRENT_TRACK.duration) * 100

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#0c0c0c' }}>

      {/* TOP NAV */}
      <header className="sticky top-0 z-50 border-b" style={{ background: '#0c0c0c', borderColor: '#2a2a2a' }}>
        <div className="flex items-center gap-0 h-16" style={{ paddingLeft: '400px', paddingRight: '400px' }}>

          {/* Logo / Refresh */}
          <button
            onClick={() => window.location.reload()}
            className="flex items-center justify-center w-9 h-9 rounded-full transition-all duration-150 hover:bg-white/10 text-white flex-shrink-0"
            title="Reload"
          >
            <IconRefresh />
          </button>

          {/* Home */}
          <button
            onClick={() => setActivePage('home')}
            className="text-sm font-medium tracking-wide transition-colors duration-150 flex-shrink-0 rounded-md"
            style={{
              marginLeft: '20px',
              color: activePage === 'home' ? '#ffffff' : '#a0a0a0',
              padding: '7px 16px',
              background: activePage === 'home' ? '#1e1e1e' : 'transparent',
            }}
          >
            Home
          </button>

          {/* Library */}
          <button
            onClick={() => setActivePage('library')}
            className="text-sm font-medium tracking-wide transition-colors duration-150 flex-shrink-0 rounded-md"
            style={{
              marginLeft: '8px',
              color: activePage === 'library' ? '#ffffff' : '#a0a0a0',
              padding: '7px 16px',
              background: activePage === 'library' ? '#1e1e1e' : 'transparent',
            }}
          >
            Library
          </button>

          {/* Charts */}
          <button
            onClick={() => setActivePage('home')}
            className="text-sm font-medium tracking-wide transition-colors duration-150 flex-shrink-0 rounded-md"
            style={{
              marginLeft: '8px',
              color: '#a0a0a0',
              padding: '7px 16px',
            }}
          >
            Charts
          </button>

          {/* Explore */}
          <button
            className="text-sm font-medium tracking-wide transition-colors duration-150 flex-shrink-0 rounded-md"
            style={{
              marginLeft: '8px',
              color: '#a0a0a0',
              padding: '7px 16px',
            }}
          >
            Explore
          </button>

          {/* Search */}
          <div className="flex-1 flex justify-center px-8">
            <div className="relative w-full max-w-lg">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#a0a0a0' }}>
                <IconSearch />
              </span>
              <input
                type="text"
                placeholder="Artists, songs, podcasts..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full text-sm outline-none transition-all duration-200 placeholder:text-zinc-500"
                style={{
                  background: '#1e1e1e',
                  color: '#f0f0f0',
                  border: '1px solid #2a2a2a',
                  borderRadius: '999px',
                  padding: '11px 20px 11px 40px',
                }}
              />
            </div>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2 flex-shrink-0 mr-3">
            {/* Upload track */}
            <button
              className="flex items-center gap-1.5 text-xs font-medium rounded-md transition-all duration-150 hover:bg-white/10"
              style={{ color: '#a0a0a0', padding: '7px 12px', border: '1px solid #2a2a2a' }}
              title="Upload track"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
              Upload
            </button>

            {/* Notifications */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => { setNotifOpen(v => !v); setNotifications(0) }}
                className="relative flex items-center justify-center w-9 h-9 rounded-full transition-all duration-150 hover:bg-white/10"
                style={{ color: '#a0a0a0' }}
                title="Notifications"
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                </svg>
                {notifications > 0 && (
                  <span className="absolute top-1 right-1 flex items-center justify-center rounded-full text-white font-bold"
                    style={{ width: '14px', height: '14px', fontSize: '9px', background: '#e53e3e' }}>
                    {notifications}
                  </span>
                )}
              </button>
              {notifOpen && (
                <div
                  className="absolute right-0 top-12 z-[100] shadow-2xl"
                  style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '12px', width: '260px' }}
                >
                  <p className="text-xs font-semibold tracking-widest uppercase px-4 pt-4 pb-2" style={{ color: '#606060' }}>Notifications</p>
                  {[
                    { text: 'M83 released a new album', time: '2m ago' },
                    { text: 'Your playlist was liked by 12 people', time: '1h ago' },
                    { text: 'Daft Punk added new tracks', time: '3h ago' },
                  ].map((n, i) => (
                    <div key={i} className="flex flex-col px-4 py-3 hover:bg-white/5 cursor-pointer" style={{ borderTop: '1px solid #2a2a2a' }}>
                      <span className="text-xs" style={{ color: '#d0d0d0' }}>{n.text}</span>
                      <span className="text-xs mt-0.5" style={{ color: '#606060' }}>{n.time}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Settings */}
            <button
              className="flex items-center justify-center w-9 h-9 rounded-full transition-all duration-150 hover:bg-white/10"
              style={{ color: '#a0a0a0' }}
              title="Settings"
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3"/>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
              </svg>
            </button>
          </div>

          {/* User avatar */}
          <div className="relative flex-shrink-0" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(v => !v)}
              className="flex items-center justify-center w-9 h-9 rounded-full transition-all duration-150 hover:bg-white/10"
              style={{ border: '1px solid #2a2a2a', color: '#f0f0f0' }}
              title="Account"
            >
              <IconUser />
            </button>

            {dropdownOpen && (
              <div
                className="absolute right-0 top-12 z-[100] flex flex-col overflow-hidden shadow-2xl"
                style={{
                  background: '#1a1a1a',
                  border: '1px solid #2a2a2a',
                  borderRadius: '12px',
                  minWidth: '200px',
                }}
              >
                {[
                  { label: 'For listener', Icon: IconHeadphones },
                  { label: 'For artists', Icon: IconMic },
                  { label: 'Likes', Icon: IconHeart },
                  { label: 'Playlists', Icon: IconList },
                  { label: 'Following', Icon: IconUsers },
                ].map(({ label, Icon }) => (
                  <button
                    key={label}
                    className="flex items-center justify-between px-4 py-3 text-sm font-medium transition-colors duration-100 hover:bg-white/5 text-left"
                    style={{ color: '#e0e0e0' }}
                    onClick={() => setDropdownOpen(false)}
                  >
                    <span>{label}</span>
                    <span style={{ color: '#a0a0a0' }}>
                      <Icon />
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-1 pb-32" style={{ paddingLeft: '400px', paddingRight: '400px' }}>

        {/* Playlists */}
        <section className="mt-10">
          <h2 className="text-xs font-semibold tracking-widest uppercase mb-5" style={{ color: '#a0a0a0' }}>
            Your Playlists
          </h2>
          <div className="grid grid-cols-6 gap-4">
            {PLAYLISTS.map(p => (
              <div
                key={p.id}
                className="group cursor-pointer"
                style={{ minWidth: 0 }}
              >
                <div className="aspect-square w-full overflow-hidden" style={{ borderRadius: '6px', background: '#1e1e1e' }}>
                  <img
                    src={p.cover}
                    alt={p.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <p className="mt-2 text-xs font-semibold truncate" style={{ color: '#f0f0f0' }}>{p.name}</p>
                <p className="text-xs truncate" style={{ color: '#707070' }}>{p.author}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Liked Tracks */}
        <section className="mt-12">
          <h2 className="text-xs font-semibold tracking-widest uppercase mb-5" style={{ color: '#a0a0a0' }}>
            Liked Tracks
          </h2>
          <div className="grid grid-cols-6 gap-x-4 gap-y-3">
            {LIKED_TRACKS.map(track => (
              <div
                key={track.id}
                className="group flex flex-col cursor-pointer rounded-lg p-2 transition-colors duration-150 hover:bg-white/5"
              >
                <div className="aspect-square w-full overflow-hidden rounded mb-2" style={{ background: '#1e1e1e' }}>
                  <img
                    src={track.cover}
                    alt={track.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <p className="text-xs font-medium truncate" style={{ color: '#e0e0e0' }}>{track.title}</p>
                <div className="flex items-center justify-between mt-0.5">
                  <p className="text-xs truncate" style={{ color: '#707070' }}>{track.artist}</p>
                  <p className="text-xs flex-shrink-0 ml-1" style={{ color: '#505050' }}>{track.duration}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* BOTTOM PLAYER */}
      <footer
        className="fixed bottom-0 left-0 right-0 z-50 flex items-center border-t"
        style={{
          background: '#111111',
          borderColor: '#2a2a2a',
          height: '100px',
          paddingLeft: '400px',
          paddingRight: '400px',
        }}
      >
        {/* Left: cover + info */}
        <div className="flex items-center gap-3 flex-shrink-0" style={{ width: '220px' }}>
          <div
            className="flex-shrink-0 overflow-hidden"
            style={{
              height: 'calc(100px - 30px)',
              width: 'calc(100px - 30px)',
              borderRadius: '5px',
              background: '#1e1e1e',
            }}
          >
            <img
              src={CURRENT_TRACK.cover}
              alt={CURRENT_TRACK.title}
              className="w-full h-full object-cover"
            />
          </div>
          <div style={{ paddingTop: '30px', paddingBottom: '30px', overflow: 'hidden' }}>
            <p className="text-sm font-semibold truncate leading-tight" style={{ color: '#f0f0f0' }}>{CURRENT_TRACK.title}</p>
            <p className="text-xs mt-0.5 truncate" style={{ color: '#808080' }}>{CURRENT_TRACK.artist}</p>
          </div>
        </div>

        {/* Center: controls + progress */}
        <div className="flex-1 flex flex-col items-center justify-end pb-[10px] gap-2">
          {/* Playback buttons */}
          <div className="flex items-center gap-5">
            <button
              onClick={() => setLiked(v => !v)}
              className="transition-all duration-150 hover:scale-110"
              title="Like"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill={liked ? '#e53e3e' : 'none'} stroke={liked ? '#e53e3e' : '#808080'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
            </button>
            <button
              className="transition-colors duration-150 hover:text-white"
              style={{ color: '#808080' }}
              title="Previous"
            >
              <IconPrev />
            </button>
            <button
              onClick={() => setIsPlaying(v => !v)}
              className="flex items-center justify-center rounded-full transition-all duration-150 hover:scale-105"
              style={{
                width: '38px',
                height: '38px',
                background: '#ffffff',
                color: '#000000',
              }}
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <IconPause /> : <IconPlay />}
            </button>
            <button
              className="transition-colors duration-150 hover:text-white"
              style={{ color: '#808080' }}
              title="Next"
            >
              <IconNext />
            </button>
            <button
              onClick={() => setRepeat(v => !v)}
              className="transition-all duration-150 hover:scale-110"
              title="Repeat"
              style={{ color: repeat ? '#ffffff' : '#808080' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="17 1 21 5 17 9"/>
                <path d="M3 11V9a4 4 0 0 1 4-4h14"/>
                <polyline points="7 23 3 19 7 15"/>
                <path d="M21 13v2a4 4 0 0 1-4 4H3"/>
              </svg>
            </button>
          </div>

          {/* Progress bar */}
          <div className="flex items-center gap-3 w-full" style={{ maxWidth: '480px' }}>
            <span className="tabular-nums flex-shrink-0" style={{ color: '#808080', minWidth: '36px', textAlign: 'right', fontSize: '11px' }}>
              {formatTime(currentTime)}
            </span>
            <div
              className="flex-1 group/bar"
              style={{ position: 'relative', height: '6px', borderRadius: '999px', background: '#3a3a3a', cursor: 'pointer', transition: 'height 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.height = '8px')}
              onMouseLeave={e => (e.currentTarget.style.height = '6px')}
              onClick={e => {
                const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect()
                const pct = (e.clientX - rect.left) / rect.width
                setCurrentTime(Math.round(pct * CURRENT_TRACK.duration))
              }}
            >
              <div style={{ position: 'absolute', top: 0, left: 0, height: '100%', width: `${progress}%`, borderRadius: '999px', background: '#ffffff', pointerEvents: 'none', transition: 'width 0.3s linear' }} />
            </div>
            <span className="tabular-nums flex-shrink-0" style={{ color: '#808080', minWidth: '36px', fontSize: '11px' }}>
              {formatTime(CURRENT_TRACK.duration)}
            </span>
          </div>
        </div>

        {/* Right: action buttons */}
        <div className="flex items-center gap-4 flex-shrink-0 justify-end" style={{ width: '220px' }}>
          <button className="transition-colors duration-150 hover:text-white" style={{ color: '#808080' }} title="Go to artist">
            <IconArtist />
          </button>
          <button className="transition-colors duration-150 hover:text-white" style={{ color: '#808080' }} title="Add to playlist">
            <IconAddPlaylist />
          </button>
          <div className="flex items-center gap-2">
            <button className="transition-colors duration-150 hover:text-white flex-shrink-0" style={{ color: '#808080' }} title="Volume">
              <IconVolume level={volume} />
            </button>
            <input
              type="range"
              min={0}
              max={100}
              value={volume}
              onChange={e => setVolume(Number(e.target.value))}
              className="w-20"
              title="Volume"
            />
          </div>
          <button className="transition-colors duration-150 hover:text-white" style={{ color: '#808080' }} title="Equalizer">
            <IconEqualizer />
          </button>
        </div>
      </footer>
    </div>
  )
}
