import ProfilePage from "./ProfilePage";
import { tracks } from "./data/tracks";
import { useAudioPlayer } from "./hooks/useAudioPlayer";
import type { Track } from "./types/track";

import {
  Bell,
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
  Shuffle,
  SkipBack,
  SkipForward,
  Volume2,
  Upload,
  X,
} from "lucide-react";
import { useState } from "react";

const genres = [
  {
    name: "Electronic",
    description: "Synths, beats & future sounds",
    color: "from-emerald-400 to-cyan-500",
  },
  {
    name: "Hip-Hop",
    description: "Beats, bars & underground",
    color: "from-lime-400 to-emerald-600",
  },
  {
    name: "R&B",
    description: "Smooth nights & soulful vibes",
    color: "from-teal-400 to-green-700",
  },
  {
    name: "Ambient",
    description: "Atmospheric sounds to focus",
    color: "from-green-300 to-teal-600",
  },
];

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
    <div className={`relative flex ${dimensions} shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-emerald-400 via-green-500 to-teal-700`}>
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
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400 shadow-[0_0_30px_rgba(52,211,153,0.18)]">
        <div className="flex items-end gap-[3px]">
          <span className="h-3 w-[3px] rounded-full bg-black" />
          <span className="h-5 w-[3px] rounded-full bg-black" />
          <span className="h-7 w-[3px] rounded-full bg-black" />
          <span className="h-4 w-[3px] rounded-full bg-black" />
          <span className="h-6 w-[3px] rounded-full bg-black" />
        </div>
      </div>

      <span className="text-xl font-bold tracking-tight text-white">
        Rhythmic<span className="text-emerald-400">.</span>
      </span>
    </div>
  );
}

