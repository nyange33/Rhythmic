import { Disc3, Heart, ListMusic, Plus, X } from "lucide-react";
import type { Track } from "../../types/track";
import type { PlaylistItem } from "../../types/playlist";
import { TrackRow } from "../musicComponents";
import PlaylistDetailPage from "./playlistDetailPage";

export type MusicPage = "home" | "explore" | "profile" | "library" | "liked" | "notifications" | "playlists";

type Props = {
  page: Exclude<MusicPage, "home" | "explore" | "profile">;
  tracks: Track[];
  likedIds: number[];
  playlists: PlaylistItem[];
  playingId: number | null;
  selectedPlaylistId: number | null;
  onPageChange: (page: MusicPage) => void;
  onPlay: (id: number) => void;
  onLike: (id: number) => void;
  onCreatePlaylist: () => void;
  onDeletePlaylist: (id: number) => void;
  onTogglePlaylistTrack: (playlistId: number, trackId: number) => void;
  onOpenPlaylist: (id: number) => void;
  onOpenAlbum: (id: string) => void;
  onOpenArtist: (artistName: string) => void;
};

export default function MusicPages({ page, tracks, likedIds, playlists, playingId, selectedPlaylistId, onPageChange, onPlay, onLike, onCreatePlaylist, onDeletePlaylist, onTogglePlaylistTrack, onOpenPlaylist, onOpenAlbum, onOpenArtist }: Props) {
  const selectedPlaylist = playlists.find((item) => item.id === selectedPlaylistId);

  if (page === "playlists" && selectedPlaylist) {
    return <PlaylistDetailPage playlist={selectedPlaylist} tracks={tracks} playingId={playingId} likedIds={likedIds} onBack={() => onOpenPlaylist(0)} onPlay={onPlay} onLike={onLike} onToggleTrack={onTogglePlaylistTrack} onDelete={onDeletePlaylist} onOpenArtist={onOpenArtist} />;
  }

  return (
    <div className="px-5 py-10 lg:px-10">
      {page === "library" && <>
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-pink-400">Your music</p><h1 className="mt-2 text-3xl font-bold">Library</h1><p className="mt-2 text-sm text-zinc-500">Вся музыка в одном месте — избранное, плейлисты и альбомы.</p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <button onClick={() => onPageChange("liked")} className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5 text-left transition hover:border-pink-300/30"><Heart className="mb-8 text-pink-300" size={22} /><h2 className="font-semibold">Liked tracks</h2><p className="mt-1 text-xs text-zinc-500">{likedIds.length} tracks</p></button>
          {playlists.map((item) => <button key={`${item.type}-${item.id}`} onClick={() => onOpenPlaylist(item.id)} className="group rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5 text-left transition hover:-translate-y-0.5 hover:border-pink-300/30"><div className="mb-8 flex h-11 w-11 items-center justify-center rounded-xl bg-pink-200/10 text-pink-300">{item.type === "Album" ? <Disc3 size={22} /> : <ListMusic size={22} />}</div><h2 className="font-semibold">{item.name}</h2><p className="mt-1 text-xs text-zinc-500">{item.type} · {item.trackIds.length} tracks</p></button>)}
        </div>
        <h2 className="mt-10 text-xl font-bold">Recently added</h2><div className="mt-4 space-y-1">{tracks.map((track) => <TrackRow key={track.id} track={track} active={track.id === playingId} liked={likedIds.includes(track.id)} onPlay={() => onPlay(track.id)} onLike={() => onLike(track.id)} onOpenArtist={onOpenArtist} />)}</div>
      </>}

      {page === "liked" && <>
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-pink-400">Your favorites</p><h1 className="mt-2 text-3xl font-bold">Liked tracks</h1><p className="mt-2 text-sm text-zinc-500">Треки, которые ты отметил сердечком. Избранное синхронизируется с аккаунтом.</p>
        <div className="mt-8 space-y-1">{tracks.filter((track) => likedIds.includes(track.id)).map((track) => <TrackRow key={track.id} track={track} active={track.id === playingId} liked onPlay={() => onPlay(track.id)} onLike={() => onLike(track.id)} onOpenArtist={onOpenArtist} />)}</div>
        {likedIds.length === 0 && <div className="mt-8 rounded-2xl border border-white/[0.07] p-10 text-center"><Heart className="mx-auto text-pink-300" size={30} /><h2 className="mt-4 font-semibold">Пока ничего нет</h2><p className="mt-2 text-sm text-zinc-500">Нажми на сердечко рядом с треком, чтобы добавить его сюда.</p><button onClick={() => onPageChange("explore")} className="mt-5 rounded-xl bg-pink-200 px-4 py-2 text-sm font-semibold text-black">Найти музыку</button></div>}
      </>}

      {page === "notifications" && <>
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-pink-400">Updates</p><h1 className="mt-2 text-3xl font-bold">Notifications</h1><p className="mt-2 text-sm text-zinc-500">Новые релизы артистов, на которых ты подписан, появятся здесь.</p>
        <div className="mt-8 space-y-3"><div className="flex gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4"><Disc3 className="mt-1 text-pink-300" size={19} /><div><p className="text-sm font-semibold">Новые релизы появятся здесь</p><p className="mt-1 text-sm text-zinc-500">Когда появятся подписки на артистов и релизы, здесь можно будет увидеть их новые треки.</p><span className="mt-3 inline-flex rounded-full bg-pink-200/10 px-2 py-1 text-[10px] text-pink-300">Artist updates</span></div></div></div>
      </>}

      {page === "playlists" && <>
        <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-pink-400">Organize your sound</p><h1 className="mt-2 text-3xl font-bold">Playlists & albums</h1><p className="mt-2 text-sm text-zinc-500">Открой подборку, запускай её целиком и добавляй треки в один клик.</p></div><button onClick={onCreatePlaylist} className="flex items-center gap-2 rounded-xl bg-pink-200 px-4 py-3 text-sm font-semibold text-black transition hover:bg-pink-100"><Plus size={17} /> Create playlist</button></div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{playlists.map((item) => <article key={`${item.type}-${item.id}`} className="group relative overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5 transition hover:-translate-y-1 hover:border-pink-300/30"><button onClick={() => item.type === "Album" && item.backendId ? onOpenAlbum(item.backendId) : onOpenPlaylist(item.id)} className="block w-full text-left"><div className="relative mb-5 flex aspect-[1.7] items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-pink-200/80 via-pink-400/40 to-stone-700/60">{item.coverUrl ? <img src={item.coverUrl} alt="" className="h-full w-full object-cover" /> : <><div className="absolute h-36 w-36 rounded-full border-[14px] border-black/10" /><div className="absolute h-20 w-20 rounded-full border-[10px] border-black/10" />{item.type === "Album" ? <Disc3 size={36} className="relative text-black/70" /> : <ListMusic size={36} className="relative text-black/70" />}</>}</div><div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-pink-300">{item.type}</div><h2 className="mt-2 truncate text-lg font-semibold">{item.name}</h2><p className="mt-1 text-xs text-zinc-500">{item.trackIds.length} tracks · Open collection</p></button>{item.type === "Playlist" && <button onClick={() => onDeletePlaylist(item.id)} aria-label={`Delete ${item.name}`} className="absolute right-7 top-7 rounded-lg bg-black/35 p-2 text-white/70 opacity-0 transition hover:bg-red-300/20 hover:text-red-300 group-hover:opacity-100"><X size={15} /></button>}</article>)}</div>
        {playlists.length === 0 && <div className="mt-8 rounded-2xl border border-dashed border-white/10 p-10 text-center text-sm text-zinc-500">Пока нет плейлистов или альбомов. Создай первый.</div>}
      </>}
    </div>
  );
}
