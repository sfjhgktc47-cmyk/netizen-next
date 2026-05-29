"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
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
    user.profile?.name ||
    user.profile?.lastName ||
    user.profile?.phone ||
    user.profile?.email ||
    "П";

  return source.trim()[0]?.toUpperCase() ?? "П";
}

export function SiteHeader() {
  const { dark, toggleTheme } = useTheme();
  const pathname = usePathname();
  const [cartCount, setCartCount] = useState(0);
  const [authUser, setAuthUser] = useState<HeaderAuthUser | null>(null);
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [siteSettings, setSiteSettings] = useState<HeaderSiteSettings | null>(
    null,
  );

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
        const response = await fetch("/api/site-settings", {
          cache: "no-store",
        });
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

    if (
      window.location.pathname.startsWith("/profile") ||
      window.location.pathname.startsWith("/nz-console")
    ) {
      window.location.href = "/";
    }
  }

  const accountHref = authUser?.role === "admin" ? "/nz-console" : "/profile";
  const accountLabel =
    authUser?.role === "admin" ? "Админ-панель" : "Личный кабинет";
  const logoLight =
    siteSettings?.branding?.logoLight?.trim() || "/logo-light.png";
  const logoDark = siteSettings?.branding?.logoDark?.trim() || "/logo-dark.png";
  const storeName = siteSettings?.branding?.storeName?.trim() || "Нетизен";

  const mobileNavItems: Array<{
    label: string;
    href: string;
    icon: string;
    badge?: number;
  }> = [
    { label: "Главная", href: "/", icon: "⌂" },
    { label: "Каталог", href: "/catalog", icon: "▦" },
    { label: "Новинки", href: "/new", icon: "✦" },
    { label: "Избранное", href: "/profile#favorites", icon: "♡" },
    { label: "Корзина", href: "/cart", icon: "🛒", badge: cartCount },
  ];

  return (
    <>
      <header
        className={`sticky top-3 z-40 flex h-[64px] items-center justify-between rounded-[22px] border px-4 transition-all duration-700 sm:h-[76px] sm:rounded-2xl sm:px-8 ${
          dark
            ? "border-white/10 bg-white/[0.035] shadow-[0_20px_80px_rgba(0,60,255,0.08)] backdrop-blur-xl"
            : "border-black/10 bg-white/95 shadow-[0_20px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl"
        }`}
      >
        <Link
          href="/"
          className="relative flex h-11 w-[112px] items-center justify-start overflow-hidden sm:h-12 sm:w-[150px]"
        >
          <Image
            src={dark ? logoLight : logoDark}
            alt={storeName}
            width={150}
            height={48}
            priority
            className="h-auto max-h-8 w-auto object-contain transition-opacity duration-700 sm:max-h-9"
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

        <div className="flex items-center gap-2 sm:gap-4">
          <div
            className={`hidden h-11 w-[260px] items-center rounded-xl border px-4 text-sm transition-all duration-700 xl:flex ${
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
            className={`relative h-10 w-12 rounded-xl border transition-all duration-700 sm:h-11 sm:w-16 ${
              dark
                ? "border-white/10 bg-blue-600/15"
                : "border-black/10 bg-blue-50"
            }`}
          >
            <span
              className={`absolute top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg bg-blue-600 text-xs text-white transition-all duration-500 ease-in-out sm:h-8 sm:w-8 sm:text-sm ${
                dark ? "left-4 sm:left-7" : "left-1"
              }`}
            >
              {dark ? "☾" : "☀"}
            </span>
          </button>

          <Link
            href="/cart"
            className={`relative hidden h-11 w-11 items-center justify-center rounded-xl border transition-all duration-300 sm:flex ${
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
                className={`flex h-10 w-10 items-center justify-center rounded-xl border text-sm font-bold transition-all duration-300 sm:h-11 sm:w-11 ${
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
              className="rounded-xl border border-theme bg-transparent px-4 py-2.5 text-sm font-medium transition-colors hover:border-blue-500/40 hover:bg-blue-soft sm:px-5 sm:py-3"
            >
              Войти
            </button>
          )}
        </div>
      </header>

      <nav
        className={`fixed inset-x-0 bottom-0 z-50 border-t px-2 pb-[max(0.65rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-18px_60px_rgba(2,8,20,0.18)] backdrop-blur-xl md:hidden ${
          dark
            ? "border-white/10 bg-[#161b22]/95 text-white"
            : "border-black/10 bg-white/95 text-[#07111f]"
        }`}
        aria-label="Мобильная навигация"
      >
        <div className="mx-auto grid max-w-[430px] grid-cols-5 gap-1">
          {mobileNavItems.map((item) => {
            const path = item.href.split("#")[0];
            const isActive =
              path === "/" ? pathname === "/" : pathname.startsWith(path);

            return (
              <Link
                key={item.label}
                href={item.href}
                className={`relative flex min-h-[58px] flex-col items-center justify-center gap-1 rounded-2xl text-[11px] font-semibold transition-all ${
                  isActive
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/25"
                    : dark
                      ? "text-white/55 hover:bg-white/[0.06] hover:text-white"
                      : "text-black/50 hover:bg-black/[0.04] hover:text-black"
                }`}
              >
                <span className="text-[20px] leading-none">{item.icon}</span>
                <span className="leading-none">{item.label}</span>
                {item.badge ? (
                  <span className="absolute right-3 top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-pink-500 px-1.5 text-[11px] font-bold text-white">
                    {item.badge}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </div>
      </nav>

      {isAuthModalOpen && (
        <AuthModal
          initialMode={authMode}
          onClose={() => setIsAuthModalOpen(false)}
          onSuccess={(user) => setAuthUser(user)}
        />
      )}
    </>
  );
}
