import type { Track as ApiTrack } from "../api/tracks";
import type { Album } from "../api/albums";
import type { Playlist } from "../api/playlists";
import type { Track } from "../types/track";
import type { PlaylistItem } from "../types/playlist";

const gradients = [
  "from-pink-500 to-pink-400",
  "from-pink-500 to-pink-700",
  "from-stone-400 to-pink-600",
  "from-stone-700 to-pink-400",
  "from-yellow-500 to-stone-800",
];

export function formatTrackTime(seconds: number) {
  const safeSeconds = Math.max(0, Math.floor(seconds || 0));
  return `${Math.floor(safeSeconds / 60)}:${String(safeSeconds % 60).padStart(2, "0")}`;
}

function formatCount(value: number) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (value >= 1_000) return `${Math.round(value / 1_000)}K`;
  return String(value || 0);
}

export function mapApiTrack(apiTrack: ApiTrack, index: number, fallbackTracks: Track[]): Track {
  const fallback = fallbackTracks.find((track) => track.backendId === apiTrack.id)
    ?? fallbackTracks.find((track) => track.title.toLowerCase() === apiTrack.title.toLowerCase() && track.artist.toLowerCase() === apiTrack.artist.toLowerCase());
  const parsedId = Number(apiTrack.id);
  const id = Number.isSafeInteger(parsedId) && parsedId > 0 ? parsedId : (fallback?.id ?? Math.max(0, ...fallbackTracks.map((track) => track.id)) + index + 1);
  return {
    id,
    backendId: apiTrack.id,
    artistId: apiTrack.artist_id,
    title: apiTrack.title,
    artist: apiTrack.artist,
    album: apiTrack.album || fallback?.album || "",
    genre: apiTrack.genre || fallback?.genre || "Electronic",
    duration: formatTrackTime(apiTrack.duration || (fallback ? Number(fallback.duration.split(":")[0]) * 60 + Number(fallback.duration.split(":")[1]) : 0)),
    plays: formatCount(apiTrack.listen_count || 0),
    likes: formatCount(apiTrack.likes_count || 0),
    color: fallback?.color || gradients[index % gradients.length],
    audio: apiTrack.audio_url || fallback?.audio || "",
    cover: apiTrack.cover_url || fallback?.cover || (id <= 5 ? `/covers/${id}.jpg` : undefined),
  };
}

function numericId(value: string, index: number) {
  const parsed = Number(value);
  if (Number.isSafeInteger(parsed) && parsed > 0) return parsed;
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  return 100_000 + (hash % 800_000) + index;
}

export function mapApiPlaylist(playlist: Playlist, index: number, tracks: Track[]): PlaylistItem {
  return {
    id: numericId(playlist.id, index),
    backendId: playlist.id,
    name: playlist.name,
    type: "Playlist",
    trackIds: (playlist.track_ids || []).map((trackId) => tracks.find((track) => track.backendId === trackId)?.id).filter((id): id is number => id !== undefined),
    description: playlist.description,
    coverUrl: playlist.cover_url,
    isPublic: playlist.is_public,
  };
}

export function mapApiAlbum(album: Album, index: number, tracks: Track[]): PlaylistItem {
  return {
    id: numericId(album.id, index + 100),
    backendId: album.id,
    name: album.title,
    type: "Album",
    trackIds: (album.track_ids || []).map((trackId) => tracks.find((track) => track.backendId === trackId)?.id).filter((id): id is number => id !== undefined),
    coverUrl: album.cover_url,
  };
}
