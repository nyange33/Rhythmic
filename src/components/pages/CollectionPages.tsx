import { Check, Disc3, Heart, ListMusic, Plus, X } from "lucide-react";
import type { Track } from "../../types/track";
import { TrackRow } from "../musicComponents";

type Collection = {
  id: number;
  name: string;
  type: "Playlist" | "Album";
  trackIds: number[];
};

type Page = "home" | "library" | "liked" | "notifications" | "playlists";

type Props = {
  page: Exclude<Page, "home">;
  tracks: Track[];
  likedIds: number[];
  playlists: Collection[];
  playingId: number | null;
  audioError: string | null;
  onPageChange: (page: Page) => void;
  onPlay: (id: number) => void;
  onLike: (id: number) => void;
  onOpenArtist?: (artistName: string) => void;
  onCreateCollection: () => void;
  onDeleteCollection: (id: number) => void;
  onToggleCollectionTrack: (collectionId: number, trackId: number) => void;
};

export default function CollectionPages({
  page,
  tracks,
  likedIds,
  playlists,
  playingId,
  audioError,
  onPageChange,
  onPlay,
  onLike,
  onOpenArtist,
  onCreateCollection,
  onDeleteCollection,
  onToggleCollectionTrack,
}: Props) {
  return (
    <div className="page-transition px-5 py-10 lg:px-10">
      {page === "library" && (
        <>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-400">Your collection</p>
          <h1 className="mt-2 text-3xl font-bold">Library</h1>
          <p className="mt-2 text-sm text-zinc-500">Вся музыка в одном месте — треки и созданные коллекции.</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <button onClick={() => onPageChange("liked")} className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5 text-left transition hover:border-amber-400/30">
              <Heart className="mb-8 text-amber-400" size={22} />
              <h2 className="font-semibold">Liked tracks</h2>
              <p className="mt-1 text-xs text-zinc-500">{likedIds.length} tracks</p>
            </button>
            {playlists.map((item) => (
              <button key={item.id} onClick={() => onPageChange("playlists")} className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5 text-left transition hover:border-amber-400/30">
                <ListMusic className="mb-8 text-amber-400" size={22} />
                <h2 className="font-semibold">{item.name}</h2>
                <p className="mt-1 text-xs text-zinc-500">{item.type} · {item.trackIds.length} tracks</p>
              </button>
            ))}
          </div>
          <h2 className="mt-10 text-xl font-bold">Recently added</h2>
          <div className="mt-4 space-y-1">
            {tracks.map((track) => (
              <TrackRow key={track.id} track={track} active={track.id === playingId} liked={likedIds.includes(track.id)} onPlay={() => onPlay(track.id)} onLike={() => onLike(track.id)} onOpenArtist={onOpenArtist} />
            ))}
          </div>
        </>
      )}

      {page === "liked" && (
        <>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-400">Your favorites</p>
          <h1 className="mt-2 text-3xl font-bold">Liked tracks</h1>
          <p className="mt-2 text-sm text-zinc-500">Треки, которые ты отметил сердечком. Список сохраняется в этом браузере.</p>
          <div className="mt-8 space-y-1">
            {tracks.filter((track) => likedIds.includes(track.id)).map((track) => (
              <TrackRow key={track.id} track={track} active={track.id === playingId} liked onPlay={() => onPlay(track.id)} onLike={() => onLike(track.id)} onOpenArtist={onOpenArtist} />
            ))}
          </div>
          {likedIds.length === 0 && (
            <div className="mt-8 rounded-2xl border border-white/[0.07] p-10 text-center">
              <Heart className="mx-auto text-amber-400" size={30} />
              <h2 className="mt-4 font-semibold">Пока ничего нет</h2>
              <p className="mt-2 text-sm text-zinc-500">Нажми на сердечко рядом с треком, чтобы добавить его сюда.</p>
              <button onClick={() => onPageChange("home")} className="mt-5 rounded-xl bg-amber-400 px-4 py-2 text-sm font-semibold text-[#191714]">Найти музыку</button>
            </div>
          )}
        </>
      )}

      {page === "notifications" && (
        <>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-400">Updates</p>
          <h1 className="mt-2 text-3xl font-bold">Notifications</h1>
          <p className="mt-2 text-sm text-zinc-500">Ошибки приложения и обновления артистов, на которых ты подписан.</p>
          <div className="mt-8 space-y-3">
            {audioError && (
              <div className="flex gap-3 rounded-2xl border border-red-400/20 bg-red-400/[0.05] p-4">
                <X className="mt-1 text-red-300" size={18} />
                <div><p className="text-sm font-semibold text-red-200">Ошибка воспроизведения</p><p className="mt-1 text-sm text-zinc-400">{audioError}</p></div>
              </div>
            )}
            <div className="flex gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4">
              <Disc3 className="mt-1 text-amber-400" size={19} />
              <div><p className="text-sm font-semibold">Новые релизы появятся здесь</p><p className="mt-1 text-sm text-zinc-500">Когда будет подключена система подписок, здесь будут отображаться новые треки артистов, на которых ты подписан.</p><span className="mt-3 inline-flex rounded-full bg-amber-400/10 px-2 py-1 text-[10px] text-amber-300">Artist updates</span></div>
            </div>
            {!audioError && (
              <div className="flex gap-3 rounded-2xl border border-white/[0.05] p-4">
                <Check className="mt-1 text-amber-400" size={18} />
                <div><p className="text-sm font-semibold">Всё работает</p><p className="mt-1 text-sm text-zinc-500">Сейчас нет активных ошибок приложения.</p></div>
              </div>
            )}
          </div>
        </>
      )}

      {page === "playlists" && (
        <>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div><p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-400">Organize your sound</p><h1 className="mt-2 text-3xl font-bold">Playlists & albums</h1><p className="mt-2 text-sm text-zinc-500">Создавай коллекции, добавляй треки или удаляй ненужные.</p></div>
            <button onClick={onCreateCollection} className="flex items-center gap-2 rounded-xl bg-amber-400 px-4 py-3 text-sm font-semibold text-[#191714] hover:bg-amber-300"><Plus size={17} /> Create playlist</button>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {playlists.map((item) => (
              <article key={item.id} className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5">
                <div className="flex items-start justify-between"><div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-400/10 text-amber-400">{item.type === "Album" ? <Disc3 size={22} /> : <ListMusic size={22} />}</div><button onClick={() => onDeleteCollection(item.id)} aria-label="Удалить коллекцию" className="rounded-lg p-2 text-zinc-600 hover:bg-red-400/10 hover:text-red-300"><X size={17} /></button></div>
                <h2 className="mt-5 font-semibold">{item.name}</h2>
                <p className="mt-1 text-xs text-zinc-500">{item.type} · {item.trackIds.length} tracks</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {tracks.map((track) => (
                    <button key={track.id} onClick={() => onToggleCollectionTrack(item.id, track.id)} className={`rounded-lg px-2.5 py-1.5 text-[10px] ${item.trackIds.includes(track.id) ? "bg-amber-400 text-[#191714]" : "bg-white/[0.05] text-zinc-500 hover:text-white"}`}>
                      {item.trackIds.includes(track.id) ? "✓ " : "+ "}{track.title}
                    </button>
                  ))}
                </div>
              </article>
            ))}
          </div>
          {playlists.length === 0 && <div className="mt-8 rounded-2xl border border-dashed border-white/10 p-10 text-center text-sm text-zinc-500">Коллекций пока нет. Создай первый плейлист или альбом.</div>}
        </>
      )}
    </div>
  );
}
