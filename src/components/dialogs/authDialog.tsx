import { useState, type FormEvent } from "react";
import { ArrowRight, Music2, X } from "lucide-react";
import { login as loginRequest, register, type AuthResponse } from "../../api/auth";

export type AuthMode = "signIn" | "signUp";

type AuthDialogProps = {
  open: boolean;
  mode: AuthMode;
  theme: "light" | "dark";
  onModeChange: (mode: AuthMode) => void;
  onClose: () => void;
  onAuthenticated: (response: AuthResponse) => void;
};

export default function AuthDialog({ open, mode, theme, onModeChange, onClose, onAuthenticated }: AuthDialogProps) {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [isArtist, setIsArtist] = useState(false);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;

  const isSignUp = mode === "signUp";

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");
    try {
      const response = isSignUp
        ? await register({ username: login.trim(), email: email.trim(), password, role: isArtist ? "artist" : "listener" })
        : await loginRequest({ identifier: login.trim(), password });
      localStorage.setItem("token", response.token);
      localStorage.setItem("user", JSON.stringify(response.user));
      setMessage(isSignUp ? "Аккаунт создан. Добро пожаловать в Rhythmic!" : "Вход выполнен. Добро пожаловать!");
      onAuthenticated(response);
      onClose();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Не удалось выполнить запрос. Проверь, запущен ли backend.");
    } finally {
      setSubmitting(false);
    }
  };

  const switchMode = (nextMode: AuthMode) => {
    setMessage("");
    onModeChange(nextMode);
  };

  return (
    <div className={`auth-overlay fixed inset-0 z-[120] flex items-center justify-center overflow-y-auto p-4 sm:p-6 ${theme === "dark" ? "auth-dark" : "auth-light"}`} onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <div className="auth-backdrop absolute inset-0" />
      <div className={`auth-border-shell relative my-auto w-full max-w-md ${theme === "dark" ? "auth-dark" : "auth-light"}`}>
        <section className="auth-card relative overflow-hidden rounded-[25px] px-6 py-7 sm:px-9 sm:py-9" role="dialog" aria-modal="true" aria-labelledby="auth-title">
          <button type="button" onClick={onClose} aria-label="Close" className="auth-close absolute right-4 top-4 rounded-full p-2">
            <X size={18} />
          </button>

          <div className="auth-content">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-pink-200/70 text-pink-600 shadow-sm">
              <Music2 size={23} />
            </div>
            <p className="mt-4 text-center text-[10px] font-semibold uppercase tracking-[0.28em] text-pink-500">Rhythmic account</p>
            <h2 id="auth-title" className="auth-title mt-2 text-center text-3xl font-bold tracking-tight">
              {isSignUp ? "Registration" : "Login"}
            </h2>
            <p className="auth-subtitle mt-2 text-center text-sm">
              {isSignUp ? "Создай аккаунт и собери свою музыкальную вселенную." : "Рады снова видеть тебя. Продолжим слушать?"}
            </p>

            <form onSubmit={submit} className="mt-7 space-y-4">
              <label className="auth-label block text-xs font-medium">
                Login or email
                <input required autoComplete="username" value={login} onChange={(event) => setLogin(event.target.value)} placeholder={isSignUp ? "Your login" : "Your login or email"} className="auth-input mt-2 w-full rounded-xl px-4 py-3 text-sm outline-none" />
              </label>

              {isSignUp && (
                <label className="auth-label block text-xs font-medium auth-field-enter">
                  Email
                  <input required type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" className="auth-input mt-2 w-full rounded-xl px-4 py-3 text-sm outline-none" />
                </label>
              )}

              <label className="auth-label block text-xs font-medium">
                Password
                <input required minLength={8} type="password" autoComplete={isSignUp ? "new-password" : "current-password"} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 8 characters" className="auth-input mt-2 w-full rounded-xl px-4 py-3 text-sm outline-none" />
              </label>

              {isSignUp && (
                <label className="auth-artist flex cursor-pointer items-center gap-3 rounded-xl px-3 py-3 text-sm auth-field-enter">
                  <input type="checkbox" checked={isArtist} onChange={(event) => setIsArtist(event.target.checked)} className="h-4 w-4 accent-pink-400" />
                  <span className="flex-1">
                    <span className="block font-medium">I’m an artist</span>
                    <span className="auth-subtitle mt-0.5 block text-xs">Отметь, если планируешь публиковать свою музыку.</span>
                  </span>
                </label>
              )}

              {message && <p role="status" className="auth-message rounded-xl px-3 py-3 text-xs leading-5">{message}</p>}

              <button type="submit" disabled={submitting} className="auth-submit disabled:cursor-wait disabled:opacity-60 group flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3.5 text-sm font-semibold">
                {submitting ? "Please wait…" : isSignUp ? "Create account" : "Sign in"}
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </button>
            </form>

            <p className="auth-footer mt-6 text-center text-sm">
              {isSignUp ? "Account already exists?" : "Нет аккаунта?"}{" "}
              <button type="button" onClick={() => switchMode(isSignUp ? "signIn" : "signUp")} className="auth-link font-semibold">
                {isSignUp ? "Sign in" : "Создать аккаунт"}
              </button>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
