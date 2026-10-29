type LandingPageProps = {
  theme: "light" | "dark";
  onSignUp: () => void;
  onSignIn: () => void;
  onToggleTheme: () => void;
};

export default function LandingPage({ theme, onSignUp, onSignIn, onToggleTheme }: LandingPageProps) {
  return (
    <div className="app-shell landing-page relative flex min-h-screen items-center justify-center overflow-hidden px-5 py-12" data-theme={theme}>
      <div className="landing-noise" aria-hidden="true" />
      <div className="landing-orb landing-orb-one" aria-hidden="true" />
      <div className="landing-orb landing-orb-two" aria-hidden="true" />
      <div className="landing-orb landing-orb-three" aria-hidden="true" />
      <div className="landing-lines" aria-hidden="true">
        <svg viewBox="0 0 1440 900" preserveAspectRatio="none">
          <path d="M-80 180 C 130 30, 230 350, 430 190 S 720 30, 880 220 S 1170 380, 1520 130" />
          <path d="M-80 260 C 120 420, 280 100, 470 280 S 760 430, 930 250 S 1240 100, 1520 300" />
          <path d="M-80 540 C 160 360, 260 720, 480 520 S 760 380, 970 570 S 1260 760, 1520 500" />
          <path d="M-80 680 C 160 830, 330 500, 530 690 S 850 830, 1040 650 S 1320 510, 1520 720" />
        </svg>
      </div>
      <section className="landing-content relative z-10 mx-auto flex w-full max-w-4xl flex-col items-center text-center">
        <div className="landing-symbol mb-8 flex h-16 w-16 items-center justify-center rounded-[22px]">
          <div className="flex items-end gap-[4px]">
            <span className="h-5 w-[4px] rounded-full bg-current" />
            <span className="h-8 w-[4px] rounded-full bg-current" />
            <span className="h-11 w-[4px] rounded-full bg-current" />
            <span className="h-7 w-[4px] rounded-full bg-current" />
            <span className="h-9 w-[4px] rounded-full bg-current" />
          </div>
        </div>
        <h1 className="landing-wordmark text-6xl font-black tracking-[-0.075em] sm:text-8xl lg:text-[9rem]">Rhythmic</h1>
        <p className="landing-tagline mt-5 max-w-xl text-sm leading-7 sm:text-base">Find the sound that feels like yours.</p>
        <div className="mt-10 flex w-full max-w-sm flex-col gap-3 sm:flex-row">
          <button onClick={onSignUp} className="landing-primary flex-1 rounded-2xl px-6 py-3.5 text-sm font-semibold">Sign up <span aria-hidden="true">↗</span></button>
          <button onClick={onSignIn} className="landing-secondary flex-1 rounded-2xl px-6 py-3.5 text-sm font-semibold">Sign in</button>
        </div>
        <button
          type="button"
          onClick={onToggleTheme}
          className="landing-secondary mt-10 inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold"
          aria-label={theme === "light" ? "Switch to dark theme" : "Switch to light theme"}
        >
          {theme === "light" ? (
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.2 15.4A8.5 8.5 0 0 1 8.6 3.8 8.5 8.5 0 1 0 20.2 15.4Z" />
            </svg>
          ) : (
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" />
            </svg>
          )}
          Switch theme
        </button>
      </section>
    </div>
  );
}
