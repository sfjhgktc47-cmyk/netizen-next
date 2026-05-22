"use client";

import { useMemo } from "react";

const PRODUCT_COLORS = [
  { name: "Black", hex: "#111827", aliases: ["black", "черный", "чёрный"] },
  { name: "White", hex: "#F8FAFC", aliases: ["white", "белый"] },
  { name: "Silver", hex: "#C0C7D1", aliases: ["silver", "серебро", "серебристый"] },
  { name: "Space Black", hex: "#1F2329", aliases: ["space black", "black space", "spaceblack"] },
  { name: "Space Gray", hex: "#6B7280", aliases: ["space gray", "space grey", "gray", "grey", "серый"] },
  { name: "Natural Titanium", hex: "#C8BBA8", aliases: ["natural titanium", "natural", "titanium", "натуральный титан"] },
  { name: "Blue Titanium", hex: "#4C6173", aliases: ["blue titanium", "titanium blue"] },
  { name: "White Titanium", hex: "#F1EFE7", aliases: ["white titanium", "titanium white"] },
  { name: "Desert Titanium", hex: "#C8A27A", aliases: ["desert titanium", "desert", "sand", "песочный"] },
  { name: "Blue", hex: "#1D4ED8", aliases: ["blue", "синий"] },
  { name: "Deep Blue", hex: "#172554", aliases: ["deep blue", "dark blue", "темно-синий", "тёмно-синий"] },
  { name: "Purple", hex: "#7C3AED", aliases: ["purple", "фиолетовый"] },
  { name: "Pink", hex: "#F472B6", aliases: ["pink", "розовый"] },
  { name: "Red", hex: "#DC2626", aliases: ["red", "красный"] },
  { name: "Orange", hex: "#F97316", aliases: ["orange", "оранжевый"] },
  { name: "Yellow", hex: "#FACC15", aliases: ["yellow", "желтый", "жёлтый"] },
  { name: "Green", hex: "#16A34A", aliases: ["green", "зеленый", "зелёный"] },
  { name: "Midnight", hex: "#111827", aliases: ["midnight", "ночь", "mid night"] },
  { name: "Starlight", hex: "#F5F0E6", aliases: ["starlight", "star light", "сияющая звезда"] },
  { name: "Gold", hex: "#D4AF37", aliases: ["gold", "золото", "золотой"] },
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

function normalizeHex(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return "#111827";
  }

  return trimmed.startsWith("#") ? trimmed : `#${trimmed}`;
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
  inputClassName = "h-12 w-full rounded-xl border border-white/10 bg-black/25 px-4 text-sm text-white outline-none transition-colors placeholder:text-white/30 focus:border-blue-500/60",
}: Props) {
  const normalizedHex = normalizeHex(colorHex);

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

  function handleHexInput(value: string) {
    const nextHex = normalizeHex(value);
    onColorHexChange(nextHex);
  }

  return (
    <div className={`grid gap-3 ${className}`}>
      <div className="grid gap-2">
        <span className="text-sm font-medium text-white/65">Цвет</span>

        <div className="grid gap-3 rounded-2xl border border-white/10 bg-black/20 p-3">
          <div className="grid gap-3 md:grid-cols-[1fr_150px]">
            <div className="relative">
              <input
                value={color}
                onChange={(event) => handleColorInput(event.target.value)}
                placeholder="Например: Black, Silver, Blue"
                className={inputClassName}
              />

              {suggestions.length > 0 && color.trim() && !findColorByText(color) ? (
                <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-20 overflow-hidden rounded-xl border border-white/10 bg-[#0b1220] shadow-2xl shadow-black/40">
                  {suggestions.map((preset) => (
                    <button
                      key={`${preset.name}-${preset.hex}`}
                      type="button"
                      onClick={() => selectColor(preset.name, preset.hex)}
                      className="flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left text-sm text-white/75 transition-colors hover:bg-blue-600/20 hover:text-white"
                    >
                      <span className="inline-flex items-center gap-2">
                        <span
                          className="h-4 w-4 rounded-full border border-white/20"
                          style={{ backgroundColor: preset.hex }}
                          aria-hidden="true"
                        />
                        {preset.name}
                      </span>
                      <span className="text-xs text-white/35">{preset.hex}</span>
                    </button>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="grid grid-cols-[48px_1fr] gap-2">
              <label className="relative flex h-12 cursor-pointer items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] transition-colors hover:bg-white/[0.08]">
                <span
                  className="h-6 w-6 rounded-full border border-white/20 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.12)]"
                  style={{ backgroundColor: normalizedHex }}
                  aria-hidden="true"
                />
                <input
                  type="color"
                  value={normalizedHex}
                  onChange={(event) => {
                    onColorHexChange(event.target.value);
                    const preset = PRODUCT_COLORS.find(
                      (item) => item.hex.toLowerCase() === event.target.value.toLowerCase(),
                    );
                    if (preset) {
                      onColorChange(preset.name);
                    }
                  }}
                  className="absolute inset-0 cursor-pointer opacity-0"
                  aria-label="Выбрать цвет"
                />
              </label>

              <input
                value={colorHex}
                onChange={(event) => handleHexInput(event.target.value)}
                placeholder="#111827"
                className={inputClassName}
              />
            </div>
          </div>

          <p className="text-xs leading-relaxed text-white/40">
            Напиши название цвета, например <span className="text-white/65">black</span> или <span className="text-white/65">blue</span>, и HEX подставится автоматически. Кружок можно использовать для ручного выбора.
          </p>
        </div>
      </div>
    </div>
  );
}
