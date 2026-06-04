"use client";

import type { FormEvent, ReactNode } from "react";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { ImageLibraryField } from "@/components/admin/image-library-field";
import {
  ProductDescriptionBlocksEditor,
  normalizeDescriptionBlocks,
  type ProductDescriptionBlock,
} from "@/components/admin/product-description-blocks-editor";

type AdminCategoryOption = {
  id: string;
  slug: string;
  name: string;
};

type ProductForEdit = {
  id: string;
  slug: string;
  name: string;
  brand: string;
  categorySlug: string;
  shortDescription: string;
  description: string;
  descriptionBlocks?: ProductDescriptionBlock[];
  status: string;
  image: string;
  promoImage?: string;
  images?: string[];
  isNew: boolean;
  isPopular: boolean;
  sortOrder?: number;
};

type Props = {
  product: ProductForEdit;
  categories: AdminCategoryOption[];
};

const inputClass =
  "h-12 w-full rounded-xl border border-white/10 bg-black/25 px-4 text-sm text-white outline-none transition-colors placeholder:text-white/30 focus:border-blue-500/60";

const textareaClass =
  "min-h-[110px] w-full resize-y rounded-xl border border-white/10 bg-black/25 px-4 py-3 text-sm leading-relaxed text-white outline-none transition-colors placeholder:text-white/30 focus:border-blue-500/60";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/ё/g, "e")
    .replace(/й/g, "i")
    .replace(/[^a-z0-9а-я]+/gi, "-")
    .replace(/^-+|-+$/g, "");
}

