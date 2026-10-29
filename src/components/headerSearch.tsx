import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowUpRight, LoaderCircle, Music2, Search, UserRound, Users } from "lucide-react";
import { searchTracks } from "../api/tracks";
import type { Track } from "../types/track";

type HeaderSearchProps = {
  tracks: Track[];
  value: string;
  onChange: (value: string) => void;
  onPlay: (id: number) => void;
  onExplore: () => void;
  onOpenArtist: (name: string) => void;
};

export default function HeaderSearch({ tracks, value, onChange, onPlay, onExplore, onOpenArtist }: HeaderSearchProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverTracks, setServerTracks] = useState<Track[]>([]);
  const rootRef = useRef<HTMLDivElement>(null);
  const localMatches = useMemo(() => {
    const query = value.trim().toLowerCase();
    if (!query) return [];
    return tracks.filter((track) => `${track.title} ${track.artist} ${track.genre}`.toLowerCase().includes(query));
  }, [tracks, value]);
  const artistMatches = useMemo(() => {
    const query = value.trim().toLowerCase();
    if (!query) return [];
    return [...new Set(tracks.map((track) => track.artist.trim()).filter(Boolean))]
      .filter((artist) => artist.toLowerCase().includes(query))
      .slice(0, 4);
  }, [tracks, value]);
  const results = useMemo(() => {
    const combined = [...serverTracks, ...localMatches];
    return combined.filter((track, index) => combined.findIndex((candidate) => candidate.id === track.id) === index).slice(0, 6);
  }, [serverTracks, localMatches]);

  useEffect(() => {
    const query = value.trim();
    if (query.length < 2) { setServerTracks([]); setLoading(false); return; }
    let active = true;
    const timeout = window.setTimeout(async () => {
      setLoading(true);
      try {
        const response = await searchTracks(query);
        if (active) {
          const mapped = response.map((item) => tracks.find((track) => track.backendId === item.id || (track.title === item.title && track.artist === item.artist))).filter((track): track is Track => Boolean(track));
          setServerTracks(mapped);
        }
      } catch {
        if (active) setServerTracks([]);
      } finally {
        if (active) setLoading(false);
      }
    }, 180);
    return () => { active = false; window.clearTimeout(timeout); };
  }, [value, tracks]);

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  const selectTrack = (track: Track) => {
    onPlay(track.id);
    setOpen(false);
    onChange("");
  };

  return (
    <div ref={rootRef} className="header-search-container relative z-20 mx-3 min-w-0 w-full flex-1 lg:mx-0 lg:w-[min(500px,45vw)] lg:flex-none">
      <div className="header-search-surface relative rounded-xl">
        <Search size={17} className="header-search-icon absolute left-4 top-1/2 -translate-y-1/2" />
        <input value={value} onFocus={() => setOpen(true)} onChange={(event) => { onChange(event.target.value); setOpen(true); }} onKeyDown={(event) => { if (event.key === "Escape") setOpen(false); if (event.key === "Enter") { setOpen(false); onExplore(); } }} placeholder="Search tracks, artists and genres..." className="header-search-input h-11 w-full rounded-xl border border-white/[0.07] pl-11 pr-10 text-sm outline-none transition placeholder:text-zinc-500 focus:border-pink-300/40" aria-label="Search tracks, artists and genres" aria-expanded={open && Boolean(value.trim())} />
        {loading && <LoaderCircle size={15} className="absolute right-3 top-1/2 animate-spin text-pink-300" />}
      </div>
      {open && value.trim() && <div className="header-search-dropdown absolute left-0 right-0 top-[calc(100%+10px)] overflow-hidden rounded-2xl border border-pink-200/20 bg-transparent p-2 shadow-[0_24px_80px_rgba(0,0,0,0.18)] backdrop-blur-2xl">
        <div className="flex items-center justify-between px-3 py-2"><span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-pink-400">Search results</span><button onClick={onExplore} className="inline-flex items-center gap-1 text-[10px] text-zinc-500 hover:text-pink-400">Explore all <ArrowUpRight size={12} /></button></div>
        {artistMatches.map((artist) => <button key={`artist-${artist}`} onClick={() => { onOpenArtist(artist); setOpen(false); onChange(""); }} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-pink-200/20"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-pink-200/40 text-pink-500"><Users size={16} /></span><span className="min-w-0 flex-1"><span className="block truncate text-xs font-semibold">{artist}</span><span className="mt-1 block text-[10px] text-zinc-500">Artist profile · {tracks.filter((track) => track.artist.toLowerCase() === artist.toLowerCase()).length} tracks</span></span><span className="text-[10px] text-pink-400">Profile</span></button>)}
        {results.map((track) => <button key={track.id} onClick={() => selectTrack(track)} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-pink-200/20"><span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-pink-200/40 text-pink-500">{track.cover ? <img src={track.cover} alt="" className="h-full w-full object-cover" /> : <Music2 size={16} />}</span><span className="min-w-0 flex-1"><span className="block truncate text-xs font-semibold">{track.title}</span><span className="mt-1 flex items-center gap-1 truncate text-[10px] text-zinc-500"><UserRound size={10} />{track.artist} · {track.genre}</span></span><span className="text-[10px] text-pink-400">Play</span></button>)}
        {!results.length && !artistMatches.length && <p className="px-3 py-5 text-center text-xs text-zinc-500">{loading ? "Searching…" : "Не удалось найти то, что ты искал. Попробуй другой запрос."}</p>}
      </div>}
    </div>
  );
}
