import ProfilePage from "./profilePage";
import { tracks as fallbackTracks } from "./data/tracks";
import { useAudioPlayer } from "./hooks/useAudioPlayer";
import { useEqualizer } from "./hooks/useEqualizer";
import { EQ_FREQUENCIES } from "./audio/audioEngine";
import type { Track } from "./types/track";
import Spectrum from "./components/player/spectrum";
import { Cover, NavItem, TrackRow } from "./components/musicComponents";
import MusicPages from "./components/pages/musicPages";
import { PlaylistDialog, UploadMusicDialog, type PlaylistType, type UploadType } from "./components/dialogs/musicDialogs";
import AuthDialog, { type AuthMode } from "./components/dialogs/authDialog";
import ExplorePage from "./components/pages/explorePage";
import ArtistPage from "./components/pages/artistPage";
import AlbumDetailPage from "./components/pages/albumDetailPage";
import HeaderSearch from "./components/headerSearch";
import LandingPage from "./components/pages/landingPage";
import { getAllTracks, createTrack as createApiTrack, uploadAudio, uploadCover } from "./api/tracks";
import { getUserPlaylists, createPlaylist as createApiPlaylist, deletePlaylist as deleteApiPlaylist, addTrackToPlaylist, removeTrackFromPlaylist } from "./api/playlists";
import { getAllAlbums, createAlbum, addTrackToAlbum, type Album } from "./api/albums";
import { getUserLikes, createLike, deleteLike } from "./api/likes";
import { getCurrentUser, updateProfile, type AuthResponse } from "./api/auth";
import type { PlaylistItem } from "./types/playlist";
import { mapApiAlbum, mapApiPlaylist, mapApiTrack } from "./utils/trackAdapter";

import {
  Bell,
  Disc3,
  FileAudio,
  ChevronDown,
  Compass,
  Heart,
  Home,
  Library,
  ListMusic,
  Menu,
  MoreHorizontal,
  Pause,
  Play,
  Plus,
  Repeat2,
  Search,
  Sun,
  Moon,
  Shuffle,
  SkipBack,
  SkipForward,
  Volume2,
  Upload,
  X,
} from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";

const genres = [
  {
    name: "Electronic",
    description: "Synths, beats & future sounds",
    color: "from-pink-400 to-pink-600",
  },
  {
    name: "Hip-Hop",
    description: "Beats, bars & underground",
    color: "from-pink-400 to-pink-600",
  },
  {
    name: "R&B",
    description: "Smooth nights & soulful vibes",
    color: "from-pink-400 to-stone-700",
  },
  {
    name: "Ambient",
    description: "Atmospheric sounds to focus",
    color: "from-stone-300 to-pink-600",
  },
];

const eqBands = EQ_FREQUENCIES.map((frequency) => ({
  frequency: String(frequency),
  label: frequency >= 1000 ? `${frequency / 1000} kHz` : `${frequency} Hz`,
}));

function ArtistAvatar({ size = "large", avatarUrl, showArtistDefault = false }: { size?: "small" | "large"; avatarUrl?: string | null; showArtistDefault?: boolean }) {
  const [imageFailed, setImageFailed] = useState(false);
  const src = avatarUrl || (showArtistDefault ? "/avatar/avatar.jpg" : null);
  const dimensions = size === "large" ? "h-32 w-32 sm:h-40 sm:w-40" : "h-11 w-11";

  return (
    <div className={`relative flex ${dimensions} shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-pink-400 via-stone-500 to-pink-700`}>
      {src && !imageFailed ? (
        <img
          src={src}
          alt="Profile avatar"
          className="h-full w-full object-cover"
          onError={() => setImageFailed(true)}
        />
      ) : (
        <div className="flex items-end gap-[2px]">
          {[8, 14, 20, 11, 17].map((height, index) => (
            <span key={index} className={`w-[2px] rounded-full bg-black/70 ${size === "large" ? "sm:w-2" : ""}`} style={{ height: size === "large" ? height * 2.1 : height }} />
          ))}
        </div>
      )}
    </div>
  );
}

function Logo() {
  return (
    <div className="flex items-center gap-3">
      <div className="logo-mark flex h-10 w-10 items-center justify-center rounded-xl bg-pink-400 shadow-[0_0_30px_rgba(245,196,81,0.18)]">
        <div className="flex items-end gap-[3px]">
          <span className="logo-bar h-3 w-[3px] rounded-full bg-black" />
          <span className="logo-bar h-5 w-[3px] rounded-full bg-black" />
          <span className="logo-bar h-7 w-[3px] rounded-full bg-black" />
          <span className="logo-bar h-4 w-[3px] rounded-full bg-black" />
          <span className="logo-bar h-6 w-[3px] rounded-full bg-black" />
        </div>
      </div>

      <span className="rhythmic-wordmark text-xl font-bold tracking-tight">
        Rhythmic.
      </span>
    </div>
  );
}

