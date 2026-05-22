"use client";

import type { FormEvent, ReactNode } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ColorPickerField } from "@/components/admin/color-picker-field";

type VariantForEdit = {
  id: string;
  sku: string;
  slug: string;
  title: string;
  memory: string;
  color: string;
  colorHex: string;
  sim: string;
  price: number;
  oldPrice: number | null;
  stock: number;
  status: string;
};

type Props = {
  productId: string;
  variant: VariantForEdit;
};

const inputClass =
  "h-11 w-full rounded-xl border border-white/10 bg-black/25 px-3 text-sm text-white outline-none transition-colors placeholder:text-white/30 focus:border-blue-500/60";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/ё/g, "e")
    .replace(/й/g, "i")
    .replace(/[^a-z0-9а-я]+/gi, "-")
    .replace(/^-+|-+$/g, "");
}

function makeSku(value: string) {
  return value
    .trim()
    .toUpperCase()
    .replace(/[^A-ZА-Я0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function ProductVariantEditForm({ productId, variant }: Props) {
  const router = useRouter();

  const [sku, setSku] = useState(variant.sku);
  const [slug, setSlug] = useState(variant.slug);
  const [title, setTitle] = useState(variant.title);
  const [memory, setMemory] = useState(variant.memory);
  const [color, setColor] = useState(variant.color);
  const [colorHex, setColorHex] = useState(variant.colorHex);
  const [sim, setSim] = useState(variant.sim);
  const [price, setPrice] = useState(String(variant.price));
  const [oldPrice, setOldPrice] = useState(variant.oldPrice ? String(variant.oldPrice) : "");
  const [stock, setStock] = useState(String(variant.stock));
  const [status, setStatus] = useState(variant.status);

  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      if (!sku || !slug || !title || !price) {
        throw new Error("Укажите SKU, slug, название и цену.");
      }

      const response = await fetch(`/api/admin/products/${productId}/variants/${variant.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sku,
          slug,
          title,
          memory,
          color,
          colorHex,
          sim,
          price: Number(price),
          oldPrice: oldPrice ? Number(oldPrice) : null,
          stock: Number(stock),
          status,
        }),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.error ?? "Не удалось сохранить позицию.");
      }

      setSuccess("Позиция сохранена.");
      router.refresh();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Неизвестная ошибка.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    const confirmed = window.confirm(`Удалить позицию ${variant.sku}?`);

    if (!confirmed) {
      return;
    }

    setError("");
    setSuccess("");
    setDeleting(true);

    try {
      const response = await fetch(`/api/admin/products/${productId}/variants/${variant.id}`, {
        method: "DELETE",
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.error ?? "Не удалось удалить позицию.");
      }

      router.refresh();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Неизвестная ошибка.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-[24px] border border-white/10 bg-black/20 p-4 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-400">
            Редактирование SKU
          </div>
          <h4 className="mt-1 text-xl font-bold tracking-[-0.03em] text-white">
            {variant.sku}
          </h4>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="submit"
            disabled={loading || deleting}
            className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Сохраняю..." : "Сохранить"}
          </button>

          <button
            type="button"
            onClick={handleDelete}
            disabled={loading || deleting}
            className="rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-2.5 text-sm font-semibold text-red-200 transition-colors hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {deleting ? "Удаляю..." : "Удалить"}
          </button>
        </div>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        <Field label="SKU">
          <input value={sku} onChange={(event) => setSku(makeSku(event.target.value))} className={inputClass} />
        </Field>

        <Field label="Slug">
          <input value={slug} onChange={(event) => setSlug(slugify(event.target.value))} className={inputClass} />
        </Field>

        <Field label="Название">
          <input value={title} onChange={(event) => setTitle(event.target.value)} className={inputClass} />
        </Field>

        <Field label="Память">
          <input value={memory} onChange={(event) => setMemory(event.target.value)} className={inputClass} />
        </Field>

        <div className="md:col-span-2 xl:col-span-5">
          <ColorPickerField
            color={color}
            colorHex={colorHex}
            onColorChange={setColor}
            onColorHexChange={setColorHex}
            inputClassName={inputClass}
          />
        </div>

        <Field label="SIM">
          <input value={sim} onChange={(event) => setSim(event.target.value)} className={inputClass} />
        </Field>

        <Field label="Цена">
          <input value={price} onChange={(event) => setPrice(event.target.value.replace(/[^0-9]/g, ""))} inputMode="numeric" className={inputClass} />
        </Field>

        <Field label="Старая цена">
          <input value={oldPrice} onChange={(event) => setOldPrice(event.target.value.replace(/[^0-9]/g, ""))} inputMode="numeric" className={inputClass} />
        </Field>

        <Field label="Остаток">
          <input value={stock} onChange={(event) => setStock(event.target.value.replace(/[^0-9]/g, ""))} inputMode="numeric" className={inputClass} />
        </Field>

        <Field label="Статус">
          <select value={status} onChange={(event) => setStatus(event.target.value)} className={inputClass}>
            <option value="active">Активна</option>
            <option value="draft">Черновик</option>
            <option value="hidden">Скрыта</option>
            <option value="out_of_stock">Нет в наличии</option>
          </select>
        </Field>
      </div>

      {error ? (
        <div className="mt-4 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      ) : null}

      {success ? (
        <div className="mt-4 rounded-2xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-200">
          {success}
        </div>
      ) : null}
    </form>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="grid gap-2 text-sm font-medium text-white/60">
      <span>{label}</span>
      {children}
    </label>
  );
}
