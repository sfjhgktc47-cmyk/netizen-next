"use client";

import type { FormEvent, ReactNode } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { ColorPickerField } from "@/components/admin/color-picker-field";
import { ImageLibraryField } from "@/components/admin/image-library-field";

type VariantStatus = "active" | "draft" | "hidden" | "out_of_stock";

type Variant = {
  id: string;
  sku: string;
  slug: string;
  title: string;
  memory: string;
  color: string;
  colorHex: string;
  sim: string;
  images?: string[];
  price: number;
  oldPrice: number | null;
  stock: number;
  status: VariantStatus | string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  relatedProductIds?: string[];
};

type RelatedProductOption = {
  id: string;
  slug: string;
  name: string;
  brand: string;
  image: string;
};

type Props = {
  productId: string;
  variant: Variant;
  relatedProductOptions?: RelatedProductOption[];
};

const inputClass =
  "h-12 w-full rounded-xl border border-white/10 bg-black/25 px-4 text-sm text-white outline-none transition-colors placeholder:text-white/30 focus:border-blue-500/60";

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

function onlyDigits(value: string) {
  return value.replace(/[^0-9]/g, "");
}

export function ProductVariantEditForm({ productId, variant, relatedProductOptions = [] }: Props) {
  const router = useRouter();

  const [sku, setSku] = useState(variant.sku);
  const [slug, setSlug] = useState(variant.slug);
  const [title, setTitle] = useState(variant.title);
  const [memory, setMemory] = useState(variant.memory);
  const [color, setColor] = useState(variant.color);
  const [colorHex, setColorHex] = useState(variant.colorHex);
  const [sim, setSim] = useState(variant.sim);
  const [images, setImages] = useState<string[]>(Array.isArray(variant.images) ? variant.images : []);
  const [price, setPrice] = useState(String(variant.price));
  const [oldPrice, setOldPrice] = useState(variant.oldPrice ? String(variant.oldPrice) : "");
  const [stock, setStock] = useState(String(variant.stock));
  const [status, setStatus] = useState(String(variant.status || "active"));
  const [seoTitle, setSeoTitle] = useState(variant.seoTitle ?? "");
  const [seoDescription, setSeoDescription] = useState(variant.seoDescription ?? "");
  const [seoKeywords, setSeoKeywords] = useState(variant.seoKeywords ?? "");
  const [relatedProductIds, setRelatedProductIds] = useState<string[]>(
    Array.isArray(variant.relatedProductIds) ? variant.relatedProductIds : [],
  );

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
        throw new Error("Укажите SKU, slug, название позиции и цену.");
      }

      const response = await fetch(`/api/admin/products/${productId}/variants/${variant.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sku: makeSku(sku),
          slug: slugify(slug),
          title: title.trim(),
          memory: memory.trim(),
          color: color.trim(),
          colorHex: colorHex.trim(),
          sim: sim.trim(),
          images,
          price: Number(price),
          oldPrice: oldPrice ? Number(oldPrice) : null,
          stock: stock ? Number(stock) : 0,
          status,
          seoTitle: seoTitle.trim(),
          seoDescription: seoDescription.trim(),
          seoKeywords: seoKeywords.trim(),
          relatedProductIds,
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
    const confirmed = window.confirm("Удалить эту SKU-позицию? Действие нельзя отменить.");

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

      router.push("/nz-console/positions");
      router.refresh();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Неизвестная ошибка.");
    } finally {
      setDeleting(false);
    }
  }

  function toggleRelatedProduct(productId: string) {
    setRelatedProductIds((current) =>
      current.includes(productId)
        ? current.filter((id) => id !== productId)
        : [...current, productId].slice(0, 8),
    );
  }

  function moveRelatedProduct(productId: string, direction: "up" | "down") {
    setRelatedProductIds((current) => {
      const index = current.indexOf(productId);

      if (index < 0) return current;

      const nextIndex = direction === "up" ? index - 1 : index + 1;

      if (nextIndex < 0 || nextIndex >= current.length) return current;

      const next = [...current];
      [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
      return next;
    });
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-[28px] border border-white/10 bg-white/[0.035] p-5 pb-28 sm:p-6 sm:pb-28">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-400">Редактирование SKU</div>
          <h3 className="mt-1 text-2xl font-bold tracking-[-0.04em] text-white">{variant.sku}</h3>
          <p className="mt-2 max-w-[780px] text-sm leading-relaxed text-white/50">
            Это отдельная продаваемая позиция. После сохранения вы останетесь на странице позиции, а не улетите в материнскую карточку.
          </p>
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

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
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

        <div className="md:col-span-2 xl:col-span-4">
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
          <input value={price} onChange={(event) => setPrice(onlyDigits(event.target.value))} inputMode="numeric" className={inputClass} />
        </Field>

        <Field label="Старая цена">
          <input value={oldPrice} onChange={(event) => setOldPrice(onlyDigits(event.target.value))} inputMode="numeric" className={inputClass} />
        </Field>

        <Field label="Остаток">
          <input value={stock} onChange={(event) => setStock(onlyDigits(event.target.value))} inputMode="numeric" className={inputClass} />
        </Field>

        <Field label="Статус">
          <select value={status} onChange={(event) => setStatus(event.target.value)} className={inputClass}>
            <option value="active">Активна</option>
            <option value="draft">Черновик</option>
            <option value="hidden">Скрыта</option>
            <option value="out_of_stock">Нет в наличии</option>
          </select>
        </Field>

        <div className="md:col-span-2 xl:col-span-4 flex flex-wrap gap-2 rounded-2xl border border-white/10 bg-black/20 p-4">
          <button type="button" onClick={() => setStatus("active")} className="rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-2 text-sm font-semibold text-green-200 transition-colors hover:bg-green-500/20">В продажу</button>
          <button type="button" onClick={() => setStatus("draft")} className="rounded-xl border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-sm font-semibold text-blue-200 transition-colors hover:bg-blue-500/20">В черновик</button>
          <button type="button" onClick={() => setStatus("hidden")} className="rounded-xl border border-orange-500/30 bg-orange-500/10 px-4 py-2 text-sm font-semibold text-orange-100 transition-colors hover:bg-orange-500/20">Скрыть</button>
        </div>

        <div className="md:col-span-2 xl:col-span-4 rounded-2xl border border-blue-500/20 bg-blue-500/10 p-4">
          <div className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-400">SEO позиции</div>
          <p className="mt-2 text-xs leading-relaxed text-white/45">
            Описание товара остаётся у карточки, а здесь задаются SEO-данные конкретной SKU-позиции.
          </p>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <Field label="SEO title">
              <input value={seoTitle} onChange={(event) => setSeoTitle(event.target.value)} className={inputClass} />
            </Field>
            <Field label="SEO keywords">
              <input value={seoKeywords} onChange={(event) => setSeoKeywords(event.target.value)} className={inputClass} />
            </Field>
            <div className="md:col-span-2">
              <Field label="SEO description">
                <textarea
                  value={seoDescription}
                  onChange={(event) => setSeoDescription(event.target.value)}
                  className="min-h-24 w-full rounded-xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-white/30 focus:border-blue-500/60"
                />
              </Field>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 rounded-[24px] border border-white/10 bg-black/20 p-4 sm:p-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-400">
              С этим товаром покупают
            </div>
            <p className="mt-2 text-sm leading-relaxed text-white/50">
              Выберите до 8 товаров. Порядок ниже совпадает с порядком на сайте.
            </p>
          </div>

          <div className="text-sm text-white/45">
            Выбрано: {relatedProductIds.length}
          </div>
        </div>

        {relatedProductIds.length > 0 ? (
          <div className="mt-4 grid gap-2">
            {relatedProductIds.map((productId, index) => {
              const product = relatedProductOptions.find((item) => item.id === productId);

              if (!product) return null;

              return (
                <div
                  key={product.id}
                  className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3"
                >
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white/[0.05]">
                    {product.image ? (
                      <img src={product.image} alt="" className="h-full w-full object-contain p-1" />
                    ) : null}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold text-white">{product.name}</div>
                    <div className="mt-1 text-xs text-white/45">{product.brand}</div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => moveRelatedProduct(product.id, "up")}
                      disabled={index === 0}
                      className="h-9 w-9 rounded-xl border border-white/10 text-white/70 hover:bg-white/5 disabled:opacity-30"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      onClick={() => moveRelatedProduct(product.id, "down")}
                      disabled={index === relatedProductIds.length - 1}
                      className="h-9 w-9 rounded-xl border border-white/10 text-white/70 hover:bg-white/5 disabled:opacity-30"
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleRelatedProduct(product.id)}
                      className="rounded-xl border border-red-500/25 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-200 hover:bg-red-500/20"
                    >
                      Убрать
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : null}

        <div className="mt-4 grid max-h-[420px] gap-2 overflow-y-auto pr-1 md:grid-cols-2">
          {relatedProductOptions.map((product) => {
            const selected = relatedProductIds.includes(product.id);

            return (
              <button
                key={product.id}
                type="button"
                onClick={() => toggleRelatedProduct(product.id)}
                className={`flex items-center gap-3 rounded-2xl border p-3 text-left transition-colors ${
                  selected
                    ? "border-blue-500/50 bg-blue-500/10"
                    : "border-white/10 bg-white/[0.02] hover:border-blue-500/35 hover:bg-blue-500/[0.05]"
                }`}
              >
                <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white/[0.05]">
                  {product.image ? (
                    <img src={product.image} alt="" className="h-full w-full object-contain p-1" />
                  ) : null}
                </div>
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-white">{product.name}</div>
                  <div className="mt-1 text-xs text-white/45">{product.brand}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-8">
        <ImageLibraryField
          value={images}
          onChange={setImages}
          label="Фотографии позиции / SKU"
          hint="Фотографии конкретной конфигурации товара."
          recommendedSize="1600×1600 px"
          recommendedFormat="PNG / WEBP, квадрат"
        />
      </div>

      {error ? <div className="mt-5 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</div> : null}
      {success ? <div className="mt-5 rounded-2xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-200">{success}</div> : null}
    </form>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="grid gap-2 text-sm font-medium text-white/60">
      <span className="text-xs font-semibold uppercase tracking-[0.16em] text-white/35">{label}</span>
      {children}
    </label>
  );
}
