import { CalendarDays, Check, Disc3, Edit3, Globe2, Heart, ListMusic, Music2, Play, Save, Upload, UserPlus, Users, X } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import type { Album } from "./api/albums";
import type { PlaylistItem } from "./types/playlist";
import type { Track } from "./types/track";

type ProfilePageProps = {
  displayName: string;
  bio: string;
  isOwnProfile: boolean;
  isArtistProfile: boolean;
  tracks: Track[];
  albums: Album[];
  playlists: PlaylistItem[];
  currentId: number | null;
  isPlaying: boolean;
  avatarUrl: string | null;
  defaultAvatar: boolean;
  canEditAvatar: boolean;
  onAvatarChange: (avatar: string) => void;
  onSaveProfile: (displayName: string, bio: string) => void;
  onPlayTrack: (id: number) => void;
  onOpenAlbum: (id: string) => void;
  onOpenPlaylist: (id: number) => void;
  onOpenArtist: (artistName: string) => void;
};

function ProfileAvatar({ displayName, avatarUrl, defaultAvatar, onChoose }: { displayName: string; avatarUrl: string | null; defaultAvatar: boolean; onChoose?: (file: File) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [failed, setFailed] = useState(false);
  const src = avatarUrl || (defaultAvatar ? "/avatar/avatar.jpg" : null);

  useEffect(() => setFailed(false), [src]);

  return (
    <div className="relative h-32 w-32 shrink-0 sm:h-40 sm:w-40">
      <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full border-4 border-pink-200/15 bg-gradient-to-br from-pink-300 via-stone-500 to-pink-700">
        {src && !failed ? <img src={src} alt={`${displayName} avatar`} className="h-full w-full object-cover" onError={() => setFailed(true)} /> : <div className="flex items-end gap-1">{[22, 35, 52, 30, 45, 26, 40].map((height, index) => <span key={index} className="w-2 rounded-full bg-black/70 sm:w-2.5" style={{ height }} />)}</div>}
      </div>
      {onChoose && <><input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(event) => { const file = event.target.files?.[0]; if (file) onChoose(file); event.currentTarget.value = ""; }} /><button onClick={() => inputRef.current?.click()} className="absolute bottom-1 right-1 flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#171717] bg-pink-200 text-black transition hover:bg-pink-100" aria-label="Change avatar"><Upload size={16} /></button></>}
    </div>
  );
}

function TrackCover({ track }: { track: Track }) {
  return <div className={`relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br ${track.color}`}>{track.cover ? <img src={track.cover} alt="" className="h-full w-full object-cover" /> : <div className="flex items-end gap-[3px]">{[12, 22, 30, 17, 26, 20].map((height, index) => <span key={index} className="w-[3px] rounded-full bg-black/70" style={{ height }} />)}</div>}</div>;
}

