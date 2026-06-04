"use client";

import Link from "next/link";
import Image from 'next/image';
import { usePathname } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";
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
    mobileLogo?: string;
    favicon?: string;
    navIconHome?: string;
    navIconCatalog?: string;
    navIconNew?: string;
    navIconSupport?: string;
    navIconCart?: string;
  };
};

type BottomNavItem = {
  key: "home" | "catalog" | "new" | "support" | "cart";
  label: string;
  href: string;
  fallbackIcon: string;
};

const bottomNavItems: BottomNavItem[] = [
  { key: "home", label: "Главная", href: "/", fallbackIcon: "⌂" },
  { key: "catalog", label: "Каталог", href: "/catalog", fallbackIcon: "▦" },
  { key: "new", label: "Новинки", href: "/new", fallbackIcon: "✦" },
  { key: "support", label: "Поддержка", href: "/help", fallbackIcon: "?" },
  { key: "cart", label: "Корзина", href: "/cart", fallbackIcon: "🛒" },
];

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

function isImageIcon(value: string) {
  return /^(\/|https?:\/\/|data:image\/)/i.test(value.trim());
}

function renderNavIcon(icon: string, label: string) {
  const value = icon.trim();

  if (value && isImageIcon(value)) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <Image quality={75} src={value} alt="" className="h-[18px] w-[18px] object-contain" aria-hidden="true" />
    );
  }

  return <span className="text-[17px] leading-none">{value || label[0]}</span>;
}