export function ProductEditForm({ product, categories }: Props) {
  const router = useRouter();

  const [name, setName] = useState(product.name);
  const [slug, setSlug] = useState(product.slug);
  const [brand, setBrand] = useState(product.brand);
  const [categorySlug, setCategorySlug] = useState(product.categorySlug);
  const [shortDescription, setShortDescription] = useState(product.shortDescription);
  const [description, setDescription] = useState(product.description);
  const [descriptionBlocks, setDescriptionBlocks] = useState<ProductDescriptionBlock[]>(
    normalizeDescriptionBlocks(product.descriptionBlocks)
  );
  const [status, setStatus] = useState(product.status);
  const [images, setImages] = useState<string[]>(
    Array.isArray(product.images) && product.images.length > 0
      ? product.images
      : product.image
        ? [product.image]
        : []
  );
  const [promoImages, setPromoImages] = useState<string[]>(product.promoImage ? [product.promoImage] : []);
  const [isNew, setIsNew] = useState(product.isNew);
  const [isPopular, setIsPopular] = useState(product.isPopular);
  const [sortOrder, setSortOrder] = useState(String(product.sortOrder ?? 100));

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const finalSlug = useMemo(() => slugify(slug || name), [name, slug]);

  async function saveProduct(statusOverride?: string) {
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      if (!name.trim() || !finalSlug || !brand.trim() || !categorySlug) {
        throw new Error("Заполните название, slug, бренд и категорию.");
      }

      const response = await fetch(`/api/admin/products/${product.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          slug: finalSlug,
          brand,
          categorySlug,
          shortDescription,
          description,
          descriptionBlocks,
          image: images[0] ?? "",
          promoImage: promoImages[0] ?? "",
          images,
          status: statusOverride ?? status,
          isNew,
          isPopular,
          sortOrder: Number(sortOrder),
        }),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.error ?? "Не удалось сохранить карточку.");
      }

      if (statusOverride) {
        setStatus(statusOverride);
      }

      setSuccess(statusOverride === "draft" ? "Карточка отправлена в черновик." : statusOverride === "hidden" ? "Карточка скрыта." : "Карточка сохранена.");
      router.replace(`/nz-console/products/${finalSlug}`);
      router.refresh();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Неизвестная ошибка.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await saveProduct();
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 rounded-[28px] border border-blue-500/20 bg-blue-500/[0.06] p-5 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-400">
            Редактирование
          </div>
          <h3 className="mt-2 text-2xl font-bold tracking-[-0.04em] text-white">
            Изменить карточку товара
          </h3>
          <p className="mt-2 max-w-[760px] text-sm leading-relaxed text-white/55">
            Меняйте название, категорию, бренд, фото, описание и статус. Фото можно просто перетащить в блок загрузки.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/60">
          Slug: <span className="font-semibold text-white">{finalSlug || "—"}</span>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Field label="Название карточки">
          <input value={name} onChange={(event) => setName(event.target.value)} className={inputClass} />
        </Field>

        <Field label="Slug карточки">
          <input value={finalSlug} onChange={(event) => setSlug(slugify(event.target.value))} className={inputClass} />
        </Field>

        <Field label="Категория">
          <select value={categorySlug} onChange={(event) => setCategorySlug(event.target.value)} className={inputClass}>
            {categories.map((category) => (
              <option key={category.slug} value={category.slug}>
                {category.name}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Бренд">
          <input value={brand} onChange={(event) => setBrand(event.target.value)} className={inputClass} />
        </Field>

        <Field label="Статус">
          <select value={status} onChange={(event) => setStatus(event.target.value)} className={inputClass}>
            <option value="active">Активна</option>
            <option value="draft">Черновик</option>
            <option value="hidden">Скрыта</option>
            <option value="out_of_stock">Нет в наличии</option>
          </select>
        </Field>

        <Field label="Порядок в каталоге">
          <input
            type="number"
            value={sortOrder}
            onChange={(event) => setSortOrder(event.target.value)}
            className={inputClass}
            placeholder="100"
          />
        </Field>

        <div className="md:col-span-2 xl:col-span-2">
          <ImageLibraryField
            value={images}
            onChange={setImages}
            label="Фотографии карточки"
            hint="Перетащите несколько общих фото модели. Эти фото показываются до выбора конкретной позиции/SKU."
            maxImages={10}
            recommendedWidth={1200}
            recommendedHeight={1200}
          />
        </div>

        <div className="md:col-span-2 xl:col-span-2">
          <ImageLibraryField
            value={promoImages}
            onChange={setPromoImages}
            label="Фото для блока «Новинки»"
            hint="Отдельное широкое промо-фото для главной. Используется только в промо-блоке новинок."
            maxImages={1}
            recommendedWidth={1600}
            recommendedHeight={900}
          />
        </div>

        <label className="flex min-h-12 items-center gap-3 rounded-xl border border-white/10 bg-black/20 px-4 text-sm text-white/70">
          <input type="checkbox" checked={isNew} onChange={(event) => setIsNew(event.target.checked)} />
          Новинка
        </label>

        <label className="flex min-h-12 items-center gap-3 rounded-xl border border-white/10 bg-black/20 px-4 text-sm text-white/70">
          <input type="checkbox" checked={isPopular} onChange={(event) => setIsPopular(event.target.checked)} />
          Популярный товар
        </label>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Field label="Короткое описание">
          <textarea value={shortDescription} onChange={(event) => setShortDescription(event.target.value)} className={textareaClass} />
        </Field>

        <Field label="Полное текстовое описание">
          <textarea value={description} onChange={(event) => setDescription(event.target.value)} className={textareaClass} />
        </Field>
      </div>

      <div className="mt-4">
        <ProductDescriptionBlocksEditor
          value={descriptionBlocks}
          onChange={setDescriptionBlocks}
        />
      </div>

      {error ? (
        <div className="mt-5 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      ) : null}

      {success ? (
        <div className="mt-5 rounded-2xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-200">
          {success}
        </div>
      ) : null}

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Сохраняю..." : "Сохранить карточку"}
        </button>

        <button
          type="button"
          disabled={loading}
          onClick={() => saveProduct("draft")}
          className="rounded-xl border border-orange-500/30 bg-orange-500/10 px-5 py-3 text-sm font-semibold text-orange-100 transition-colors hover:bg-orange-500/20 disabled:cursor-not-allowed disabled:opacity-60"
        >
          В черновик
        </button>

        <button
          type="button"
          disabled={loading}
          onClick={() => saveProduct("hidden")}
          className="rounded-xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-white/70 transition-colors hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Скрыть
        </button>

        {status !== "active" ? (
          <button
            type="button"
            disabled={loading}
            onClick={() => saveProduct("active")}
            className="rounded-xl border border-green-500/30 bg-green-500/10 px-5 py-3 text-sm font-semibold text-green-100 transition-colors hover:bg-green-500/20 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Опубликовать
          </button>
        ) : null}

        <span className="text-sm text-white/40">
          Если поменять slug, страница товара автоматически откроется по новому адресу.
        </span>
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="grid gap-2 text-sm font-medium text-white/65">
      <span>{label}</span>
      {children}
    </label>
  );
}
