"use client";

import type { FormEvent, ReactNode } from "react";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ColorPickerField } from "@/components/admin/color-picker-field";

type ProductOption = {
  id: string;
  slug: string;
  name: string;
  brand: string;
};

type Props = {
  products: ProductOption[];
  initialProductSlug?: string;
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

function normalizeSku(value: string) {
  return value.trim().toUpperCase().replace(/\s+/g, "-");
}

export function PositionCreateForm({ products, initialProductSlug }: Props) {
  const router = useRouter();
  const initialProduct = products.find((product) => product.slug === initialProductSlug) ?? products[0];

  const [productId, setProductId] = useState(initialProduct?.id ?? "");
  const [sku, setSku] = useState("");
  const [title, setTitle] = useState("");
  const [memory, setMemory] = useState("");
  const [color, setColor] = useState("");
  const [colorHex, setColorHex] = useState("");
  const [sim, setSim] = useState("");
  const [price, setPrice] = useState("");
  const [oldPrice, setOldPrice] = useState("");
  const [stock, setStock] = useState("");
  const [status, setStatus] = useState("active");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const selectedProduct = products.find((product) => product.id === productId);

  const suggestedSku = useMemo(() => {
    const base = [selectedProduct?.slug, memory, color, sim]
      .filter(Boolean)
      .join("-");

    return normalizeSku(base);
  }, [color, memory, selectedProduct?.slug, sim]);

  const suggestedTitle = useMemo(() => {
    return [selectedProduct?.name, memory, color, sim].filter(Boolean).join(" ").trim();
  }, [color, memory, selectedProduct?.name, sim]);

  const finalSku = sku.trim() ? normalizeSku(sku) : suggestedSku;
  const finalTitle = title.trim() || suggestedTitle;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!productId || !finalSku || !finalTitle || !price) {
        throw new Error("Выберите карточку и заполните SKU, название позиции и цену.");
      }

      const response = await fetch(`/api/admin/products/${productId}/variants`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sku: finalSku,
          slug: slugify(finalSku),
          title: finalTitle,
          memory: memory.trim(),
          color: color.trim(),
          colorHex: colorHex.trim(),
          sim: sim.trim(),
          price: Number(price),
          oldPrice: oldPrice ? Number(oldPrice) : null,
          stock: stock ? Number(stock) : 0,
          status,
        }),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.error ?? "Не удалось создать позицию.");
      }

      router.push(selectedProduct ? `/nz-console/products/${selectedProduct.slug}` : "/nz-console/positions");
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
        Сначала создайте материнскую карточку товара. После этого сюда можно будет добавить конкретную SKU-позицию.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <section className="rounded-[34px] border border-white/10 bg-white/[0.035] p-6 sm:p-8">
        <SectionTitle
          label="Новая позиция"
          title="Добавить SKU"
          text="Позиция — это конкретный товар, который продаётся: память, цвет, SIM, цена, старая цена и остаток. Она обязательно привязывается к материнской карточке."
        />

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          <Field label="Материнская карточка">
            <select value={productId} onChange={(event) => setProductId(event.target.value)} className={inputClass}>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name} · {product.brand}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Артикул / SKU">
            <input
              value={sku}
              onChange={(event) => setSku(event.target.value.toUpperCase())}
              placeholder="Например: IP17PRO-256-BLACK-ESIM"
              className={inputClass}
            />
          </Field>

          <Field label="Название позиции">
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Например: iPhone 17 Pro 256 GB Black eSIM"
              className={inputClass}
            />
          </Field>

          <Field label="Память">
            <input
              value={memory}
              onChange={(event) => setMemory(event.target.value)}
              placeholder="Например: 256 GB"
              className={inputClass}
            />
          </Field>

          <div className="md:col-span-2">
            <ColorPickerField
              color={color}
              colorHex={colorHex}
              onColorChange={setColor}
              onColorHexChange={setColorHex}
              inputClassName={inputClass}
            />
          </div>

          <Field label="SIM">
            <input
              value={sim}
              onChange={(event) => setSim(event.target.value)}
              placeholder="Например: eSIM или SIM + eSIM"
              className={inputClass}
            />
          </Field>

          <Field label="Цена">
            <input
              value={price}
              onChange={(event) => setPrice(event.target.value)}
              inputMode="numeric"
              placeholder="Например: 109990"
              className={inputClass}
            />
          </Field>

          <Field label="Старая цена">
            <input
              value={oldPrice}
              onChange={(event) => setOldPrice(event.target.value)}
              inputMode="numeric"
              placeholder="Например: 119990, если есть скидка"
              className={inputClass}
            />
          </Field>

          <Field label="Остаток">
            <input
              value={stock}
              onChange={(event) => setStock(event.target.value)}
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

        <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-xs leading-relaxed text-white/45">
          <span className="text-white/65">Подсказка:</span> поля теперь пустые и полностью редактируемые. Если SKU или название оставить пустыми, система соберёт их из карточки, памяти, цвета и SIM.
          {finalSku || finalTitle ? (
            <div className="mt-2 text-white/55">
              Будет создано: <span className="font-semibold text-white">{finalSku || "SKU не заполнен"}</span>
              {finalTitle ? <span> · {finalTitle}</span> : null}
            </div>
          ) : null}
        </div>

        {error ? (
          <div className="mt-5 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        ) : null}
      </section>

      <aside className="h-fit rounded-[34px] border border-white/10 bg-white/[0.035] p-6 sm:p-8 lg:sticky lg:top-6">
        <div className="text-sm font-medium uppercase tracking-[0.2em] text-blue-400">
          Сохранение
        </div>

        <h2 className="mt-3 text-3xl font-bold tracking-[-0.04em]">Создать SKU</h2>

        <p className="mt-3 text-sm leading-relaxed text-white/55">
          После сохранения позиция появится у выбранной карточки и будет использоваться для цены, наличия, корзины и заказов.
        </p>

        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full rounded-xl bg-blue-600 px-5 py-4 text-sm font-semibold text-white transition-colors hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Сохраняю..." : "Создать позицию →"}
        </button>
      </aside>
    </form>
  );
}

function SectionTitle({ label, title, text }: { label: string; title: string; text: string }) {
  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-400">{label}</div>
      <h2 className="mt-2 text-3xl font-bold tracking-[-0.04em] text-white">{title}</h2>
      <p className="mt-3 max-w-[760px] text-sm leading-relaxed text-white/55">{text}</p>
    </div>
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
