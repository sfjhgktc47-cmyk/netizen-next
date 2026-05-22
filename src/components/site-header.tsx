"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useTheme } from "@/components/theme-provider";

export function SiteHeader() {
  const { dark, toggleTheme } = useTheme();
  const [cartCount, setCartCount] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const updateCartCount = () => {
      const count = Number(localStorage.getItem("netizen-cart-count") || "0");
      setCartCount(count);
    };

    updateCartCount();

    window.addEventListener("storage", updateCartCount);
    window.addEventListener("netizen-cart-updated", updateCartCount);

    return () => {
      window.removeEventListener("storage", updateCartCount);
      window.removeEventListener("netizen-cart-updated", updateCartCount);
    };
  }, []);

  const navItems = [
    { label: "Каталог", href: "/catalog" },
    { label: "Новинки", href: "/new" },
    { label: "FAQ", href: "/faq" },
    { label: "Поддержка", href: "/help" },
  ];

  const headerThemeClass = dark
    ? "border-white/10 bg-white/[0.035] shadow-[0_20px_80px_rgba(0,60,255,0.08)]"
    : "border-black/10 bg-white shadow-[0_20px_80px_rgba(15,23,42,0.08)]";

  const iconButtonClass = dark
    ? "border-white/10 bg-white/[0.03] text-white hover:border-blue-500/40 hover:bg-blue-500/10"
    : "border-black/10 bg-white text-[#07111f] hover:border-blue-500/40 hover:bg-blue-50";

  return (
    <>
      <header
        className={`hidden h-[76px] items-center justify-between rounded-2xl border px-8 transition-all duration-700 lg:flex ${headerThemeClass}`}
      >
        <Link
          href="/"
          className="relative flex h-12 w-[150px] items-center justify-start overflow-hidden"
        >
          <Image
            src={dark ? "/logo-light.png" : "/logo-dark.png"}
            alt="Нетизен"
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
              dark ? "border-white/10 bg-blue-600/15" : "border-black/10 bg-blue-50"
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
            className={`relative flex h-11 w-11 items-center justify-center rounded-xl border transition-all duration-300 ${iconButtonClass}`}
          >
            🛒

            {cartCount > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[11px] font-bold text-white shadow-lg shadow-red-500/30">
                {cartCount}
              </span>
            )}
          </Link>

          <Link
            href="/profile"
            className="rounded-xl border border-theme bg-transparent px-5 py-3 text-sm font-medium transition-colors hover:border-blue-500/40 hover:bg-blue-soft"
          >
            Войти
          </Link>
        </div>
      </header>

      <header
        className={`relative z-40 rounded-2xl border px-3 py-3 transition-all duration-700 sm:px-4 lg:hidden ${headerThemeClass}`}
      >
        <div className="flex min-h-14 items-center justify-between gap-2">
          <Link
            href="/"
            onClick={() => setIsMenuOpen(false)}
            className="relative flex h-11 w-[112px] shrink-0 items-center justify-start overflow-hidden sm:w-[140px]"
          >
            <Image
              src={dark ? "/logo-light.png" : "/logo-dark.png"}
              alt="Нетизен"
              width={150}
              height={48}
              priority
              className="h-auto max-h-8 w-auto object-contain transition-opacity duration-700"
            />
          </Link>

          <div className="flex min-w-0 items-center justify-end gap-2 sm:gap-3">
            <button
              type="button"
              onClick={toggleTheme}
              aria-label="Переключить тему"
              className={`relative h-10 w-12 shrink-0 rounded-xl border transition-all duration-700 sm:h-11 sm:w-16 ${
                dark ? "border-white/10 bg-blue-600/15" : "border-black/10 bg-blue-50"
              }`}
            >
              <span
                className={`absolute top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg bg-blue-600 text-sm text-white transition-all duration-500 ease-in-out ${
                  dark ? "left-3 sm:left-7" : "left-1"
                }`}
              >
                {dark ? "☾" : "☀"}
              </span>
            </button>

            <Link
              href="/cart"
              aria-label="Корзина"
              className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border text-sm transition-all duration-300 sm:h-11 sm:w-11 ${iconButtonClass}`}
            >
              🛒
              {cartCount > 0 && (
                <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[11px] font-bold text-white shadow-lg shadow-red-500/30">
                  {cartCount}
                </span>
              )}
            </Link>

            <Link
              href="/profile"
              className="hidden rounded-xl border border-theme bg-transparent px-5 py-3 text-sm font-medium transition-colors hover:border-blue-500/40 hover:bg-blue-soft sm:inline-flex"
            >
              Войти
            </Link>

            <button
              type="button"
              onClick={() => setIsMenuOpen((value) => !value)}
              aria-label="Открыть меню"
              aria-expanded={isMenuOpen}
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border text-lg transition-all duration-300 ${iconButtonClass}`}
            >
              {isMenuOpen ? "×" : "☰"}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="mt-3 grid gap-3 rounded-2xl border border-theme bg-[var(--card)] p-3 shadow-[0_24px_80px_rgba(15,23,42,0.14)]">
            <div className="flex h-11 items-center rounded-xl border border-theme bg-blue-soft px-4 text-sm text-muted">
              Поиск по каталогу
            </div>

            <nav className="grid gap-2 sm:grid-cols-2">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="rounded-xl border border-theme px-4 py-3 text-sm font-semibold transition-colors hover:border-blue-500/40 hover:bg-blue-soft"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <Link
              href="/profile"
              onClick={() => setIsMenuOpen(false)}
              className="rounded-xl bg-blue-600 px-4 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-blue-500 sm:hidden"
            >
              Войти в профиль
            </Link>
          </div>
        )}
      </header>
    </>
  );
}
