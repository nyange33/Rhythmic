import { useMemo, useState } from "react";
import { ArrowDownWideNarrow, Compass, Disc3, Play, SlidersHorizontal } from "lucide-react";
import type { Track } from "../../types/track";
import { TrackRow } from "../musicComponents";

type ExplorePageProps = {
  tracks: Track[];
  query: string;
  playingId: number | null;
  likedIds: number[];
  onPlay: (id: number) => void;
  onLike: (id: number) => void;
  onOpenArtist: (artistName: string) => void;
};

const genres = ["All sounds", "Electronic", "Hip-Hop", "R&B", "Ambient", "Pop", "Rock"];

function popularityValue(value: string) {
  const match = value.match(/^([\d.]+)([KM])?$/i);
  if (!match) return Number(value.replace(/[^\d.]/g, "")) || 0;
  const amount = Number(match[1]);
  return amount * (match[2]?.toUpperCase() === "M" ? 1_000_000 : match[2]?.toUpperCase() === "K" ? 1_000 : 1);
}

export default function ExplorePage({ tracks, query, playingId, likedIds, onPlay, onLike, onOpenArtist }: ExplorePageProps) {
  const [genre, setGenre] = useState("All sounds");
  const [sort, setSort] = useState("popular");
  const [showFilters, setShowFilters] = useState(false);
  const filteredTracks = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const items = tracks.filter((track) => (genre === "All sounds" || track.genre.toLowerCase() === genre.toLowerCase()) && (!normalizedQuery || `${track.title} ${track.artist} ${track.genre}`.toLowerCase().includes(normalizedQuery)));
    if (sort === "title") return [...items].sort((a, b) => a.title.localeCompare(b.title));
    if (sort === "artist") return [...items].sort((a, b) => a.artist.localeCompare(b.artist));
    return [...items].sort((a, b) => popularityValue(b.plays) - popularityValue(a.plays));
  }, [tracks, genre, sort, query]);

  return (
    <div className="px-5 py-9 lg:px-10">
      <section className="relative isolate overflow-hidden rounded-[28px] border border-pink-300/20 bg-gradient-to-br from-pink-200/20 via-transparent to-pink-400/5 px-6 py-8 sm:px-9 sm:py-10">
        <div className="pointer-events-none absolute -right-10 -top-20 h-64 w-64 rounded-full bg-pink-300/10 blur-3xl" />
        <div className="relative flex flex-col justify-between gap-7 sm:flex-row sm:items-end">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-pink-300/25 bg-pink-200/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-pink-400"><Compass size={13} /> Explore Rhythmic</span>
            <h1 className="mt-5 text-4xl font-bold tracking-[-0.045em] sm:text-5xl">Find your next <span className="text-pink-400">obsession.</span></h1>
            <p className="mt-4 max-w-xl text-sm leading-6 text-zinc-500">Свежие звуки, независимые артисты и треки для любого настроения. Выбирай жанр и находи что-то своё.</p>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-white/[0.08] bg-black/[0.03] px-4 py-3">
            <Disc3 size={20} className="text-pink-400" />
            <div><p className="text-xl font-bold">{tracks.length}</p><p className="text-[10px] uppercase tracking-wider text-zinc-500">tracks to discover</p></div>
          </div>
        </div>
      </section>

      <section className="mt-9">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div><p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-pink-400">Your next repeat</p><h2 className="mt-2 text-2xl font-bold">Explore tracks</h2></div>
          <button onClick={() => setShowFilters((value) => !value)} className="inline-flex items-center gap-2 rounded-xl border border-white/[0.09] px-3 py-2 text-xs text-zinc-500 transition hover:border-pink-300/30 hover:text-pink-400"><SlidersHorizontal size={14} /> Filters</button>
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          {genres.map((item) => <button key={item} onClick={() => setGenre(item)} className={`rounded-full px-4 py-2 text-xs font-medium transition ${genre === item ? "bg-pink-200 text-black shadow-[0_5px_25px_rgba(247,201,222,0.12)]" : "border border-white/[0.08] text-zinc-500 hover:border-pink-300/30 hover:text-pink-300"}`}>{item}</button>)}
        </div>
        {showFilters && <div className="mt-4 flex flex-wrap items-center gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4"><ArrowDownWideNarrow size={16} className="text-pink-400" /><label className="text-xs text-zinc-500" htmlFor="explore-sort">Sort by</label><select id="explore-sort" value={sort} onChange={(event) => setSort(event.target.value)} className="rounded-lg border border-white/10 bg-transparent px-3 py-2 text-xs outline-none"><option value="popular">Popularity</option><option value="title">Track title</option><option value="artist">Artist</option></select><span className="text-xs text-zinc-600">{filteredTracks.length} results</span></div>}
        <div className="mt-5 space-y-1">
          {filteredTracks.map((track) => <TrackRow key={track.id} track={track} active={track.id === playingId} liked={likedIds.includes(track.id)} onPlay={() => onPlay(track.id)} onLike={() => onLike(track.id)} onOpenArtist={onOpenArtist} />)}
        </div>
        {filteredTracks.length === 0 && <div className="rounded-2xl border border-dashed border-white/10 p-10 text-center"><Play size={22} className="mx-auto text-pink-400" /><h3 className="mt-3 font-semibold">Nothing in this genre yet</h3><p className="mt-1 text-sm text-zinc-500">Попробуй другой жанр — каталог будет пополняться.</p></div>}
      </section>
    </div>
  );
}
