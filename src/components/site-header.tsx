"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useTheme } from "@/components/theme-provider";

export function SiteHeader() {
  const { dark, toggleTheme } = useTheme();
  const [cartCount, setCartCount] = useState(0);

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

        <Link
  href="/profile"
  className="rounded-xl border border-theme bg-transparent px-5 py-3 text-sm font-medium transition-colors hover:border-blue-500/40 hover:bg-blue-soft"
>
  Войти
</Link>
      </div>
    </header>
  );
}