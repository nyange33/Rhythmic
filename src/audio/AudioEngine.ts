export class AudioEngine {
  private context: AudioContext | null = null;
  private source: MediaElementAudioSourceNode | null = null;
  private gain: GainNode | null = null;
  private connectedAudio: HTMLAudioElement | null = null;

  async connect(audio: HTMLAudioElement) {
    if (this.connectedAudio === audio && this.context) {
      if (this.context.state === "suspended") await this.context.resume();
      return;
    }

    const AudioContextClass = window.AudioContext ||
      (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

    if (!AudioContextClass) throw new Error("Web Audio API is not supported in this browser.");

    this.context = new AudioContextClass();
    this.source = this.context.createMediaElementSource(audio);
    this.gain = this.context.createGain();

    this.source.connect(this.gain);
    this.gain.connect(this.context.destination);
    this.connectedAudio = audio;

    if (this.context.state === "suspended") await this.context.resume();
  }

  async resume() {
    if (this.context?.state === "suspended") await this.context.resume();
  }

  setVolume(value: number) {
    if (this.gain) this.gain.gain.value = Math.max(0, Math.min(1, value));
  }

  destroy() {
    this.source?.disconnect();
    this.gain?.disconnect();
    this.context?.close();
    this.context = null;
    this.source = null;
    this.gain = null;
    this.connectedAudio = null;
  }
}
