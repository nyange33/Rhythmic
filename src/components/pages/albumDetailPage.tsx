import { ArrowLeft, Bookmark, BookmarkCheck, Disc3, Plus, Play, Share2 } from "lucide-react";
import { useState } from "react";
import type { Album } from "../../api/albums";
import type { Track } from "../../types/track";
import { TrackRow } from "../musicComponents";

type AlbumDetailPageProps = {
  album: Album;
  tracks: Track[];
  playingId: number | null;
  likedIds: number[];
  onBack: () => void;
  onPlay: (id: number) => void;
  onLike: (id: number) => void;
  isSaved: boolean;
  onToggleLibrary: () => void;
  canAddTracks: boolean;
  onAddTrack: (id: number) => void;
  onOpenArtist: (artistName: string) => void;
};

export default function AlbumDetailPage({ album, tracks, playingId, likedIds, onBack, onPlay, onLike, isSaved, onToggleLibrary, canAddTracks, onAddTrack, onOpenArtist }: AlbumDetailPageProps) {
  const albumTracks = tracks.filter((track) => (track.backendId && album.track_ids?.includes(track.backendId)) || (track.album || "").toLowerCase() === album.title.toLowerCase() && track.artist.toLowerCase() === album.artist_name.toLowerCase());
  const [trackToAdd, setTrackToAdd] = useState("");
  const availableTracks = tracks.filter((track) => track.artist.toLowerCase() === album.artist_name.toLowerCase() && !albumTracks.some((albumTrack) => albumTrack.id === track.id));
  return (
    <div className="px-5 py-8 lg:px-10">
      <button onClick={onBack} className="mb-6 inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs text-zinc-500 transition hover:bg-pink-200/10 hover:text-pink-400"><ArrowLeft size={15} /> Back to artist</button>
      <section className="relative isolate overflow-hidden rounded-[28px] border border-pink-200/15 bg-gradient-to-br from-pink-200/15 via-transparent to-pink-400/[0.04] p-6 sm:p-9">
        <div className="pointer-events-none absolute -right-14 -top-24 h-72 w-72 rounded-full bg-pink-300/10 blur-3xl" />
        <div className="relative flex flex-col gap-7 sm:flex-row sm:items-end">
          <div className="h-44 w-44 shrink-0 overflow-hidden rounded-[24px] border border-white/10 bg-gradient-to-br from-pink-200 via-pink-400 to-stone-700 shadow-[0_22px_65px_rgba(0,0,0,0.18)] sm:h-52 sm:w-52">{album.cover_url ? <img src={album.cover_url} alt={`${album.title} cover`} className="h-full w-full object-cover" /> : <div className="flex h-full w-full items-center justify-center"><Disc3 size={54} className="text-black/70" /></div>}</div>
          <div className="min-w-0 flex-1">
            <div className="inline-flex items-center gap-2 rounded-full border border-pink-200/20 bg-pink-200/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-pink-400"><Disc3 size={12} /> Album{album.genre ? ` · ${album.genre}` : ""}</div>
            <h1 className="mt-4 break-words text-4xl font-bold tracking-[-0.05em] sm:text-5xl">{album.title}<span className="text-pink-300">.</span></h1>
            <button onClick={() => onOpenArtist(album.artist_name)} className="mt-3 text-sm text-zinc-400 transition hover:text-pink-300 hover:underline">{album.artist_name}</button>
            <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-[11px] text-zinc-500"><span>{albumTracks.length} tracks</span>{album.release_date && <span>{new Date(album.release_date).getFullYear()}</span>}<span>Album on Rhythmic</span></div>
            <div className="mt-6 flex flex-wrap gap-2"><button onClick={() => albumTracks[0] && onPlay(albumTracks[0].id)} disabled={!albumTracks.length} className="inline-flex items-center gap-2 rounded-xl bg-pink-200 px-5 py-3 text-xs font-semibold text-black transition hover:bg-pink-100 disabled:opacity-40"><Play size={15} fill="currentColor" /> Play album</button><button onClick={onToggleLibrary} className="inline-flex items-center gap-2 rounded-xl border border-pink-200/20 px-4 py-3 text-xs text-pink-200 transition hover:bg-pink-200/10">{isSaved ? <BookmarkCheck size={14} /> : <Bookmark size={14} />}{isSaved ? "In library" : "Add to library"}</button><button onClick={() => navigator.clipboard?.writeText(window.location.href)} className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-3 text-xs text-zinc-500 transition hover:border-pink-200/30 hover:text-pink-400"><Share2 size={14} /> Share</button></div>
          </div>
        </div>
      </section>
      <section className="mt-9"><div className="mb-4 flex items-end justify-between"><div><p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-pink-400">Tracklist</p><h2 className="mt-2 text-xl font-bold">Tracks in this album</h2></div><span className="text-xs text-zinc-600">{albumTracks.length} tracks</span></div>
        {canAddTracks && availableTracks.length > 0 && <div className="mb-4 flex flex-wrap gap-2"><select value={trackToAdd} onChange={(event) => setTrackToAdd(event.target.value)} className="min-w-0 flex-1 rounded-xl border border-white/10 bg-[#242424] px-3 py-3 text-xs text-white outline-none focus:border-pink-200/30"><option value="">Выбери свой трек для добавления</option>{availableTracks.map((track) => <option key={track.id} value={track.id}>{track.title}</option>)}</select><button disabled={!trackToAdd} onClick={() => { onAddTrack(Number(trackToAdd)); setTrackToAdd(""); }} className="inline-flex items-center gap-2 rounded-xl bg-pink-200 px-4 py-3 text-xs font-semibold text-black transition hover:bg-pink-100 disabled:opacity-40"><Plus size={14} /> Add track</button></div>}
        {albumTracks.length ? <div className="space-y-1">{albumTracks.map((track) => <TrackRow key={track.id} track={track} active={track.id === playingId} liked={likedIds.includes(track.id)} onPlay={() => onPlay(track.id)} onLike={() => onLike(track.id)} onOpenArtist={onOpenArtist} />)}</div> : <div className="rounded-2xl border border-dashed border-white/10 p-9 text-center"><Disc3 size={25} className="mx-auto text-pink-300" /><h3 className="mt-3 font-semibold">В этом альбоме пока нет треков</h3><p className="mt-1 text-sm text-zinc-500">Треки появятся здесь после публикации альбома.</p></div>}
      </section>
    </div>
  );
}
