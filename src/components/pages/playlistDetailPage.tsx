import { ArrowLeft, Disc3, Heart, ListMusic, LockKeyhole, Play, Plus, Share2, Trash2 } from "lucide-react";
import type { Track } from "../../types/track";
import type { PlaylistItem } from "../../types/playlist";
import { TrackRow } from "../musicComponents";

type Props = {
  playlist: PlaylistItem;
  tracks: Track[];
  playingId: number | null;
  likedIds: number[];
  onBack: () => void;
  onPlay: (id: number) => void;
  onLike: (id: number) => void;
  onToggleTrack: (playlistId: number, trackId: number) => void;
  onDelete: (id: number) => void;
  onOpenArtist: (artistName: string) => void;
};

export default function PlaylistDetailPage({ playlist, tracks, playingId, likedIds, onBack, onPlay, onLike, onToggleTrack, onDelete, onOpenArtist }: Props) {
  const playlistTracks = tracks.filter((track) => playlist.trackIds.includes(track.id));
  const availableTracks = tracks.filter((track) => !playlist.trackIds.includes(track.id));

  return (
    <div className="px-5 py-8 lg:px-10">
      <button onClick={onBack} className="mb-6 inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs text-zinc-500 transition hover:bg-pink-200/10 hover:text-pink-400"><ArrowLeft size={15} /> All playlists</button>
      <section className="relative isolate overflow-hidden rounded-[28px] border border-pink-200/15 bg-gradient-to-br from-pink-200/15 via-transparent to-pink-400/[0.04] p-6 sm:p-9">
        <div className="pointer-events-none absolute -right-14 -top-24 h-72 w-72 rounded-full bg-pink-300/10 blur-3xl" />
        <div className="relative flex flex-col gap-7 sm:flex-row sm:items-end">
          <div className="relative h-44 w-44 shrink-0 overflow-hidden rounded-[24px] border border-white/10 bg-gradient-to-br from-pink-200 via-pink-400 to-stone-700 shadow-[0_22px_65px_rgba(0,0,0,0.18)] sm:h-52 sm:w-52">
            {(playlist.coverUrl || playlistTracks[0]?.cover) ? <img src={playlist.coverUrl || playlistTracks[0]?.cover} alt="" className="h-full w-full object-cover" /> : <div className="absolute inset-0 flex items-center justify-center"><div className="absolute h-40 w-40 rounded-full border-[18px] border-black/10" /><div className="absolute h-24 w-24 rounded-full border-[12px] border-black/10" />{playlist.type === "Album" ? <Disc3 size={44} className="relative text-black/70" /> : <ListMusic size={44} className="relative text-black/70" />}</div>}
          </div>
          <div className="min-w-0 flex-1">
            <div className="inline-flex items-center gap-2 rounded-full border border-pink-200/20 bg-pink-200/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-pink-400">{playlist.type === "Album" ? <Disc3 size={12} /> : <ListMusic size={12} />}{playlist.type}{playlist.isPublic === false && <LockKeyhole size={12} />}</div>
            <h1 className="mt-4 break-words text-4xl font-bold tracking-[-0.05em] sm:text-5xl">{playlist.name}<span className="text-pink-300">.</span></h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-500">{playlist.description || "Собранная вручную подборка звуков, к которым хочется возвращаться."}</p>
            <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-[11px] text-zinc-500"><span>Rhythmic community</span><span>{playlistTracks.length} tracks</span><span>{playlist.isPublic === false ? "Private" : "Public"}</span></div>
            <div className="mt-6 flex flex-wrap gap-2">
              <button onClick={() => playlistTracks[0] && onPlay(playlistTracks[0].id)} disabled={!playlistTracks.length} className="inline-flex items-center gap-2 rounded-xl bg-pink-200 px-5 py-3 text-xs font-semibold text-black transition hover:bg-pink-100 disabled:opacity-40"><Play size={15} fill="currentColor" /> Play playlist</button>
              <button onClick={() => navigator.clipboard?.writeText(window.location.href)} className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-3 text-xs text-zinc-500 transition hover:border-pink-200/30 hover:text-pink-400"><Share2 size={14} /> Share</button>
              {playlist.type === "Playlist" && <button onClick={() => onDelete(playlist.id)} className="inline-flex items-center gap-2 rounded-xl border border-red-300/10 px-4 py-3 text-xs text-zinc-500 transition hover:bg-red-300/10 hover:text-red-300"><Trash2 size={14} /> Delete</button>}
            </div>
          </div>
        </div>
      </section>

      <div className="mt-9 grid gap-9 xl:grid-cols-[minmax(0,1fr)_300px]">
        <section className="min-w-0">
          <div className="mb-4 flex items-end justify-between"><div><p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-pink-400">The mix</p><h2 className="mt-2 text-xl font-bold">Tracks in this {playlist.type.toLowerCase()}</h2></div><span className="text-xs text-zinc-600">{playlistTracks.length} tracks</span></div>
          {playlistTracks.length ? <div className="space-y-1">{playlistTracks.map((track) => <div key={track.id} className="group flex items-center gap-2"><div className="min-w-0 flex-1"><TrackRow track={track} active={track.id === playingId} liked={likedIds.includes(track.id)} onPlay={() => onPlay(track.id)} onLike={() => onLike(track.id)} onOpenArtist={onOpenArtist} /></div>{playlist.type === "Playlist" && <button onClick={() => onToggleTrack(playlist.id, track.id)} title="Remove from playlist" className="rounded-lg p-2 text-zinc-600 opacity-70 transition hover:bg-red-300/10 hover:text-red-300 sm:opacity-0 sm:group-hover:opacity-100"><Trash2 size={15} /></button>}</div>)}</div> : <div className="rounded-2xl border border-dashed border-white/10 p-9 text-center"><ListMusic size={25} className="mx-auto text-pink-300" /><h3 className="mt-3 font-semibold">This playlist is waiting for a soundtrack</h3><p className="mt-1 text-sm text-zinc-500">Добавь треки из каталога ниже.</p></div>}
        </section>
        {playlist.type === "Playlist" && <aside className="h-fit rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5"><div className="flex items-center gap-2"><Plus size={16} className="text-pink-400" /><h3 className="font-semibold">Add tracks</h3></div><p className="mt-1 text-xs leading-5 text-zinc-500">Выбирай треки прямо здесь — не нужно возвращаться в каталог.</p><div className="mt-4 space-y-2">{availableTracks.map((track) => <div key={track.id} className="flex items-center gap-2"><div className="min-w-0 flex-1"><div className="truncate text-xs font-medium">{track.title}</div><button type="button" onClick={() => onOpenArtist(track.artist)} className="mt-0.5 block max-w-full truncate text-left text-[10px] text-zinc-500 transition hover:text-pink-300 hover:underline">{track.artist}</button></div><button onClick={() => onToggleTrack(playlist.id, track.id)} aria-label={`Add ${track.title}`} className="rounded-lg border border-pink-200/20 p-2 text-pink-400 transition hover:bg-pink-200 hover:text-black"><Plus size={14} /></button></div>)}{!availableTracks.length && <p className="text-xs text-zinc-500">Все доступные треки уже добавлены.</p>}</div><div className="mt-5 border-t border-white/[0.07] pt-4 text-[10px] text-zinc-600"><Heart size={12} className="mr-1 inline text-pink-400" />Сохраняй подборки под настроение.</div></aside>}
      </div>
    </div>
  );
}