function Cover({
  track,
  size = "small",
}: {
  track: Track;
  size?: "small" | "medium" | "player";
}) {
  const sizes = {
    small: "h-14 w-14 rounded-xl",
    medium: "h-20 w-20 rounded-2xl",
    player: "h-[72px] w-[72px] rounded-2xl",
  };

  const coverCandidates = [
    track.cover,
    `/covers/${track.id}.jpg`,
    `/covers/${track.id}.jpeg`,
    `/covers/${track.id}.png`,
    `/covers/${track.id}.webp`,
    `/covers/${track.id}.gif`,
  ].filter(Boolean) as string[];

  const [coverIndex, setCoverIndex] = useState(0);
  const coverSrc = coverCandidates[coverIndex];

  if (coverSrc) {
    return (
      <div className={`relative shrink-0 overflow-hidden ${sizes[size]} bg-zinc-900`}>
        <img
          src={coverSrc}
          alt={`${track.title} cover`}
          className="h-full w-full object-cover"
          onError={() => {
            setCoverIndex((index) => index + 1);
          }}
        />
      </div>
    );
  }

  return (
    <div
      className={`relative shrink-0 overflow-hidden bg-gradient-to-br ${track.color} ${sizes[size]}`}
    >
      <div className="absolute inset-0 opacity-30">
        <div className="absolute -right-5 -top-5 h-24 w-24 rounded-full border-[12px] border-black/40" />
        <div className="absolute -bottom-8 -left-3 h-24 w-24 rounded-full border-[10px] border-black/30" />
      </div>

      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex items-end gap-[3px]">
          {[12, 20, 28, 16, 34, 23, 30, 15].map((height, index) => (
            <span
              key={index}
              className="w-[3px] rounded-full bg-black/70"
              style={{ height }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function Waveform({
  active = false,
  compact = false,
}: {
  active?: boolean;
  compact?: boolean;
}) {
  const bars = Array.from({ length: compact ? 28 : 45 }, (_, index) => {
    const value =
      12 +
      Math.abs(Math.sin(index * 1.7)) * 18 +
      Math.abs(Math.cos(index * 0.45)) * 8;

    return Math.round(value);
  });

  return (
    <div className="flex h-10 items-center gap-[2px] overflow-hidden">
      {bars.map((height, index) => (
        <span
          key={index}
          className={`w-[2px] shrink-0 rounded-full transition-all ${
            active && index < bars.length * 0.46
              ? "bg-emerald-400"
              : "bg-white/10"
          }`}
          style={{ height }}
        />
      ))}
    </div>
  );
}

function NavItem({
  icon: Icon,
  children,
  active = false,
  onClick,
}: {
  icon: React.ElementType;
  children: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
        active
          ? "bg-emerald-400/10 text-emerald-300"
          : "text-zinc-500 hover:bg-white/[0.04] hover:text-white"
      }`}
    >
      <Icon
        size={18}
        className={
          active
            ? "text-emerald-400"
            : "text-zinc-600 group-hover:text-zinc-300"
        }
      />
      <span>{children}</span>
    </button>
  );
}

function TrackRow({
  track,
  active,
  liked,
  onPlay,
  onLike,
}: {
  track: Track;
  active: boolean;
  liked: boolean;
  onPlay: () => void;
  onLike: () => void;
}) {
  return (
    <div
      className={`group grid grid-cols-[auto_minmax(180px,1fr)_180px_100px_90px] items-center gap-5 rounded-2xl border px-4 py-3 transition ${
        active
          ? "border-emerald-400/20 bg-emerald-400/[0.05]"
          : "border-transparent hover:border-white/[0.06] hover:bg-white/[0.025]"
      }`}
    >
      <div className="relative">
        <button onClick={onPlay} className="relative block">
          <Cover track={track} />

          <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/45 opacity-0 transition group-hover:opacity-100">
            {active ? (
              <Pause size={18} fill="white" />
            ) : (
              <Play size={18} fill="white" />
            )}
          </div>
        </button>

      </div>

      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="truncate text-sm font-semibold text-white">
            {track.title}
          </h3>

          {active && (
            <span className="rounded-full bg-emerald-400/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-emerald-400">
              Playing
            </span>
          )}
        </div>

        <p className="mt-1 truncate text-xs text-zinc-500">{track.artist}</p>
      </div>

      <Waveform active={active} compact />

      <div>
        <span className="rounded-full bg-white/[0.04] px-2.5 py-1 text-[10px] text-zinc-500">
          {track.genre}
        </span>
      </div>

      <div className="flex items-center justify-end gap-3">
        <span className="text-xs text-zinc-600">{track.plays}</span>

        <button
          onClick={onLike}
          className={`transition ${
            liked
              ? "text-emerald-400"
              : "text-zinc-700 hover:text-emerald-400"
          }`}
        >
          <Heart size={16} fill={liked ? "currentColor" : "none"} />
        </button>

        <button className="text-zinc-700 transition hover:text-white">
          <MoreHorizontal size={17} />
        </button>
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
  const [page, setPage] = useState<"home" | "profile">("home");
  const [liked, setLiked] = useState(false);
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

  const currentTrack = tracks.find((track) => track.id === currentId) ?? tracks[0];
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handlePlayTrack = async (id: number) => {
    const track = tracks.find((item) => item.id === id);
    if (track) await playTrack(track);
  };

  return (
    <div className="min-h-screen bg-[#070a08] text-white">
      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-[250px] border-r border-white/[0.06] bg-[#090c0a] lg:block">
        <div className="flex h-full flex-col px-5 py-6">
          <button
            type="button"
            onClick={() => window.location.reload()}
            aria-label="Вернуться на главную и обновить страницу"
            className="block rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/40"
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
                onClick={() => setPage("home")}
              >
                Home
              </NavItem>

              <NavItem icon={Compass}>Explore</NavItem>

              <NavItem icon={Bell}>Notifications</NavItem>
            </div>
          </div>

          <div className="mt-8">
            <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-700">
              Your music
            </p>

            <div className="space-y-1">
              <NavItem icon={Library}>Library</NavItem>
              <NavItem icon={ListMusic}>Playlists</NavItem>
              <NavItem icon={Heart}>Liked tracks</NavItem>
            </div>
          </div>

          <div className="mt-auto space-y-3">
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.025] p-4">
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-400">
                <Upload size={17} />
              </div>

              <p className="text-sm font-medium text-white">Upload music</p>
              <p className="mt-1 text-xs leading-5 text-zinc-600">
                Share your sound with the world.
              </p>

              <button className="mt-4 w-full rounded-xl bg-white/[0.05] py-2 text-xs text-zinc-400 transition hover:bg-white/[0.08] hover:text-white">
                Upload track
              </button>
            </div>

            <button
              onClick={() => setPage("profile")}
              className="group w-full rounded-2xl border border-white/[0.07] bg-white/[0.035] p-3 text-left transition hover:border-emerald-400/20 hover:bg-emerald-400/[0.05]"
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <ArtistAvatar size="small" />
                  <span className="absolute bottom-0.5 right-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#0b0f0c] bg-emerald-300" />
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
                  className="rotate-[-90deg] text-zinc-700 transition group-hover:text-emerald-400"
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

          <aside className="relative h-full w-[280px] border-r border-white/[0.06] bg-[#090c0a] p-5">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => window.location.reload()}
                aria-label="Вернуться на главную и обновить страницу"
                className="block rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/40"
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
              <NavItem icon={Compass}>Explore</NavItem>
              <NavItem icon={Bell}>Notifications</NavItem>
              <NavItem icon={Library}>Library</NavItem>
              <NavItem icon={ListMusic}>Playlists</NavItem>
              <NavItem icon={Heart}>Liked tracks</NavItem>
            </div>

            <button
              onClick={() => {
                setPage("profile");
                setMobileMenu(false);
              }}
              className="absolute bottom-5 left-5 right-5 flex items-center gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.035] p-3 text-left transition hover:border-emerald-400/20 hover:bg-emerald-400/[0.05]"
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

        <header className="sticky top-0 z-30 flex h-[76px] items-center border-b border-white/[0.05] bg-[#070a08]/90 px-4 backdrop-blur-xl lg:px-8">
          <button
            onClick={() => setMobileMenu(true)}
            className="rounded-xl p-2 text-zinc-500 hover:bg-white/[0.05] hover:text-white lg:hidden"
          >
            <Menu size={20} />
          </button>

          <div className="absolute left-1/2 top-1/2 w-[min(500px,45vw)] -translate-x-1/2 -translate-y-1/2 max-lg:hidden">
            <div className="relative">
              <Search
                size={17}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600"
              />

              <input
                placeholder="Search tracks, artists and genres..."
                className="h-11 w-full rounded-xl border border-white/[0.07] bg-white/[0.025] pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-zinc-700 focus:border-emerald-400/30 focus:bg-white/[0.04]"
              />
            </div>
          </div>

          <div className="ml-3 flex flex-1 lg:hidden">
            <div className="relative w-full max-w-[300px]">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600"
              />
              <input
                placeholder="Search..."
                className="h-10 w-full rounded-xl border border-white/[0.06] bg-white/[0.025] pl-9 text-sm outline-none placeholder:text-zinc-700"
              />
            </div>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <button className="hidden rounded-xl px-4 py-2 text-sm text-zinc-500 transition hover:bg-white/[0.04] hover:text-white sm:block">
              Sign in
            </button>

            <button className="rounded-xl bg-emerald-400 px-4 py-2 text-sm font-semibold text-black transition hover:bg-emerald-300">
              Sign up
            </button>
          </div>
        </header>

        {page === "profile" ? (
          <div key="profile" className="page-transition">
          <ProfilePage
            tracks={tracks}
            currentId={currentId}
            isPlaying={isPlaying}
            onPlayTrack={(id) => void handlePlayTrack(id)}
          />
        </div>
        ) : (
          <div key="home" className="page-transition">
          <>
        <section className="relative overflow-hidden border-b border-white/[0.05] px-5 py-16 lg:px-10 lg:py-20">
          <div className="pointer-events-none absolute -right-40 -top-40 h-[500px] w-[500px] rounded-full bg-emerald-400/[0.06] blur-3xl" />
          <div className="pointer-events-none absolute -left-40 bottom-[-250px] h-[500px] w-[500px] rounded-full bg-green-500/[0.04] blur-3xl" />

          <div className="relative max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-400/10 bg-emerald-400/[0.05] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_#34d399]" />
              Discover new sound
            </div>

            <h1 className="text-4xl font-bold tracking-[-0.04em] text-white sm:text-5xl lg:text-6xl">
              Music for
              <br />
              <span className="text-emerald-400">every moment.</span>
            </h1>

            <p className="mt-6 max-w-xl text-sm leading-7 text-zinc-500 sm:text-base">
              Discover independent artists, underground gems and sounds you
              won't find anywhere else.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <button className="flex items-center gap-2 rounded-xl bg-emerald-400 px-5 py-3 text-sm font-semibold text-black transition hover:bg-emerald-300">
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
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-400">
                  Trending now
                </p>

                <h2 className="mt-2 text-2xl font-bold tracking-tight text-white">
                  What's playing
                </h2>
              </div>

              <button className="text-xs text-zinc-600 transition hover:text-emerald-400">
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
                    liked={liked && track.id === currentTrack.id}
                    onPlay={() => handlePlayTrack(track.id)}
                    onLike={() => setLiked((value) => !value)}
                            />
                ))}
              </div>
            </div>
          </section>

          <section className="mt-14">
            <div className="mb-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-400">
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

                  <div className="mt-5 flex items-center gap-1 text-[10px] font-medium uppercase tracking-wider text-zinc-700 transition group-hover:text-emerald-400">
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
          </div>
        )}

      </main>

      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/[0.07] bg-[#080b09]/98 backdrop-blur-2xl lg:left-[250px]">
        <div className="relative mx-auto max-w-[1600px] px-4 py-3 lg:px-6">
          {audioError && <div className="mb-2 rounded-xl border border-red-400/10 bg-red-400/[0.04] px-3 py-2 text-[10px] text-red-300">{audioError}</div>}

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
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.025] text-zinc-500 transition hover:border-emerald-400/20 hover:bg-emerald-400/10 hover:text-emerald-400"
                >
                  <Plus size={17} />
                </button>

                {playlistOpen && (
                  <div className="absolute bottom-12 left-0 w-48 overflow-hidden rounded-2xl border border-white/[0.08] bg-[#101411] p-1.5 shadow-2xl">
                    <p className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-700">
                      Add to playlist
                    </p>

                    {["Liked songs", "Night drive", "Favorites"].map(
                      (playlist) => (
                        <button
                          key={playlist}
                          onClick={() => setPlaylistOpen(false)}
                          className="w-full rounded-xl px-3 py-2 text-left text-xs text-zinc-400 transition hover:bg-white/[0.05] hover:text-white"
                        >
                          {playlist}
                        </button>
                      ),
                    )}

                    <div className="my-1 border-t border-white/[0.05]" />

                    <button
                      onClick={() => setPlaylistOpen(false)}
                      className="w-full rounded-xl px-3 py-2 text-left text-xs text-emerald-400 transition hover:bg-emerald-400/[0.06]"
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
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-400 text-black shadow-[0_0_25px_rgba(52,211,153,0.18)] transition hover:scale-105 hover:bg-emerald-300"
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
                    className="pointer-events-none absolute left-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-emerald-400"
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
                onClick={() => setLiked((value) => !value)}
                className={`flex h-9 w-9 items-center justify-center rounded-xl transition ${
                  liked
                    ? "bg-emerald-400/10 text-emerald-400"
                    : "text-zinc-600 hover:bg-white/[0.04] hover:text-white"
                }`}
              >
                <Heart size={17} fill={liked ? "currentColor" : "none"} />
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
        .volume-slider {
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
          background: #34d399;
          border: 0;
          box-shadow: 0 0 10px rgba(52, 211, 153, 0.45);
        }

        .progress-slider::-moz-range-thumb {
          width: 10px;
          height: 10px;
          border-radius: 999px;
          background: #34d399;
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
          background: #34d399;
          border: 0;
        }

        .volume-slider::-moz-range-thumb {
          width: 8px;
          height: 8px;
          border-radius: 999px;
          background: #34d399;
          border: 0;
        }

        * {
          scrollbar-width: thin;
          scrollbar-color: rgba(255,255,255,0.08) transparent;
        }

        ::selection {
          background: rgba(52,211,153,0.25);
          color: white;
        }
      `}</style>
    </div>
  );
}