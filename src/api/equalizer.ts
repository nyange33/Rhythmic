// Equalizer API - placeholder for future implementation
// Currently not implemented in backend

export interface EqualizerSettings {
  bass: number;
  mid: number;
  treble: number;
}

export async function getEqualizerSettings(): Promise<EqualizerSettings> {
  // Placeholder - implement when backend is ready
  return { bass: 0, mid: 0, treble: 0 };
}

export async function saveEqualizerSettings(settings: EqualizerSettings): Promise<void> {
  // Placeholder - implement when backend is ready
}
