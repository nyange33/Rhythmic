import type { FormEvent } from "react";
import { Disc3, FileAudio, X } from "lucide-react";

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
};

export function PlaylistDialog({ open, name, type, onNameChange, onTypeChange, onClose, onCreate }: PlaylistDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <form onSubmit={(event) => { event.preventDefault(); onCreate(); }} className="w-full max-w-md rounded-3xl border border-white/10 bg-[#242424] p-6 shadow-2xl">
        <div className="flex items-center justify-between"><h2 className="text-xl font-bold">Create playlist or album</h2><button type="button" onClick={onClose} aria-label="Close" className="text-zinc-500 hover:text-white"><X size={20} /></button></div>
        <label className="mt-6 block text-xs text-zinc-400">Playlist or album</label>
        <div className="mt-2 flex gap-2">
          <button type="button" onClick={() => onTypeChange("Playlist")} className={`flex-1 rounded-xl py-2 text-sm ${type === "Playlist" ? "bg-pink-400 text-[#191714]" : "bg-black/20 text-zinc-400"}`}>Playlist</button>
          <button type="button" onClick={() => onTypeChange("Album")} className={`flex-1 rounded-xl py-2 text-sm ${type === "Album" ? "bg-pink-400 text-[#191714]" : "bg-black/20 text-zinc-400"}`}><Disc3 className="mr-1 inline" size={14} /> Album</button>
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
  artist: string;
  files: File[];
  message: string;
  onTypeChange: (value: UploadType) => void;
  onTitleChange: (value: string) => void;
  onArtistChange: (value: string) => void;
  onFilesChange: (files: File[]) => void;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export function UploadMusicDialog({ open, type, title, artist, files, message, onTypeChange, onTitleChange, onArtistChange, onFilesChange, onClose, onSubmit }: UploadDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <form onSubmit={onSubmit} className="w-full max-w-xl rounded-3xl border border-white/10 bg-[#242424] p-6 shadow-2xl">
        <div className="flex items-center justify-between"><div><h2 className="text-xl font-bold">Upload music</h2><p className="mt-1 text-xs text-zinc-500">Добавь трек или выбери файлы альбома</p></div><button type="button" onClick={onClose} aria-label="Close" className="text-zinc-500 hover:text-white"><X size={20} /></button></div>
        <div className="mt-6 flex rounded-xl bg-black/20 p-1"><button type="button" onClick={() => onTypeChange("track")} className={`flex-1 rounded-lg py-2 text-sm ${type === "track" ? "bg-pink-400 text-[#191714]" : "text-zinc-500"}`}>Single track</button><button type="button" onClick={() => onTypeChange("album")} className={`flex-1 rounded-lg py-2 text-sm ${type === "album" ? "bg-pink-400 text-[#191714]" : "text-zinc-500"}`}>Album</button></div>
        <label className="mt-5 block text-xs text-zinc-400">{type === "album" ? "Album title" : "Track title"}</label>
        <input required value={title} onChange={(event) => onTitleChange(event.target.value)} placeholder={type === "album" ? "Album name" : "Track name"} className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm outline-none focus:border-pink-400/50" />
        <label className="mt-4 block text-xs text-zinc-400">Artist</label>
        <input value={artist} onChange={(event) => onArtistChange(event.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm outline-none focus:border-pink-400/50" />
        <label className="mt-4 flex cursor-pointer flex-col items-center rounded-2xl border border-dashed border-white/15 bg-black/10 px-5 py-8 text-center hover:border-pink-400/40"><FileAudio size={27} className="text-pink-400" /><span className="mt-3 text-sm font-semibold">Choose audio files</span><span className="mt-1 text-xs text-zinc-500">MP3, WAV, OGG · {files.length} selected</span><input required type="file" accept="audio/*" multiple={type === "album"} onChange={(event) => onFilesChange(Array.from(event.target.files || []))} className="sr-only" /></label>
        {files.length > 0 && <p className="mt-2 truncate text-xs text-zinc-400">{files.map((file) => file.name).join(", ")}</p>}
        {message && <p className="mt-4 rounded-xl bg-pink-400/10 p-3 text-xs leading-5 text-pink-200">{message}</p>}
        <div className="mt-5 flex justify-end gap-2"><button type="button" onClick={onClose} className="rounded-xl px-4 py-2 text-sm text-zinc-400 hover:text-white">Cancel</button><button className="rounded-xl bg-pink-400 px-4 py-2 text-sm font-semibold text-[#191714]">Continue</button></div>
      </form>
    </div>
  );
}
