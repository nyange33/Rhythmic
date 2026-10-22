import ProfilePage from "./profilePage";
import { tracks } from "./data/tracks";
import { useAudioPlayer } from "./hooks/useAudioPlayer";
import { useEqualizer } from "./hooks/useEqualizer";
import { EQ_FREQUENCIES } from "./audio/audioEngine";
import type { Track } from "./types/track";
import Spectrum from "./components/player/spectrum";
import { Cover, NavItem, TrackRow } from "./components/musicComponents";
import MusicPages from "./components/pages/musicPages";
import { PlaylistDialog, UploadMusicDialog, type PlaylistType, type UploadType } from "./components/dialogs/musicDialogs";
import AuthDialog, { type AuthMode } from "./components/dialogs/authDialog";

import {
  Bell,
  Disc3,
  FileAudio,
  ChevronDown,
  Compass,
  Heart,
  Home,
  Library,
  ListMusic,
  Menu,
  MoreHorizontal,
  Pause,
  Play,
  Plus,
  Repeat2,
  Search,
  Sun,
  Moon,
  Shuffle,
  SkipBack,
  SkipForward,
  Volume2,
  Upload,
  X,
} from "lucide-react";
import { useState, type FormEvent } from "react";

const genres = [
  {
    name: "Electronic",
    description: "Synths, beats & future sounds",
    color: "from-pink-400 to-pink-600",
  },
  {
    name: "Hip-Hop",
    description: "Beats, bars & underground",
    color: "from-pink-400 to-pink-600",
  },
  {
    name: "R&B",
    description: "Smooth nights & soulful vibes",
    color: "from-pink-400 to-stone-700",
  },
  {
    name: "Ambient",
    description: "Atmospheric sounds to focus",
    color: "from-stone-300 to-pink-600",
  },
];

const eqBands = EQ_FREQUENCIES.map((frequency) => ({
  frequency: String(frequency),
  label: frequency >= 1000 ? `${frequency / 1000} kHz` : `${frequency} Hz`,
}));

function ArtistAvatar({ size = "large" }: { size?: "small" | "large" }) {
  const [imageIndex, setImageIndex] = useState(0);
  const candidates = [
    "/avatar/avatar.png",
    "/avatar/avatar.jpg",
    "/avatar/avatar.jpeg",
    "/avatar/avatar.webp",
    "/avatar/avatar.gif",
  ];
  const src = candidates[imageIndex];
  const dimensions = size === "large" ? "h-32 w-32 sm:h-40 sm:w-40" : "h-11 w-11";

  return (
    <div className={`relative flex ${dimensions} shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-pink-400 via-stone-500 to-pink-700`}>
      {src ? (
        <img
          src={src}
          alt="королевски 17 avatar"
          className="h-full w-full object-cover"
          onError={() => setImageIndex((index) => index + 1)}
        />
      ) : (
        <div className="flex items-end gap-[2px]">
          {[8, 14, 20, 11, 17].map((height, index) => (
            <span key={index} className={`w-[2px] rounded-full bg-black/70 ${size === "large" ? "sm:w-2" : ""}`} style={{ height: size === "large" ? height * 2.1 : height }} />
          ))}
        </div>
      )}
    </div>
  );
}

function Logo() {
  return (
    <div className="flex items-center gap-3">
      <div className="logo-mark flex h-10 w-10 items-center justify-center rounded-xl bg-pink-400 shadow-[0_0_30px_rgba(245,196,81,0.18)]">
        <div className="flex items-end gap-[3px]">
          <span className="logo-bar h-3 w-[3px] rounded-full bg-black" />
          <span className="logo-bar h-5 w-[3px] rounded-full bg-black" />
          <span className="logo-bar h-7 w-[3px] rounded-full bg-black" />
          <span className="logo-bar h-4 w-[3px] rounded-full bg-black" />
          <span className="logo-bar h-6 w-[3px] rounded-full bg-black" />
        </div>
      </div>

      <span className="rhythmic-wordmark text-xl font-bold tracking-tight">
        Rhythmic.
      </span>
    </div>
  );
}

