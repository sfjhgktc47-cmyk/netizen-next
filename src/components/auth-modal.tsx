"use client";

import { useEffect, useMemo, useState } from "react";

type AuthMode = "login" | "register" | "admin";

type CustomerProfile = {
  name: string;
  phone: string;
  email: string;
};

type AuthSession = {
  role: "customer" | "admin";
  createdAt: string;
  profile?: CustomerProfile;
};

type AuthModalProps = {
  initialMode?: AuthMode;
  onClose: () => void;
  onSuccess?: (session: AuthSession) => void;
};

const emptyProfile: CustomerProfile = {
  name: "",
  phone: "",
  email: "",
};

function readJson<T>(key: string): T | null {
  try {
    const value = localStorage.getItem(key);

    if (!value) {
      return null;
    }

    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

function writeJson<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

function normalizeProfile(profile: Partial<CustomerProfile>): CustomerProfile {
  return {
    name: profile.name?.trim() ?? "",
    phone: profile.phone?.trim() ?? "",
    email: profile.email?.trim() ?? "",
  };
}

function getSavedProfile() {
  return normalizeProfile(
    readJson<Partial<CustomerProfile>>("netizen-profile") ??
      readJson<Partial<CustomerProfile>>("netizen-user") ??
      readJson<Partial<CustomerProfile>>("netizen-customer") ??
      emptyProfile
  );
}

function isProfileEmpty(profile: CustomerProfile) {
  return !profile.name && !profile.phone && !profile.email;
}

export function AuthModal({ initialMode = "login", onClose, onSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [profileDraft, setProfileDraft] = useState<CustomerProfile>(emptyProfile);
  const [adminCode, setAdminCode] = useState("");
  const [error, setError] = useState("");
  const [hasSavedProfile, setHasSavedProfile] = useState(false);

  useEffect(() => {
    setMode(initialMode);
    const savedProfile = getSavedProfile();

    setProfileDraft(savedProfile);
    setHasSavedProfile(!isProfileEmpty(savedProfile));
    setAdminCode("");
    setError("");
  }, [initialMode]);

  const title = useMemo(() => {
    if (mode === "register") {
      return "Регистрация клиента";
    }

    if (mode === "admin") {
      return "Вход в админ-панель";
    }

    return "Вход в личный кабинет";
  }, [mode]);

  function finishAuth(session: AuthSession) {
    writeJson("netizen-auth", session);

    if (session.profile) {
      writeJson("netizen-profile", session.profile);
      writeJson("netizen-customer", session.profile);
    }

    window.dispatchEvent(new Event("netizen-auth-updated"));
    onSuccess?.(session);
    onClose();
  }

  function handleCustomerSubmit() {
    setError("");

    const normalizedProfile = normalizeProfile(profileDraft);

    if (mode === "login") {
      const savedProfile = getSavedProfile();
      const fallbackProfile = normalizeProfile({
        ...savedProfile,
        email: normalizedProfile.email || savedProfile.email,
        phone: normalizedProfile.phone || savedProfile.phone,
        name: savedProfile.name || normalizedProfile.name,
      });

      if (!fallbackProfile.phone && !fallbackProfile.email) {
        setError("Укажи телефон или e-mail для входа.");
        return;
      }

      finishAuth({
        role: "customer",
        createdAt: new Date().toISOString(),
        profile: fallbackProfile,
      });
      return;
    }

    if (!normalizedProfile.name || !normalizedProfile.phone) {
      setError("Для регистрации укажи имя и телефон.");
      return;
    }

    finishAuth({
      role: "customer",
      createdAt: new Date().toISOString(),
      profile: normalizedProfile,
    });
  }

  function handleAdminSubmit() {
    setError("");

    const expectedCode = process.env.NEXT_PUBLIC_ADMIN_PIN || "netizen-admin";

    if (adminCode.trim() !== expectedCode) {
      setError("Неверный код администратора.");
      return;
    }

    const session: AuthSession = {
      role: "admin",
      createdAt: new Date().toISOString(),
    };

    writeJson("netizen-admin-auth", session);
    finishAuth(session);
    window.location.href = "/nz-console";
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/55 px-4 py-8 backdrop-blur-sm">
      <div className="card w-full max-w-[520px] rounded-[30px] p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-sm font-medium uppercase tracking-[0.2em] text-blue-500">
              Аккаунт
            </div>
            <h2 className="mt-2 text-3xl font-bold tracking-[-0.045em]">
              {title}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Вход для клиента и быстрый доступ в админку теперь находятся здесь.
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

        <div className="mt-6 grid grid-cols-3 gap-2 rounded-2xl border border-theme bg-blue-soft p-1">
          <ModeButton active={mode === "login"} onClick={() => setMode("login")}>
            Войти
          </ModeButton>
          <ModeButton active={mode === "register"} onClick={() => setMode("register")}>
            Регистрация
          </ModeButton>
          <ModeButton active={mode === "admin"} onClick={() => setMode("admin")}>
            Админ
          </ModeButton>
        </div>

        {mode === "admin" ? (
          <div className="mt-6 grid gap-4">
            <label className="grid gap-2 text-sm font-medium">
              Код администратора
              <input
                type="password"
                value={adminCode}
                onChange={(event) => setAdminCode(event.target.value)}
                placeholder="Введите код"
                className="h-12 rounded-xl border border-theme bg-transparent px-4 outline-none placeholder:text-muted-soft focus:border-blue-500/50"
              />
            </label>

            <p className="rounded-2xl border border-blue-500/25 bg-blue-500/10 p-4 text-sm leading-relaxed text-muted">
              Сейчас это быстрый вход для тестового режима. Код по умолчанию:
              <span className="font-semibold text-main"> netizen-admin</span>.
              На проде лучше задать свой код через переменную
              <span className="font-semibold text-main"> NEXT_PUBLIC_ADMIN_PIN</span>.
            </p>
          </div>
        ) : (
          <div className="mt-6 grid gap-4">
            {mode === "register" && (
              <label className="grid gap-2 text-sm font-medium">
                Имя
                <input
                  value={profileDraft.name}
                  onChange={(event) =>
                    setProfileDraft((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                  placeholder="Например, Иван"
                  className="h-12 rounded-xl border border-theme bg-transparent px-4 outline-none placeholder:text-muted-soft focus:border-blue-500/50"
                />
              </label>
            )}

            <label className="grid gap-2 text-sm font-medium">
              Телефон
              <input
                value={profileDraft.phone}
                onChange={(event) =>
                  setProfileDraft((current) => ({
                    ...current,
                    phone: event.target.value,
                  }))
                }
                placeholder="+7 999 000-00-00"
                className="h-12 rounded-xl border border-theme bg-transparent px-4 outline-none placeholder:text-muted-soft focus:border-blue-500/50"
              />
            </label>

            <label className="grid gap-2 text-sm font-medium">
              E-mail
              <input
                type="email"
                value={profileDraft.email}
                onChange={(event) =>
                  setProfileDraft((current) => ({
                    ...current,
                    email: event.target.value,
                  }))
                }
                placeholder="mail@example.com"
                className="h-12 rounded-xl border border-theme bg-transparent px-4 outline-none placeholder:text-muted-soft focus:border-blue-500/50"
              />
            </label>

            {mode === "login" && !hasSavedProfile && (
              <p className="rounded-2xl border border-blue-500/25 bg-blue-500/10 p-4 text-sm leading-relaxed text-muted">
                Если аккаунта ещё нет, введи телефон/e-mail или перейди на регистрацию.
                Сейчас вход работает в тестовом режиме через данные в браузере.
              </p>
            )}
          </div>
        )}

        {error && (
          <div className="mt-5 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-500">
            {error}
          </div>
        )}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={mode === "admin" ? handleAdminSubmit : handleCustomerSubmit}
            className="rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-medium text-white transition-colors hover:bg-blue-500"
          >
            {mode === "admin" ? "Войти в админку →" : "Продолжить →"}
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
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
        active
          ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
          : "text-muted hover:bg-white/10 hover:text-main"
      }`}
    >
      {children}
    </button>
  );
}
