import { useState, type ElementType, type ReactNode } from "react";
import { Heart, MoreHorizontal, Pause, Play } from "lucide-react";
import type { Track } from "../types/track";

export function Cover({
  track,
  size = "small",
}: {
  track: Track;
  size?: "small" | "medium" | "player";
}) {
  const sizes = {
    small: "h-14 w-14 rounded-xl",
    medium: "h-20 w-20 rounded-2xl",
    player: "h-[72px] w-[72px] rounded-2xl",
  };

  const coverCandidates = [
    track.cover,
    `/covers/${track.id}.jpg`,
    `/covers/${track.id}.jpeg`,
    `/covers/${track.id}.png`,
    `/covers/${track.id}.webp`,
    `/covers/${track.id}.gif`,
  ].filter(Boolean) as string[];

  const [coverIndex, setCoverIndex] = useState(0);
  const coverSrc = coverCandidates[coverIndex];

  if (coverSrc) {
    return (
      <div className={`relative shrink-0 overflow-hidden ${sizes[size]} bg-zinc-900`}>
        <img
          src={coverSrc}
          alt={`${track.title} cover`}
          className="h-full w-full object-cover"
          onError={() => {
            setCoverIndex((index) => index + 1);
          }}
        />
      </div>
    );
  }

  return (
    <div
      className={`relative shrink-0 overflow-hidden bg-gradient-to-br ${track.color} ${sizes[size]}`}
    >
      <div className="absolute inset-0 opacity-30">
        <div className="absolute -right-5 -top-5 h-24 w-24 rounded-full border-[12px] border-black/40" />
        <div className="absolute -bottom-8 -left-3 h-24 w-24 rounded-full border-[10px] border-black/30" />
      </div>

      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex items-end gap-[3px]">
          {[12, 20, 28, 16, 34, 23, 30, 15].map((height, index) => (
            <span
              key={index}
              className="w-[3px] rounded-full bg-black/70"
              style={{ height }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export function Waveform({
  active = false,
  compact = false,
}: {
  active?: boolean;
  compact?: boolean;
}) {
  const bars = Array.from({ length: compact ? 28 : 45 }, (_, index) => {
    const value =
      12 +
      Math.abs(Math.sin(index * 1.7)) * 18 +
      Math.abs(Math.cos(index * 0.45)) * 8;

    return Math.round(value);
  });

  return (
    <div className="flex h-10 items-center gap-[2px] overflow-hidden">
      {bars.map((height, index) => (
        <span
          key={index}
          className={`w-[2px] shrink-0 rounded-full transition-all ${
            active && index < bars.length * 0.46
              ? "bg-pink-400"
              : "bg-white/10"
          }`}
          style={{ height }}
        />
      ))}
    </div>
  );
}

export function NavItem({
  icon: Icon,
  children,
  active = false,
  onClick,
}: {
  icon: ElementType;
  children: ReactNode;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
        active
          ? "bg-pink-400/10 text-pink-300"
          : "text-zinc-500 hover:bg-white/[0.04] hover:text-white"
      }`}
    >
      <Icon
        size={18}
        className={
          active
            ? "text-pink-400"
            : "text-zinc-600 group-hover:text-zinc-300"
        }
      />
      <span>{children}</span>
    </button>
  );
}

export function TrackRow({
  track,
  active,
  liked,
  onPlay,
  onLike,
}: {
  track: Track;
  active: boolean;
  liked: boolean;
  onPlay: () => void;
  onLike: () => void;
}) {
  return (
    <div
      className={`group grid grid-cols-[auto_minmax(180px,1fr)_180px_100px_90px] items-center gap-5 rounded-2xl border px-4 py-3 transition ${
        active
          ? "border-pink-400/20 bg-pink-400/[0.05]"
          : "border-transparent hover:border-white/[0.06] hover:bg-white/[0.025]"
      }`}
    >
      <div className="relative">
        <button onClick={onPlay} className="relative block">
          <Cover track={track} />

          <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/45 opacity-0 transition group-hover:opacity-100">
            {active ? (
              <Pause size={18} fill="white" />
            ) : (
              <Play size={18} fill="white" />
            )}
          </div>
        </button>

      </div>

      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="truncate text-sm font-semibold text-white">
            {track.title}
          </h3>

          {active && (
            <span className="rounded-full bg-pink-400/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-pink-400">
              Playing
            </span>
          )}
        </div>

        <p className="mt-1 truncate text-xs text-zinc-500">{track.artist}</p>
      </div>

      <Waveform active={active} compact />

      <div>
        <span className="rounded-full bg-white/[0.04] px-2.5 py-1 text-[10px] text-zinc-500">
          {track.genre}
        </span>
      </div>

      <div className="flex items-center justify-end gap-3">
        <span className="text-xs text-zinc-600">{track.plays}</span>

        <button
          onClick={onLike}
          className={`transition ${
            liked
              ? "text-pink-400"
              : "text-zinc-700 hover:text-pink-400"
          }`}
        >
          <Heart size={16} fill={liked ? "currentColor" : "none"} />
        </button>

        <button className="text-zinc-700 transition hover:text-white">
          <MoreHorizontal size={17} />
        </button>
      </div>
    </div>
  );
}