export default function ProfilePage({ displayName, bio, isOwnProfile, isArtistProfile, tracks, albums, playlists, currentId, isPlaying, avatarUrl, defaultAvatar, canEditAvatar, onAvatarChange, onSaveProfile, onPlayTrack, onOpenAlbum, onOpenPlaylist, onOpenArtist }: ProfilePageProps) {
  const [following, setFollowing] = useState(false);
  const [likedTracks, setLikedTracks] = useState<number[]>([]);
  const [activeTab, setActiveTab] = useState("tracks");
  const [editing, setEditing] = useState(false);
  const [draftName, setDraftName] = useState(displayName);
  const [draftBio, setDraftBio] = useState(bio);
  const [avatarError, setAvatarError] = useState("");

  useEffect(() => { setDraftName(displayName); }, [displayName]);
  useEffect(() => { setDraftBio(bio); }, [bio]);

  const chooseAvatar = (file: File) => {
    if (!file.type.startsWith("image/")) { setAvatarError("Выбери файл изображения."); return; }
    if (file.size > 2 * 1024 * 1024) { setAvatarError("Размер изображения должен быть не больше 2 МБ."); return; }
    const reader = new FileReader();
    reader.onload = () => { if (typeof reader.result === "string") { onAvatarChange(reader.result); setAvatarError(""); } };
    reader.readAsDataURL(file);
  };

  const saveProfile = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const name = draftName.trim();
    if (!name) return;
    onSaveProfile(name, draftBio.trim());
    setEditing(false);
  };

  const toggleLike = (id: number) => setLikedTracks((current) => current.includes(id) ? current.filter((trackId) => trackId !== id) : [...current, id]);

  return (
    <div className="text-white">
      <main className="mx-auto max-w-[1450px] px-5 pb-20 lg:px-8">
        <section className="relative overflow-hidden border-b border-white/[0.05] py-10 lg:py-14">
          <div className="pointer-events-none absolute -right-20 -top-40 h-[500px] w-[500px] rounded-full bg-pink-400/[0.06] blur-3xl" />
          <div className="relative flex flex-col gap-8 sm:flex-row sm:items-end">
            <div><ProfileAvatar displayName={displayName} avatarUrl={avatarUrl} defaultAvatar={defaultAvatar} onChoose={canEditAvatar ? chooseAvatar : undefined} />{avatarError && <p className="mt-2 max-w-40 text-xs text-red-300">{avatarError}</p>}</div>
            <div className="min-w-0 flex-1">
              <div className="mb-3 inline-flex rounded-full border border-pink-400/10 bg-pink-400/[0.06] px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.18em] text-pink-400">{isArtistProfile ? "Artist" : "Listener"}{isOwnProfile ? " · Your profile" : ""}</div>
              <h1 className="break-words text-4xl font-bold tracking-[-0.04em] sm:text-5xl lg:text-6xl">{displayName}<span className="text-pink-400">.</span></h1>
              <p className="mt-3 max-w-xl whitespace-pre-wrap text-sm leading-6 text-zinc-500">{bio || "Описание пока не добавлено."}</p>
              <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] text-zinc-600"><span className="flex items-center gap-1.5"><CalendarDays size={13} /> Rhythmic member</span>{isArtistProfile && <span className="flex items-center gap-1.5"><Globe2 size={13} /> Artist profile</span>}</div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {isOwnProfile ? <button onClick={() => setEditing((value) => !value)} className="flex items-center gap-2 rounded-xl border border-pink-200/20 bg-pink-200/10 px-4 py-3 text-xs font-semibold text-pink-200 transition hover:bg-pink-200/15">{editing ? <X size={15} /> : <Edit3 size={15} />}{editing ? "Cancel edit" : "Edit profile"}</button> : <button onClick={() => setFollowing((value) => !value)} className={`flex items-center gap-2 rounded-xl px-5 py-3 text-xs font-semibold transition ${following ? "border border-pink-400/20 bg-pink-400/10 text-pink-400" : "bg-pink-400 text-black hover:bg-pink-300"}`}>{following ? <><Check size={15} /> Following</> : <><UserPlus size={15} /> Follow</>}</button>}
            </div>
          </div>
          {editing && isOwnProfile && <form onSubmit={saveProfile} className="relative mt-8 grid max-w-2xl gap-4 rounded-2xl border border-pink-200/15 bg-white/[0.025] p-5"><label className="grid gap-2 text-xs text-zinc-400">Nickname<input value={draftName} onChange={(event) => setDraftName(event.target.value)} maxLength={40} required className="rounded-xl border border-white/10 bg-black/20 px-3 py-3 text-sm text-white outline-none focus:border-pink-200/40" placeholder="Твой никнейм" /></label><label className="grid gap-2 text-xs text-zinc-400">About<textarea value={draftBio} onChange={(event) => setDraftBio(event.target.value)} maxLength={1000} rows={4} className="resize-y rounded-xl border border-white/10 bg-black/20 px-3 py-3 text-sm text-white outline-none focus:border-pink-200/40" placeholder="Расскажи немного о себе" /></label><div><button type="submit" className="inline-flex items-center gap-2 rounded-xl bg-pink-200 px-4 py-2.5 text-xs font-semibold text-black transition hover:bg-pink-100"><Save size={15} /> Save changes</button></div></form>}
          <div className="mt-10 flex flex-wrap gap-10 border-t border-white/[0.05] pt-7"><Stat value="0" label="Followers" /><Stat value="0" label="Following" /><Stat value={String(albums.length)} label="Albums" /><Stat value={String(tracks.length)} label="Tracks" /></div>
        </section>

        <section className="py-10">
          <div className="mb-8 flex flex-wrap items-center gap-6 border-b border-white/[0.05]">
            {[{ id: "tracks", label: "Tracks", icon: Music2 }, ...(isArtistProfile ? [{ id: "albums", label: "Albums", icon: Disc3 }] : []), { id: "playlists", label: "Playlists", icon: ListMusic }, { id: "about", label: "About", icon: Users }].map((tab) => { const Icon = tab.icon; return <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`relative flex items-center gap-2 pb-4 text-xs font-medium transition ${activeTab === tab.id ? "text-white" : "text-zinc-600 hover:text-zinc-300"}`}><Icon size={15} /> {tab.label}{activeTab === tab.id && <span className="absolute bottom-[-1px] left-0 right-0 h-[2px] rounded-full bg-pink-400" />}</button>; })}
          </div>

          {activeTab === "tracks" && <div><div className="mb-5"><p className="text-[10px] uppercase tracking-[0.18em] text-pink-400">{isOwnProfile ? "Your releases" : "Artist releases"}</p><h2 className="mt-2 text-2xl font-bold tracking-tight">Tracks</h2></div>{tracks.length ? <div className="space-y-2">{tracks.map((track, index) => { const active = currentId === track.id && isPlaying; const liked = likedTracks.includes(track.id); return <div key={track.id} className={`group flex items-center gap-4 rounded-2xl border p-3 transition ${active ? "border-pink-400/15 bg-pink-400/[0.045]" : "border-transparent hover:border-white/[0.06] hover:bg-white/[0.025]"}`}><span className="w-5 text-center text-[10px] tabular-nums text-zinc-700">{String(index + 1).padStart(2, "0")}</span><button onClick={() => onPlayTrack(track.id)} className="relative shrink-0"><TrackCover track={track} /><span className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/45 opacity-0 transition group-hover:opacity-100"><Play size={17} fill="white" /></span></button><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-white">{track.title}</p><button type="button" onClick={() => onOpenArtist(track.artist)} className="mt-1 block max-w-full truncate text-left text-xs text-zinc-600 transition hover:text-pink-300 hover:underline">{track.artist}</button></div><button onClick={() => toggleLike(track.id)} className={`rounded-lg p-2 transition ${liked ? "text-pink-400" : "text-zinc-700 hover:text-white"}`}><Heart size={16} fill={liked ? "currentColor" : "none"} /></button><span className="w-10 text-right text-[10px] tabular-nums text-zinc-700">{track.duration}</span></div>; })}</div> : <EmptyState icon={<Music2 size={24} />} text="Здесь пока нет опубликованных треков." />}</div>}

          {activeTab === "albums" && <div><div className="mb-5"><p className="text-[10px] uppercase tracking-[0.18em] text-pink-400">Discography</p><h2 className="mt-2 text-2xl font-bold tracking-tight">Albums</h2></div>{albums.length ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{albums.map((album) => <button key={album.id} onClick={() => onOpenAlbum(album.id)} className="group rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4 text-left transition hover:-translate-y-1 hover:border-pink-200/30"><div className="mb-4 flex aspect-square items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-pink-200 via-pink-400/60 to-stone-700/60">{album.cover_url ? <img src={album.cover_url} alt={`${album.title} cover`} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" /> : <Disc3 size={48} className="text-black/70" />}</div><span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-pink-300">Album{album.genre ? ` · ${album.genre}` : ""}</span><h3 className="mt-2 truncate text-lg font-semibold">{album.title}</h3><p className="mt-1 text-xs text-zinc-500">{album.track_ids?.length || 0} tracks · Open album</p></button>)}</div> : <EmptyState icon={<Disc3 size={24} />} text="У этого артиста пока нет опубликованных альбомов." />}</div>}

          {activeTab === "playlists" && <div><div className="mb-5"><p className="text-[10px] uppercase tracking-[0.18em] text-pink-400">Your collections</p><h2 className="mt-2 text-2xl font-bold tracking-tight">Playlists</h2></div>{playlists.length ? <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{playlists.map((item) => <button key={item.id} onClick={() => onOpenPlaylist(item.id)} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 text-left transition hover:border-pink-200/25"><div className="mb-5 flex aspect-[1.7] items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-pink-200/70 to-stone-700/60">{item.coverUrl ? <img src={item.coverUrl} alt="" className="h-full w-full object-cover" /> : <ListMusic size={32} className="text-black/60" />}</div><p className="truncate font-semibold">{item.name}</p><p className="mt-1 text-xs text-zinc-500">{item.trackIds.length} tracks</p></button>)}</div> : <EmptyState icon={<ListMusic size={24} />} text="Плейлистов пока нет." />}</div>}

          {activeTab === "about" && <div className="max-w-2xl rounded-3xl border border-white/[0.06] bg-white/[0.02] p-7"><p className="whitespace-pre-wrap text-sm leading-7 text-zinc-400">{bio || "Пока ничего не указано."}</p>{isOwnProfile && !editing && <button onClick={() => setEditing(true)} className="mt-5 inline-flex items-center gap-2 rounded-xl border border-pink-200/20 px-4 py-2 text-xs text-pink-200 transition hover:bg-pink-200/10"><Edit3 size={14} /> Edit about and nickname</button>}</div>}
        </section>
      </main>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) { return <div><p className="text-xl font-bold tracking-tight text-white">{value}</p><p className="mt-1 text-[10px] uppercase tracking-[0.15em] text-zinc-600">{label}</p></div>; }
function EmptyState({ icon, text }: { icon: ReactNode; text: string }) { return <div className="rounded-2xl border border-dashed border-white/[0.08] p-9 text-center text-sm text-zinc-500"><div className="mb-3 flex justify-center text-pink-300">{icon}</div>{text}</div>; }
