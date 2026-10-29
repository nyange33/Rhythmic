import { ArrowLeft, Disc3, Music2, Play, UserRound } from "lucide-react";
import type { Album } from "../../api/albums";
import type { Track } from "../../types/track";
import { TrackRow } from "../musicComponents";

type ArtistPageProps = {
  artistName: string;
  tracks: Track[];
  albums: Album[];
  playingId: number | null;
  likedIds: number[];
  onBack: () => void;
  onPlay: (id: number) => void;
  onLike: (id: number) => void;
  onOpenAlbum: (id: string) => void;
  onOpenArtist: (artistName: string) => void;
};

export default function ArtistPage({ artistName, tracks, albums, playingId, likedIds, onBack, onPlay, onLike, onOpenAlbum, onOpenArtist }: ArtistPageProps) {
  return (
    <div className="px-5 py-8 lg:px-10">
      <button onClick={onBack} className="mb-6 inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs text-zinc-500 transition hover:bg-pink-200/10 hover:text-pink-400"><ArrowLeft size={15} /> Back</button>
      <section className="relative isolate overflow-hidden rounded-[28px] border border-pink-200/15 bg-gradient-to-br from-pink-200/20 via-transparent to-pink-400/[0.04] p-6 sm:p-10">
        <div className="pointer-events-none absolute -right-10 -top-20 h-64 w-64 rounded-full bg-pink-300/10 blur-3xl" />
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end">
          <div className="flex h-32 w-32 shrink-0 items-center justify-center rounded-[26px] border border-pink-200/20 bg-pink-200/10 text-pink-300 sm:h-40 sm:w-40"><UserRound size={58} strokeWidth={1.2} /></div>
          <div className="min-w-0 flex-1">
            <span className="inline-flex items-center gap-2 rounded-full border border-pink-200/20 bg-pink-200/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-pink-400">Artist page</span>
            <h1 className="mt-4 break-words text-4xl font-bold tracking-[-0.05em] sm:text-5xl">{artistName}<span className="text-pink-300">.</span></h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-zinc-500">Треки, альбомы и релизы артиста на Rhythmic.</p>
            <div className="mt-5 flex flex-wrap gap-4 text-xs text-zinc-500"><span>{albums.length} albums</span><span>{tracks.length} tracks</span></div>
          </div>
          {tracks[0] && <button onClick={() => onPlay(tracks[0].id)} className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-pink-200 px-5 py-3 text-xs font-semibold text-black transition hover:bg-pink-100"><Play size={15} fill="currentColor" /> Play latest track</button>}
        </div>
      </section>

      <section className="mt-10">
        <div className="mb-5 flex items-end justify-between"><div><p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-pink-400">Discography</p><h2 className="mt-2 text-2xl font-bold">Albums</h2></div><span className="text-xs text-zinc-600">{albums.length} releases</span></div>
        {albums.length ? <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{albums.map((album) => {
          const count = album.track_ids?.length || tracks.filter((track) => (track.album || "").toLowerCase() === album.title.toLowerCase()).length;
          return <button key={album.id} onClick={() => onOpenAlbum(album.id)} className="group rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4 text-left transition hover:-translate-y-1 hover:border-pink-300/30">
            <div className="mb-4 flex aspect-square items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-pink-200 via-pink-400/60 to-stone-700/60">{album.cover_url ? <img src={album.cover_url} alt={`${album.title} cover`} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" /> : <Disc3 size={48} className="text-black/70" />}</div>
            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-pink-300">Album{album.genre ? ` · ${album.genre}` : ""}</span>
            <h3 className="mt-2 truncate text-lg font-semibold">{album.title}</h3>
            <p className="mt-1 text-xs text-zinc-500">{count} tracks · Open album</p>
          </button>;
        })}</div> : <div className="rounded-2xl border border-dashed border-white/10 p-9 text-center"><Disc3 size={25} className="mx-auto text-pink-300" /><h3 className="mt-3 font-semibold">Пока нет альбомов</h3><p className="mt-1 text-sm text-zinc-500">Новые релизы артиста появятся здесь.</p></div>}
      </section>

      <section className="mt-10">
        <div className="mb-5 flex items-end justify-between"><div><p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-pink-400">Latest releases</p><h2 className="mt-2 text-2xl font-bold">Tracks</h2></div><span className="text-xs text-zinc-600">{tracks.length} tracks</span></div>
        {tracks.length ? <div className="space-y-1">{tracks.map((track) => <TrackRow key={track.id} track={track} active={track.id === playingId} liked={likedIds.includes(track.id)} onPlay={() => onPlay(track.id)} onLike={() => onLike(track.id)} onOpenArtist={onOpenArtist} />)}</div> : <div className="rounded-2xl border border-dashed border-white/10 p-9 text-center text-sm text-zinc-500"><Music2 size={22} className="mx-auto mb-3 text-pink-300" />У артиста пока нет опубликованных треков.</div>}
      </section>
    </div>
  );
}