function Equalizer({
  open,
  onClose,
  preset,
  bands,
  presets,
  onPreset,
  onBand,
  engine,
}: {
  open: boolean;
  onClose: () => void;
  preset: string;
  bands: number[];
  presets: Record<string, number[]>;
  onPreset: (name: string) => void;
  onBand: (index: number, value: number) => void;
  engine: import("./audio/audioEngine").AudioEngine | null;
}) {
  if (!open) return null;

  return (
    <div className="absolute bottom-[calc(100%+12px)] right-4 w-[min(680px,calc(100vw-32px))] overflow-hidden rounded-3xl border border-white/[0.08] bg-[#242424]/98 p-5 shadow-2xl backdrop-blur-2xl">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-white">Equalizer</h3>
          <p className="mt-1 text-xs text-zinc-600">Real-time Web Audio EQ</p>
        </div>
        <button onClick={onClose} className="rounded-lg p-2 text-zinc-600 hover:bg-white/[0.05] hover:text-white">
          <X size={17} />
        </button>
      </div>

      <div className="mb-4 rounded-2xl border border-white/[0.05] bg-black/20 px-3 py-2">
        <Spectrum engine={engine} />
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {Object.keys(presets).map((name) => (
          <button key={name} onClick={() => onPreset(name)} className={`rounded-lg px-3 py-1.5 text-[11px] transition ${preset === name ? "bg-pink-400 text-black" : "bg-white/[0.04] text-zinc-500 hover:text-white"}`}>
            {name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-10 gap-3">
        {eqBands.map((band, index) => (
          <div key={band.frequency} className="flex flex-col items-center">
            <div className="relative h-36">
              <input type="range" min="-12" max="12" step="0.5" value={bands[index] ?? 0} onChange={(e) => onBand(index, Number(e.target.value))} className="eq-slider absolute left-1/2 top-1/2 h-32 w-2 -translate-x-1/2 -translate-y-1/2" style={{ writingMode: "vertical-lr", direction: "rtl" }} />
            </div>
            <span className="text-[9px] text-zinc-600">{band.label}</span>
            <span className="mt-1 text-[9px] tabular-nums text-zinc-500">{bands[index] > 0 ? "+" : ""}{bands[index]} dB</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const minutes = Math.floor(seconds / 60);
  const remaining = Math.floor(seconds % 60);
  return `${minutes}:${remaining.toString().padStart(2, "0")}`;
}

function parseDuration(value: string) {
  const [minutes, seconds] = value.split(":").map(Number);
  return minutes * 60 + seconds;
}

export default function App() {
  const [page, setPage] = useState<"home" | "profile" | "library" | "liked" | "notifications" | "playlists">("home");
  const [theme, setTheme] = useState<"light" | "dark">(() => localStorage.getItem("rhythmic-theme") === "dark" ? "dark" : "light");
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>("signIn");
  const [likedIds, setLikedIds] = useState<number[]>(() => {
    try { return JSON.parse(localStorage.getItem("rhythmic-liked") || "[]"); } catch { return []; }
  });
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadType, setUploadType] = useState<UploadType>("track");
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadArtist, setUploadArtist] = useState("королевски 17");
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [uploadMessage, setUploadMessage] = useState("");
  const [playlistName, setPlaylistName] = useState("");
  const [playlistType, setPlaylistType] = useState<PlaylistType>("Playlist");
  const [playlistDialog, setPlaylistDialog] = useState(false);
  const [playlists, setPlaylists] = useState<{id:number;name:string;type:"Playlist"|"Album";trackIds:number[]}[]>(() => {
    try { return JSON.parse(localStorage.getItem("rhythmic-playlists") || '[{"id":1,"name":"Night drive","type":"Playlist","trackIds":[1,2]},{"id":2,"name":"Favorites","type":"Playlist","trackIds":[3,4]}]'); } catch { return []; }
  });
  const [eqOpen, setEqOpen] = useState(false);
  const [playlistOpen, setPlaylistOpen] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const {
    engine,
    playingId,
    currentId,
    currentTime,
    duration,
    volume,
    error: audioError,
    isPlaying,
    playTrack,
    togglePlay,
    seek,
    setVolume,
    next,
    previous,
  } = useAudioPlayer(tracks);

  const { preset, bands, presets, setBand, selectPreset } = useEqualizer(engine);
  const currentTrack = tracks.find((track) => track.id === currentId) ?? tracks[0];
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const toggleLikeTrack = (id: number) => {
    setLikedIds((current) => {
      const next = current.includes(id) ? current.filter((item) => item !== id) : [...current, id];
      localStorage.setItem("rhythmic-liked", JSON.stringify(next));
      return next;
    });
  };

  const savePlaylists = (next: typeof playlists) => {
    setPlaylists(next);
    localStorage.setItem("rhythmic-playlists", JSON.stringify(next));
  };

  const openPage = (next: typeof page) => {
    setPage(next);
    setMobileMenu(false);
  };

  const handleUpload = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!uploadTitle.trim() || uploadFiles.length === 0) {
      setUploadMessage("Укажи название и выбери аудиофайл.");
      return;
    }
    setUploadMessage("Файлы выбраны. Для публикации на сервере нужен подключённый backend; сейчас это локальный интерфейс загрузки.");
  };

  const handlePlayTrack = async (id: number) => {
    const track = tracks.find((item) => item.id === id);
    if (track) await playTrack(track);
  };

  return (
    <div className="app-shell min-h-screen bg-[#202020] text-white" data-theme={theme}>
      
      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-[250px] border-r border-white/[0.06] bg-[#242424] lg:block">
        <div className="flex h-full flex-col px-5 py-6">
          <button
            type="button"
            onClick={() => window.location.reload()}
            aria-label="Вернуться на главную и обновить страницу"
            className="flex w-full justify-center rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-pink-400/40"
          >
            <Logo />
          </button>

          <div className="mt-10">
            <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-700">
              Discover
            </p>

            <div className="space-y-1">
              <NavItem
                icon={Home}
                active={page === "home"}
                onClick={() => openPage("home")}
              >
                Home
              </NavItem>

              <NavItem icon={Compass} onClick={() => openPage("home")}>Explore</NavItem>

              <NavItem icon={Bell} active={page === "notifications"} onClick={() => openPage("notifications")}>Notifications</NavItem>
            </div>
          </div>

          <div className="mt-8">
            <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-700">
              Your music
            </p>

            <div className="space-y-1">
              <NavItem icon={Library} active={page === "library"} onClick={() => openPage("library")}>Library</NavItem>
              <NavItem icon={ListMusic} active={page === "playlists"} onClick={() => openPage("playlists")}>Playlists / albums</NavItem>
              <NavItem icon={Heart} active={page === "liked"} onClick={() => openPage("liked")}>Liked tracks</NavItem>
            </div>
          </div>

          <div className="mt-auto space-y-3">
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.025] p-4">
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-pink-400/10 text-pink-400">
                <Upload size={17} />
              </div>

              <p className="text-sm font-medium text-white">Upload music</p>
              <p className="mt-1 text-xs leading-5 text-zinc-600">
                Share your sound with the world.
              </p>

              <button onClick={() => { setUploadType("track"); setUploadOpen(true); }} className="upload-track-button mt-4 w-full rounded-xl bg-pink-400 py-2 text-xs font-semibold text-[#191714] transition hover:bg-pink-300">Upload track / album</button>
            </div>

            <button
              onClick={() => setPage("profile")}
              className="group w-full rounded-2xl border border-white/[0.07] bg-white/[0.035] p-3 text-left transition hover:border-pink-400/20 hover:bg-pink-400/[0.05]"
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <ArtistAvatar size="small" />
                  <span className="absolute bottom-0.5 right-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#242424] bg-pink-300" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <p className="truncate text-sm font-semibold text-white">
                      королевски 17
                    </p>
                  </div>
                  <p className="mt-0.5 truncate text-[10px] text-zinc-600">
                    View profile · Artist
                  </p>
                </div>

                <ChevronDown
                  size={15}
                  className="rotate-[-90deg] text-zinc-700 transition group-hover:text-pink-400"
                />
              </div>
            </button>
          </div>
        </div>
      </aside>

      
      {mobileMenu && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div
            className="absolute inset-0 bg-black/70"
            onClick={() => setMobileMenu(false)}
          />

          <aside className="relative h-full w-[280px] border-r border-white/[0.06] bg-[#242424] p-5">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => window.location.reload()}
                aria-label="Вернуться на главную и обновить страницу"
                className="flex w-full justify-center rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-pink-400/40"
              >
                <Logo />
              </button>

              <button
                onClick={() => setMobileMenu(false)}
                className="rounded-lg p-2 text-zinc-600 hover:text-white"
              >
                <X size={19} />
              </button>
            </div>

            <div className="mt-10 space-y-1">
              <NavItem
                icon={Home}
                active={page === "home"}
                onClick={() => {
                  setPage("home");
                  setMobileMenu(false);
                }}
              >
                Home
              </NavItem>
              <NavItem icon={Compass} onClick={() => openPage("home")}>Explore</NavItem>
              <NavItem icon={Bell} onClick={() => openPage("notifications")}>Notifications</NavItem>
              <NavItem icon={Library} onClick={() => openPage("library")}>Library</NavItem>
              <NavItem icon={ListMusic} onClick={() => openPage("playlists")}>Playlists / albums</NavItem>
              <NavItem icon={Heart} onClick={() => openPage("liked")}>Liked tracks</NavItem>
            </div>

            <button
              onClick={() => {
                setPage("profile");
                setMobileMenu(false);
              }}
              className="absolute bottom-5 left-5 right-5 flex items-center gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.035] p-3 text-left transition hover:border-pink-400/20 hover:bg-pink-400/[0.05]"
            >
              <ArtistAvatar size="small" />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">королевски 17</p>
                <p className="mt-0.5 truncate text-[10px] text-zinc-600">View profile · Artist</p>
              </div>
            </button>
          </aside>
        </div>
      )}

      
      <main className="pb-32 lg:ml-[250px]">
        
        <header className="animated-header sticky top-0 z-30 flex h-[76px] items-center border-b border-white/[0.05] px-4 backdrop-blur-xl lg:px-8">
          <div className="header-ribbons" aria-hidden="true">
            <svg viewBox="0 0 1440 150" preserveAspectRatio="none" role="presentation">
              <path d="M-80 24 C 40 2, 80 80, 190 50 S 330 8, 430 42 S 570 112, 690 66 S 850 5, 970 46 S 1120 118, 1240 65 S 1380 22, 1520 54" />
              <path d="M-80 40 C 35 74, 115 12, 220 42 S 365 98, 465 56 S 605 2, 730 48 S 875 110, 990 56 S 1135 8, 1260 42 S 1410 94, 1520 30" />
              <path d="M-80 62 C 40 35, 95 118, 215 73 S 350 32, 475 78 S 620 128, 745 70 S 895 22, 1010 76 S 1155 126, 1280 72 S 1410 36, 1520 80" />
              <path d="M-80 80 C 40 110, 120 44, 240 82 S 385 132, 505 84 S 645 38, 765 90 S 910 136, 1030 82 S 1170 42, 1300 92 S 1430 124, 1520 74" />
              <path d="M-80 96 C 45 70, 105 145, 230 100 S 380 54, 500 104 S 645 145, 775 102 S 925 60, 1045 105 S 1190 146, 1315 100 S 1430 74, 1520 110" />
              <path d="M-80 112 C 40 145, 135 82, 255 112 S 405 150, 525 114 S 675 80, 795 118 S 940 152, 1060 112 S 1210 82, 1330 120 S 1440 145, 1520 105" />
              <path d="M-80 16 C 70 48, 100 5, 255 30 S 390 66, 545 28 S 700 2, 835 34 S 980 74, 1125 30 S 1290 6, 1520 35" />
              <path d="M-80 132 C 55 104, 130 152, 280 128 S 435 102, 570 132 S 730 150, 865 128 S 1030 105, 1170 132 S 1360 150, 1520 125" />
            </svg>
          </div>
          <button
            onClick={() => setMobileMenu(true)}
            className="rounded-xl p-2 text-zinc-500 hover:bg-white/[0.05] hover:text-white lg:hidden"
          >
            <Menu size={20} />
          </button>

          
          <div className="header-search-container absolute left-1/2 top-1/2 z-10 w-[min(500px,45vw)] -translate-x-1/2 -translate-y-1/2 max-lg:hidden">
            <div className="header-search-surface relative rounded-xl">
              <Search
                size={17}
                className="header-search-icon absolute left-4 top-1/2 -translate-y-1/2"
              />

              <input
                placeholder="Search tracks, artists and genres..."
                className="header-search-input h-11 w-full rounded-xl border border-white/[0.07] pl-11 pr-4 text-sm outline-none transition placeholder:text-zinc-500 focus:border-pink-400/30"
              />
            </div>
          </div>

          
          <div className="header-mobile-search ml-3 flex flex-1 lg:hidden">
            <div className="relative w-full max-w-[300px]">
              <Search
                size={16}
                className="header-search-icon absolute left-3 top-1/2 -translate-y-1/2"
              />
              <input
                placeholder="Search..."
                className="header-search-input h-10 w-full rounded-xl border border-white/[0.06] pl-9 text-sm outline-none placeholder:text-zinc-500"
              />
            </div>
          </div>

          
          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              aria-label={theme === "light" ? "Включить тёмную тему" : "Включить светлую тему"}
              title={theme === "light" ? "Тёмная тема" : "Светлая тема"}
              onClick={() => { const nextTheme = theme === "light" ? "dark" : "light"; setTheme(nextTheme); localStorage.setItem("rhythmic-theme", nextTheme); }}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04] text-pink-500 transition duration-300 hover:rotate-12 hover:bg-pink-400/10"
            >
              {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
            </button>
            <button onClick={() => { setAuthMode("signIn"); setAuthOpen(true); }} className="header-action-button hidden rounded-xl px-4 py-2 text-sm transition hover:bg-white/[0.04] sm:block">
              Sign in
            </button>

            <button onClick={() => { setAuthMode("signUp"); setAuthOpen(true); }} className="header-action-button rounded-xl bg-pink-200 px-4 py-2 text-sm font-semibold transition hover:bg-pink-300">
              Sign up
            </button>
          </div>
        </header>

        <div key={page} className="page-transition">
        {page === "library" || page === "liked" || page === "notifications" || page === "playlists" ? (
          <MusicPages
            page={page}
            tracks={tracks}
            likedIds={likedIds}
            playlists={playlists}
            playingId={playingId}
            audioError={audioError}
            onPageChange={openPage}
            onPlay={(id) => void handlePlayTrack(id)}
            onLike={toggleLikeTrack}
            onCreatePlaylist={() => setPlaylistDialog(true)}
            onDeletePlaylist={(id) => savePlaylists(playlists.filter((item) => item.id !== id))}
            onTogglePlaylistTrack={(playlistId, trackId) => savePlaylists(playlists.map((item) => item.id === playlistId ? { ...item, trackIds: item.trackIds.includes(trackId) ? item.trackIds.filter((id) => id !== trackId) : [...item.trackIds, trackId] } : item))}
          />
        ) : page === "profile" ? (
          <ProfilePage
            tracks={tracks}
            currentId={currentId}
            isPlaying={isPlaying}
            onPlayTrack={(id) => void handlePlayTrack(id)}
          />
        ) : (
          <>
        
        <section className="relative overflow-hidden border-b border-white/[0.05] px-5 py-16 lg:px-10 lg:py-20">
          <div className="pointer-events-none absolute -right-40 -top-40 h-[500px] w-[500px] rounded-full bg-pink-400/[0.06] blur-3xl" />
          <div className="pointer-events-none absolute -left-40 bottom-[-250px] h-[500px] w-[500px] rounded-full bg-stone-500/[0.04] blur-3xl" />

          <div className="relative max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-pink-400/10 bg-pink-400/[0.05] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-pink-400">
              <span className="h-1.5 w-1.5 rounded-full bg-pink-400 shadow-[0_0_10px_#ec4899]" />
              Discover new sound
            </div>

            <h1 className="text-4xl font-bold tracking-[-0.04em] text-white sm:text-5xl lg:text-6xl">
              Music for
              <br />
              <span className="text-pink-400">every moment.</span>
            </h1>

            <p className="mt-6 max-w-xl text-sm leading-7 text-zinc-500 sm:text-base">
              Discover independent artists, underground gems and sounds you
              won't find anywhere else.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <button className="flex items-center gap-2 rounded-xl bg-pink-400 px-5 py-3 text-sm font-semibold text-black transition hover:bg-pink-300">
                <Play size={16} fill="currentColor" />
                Start listening
              </button>

              <button className="rounded-xl border border-white/[0.08] bg-white/[0.02] px-5 py-3 text-sm text-zinc-400 transition hover:bg-white/[0.05] hover:text-white">
                Explore genres
              </button>
            </div>
          </div>
        </section>

        
        <div className="px-5 py-10 lg:px-10">
          
          <section>
            <div className="mb-5 flex items-end justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-pink-400">
                  Trending now
                </p>

                <h2 className="mt-2 text-2xl font-bold tracking-tight text-white">
                  What's playing
                </h2>
              </div>

              <button className="text-xs text-zinc-600 transition hover:text-pink-400">
                View all
              </button>
            </div>

            <div className="overflow-x-auto">
              <div className="min-w-[850px] space-y-1">
                {tracks.map((track) => (
                  <TrackRow
                    key={track.id}
                    track={track}
                    active={track.id === playingId}
                    liked={likedIds.includes(track.id)}
                    onPlay={() => handlePlayTrack(track.id)}
                    onLike={() => toggleLikeTrack(track.id)}
                            />
                ))}
              </div>
            </div>
          </section>

          
          <section className="mt-14">
            <div className="mb-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-pink-400">
                Browse
              </p>

              <h2 className="mt-2 text-2xl font-bold tracking-tight text-white">
                Explore genres
              </h2>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {genres.map((genre) => (
                <button
                  key={genre.name}
                  className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 text-left transition hover:-translate-y-0.5 hover:border-white/[0.1] hover:bg-white/[0.04]"
                >
                  <div
                    className={`absolute -right-10 -top-10 h-28 w-28 rounded-full bg-gradient-to-br ${genre.color} opacity-10 blur-2xl transition group-hover:opacity-20`}
                  />

                  <div
                    className={`mb-8 h-1 w-10 rounded-full bg-gradient-to-r ${genre.color}`}
                  />

                  <h3 className="font-semibold text-white">{genre.name}</h3>
                  <p className="mt-1 text-xs text-zinc-600">
                    {genre.description}
                  </p>

                  <div className="mt-5 flex items-center gap-1 text-[10px] font-medium uppercase tracking-wider text-zinc-700 transition group-hover:text-pink-400">
                    Explore
                    <ChevronDown
                      size={12}
                      className="-rotate-90 transition group-hover:translate-x-1"
                    />
                  </div>
                </button>
              ))}
            </div>
          </section>
        </div>
          </>
        )}
        </div>

      </main>

      <AuthDialog
        open={authOpen}
        mode={authMode}
        theme={theme}
        onModeChange={setAuthMode}
        onClose={() => setAuthOpen(false)}
      />

      <PlaylistDialog
        open={playlistDialog}
        name={playlistName}
        type={playlistType}
        onNameChange={setPlaylistName}
        onTypeChange={setPlaylistType}
        onClose={() => setPlaylistDialog(false)}
        onCreate={() => {
          if (!playlistName.trim()) return;
          savePlaylists([...playlists, { id: Date.now(), name: playlistName.trim(), type: playlistType, trackIds: currentId ? [currentId] : [] }]);
          setPlaylistName("");
          setPlaylistDialog(false);
        }}
        userId={localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user") || "{}").id : undefined}
      />

      <UploadMusicDialog
        open={uploadOpen}
        type={uploadType}
        title={uploadTitle}
        artist={uploadArtist}
        files={uploadFiles}
        message={uploadMessage}
        onTypeChange={setUploadType}
        onTitleChange={setUploadTitle}
        onArtistChange={setUploadArtist}
        onFilesChange={setUploadFiles}
        onClose={() => { setUploadOpen(false); setUploadMessage(""); }}
        onSubmit={handleUpload}
        userId={localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user") || "{}").id : undefined}
      />

      
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/[0.07] bg-[#202020]/98 backdrop-blur-2xl lg:left-[250px]">
        <div className="relative mx-auto max-w-[1600px] px-4 py-3 lg:px-6">
          {audioError && <div className="mb-2 rounded-xl border border-red-400/10 bg-red-400/[0.04] px-3 py-2 text-[10px] text-red-300">{audioError}</div>}
          <Equalizer open={eqOpen} onClose={() => setEqOpen(false)} preset={preset} bands={bands} presets={presets} onPreset={selectPreset} onBand={setBand} engine={engine} />

          <div className="grid grid-cols-[minmax(280px,1fr)_auto_minmax(280px,1fr)] items-center gap-6">
            
            <div className="flex min-w-0 items-center gap-4">
              <Cover track={currentTrack} size="player" />

              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">
                  {currentTrack.title}
                </p>

                <p className="mt-1 truncate text-xs text-zinc-500">
                  {currentTrack.artist}
                </p>

                <div className="mt-2">
                  <span className="rounded-full bg-white/[0.04] px-2 py-1 text-[9px] text-zinc-600">
                    {currentTrack.genre}
                  </span>
                </div>
              </div>

              
              <div className="relative ml-2">
                <button
                  onClick={() => setPlaylistOpen((value) => !value)}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.025] text-zinc-500 transition hover:border-pink-400/20 hover:bg-pink-400/10 hover:text-pink-400"
                >
                  <Plus size={17} />
                </button>

                {playlistOpen && (
                  <div className="absolute bottom-12 left-0 w-48 overflow-hidden rounded-2xl border border-white/[0.08] bg-[#2b2b2b] p-1.5 shadow-2xl">
                    <p className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-700">
                      Add to playlist
                    </p>

                    {["Liked songs", ...playlists.map((item) => item.name)].map(
                      (playlist) => (
                        <button
                          key={playlist}
                          onClick={() => { setPlaylistOpen(false); savePlaylists(playlists.map((p) => p.name === playlist ? {...p, trackIds: p.trackIds.includes(currentTrack.id) ? p.trackIds : [...p.trackIds, currentTrack.id]} : p)); }}
                          className="w-full rounded-xl px-3 py-2 text-left text-xs text-zinc-400 transition hover:bg-white/[0.05] hover:text-white"
                        >
                          {playlist}
                        </button>
                      ),
                    )}

                    <div className="my-1 border-t border-white/[0.05]" />

                    <button
                      onClick={() => { setPlaylistOpen(false); setPlaylistDialog(true); }}
                      className="w-full rounded-xl px-3 py-2 text-left text-xs text-pink-400 transition hover:bg-pink-400/[0.06]"
                    >
                      + New playlist
                    </button>
                  </div>
                )}
              </div>
            </div>

            
            <div className="flex flex-col items-center">
              <div className="flex items-center justify-center gap-2">
                <button className="hidden rounded-lg p-2 text-zinc-700 transition hover:text-white sm:block">
                  <Shuffle size={15} />
                </button>

                <button
                  onClick={() => void previous()}
                  className="rounded-lg p-2 text-zinc-400 transition hover:text-white"
                >
                  <SkipBack size={18} fill="currentColor" />
                </button>

                <button
                  onClick={() => void togglePlay(currentTrack)}
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-pink-400 text-black shadow-[0_0_25px_rgba(245,196,81,0.18)] transition hover:scale-105 hover:bg-pink-300"
                >
                  {isPlaying ? (
                    <Pause size={18} fill="currentColor" />
                  ) : (
                    <Play size={18} fill="currentColor" />
                  )}
                </button>

                <button
                  onClick={() => void next()}
                  className="rounded-lg p-2 text-zinc-400 transition hover:text-white"
                >
                  <SkipForward size={18} fill="currentColor" />
                </button>

                <button className="hidden rounded-lg p-2 text-zinc-700 transition hover:text-white sm:block">
                  <Repeat2 size={16} />
                </button>
              </div>

              
              <div className="mt-2 flex w-[340px] max-w-[38vw] items-center gap-2">
                <span className="w-7 text-right text-[9px] tabular-nums text-zinc-600">
                  {formatTime(currentTime)}
                </span>

                <div className="relative flex-1">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="0.1"
                    value={progress}
                    onChange={(e) => seek(Number(e.target.value))}
                    className="progress-slider relative z-10 w-full"
                  />

                  <div className="pointer-events-none absolute left-0 right-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-white/[0.08]" />

                  <div
                    className="pointer-events-none absolute left-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-pink-400"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                <span className="w-7 text-[9px] tabular-nums text-zinc-600">
                  {formatTime(duration || parseDuration(currentTrack.duration))}
                </span>
              </div>
            </div>

            
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => toggleLikeTrack(currentTrack.id)}
                className={`flex h-9 w-9 items-center justify-center rounded-xl transition ${
                  likedIds.includes(currentTrack.id)
                    ? "bg-pink-400/10 text-pink-400"
                    : "text-zinc-600 hover:bg-white/[0.04] hover:text-white"
                }`}
              >
                <Heart size={17} fill={likedIds.includes(currentTrack.id) ? "currentColor" : "none"} />
              </button>

              <button
                onClick={() => setEqOpen((value) => !value)}
                className={`rounded-xl px-3 py-2 text-[10px] font-semibold uppercase tracking-wider transition ${
                  eqOpen
                    ? "bg-pink-400/10 text-pink-400"
                    : "text-zinc-600 hover:bg-white/[0.04] hover:text-white"
                }`}
              >
                EQ
              </button>

              <div className="hidden items-center gap-2 md:flex">
                <Volume2 size={16} className="text-zinc-600" />

                <input
                  type="range"
                  min="0"
                  max="100"
                  value={Math.round(volume * 100)}
                  onChange={(e) => setVolume(Number(e.target.value))}
                  className="volume-slider w-20"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      
      <style>{`
        .progress-slider,
        .volume-slider,
        .eq-slider {
          appearance: none;
          background: transparent;
          cursor: pointer;
        }

        .progress-slider {
          height: 16px;
        }

        .progress-slider::-webkit-slider-runnable-track {
          height: 4px;
          background: transparent;
        }

        .progress-slider::-moz-range-track {
          height: 4px;
          background: transparent;
        }

        .progress-slider::-webkit-slider-thumb {
          appearance: none;
          width: 10px;
          height: 10px;
          margin-top: -3px;
          border-radius: 999px;
          background: #ec4899;
          border: 0;
          box-shadow: 0 0 10px rgba(52, 211, 153, 0.45);
        }

        .progress-slider::-moz-range-thumb {
          width: 10px;
          height: 10px;
          border-radius: 999px;
          background: #ec4899;
          border: 0;
        }

        .volume-slider {
          height: 16px;
        }

        .volume-slider::-webkit-slider-runnable-track {
          height: 3px;
          border-radius: 999px;
          background: rgba(255,255,255,0.1);
        }

        .volume-slider::-moz-range-track {
          height: 3px;
          border-radius: 999px;
          background: rgba(255,255,255,0.1);
        }

        .volume-slider::-webkit-slider-thumb {
          appearance: none;
          width: 8px;
          height: 8px;
          margin-top: -2.5px;
          border-radius: 999px;
          background: #ec4899;
          border: 0;
        }

        .volume-slider::-moz-range-thumb {
          width: 8px;
          height: 8px;
          border-radius: 999px;
          background: #ec4899;
          border: 0;
        }

        .eq-slider {
          appearance: none;
          background: transparent;
        }

        .eq-slider::-webkit-slider-runnable-track {
          width: 4px;
          border-radius: 999px;
          background: rgba(255,255,255,0.08);
        }

        .eq-slider::-moz-range-track {
          width: 4px;
          border-radius: 999px;
          background: rgba(255,255,255,0.08);
        }

        .eq-slider::-webkit-slider-thumb {
          appearance: none;
          width: 12px;
          height: 12px;
          margin-left: -4px;
          border-radius: 999px;
          background: #ec4899;
          border: 0;
          box-shadow: 0 0 10px rgba(245,196,81,0.35);
        }

        .eq-slider::-moz-range-thumb {
          width: 12px;
          height: 12px;
          border-radius: 999px;
          background: #ec4899;
          border: 0;
        }

        * {
          scrollbar-width: thin;
          scrollbar-color: rgba(255,255,255,0.08) transparent;
        }

        ::selection {
          background: rgba(245,196,81,0.25);
          color: white;
        }
      `}</style>
    </div>
  );
}
