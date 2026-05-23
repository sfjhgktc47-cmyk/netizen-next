"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { AuthModal } from "@/components/auth-modal";
import { useTheme } from "@/components/theme-provider";

type AuthMode = "login" | "register";

type HeaderAuthUser = {
  role: "customer" | "admin";
  profile?: {
    name?: string;
    lastName?: string;
    phone?: string;
    email?: string;
  };
};

type MeResponse = {
  authenticated?: boolean;
  user?: HeaderAuthUser;
};

type HeaderSiteSettings = {
  branding?: {
    storeName?: string;
    logoLight?: string;
    logoDark?: string;
  };
};

function getUserInitial(user: HeaderAuthUser | null) {
  if (!user) {
    return "П";
  }

  if (user.role === "admin") {
    return "A";
  }

  const source =
    user.profile?.name || user.profile?.lastName || user.profile?.phone || user.profile?.email || "П";

  return source.trim()[0]?.toUpperCase() ?? "П";
}

export function SiteHeader() {
  const { dark, toggleTheme } = useTheme();
  const [cartCount, setCartCount] = useState(0);
  const [authUser, setAuthUser] = useState<HeaderAuthUser | null>(null);
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [siteSettings, setSiteSettings] = useState<HeaderSiteSettings | null>(null);

  useEffect(() => {
    const updateCartCount = () => {
      const count = Number(localStorage.getItem("netizen-cart-count") || "0");
      setCartCount(count);
    };

    const updateAuthUser = async () => {
      try {
        const response = await fetch("/api/auth/me", { cache: "no-store" });
        const data = (await response.json().catch(() => ({}))) as MeResponse;

        setAuthUser(data.authenticated && data.user ? data.user : null);
      } catch {
        setAuthUser(null);
      }
    };

    const updateSiteSettings = async () => {
      try {
        const response = await fetch("/api/site-settings", { cache: "no-store" });
        const data = (await response.json().catch(() => ({}))) as {
          site?: HeaderSiteSettings;
        };

        setSiteSettings(data.site ?? null);
      } catch {
        setSiteSettings(null);
      }
    };

    const openAuthModal = (event: Event) => {
      const customEvent = event as CustomEvent<AuthMode | undefined>;
      setAuthMode(customEvent.detail ?? "login");
      setIsAuthModalOpen(true);
    };

    const handleAuthUpdate = () => {
      void updateAuthUser();
    };

    updateCartCount();
    handleAuthUpdate();
    void updateSiteSettings();

    window.addEventListener("storage", updateCartCount);
    window.addEventListener("storage", handleAuthUpdate);
    window.addEventListener("netizen-cart-updated", updateCartCount);
    window.addEventListener("netizen-auth-updated", handleAuthUpdate);
    window.addEventListener("netizen-open-auth", openAuthModal);

    return () => {
      window.removeEventListener("storage", updateCartCount);
      window.removeEventListener("storage", handleAuthUpdate);
      window.removeEventListener("netizen-cart-updated", updateCartCount);
      window.removeEventListener("netizen-auth-updated", handleAuthUpdate);
      window.removeEventListener("netizen-open-auth", openAuthModal);
    };
  }, []);

  const navItems = [
    { label: "Каталог", href: "/catalog" },
    { label: "Новинки", href: "/new" },
    { label: "FAQ", href: "/faq" },
    { label: "Поддержка", href: "/help" },
  ];

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => null);
    setAuthUser(null);
    window.dispatchEvent(new Event("netizen-auth-updated"));

    if (window.location.pathname.startsWith("/profile") || window.location.pathname.startsWith("/nz-console")) {
      window.location.href = "/";
    }
  }

  const accountHref = authUser?.role === "admin" ? "/nz-console" : "/profile";
  const accountLabel = authUser?.role === "admin" ? "Админ-панель" : "Личный кабинет";
  const logoLight = siteSettings?.branding?.logoLight?.trim() || "/logo-light.png";
  const logoDark = siteSettings?.branding?.logoDark?.trim() || "/logo-dark.png";
  const storeName = siteSettings?.branding?.storeName?.trim() || "Нетизен";

  return (
    <header
      className={`flex h-[76px] items-center justify-between rounded-2xl border px-8 transition-all duration-700 ${
        dark
          ? "border-white/10 bg-white/[0.035] shadow-[0_20px_80px_rgba(0,60,255,0.08)]"
          : "border-black/10 bg-white shadow-[0_20px_80px_rgba(15,23,42,0.08)]"
      }`}
    >
      <Link
        href="/"
        className="relative flex h-12 w-[150px] items-center justify-start overflow-hidden"
      >
        <Image
          src={dark ? logoLight : logoDark}
          alt={storeName}
          width={150}
          height={48}
          priority
          className="h-auto max-h-9 w-auto object-contain transition-opacity duration-700"
        />
      </Link>

      <nav
        className={`hidden items-center gap-3 text-sm font-medium lg:flex ${
          dark ? "text-white" : "text-[#07111f]"
        }`}
      >
        {navItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="group relative overflow-hidden rounded-xl px-5 py-3 transition-colors duration-300 hover:text-white"
          >
            <span className="relative z-10">{item.label}</span>

            <span className="absolute inset-0 translate-y-full rounded-xl bg-blue-600/90 opacity-0 transition-all duration-300 ease-out group-hover:translate-y-0 group-hover:opacity-100" />
          </Link>
        ))}
      </nav>

      <div className="flex items-center gap-4">
        <div
          className={`hidden h-11 w-[300px] items-center rounded-xl border px-4 text-sm transition-all duration-700 md:flex ${
            dark
              ? "border-white/10 bg-black/20 text-white/50"
              : "border-black/10 bg-[#f6f8fb] text-black/45"
          }`}
        >
          Поиск по каталогу
        </div>

        <button
          type="button"
          onClick={toggleTheme}
          aria-label="Переключить тему"
          className={`relative h-11 w-16 rounded-xl border transition-all duration-700 ${
            dark
              ? "border-white/10 bg-blue-600/15"
              : "border-black/10 bg-blue-50"
          }`}
        >
          <span
            className={`absolute top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg bg-blue-600 text-sm text-white transition-all duration-500 ease-in-out ${
              dark ? "left-7" : "left-1"
            }`}
          >
            {dark ? "☾" : "☀"}
          </span>
        </button>

        <Link
          href="/cart"
          className={`relative flex h-11 w-11 items-center justify-center rounded-xl border transition-all duration-300 ${
            dark
              ? "border-white/10 bg-white/[0.03] text-white hover:border-blue-500/40 hover:bg-blue-500/10"
              : "border-black/10 bg-white text-[#07111f] hover:border-blue-500/40 hover:bg-blue-50"
          }`}
        >
          🛒

          {cartCount > 0 && (
            <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[11px] font-bold text-white shadow-lg shadow-red-500/30">
              {cartCount}
            </span>
          )}
        </Link>

        {authUser ? (
          <div className="flex items-center gap-2">
            <Link
              href={accountHref}
              aria-label={accountLabel}
              title={accountLabel}
              className={`flex h-11 w-11 items-center justify-center rounded-xl border text-sm font-bold transition-all duration-300 ${
                dark
                  ? "border-white/10 bg-white/[0.03] text-white hover:border-blue-500/40 hover:bg-blue-500/10"
                  : "border-black/10 bg-white text-[#07111f] hover:border-blue-500/40 hover:bg-blue-50"
              }`}
            >
              {getUserInitial(authUser)}
            </Link>

            <button
              type="button"
              onClick={logout}
              aria-label="Выйти из аккаунта"
              title="Выйти"
              className={`hidden h-11 rounded-xl border px-4 text-sm font-medium transition-all duration-300 sm:inline-flex sm:items-center ${
                dark
                  ? "border-white/10 bg-white/[0.03] text-white hover:border-red-500/40 hover:bg-red-500/10"
                  : "border-black/10 bg-white text-[#07111f] hover:border-red-500/40 hover:bg-red-50"
              }`}
            >
              Выйти
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => {
              setAuthMode("login");
              setIsAuthModalOpen(true);
            }}
            className="rounded-xl border border-theme bg-transparent px-5 py-3 text-sm font-medium transition-colors hover:border-blue-500/40 hover:bg-blue-soft"
          >
            Войти
          </button>
        )}
      </div>

      {isAuthModalOpen && (
        <AuthModal
          initialMode={authMode}
          onClose={() => setIsAuthModalOpen(false)}
          onSuccess={(user) => setAuthUser(user)}
        />
      )}
    </header>
  );
}
