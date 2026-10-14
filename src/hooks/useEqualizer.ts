import { useCallback, useState } from "react";
import type { AudioEngine } from "../audio/audioEngine";

export const EQ_PRESETS: Record<string, number[]> = {
  Flat: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  Bass: [7, 6, 5, 3, 1, 0, -1, -2, -2, -1],
  "Bass Boost": [10, 8, 7, 4, 1, 0, -1, -2, -2, -1],
  Vocal: [-2, -2, 0, 3, 5, 5, 3, 1, 0, -1],
  Rock: [5, 4, 2, -1, -2, 1, 3, 5, 5, 4],
  Electronic: [6, 5, 2, 0, -2, 2, 4, 5, 6, 5],
};

export function useEqualizer(engine: AudioEngine | null) {
  const [preset, setPreset] = useState("Flat");
  const [bands, setBands] = useState(EQ_PRESETS.Flat);

  const setBand = useCallback((index: number, value: number) => {
    setBands((current) => {
      const next = [...current];
      next[index] = value;
      engine?.setBand(index, value);
      return next;
    });
    setPreset("");
  }, [engine]);

  const selectPreset = useCallback((name: string) => {
    const values = EQ_PRESETS[name] ?? EQ_PRESETS.Flat;
    setPreset(name);
    setBands(values);
    engine?.setBands(values);
  }, [engine]);

  return { preset, bands, setBand, selectPreset, presets: EQ_PRESETS };
}
