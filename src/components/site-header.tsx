"use client";

import Link from "next/link";
import Image from 'next/image';
import { usePathname } from "next/navigation";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
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

type SearchProduct = {
  slug: string;
  name: string;
  brand: string;
  image: string;
  price: string;
  oldPrice: string;
  discount: number;
};

type SearchResponse = {
  products?: SearchProduct[];
};

type HeaderSiteSettings = {
  contacts?: {
    phone?: string;
    phoneText?: string;
    workingHours?: string;
  };
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
  { key: "cart", label: "Корзина", href: "/cart", fallbackIcon: "__cart__" },
];

function isImageIcon(value: string) {
  return /^(\/|https?:\/\/|data:image\/)/i.test(value.trim());
}

function PhoneHeaderIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
      focusable="false"
      shapeRendering="geometricPrecision"
    >
      <path
        d="M22 16.92v3a2 2 0 0 1-2.18 2A19.79 19.79 0 0 1 3.09 5.18 2 2 0 0 1 5.08 3h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.69 2.8a2 2 0 0 1-.45 2.11L9.04 10.9a16 16 0 0 0 4.06 4.06l1.27-1.27a2 2 0 0 1 2.11-.45c.9.33 1.84.56 2.8.69A2 2 0 0 1 22 16.92Z"
        stroke="currentColor"
        strokeWidth="2.15"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

function CartHeaderIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      className={className}
      aria-hidden="true"
      focusable="false"
      shapeRendering="geometricPrecision"
    >
      <path
        d="M4.8 8h10.4l7.2 34.6c.45 2.2 2.4 3.8 4.65 3.8H51.7c2.3 0 4.3-1.65 4.72-3.92L62 16.7H17.05"
        stroke="currentColor"
        strokeWidth="5.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M20.6 26.2h37.2M22.8 36.1h32.9M31.4 17l2.3 29M46.2 17l-2.35 29"
        stroke="currentColor"
        strokeWidth="4.45"
        strokeLinecap="round"
      />
      <circle cx="29" cy="55.2" r="4.7" stroke="currentColor" strokeWidth="5" />
      <circle cx="51.8" cy="55.2" r="4.7" stroke="currentColor" strokeWidth="5" />
    </svg>
  );
}

function UserHeaderIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      className={className}
      aria-hidden="true"
      focusable="false"
      shapeRendering="geometricPrecision"
    >
      <circle
        cx="32"
        cy="18.2"
        r="13.2"
        stroke="currentColor"
        strokeWidth="5.8"
      />
      <path
        d="M8.2 59.1c.9-15.6 10.1-24.3 23.8-24.3s22.9 8.7 23.8 24.3"
        stroke="currentColor"
        strokeWidth="5.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function renderNavIcon(icon: string, label: string, active = false) {
  const value = icon.trim();

  if (value === "__cart__") {
    return (
      <CartHeaderIcon
        className={`h-[21px] w-[21px] overflow-visible ${active ? "text-white" : "text-blue-500"}`}
      />
    );
  }

  if (value && isImageIcon(value)) {
    return (
      <Image
        quality={75}
        src={value}
        alt=""
        width={20}
        height={20}
        className={`h-[18px] w-[18px] object-contain transition-all ${
          active ? "brightness-0 invert" : ""
        }`}
        aria-hidden="true"
      />
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
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [searchProducts, setSearchProducts] = useState<SearchProduct[]>([]);
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const [isPhoneOpen, setIsPhoneOpen] = useState(false);
  const searchRootRef = useRef<HTMLDivElement | null>(null);
  const phoneRootRef = useRef<HTMLDivElement | null>(null);

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
    try {
      const stored = JSON.parse(localStorage.getItem("netizen-search-history") || "[]");
      setSearchHistory(Array.isArray(stored) ? stored.filter((item) => typeof item === "string").slice(0, 8) : []);
    } catch {
      setSearchHistory([]);
    }
  }, []);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      const target = event.target as Node;

      if (searchRootRef.current && !searchRootRef.current.contains(target)) {
        setIsSearchOpen(false);
      }

      if (phoneRootRef.current && !phoneRootRef.current.contains(target)) {
        setIsPhoneOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);

    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  useEffect(() => {
    if (!isSearchOpen) {
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setIsSearchLoading(true);

      try {
        const query = searchQuery.trim();
        const response = await fetch(
          `/api/catalog-search${query ? `?q=${encodeURIComponent(query)}` : ""}`,
          { signal: controller.signal },
        );
        const payload = (await response.json().catch(() => ({}))) as SearchResponse;
        setSearchProducts(Array.isArray(payload.products) ? payload.products : []);
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          setSearchProducts([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsSearchLoading(false);
        }
      }
    }, searchQuery.trim() ? 220 : 0);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [isSearchOpen, searchQuery]);

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
      cart: siteSettings?.branding?.navIconCart?.trim() || "__cart__",
    }),
    [siteSettings?.branding]
  );

  function saveSearchHistory(query: string) {
    const nextHistory = [query, ...searchHistory.filter((item) => item.toLowerCase() !== query.toLowerCase())].slice(0, 8);
    setSearchHistory(nextHistory);
    localStorage.setItem("netizen-search-history", JSON.stringify(nextHistory));
  }

  function clearSearchHistory() {
    setSearchHistory([]);
    localStorage.removeItem("netizen-search-history");
  }

  function openHistoryQuery(query: string) {
    setSearchQuery(query);
    saveSearchHistory(query);
    window.location.href = `/catalog?search=${encodeURIComponent(query)}`;
  }

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const query = searchQuery.trim();

    if (!query) {
      window.location.href = "/catalog";
      return;
    }

    saveSearchHistory(query);
    setIsSearchOpen(false);
    window.location.href = `/catalog?search=${encodeURIComponent(query)}`;
  }

  const accountHref = authUser?.role === "admin" ? "/nz-console" : "/profile";
  const accountLabel = authUser?.role === "admin" ? "Админ-панель" : "Личный кабинет";
  const isSearchVisible = pathname === "/" || pathname === "/catalog" || pathname.startsWith("/catalog/");
  const logoLight = siteSettings?.branding?.logoLight?.trim() || "/logo-light.png";
  const logoDark = siteSettings?.branding?.logoDark?.trim() || "/logo-dark.png";
  const mobileLogo = siteSettings?.branding?.mobileLogo?.trim();
  const storeName = siteSettings?.branding?.storeName?.trim() || "Нетизен";
  const storePhone = siteSettings?.contacts?.phone?.trim() || "8 (800) 123-45-67";
  const storePhoneText =
    siteSettings?.contacts?.phoneText?.trim() ||
    siteSettings?.contacts?.workingHours?.trim() ||
    "Связаться с магазином";
  const phoneHref = `tel:${storePhone.replace(/[^\d+]/g, "")}`;
  const logoSrc = dark ? logoLight : logoDark;

  return (
    <>
      <header
        className={`sticky top-2 z-[100] flex h-[58px] items-center justify-between rounded-2xl border px-3 backdrop-blur-xl transition-all duration-700 sm:top-3 sm:h-[64px] sm:px-5 lg:h-[76px] lg:px-8 ${
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
              className={`rounded-xl border px-4 py-2.5 outline-none focus:outline-none transition-all duration-200 ${
                pathname === item.href || pathname.startsWith(`${item.href}/`)
                  ? "border-transparent bg-blue-600 text-white shadow-[0_10px_26px_rgba(37,99,235,0.22)]"
                  : dark
                    ? "border-white/10 bg-transparent text-white hover:border-white/10 hover:bg-blue-600 hover:text-white"
                    : "border-transparent text-[#07111f] hover:border-transparent hover:bg-blue-50 hover:text-blue-600"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
          {isSearchVisible && (
            <div ref={searchRootRef} className="relative hidden lg:block">
              <form
                onSubmit={submitSearch}
                className={`flex h-11 w-[400px] items-center rounded-xl border px-4 text-sm transition-all duration-300 ${
                  dark
                    ? "border-white/10 bg-black/20 text-white/70 focus-within:border-blue-500/55"
                    : "border-black/10 bg-[#f6f8fb] text-black/70 focus-within:border-blue-500/55"
                }`}
              >
                <input
                  value={searchQuery}
                  onFocus={() => setIsSearchOpen(true)}
                  onChange={(event) => {
                    setSearchQuery(event.target.value);
                    setIsSearchOpen(true);
                  }}
                  placeholder="Поиск по каталогу"
                  className="h-full min-w-0 flex-1 bg-transparent pr-2 text-sm outline-none placeholder:text-current/50"
                />

                {searchQuery ? (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setIsSearchOpen(true);
                    }}
                    className={`mr-1 inline-flex h-7 w-7 items-center justify-center rounded-full text-sm transition-colors ${
                      dark ? "text-white/55 hover:bg-white/10 hover:text-white" : "text-black/45 hover:bg-black/5 hover:text-black"
                    }`}
                    aria-label="Очистить поиск"
                    title="Очистить"
                  >
                    ×
                  </button>
                ) : null}

                <button type="submit" className="ml-1 text-lg text-blue-500" aria-label="Найти">
                  ⌕
                </button>
              </form>

              {isSearchOpen ? (
                <div
                  className={`absolute right-0 top-[calc(100%+12px)] z-[80] max-h-[82vh] w-[820px] max-w-[calc(100vw-32px)] overflow-y-auto rounded-[28px] border p-6 shadow-[0_36px_120px_rgba(15,23,42,0.34)] ${
                    dark
                      ? "border-white/10 bg-[#07101d] text-white"
                      : "border-black/10 bg-white text-[#07111f]"
                  }`}
                >
                  {!searchQuery.trim() ? (
                    <>
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="text-base font-bold">История</h3>
                        {searchHistory.length > 0 ? (
                          <button
                            type="button"
                            onClick={clearSearchHistory}
                            className="text-xs font-medium text-blue-500 transition-colors hover:text-blue-400"
                          >
                            Очистить
                          </button>
                        ) : null}
                      </div>

                      {searchHistory.length > 0 ? (
                        <div className="mt-4 grid gap-1.5">
                          {searchHistory.map((item) => (
                            <button
                              key={item}
                              type="button"
                              onClick={() => openHistoryQuery(item)}
                              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-left text-sm transition-colors ${
                                dark ? "hover:bg-white/[0.05]" : "hover:bg-slate-100"
                              }`}
                            >
                              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-500/10 text-xs text-blue-500">
                                ↶
                              </span>
                              <span className="truncate">{item}</span>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <p className={`mt-3 text-xs ${dark ? "text-white/45" : "text-black/45"}`}>
                          Здесь появятся ваши последние запросы.
                        </p>
                      )}

                      <div className={`my-4 h-px ${dark ? "bg-white/10" : "bg-black/10"}`} />

                      <h3 className="text-base font-bold">Рекомендуем для вас</h3>
                    </>
                  ) : (
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="text-base font-bold">Результаты поиска</h3>
                      <span className={`text-xs ${dark ? "text-white/45" : "text-black/45"}`}>
                        {isSearchLoading ? "Ищем…" : `${searchProducts.length} найдено`}
                      </span>
                    </div>
                  )}

                  <div className="mt-5 grid grid-cols-2 gap-5">
                    {searchProducts.map((product) => (
                      <Link
                        key={product.slug}
                        href={`/product/${product.slug}`}
                        onClick={() => {
                          const query = searchQuery.trim();
                          if (query) saveSearchHistory(query);
                          setIsSearchOpen(false);
                        }}
                        className={`group rounded-[24px] border p-4 transition-all hover:-translate-y-0.5 ${
                          dark
                            ? "border-white/10 bg-white/[0.03] hover:border-blue-500/35"
                            : "border-black/10 bg-white hover:border-blue-500/35 hover:shadow-lg"
                        }`}
                      >
                        <div className={`aspect-[16/10] overflow-hidden rounded-[20px] ${dark ? "bg-white/[0.04]" : "bg-slate-100"}`}>
                          {product.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={product.image}
                              alt=""
                              loading="lazy"
                              decoding="async"
                              className="h-full w-full object-contain p-4"
                            />
                          ) : null}
                        </div>

                        <div className="px-1 pb-1 pt-2">
                          <div className={`truncate text-[10px] ${dark ? "text-white/45" : "text-black/45"}`}>
                            {product.brand}
                          </div>
                          <div className="mt-2 line-clamp-2 min-h-[48px] text-[15px] font-semibold leading-snug">
                            {product.name}
                          </div>

                          <div className="mt-2 flex flex-wrap items-baseline gap-x-2 gap-y-1">
                            <span className="text-lg font-bold text-blue-500">{product.price}</span>
                            {product.oldPrice ? (
                              <span className={`text-[10px] line-through ${dark ? "text-white/35" : "text-black/35"}`}>
                                {product.oldPrice}
                              </span>
                            ) : null}
                            {product.discount > 0 ? (
                              <span className="text-[10px] font-semibold text-rose-500">−{product.discount}%</span>
                            ) : null}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>

                  {!isSearchLoading && searchProducts.length === 0 ? (
                    <div className={`py-8 text-center text-sm ${dark ? "text-white/45" : "text-black/45"}`}>
                      {searchQuery.trim() ? "Ничего не найдено" : "Рекомендации пока не выбраны"}
                    </div>
                  ) : null}

                  {isSearchLoading ? (
                    <div className={`py-8 text-center text-sm ${dark ? "text-white/45" : "text-black/45"}`}>
                      Загружаем товары…
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
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

          <div ref={phoneRootRef} className="relative">
            <button
              type="button"
              onClick={() => setIsPhoneOpen((current) => !current)}
              aria-label="Телефон магазина"
              aria-expanded={isPhoneOpen}
              className={`group flex h-10 w-10 items-center justify-center overflow-visible rounded-xl border text-sm font-bold outline-none focus:outline-none transition-all duration-300 sm:h-10 sm:w-10 lg:h-11 lg:w-11 ${
                isPhoneOpen
                  ? "border-transparent bg-blue-600 text-white shadow-[0_10px_30px_rgba(37,99,235,0.34)]"
                  : dark
                    ? "border-white/20 bg-white/[0.08] text-white hover:border-transparent hover:bg-blue-600"
                    : "border-black/15 bg-white text-[#07111f] hover:border-transparent hover:bg-blue-50"
              }`}
            >
              <PhoneHeaderIcon
                className={`h-[23px] w-[23px] shrink-0 ${
                  isPhoneOpen
                    ? "text-white"
                    : "text-blue-500 transition-colors group-hover:text-white"
                }`}
              />
            </button>

            {isPhoneOpen ? (
              <div
                className={`absolute right-0 top-[calc(100%+10px)] z-[130] w-[280px] rounded-2xl border p-4 shadow-[0_24px_70px_rgba(0,0,0,0.34)] ${
                  dark
                    ? "border-white/20 bg-[#0a1424] text-white"
                    : "border-black/10 bg-white text-[#07111f]"
                }`}
              >
                <div className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-500">
                  Связь с магазином
                </div>
                <a
                  href={phoneHref}
                  className="mt-2 block text-lg font-bold transition-colors hover:text-blue-500"
                >
                  {storePhone}
                </a>
                <p className={`mt-1 text-xs leading-relaxed ${dark ? "text-white/65" : "text-black/55"}`}>
                  {storePhoneText}
                </p>
                <a
                  href={phoneHref}
                  className="mt-4 flex min-h-10 items-center justify-center rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-500"
                >
                  Позвонить
                </a>
              </div>
            ) : null}
          </div>

          <Link
            href="/cart"
            className={`group relative hidden h-11 w-11 items-center justify-center overflow-visible rounded-xl border outline-none focus:outline-none transition-all duration-300 lg:flex ${
              dark
                ? "border-white/10 bg-white/[0.03] text-white hover:border-transparent hover:bg-blue-600"
                : "border-black/10 bg-white text-[#07111f] hover:border-transparent hover:bg-blue-50"
            }`}
          >
            <CartHeaderIcon className="h-[25px] w-[25px] shrink-0 overflow-visible text-blue-500 transition-colors group-hover:text-white" />

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
                className={`group flex h-10 w-10 items-center justify-center overflow-visible rounded-xl border text-sm font-bold outline-none focus:outline-none transition-all duration-300 sm:h-10 sm:w-10 lg:h-11 lg:w-11 ${
                  dark
                    ? "border-white/10 bg-white/[0.03] text-white hover:border-transparent hover:bg-blue-600"
                    : "border-black/10 bg-white text-[#07111f] hover:border-transparent hover:bg-blue-50"
                }`}
              >
                <UserHeaderIcon className="h-[24px] w-[24px] shrink-0 overflow-visible text-blue-500 transition-colors group-hover:text-white" />
              </Link>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                setAuthMode("login");
                setIsAuthModalOpen(true);
              }}
              className="rounded-xl border border-theme bg-transparent px-3 py-2 text-sm font-medium transition-colors hover:border-theme hover:bg-blue-soft sm:px-4 sm:py-2.5 lg:px-5 lg:py-3"
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
                <span className="flex h-5 items-center justify-center">{renderNavIcon(icon, item.label, active)}</span>
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
