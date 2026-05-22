"use client";

import type { FormEvent, ReactNode } from "react";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type AdminCategoryOption = {
  id: string;
  slug: string;
  name: string;
};

type Props = {
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

export function ProductCreateForm({ categories }: Props) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [brand, setBrand] = useState("Apple");
  const [categorySlug, setCategorySlug] = useState(categories[0]?.slug ?? "smartphones");
  const [shortDescription, setShortDescription] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("active");
  const [isNew, setIsNew] = useState(true);
  const [isPopular, setIsPopular] = useState(false);

  const [createSku, setCreateSku] = useState(true);
  const [sku, setSku] = useState("");
  const [memory, setMemory] = useState("256 GB");
  const [color, setColor] = useState("Black");
  const [colorHex, setColorHex] = useState("#111827");
  const [sim, setSim] = useState("eSIM");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("1");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const finalSlug = useMemo(() => slug || slugify(name), [name, slug]);
  const finalSku = useMemo(() => {
    if (sku) {
      return sku;
    }

    const parts = [brand, finalSlug, memory, color, sim]
      .filter(Boolean)
      .join("-");

    return parts.toUpperCase().replace(/\s+/g, "-");
  }, [brand, color, finalSlug, memory, sim, sku]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!name.trim() || !finalSlug || !brand.trim() || !categorySlug) {
        throw new Error("Заполните название, slug, бренд и категорию.");
      }

      if (createSku && (!finalSku || !price)) {
        throw new Error("Для первой SKU укажите артикул и цену.");
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
          status,
          isNew,
          isPopular,
        }),
      });

      const productPayload = await productResponse.json();

      if (!productResponse.ok) {
        throw new Error(productPayload?.error ?? "Не удалось создать товар.");
      }

      if (createSku) {
        const variantResponse = await fetch(
          `/api/admin/products/${productPayload.product.id}/variants`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              sku: finalSku,
              slug: slugify(finalSku),
              title: `${name} ${memory} ${color} ${sim}`.trim(),
              memory,
              color,
              colorHex,
              sim,
              price: Number(price),
              stock: Number(stock),
            }),
          },
        );

        const variantPayload = await variantResponse.json();

        if (!variantResponse.ok) {
          throw new Error(
            variantPayload?.error ?? "Карточка создана, но SKU добавить не удалось.",
          );
        }
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
            text="Эти данные сразу сохраняются в PostgreSQL. Клиент увидит карточку после подключения каталога к БД."
          />

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
              >
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

          <div className="mt-5 grid gap-5">
            <Field label="Короткое описание">
              <textarea
                value={shortDescription}
                onChange={(event) => setShortDescription(event.target.value)}
                placeholder="Короткий текст для каталога и карточки товара."
                className={textareaClass}
              />
            </Field>

            <Field label="Полное описание">
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Более подробное описание модели."
                className={textareaClass}
              />
            </Field>
          </div>
        </section>

        <section className="rounded-[34px] border border-white/10 bg-white/[0.035] p-6 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <SectionTitle
              label="SKU"
              title="Первая конфигурация"
              text="Можно сразу добавить первую конкретную позицию: память, цвет, SIM, цена и остаток."
            />

            <label className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/70">
              <input
                type="checkbox"
                checked={createSku}
                onChange={(event) => setCreateSku(event.target.checked)}
              />
              Добавить SKU
            </label>
          </div>

          {createSku && (
            <div className="mt-8 grid gap-5 md:grid-cols-2">
              <Field label="Артикул / SKU">
                <input
                  value={finalSku}
                  onChange={(event) => setSku(event.target.value.toUpperCase())}
                  placeholder="IP17-256-BLACK-ESIM"
                  className={inputClass}
                />
              </Field>

              <Field label="Цена">
                <input
                  value={price}
                  onChange={(event) => setPrice(event.target.value)}
                  inputMode="numeric"
                  placeholder="89990"
                  className={inputClass}
                />
              </Field>

              <Field label="Память">
                <input
                  value={memory}
                  onChange={(event) => setMemory(event.target.value)}
                  placeholder="256 GB"
                  className={inputClass}
                />
              </Field>

              <Field label="Цвет">
                <input
                  value={color}
                  onChange={(event) => setColor(event.target.value)}
                  placeholder="Black"
                  className={inputClass}
                />
              </Field>

              <Field label="HEX цвета">
                <input
                  value={colorHex}
                  onChange={(event) => setColorHex(event.target.value)}
                  placeholder="#111827"
                  className={inputClass}
                />
              </Field>

              <Field label="SIM">
                <input
                  value={sim}
                  onChange={(event) => setSim(event.target.value)}
                  placeholder="eSIM"
                  className={inputClass}
                />
              </Field>

              <Field label="Остаток">
                <input
                  value={stock}
                  onChange={(event) => setStock(event.target.value)}
                  inputMode="numeric"
                  placeholder="1"
                  className={inputClass}
                />
              </Field>
            </div>
          )}
        </section>
      </div>

      <aside className="h-fit rounded-[34px] border border-white/10 bg-white/[0.035] p-6 sm:p-8 lg:sticky lg:top-6">
        <div className="text-sm font-medium uppercase tracking-[0.2em] text-blue-400">
          Сохранение
        </div>

        <h2 className="mt-3 text-3xl font-bold tracking-[-0.04em]">
          Создать в БД
        </h2>

        <p className="mt-3 text-sm leading-relaxed text-white/55">
          После сохранения товар появится в PostgreSQL. Старые демо-товары пока остаются fallback, чтобы сайт не ломался.
        </p>

        {error && (
          <div className="mt-5 rounded-2xl border border-red-500/25 bg-red-500/10 p-4 text-sm leading-relaxed text-red-200">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full rounded-xl bg-blue-600 px-5 py-4 text-sm font-semibold text-white transition-colors hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Сохраняю..." : "Создать карточку →"}
        </button>

        <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4 text-xs leading-relaxed text-white/45">
          Сейчас подключаем админку к БД. Следующим шагом переведём клиентский каталог на эти же товары.
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
