"use client";

import type { FormEvent, ReactNode } from "react";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { ColorPickerField } from "@/components/admin/color-picker-field";
import { ImageLibraryField } from "@/components/admin/image-library-field";

type ProductOption = {
  id: string;
  slug: string;
  name: string;
  brand: string;
  categorySlug: string;
  category?: {
    name: string;
  } | null;
};

type Props = {
  products: ProductOption[];
  initialProductSlug?: string;
  initialCategorySlug?: string;
};

const inputClass =
  "h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-blue-500/70 dark:border-white/10 dark:bg-black/25 dark:text-white dark:placeholder:text-white/30";

function normalizeVariantSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/[^a-z0-9-]+/g, "")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeManualSku(value: string) {
  return value.trim();
}

function onlyDigits(value: string) {
  return value.replace(/[^0-9]/g, "");
}

function getProductCategoryName(product?: ProductOption) {
  return product?.category?.name ?? product?.categorySlug ?? "Без категории";
}

export function PositionCreateForm({ products, initialProductSlug, initialCategorySlug }: Props) {
  const router = useRouter();
  const initialProduct =
    products.find((product) => product.slug === initialProductSlug) ??
    products.find((product) => product.categorySlug === initialCategorySlug) ??
    products[0];

  const [productId, setProductId] = useState(initialProduct?.id ?? "");
  const [sku, setSku] = useState("");
  const [slug, setSlug] = useState("");
  const [title, setTitle] = useState("");
  const [memory, setMemory] = useState("");
  const [color, setColor] = useState("");
  const [colorHex, setColorHex] = useState("");
  const [sim, setSim] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [price, setPrice] = useState("");
  const [oldPrice, setOldPrice] = useState("");
  const [stock, setStock] = useState("");
  const [status, setStatus] = useState("active");
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [seoKeywords, setSeoKeywords] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const selectedProduct = products.find((product) => product.id === productId);
  const categoryProductsCount = initialCategorySlug
    ? products.filter((product) => product.categorySlug === initialCategorySlug).length
    : products.length;

  const suggestedTitle = useMemo(() => {
    return [selectedProduct?.name, memory, color, sim].filter(Boolean).join(" ").trim();
  }, [color, memory, selectedProduct?.name, sim]);

  const finalSku = normalizeManualSku(sku);
  const finalSlug = normalizeVariantSlug(slug);
  const finalTitle = title.trim() || suggestedTitle;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!productId || !finalSku || !finalSlug || !finalTitle || !price) {
        throw new Error("Выберите карточку, SKU, ссылку позиции, название и цену.");
      }

      const response = await fetch(`/api/admin/products/${productId}/variants`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sku: finalSku,
          slug: finalSlug,
          title: finalTitle,
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
        }),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.error ?? "Не удалось создать позицию.");
      }

      router.push(`/nz-console/positions/${encodeURIComponent(finalSku)}`);
      router.refresh();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Неизвестная ошибка.");
    } finally {
      setLoading(false);
    }
  }

  if (products.length === 0) {
    return (
      <div className="rounded-[34px] border border-orange-500/25 bg-orange-500/10 p-6 text-sm leading-relaxed text-orange-100/80">
        Сначала создайте материнскую карточку товара и привяжите её к категории. После этого сюда можно будет добавить конкретную SKU-позицию.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pb-28">
      <section className="rounded-[34px] border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.035] sm:p-8">
        <SectionTitle
          label="Новая позиция"
          title="Добавить SKU"
          text="Заполните конкретную продаваемую комплектацию: SKU, ссылку, память, цвет, SIM, цену, остаток и фото."
        />

        <div className="mt-8 space-y-5">
          <FormBlock title="Основное">
            <div className="grid gap-4 lg:grid-cols-3">
              <Field label="Материнская карточка">
                <select value={productId} onChange={(event) => setProductId(event.target.value)} className={inputClass}>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name} · {product.brand} · {getProductCategoryName(product)}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Артикул / SKU">
                <input
                  value={sku}
                  onChange={(event) => setSku(event.target.value)}
                  placeholder="Например: IP17-256-BLUE-ESIM"
                  className={inputClass}
                />
              </Field>

              <Field label="Ссылка позиции">
                <input
                  value={slug}
                  onChange={(event) => setSlug(normalizeVariantSlug(event.target.value))}
                  placeholder="Например: iphone-17-256gb-blue-esim"
                  className={inputClass}
                />
              </Field>

              <div className="lg:col-span-2">
                <Field label="Название позиции">
                  <input
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    placeholder="Например: iPhone 17 Pro 256 GB Black eSIM"
                    className={inputClass}
                  />
                </Field>
              </div>

              <StatusPreview finalSku={finalSku} finalSlug={finalSlug} finalTitle={finalTitle} />
            </div>

            {initialCategorySlug && categoryProductsCount === 0 ? (
              <div className="mt-4 rounded-2xl border border-orange-500/25 bg-orange-500/10 p-4 text-sm leading-relaxed text-orange-700 dark:text-orange-100/80">
                В этой категории пока нет карточек товара. Сначала создайте карточку в этой категории, потом добавьте к ней SKU-позицию.
              </div>
            ) : null}
          </FormBlock>

          <FormBlock title="Конфигурация">
            <div className="grid gap-4 lg:grid-cols-3">
              <Field label="Память">
                <input
                  value={memory}
                  onChange={(event) => setMemory(event.target.value)}
                  placeholder="Например: 256 GB"
                  className={inputClass}
                />
              </Field>

              <ColorPickerField
                color={color}
                colorHex={colorHex}
                onColorChange={setColor}
                onColorHexChange={setColorHex}
              />

              <Field label="SIM">
                <input
                  value={sim}
                  onChange={(event) => setSim(event.target.value)}
                  placeholder="Например: eSIM или SIM + eSIM"
                  className={inputClass}
                />
              </Field>
            </div>
          </FormBlock>

          <FormBlock title="Цена и наличие">
            <div className="grid gap-4 lg:grid-cols-4">
              <Field label="Цена">
                <input
                  value={price}
                  onChange={(event) => setPrice(onlyDigits(event.target.value))}
                  inputMode="numeric"
                  placeholder="Например: 109990"
                  className={inputClass}
                />
              </Field>

              <Field label="Старая цена">
                <input
                  value={oldPrice}
                  onChange={(event) => setOldPrice(onlyDigits(event.target.value))}
                  inputMode="numeric"
                  placeholder="Например: 119990"
                  className={inputClass}
                />
              </Field>

              <Field label="Остаток">
                <input
                  value={stock}
                  onChange={(event) => setStock(onlyDigits(event.target.value))}
                  inputMode="numeric"
                  placeholder="Например: 3"
                  className={inputClass}
                />
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
          </FormBlock>

          <FormBlock title="SEO позиции" text="Описание остаётся у карточки товара, а у SKU можно задать SEO для конкретной комплектации.">
            <div className="grid gap-4 lg:grid-cols-2">
              <Field label="SEO title">
                <input
                  value={seoTitle}
                  onChange={(event) => setSeoTitle(event.target.value)}
                  placeholder="Купить iPhone 17 Pro 256 GB Silver eSIM"
                  className={inputClass}
                />
              </Field>

              <Field label="SEO keywords">
                <input
                  value={seoKeywords}
                  onChange={(event) => setSeoKeywords(event.target.value)}
                  placeholder="iphone 17 pro, 256gb, silver, esim"
                  className={inputClass}
                />
              </Field>

              <div className="lg:col-span-2">
                <Field label="SEO description">
                  <textarea
                    value={seoDescription}
                    onChange={(event) => setSeoDescription(event.target.value)}
                    placeholder="Короткое SEO-описание конкретной SKU-позиции."
                    className="min-h-24 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-blue-500/70 dark:border-white/10 dark:bg-black/25 dark:text-white dark:placeholder:text-white/30"
                  />
                </Field>
              </div>
            </div>
          </FormBlock>

          <FormBlock title="Фотографии позиции / SKU" text="Фотографии конкретной конфигурации: цвет, память и SIM.">
            <ImageLibraryField
              value={images}
              onChange={setImages}
              label="Фотографии позиции / SKU"
              hint="Фотографии конкретной конфигурации: цвет, память и SIM."
              recommendedSize="1600×1600 px"
              recommendedFormat="PNG / WEBP, квадрат"
            />
          </FormBlock>
        </div>

        {error ? (
          <div className="mt-5 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-200">
            {error}
          </div>
        ) : null}
      </section>

      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200/80 bg-white/90 px-4 py-3 shadow-[0_-12px_30px_rgba(15,23,42,0.10)] backdrop-blur dark:border-white/10 dark:bg-[#070b16]/90">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 text-sm text-slate-500 dark:text-white/50">
            <div className="font-semibold text-slate-900 dark:text-white">Создание SKU</div>
            <div className="mt-0.5 truncate">
              {finalTitle || "Заполните данные позиции"}
              {finalSku ? <span> · {finalSku}</span> : null}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:min-w-[220px]"
          >
            {loading ? "Сохраняю..." : "Создать позицию"}
          </button>
        </div>
      </div>
    </form>
  );
}

