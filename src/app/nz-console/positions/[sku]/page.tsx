import Link from "next/link";
import { notFound } from "next/navigation";
import { productCards } from "@/data/product-cards";
import { productPositions } from "@/data/product-positions";
import { categories } from "@/data/categories";

const statuses = ["В продаже", "Нет в наличии", "Под заказ", "Скрыта"];

const stockPlaces = ["Основной склад", "Под заказ", "Поставщик", "ПВЗ"];

function getCategoryName(categoryId: string) {
  return (
    categories.find((category) => category.id === categoryId)?.name ??
    categoryId
  );
}

function getStatusByStock(stock: number) {
  if (stock > 0) {
    return "В продаже";
  }

  return "Нет в наличии";
}

function getStatusClass(status: string) {
  if (status === "В продаже") {
    return "border-green-500/35 bg-green-500/10 text-green-300";
  }

  if (status === "Нет в наличии") {
    return "border-orange-500/35 bg-orange-500/10 text-orange-300";
  }

  if (status === "Под заказ") {
    return "border-blue-500/35 bg-blue-500/10 text-blue-400";
  }

  return "border-white/10 bg-white/[0.03] text-white/45";
}

export default async function AdminPositionDetailPage({
  params,
}: {
  params: Promise<{ sku: string }>;
}) {
  const { sku } = await params;
  const decodedSku = decodeURIComponent(sku);

  const position = productPositions.find((item) => item.sku === decodedSku);

  if (!position) {
    notFound();
  }

  const product = productCards.find(
    (item) => item.slug === position.modelSlug
  );

  if (!product) {
    notFound();
  }

  const status = getStatusByStock(position.stock);

  const positionTitle = `${product.name} ${position.memory} ${position.color} ${position.sim}`;

  return (
    <main className="min-h-screen bg-[#020814] px-6 py-6 text-white">
      <div className="mx-auto max-w-[1440px]">
        <header className="flex min-h-[76px] items-center justify-between rounded-2xl border border-white/10 bg-white/[0.035] px-6">
          <Link
            href="/nz-console"
            className="text-xl font-bold tracking-[-0.04em]"
          >
            Netizen Console
          </Link>

          <div className="hidden items-center gap-3 text-sm text-white/55 md:flex">
            <span>Позиция / SKU</span>
            <span>·</span>
            <span>{position.sku}</span>
          </div>

          <Link
            href="/nz-console/positions"
            className="rounded-xl border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-medium transition-colors hover:border-blue-500/40 hover:bg-blue-500/10"
          >
            К позициям →
          </Link>
        </header>

        <section className="mt-10">
          <Link
            href="/nz-console/positions"
            className="text-sm text-blue-400 transition-colors hover:text-blue-300"
          >
            ← Назад к позициям
          </Link>

          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
            <div className="rounded-[34px] border border-white/10 bg-white/[0.035] p-8">
              <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                <div className="flex items-start gap-5">
                  <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-3xl bg-white/[0.045] text-xs text-white/25">
                    Фото
                  </div>

                  <div>
                    <div className="text-sm font-medium uppercase tracking-[0.2em] text-blue-400">
                      Конкретная позиция
                    </div>

                    <h1 className="mt-3 text-5xl font-bold tracking-[-0.055em]">
                      {positionTitle}
                    </h1>

                    <p className="mt-4 max-w-[720px] text-sm leading-relaxed text-white/55">
                      Это конкретный товар внутри материнской карточки. Здесь
                      живёт SKU, цена, наличие и значения параметров.
                    </p>
                  </div>
                </div>

                <span
                  className={`inline-flex w-fit whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium ${getStatusClass(
                    status
                  )}`}
                >
                  {status}
                </span>
              </div>

              <div className="mt-8 grid gap-4 md:grid-cols-4">
                <InfoCard label="SKU" value={position.sku} />
                <InfoCard label="Цена" value={position.price} />
                <InfoCard label="Наличие" value={`${position.stock} шт.`} />
                <InfoCard label="Карточка" value={product.name} />
              </div>
            </div>

            <aside className="rounded-[34px] border border-white/10 bg-white/[0.035] p-8">
              <div className="text-sm font-medium uppercase tracking-[0.2em] text-blue-400">
                Действия
              </div>

              <h2 className="mt-3 text-3xl font-bold tracking-[-0.04em]">
                Управление
              </h2>

              <div className="mt-6 grid gap-3">
                <button className="rounded-xl bg-blue-600 px-5 py-4 text-sm font-medium text-white transition-colors hover:bg-blue-500">
                  Сохранить изменения
                </button>

                <Link
                  href={`/nz-console/products/${product.slug}`}
                  className="rounded-xl border border-white/10 bg-white/[0.03] px-5 py-4 text-center text-sm font-medium transition-colors hover:border-blue-500/40 hover:bg-blue-500/10"
                >
                  Открыть карточку
                </Link>

                <button className="rounded-xl border border-white/10 bg-white/[0.03] px-5 py-4 text-sm font-medium text-white/55 transition-colors hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-300">
                  Скрыть позицию
                </button>
              </div>
            </aside>
          </div>
        </section>

        <section className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
          <div className="space-y-8">
            <section className="rounded-[34px] border border-white/10 bg-white/[0.035] p-8">
              <SectionTitle
                label="Связь"
                title="Материнская карточка"
                text="Позиция всегда относится к одной материнской карточке товара."
              />

              <div className="mt-8 grid gap-5 md:grid-cols-2">
                <Field label="Материнская карточка">
                  <select className="admin-input" defaultValue={product.slug}>
                    {productCards.map((card) => (
                      <option key={card.slug} value={card.slug}>
                        {card.name}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="SEO slug позиции">
                  <input
                    defaultValue={`${position.memory}-${position.color}-${position.sim}`
                      .toLowerCase()
                      .replaceAll(" ", "-")
                      .replaceAll("+", "plus")}
                    className="admin-input"
                  />
                </Field>

                <Field label="Категория">
                  <input
                    defaultValue={getCategoryName(product.category)}
                    className="admin-input"
                  />
                </Field>

                <Field label="Бренд">
                  <input defaultValue={product.brand} className="admin-input" />
                </Field>
              </div>
            </section>

            <section className="rounded-[34px] border border-white/10 bg-white/[0.035] p-8">
              <SectionTitle
                label="Позиция"
                title="Основная информация"
                text="Название и артикул конкретной конфигурации. Эти данные будут использоваться в учёте, корзине, заказах и XLSX-импорте."
              />

              <div className="mt-8 grid gap-5 md:grid-cols-2">
                <Field label="Название позиции">
                  <input defaultValue={positionTitle} className="admin-input" />
                </Field>

                <Field label="SKU / артикул">
                  <input defaultValue={position.sku} className="admin-input" />
                </Field>

                <Field label="Статус позиции">
                  <select className="admin-input" defaultValue={status}>
                    {statuses.map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                  </select>
                </Field>

                <Field label="Склад / источник">
                  <select className="admin-input" defaultValue="Основной склад">
                    {stockPlaces.map((place) => (
                      <option key={place}>{place}</option>
                    ))}
                  </select>
                </Field>
              </div>
            </section>

            <section className="rounded-[34px] border border-white/10 bg-white/[0.035] p-8">
              <SectionTitle
                label="Значения параметров"
                title="Значения для этой позиции"
                text="Материнская карточка задаёт параметры выбора, а позиция заполняет значения."
              />

              <div className="mt-8 rounded-2xl border border-blue-500/25 bg-blue-500/10 p-5">
                <div className="font-semibold text-blue-400">
                  Параметры берутся из карточки
                </div>

                <p className="mt-2 text-sm leading-relaxed text-white/55">
                  Например, карточка задаёт “Цвет / Память / SIM”, а эта
                  позиция заполняет: {position.color} / {position.memory} /{" "}
                  {position.sim}.
                </p>
              </div>

              <div className="mt-8 grid gap-5 md:grid-cols-3">
                <Field label="Цвет">
                  <input defaultValue={position.color} className="admin-input" />
                </Field>

                <Field label="Память">
                  <input
                    defaultValue={position.memory}
                    className="admin-input"
                  />
                </Field>

                <Field label="SIM">
                  <input defaultValue={position.sim} className="admin-input" />
                </Field>

                <Field label="Доп. параметр 1">
                  <input placeholder="Например: CPU / GPU" className="admin-input" />
                </Field>

                <Field label="Доп. параметр 2">
                  <input placeholder="Например: RAM / SSD" className="admin-input" />
                </Field>

                <Field label="Цвет HEX">
                  <input placeholder="#d1d5db" className="admin-input" />
                </Field>
              </div>
            </section>

            <section className="rounded-[34px] border border-white/10 bg-white/[0.035] p-8">
              <SectionTitle
                label="Цена и наличие"
                title="Стоимость позиции"
                text="Цена, старая цена и остаток относятся именно к позиции, а не к материнской карточке."
              />

              <div className="mt-8 grid gap-5 md:grid-cols-3">
                <Field label="Цена">
                  <input defaultValue={position.price} className="admin-input" />
                </Field>

                <Field label="Цена до акции">
                  <input placeholder="Например: 119 990 ₽" className="admin-input" />
                </Field>

                <Field label="Наличие, шт.">
                  <input
                    defaultValue={String(position.stock)}
                    className="admin-input"
                  />
                </Field>

                <Field label="Срок поставки">
                  <input defaultValue="1-2 дня" className="admin-input" />
                </Field>

                <Field label="Минимальный заказ">
                  <input defaultValue="1" className="admin-input" />
                </Field>

                <Field label="Резерв">
                  <input defaultValue="0" className="admin-input" />
                </Field>
              </div>
            </section>

            <section className="rounded-[34px] border border-white/10 bg-white/[0.035] p-8">
              <SectionTitle
                label="SEO"
                title="SEO конкретной позиции"
                text="Эти поля формируют страницу конкретной конфигурации."
              />

              <div className="mt-8 grid gap-5">
                <Field label="SEO title">
                  <input
                    defaultValue={`Купить ${positionTitle} — Netizen`}
                    className="admin-input"
                  />
                </Field>

                <Field label="SEO description">
                  <textarea
                    defaultValue={`${positionTitle} — конкретная конфигурация товара. Цена, наличие и доставка.`}
                    className="admin-textarea min-h-[130px]"
                  />
                </Field>

                <Field label="Короткий SEO-текст позиции">
                  <textarea
                    defaultValue={`Эта конфигурация подойдёт тем, кому нужен ${product.name} с параметрами: ${position.memory}, ${position.color}, ${position.sim}.`}
                    className="admin-textarea min-h-[120px]"
                  />
                </Field>
              </div>
            </section>
          </div>

          <aside className="space-y-8">
            <section className="rounded-[34px] border border-white/10 bg-white/[0.035] p-8">
              <SectionTitle
                label="Сводка"
                title="Позиция"
                text="Краткая информация по конкретной SKU-позиции."
              />

              <div className="mt-6 grid gap-3">
                <InfoLine label="SKU" value={position.sku} />
                <InfoLine label="Карточка" value={product.name} />
                <InfoLine label="Категория" value={getCategoryName(product.category)} />
                <InfoLine label="Цена" value={position.price} />
                <InfoLine label="Наличие" value={`${position.stock} шт.`} />
              </div>
            </section>

            <section className="rounded-[34px] border border-blue-500/25 bg-blue-500/10 p-8">
              <div className="text-sm font-medium uppercase tracking-[0.2em] text-blue-400">
                XLSX
              </div>

              <h2 className="mt-3 text-3xl font-bold tracking-[-0.04em]">
                Обновление по SKU
              </h2>

              <p className="mt-4 text-sm leading-relaxed text-white/55">
                Excel-импорт должен обновлять именно позиции: цену, старую цену,
                наличие, статус и значения параметров по SKU.
              </p>
            </section>

            <section className="rounded-[34px] border border-white/10 bg-white/[0.035] p-8">
              <SectionTitle
                label="Связанные разделы"
                title="Куда перейти"
                text="Быстрые переходы по связанным разделам."
              />

              <div className="mt-6 grid gap-3">
                <Link
                  href={`/nz-console/products/${product.slug}`}
                  className="rounded-xl border border-white/10 bg-white/[0.03] px-5 py-4 text-center text-sm font-medium transition-colors hover:border-blue-500/40 hover:bg-blue-500/10"
                >
                  Материнская карточка
                </Link>

                <Link
                  href="/nz-console/positions"
                  className="rounded-xl border border-white/10 bg-white/[0.03] px-5 py-4 text-center text-sm font-medium transition-colors hover:border-blue-500/40 hover:bg-blue-500/10"
                >
                  Все позиции
                </Link>

                <Link
                  href="/nz-console/orders"
                  className="rounded-xl border border-white/10 bg-white/[0.03] px-5 py-4 text-center text-sm font-medium transition-colors hover:border-blue-500/40 hover:bg-blue-500/10"
                >
                  Заявки
                </Link>
              </div>
            </section>

            <div className="grid gap-3">
              <button className="rounded-xl bg-blue-600 px-5 py-4 text-sm font-medium text-white transition-colors hover:bg-blue-500">
                Сохранить изменения
              </button>

              <button className="rounded-xl border border-white/10 bg-white/[0.03] px-5 py-4 text-sm font-medium text-white/55 transition-colors hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-300">
                Скрыть позицию
              </button>
            </div>
          </aside>
        </section>

        <style>{`
          .admin-input {
            height: 52px;
            width: 100%;
            border-radius: 14px;
            border: 1px solid rgba(255,255,255,0.1);
            background: rgba(0,0,0,0.2);
            padding: 0 18px;
            color: white;
            outline: none;
            font-size: 14px;
          }

          .admin-input::placeholder {
            color: rgba(255,255,255,0.35);
          }

          .admin-input:focus {
            border-color: rgba(59,130,246,0.55);
          }

          .admin-textarea {
            width: 100%;
            resize: vertical;
            border-radius: 18px;
            border: 1px solid rgba(255,255,255,0.1);
            background: rgba(0,0,0,0.2);
            padding: 18px;
            color: white;
            outline: none;
            font-size: 14px;
            line-height: 1.6;
          }

          .admin-textarea::placeholder {
            color: rgba(255,255,255,0.35);
          }

          .admin-textarea:focus {
            border-color: rgba(59,130,246,0.55);
          }
        `}</style>
      </div>
    </main>
  );
}

function SectionTitle({
  label,
  title,
  text,
}: {
  label: string;
  title: string;
  text: string;
}) {
  return (
    <div>
      <div className="text-sm font-medium uppercase tracking-[0.2em] text-blue-400">
        {label}
      </div>

      <h2 className="mt-3 text-3xl font-bold tracking-[-0.04em]">{title}</h2>

      <p className="mt-3 max-w-[720px] text-sm leading-relaxed text-white/50">
        {text}
      </p>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <div className="mb-2 text-sm font-medium text-white/70">{label}</div>
      {children}
    </label>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <div className="text-sm text-white/40">{label}</div>
      <div className="mt-2 font-bold">{value}</div>
    </div>
  );
}

function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-5 rounded-2xl border border-white/10 bg-black/20 p-4 text-sm">
      <span className="text-white/45">{label}</span>
      <span className="text-right font-semibold">{value}</span>
    </div>
  );
}