function Equalizer({
  open,
  onClose,
  preset,
  bands,
  presets,
  onPreset,
  onBand,
  engine,
}: {
  open: boolean;
  onClose: () => void;
  preset: string;
  bands: number[];
  presets: Record<string, number[]>;
  onPreset: (name: string) => void;
  onBand: (index: number, value: number) => void;
  engine: import("./audio/audioEngine").AudioEngine | null;
}) {
  if (!open) return null;

  return (
    <div className="absolute bottom-[calc(100%+12px)] right-4 w-[min(680px,calc(100vw-32px))] overflow-hidden rounded-3xl border border-white/[0.08] bg-[#242424]/98 p-5 shadow-2xl backdrop-blur-2xl">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-white">Equalizer</h3>
          <p className="mt-1 text-xs text-zinc-600">Real-time Web Audio EQ</p>
        </div>
        <button onClick={onClose} className="rounded-lg p-2 text-zinc-600 hover:bg-white/[0.05] hover:text-white">
          <X size={17} />
        </button>
      </div>

      <div className="mb-4 rounded-2xl border border-white/[0.05] bg-black/20 px-3 py-2">
        <Spectrum engine={engine} />
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {Object.keys(presets).map((name) => (
          <button key={name} onClick={() => onPreset(name)} className={`rounded-lg px-3 py-1.5 text-[11px] transition ${preset === name ? "bg-pink-400 text-black" : "bg-white/[0.04] text-zinc-500 hover:text-white"}`}>
            {name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-10 gap-3">
        {eqBands.map((band, index) => (
          <div key={band.frequency} className="flex flex-col items-center">
            <div className="relative h-36">
              <input type="range" min="-12" max="12" step="0.5" value={bands[index] ?? 0} onChange={(e) => onBand(index, Number(e.target.value))} className="eq-slider absolute left-1/2 top-1/2 h-32 w-2 -translate-x-1/2 -translate-y-1/2" style={{ writingMode: "vertical-lr", direction: "rtl" }} />
            </div>
            <span className="text-[9px] text-zinc-600">{band.label}</span>
            <span className="mt-1 text-[9px] tabular-nums text-zinc-500">{bands[index] > 0 ? "+" : ""}{bands[index]} dB</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const minutes = Math.floor(seconds / 60);
  const remaining = Math.floor(seconds % 60);
  return `${minutes}:${remaining.toString().padStart(2, "0")}`;
}

function parseDuration(value: string) {
  const [minutes, seconds] = value.split(":").map(Number);
  return minutes * 60 + seconds;
}

function profileNameKey(userId: string) { return `rhythmic-profile-name:${userId}`; }
function profileBioKey(userId: string) { return `rhythmic-profile-bio:${userId}`; }
function savedAlbumsKey(userId: string) { return `rhythmic-saved-albums:${userId}`; }
function withSavedProfile<T extends { id: string; username: string }>(user: T): T {
  const savedName = localStorage.getItem(profileNameKey(user.id));
  return savedName ? { ...user, username: savedName } : user;
}

export default function App() {
  const [page, setPage] = useState<"home" | "explore" | "profile" | "artist" | "album" | "library" | "liked" | "notifications" | "playlists">("home");
  const [tracks, setTracks] = useState(fallbackTracks);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<number | null>(null);
  const [selectedProfileName, setSelectedProfileName] = useState("");
  const [selectedAlbumId, setSelectedAlbumId] = useState<string | null>(null);
  const [albumReturnPage, setAlbumReturnPage] = useState<"profile" | "artist" | "library" | "playlists" | "explore" | "home">("profile");
  const [allAlbums, setAllAlbums] = useState<Album[]>([]);
  const [savedAlbumIds, setSavedAlbumIds] = useState<string[]>([]);
  const [profileBio, setProfileBio] = useState("");
  const [sessionUser, setSessionUser] = useState<AuthResponse["user"] | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [theme, setTheme] = useState<"light" | "dark">(() => localStorage.getItem("rhythmic-theme") === "dark" ? "dark" : "light");
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>("signIn");
  const [likedIds, setLikedIds] = useState<number[]>(() => {
    try { return JSON.parse(localStorage.getItem("rhythmic-liked") || "[]"); } catch { return []; }
  });
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadType, setUploadType] = useState<UploadType>("track");
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [uploadCoverFile, setUploadCoverFile] = useState<File | null>(null);
  const [uploadGenre, setUploadGenre] = useState("Electronic");
  const [uploadMessage, setUploadMessage] = useState("");
  const [playlistName, setPlaylistName] = useState("");
  const [playlistType, setPlaylistType] = useState<PlaylistType>("Playlist");
  const [playlistDialog, setPlaylistDialog] = useState(false);
  const [playlists, setPlaylists] = useState<PlaylistItem[]>([]);
  const [eqOpen, setEqOpen] = useState(false);
  const [playlistOpen, setPlaylistOpen] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  useEffect(() => {
    if (!sessionUser) {
      setAvatarUrl(null);
      return;
    }
    const avatarKey = `rhythmic-avatar:${sessionUser.role}:${sessionUser.id}`;
    setAvatarUrl(localStorage.getItem(avatarKey));
  }, [sessionUser?.id, sessionUser?.role]);

  const handleAvatarChange = (nextAvatar: string) => {
    if (!sessionUser) return;
    const avatarKey = `rhythmic-avatar:${sessionUser.role}:${sessionUser.id}`;
    localStorage.setItem(avatarKey, nextAvatar);
    setAvatarUrl(nextAvatar);
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      localStorage.removeItem("user");
      return;
    }
    let active = true;
    getCurrentUser(token).then((user) => {
      if (!active) return;
      localStorage.setItem("user", JSON.stringify(user));
      setSessionUser(withSavedProfile(user));
    }).catch((error) => {
      if (!active) return;
      console.error("Session validation failed:", error);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setSessionUser(null);
    });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    let active = true;
    getAllAlbums().then((albums) => {
      if (!active) return;
      setAllAlbums(albums.map((album) => sessionUser && album.artist_id === sessionUser.id ? { ...album, artist_name: sessionUser.username } : album));
    }).catch((error) => {
      if (active) console.error("Failed to load albums:", error);
    });
    return () => { active = false; };
  }, [sessionUser?.id, sessionUser?.username]);

  useEffect(() => {
    if (!sessionUser) {
      setProfileBio("");
      setSavedAlbumIds([]);
      return;
    }
    const storedBio = localStorage.getItem(profileBioKey(sessionUser.id));
    setProfileBio(storedBio !== null ? storedBio : sessionUser.bio || "");
    try {
      setSavedAlbumIds(JSON.parse(localStorage.getItem(savedAlbumsKey(sessionUser.id)) || "[]"));
    } catch {
      setSavedAlbumIds([]);
    }
  }, [sessionUser?.id]);

  useEffect(() => {
    let active = true;
    getAllTracks().then((apiTracks) => {
      if (!active) return;
      if (apiTracks.length) {
        const mapped = apiTracks.map((track, index) => {
          const mappedTrack = mapApiTrack(track, index, fallbackTracks);
          return sessionUser && track.artist_id === sessionUser.id ? { ...mappedTrack, artist: sessionUser.username } : mappedTrack;
        }).sort((a, b) => a.id - b.id);
        setTracks(mapped);
      }
    }).catch((error) => {
      if (active) console.error("Failed to load tracks:", error);
    });
    return () => { active = false; };
  }, [sessionUser?.id, sessionUser?.username]);

  useEffect(() => {
    if (!sessionUser) return;
    let active = true;
    const token = localStorage.getItem("token") || undefined;
    Promise.all([getUserLikes(sessionUser.id), getUserPlaylists(sessionUser.id), getAllAlbums()]).then(([likes, apiPlaylists, albums]) => {
      if (!active) return;
      const likedTrackIds = likes.map((like) => tracks.find((track) => track.backendId === like.track_id)?.id).filter((id): id is number => id !== undefined);
      setLikedIds(likedTrackIds);
      const mappedPlaylists = apiPlaylists.map((item, index) => mapApiPlaylist(item, index, tracks));
      let savedIds: string[] = [];
      try { savedIds = JSON.parse(localStorage.getItem(savedAlbumsKey(sessionUser.id)) || "[]"); } catch { savedIds = []; }
      setSavedAlbumIds(savedIds);
      const accountAlbums = albums.filter((item) => item.artist_id === sessionUser.id || savedIds.includes(item.id));
      const mappedAlbums = accountAlbums.map((item, index) => mapApiAlbum(item, index, tracks));
      const uniqueCollections = [...mappedPlaylists, ...mappedAlbums].filter((item, index, all) => !item.backendId || all.findIndex((candidate) => candidate.backendId === item.backendId && candidate.type === item.type) === index);
      setPlaylists(uniqueCollections);
      localStorage.setItem(`rhythmic-playlists:${sessionUser.id}`, JSON.stringify(uniqueCollections));
    }).catch((error) => {
      if (active && token) console.error("Failed to load account library:", error);
    });
    return () => { active = false; };
  }, [sessionUser?.id, tracks]);

  const {
    engine,
    playingId,
    currentId,
    currentTime,
    duration,
    volume,
    isPlaying,
    playTrack,
    togglePlay,
    seek,
    setVolume,
    next,
    previous,
  } = useAudioPlayer(tracks);

  const { preset, bands, presets, setBand, selectPreset } = useEqualizer(engine);
  const currentTrack = tracks.find((track) => track.id === currentId) ?? tracks[0];
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const toggleLikeTrack = (id: number) => {
    const track = tracks.find((item) => item.id === id);
    const wasLiked = likedIds.includes(id);
    setLikedIds((current) => {
      const next = wasLiked ? current.filter((item) => item !== id) : [...current, id];
      localStorage.setItem("rhythmic-liked", JSON.stringify(next));
      return next;
    });
    if (sessionUser && track?.backendId) {
      const action = wasLiked ? deleteLike(sessionUser.id, track.backendId) : createLike(sessionUser.id, track.backendId);
      void action.catch((error) => console.error("Failed to update liked tracks:", error));
    }
  };

  const savePlaylists = (next: PlaylistItem[]) => {
    setPlaylists(next);
    localStorage.setItem("rhythmic-playlists", JSON.stringify(next));
  };

  const openPage = (next: typeof page) => {
    setPage(next);
    if (next !== "playlists") setSelectedPlaylistId(null);
    if (next !== "album") setSelectedAlbumId(null);
    setMobileMenu(false);
  };

  const openArtistPage = (artistName: string) => {
    setSelectedProfileName(artistName);
    setSearchQuery("");
    openPage("artist");
  };

  const openAlbumPage = (id: string) => {
    setAlbumReturnPage(page);
    setSelectedAlbumId(id);
    setPage("album");
  };

  const handleCreatePlaylist = async () => {
    if (!sessionUser || !playlistName.trim()) return;
    const token = localStorage.getItem("token") || undefined;
    try {
      if (playlistType === "Playlist") {
        const created = await createApiPlaylist({ name: playlistName.trim(), description: "A collection made on Rhythmic", is_public: true }, sessionUser.id, token);
        savePlaylists([...playlists, mapApiPlaylist(created, playlists.length, tracks)]);
      } else {
        if (sessionUser.role !== "artist") {
          console.warn("An artist account is required to create an album.");
          return;
        }
        const created = await createAlbum({ title: playlistName.trim(), artist_id: sessionUser.id, artist_name: sessionUser.username, release_date: new Date().toISOString() }, token);
        setAllAlbums((current) => [...current.filter((album) => album.id !== created.id), created]);
        savePlaylists([...playlists, mapApiAlbum(created, playlists.length, tracks)]);
      }
      setPlaylistName("");
        setPlaylistDialog(false);
    } catch (error) {
      console.error("Failed to create playlist or album:", error);
    }
  };

  const handleDeletePlaylist = async (id: number) => {
    const item = playlists.find((playlist) => playlist.id === id);
    if (!item || item.type === "Album") return;
    try {
      const token = localStorage.getItem("token") || undefined;
      if (item.backendId) await deleteApiPlaylist(item.backendId, token);
      savePlaylists(playlists.filter((playlist) => playlist.id !== id));
      if (selectedPlaylistId === id) setSelectedPlaylistId(null);
    } catch (error) {
      console.error("Failed to delete playlist or album:", error);
    }
  };

  const handleTogglePlaylistTrack = async (playlistId: number, trackId: number) => {
    const playlist = playlists.find((item) => item.id === playlistId);
    const track = tracks.find((item) => item.id === trackId);
    if (!playlist || !track) return;
    const hasTrack = playlist.trackIds.includes(trackId);
    if (playlist.type === "Album" && (hasTrack || sessionUser?.role !== "artist" || !playlist.backendId || !allAlbums.some((album) => album.id === playlist.backendId && album.artist_id === sessionUser.id))) return;
    try {
      if (playlist.backendId && track.backendId) {
        const token = localStorage.getItem("token") || undefined;
        if (playlist.type === "Playlist") {
          if (hasTrack) await removeTrackFromPlaylist(playlist.backendId, track.backendId, token);
          else await addTrackToPlaylist(playlist.backendId, track.backendId, token);
        } else {
          await addTrackToAlbum(playlist.backendId, track.backendId, token);
          setAllAlbums((current) => current.map((album) => album.id === playlist.backendId ? { ...album, track_ids: [...(album.track_ids || []), track.backendId!] } : album));
        }
      }
      savePlaylists(playlists.map((item) => item.id === playlistId ? { ...item, trackIds: hasTrack ? item.trackIds.filter((id) => id !== trackId) : [...item.trackIds, trackId] } : item));
    } catch (error) {
      console.error("Failed to update playlist tracks:", error);
    }
  };

  const handleToggleAlbumLibrary = (albumId: string) => {
    if (!sessionUser) return;
    const album = allAlbums.find((item) => item.id === albumId);
    if (!album || album.artist_id === sessionUser.id) return;
    const isSaved = savedAlbumIds.includes(albumId);
    const nextIds = isSaved ? savedAlbumIds.filter((id) => id !== albumId) : [...savedAlbumIds, albumId];
    setSavedAlbumIds(nextIds);
    localStorage.setItem(savedAlbumsKey(sessionUser.id), JSON.stringify(nextIds));
    const collectionExists = playlists.some((item) => item.type === "Album" && item.backendId === albumId);
    if (!isSaved && !collectionExists) {
      savePlaylists([...playlists, mapApiAlbum(album, playlists.length, tracks)]);
    } else if (isSaved) {
      savePlaylists(playlists.filter((item) => !(item.type === "Album" && item.backendId === albumId)));
    }
  };

  const handleSaveProfile = async (nextName: string, nextBio: string) => {
    if (!sessionUser) return;
    const normalizedName = nextName.trim();
    const token = localStorage.getItem("token");
    if (!normalizedName || !token) return;
    try {
      const savedUser = await updateProfile({ username: normalizedName, bio: nextBio }, token);
      const updatedUser = { ...sessionUser, ...savedUser };
      localStorage.setItem(profileNameKey(sessionUser.id), normalizedName);
      localStorage.setItem(profileBioKey(sessionUser.id), nextBio);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setSessionUser(updatedUser);
      setSelectedProfileName(normalizedName);
      setProfileBio(nextBio);
      setTracks((current) => current.map((track) => track.artistId === sessionUser.id || track.artist.toLowerCase() === sessionUser.username.toLowerCase() ? { ...track, artist: normalizedName } : track));
      setAllAlbums((current) => current.map((album) => album.artist_id === sessionUser.id ? { ...album, artist_name: normalizedName } : album));
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Не удалось сохранить профиль.");
    }
  };

  const handleAddTrackToAlbum = async (albumId: string, trackId: number) => {
    if (!sessionUser || sessionUser.role !== "artist") return;
    const album = allAlbums.find((item) => item.id === albumId);
    const track = tracks.find((item) => item.id === trackId);
    if (!album || album.artist_id !== sessionUser.id || !track?.backendId) return;
    const currentTrackIds = album.track_ids || [];
    if (currentTrackIds.includes(track.backendId)) return;
    try {
      const token = localStorage.getItem("token") || undefined;
      await addTrackToAlbum(albumId, track.backendId, token);
      setAllAlbums((current) => current.map((item) => item.id === albumId ? { ...item, track_ids: [...(item.track_ids || []), track.backendId!] } : item));
      setPlaylists((current) => current.map((item) => item.type === "Album" && item.backendId === albumId && !item.trackIds.includes(trackId) ? { ...item, trackIds: [...item.trackIds, trackId] } : item));
    } catch (error) {
      console.error("Failed to add track to album:", error);
    }
  };

  const getAudioDuration = (file: File) => new Promise<number>((resolve) => {
    const objectUrl = URL.createObjectURL(file);
    const audio = new Audio();
    audio.preload = "metadata";
    audio.onloadedmetadata = () => {
      const duration = Number.isFinite(audio.duration) ? Math.max(1, Math.round(audio.duration)) : 180;
      URL.revokeObjectURL(objectUrl);
      resolve(duration);
    };
    audio.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(180);
    };
    audio.src = objectUrl;
  });

  const handleUpload = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!sessionUser || sessionUser.role !== "artist") {
      setUploadMessage("Публиковать музыку могут только аккаунты артиста.");
      return;
    }
    if (!uploadTitle.trim() || uploadFiles.length === 0) {
      setUploadMessage("Укажи название и выбери аудиофайл.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setUploadMessage("Сессия закончилась. Войди в аккаунт ещё раз.");
      return;
    }

    if (uploadCoverFile && (!uploadCoverFile.type.startsWith("image/") || uploadCoverFile.size > 5 * 1024 * 1024)) {
      setUploadMessage("Обложка должна быть изображением размером не больше 5 МБ.");
      return;
    }

    setUploadMessage("Загружаю аудио и сохраняю метаданные…");
    const createdTracks: Track[] = [];
    const createdTrackIds: string[] = [];
    try {
      const coverUrl = uploadCoverFile ? (await uploadCover(uploadCoverFile, token)).cover_url : "";
      for (const [index, file] of uploadFiles.entries()) {
        const uploaded = await uploadAudio(file, token);
        const duration = uploaded.duration > 0 ? uploaded.duration : await getAudioDuration(file);
        const fileTitle = file.name.replace(/\.[^.]+$/, "").trim();
        const created = await createApiTrack({
          title: uploadType === "track" ? uploadTitle.trim() : fileTitle || `${uploadTitle.trim()} ${index + 1}`,
          artist: sessionUser.username,
          album: uploadType === "album" ? uploadTitle.trim() : "",
          genre: uploadGenre,
          duration,
          audio_url: uploaded.audio_url,
          cover_url: coverUrl,
          artist_id: sessionUser.id,
        }, token);
        createdTrackIds.push(created.id);
        createdTracks.push(mapApiTrack(created, createdTracks.length, [...tracks, ...createdTracks]));
      }

      if (uploadType === "album") {
        const createdAlbum = await createAlbum({
          title: uploadTitle.trim(),
          artist_id: sessionUser.id,
          artist_name: sessionUser.username,
          release_date: new Date().toISOString(),
          cover_url: coverUrl,
          genre: uploadGenre,
          track_ids: createdTrackIds,
        }, token);
        setAllAlbums((current) => [...current.filter((album) => album.id !== createdAlbum.id), createdAlbum]);
        savePlaylists([...playlists, mapApiAlbum(createdAlbum, playlists.length, [...tracks, ...createdTracks])]);
      }

      setTracks((current) => [...current, ...createdTracks]);
      setUploadMessage(`Готово: ${createdTracks.length} ${createdTracks.length === 1 ? "трек опубликован" : "треков опубликовано"}.`);
      setUploadFiles([]);
      setUploadCoverFile(null);
      setUploadGenre("Electronic");
      setUploadTitle("");
      setUploadOpen(false);
    } catch (error) {
      if (createdTracks.length) setTracks((current) => [...current, ...createdTracks]);
      setUploadMessage(error instanceof Error ? error.message : "Не удалось загрузить музыку.");
    }
  };

  const handlePlayTrack = async (id: number) => {
    const track = tracks.find((item) => item.id === id);
    if (track) await playTrack(track);
  };

  if (!sessionUser) {
    return (
      <>
        <LandingPage
          theme={theme}
          onSignUp={() => { setAuthMode("signUp"); setAuthOpen(true); }}
          onSignIn={() => { setAuthMode("signIn"); setAuthOpen(true); }}
          onToggleTheme={() => { const nextTheme = theme === "light" ? "dark" : "light"; setTheme(nextTheme); localStorage.setItem("rhythmic-theme", nextTheme); }}
        />
        <AuthDialog open={authOpen} mode={authMode} theme={theme} onModeChange={setAuthMode} onClose={() => setAuthOpen(false)} onAuthenticated={(response) => { setSessionUser(withSavedProfile(response.user)); setAuthOpen(false); }} />
      </>
    );
  }

  return (
    <div className="app-shell min-h-screen bg-[#202020] text-white" data-theme={theme}>
      
      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-[250px] border-r border-white/[0.06] bg-[#242424] lg:block">
        <div className="flex h-full flex-col px-5 py-6">
          <button
            type="button"
            onClick={() => window.location.reload()}
            aria-label="Вернуться на главную и обновить страницу"
            className="flex w-full justify-center rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-pink-400/40"
          >
            <Logo />
          </button>

          <div className="mt-10">
            <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-700">
              Discover
            </p>

            <div className="space-y-1">
              <NavItem
                icon={Home}
                active={page === "home"}
                onClick={() => openPage("home")}
              >
                Home
              </NavItem>

              <NavItem icon={Compass} active={page === "explore"} onClick={() => openPage("explore")}>Explore</NavItem>

              <NavItem icon={Bell} active={page === "notifications"} onClick={() => openPage("notifications")}>Notifications</NavItem>
            </div>
          </div>

          <div className="mt-8">
            <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-700">
              Your music
            </p>

            <div className="space-y-1">
              <NavItem icon={Library} active={page === "library"} onClick={() => openPage("library")}>Library</NavItem>
              <NavItem icon={ListMusic} active={page === "playlists"} onClick={() => openPage("playlists")}>Playlists / albums</NavItem>
              <NavItem icon={Heart} active={page === "liked"} onClick={() => openPage("liked")}>Liked tracks</NavItem>
            </div>
          </div>

          <div className="mt-auto space-y-3">
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.025] p-4">
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-pink-400/10 text-pink-400">
                <Upload size={17} />
              </div>

              <p className="text-sm font-medium text-white">Upload music</p>
              <p className="mt-1 text-xs leading-5 text-zinc-600">
                Share your sound with the world.
              </p>

              {sessionUser?.role === "artist" ? <button onClick={() => { setUploadType("track"); setUploadMessage(""); setUploadFiles([]); setUploadCoverFile(null); setUploadGenre("Electronic"); setUploadOpen(true); }} className="upload-track-button mt-4 w-full rounded-xl bg-pink-200 py-2 text-xs font-semibold text-black transition hover:bg-pink-100">Upload track / album</button> : <p className="mt-3 text-[10px] leading-4 text-zinc-600">Artist accounts can publish music.</p>}
            </div>

            <button
              onClick={() => { setSelectedProfileName(sessionUser.username); setPage("profile"); }}
              className="group w-full rounded-2xl border border-white/[0.07] bg-white/[0.035] p-3 text-left transition hover:border-pink-400/20 hover:bg-pink-400/[0.05]"
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <ArtistAvatar size="small" avatarUrl={avatarUrl} showArtistDefault={sessionUser?.role === "artist" && sessionUser.username.trim().toLowerCase() === "королевски 17"} />
                  <span className="absolute bottom-0.5 right-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#242424] bg-pink-300" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <p className="truncate text-sm font-semibold text-white">
                      {sessionUser?.username || "Rhythmic listener"}
                    </p>
                  </div>
                  <p className="mt-0.5 truncate text-[10px] text-zinc-600">
                    View profile · {sessionUser?.role === "artist" ? "Artist" : "Listener"}
                  </p>
                </div>

                <ChevronDown
                  size={15}
                  className="rotate-[-90deg] text-zinc-700 transition group-hover:text-pink-400"
                />
              </div>
            </button>
          </div>
        </div>
      </aside>

      
      {mobileMenu && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div
            className="absolute inset-0 bg-black/70"
            onClick={() => setMobileMenu(false)}
          />

          <aside className="relative h-full w-[280px] border-r border-white/[0.06] bg-[#242424] p-5">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => window.location.reload()}
                aria-label="Вернуться на главную и обновить страницу"
                className="flex w-full justify-center rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-pink-400/40"
              >
                <Logo />
              </button>

              <button
                onClick={() => setMobileMenu(false)}
                className="rounded-lg p-2 text-zinc-600 hover:text-white"
              >
                <X size={19} />
              </button>
            </div>

            <div className="mt-10 space-y-1">
              <NavItem
                icon={Home}
                active={page === "home"}
                onClick={() => {
                  setPage("home");
                  setMobileMenu(false);
                }}
              >
                Home
              </NavItem>
              <NavItem icon={Compass} active={page === "explore"} onClick={() => openPage("explore")}>Explore</NavItem>
              <NavItem icon={Bell} onClick={() => openPage("notifications")}>Notifications</NavItem>
              <NavItem icon={Library} onClick={() => openPage("library")}>Library</NavItem>
              <NavItem icon={ListMusic} onClick={() => openPage("playlists")}>Playlists / albums</NavItem>
              <NavItem icon={Heart} onClick={() => openPage("liked")}>Liked tracks</NavItem>
            </div>

            <button
              onClick={() => {
                setSelectedProfileName(sessionUser.username);
                setPage("profile");
                setMobileMenu(false);
              }}
              className="absolute bottom-5 left-5 right-5 flex items-center gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.035] p-3 text-left transition hover:border-pink-400/20 hover:bg-pink-400/[0.05]"
            >
              <ArtistAvatar size="small" avatarUrl={avatarUrl} showArtistDefault={sessionUser?.role === "artist" && sessionUser.username.trim().toLowerCase() === "королевски 17"} />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">{sessionUser?.username || "Rhythmic listener"}</p>
                <p className="mt-0.5 truncate text-[10px] text-zinc-600">View profile · {sessionUser?.role === "artist" ? "Artist" : "Listener"}</p>
              </div>
            </button>
          </aside>
        </div>
      )}

      
      <main className="pb-32 lg:ml-[250px]">
        
        <header className="animated-header sticky top-0 z-30 flex h-[76px] items-center border-b border-white/[0.05] px-4 backdrop-blur-xl lg:px-8">
          <div className="header-ribbons" aria-hidden="true">
            <svg viewBox="0 0 1440 150" preserveAspectRatio="none" role="presentation">
              <path d="M-80 24 C 40 2, 80 80, 190 50 S 330 8, 430 42 S 570 112, 690 66 S 850 5, 970 46 S 1120 118, 1240 65 S 1380 22, 1520 54" />
              <path d="M-80 40 C 35 74, 115 12, 220 42 S 365 98, 465 56 S 605 2, 730 48 S 875 110, 990 56 S 1135 8, 1260 42 S 1410 94, 1520 30" />
              <path d="M-80 62 C 40 35, 95 118, 215 73 S 350 32, 475 78 S 620 128, 745 70 S 895 22, 1010 76 S 1155 126, 1280 72 S 1410 36, 1520 80" />
              <path d="M-80 80 C 40 110, 120 44, 240 82 S 385 132, 505 84 S 645 38, 765 90 S 910 136, 1030 82 S 1170 42, 1300 92 S 1430 124, 1520 74" />
              <path d="M-80 96 C 45 70, 105 145, 230 100 S 380 54, 500 104 S 645 145, 775 102 S 925 60, 1045 105 S 1190 146, 1315 100 S 1430 74, 1520 110" />
              <path d="M-80 112 C 40 145, 135 82, 255 112 S 405 150, 525 114 S 675 80, 795 118 S 940 152, 1060 112 S 1210 82, 1330 120 S 1440 145, 1520 105" />
              <path d="M-80 16 C 70 48, 100 5, 255 30 S 390 66, 545 28 S 700 2, 835 34 S 980 74, 1125 30 S 1290 6, 1520 35" />
              <path d="M-80 132 C 55 104, 130 152, 280 128 S 435 102, 570 132 S 730 150, 865 128 S 1030 105, 1170 132 S 1360 150, 1520 125" />
            </svg>
          </div>
          <button
            onClick={() => setMobileMenu(true)}
            className="rounded-xl p-2 text-zinc-500 hover:bg-white/[0.05] hover:text-white lg:hidden"
          >
            <Menu size={20} />
          </button>

          
          <HeaderSearch tracks={tracks} value={searchQuery} onChange={setSearchQuery} onPlay={(id) => void handlePlayTrack(id)} onExplore={() => openPage("explore")} onOpenArtist={openArtistPage} />

          
          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              aria-label={theme === "light" ? "Включить тёмную тему" : "Включить светлую тему"}
              title={theme === "light" ? "Тёмная тема" : "Светлая тема"}
              onClick={() => { const nextTheme = theme === "light" ? "dark" : "light"; setTheme(nextTheme); localStorage.setItem("rhythmic-theme", nextTheme); }}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04] text-pink-500 transition duration-300 hover:rotate-12 hover:bg-pink-400/10"
            >
              {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
            </button>
            {sessionUser ? <><span className="hidden max-w-32 truncate text-xs text-zinc-500 sm:block">{sessionUser.username}</span><button onClick={() => { localStorage.removeItem("token"); localStorage.removeItem("user"); setSessionUser(null); setPlaylistType("Playlist"); setAuthMode("signIn"); setPage("home"); setSelectedProfileName(""); }} className="header-action-button rounded-xl border border-white/[0.08] px-4 py-2 text-sm transition hover:border-pink-300/30">Sign out</button></> : <><button onClick={() => { setAuthMode("signIn"); setAuthOpen(true); }} className="header-action-button hidden rounded-xl px-4 py-2 text-sm transition hover:bg-white/[0.04] sm:block">Sign in</button><button onClick={() => { setAuthMode("signUp"); setAuthOpen(true); }} className="header-action-button rounded-xl bg-pink-200 px-4 py-2 text-sm font-semibold transition hover:bg-pink-100">Sign up</button></>}
          </div>
        </header>

        <div key={page} className="page-transition">
        {page === "explore" ? (
          <ExplorePage tracks={tracks} query={searchQuery} playingId={playingId} likedIds={likedIds} onPlay={(id) => void handlePlayTrack(id)} onLike={toggleLikeTrack} onOpenArtist={openArtistPage} />
        ) : page === "library" || page === "liked" || page === "notifications" || page === "playlists" ? (
          <MusicPages
            page={page}
            tracks={tracks}
            likedIds={likedIds}
            playlists={playlists}
            playingId={playingId}
            selectedPlaylistId={selectedPlaylistId}
            onPageChange={openPage}
            onOpenPlaylist={(id) => { setSelectedPlaylistId(id || null); if (id) setPage("playlists"); }}
            onPlay={(id) => void handlePlayTrack(id)}
            onLike={toggleLikeTrack}
            onCreatePlaylist={() => { setPlaylistDialog(true); }}
            onDeletePlaylist={(id) => void handleDeletePlaylist(id)}
            onTogglePlaylistTrack={(playlistId, trackId) => void handleTogglePlaylistTrack(playlistId, trackId)}
            onOpenAlbum={openAlbumPage}
            onOpenArtist={openArtistPage}
          />
        ) : page === "artist" ? (
          <ArtistPage
            artistName={selectedProfileName || sessionUser.username}
            tracks={tracks.filter((track) => track.artist.toLowerCase() === (selectedProfileName || sessionUser.username).toLowerCase())}
            albums={allAlbums.filter((album) => album.artist_name.toLowerCase() === (selectedProfileName || sessionUser.username).toLowerCase())}
            playingId={playingId}
            likedIds={likedIds}
            onBack={() => openPage("explore")}
            onPlay={(id) => void handlePlayTrack(id)}
            onLike={toggleLikeTrack}
            onOpenAlbum={openAlbumPage}
            onOpenArtist={openArtistPage}
          />
        ) : page === "album" ? (
          allAlbums.find((album) => album.id === selectedAlbumId) ? <AlbumDetailPage
            album={allAlbums.find((album) => album.id === selectedAlbumId)!}
            tracks={tracks}
            playingId={playingId}
            likedIds={likedIds}
            onBack={() => setPage(albumReturnPage)}
            onPlay={(id) => void handlePlayTrack(id)}
            onLike={toggleLikeTrack}
            isSaved={!!selectedAlbumId && (savedAlbumIds.includes(selectedAlbumId) || allAlbums.some((album) => album.id === selectedAlbumId && album.artist_id === sessionUser.id))}
            onToggleLibrary={() => { if (selectedAlbumId) handleToggleAlbumLibrary(selectedAlbumId); }}
            canAddTracks={sessionUser.role === "artist" && allAlbums.some((album) => album.id === selectedAlbumId && album.artist_id === sessionUser.id)}
            onAddTrack={(trackId) => { if (selectedAlbumId) void handleAddTrackToAlbum(selectedAlbumId, trackId); }}
            onOpenArtist={openArtistPage}
          /> : <div className="px-8 py-16 text-sm text-zinc-500">Альбом не найден.</div>
        ) : page === "profile" ? (
          <ProfilePage
            displayName={selectedProfileName || sessionUser.username}
            bio={(selectedProfileName || sessionUser.username).toLowerCase() === sessionUser.username.toLowerCase() ? profileBio : ""}
            isOwnProfile={(selectedProfileName || sessionUser.username).toLowerCase() === sessionUser.username.toLowerCase()}
            isArtistProfile={(selectedProfileName || sessionUser.username).toLowerCase() !== sessionUser.username.toLowerCase() || sessionUser.role === "artist"}
            tracks={tracks.filter((track) => (selectedProfileName || sessionUser.username).toLowerCase() === sessionUser.username.toLowerCase() ? (track.artistId === sessionUser.id || track.artist.toLowerCase() === sessionUser.username.toLowerCase()) : track.artist.toLowerCase() === (selectedProfileName || sessionUser.username).toLowerCase())}
            albums={allAlbums.filter((album) => (selectedProfileName || sessionUser.username).toLowerCase() === sessionUser.username.toLowerCase() ? album.artist_id === sessionUser.id : album.artist_name.toLowerCase() === (selectedProfileName || sessionUser.username).toLowerCase())}
            playlists={playlists.filter((item) => item.type === "Playlist")}
            currentId={currentId}
            isPlaying={isPlaying}
            avatarUrl={(selectedProfileName || sessionUser.username).toLowerCase() === sessionUser.username.toLowerCase() ? avatarUrl : null}
            defaultAvatar={sessionUser.role === "artist" && (selectedProfileName || sessionUser.username).toLowerCase() === "королевски 17"}
            canEditAvatar={(selectedProfileName || sessionUser.username).toLowerCase() === sessionUser.username.toLowerCase()}
            onAvatarChange={handleAvatarChange}
            onSaveProfile={handleSaveProfile}
            onPlayTrack={(id) => void handlePlayTrack(id)}
            onOpenAlbum={openAlbumPage}
            onOpenPlaylist={(id) => { setSelectedPlaylistId(id); setPage("playlists"); }}
            onOpenArtist={openArtistPage}
          />
        ) : (
          <>
        
        <section className="relative overflow-hidden border-b border-white/[0.05] px-5 py-16 lg:px-10 lg:py-20">
          <div className="pointer-events-none absolute -right-40 -top-40 h-[500px] w-[500px] rounded-full bg-pink-400/[0.06] blur-3xl" />
          <div className="pointer-events-none absolute -left-40 bottom-[-250px] h-[500px] w-[500px] rounded-full bg-stone-500/[0.04] blur-3xl" />

          <div className="relative max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-pink-400/10 bg-pink-400/[0.05] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-pink-400">
              <span className="h-1.5 w-1.5 rounded-full bg-pink-400 shadow-[0_0_10px_#ec4899]" />
              Discover new sound
            </div>

            <h1 className="text-4xl font-bold tracking-[-0.04em] text-white sm:text-5xl lg:text-6xl">
              Music for
              <br />
              <span className="text-pink-400">every moment.</span>
            </h1>

            <p className="mt-6 max-w-xl text-sm leading-7 text-zinc-500 sm:text-base">
              Discover independent artists, underground gems and sounds you
              won't find anywhere else.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <button onClick={() => openPage("explore")} className="flex items-center gap-2 rounded-xl bg-pink-200 px-5 py-3 text-sm font-semibold text-black transition hover:bg-pink-100">
                <Play size={16} fill="currentColor" />
                Start listening
              </button>

              <button onClick={() => openPage("explore")} className="rounded-xl border border-white/[0.08] bg-white/[0.02] px-5 py-3 text-sm text-zinc-400 transition hover:bg-white/[0.05] hover:text-white">
                Explore genres
              </button>
            </div>
          </div>
        </section>

        
        <div className="px-5 py-10 lg:px-10">
          
          <section>
            <div className="mb-5 flex items-end justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-pink-400">
                  Trending now
                </p>

                <h2 className="mt-2 text-2xl font-bold tracking-tight text-white">
                  What's playing
                </h2>
              </div>

              <button onClick={() => openPage("explore")} className="text-xs text-zinc-600 transition hover:text-pink-400">
                View all
              </button>
            </div>

            <div className="overflow-x-auto">
              <div className="min-w-[850px] space-y-1">
                {tracks.map((track) => (
                  <TrackRow
                    key={track.id}
                    track={track}
                    active={track.id === playingId}
                    liked={likedIds.includes(track.id)}
                    onPlay={() => handlePlayTrack(track.id)}
                    onLike={() => toggleLikeTrack(track.id)}
                    onOpenArtist={openArtistPage}
                  />
                ))}
              </div>
            </div>
          </section>

          
          <section className="mt-14">
            <div className="mb-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-pink-400">
                Browse
              </p>

              <h2 className="mt-2 text-2xl font-bold tracking-tight text-white">
                Explore genres
              </h2>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {genres.map((genre) => (
                <button
                  key={genre.name}
                  onClick={() => openPage("explore")}
                  className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 text-left transition hover:-translate-y-0.5 hover:border-white/[0.1] hover:bg-white/[0.04]"
                >
                  <div
                    className={`absolute -right-10 -top-10 h-28 w-28 rounded-full bg-gradient-to-br ${genre.color} opacity-10 blur-2xl transition group-hover:opacity-20`}
                  />

                  <div
                    className={`mb-8 h-1 w-10 rounded-full bg-gradient-to-r ${genre.color}`}
                  />

                  <h3 className="font-semibold text-white">{genre.name}</h3>
                  <p className="mt-1 text-xs text-zinc-600">
                    {genre.description}
                  </p>

                  <div className="mt-5 flex items-center gap-1 text-[10px] font-medium uppercase tracking-wider text-zinc-700 transition group-hover:text-pink-400">
                    Explore
                    <ChevronDown
                      size={12}
                      className="-rotate-90 transition group-hover:translate-x-1"
                    />
                  </div>
                </button>
              ))}
            </div>
          </section>
        </div>
          </>
        )}
        </div>

      </main>

      <AuthDialog
        open={authOpen}
        mode={authMode}
        theme={theme}
        onModeChange={setAuthMode}
        onClose={() => setAuthOpen(false)}
        onAuthenticated={(response) => { setSessionUser(withSavedProfile(response.user)); if (response.user.role !== "artist") setPlaylistType("Playlist"); setAuthOpen(false); }}
      />

      <PlaylistDialog
        open={playlistDialog}
        name={playlistName}
        type={playlistType}
        onNameChange={setPlaylistName}
        onTypeChange={setPlaylistType}
        onClose={() => setPlaylistDialog(false)}
        onCreate={() => { void handleCreatePlaylist(); }}
        canCreateAlbum={sessionUser.role === "artist"}
      />

      <UploadMusicDialog
        open={uploadOpen}
        type={uploadType}
        title={uploadTitle}
        artistName={sessionUser.username}
        files={uploadFiles}
        coverFile={uploadCoverFile}
        genre={uploadGenre}
        message={uploadMessage}
        onTypeChange={setUploadType}
        onTitleChange={setUploadTitle}
        onFilesChange={setUploadFiles}
        onCoverChange={setUploadCoverFile}
        onGenreChange={setUploadGenre}
        onClose={() => { setUploadOpen(false); setUploadMessage(""); }}
        onSubmit={handleUpload}
      />

      
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/[0.07] bg-[#202020]/98 backdrop-blur-2xl lg:left-[250px]">
        <div className="relative mx-auto max-w-[1600px] px-4 py-3 lg:px-6">
          <Equalizer open={eqOpen} onClose={() => setEqOpen(false)} preset={preset} bands={bands} presets={presets} onPreset={selectPreset} onBand={setBand} engine={engine} />

          <div className="grid grid-cols-[minmax(280px,1fr)_auto_minmax(280px,1fr)] items-center gap-6">
            
            <div className="flex min-w-0 items-center gap-4">
              <Cover track={currentTrack} size="player" />

              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">
                  {currentTrack.title}
                </p>

                <button type="button" onClick={() => openArtistPage(currentTrack.artist)} className="mt-1 block max-w-full truncate text-left text-xs text-zinc-500 transition hover:text-pink-300 hover:underline" aria-label={`Open artist ${currentTrack.artist}`}>
                  {currentTrack.artist}
                </button>

                <div className="mt-2">
                  <span className="rounded-full bg-white/[0.04] px-2 py-1 text-[9px] text-zinc-600">
                    {currentTrack.genre}
                  </span>
                </div>
              </div>

              
              <div className="relative ml-2">
                <button
                  onClick={() => setPlaylistOpen((value) => !value)}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.025] text-zinc-500 transition hover:border-pink-400/20 hover:bg-pink-400/10 hover:text-pink-400"
                >
                  <Plus size={17} />
                </button>

                {playlistOpen && (
                  <div className="absolute bottom-12 left-0 w-48 overflow-hidden rounded-2xl border border-white/[0.08] bg-[#2b2b2b] p-1.5 shadow-2xl">
                    <p className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-700">
                      Add to playlist
                    </p>

                    {["Liked songs", ...playlists.map((item) => item.name)].map(
                      (playlist) => (
                        <button
                          key={playlist}
                          onClick={() => { setPlaylistOpen(false); if (playlist === "Liked songs") { if (!likedIds.includes(currentTrack.id)) toggleLikeTrack(currentTrack.id); } else { const target = playlists.find((item) => item.name === playlist); if (target && !target.trackIds.includes(currentTrack.id)) void handleTogglePlaylistTrack(target.id, currentTrack.id); } }}
                          className="w-full rounded-xl px-3 py-2 text-left text-xs text-zinc-400 transition hover:bg-white/[0.05] hover:text-white"
                        >
                          {playlist}
                        </button>
                      ),
                    )}

                    <div className="my-1 border-t border-white/[0.05]" />

                    <button
                      onClick={() => { setPlaylistOpen(false); setPlaylistDialog(true); }}
                      className="w-full rounded-xl px-3 py-2 text-left text-xs text-pink-400 transition hover:bg-pink-400/[0.06]"
                    >
                      + New playlist
                    </button>
                  </div>
                )}
              </div>
            </div>

            
            <div className="flex flex-col items-center">
              <div className="flex items-center justify-center gap-2">
                <button className="hidden rounded-lg p-2 text-zinc-700 transition hover:text-white sm:block">
                  <Shuffle size={15} />
                </button>

                <button
                  onClick={() => void previous()}
                  className="rounded-lg p-2 text-zinc-400 transition hover:text-white"
                >
                  <SkipBack size={18} fill="currentColor" />
                </button>

                <button
                  onClick={() => void togglePlay(currentTrack)}
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-pink-400 text-black shadow-[0_0_25px_rgba(245,196,81,0.18)] transition hover:scale-105 hover:bg-pink-300"
                >
                  {isPlaying ? (
                    <Pause size={18} fill="currentColor" />
                  ) : (
                    <Play size={18} fill="currentColor" />
                  )}
                </button>

                <button
                  onClick={() => void next()}
                  className="rounded-lg p-2 text-zinc-400 transition hover:text-white"
                >
                  <SkipForward size={18} fill="currentColor" />
                </button>

                <button className="hidden rounded-lg p-2 text-zinc-700 transition hover:text-white sm:block">
                  <Repeat2 size={16} />
                </button>
              </div>

              
              <div className="mt-2 flex w-[340px] max-w-[38vw] items-center gap-2">
                <span className="w-7 text-right text-[9px] tabular-nums text-zinc-600">
                  {formatTime(currentTime)}
                </span>

                <div className="relative flex-1">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="0.1"
                    value={progress}
                    onChange={(e) => seek(Number(e.target.value))}
                    className="progress-slider relative z-10 w-full"
                  />

                  <div className="pointer-events-none absolute left-0 right-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-white/[0.08]" />

                  <div
                    className="pointer-events-none absolute left-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-pink-400"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                <span className="w-7 text-[9px] tabular-nums text-zinc-600">
                  {formatTime(duration || parseDuration(currentTrack.duration))}
                </span>
              </div>
            </div>

            
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => toggleLikeTrack(currentTrack.id)}
                className={`flex h-9 w-9 items-center justify-center rounded-xl transition ${
                  likedIds.includes(currentTrack.id)
                    ? "bg-pink-400/10 text-pink-400"
                    : "text-zinc-600 hover:bg-white/[0.04] hover:text-white"
                }`}
              >
                <Heart size={17} fill={likedIds.includes(currentTrack.id) ? "currentColor" : "none"} />
              </button>

              <button
                onClick={() => setEqOpen((value) => !value)}
                className={`rounded-xl px-3 py-2 text-[10px] font-semibold uppercase tracking-wider transition ${
                  eqOpen
                    ? "bg-pink-400/10 text-pink-400"
                    : "text-zinc-600 hover:bg-white/[0.04] hover:text-white"
                }`}
              >
                EQ
              </button>

              <div className="hidden items-center gap-2 md:flex">
                <Volume2 size={16} className="text-zinc-600" />

                <input
                  type="range"
                  min="0"
                  max="100"
                  value={Math.round(volume * 100)}
                  onChange={(e) => setVolume(Number(e.target.value))}
                  className="volume-slider w-20"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      
      <style>{`
        .progress-slider,
        .volume-slider,
        .eq-slider {
          appearance: none;
          background: transparent;
          cursor: pointer;
        }

        .progress-slider {
          height: 16px;
        }

        .progress-slider::-webkit-slider-runnable-track {
          height: 4px;
          background: transparent;
        }

        .progress-slider::-moz-range-track {
          height: 4px;
          background: transparent;
        }

        .progress-slider::-webkit-slider-thumb {
          appearance: none;
          width: 10px;
          height: 10px;
          margin-top: -3px;
          border-radius: 999px;
          background: #ec4899;
          border: 0;
          box-shadow: 0 0 10px rgba(52, 211, 153, 0.45);
        }

        .progress-slider::-moz-range-thumb {
          width: 10px;
          height: 10px;
          border-radius: 999px;
          background: #ec4899;
          border: 0;
        }

        .volume-slider {
          height: 16px;
        }

        .volume-slider::-webkit-slider-runnable-track {
          height: 3px;
          border-radius: 999px;
          background: rgba(255,255,255,0.1);
        }

        .volume-slider::-moz-range-track {
          height: 3px;
          border-radius: 999px;
          background: rgba(255,255,255,0.1);
        }

        .volume-slider::-webkit-slider-thumb {
          appearance: none;
          width: 8px;
          height: 8px;
          margin-top: -2.5px;
          border-radius: 999px;
          background: #ec4899;
          border: 0;
        }

        .volume-slider::-moz-range-thumb {
          width: 8px;
          height: 8px;
          border-radius: 999px;
          background: #ec4899;
          border: 0;
        }

        .eq-slider {
          appearance: none;
          background: transparent;
        }

        .eq-slider::-webkit-slider-runnable-track {
          width: 4px;
          border-radius: 999px;
          background: rgba(255,255,255,0.08);
        }

        .eq-slider::-moz-range-track {
          width: 4px;
          border-radius: 999px;
          background: rgba(255,255,255,0.08);
        }

        .eq-slider::-webkit-slider-thumb {
          appearance: none;
          width: 12px;
          height: 12px;
          margin-left: -4px;
          border-radius: 999px;
          background: #ec4899;
          border: 0;
          box-shadow: 0 0 10px rgba(245,196,81,0.35);
        }

        .eq-slider::-moz-range-thumb {
          width: 12px;
          height: 12px;
          border-radius: 999px;
          background: #ec4899;
          border: 0;
        }

        * {
          scrollbar-width: thin;
          scrollbar-color: rgba(255,255,255,0.08) transparent;
        }

        ::selection {
          background: rgba(245,196,81,0.25);
          color: white;
        }
      `}</style>
    </div>
  );
}
