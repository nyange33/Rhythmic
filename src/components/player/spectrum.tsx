import { useEffect, useRef } from "react";
import type { AudioEngine } from "../../audio/audioEngine";

export default function Spectrum({ engine }: { engine: AudioEngine | null }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let frame = 0;
    const draw = () => {
      const canvas = ref.current;
      const ctx = canvas?.getContext("2d");
      const data = engine?.getSpectrum();
      if (canvas && ctx && data) {
        const width = canvas.width = canvas.clientWidth * window.devicePixelRatio;
        const height = canvas.height = canvas.clientHeight * window.devicePixelRatio;
        ctx.clearRect(0, 0, width, height);
        const bars = 42;
        const step = Math.max(1, Math.floor(data.length / bars));
        const gap = 2 * window.devicePixelRatio;
        const barWidth = Math.max(1, (width - gap * (bars - 1)) / bars);
        for (let i = 0; i < bars; i++) {
          const value = data[i * step] / 255;
          const barHeight = value * height;
          ctx.fillStyle = "rgba(52, 211, 153, 0.7)";
          ctx.fillRect(i * (barWidth + gap), height - barHeight, barWidth, barHeight);
        }
      }
      frame = requestAnimationFrame(draw);
    };
    frame = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frame);
  }, [engine]);

  return <canvas ref={ref} className="h-8 w-full" aria-hidden="true" />;
}
