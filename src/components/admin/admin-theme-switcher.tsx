"use client";

import { useEffect, useState } from "react";

type AdminTheme = "dark" | "light" | "blue" | "compact";

const adminThemes: Array<{ value: AdminTheme; label: string }> = [
  { value: "dark", label: "Тёмная" },
  { value: "light", label: "Светлая" },
  { value: "blue", label: "Синяя" },
  { value: "compact", label: "Компактная" },
];

function isAdminTheme(value: string | null): value is AdminTheme {
  return value === "dark" || value === "light" || value === "blue" || value === "compact";
}

export function AdminThemeSwitcher() {
  const [theme, setTheme] = useState<AdminTheme>("dark");

  useEffect(() => {
    const savedTheme = window.localStorage.getItem("netizen-admin-theme");
    if (isAdminTheme(savedTheme)) {
      setTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    document.documentElement.dataset.adminTheme = theme;
    document.body.dataset.adminTheme = theme;
    window.localStorage.setItem("netizen-admin-theme", theme);
  }, [theme]);

  return (
    <>
      <div className="fixed bottom-4 right-4 z-[90] rounded-2xl border border-white/10 bg-[#020814]/90 p-3 text-white shadow-2xl shadow-black/30 backdrop-blur-xl admin-theme-widget">
        <label className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-white/45">
          Тема админки
        </label>
        <select
          value={theme}
          onChange={(event) => setTheme(event.target.value as AdminTheme)}
          className="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2 text-sm font-semibold text-white outline-none transition-colors hover:border-blue-500/50"
        >
          {adminThemes.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      </div>
      <AdminThemeStyle />
    </>
  );
}

function AdminThemeStyle() {
  return (
    <style jsx global>{`
      .admin-theme-widget option {
        background: #020814;
        color: #ffffff;
      }

      [data-admin-theme="light"] .admin-theme-scope main,
      [data-admin-theme="light"] .admin-theme-scope [class*="bg-[#020814]"] {
        background: #f4f7fb !important;
        color: #101828 !important;
      }

      [data-admin-theme="light"] .admin-theme-scope [class*="bg-white/"],
      [data-admin-theme="light"] .admin-theme-scope [class*="bg-white["],
      [data-admin-theme="light"] .admin-theme-scope [class*="bg-black/"],
      [data-admin-theme="light"] .admin-theme-scope [class*="bg-black["] {
        background: rgba(255, 255, 255, 0.9) !important;
      }

      [data-admin-theme="light"] .admin-theme-scope [class*="border-white/"] {
        border-color: rgba(15, 23, 42, 0.12) !important;
      }

      [data-admin-theme="light"] .admin-theme-scope [class*="text-white"] {
        color: #101828 !important;
      }

      [data-admin-theme="light"] .admin-theme-scope [class*="text-white/"] {
        color: rgba(16, 24, 40, 0.62) !important;
      }

      [data-admin-theme="light"] .admin-theme-scope input,
      [data-admin-theme="light"] .admin-theme-scope select,
      [data-admin-theme="light"] .admin-theme-scope textarea,
      [data-admin-theme="light"] .admin-theme-scope .admin-input,
      [data-admin-theme="light"] .admin-theme-scope .admin-textarea {
        background: #ffffff !important;
        border-color: rgba(15, 23, 42, 0.16) !important;
        color: #101828 !important;
      }

      [data-admin-theme="light"] .admin-theme-scope option {
        background: #ffffff !important;
        color: #101828 !important;
      }

      [data-admin-theme="light"] .admin-theme-scope [class*="bg-blue-"] {
        color: #ffffff !important;
      }

      [data-admin-theme="light"] .admin-theme-scope [class*="bg-red-"],
      [data-admin-theme="light"] .admin-theme-scope [class*="bg-green-"],
      [data-admin-theme="light"] .admin-theme-scope [class*="bg-amber-"] {
        color: inherit;
      }

      [data-admin-theme="light"] .admin-theme-widget {
        background: rgba(255, 255, 255, 0.94) !important;
        border-color: rgba(15, 23, 42, 0.12) !important;
        color: #101828 !important;
      }

      [data-admin-theme="light"] .admin-theme-widget select {
        background: #ffffff !important;
        color: #101828 !important;
        border-color: rgba(15, 23, 42, 0.16) !important;
      }

      [data-admin-theme="blue"] .admin-theme-scope main,
      [data-admin-theme="blue"] .admin-theme-scope [class*="bg-[#020814]"] {
        background: radial-gradient(circle at top left, rgba(37, 99, 235, 0.32), transparent 35%), #020814 !important;
      }

      [data-admin-theme="blue"] .admin-theme-scope [class*="bg-white/"],
      [data-admin-theme="blue"] .admin-theme-scope [class*="bg-black/"] {
        background: rgba(15, 23, 42, 0.68) !important;
      }

      [data-admin-theme="compact"] .admin-theme-scope main {
        background: #030712 !important;
      }

      [data-admin-theme="compact"] .admin-theme-scope [class*="rounded-[34px]"] {
        border-radius: 1.25rem !important;
      }

      [data-admin-theme="compact"] .admin-theme-scope [class*="p-8"] {
        padding: 1.25rem !important;
      }

      [data-admin-theme="compact"] .admin-theme-scope [class*="mt-8"] {
        margin-top: 1rem !important;
      }

      [data-admin-theme="compact"] .admin-theme-scope [class*="gap-8"] {
        gap: 1rem !important;
      }
    `}</style>
  );
}