function isActivePath(pathname: string, item: BottomNavItem) {
  if (item.href === "/") {
    return pathname === "/";
  }

  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

export function SiteHeader() {
  const { dark, toggleTheme } = useTheme();
  const pathname = usePathname() || "/";
  const [cartCount, setCartCount] = useState(0);
  const [authUser, setAuthUser] = useState<HeaderAuthUser | null>(null);
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [siteSettings, setSiteSettings] = useState<HeaderSiteSettings | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    document.body.classList.add("has-mobile-bottom-nav");

    return () => {
      document.body.classList.remove("has-mobile-bottom-nav");
    };
  }, []);

  useEffect(() => {
    const currentSearch = new URLSearchParams(window.location.search).get("search") ?? "";
    setSearchQuery(currentSearch);
  }, [pathname]);

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

  useEffect(() => {
    const favicon = siteSettings?.branding?.favicon?.trim();

    if (!favicon || typeof document === "undefined") {
      return;
    }

    let link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');

    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
    }

    link.href = favicon;
  }, [siteSettings?.branding?.favicon]);

  const navItems = [
    { label: "Каталог", href: "/catalog" },
    { label: "Новинки", href: "/new" },
    { label: "FAQ", href: "/faq" },
    { label: "Поддержка", href: "/help" },
  ];

  const iconMap = useMemo(
    () => ({
      home: siteSettings?.branding?.navIconHome?.trim() || "⌂",
      catalog: siteSettings?.branding?.navIconCatalog?.trim() || "▦",
      new: siteSettings?.branding?.navIconNew?.trim() || "✦",
      support: siteSettings?.branding?.navIconSupport?.trim() || "?",
      cart: siteSettings?.branding?.navIconCart?.trim() || "🛒",
    }),
    [siteSettings?.branding]
  );

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => null);
    setAuthUser(null);
    window.dispatchEvent(new Event("netizen-auth-updated"));

    if (window.location.pathname.startsWith("/profile") || window.location.pathname.startsWith("/nz-console")) {
      window.location.href = "/";
    }
  }

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const query = searchQuery.trim();

    if (!query) {
      window.location.href = "/catalog";
      return;
    }

    window.location.href = `/catalog?search=${encodeURIComponent(query)}`;
  }

  const accountHref = authUser?.role === "admin" ? "/nz-console" : "/profile";
  const accountLabel = authUser?.role === "admin" ? "Админ-панель" : "Личный кабинет";
  const isSearchVisible = pathname === "/" || pathname === "/catalog" || pathname.startsWith("/catalog/");
  const logoLight = siteSettings?.branding?.logoLight?.trim() || "/logo-light.png";
  const logoDark = siteSettings?.branding?.logoDark?.trim() || "/logo-dark.png";
  const mobileLogo = siteSettings?.branding?.mobileLogo?.trim();
  const storeName = siteSettings?.branding?.storeName?.trim() || "Нетизен";
  const logoSrc = dark ? logoLight : logoDark;

  return (
    <>
      <header
        className={`flex h-[58px] items-center justify-between rounded-2xl border px-3 transition-all duration-700 sm:h-[64px] sm:px-5 lg:h-[76px] lg:px-8 ${
          dark
            ? "border-white/10 bg-white/[0.035] shadow-[0_20px_80px_rgba(0,60,255,0.08)]"
            : "border-black/10 bg-white shadow-[0_20px_80px_rgba(15,23,42,0.08)]"
        }`}
      >
        <Link
          href="/"
          className="relative flex h-10 w-[108px] shrink-0 items-center justify-start overflow-hidden sm:w-[128px] lg:h-12 lg:w-[150px]"
          aria-label={storeName}
        >
          {mobileLogo ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <Image quality={75} src={mobileLogo}
                alt={storeName}
                className="h-auto max-h-7 w-auto object-contain transition-opacity duration-700 sm:max-h-8 lg:hidden"
              />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <Image quality={75} src={logoSrc}
                alt={storeName}
                className="hidden h-auto max-h-9 w-auto object-contain transition-opacity duration-700 lg:block"
              />
            </>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <Image quality={75} src={logoSrc}
              alt={storeName}
              className="h-auto max-h-7 w-auto object-contain transition-opacity duration-700 sm:max-h-8 lg:max-h-9"
            />
          )}
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

        <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
          {isSearchVisible && (
            <form
              onSubmit={submitSearch}
              className={`hidden h-11 w-[300px] items-center rounded-xl border px-4 text-sm transition-all duration-700 lg:flex ${
                dark
                  ? "border-white/10 bg-black/20 text-white/70 focus-within:border-blue-500/55"
                  : "border-black/10 bg-[#f6f8fb] text-black/70 focus-within:border-blue-500/55"
              }`}
            >
              <input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Поиск по каталогу"
                className="h-full min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-current/50"
              />
              <button type="submit" className="ml-2 text-blue-500" aria-label="Найти">
                ⌕
              </button>
            </form>
          )}

          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Переключить тему"
            className={`relative h-9 w-12 rounded-xl border transition-all duration-700 sm:h-10 sm:w-14 lg:h-11 lg:w-16 ${
              dark
                ? "border-white/10 bg-blue-600/15"
                : "border-black/10 bg-blue-50"
            }`}
          >
            <span
              className={`absolute top-1/2 flex h-[26px] w-[26px] -translate-y-1/2 items-center justify-center rounded-lg bg-blue-600 text-xs text-white transition-all duration-500 ease-in-out sm:h-7 sm:w-7 lg:h-8 lg:w-8 lg:text-sm ${
                dark ? "left-5 sm:left-6 lg:left-7" : "left-1"
              }`}
            >
              {dark ? "☾" : "☀"}
            </span>
          </button>

          <Link
            href="/cart"
            className={`relative hidden h-11 w-11 items-center justify-center rounded-xl border transition-all duration-300 lg:flex ${
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
                className={`flex h-9 w-9 items-center justify-center rounded-xl border text-sm font-bold transition-all duration-300 sm:h-10 sm:w-10 lg:h-11 lg:w-11 ${
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
              className="rounded-xl border border-theme bg-transparent px-3 py-2 text-sm font-medium transition-colors hover:border-blue-500/40 hover:bg-blue-soft sm:px-4 sm:py-2.5 lg:px-5 lg:py-3"
            >
              Войти
            </button>
          )}
        </div>
      </header>

      {isSearchVisible && (
        <form
          onSubmit={submitSearch}
          className={`mt-2 flex h-10 items-center rounded-xl border px-3 text-sm transition-all duration-700 lg:hidden ${
            dark
              ? "border-white/10 bg-white/[0.035] text-white/70 focus-within:border-blue-500/55"
              : "border-black/10 bg-white text-black/65 shadow-[0_14px_50px_rgba(15,23,42,0.06)] focus-within:border-blue-500/55"
          }`}
        >
          <span className="mr-3 text-blue-500">⌕</span>
          <input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Поиск по каталогу"
            className="h-full min-w-0 flex-1 bg-transparent outline-none placeholder:text-current/50"
          />
          <button type="submit" className="ml-2 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white">
            Найти
          </button>
        </form>
      )}

      <nav className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center px-3 pb-[calc(env(safe-area-inset-bottom)+8px)] lg:hidden">
        <div
          className={`pointer-events-auto grid w-full max-w-[420px] grid-cols-5 gap-1 rounded-[22px] border p-1.5 shadow-[0_20px_80px_rgba(15,23,42,0.24)] backdrop-blur-xl ${
            dark ? "border-white/10 bg-[#07111f]/90" : "border-black/10 bg-white/95"
          }`}
        >
          {bottomNavItems.map((item) => {
            const active = isActivePath(pathname, item);
            const icon = iconMap[item.key] || item.fallbackIcon;

            return (
              <Link
                key={item.key}
                href={item.href}
                aria-label={item.label}
                className={`relative flex min-h-[50px] flex-col items-center justify-center gap-1 rounded-[16px] text-[9px] font-semibold transition-all ${
                  active
                    ? "bg-blue-600 text-white shadow-[0_10px_28px_rgba(37,99,235,0.3)]"
                    : dark
                      ? "text-white/60 hover:bg-white/[0.06] hover:text-white"
                      : "text-slate-500 hover:bg-blue-50 hover:text-blue-600"
                }`}
              >
                <span className="flex h-5 items-center justify-center">{renderNavIcon(icon, item.label)}</span>
                <span className="max-w-full truncate leading-none">{item.label}</span>

                {item.key === "cart" && cartCount > 0 && (
                  <span className="absolute right-2 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-none text-white">
                    {cartCount}
                  </span>
                )}
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
