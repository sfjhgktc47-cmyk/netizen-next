"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";

type AuthMode = "login" | "register";

type CustomerProfile = {
  id?: string;
  name: string;
  lastName: string;
  phone: string;
  email: string;
};

type AuthUser = {
  role: "customer" | "admin";
  profile?: CustomerProfile;
};

type AuthResponse = {
  ok?: boolean;
  message?: string;
  user?: AuthUser;
  redirectTo?: string;
};

type AuthModalProps = {
  initialMode?: AuthMode;
  onClose: () => void;
  onSuccess?: (user: AuthUser) => void;
};

const emptyLogin = {
  login: "",
  password: "",
};

const emptyRegister = {
  firstName: "",
  lastName: "",
  phone: "",
  email: "",
  password: "",
};

export function AuthModal({ initialMode = "login", onClose, onSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [loginDraft, setLoginDraft] = useState(emptyLogin);
  const [registerDraft, setRegisterDraft] = useState(emptyRegister);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setMode(initialMode);
    setError("");
  }, [initialMode]);

  const title = useMemo(() => {
    return mode === "register" ? "Создать аккаунт" : "Вход в личный кабинет";
  }, [mode]);

  async function submitAuth() {
    setError("");
    setIsSubmitting(true);

    const url = mode === "register" ? "/api/auth/register" : "/api/auth/login";
    const payload = mode === "register" ? registerDraft : loginDraft;

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await response.json().catch(() => ({}))) as AuthResponse;

      if (!response.ok || !data.user) {
        setError(data.message || "Не получилось войти. Проверь данные и попробуй ещё раз.");
        return;
      }

      window.dispatchEvent(new Event("netizen-auth-updated"));
      onSuccess?.(data.user);

      if (data.redirectTo) {
        window.location.href = data.redirectTo;
        return;
      }

      onClose();
    } catch {
      setError("Сервер авторизации не ответил. Попробуй ещё раз.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-4 py-8 backdrop-blur-md">
      <div className="w-full max-w-[520px] rounded-[30px] border border-theme bg-page p-6 text-main shadow-[0_30px_120px_rgba(0,0,0,0.55)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-sm font-medium uppercase tracking-[0.2em] text-blue-500">
              Аккаунт
            </div>
            <h2 className="mt-2 text-3xl font-bold tracking-[-0.045em]">
              {title}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Вход работает через логин и пароль. После входа клиент попадёт в профиль, администратор — в консоль.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-theme text-lg transition-colors hover:border-blue-500/40 hover:bg-blue-soft"
            aria-label="Закрыть окно входа"
          >
            ×
          </button>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-2 rounded-2xl border border-theme bg-blue-soft p-1">
          <ModeButton active={mode === "login"} onClick={() => setMode("login")}>
            Войти
          </ModeButton>
          <ModeButton active={mode === "register"} onClick={() => setMode("register")}>
            Регистрация
          </ModeButton>
        </div>

        <div className="mt-6 grid gap-4">
          {mode === "login" ? (
            <>
              <label className="grid gap-2 text-sm font-medium">
                Логин
                <input
                  value={loginDraft.login}
                  onChange={(event) =>
                    setLoginDraft((current) => ({ ...current, login: event.target.value }))
                  }
                  placeholder="Телефон, e-mail или логин"
                  autoComplete="username"
                  className="h-12 rounded-xl border border-theme bg-transparent px-4 text-main outline-none placeholder:text-muted-soft focus:border-blue-500/50"
                />
              </label>

              <label className="grid gap-2 text-sm font-medium">
                Пароль
                <input
                  type="password"
                  value={loginDraft.password}
                  onChange={(event) =>
                    setLoginDraft((current) => ({ ...current, password: event.target.value }))
                  }
                  placeholder="Введите пароль"
                  autoComplete="current-password"
                  className="h-12 rounded-xl border border-theme bg-transparent px-4 text-main outline-none placeholder:text-muted-soft focus:border-blue-500/50"
                />
              </label>
            </>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="grid gap-2 text-sm font-medium">
                  Имя
                  <input
                    value={registerDraft.firstName}
                    onChange={(event) =>
                      setRegisterDraft((current) => ({ ...current, firstName: event.target.value }))
                    }
                    placeholder="Иван"
                    autoComplete="given-name"
                    className="h-12 rounded-xl border border-theme bg-transparent px-4 text-main outline-none placeholder:text-muted-soft focus:border-blue-500/50"
                  />
                </label>

                <label className="grid gap-2 text-sm font-medium">
                  Фамилия
                  <input
                    value={registerDraft.lastName}
                    onChange={(event) =>
                      setRegisterDraft((current) => ({ ...current, lastName: event.target.value }))
                    }
                    placeholder="Иванов"
                    autoComplete="family-name"
                    className="h-12 rounded-xl border border-theme bg-transparent px-4 text-main outline-none placeholder:text-muted-soft focus:border-blue-500/50"
                  />
                </label>
              </div>

              <label className="grid gap-2 text-sm font-medium">
                Телефон
                <input
                  value={registerDraft.phone}
                  onChange={(event) =>
                    setRegisterDraft((current) => ({ ...current, phone: event.target.value }))
                  }
                  placeholder="+7 999 000-00-00"
                  autoComplete="tel"
                  className="h-12 rounded-xl border border-theme bg-transparent px-4 text-main outline-none placeholder:text-muted-soft focus:border-blue-500/50"
                />
              </label>

              <label className="grid gap-2 text-sm font-medium">
                E-mail <span className="text-muted">необязательно</span>
                <input
                  type="email"
                  value={registerDraft.email}
                  onChange={(event) =>
                    setRegisterDraft((current) => ({ ...current, email: event.target.value }))
                  }
                  placeholder="mail@example.com"
                  autoComplete="email"
                  className="h-12 rounded-xl border border-theme bg-transparent px-4 text-main outline-none placeholder:text-muted-soft focus:border-blue-500/50"
                />
              </label>

              <label className="grid gap-2 text-sm font-medium">
                Пароль
                <input
                  type="password"
                  value={registerDraft.password}
                  onChange={(event) =>
                    setRegisterDraft((current) => ({ ...current, password: event.target.value }))
                  }
                  placeholder="Минимум 6 символов"
                  autoComplete="new-password"
                  className="h-12 rounded-xl border border-theme bg-transparent px-4 text-main outline-none placeholder:text-muted-soft focus:border-blue-500/50"
                />
              </label>
            </>
          )}
        </div>

        {error && (
          <div className="mt-5 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-500">
            {error}
          </div>
        )}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={submitAuth}
            disabled={isSubmitting}
            className="rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-medium text-white transition-colors hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Проверяем..." : mode === "register" ? "Зарегистрироваться →" : "Войти →"}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-theme bg-transparent px-6 py-3.5 text-sm font-medium transition-colors hover:border-blue-500/40 hover:bg-blue-soft"
          >
            Отмена
          </button>
        </div>
      </div>
    </div>
  );
}

function ModeButton({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
        active
          ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
          : "text-muted hover:bg-blue-soft hover:text-main"
      }`}
    >
      {children}
    </button>
  );
}
