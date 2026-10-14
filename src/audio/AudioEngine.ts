export const EQ_FREQUENCIES = [32, 64, 125, 250, 500, 1000, 2000, 4000, 8000, 16000];

export class AudioEngine {
  private context: AudioContext | null = null;
  private source: MediaElementAudioSourceNode | null = null;
  private filters: BiquadFilterNode[] = [];
  private gain: GainNode | null = null;
  private analyser: AnalyserNode | null = null;
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
    this.filters = EQ_FREQUENCIES.map((frequency, index) => {
      const filter = this.context!.createBiquadFilter();
      filter.type = "peaking";
      filter.frequency.value = frequency;
      filter.Q.value = index === 0 || index === EQ_FREQUENCIES.length - 1 ? 0.7 : 1.1;
      filter.gain.value = 0;
      return filter;
    });

    this.gain = this.context.createGain();
    this.analyser = this.context.createAnalyser();
    this.analyser.fftSize = 2048;
    this.analyser.smoothingTimeConstant = 0.82;

    let node: AudioNode = this.source;
    for (const filter of this.filters) {
      node.connect(filter);
      node = filter;
    }
    node.connect(this.gain);
    this.gain.connect(this.analyser);
    this.analyser.connect(this.context.destination);
    this.connectedAudio = audio;

    if (this.context.state === "suspended") await this.context.resume();
  }

  async resume() {
    if (this.context?.state === "suspended") await this.context.resume();
  }

  setVolume(value: number) {
    if (this.gain) this.gain.gain.value = Math.max(0, Math.min(1, value));
  }

  setBand(index: number, value: number) {
    const filter = this.filters[index];
    if (filter) filter.gain.value = value;
  }

  setBands(values: number[]) {
    values.forEach((value, index) => this.setBand(index, value));
  }

  getSpectrum() {
    if (!this.analyser) return null;
    const data = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(data);
    return data;
  }

  destroy() {
    this.source?.disconnect();
    this.filters.forEach((filter) => filter.disconnect());
    this.gain?.disconnect();
    this.analyser?.disconnect();
    this.context?.close();
    this.context = null;
    this.source = null;
    this.filters = [];
    this.gain = null;
    this.analyser = null;
    this.connectedAudio = null;
  }
}
