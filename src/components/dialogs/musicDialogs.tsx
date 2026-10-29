import type { FormEvent } from "react";
import { Disc3, FileAudio, ImagePlus, X } from "lucide-react";

export type PlaylistType = "Playlist" | "Album";
export type UploadType = "track" | "album";

type PlaylistDialogProps = {
  open: boolean;
  name: string;
  type: PlaylistType;
  onNameChange: (value: string) => void;
  onTypeChange: (value: PlaylistType) => void;
  onClose: () => void;
  onCreate: () => void;
  canCreateAlbum?: boolean;
};

export function PlaylistDialog({ open, name, type, onNameChange, onTypeChange, onClose, onCreate, canCreateAlbum = true }: PlaylistDialogProps) {
  if (!open) return null;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (name.trim()) onCreate();
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <form onSubmit={handleSubmit} className="w-full max-w-md rounded-3xl border border-white/10 bg-[#242424] p-6 shadow-2xl">
        <div className="flex items-center justify-between"><h2 className="text-xl font-bold">Create playlist or album</h2><button type="button" onClick={onClose} aria-label="Close" className="text-zinc-500 hover:text-white"><X size={20} /></button></div>
        <label className="mt-6 block text-xs text-zinc-400">Playlist or album</label>
        <div className="mt-2 flex gap-2">
          <button type="button" onClick={() => onTypeChange("Playlist")} className={`flex-1 rounded-xl py-2 text-sm ${type === "Playlist" ? "bg-pink-400 text-[#191714]" : "bg-black/20 text-zinc-400"}`}>Playlist</button>
          <button type="button" disabled={!canCreateAlbum} onClick={() => onTypeChange("Album")} className={`flex-1 rounded-xl py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40 ${type === "Album" ? "bg-pink-400 text-[#191714]" : "bg-black/20 text-zinc-400"}`}><Disc3 className="mr-1 inline" size={14} /> Album</button>
        </div>
        <label className="mt-4 block text-xs text-zinc-400">Name</label>
        <input autoFocus value={name} onChange={(event) => onNameChange(event.target.value)} placeholder="e.g. Late night" className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm outline-none focus:border-pink-400/50" />
<div className="mt-5 flex justify-end gap-2"><button type="button" onClick={onClose} className="rounded-xl px-4 py-2 text-sm text-zinc-400 hover:text-white">Cancel</button><button disabled={!name.trim()} className="rounded-xl bg-pink-400 px-4 py-2 text-sm font-semibold text-[#191714] disabled:opacity-50">Create</button></div>
      </form>
    </div>
  );
}

type UploadDialogProps = {
  open: boolean;
  type: UploadType;
  title: string;
  artistName: string;
  files: File[];
  coverFile: File | null;
  genre: string;
  message: string;
  onTypeChange: (value: UploadType) => void;
  onTitleChange: (value: string) => void;
  onFilesChange: (files: File[]) => void;
  onCoverChange: (file: File | null) => void;
  onGenreChange: (genre: string) => void;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export function UploadMusicDialog({ open, type, title, artistName, files, coverFile, genre, message, onTypeChange, onTitleChange, onFilesChange, onCoverChange, onGenreChange, onClose, onSubmit }: UploadDialogProps) {
  if (!open) return null;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    onSubmit(event);
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <form onSubmit={handleSubmit} className="w-full max-w-xl rounded-3xl border border-white/10 bg-[#242424] p-6 shadow-2xl">
        <div className="flex items-center justify-between"><div><h2 className="text-xl font-bold">Upload music</h2><p className="mt-1 text-xs text-zinc-500">Добавь трек или выбери файлы альбома</p></div><button type="button" onClick={onClose} aria-label="Close" className="text-zinc-500 hover:text-white"><X size={20} /></button></div>
        <div className="mt-6 flex rounded-xl bg-black/20 p-1"><button type="button" onClick={() => onTypeChange("track")} className={`flex-1 rounded-lg py-2 text-sm ${type === "track" ? "bg-pink-400 text-[#191714]" : "text-zinc-500"}`}>Single track</button><button type="button" onClick={() => onTypeChange("album")} className={`flex-1 rounded-lg py-2 text-sm ${type === "album" ? "bg-pink-400 text-[#191714]" : "text-zinc-500"}`}>Album</button></div>
        <label className="mt-5 block text-xs text-zinc-400">{type === "album" ? "Album title" : "Track title"}</label>
        <input required value={title} onChange={(event) => onTitleChange(event.target.value)} placeholder={type === "album" ? "Album name" : "Track name"} className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm outline-none focus:border-pink-400/50" />
        <div className="mt-4 rounded-xl border border-pink-200/15 bg-pink-200/[0.06] px-4 py-3"><p className="text-xs font-medium">Publishing as {artistName}</p><p className="mt-1 text-[11px] text-zinc-500">Имя артиста автоматически привязано к твоему аккаунту.</p></div>
        <label className="mt-4 block text-xs text-zinc-400">Genre</label>
        <select value={genre} onChange={(event) => onGenreChange(event.target.value)} className="genre-select mt-2 w-full rounded-xl border border-white/10 bg-[#191919] px-4 py-3 text-sm outline-none focus:border-pink-400/50">
          {['Electronic', 'Pop', 'Rock', 'Hip-Hop', 'Rap', 'R&B', 'Jazz', 'Classical', 'Ambient', 'Metal', 'Indie', 'House', 'Techno', 'Drum & Bass', 'Lo-fi', 'Other'].map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
        <label className="mt-4 flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-white/15 bg-black/10 p-4 transition hover:border-pink-400/40">
          <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-pink-200/10 text-pink-300"><ImagePlus size={23} /></span>
          <span className="min-w-0 flex-1"><span className="block text-sm font-semibold">{type === "album" ? "Album cover" : "Track cover"}</span><span className="mt-1 block truncate text-xs text-zinc-500">{coverFile ? coverFile.name : "Choose image · JPG, PNG, WEBP (up to 5 MB)"}</span></span>
          <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={(event) => onCoverChange(event.target.files?.[0] || null)} className="sr-only" />
        </label>
        {coverFile && <button type="button" onClick={() => onCoverChange(null)} className="mt-2 text-xs text-zinc-500 hover:text-pink-300">Remove cover</button>}
        <label className="mt-4 flex cursor-pointer flex-col items-center rounded-2xl border border-dashed border-white/15 bg-black/10 px-5 py-8 text-center hover:border-pink-400/40"><FileAudio size={27} className="text-pink-400" /><span className="mt-3 text-sm font-semibold">Choose audio files</span><span className="mt-1 text-xs text-zinc-500">MP3, WAV, OGG · {files.length} selected</span><input required type="file" accept="audio/*" multiple={type === "album"} onChange={(event) => onFilesChange(Array.from(event.target.files || []))} className="sr-only" /></label>
        {files.length > 0 && <p className="mt-2 truncate text-xs text-zinc-400">{files.map((file) => file.name).join(", ")}</p>}
        {message && <p className="mt-4 rounded-xl bg-pink-400/10 p-3 text-xs leading-5 text-pink-200">{message}</p>}
        <div className="mt-5 flex justify-end gap-2"><button type="button" onClick={onClose} className="rounded-xl px-4 py-2 text-sm text-zinc-400 hover:text-white">Cancel</button><button className="rounded-xl bg-pink-400 px-4 py-2 text-sm font-semibold text-[#191714]">Continue</button></div>
      </form>
    </div>
  );
}
