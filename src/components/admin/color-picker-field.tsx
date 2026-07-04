"use client";

import { useEffect, useMemo, useState } from "react";

type ColorPreset = {
  name: string;
  hex: string;
};

const DEFAULT_COLORS: ColorPreset[] = [
  { name: "Black", hex: "#111827" },
  { name: "White", hex: "#F8FAFC" },
  { name: "Silver", hex: "#C0C7D1" },
  { name: "Blue", hex: "#49A6AB" },
  { name: "Deep Blue", hex: "#172554" },
  { name: "Purple", hex: "#7C3AED" },
  { name: "Pink", hex: "#F472B6" },
  { name: "Red", hex: "#DC2626" },
  { name: "Green", hex: "#16A34A" },
  { name: "Gold", hex: "#D4AF37" },
  { name: "Natural Titanium", hex: "#C8BBA8" },
];

type Props = {
  color: string;
  colorHex: string;
  onColorChange: (value: string) => void;
  onColorHexChange: (value: string) => void;
  className?: string;
};

type EyeDropperConstructor = new () => {
  open: () => Promise<{ sRGBHex: string }>;
};

declare global {
  interface Window {
    EyeDropper?: EyeDropperConstructor;
  }
}

function key(value: string) {
  return value.trim().toLowerCase();
}

function normalizeHex(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return "";
  }

  if (/^#[0-9a-f]{6}$/i.test(trimmed)) {
    return trimmed;
  }

  if (/^[0-9a-f]{6}$/i.test(trimmed)) {
    return `#${trimmed}`;
  }

  return trimmed.startsWith("#") ? trimmed : `#${trimmed}`;
}

function validHex(value: string) {
  return /^#[0-9a-f]{6}$/i.test(normalizeHex(value));
}

function pickerHex(value: string) {
  const hex = normalizeHex(value);
  return /^#[0-9a-f]{6}$/i.test(hex) ? hex : "#111827";
}

function mergePresets(...groups: ColorPreset[][]) {
  const map = new Map<string, ColorPreset>();

  for (const group of groups) {
    for (const item of group) {
      const name = item.name.trim();
      const hex = normalizeHex(item.hex);

      if (!name || !validHex(hex)) {
        continue;
      }

      const normalizedKey = key(name);

      if (!map.has(normalizedKey)) {
        map.set(normalizedKey, { name, hex });
      }
    }
  }

  return Array.from(map.values());
}

function readLocalPresets() {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem("neontech-color-presets");
    const parsed = raw ? JSON.parse(raw) : [];

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((item): item is ColorPreset => {
      return typeof item?.name === "string" && typeof item?.hex === "string";
    });
  } catch {
    return [];
  }
}

function writeLocalPreset(name: string, hex: string) {
  if (typeof window === "undefined") {
    return;
  }

  const cleanName = name.trim();
  const cleanHex = normalizeHex(hex);

  if (!cleanName || !validHex(cleanHex)) {
    return;
  }

  const current = readLocalPresets();
  const next = mergePresets([{ name: cleanName, hex: cleanHex }], current).slice(0, 80);

  window.localStorage.setItem("neontech-color-presets", JSON.stringify(next));
}

