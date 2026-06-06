"use client";

import type { FormEvent, ReactNode } from "react";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { ImageLibraryField } from "@/components/admin/image-library-field";
import {
  ProductDescriptionBlocksEditor,
  type ProductDescriptionBlock,
} from "@/components/admin/product-description-blocks-editor";

type AdminCategoryOption = {
  id: string;
  slug: string;
  name: string;
};

type Props = {
  categories: AdminCategoryOption[];
  initialCategorySlug?: string;
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

function getInitialCategorySlug(categories: AdminCategoryOption[], initialCategorySlug?: string) {
  if (initialCategorySlug && categories.some((category) => category.slug === initialCategorySlug)) {
    return initialCategorySlug;
  }

  return categories[0]?.slug ?? "";
}

export function ProductCreateForm({ categories, initialCategorySlug }: Props) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [brand, setBrand] = useState("Apple");
  const [categorySlug, setCategorySlug] = useState(() => getInitialCategorySlug(categories, initialCategorySlug));
  const [shortDescription, setShortDescription] = useState("");
  const [description, setDescription] = useState("");
  const [descriptionBlocks, setDescriptionBlocks] = useState<ProductDescriptionBlock[]>([]);
  const [status, setStatus] = useState("active");
  const [isNew, setIsNew] = useState(true);
  const [isPopular, setIsPopular] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [promoImages, setPromoImages] = useState<string[]>([]);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const finalSlug = useMemo(() => slug || slugify(name), [name, slug]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!name.trim() || !finalSlug || !brand.trim() || !categorySlug) {
        throw new Error("Заполните название, slug, бренд и категорию.");
      }

      const productResponse = await fetch("/api/admin/products", {
        method: "POST",
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
          status,
          isNew,
          isPopular,
        }),
      });

      const productPayload = await productResponse.json();

      if (!productResponse.ok) {
        throw new Error(productPayload?.error ?? "Не удалось создать товар.");
      }

      router.push(`/nz-console/products/${finalSlug}`);
      router.refresh();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Неизвестная ошибка.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-[1fr_380px]">
      <div className="space-y-8">
        <section className="rounded-[34px] border border-white/10 bg-white/[0.035] p-6 sm:p-8">
          <SectionTitle
            label="Карточка"
            title="Основная информация"
            text="Карточка — это модель товара: название, категория, бренд, фото и описание. Конкретные SKU, цены и остатки добавляются отдельно в разделе «Позиции / SKU»."
          />

          {categories.length === 0 ? (
            <div className="mt-8 rounded-2xl border border-orange-500/25 bg-orange-500/10 p-4 text-sm leading-relaxed text-orange-100/80">
              Сначала создайте хотя бы одну категорию в разделе «Категории». Без категории карточку товара сохранить нельзя.
            </div>
          ) : null}

          <div className="mt-8 grid gap-5 md:grid-cols-2">
            <Field label="Название карточки">
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                onBlur={() => !slug && setSlug(slugify(name))}
                placeholder="Например: iPhone 17 Pro"
                className={inputClass}
              />
            </Field>

            <Field label="Slug карточки">
              <input
                value={finalSlug}
                onChange={(event) => setSlug(slugify(event.target.value))}
                placeholder="iphone-17-pro"
                className={inputClass}
              />
            </Field>

            <Field label="Категория">
              <select
                value={categorySlug}
                onChange={(event) => setCategorySlug(event.target.value)}
                className={inputClass}
                disabled={categories.length === 0}
              >
                {categories.length === 0 ? <option value="">Нет категорий</option> : null}
                {categories.map((category) => (
                  <option key={category.slug} value={category.slug}>
                    {category.name}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Бренд">
              <input
                value={brand}
                onChange={(event) => setBrand(event.target.value)}
                placeholder="Apple"
                className={inputClass}
              />
            </Field>

            <Field label="Статус карточки">
              <select
                value={status}
                onChange={(event) => setStatus(event.target.value)}
                className={inputClass}
              >
                <option value="active">Активна</option>
                <option value="draft">Черновик</option>
                <option value="hidden">Скрыта</option>
              </select>
            </Field>

            <div className="grid gap-3 rounded-2xl border border-white/10 bg-black/20 p-4">
              <label className="flex items-center gap-3 text-sm text-white/70">
                <input
                  type="checkbox"
                  checked={isNew}
                  onChange={(event) => setIsNew(event.target.checked)}
                />
                Новинка
              </label>

              <label className="flex items-center gap-3 text-sm text-white/70">
                <input
                  type="checkbox"
                  checked={isPopular}
                  onChange={(event) => setIsPopular(event.target.checked)}
                />
                Популярный товар
              </label>
            </div>
          </div>

          <div className="mt-5 grid gap-5 lg:grid-cols-2">
            <ImageLibraryField
              value={images}
              onChange={setImages}
              label="Фотографии карточки"
              hint="Перетащите несколько общих фото модели. Первое фото будет главным до выбора конкретной позиции/SKU."
              maxImages={10}
            />

            <ImageLibraryField
              value={promoImages}
              onChange={setPromoImages}
              label="Фото для блока «Новинки»"
              hint="Отдельное широкое промо-фото для главной. Лучше загружать баннер 16:9 или широкий PNG/WebP."
              maxImages={1}
            />
          </div>

          <div className="mt-5 grid gap-5">
            <Field label="Короткое описание">
              <textarea
                value={shortDescription}
                onChange={(event) => setShortDescription(event.target.value)}
                placeholder="Короткий текст для каталога и карточки товара."
                className={textareaClass}
              />
            </Field>

            <Field label="Полное текстовое описание">
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Текстовый fallback. Основное красивое описание собирается блоками ниже."
                className={textareaClass}
              />
            </Field>

            <ProductDescriptionBlocksEditor
              value={descriptionBlocks}
              onChange={setDescriptionBlocks}
            />
          </div>
        </section>
      </div>

      <aside className="h-fit rounded-[34px] border border-white/10 bg-white/[0.035] p-6 sm:p-8 lg:sticky lg:top-6">
        <div className="text-sm font-medium uppercase tracking-[0.2em] text-blue-400">
          Сохранение
        </div>

        <h2 className="mt-3 text-3xl font-bold tracking-[-0.04em]">
          Создать карточку
        </h2>

        <p className="mt-3 text-sm leading-relaxed text-white/55">
          После сохранения появится материнская карточка товара. Конкретные позиции, цены и остатки добавляются отдельно в разделе «Позиции / SKU».
        </p>

        {error && (
          <div className="mt-5 rounded-2xl border border-red-500/25 bg-red-500/10 p-4 text-sm leading-relaxed text-red-200">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || categories.length === 0}
          className="mt-6 w-full rounded-xl bg-blue-600 px-5 py-4 text-sm font-semibold text-white transition-colors hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Сохраняю..." : "Создать карточку"}
        </button>

        <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4 text-xs leading-relaxed text-white/45">
          Карточка отвечает за модель, фото и описание. SKU отвечает за цену, память, цвет, SIM и наличие.
        </div>
      </aside>
    </form>
  );
}

function SectionTitle({ label, title, text }: { label: string; title: string; text: string }) {
  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-400">
        {label}
      </div>
      <h2 className="mt-2 text-3xl font-bold tracking-[-0.04em] text-white">
        {title}
      </h2>
      <p className="mt-3 max-w-[760px] text-sm leading-relaxed text-white/55">
        {text}
      </p>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-medium text-white/70">{label}</span>
      {children}
    </label>
  );
}
