"use client";

import { useMemo, useState } from "react";

const PRODUCT_COLORS = [
  { name: "Black", hex: "#111827", aliases: ["black", "черный", "чёрный"] },
  { name: "White", hex: "#F8FAFC", aliases: ["white", "белый"] },
  { name: "Silver", hex: "#C0C7D1", aliases: ["silver", "серебро", "серебристый"] },
  { name: "Space Gray", hex: "#6B7280", aliases: ["space gray", "space grey", "gray", "grey", "серый"] },
  { name: "Blue", hex: "#1D4ED8", aliases: ["blue", "синий", "голубой"] },
  { name: "Deep Blue", hex: "#172554", aliases: ["deep blue", "dark blue", "темно-синий", "тёмно-синий"] },
  { name: "Purple", hex: "#7C3AED", aliases: ["purple", "фиолетовый"] },
  { name: "Pink", hex: "#F472B6", aliases: ["pink", "розовый"] },
  { name: "Red", hex: "#DC2626", aliases: ["red", "красный"] },
  { name: "Green", hex: "#16A34A", aliases: ["green", "зеленый", "зелёный"] },
  { name: "Gold", hex: "#D4AF37", aliases: ["gold", "золотой"] },
  { name: "Natural Titanium", hex: "#C8BBA8", aliases: ["natural titanium", "titanium", "натуральный титан"] },
] as const;

type ProductColor = (typeof PRODUCT_COLORS)[number];

type Props = {
  color: string;
  colorHex: string;
  onColorChange: (value: string) => void;
  onColorHexChange: (value: string) => void;
  className?: string;
  inputClassName?: string;
};

type EyeDropperConstructor = new () => {
  open: () => Promise<{ sRGBHex: string }>;
};

declare global {
  interface Window {
    EyeDropper?: EyeDropperConstructor;
  }
}

function normalizeHex(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return "#111827";
  }

  if (/^#[0-9a-f]{6}$/i.test(trimmed)) {
    return trimmed;
  }

  if (/^[0-9a-f]{6}$/i.test(trimmed)) {
    return `#${trimmed}`;
  }

  return trimmed.startsWith("#") ? trimmed : `#${trimmed}`;
}

function safePickerHex(value: string) {
  const normalized = normalizeHex(value);
  return /^#[0-9a-f]{6}$/i.test(normalized) ? normalized : "#111827";
}

function findColorByText(value: string): ProductColor | undefined {
  const normalized = value.trim().toLowerCase();

  if (!normalized) {
    return undefined;
  }

  return PRODUCT_COLORS.find((preset) => {
    const names = [preset.name.toLowerCase(), ...preset.aliases];
    return names.some((name) => name === normalized);
  });
}

function colorMatchesQuery(preset: ProductColor, query: string) {
  const normalized = query.trim().toLowerCase();

  if (!normalized) {
    return false;
  }

  const names = [preset.name.toLowerCase(), ...preset.aliases];
  return names.some((name) => name.includes(normalized));
}

export function ColorPickerField({
  color,
  colorHex,
  onColorChange,
  onColorHexChange,
  className = "",
}: Props) {
  const [picking, setPicking] = useState(false);
  const pickerHex = safePickerHex(colorHex);
  const compactInput =
    "h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-blue-500/70 dark:border-white/10 dark:bg-black/25 dark:text-white dark:placeholder:text-white/30";

  const suggestions = useMemo(() => {
    const matches = PRODUCT_COLORS.filter((preset) => colorMatchesQuery(preset, color));
    return matches.slice(0, 5);
  }, [color]);

  function selectColor(nextColor: string, nextHex: string) {
    onColorChange(nextColor);
    onColorHexChange(nextHex);
  }

  function handleColorInput(value: string) {
    const preset = findColorByText(value);

    if (preset) {
      selectColor(preset.name, preset.hex);
      return;
    }

    onColorChange(value);
  }

  async function pickColorFromScreen() {
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
      // выбор отменён
    } finally {
      setPicking(false);
    }
  }

  return (
    <div className={`max-w-[720px] ${className}`}>
      <div className="mb-1.5 text-sm font-medium text-slate-600 dark:text-white/65">Цвет</div>

      <div className="grid gap-2 md:grid-cols-[minmax(220px,1fr)_120px_42px_94px]">
        <div className="relative">
          <input
            value={color}
            onChange={(event) => handleColorInput(event.target.value)}
            placeholder="Blue"
            className={compactInput}
          />

          {suggestions.length > 0 && color.trim() && !findColorByText(color) ? (
            <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-20 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl dark:border-white/10 dark:bg-[#0b1220]">
              {suggestions.map((preset) => (
                <button
                  key={`${preset.name}-${preset.hex}`}
                  type="button"
                  onClick={() => selectColor(preset.name, preset.hex)}
                  className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm text-slate-700 transition-colors hover:bg-blue-600/10 hover:text-blue-600 dark:text-white/75 dark:hover:bg-blue-600/20 dark:hover:text-white"
                >
                  <span className="inline-flex items-center gap-2">
                    <span
                      className="h-4 w-4 rounded-full border border-slate-200 dark:border-white/20"
                      style={{ backgroundColor: preset.hex }}
                      aria-hidden="true"
                    />
                    {preset.name}
                  </span>
                  <span className="text-xs text-slate-400 dark:text-white/35">{preset.hex}</span>
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <input
          value={colorHex}
          onChange={(event) => onColorHexChange(normalizeHex(event.target.value))}
          placeholder="#49a6ab"
          className={compactInput}
        />

        <label className="relative flex h-10 cursor-pointer items-center justify-center rounded-xl border border-slate-200 bg-white transition-colors hover:bg-slate-50 dark:border-white/10 dark:bg-white/[0.04] dark:hover:bg-white/[0.08]">
          <span
            className="h-5 w-5 rounded-full border border-slate-300 dark:border-white/20"
            style={{ backgroundColor: pickerHex }}
            aria-hidden="true"
          />
          <input
            type="color"
            value={pickerHex}
            onChange={(event) => onColorHexChange(event.target.value)}
            className="absolute inset-0 cursor-pointer opacity-0"
            aria-label="Выбрать цвет"
          />
        </label>

        <button
          type="button"
          onClick={pickColorFromScreen}
          disabled={picking}
          className="h-10 rounded-xl border border-blue-500/35 bg-blue-500/10 px-3 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60 dark:text-blue-300"
        >
          {picking ? "..." : "Пипетка"}
        </button>
      </div>
    </div>
  );
}
