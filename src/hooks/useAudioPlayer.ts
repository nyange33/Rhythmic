import { useCallback, useEffect, useRef, useState } from "react";
import { AudioEngine } from "../audio/AudioEngine";
import type { Track } from "../types/track";

export function useAudioPlayer(tracks: Track[]) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const engineRef = useRef<AudioEngine | null>(null);
  const [engine, setEngine] = useState<AudioEngine | null>(null);
  const [playingId, setPlayingId] = useState<number | null>(null);
  const [currentId, setCurrentId] = useState<number | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.65);
  const [error, setError] = useState<string | null>(null);
  const currentIdRef = useRef<number | null>(null);
  const loadAndPlayRef = useRef<(track: Track) => Promise<void>>(async () => {});

  const ensureAudio = useCallback(() => {
    if (!audioRef.current) {
      const audio = new Audio();
      audio.preload = "metadata";
      audioRef.current = audio;
      engineRef.current = new AudioEngine();
      setEngine(engineRef.current);
    }
    return audioRef.current;
  }, []);

  const loadAndPlay = useCallback(async (track: Track) => {
    const audio = ensureAudio();
    try {
      setError(null);
      if (audio.src !== new URL(track.audio, window.location.origin).href) {
        audio.src = track.audio;
        audio.load();
      }
      await engineRef.current!.connect(audio);
      engineRef.current!.setVolume(volume);
      await audio.play();
      setCurrentId(track.id);
      currentIdRef.current = track.id;
      setPlayingId(track.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not play audio.");
      setPlayingId(null);
    }
  }, [ensureAudio, volume]);

  const playTrack = useCallback(async (track: Track) => {
    const audio = ensureAudio();
    if (playingId === track.id && !audio.paused) {
      audio.pause();
      setPlayingId(null);
      return;
    }
    if (playingId === track.id && audio.paused && audio.src) {
      try {
        await engineRef.current?.resume();
        await audio.play();
        setCurrentId(track.id);
        currentIdRef.current = track.id;
        setPlayingId(track.id);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not resume audio.");
      }
      return;
    }
    await loadAndPlay(track);
  }, [ensureAudio, loadAndPlay, playingId]);

  const togglePlay = useCallback(async (track: Track) => {
    await playTrack(track);
  }, [playTrack]);

  const seek = useCallback((percent: number) => {
    const audio = audioRef.current;
    if (!audio || !Number.isFinite(audio.duration)) return;
    audio.currentTime = (percent / 100) * audio.duration;
    setCurrentTime(audio.currentTime);
  }, []);

  const setVolume = useCallback((percent: number) => {
    const normalized = percent / 100;
    setVolumeState(normalized);
    engineRef.current?.setVolume(normalized);
  }, []);

  const next = useCallback(async () => {
    const current = tracks.findIndex((track) => track.id === currentId);
    const nextIndex = current < 0 ? 0 : (current + 1) % tracks.length;
    await loadAndPlay(tracks[nextIndex]);
  }, [currentId, loadAndPlay, tracks]);

  const previous = useCallback(async () => {
    const audio = audioRef.current;
    if (audio && audio.currentTime > 3) {
      audio.currentTime = 0;
      return;
    }
    const current = tracks.findIndex((track) => track.id === currentId);
    const previousIndex = current < 0 ? 0 : (current - 1 + tracks.length) % tracks.length;
    await loadAndPlay(tracks[previousIndex]);
  }, [currentId, loadAndPlay, tracks]);

  loadAndPlayRef.current = loadAndPlay;

  useEffect(() => {
    const audio = ensureAudio();
    const onTime = () => setCurrentTime(audio.currentTime);
    const onMetadata = () => setDuration(audio.duration || 0);
    const onEnded = () => {
      const current = tracks.findIndex((track) => track.id === currentIdRef.current);
      const nextIndex = current < 0 ? 0 : (current + 1) % tracks.length;
      void loadAndPlayRef.current(tracks[nextIndex]);
    };
    const onError = () => setError("Audio file could not be loaded. Check public/music and the filename.");

    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onMetadata);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("error", onError);
    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onMetadata);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("error", onError);
      audio.pause();
      engineRef.current?.destroy();
      audioRef.current = null;
    };
  }, [ensureAudio]);

  return {
    audioRef,
    engine,
    playingId,
    currentId,
    currentTime,
    duration,
    volume,
    error,
    isPlaying: playingId !== null,
    playTrack,
    togglePlay,
    seek,
    setVolume,
    next,
    previous,
  };
}
