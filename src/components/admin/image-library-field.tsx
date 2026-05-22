"use client";

import type { DragEvent } from "react";
import { useRef, useState } from "react";

type Props = {
  value: string[];
  onChange: (value: string[]) => void;
  label?: string;
  hint?: string;
  maxImages?: number;
};

const MAX_IMAGE_SIZE_MB = 2;
const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;

function uniqueImages(images: string[]) {
  return Array.from(new Set(images.filter(Boolean)));
}

export function ImageLibraryField({
  value,
  onChange,
  label = "Фотографии позиции",
  hint = "Перетащите сюда несколько фото или нажмите, чтобы выбрать файлы.",
  maxImages = 12,
}: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState("");
  const [urlValue, setUrlValue] = useState("");

  function applyImages(nextImages: string[]) {
    onChange(uniqueImages(nextImages).slice(0, maxImages));
  }

  function readFiles(files: FileList | File[]) {
    setError("");

    const selectedFiles = Array.from(files).slice(0, Math.max(0, maxImages - value.length));

    if (selectedFiles.length === 0) {
      if (value.length >= maxImages) {
        setError(`Можно добавить максимум ${maxImages} фото.`);
      }
      return;
    }

    selectedFiles.forEach((file) => {
      if (!file.type.startsWith("image/")) {
        setError("Можно загружать только изображения.");
        return;
      }

      if (file.size > MAX_IMAGE_SIZE_BYTES) {
        setError(`Одно фото должно быть до ${MAX_IMAGE_SIZE_MB} МБ.`);
        return;
      }

      const reader = new FileReader();

      reader.onload = () => {
        if (typeof reader.result === "string") {
          applyImages([...value, reader.result]);
        }
      };

      reader.onerror = () => {
        setError("Не удалось прочитать одно из фото.");
      };

      reader.readAsDataURL(file);
    });
  }

  function handleDrop(event: DragEvent<HTMLButtonElement>) {
    event.preventDefault();
    setIsDragging(false);

    if (event.dataTransfer.files?.length) {
      readFiles(event.dataTransfer.files);
    }
  }

  function removeImage(index: number) {
    applyImages(value.filter((_, itemIndex) => itemIndex !== index));
  }

  function makeMain(index: number) {
    const image = value[index];

    if (!image) {
      return;
    }

    applyImages([image, ...value.filter((_, itemIndex) => itemIndex !== index)]);
  }

  function addUrl() {
    const normalized = urlValue.trim();

    if (!normalized) {
      return;
    }

    applyImages([...value, normalized]);
    setUrlValue("");
  }

  return (
    <div className="grid gap-3">
      <div>
        <div className="text-sm font-medium text-white/70">{label}</div>
        <p className="mt-1 text-xs leading-relaxed text-white/40">
          Первое фото будет главным. Остальные будут библиотекой/галереей позиции.
        </p>
      </div>

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`min-h-[150px] rounded-2xl border border-dashed px-4 py-4 text-left transition-colors ${
          isDragging
            ? "border-blue-400 bg-blue-500/15"
            : "border-white/15 bg-black/20 hover:border-blue-500/50 hover:bg-blue-500/10"
        }`}
      >
        <div className="flex min-h-[116px] flex-col items-center justify-center rounded-xl border border-white/5 bg-white/[0.02] text-center">
          <div className="text-sm font-semibold text-white">Перетащите фото позиции</div>
          <p className="mt-2 max-w-[520px] text-sm leading-relaxed text-white/45">{hint}</p>
          <span className="mt-3 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-white/45">
            PNG / JPG / WEBP до {MAX_IMAGE_SIZE_MB} МБ · максимум {maxImages} фото
          </span>
        </div>
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(event) => {
          if (event.target.files?.length) {
            readFiles(event.target.files);
          }

          event.target.value = "";
        }}
      />

      <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
        <input
          value={urlValue}
          onChange={(event) => setUrlValue(event.target.value)}
          placeholder="Или вставьте ссылку на фото"
          className="h-11 w-full rounded-xl border border-white/10 bg-black/25 px-4 text-sm text-white outline-none transition-colors placeholder:text-white/30 focus:border-blue-500/60"
        />
        <button
          type="button"
          onClick={addUrl}
          className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:border-blue-500/40 hover:bg-blue-500/10"
        >
          Добавить ссылку
        </button>
      </div>

      {value.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {value.map((image, index) => (
            <div key={`${image}-${index}`} className="overflow-hidden rounded-2xl border border-white/10 bg-black/20">
              <div
                className="h-36 bg-white/[0.04] bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: `url(${image})` }}
                aria-label={`Фото позиции ${index + 1}`}
              />
              <div className="flex items-center justify-between gap-2 p-3">
                <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs text-white/50">
                  {index === 0 ? "Главное" : `Фото ${index + 1}`}
                </span>
                <div className="flex gap-2">
                  {index > 0 ? (
                    <button
                      type="button"
                      onClick={() => makeMain(index)}
                      className="text-xs text-blue-300 transition-colors hover:text-blue-200"
                    >
                      Главным
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="text-xs text-white/40 transition-colors hover:text-red-300"
                  >
                    Удалить
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {error ? <div className="text-sm text-red-300">{error}</div> : null}
    </div>
  );
}
