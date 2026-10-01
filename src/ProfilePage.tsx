import {
  CalendarDays,
  Check,
  ChevronRight,
  Globe2,
  Heart,
  ListMusic,
  MapPin,
  MoreHorizontal,
  Music2,
  Play,
  UserPlus,
  Users,
} from "lucide-react";
import { useState } from "react";
import type { Track } from "./types/track";

type ProfilePageProps = {
  tracks: Track[];
  currentId: number | null;
  isPlaying: boolean;
  onPlayTrack: (id: number) => void;
};

function ProfileAvatar() {
  const [imageIndex, setImageIndex] = useState(0);
  const candidates = [
    "/avatar/avatar.png",
    "/avatar/avatar.jpg",
    "/avatar/avatar.jpeg",
    "/avatar/avatar.webp",
    "/avatar/avatar.gif",
  ];
  const src = candidates[imageIndex];

  return (
    <div className="relative h-32 w-32 shrink-0 sm:h-40 sm:w-40">
      <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-full border-4 border-[#090c0a] bg-gradient-to-br from-emerald-400 via-green-500 to-teal-700">
        {src ? (
          <img
            src={src}
            alt="королевски 17 avatar"
            className="h-full w-full object-cover"
            onError={() => setImageIndex((index) => index + 1)}
          />
        ) : (
          <div className="flex items-end gap-1">
            {[22, 35, 52, 30, 45, 26, 40].map((height, index) => (
              <span key={index} className="w-2 rounded-full bg-black/70 sm:w-2.5" style={{ height }} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Cover({ track }: { track: Track }) {
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
      <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-zinc-900">
        <img
          src={coverSrc}
          alt=""
          className="h-full w-full object-cover"
          onError={() => setCoverIndex((index) => index + 1)}
        />
      </div>
    );
  }

  return (
    <div className={`relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br ${track.color}`}>
      <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full border-[8px] border-black/20" />
      <div className="flex items-end gap-[3px]">
        {[12, 22, 30, 17, 26, 20].map((height, index) => (
          <span
            key={index}
            className="w-[3px] rounded-full bg-black/70"
            style={{ height }}
          />
        ))}
      </div>
    </div>
  );
}

function Waveform({ active }: { active: boolean }) {
  return (
    <div className="flex h-8 items-center gap-[3px]">
      {[18, 27, 12, 32, 24, 38, 20, 30, 14, 26, 35, 18, 28, 22, 38].map((height, index) => (
        <span
          key={index}
          className={`w-[3px] rounded-full transition-colors ${active && index < 8 ? "bg-emerald-400" : "bg-white/[0.09]"}`}
          style={{ height }}
        />
      ))}
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="text-xl font-bold tracking-tight text-white">{value}</p>
      <p className="mt-1 text-[10px] uppercase tracking-[0.15em] text-zinc-600">{label}</p>
    </div>
  );
}

export default function ProfilePage({
  tracks,
  currentId,
  isPlaying,
  onPlayTrack,
}: ProfilePageProps) {
  const [following, setFollowing] = useState(false);
  const [likedTracks, setLikedTracks] = useState<number[]>([]);
  const [activeTab, setActiveTab] = useState("tracks");

  const toggleLike = (id: number) => {
    setLikedTracks((current) =>
      current.includes(id) ? current.filter((trackId) => trackId !== id) : [...current, id],
    );
  };

  return (
    <div className="text-white">
      <main className="mx-auto max-w-[1450px] px-5 pb-20 lg:px-8">
        <section className="relative overflow-hidden border-b border-white/[0.05] py-10 lg:py-14">
          <div className="pointer-events-none absolute -right-20 -top-40 h-[500px] w-[500px] rounded-full bg-emerald-400/[0.06] blur-3xl" />

          <div className="relative flex flex-col gap-8 sm:flex-row sm:items-end">
            <ProfileAvatar />

            <div className="min-w-0 flex-1">
              <div className="mb-3 inline-flex rounded-full border border-emerald-400/10 bg-emerald-400/[0.06] px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.18em] text-emerald-400">
                Artist
              </div>

              <h1 className="text-4xl font-bold tracking-[-0.04em] sm:text-5xl lg:text-6xl">
                королевски 17<span className="text-emerald-400">.</span>
              </h1>

              <p className="mt-3 max-w-xl text-sm leading-6 text-zinc-500">
                королевске 17 лет
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] text-zinc-600">
                <span className="flex items-center gap-1.5"><MapPin size={13} /> Moscow, Russia</span>
                <span className="flex items-center gap-1.5"><CalendarDays size={13} /> Joined 2021</span>
                <span className="flex items-center gap-1.5"><Globe2 size={13} /> blank.music</span>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <button
                onClick={() => setFollowing((value) => !value)}
                className={`flex items-center gap-2 rounded-xl px-5 py-3 text-xs font-semibold transition ${
                  following ? "border border-emerald-400/20 bg-emerald-400/10 text-emerald-400" : "bg-emerald-400 text-black hover:bg-emerald-300"
                }`}
              >
                {following ? <><Check size={15} /> Following</> : <><UserPlus size={15} /> Follow</>}
              </button>
              <button className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.025] text-zinc-500 transition hover:bg-white/[0.05] hover:text-white">
                <MoreHorizontal size={18} />
              </button>
            </div>
          </div>

          <div className="mt-10 flex flex-wrap gap-10 border-t border-white/[0.05] pt-7">
            <Stat value="2.8M" label="Followers" />
            <Stat value="184K" label="Following" />
            <Stat value="4.7M" label="Plays" />
            <Stat value={String(tracks.length)} label="Tracks" />
          </div>
        </section>

        <section className="py-10">
          <div className="mb-8 flex items-center gap-6 border-b border-white/[0.05]">
            {[
              { id: "tracks", label: "Tracks", icon: Music2 },
              { id: "playlists", label: "Playlists", icon: ListMusic },
              { id: "about", label: "About", icon: Users },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex items-center gap-2 pb-4 text-xs font-medium transition ${activeTab === tab.id ? "text-white" : "text-zinc-600 hover:text-zinc-300"}`}
                >
                  <Icon size={15} /> {tab.label}
                  {activeTab === tab.id && <span className="absolute bottom-[-1px] left-0 right-0 h-[2px] rounded-full bg-emerald-400" />}
                </button>
              );
            })}
          </div>

          {activeTab === "tracks" && (
            <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
              <div>
                <div className="mb-5">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-emerald-400">Your releases</p>
                  <h2 className="mt-2 text-2xl font-bold tracking-tight">Tracks</h2>
                </div>

                <div className="space-y-2">
                  {tracks.map((track, index) => {
                    const active = currentId === track.id && isPlaying;
                    const liked = likedTracks.includes(track.id);

                    return (
                      <div
                        key={track.id}
                        className={`group flex items-center gap-4 rounded-2xl border p-3 transition ${active ? "border-emerald-400/15 bg-emerald-400/[0.045]" : "border-transparent hover:border-white/[0.06] hover:bg-white/[0.025]"}`}
                      >
                        <span className="w-5 text-center text-[10px] tabular-nums text-zinc-700">
                          {String(index + 1).padStart(2, "0")}
                        </span>

                        <button onClick={() => onPlayTrack(track.id)} className="relative shrink-0">
                          <Cover track={track} />
                          <span className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/45 opacity-0 transition group-hover:opacity-100">
                            {active ? (
                              <span className="flex gap-[2px]"><span className="h-4 w-[2px] rounded-full bg-white" /><span className="h-4 w-[2px] rounded-full bg-white" /></span>
                            ) : <Play size={17} fill="white" />}
                          </span>
                        </button>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-white">{track.title}</p>
                          <p className="mt-1 truncate text-xs text-zinc-600">{track.artist}</p>
                        </div>

                        <div className="hidden md:block"><Waveform active={active} /></div>

                        <span className="hidden text-xs text-zinc-600 sm:block">{track.plays}</span>

                        <button
                          onClick={() => toggleLike(track.id)}
                          className={`rounded-lg p-2 transition ${liked ? "text-emerald-400" : "text-zinc-700 hover:text-white"}`}
                        >
                          <Heart size={16} fill={liked ? "currentColor" : "none"} />
                        </button>

                        <span className="w-10 text-right text-[10px] tabular-nums text-zinc-700">{track.duration}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <aside className="rounded-3xl border border-white/[0.06] bg-white/[0.02] p-6">
                <p className="text-[10px] uppercase tracking-[0.18em] text-emerald-400">About the artist</p>
                <h3 className="mt-3 text-xl font-bold">королевски 17</h3>
                <p className="mt-3 text-sm leading-6 text-zinc-500">
                  что-то там что-то там троллфейс XVII психотераперв инструмент как наркодиле
                </p>
              </aside>
            </div>
          )}

          {activeTab === "playlists" && (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {["что-то там", "playlist", "w w w"].map((title, index) => (
                <div key={title} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
                  <div className={`mb-6 h-24 rounded-xl bg-gradient-to-br ${["from-emerald-400 to-cyan-500", "from-lime-400 to-green-700", "from-teal-400 to-emerald-700"][index]}`} />
                  <p className="font-semibold">{title}</p>
                  <p className="mt-1 text-xs text-zinc-600">{tracks.length} tracks</p>
                </div>
              ))}
            </div>
          )}

          {activeTab === "about" && (
            <div className="max-w-2xl rounded-3xl border border-white/[0.06] bg-white/[0.02] p-7">
              <p className="text-sm leading-7 text-zinc-500">
                королевски 17.
              </p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
