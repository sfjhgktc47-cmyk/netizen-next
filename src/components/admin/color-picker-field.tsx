"use client";

const PRODUCT_COLORS = [
  { name: "Black", hex: "#111827" },
  { name: "White", hex: "#F8FAFC" },
  { name: "Silver", hex: "#C0C7D1" },
  { name: "Space Black", hex: "#1F2329" },
  { name: "Space Gray", hex: "#6B7280" },
  { name: "Natural Titanium", hex: "#C8BBA8" },
  { name: "Blue Titanium", hex: "#4C6173" },
  { name: "White Titanium", hex: "#F1EFE7" },
  { name: "Desert Titanium", hex: "#C8A27A" },
  { name: "Blue", hex: "#1D4ED8" },
  { name: "Deep Blue", hex: "#172554" },
  { name: "Purple", hex: "#7C3AED" },
  { name: "Pink", hex: "#F472B6" },
  { name: "Red", hex: "#DC2626" },
  { name: "Orange", hex: "#F97316" },
  { name: "Yellow", hex: "#FACC15" },
  { name: "Green", hex: "#16A34A" },
  { name: "Midnight", hex: "#111827" },
  { name: "Starlight", hex: "#F5F0E6" },
  { name: "Gold", hex: "#D4AF37" },
] as const;

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

export function ColorPickerField({
  color,
  colorHex,
  onColorChange,
  onColorHexChange,
  className = "",
  inputClassName = "h-12 w-full rounded-xl border border-white/10 bg-black/25 px-4 text-sm text-white outline-none transition-colors placeholder:text-white/30 focus:border-blue-500/60",
}: Props) {
  const normalizedHex = normalizeHex(colorHex);

  function selectColor(nextColor: string, nextHex: string) {
    onColorChange(nextColor);
    onColorHexChange(nextHex);
  }

  return (
    <div className={`grid gap-4 ${className}`}>
      <div className="grid gap-2">
        <span className="text-sm font-medium text-white/65">Цвет</span>

        <div className="grid gap-3 rounded-2xl border border-white/10 bg-black/20 p-3">
          <div className="flex items-center gap-3">
            <div
              className="h-11 w-11 shrink-0 rounded-full border border-white/15 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.12)]"
              style={{ backgroundColor: normalizedHex }}
              aria-hidden="true"
            />

            <div className="min-w-0 flex-1">
              <input
                value={color}
                onChange={(event) => onColorChange(event.target.value)}
                placeholder="Black"
                className={inputClassName}
              />
            </div>
          </div>

          <div className="grid gap-2 sm:grid-cols-[1fr_130px]">
            <input
              value={colorHex}
              onChange={(event) => onColorHexChange(normalizeHex(event.target.value))}
              placeholder="#111827"
              className={inputClassName}
            />

            <label className="flex h-12 cursor-pointer items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 text-sm font-semibold text-white transition-colors hover:bg-white/[0.08]">
              Палитра
              <input
                type="color"
                value={normalizedHex}
                onChange={(event) => onColorHexChange(event.target.value)}
                className="h-7 w-8 cursor-pointer rounded border-0 bg-transparent p-0"
                aria-label="Выбрать цвет"
              />
            </label>
          </div>
        </div>
      </div>

      <div className="grid gap-2">
        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-white/35">Готовые цвета</span>

        <div className="flex flex-wrap gap-2">
          {PRODUCT_COLORS.map((preset) => {
            const isActive = color === preset.name || normalizedHex.toLowerCase() === preset.hex.toLowerCase();

            return (
              <button
                key={`${preset.name}-${preset.hex}`}
                type="button"
                onClick={() => selectColor(preset.name, preset.hex)}
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold transition-colors ${
                  isActive
                    ? "border-blue-500/70 bg-blue-600/20 text-blue-100"
                    : "border-white/10 bg-white/[0.035] text-white/65 hover:border-blue-500/45 hover:text-white"
                }`}
              >
                <span
                  className="h-4 w-4 rounded-full border border-white/20"
                  style={{ backgroundColor: preset.hex }}
                  aria-hidden="true"
                />
                {preset.name}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