function SectionTitle({ label, title, text }: { label: string; title: string; text: string }) {
  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">{label}</div>
      <h2 className="mt-2 text-3xl font-bold tracking-[-0.04em] text-slate-950 dark:text-white">{title}</h2>
      <p className="mt-3 max-w-[760px] text-sm leading-relaxed text-slate-600 dark:text-white/55">{text}</p>
    </div>
  );
}

function FormBlock({ title, text, children }: { title: string; text?: string; children: ReactNode }) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-slate-50/70 p-4 shadow-sm dark:border-white/10 dark:bg-black/20 sm:p-5">
      <div className="mb-4 flex flex-col gap-1 border-b border-slate-200 pb-3 dark:border-white/10">
        <div className="text-sm font-semibold text-slate-950 dark:text-white">{title}</div>
        {text ? <p className="text-xs leading-relaxed text-slate-500 dark:text-white/45">{text}</p> : null}
      </div>
      {children}
    </section>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="grid gap-2">
      <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-white/35">{label}</span>
      {children}
    </label>
  );
}

function StatusPreview({ finalSku, finalSlug, finalTitle }: { finalSku: string; finalSlug: string; finalTitle: string }) {
  return (
    <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 p-4 text-xs leading-relaxed text-slate-600 dark:text-white/55">
      <div className="font-semibold text-blue-600 dark:text-blue-300">Предпросмотр</div>
      <div className="mt-2 space-y-1">
        <div>
          SKU: <span className="font-semibold text-slate-950 dark:text-white">{finalSku || "не заполнен"}</span>
        </div>
        <div>
          Ссылка: <span className="font-semibold text-slate-950 dark:text-white">{finalSlug ? `/product/${finalSlug}` : "не заполнена"}</span>
        </div>
        {finalTitle ? (
          <div className="truncate">
            Название: <span className="font-semibold text-slate-950 dark:text-white">{finalTitle}</span>
          </div>
        ) : null}
      </div>
    </div>
  );
}
