"use client";

import type { DragEvent } from "react";
import { useRef, useState } from "react";

type Props = {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  hint?: string;
  recommendedWidth?: number;
  recommendedHeight?: number;
};

const MAX_IMAGE_SIZE_MB = 2;
const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;
const OPTIMIZED_IMAGE_TYPE = "image/webp";
const OPTIMIZED_IMAGE_QUALITY = 0.82;
const FALLBACK_MAX_WIDTH = 1200;
const FALLBACK_MAX_HEIGHT = 1200;

function formatImageRequirements(width?: number, height?: number) {
  const base = `PNG / JPG / WEBP до ${MAX_IMAGE_SIZE_MB} МБ`;

  if (!width || !height) {
    return `${base} · фото будет автоматически сжато`;
  }

  return `${base} · рекомендовано ${width} × ${height} px · авто-сжатие`;
}

function getTargetSize(originalWidth: number, originalHeight: number, maxWidth: number, maxHeight: number) {
  const ratio = Math.min(maxWidth / originalWidth, maxHeight / originalHeight, 1);

  return {
    width: Math.max(1, Math.round(originalWidth * ratio)),
    height: Math.max(1, Math.round(originalHeight * ratio)),
  };
}

async function optimizeImageFile(file: File, maxWidth: number, maxHeight: number) {
  const source = URL.createObjectURL(file);

  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();

      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("Не удалось открыть изображение."));
      img.src = source;
    });

    const { width, height } = getTargetSize(image.naturalWidth, image.naturalHeight, maxWidth, maxHeight);
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    if (!context) {
      throw new Error("Не удалось подготовить изображение.");
    }

    canvas.width = width;
    canvas.height = height;
    context.drawImage(image, 0, 0, width, height);

    return canvas.toDataURL(OPTIMIZED_IMAGE_TYPE, OPTIMIZED_IMAGE_QUALITY);
  } finally {
    URL.revokeObjectURL(source);
  }
}

export function ImageDropZone({
  value,
  onChange,
  label = "Фото товара",
  hint = "Перетащите фото сюда или нажмите, чтобы выбрать файл.",
  recommendedWidth,
  recommendedHeight,
}: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState("");

  async function readFile(file: File) {
    setError("");

    if (!file.type.startsWith("image/")) {
      setError("Можно загрузить только изображение.");
      return;
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      setError(`Фото слишком большое. Загрузите файл до ${MAX_IMAGE_SIZE_MB} МБ.`);
      return;
    }

    try {
      const optimizedImage = await optimizeImageFile(
        file,
        recommendedWidth ?? FALLBACK_MAX_WIDTH,
        recommendedHeight ?? FALLBACK_MAX_HEIGHT,
      );

      onChange(optimizedImage);
    } catch {
      setError("Не удалось сжать изображение. Попробуйте другой файл.");
    }
  }

  function handleDrop(event: DragEvent<HTMLButtonElement>) {
    event.preventDefault();
    setIsDragging(false);

    const file = event.dataTransfer.files?.[0];

    if (file) {
      readFile(file);
    }
  }

  const requirementsText = formatImageRequirements(recommendedWidth, recommendedHeight);

  return (
    <div className="grid gap-2">
      <div className="text-sm font-medium text-white/70">{label}</div>

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`group min-h-[168px] rounded-2xl border border-dashed px-4 py-4 text-left transition-colors ${
          isDragging
            ? "border-blue-400 bg-blue-500/15"
            : "border-white/15 bg-black/20 hover:border-blue-500/50 hover:bg-blue-500/10"
        }`}
      >
        {value ? (
          <div className="grid gap-4 sm:grid-cols-[150px_1fr] sm:items-center">
            <div
              className="h-32 rounded-2xl border border-white/10 bg-contain bg-center bg-no-repeat"
              style={{ backgroundImage: `url(${value})` }}
              aria-label="Превью фото товара"
            />

            <div>
              <div className="text-sm font-semibold text-white">Фото загружено</div>
              <p className="mt-2 text-sm leading-relaxed text-white/50">
                Можно перетащить другое фото поверх этого блока или нажать сюда, чтобы выбрать новый файл.
              </p>

              <span className="mt-3 inline-flex rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs text-blue-300">
                {requirementsText}
              </span>
            </div>
          </div>
        ) : (
          <div className="flex min-h-[136px] flex-col items-center justify-center rounded-xl border border-white/5 bg-white/[0.02] text-center">
            <div className="text-sm font-semibold text-white">Перетащите фото товара</div>
            <p className="mt-2 max-w-[420px] text-sm leading-relaxed text-white/45">{hint}</p>
            <span className="mt-3 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-white/45">
              {requirementsText}
            </span>
          </div>
        )}
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];

          if (file) {
            readFile(file);
          }

          event.target.value = "";
        }}
      />

      <div className="flex flex-wrap items-center gap-3">
        {value ? (
          <button
            type="button"
            onClick={() => onChange("")}
            className="text-sm text-white/45 transition-colors hover:text-red-300"
          >
            Удалить фото
          </button>
        ) : null}

        {error ? <span className="text-sm text-red-300">{error}</span> : null}
      </div>
    </div>
  );
}