export function ColorPickerField({
  color,
  colorHex,
  onColorChange,
  onColorHexChange,
  className = "",
}: Props) {
  const [dbPresets, setDbPresets] = useState<ColorPreset[]>([]);
  const [localPresets, setLocalPresets] = useState<ColorPreset[]>([]);
  const [picking, setPicking] = useState(false);

  useEffect(() => {
    setLocalPresets(readLocalPresets());

    fetch("/api/admin/color-presets", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((payload) => {
        if (Array.isArray(payload?.colors)) {
          setDbPresets(payload.colors);
        }
      })
      .catch(() => {});
  }, []);

  const presets = useMemo(
    () => mergePresets(dbPresets, localPresets, DEFAULT_COLORS),
    [dbPresets, localPresets],
  );

  const exactPreset = useMemo(() => {
    return presets.find((preset) => key(preset.name) === key(color));
  }, [color, presets]);

  const suggestions = useMemo(() => {
    const query = key(color);

    if (!query || exactPreset) {
      return [];
    }

    return presets.filter((preset) => key(preset.name).includes(query)).slice(0, 6);
  }, [color, exactPreset, presets]);

  function saveCurrentPreset() {
    if (!color.trim() || !validHex(colorHex)) {
      return;
    }

    writeLocalPreset(color, colorHex);
    setLocalPresets(readLocalPresets());
  }

  function selectPreset(preset: ColorPreset) {
    onColorChange(preset.name);
    onColorHexChange(preset.hex);
    writeLocalPreset(preset.name, preset.hex);
    setLocalPresets(readLocalPresets());
  }

  function handleColorName(value: string) {
    onColorChange(value);

    const preset = presets.find((item) => key(item.name) === key(value));

    if (preset) {
      onColorHexChange(preset.hex);
    }
  }

  async function pickFromScreen() {
    if (typeof window === "undefined" || !window.EyeDropper) {
      alert("Пипетка недоступна в этом браузере. Можно выбрать цвет через кружок или HEX.");
      return;
    }

    try {
      setPicking(true);
      const eyeDropper = new window.EyeDropper();
      const result = await eyeDropper.open();

      onColorHexChange(normalizeHex(result.sRGBHex));
    } catch {
      // пользователь отменил выбор
    } finally {
      setPicking(false);
    }
  }

  return (
    <div className={`min-w-0 ${className}`}>
      <div className="mb-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-white/35">
        Цвет
      </div>

      <div className="grid max-w-[560px] grid-cols-[minmax(160px,1fr)_112px_40px_88px] gap-2">
        <div className="relative min-w-0">
          <input
            value={color}
            onChange={(event) => handleColorName(event.target.value)}
            onBlur={saveCurrentPreset}
            placeholder="Sage"
            className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-blue-500/70 dark:border-white/10 dark:bg-black/25 dark:text-white dark:placeholder:text-white/30"
          />

          {suggestions.length > 0 ? (
            <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-30 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl dark:border-white/10 dark:bg-[#0b1220]">
              {suggestions.map((preset) => (
                <button
                  key={`${preset.name}-${preset.hex}`}
                  type="button"
                  onClick={() => selectPreset(preset)}
                  className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm text-slate-700 transition-colors hover:bg-blue-600/10 hover:text-blue-600 dark:text-white/75 dark:hover:bg-blue-600/20 dark:hover:text-white"
                >
                  <span className="inline-flex min-w-0 items-center gap-2">
                    <span
                      className="h-4 w-4 shrink-0 rounded-full border border-slate-200 dark:border-white/20"
                      style={{ backgroundColor: pickerHex(preset.hex) }}
                      aria-hidden="true"
                    />
                    <span className="truncate">{preset.name}</span>
                  </span>

                  <span className="shrink-0 text-xs text-slate-400 dark:text-white/35">
                    {preset.hex}
                  </span>
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <input
          value={colorHex}
          onChange={(event) => onColorHexChange(event.target.value)}
          onBlur={() => {
            onColorHexChange(normalizeHex(colorHex));
            saveCurrentPreset();
          }}
          placeholder="#359614"
          className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-blue-500/70 dark:border-white/10 dark:bg-black/25 dark:text-white dark:placeholder:text-white/30"
        />

        <label className="relative flex h-10 cursor-pointer items-center justify-center rounded-xl border border-slate-200 bg-white transition-colors hover:bg-slate-50 dark:border-white/10 dark:bg-white/[0.04] dark:hover:bg-white/[0.08]">
          <span
            className="h-5 w-5 rounded-full border border-slate-300 dark:border-white/20"
            style={{ backgroundColor: pickerHex(colorHex) }}
            aria-hidden="true"
          />

          <input
            type="color"
            value={pickerHex(colorHex)}
            onChange={(event) => {
              onColorHexChange(event.target.value);
              writeLocalPreset(color, event.target.value);
              setLocalPresets(readLocalPresets());
            }}
            className="absolute inset-0 cursor-pointer opacity-0"
            aria-label="Выбрать цвет"
          />
        </label>

        <button
          type="button"
          onClick={pickFromScreen}
          disabled={picking}
          className="h-10 rounded-xl border border-blue-500/35 bg-blue-500/10 px-2 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60 dark:text-blue-300"
        >
          {picking ? "..." : "Пипетка"}
        </button>
      </div>
    </div>
  );
}
