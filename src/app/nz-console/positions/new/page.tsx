import Link from "next/link";
import { productCards } from "@/data/product-cards";

const statuses = ["В продаже", "Нет в наличии", "Под заказ", "Скрыта"];

const simOptions = ["eSIM", "SIM + eSIM", "2 SIM", "Не требуется"];

const stockPlaces = ["Основной склад", "Под заказ", "Поставщик", "ПВЗ"];

export default function AdminNewPositionPage() {
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
            <span>Новая позиция</span>
            <span>·</span>
            <span>SKU / конфигурация</span>
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

          <div className="mt-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="inline-flex rounded-full border border-blue-500/35 bg-blue-500/10 px-4 py-2 text-sm font-medium text-blue-400">
                Добавление SKU
              </div>

              <h1 className="mt-5 text-5xl font-bold tracking-[-0.055em]">
                Новая позиция
              </h1>

              <p className="mt-4 max-w-[760px] text-sm leading-relaxed text-white/55">
                Позиция — это конкретный товар внутри материнской карточки:
                выбранные значения параметров, цена, наличие, SKU и SEO-ссылка.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button className="rounded-xl border border-white/10 bg-white/[0.03] px-6 py-4 text-sm font-medium transition-colors hover:border-blue-500/40 hover:bg-blue-500/10">
                Сохранить черновик
              </button>

              <button className="rounded-xl bg-blue-600 px-6 py-4 text-sm font-medium text-white transition-colors hover:bg-blue-500">
                Создать позицию →
              </button>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
          <div className="space-y-8">
            <section className="rounded-[34px] border border-white/10 bg-white/[0.035] p-8">
              <SectionTitle
                label="Связь"
                title="К какой карточке относится позиция"
                text="Выберите материнскую карточку. Например, позиция “iPhone 17 Pro 256 GB Silver eSIM” относится к карточке “iPhone 17 Pro”."
              />

              <div className="mt-8 grid gap-5 md:grid-cols-2">
                <Field label="Материнская карточка / модель">
                  <select className="admin-input">
                    <option>Выберите карточку</option>
                    {productCards.map((product) => (
                      <option key={product.slug} value={product.slug}>
                        {product.name}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="SEO slug позиции">
                  <input
                    placeholder="256gb-silver-esim"
                    className="admin-input"
                  />
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
                  <input
                    placeholder="iPhone 17 Pro 256 GB Silver eSIM"
                    className="admin-input"
                  />
                </Field>

                <Field label="SKU / артикул">
                  <input
                    placeholder="IP17P-256-SILVER-ESIM"
                    className="admin-input"
                  />
                </Field>

                <Field label="Статус позиции">
                  <select className="admin-input">
                    {statuses.map((status) => (
                      <option key={status}>{status}</option>
                    ))}
                  </select>
                </Field>

                <Field label="Склад / источник">
                  <select className="admin-input">
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
                text="Эти поля заполняют параметры, которые заданы в материнской карточке. Например, карточка iPhone 17 Pro задаёт “Цвет / Память / SIM”, а эта позиция заполняет: Silver / 256 GB / eSIM."
              />

              <div className="mt-8 rounded-2xl border border-blue-500/25 bg-blue-500/10 p-5">
                <div className="font-semibold text-blue-400">
                  Параметры задаются в карточке
                </div>

                <p className="mt-2 text-sm leading-relaxed text-white/55">
                  Сейчас это временный скелет. После подключения БД поля будут
                  подставляться автоматически после выбора материнской карточки.
                  Для iPhone появятся Цвет / Память / SIM, для MacBook —
                  CPU / GPU / RAM / SSD / Цвет.
                </p>
              </div>

              <div className="mt-8 grid gap-5 md:grid-cols-3">
                <Field label="Цвет">
                  <input placeholder="Silver" className="admin-input" />
                </Field>

                <Field label="Цвет HEX">
                  <input placeholder="#d1d5db" className="admin-input" />
                </Field>

                <Field label="Память">
                  <input placeholder="256 GB" className="admin-input" />
                </Field>

                <Field label="SIM">
                  <select className="admin-input">
                    {simOptions.map((sim) => (
                      <option key={sim}>{sim}</option>
                    ))}
                  </select>
                </Field>

                <Field label="Значение параметра 1">
                  <input
                    placeholder="Например: M4 Pro / USB-C / Complete"
                    className="admin-input"
                  />
                </Field>

                <Field label="Значение параметра 2">
                  <input
                    placeholder="Например: 16 GB RAM / кейс / комплект"
                    className="admin-input"
                  />
                </Field>
              </div>
            </section>

            <section className="rounded-[34px] border border-white/10 bg-white/[0.035] p-8">
              <SectionTitle
                label="Цена и наличие"
                title="Стоимость позиции"
                text="Цена, цена до акции и остаток относятся именно к позиции, а не к материнской карточке."
              />

              <div className="mt-8 grid gap-5 md:grid-cols-3">
                <Field label="Цена">
                  <input placeholder="109990" className="admin-input" />
                </Field>

                <Field label="Цена до акции">
                  <input placeholder="119990" className="admin-input" />
                </Field>

                <Field label="Наличие, шт.">
                  <input placeholder="4" className="admin-input" />
                </Field>

                <Field label="Срок поставки">
                  <input placeholder="1-2 дня" className="admin-input" />
                </Field>

                <Field label="Минимальный заказ">
                  <input placeholder="1" className="admin-input" />
                </Field>

                <Field label="Резерв">
                  <input placeholder="0" className="admin-input" />
                </Field>
              </div>
            </section>

            <section className="rounded-[34px] border border-white/10 bg-white/[0.035] p-8">
              <SectionTitle
                label="SEO"
                title="SEO для конкретной позиции"
                text="Эти поля формируют страницу конкретной конфигурации. Например: /product/iphone-17-pro/256gb-silver-esim."
              />

              <div className="mt-8 grid gap-5">
                <Field label="SEO title">
                  <input
                    placeholder="Купить iPhone 17 Pro 256 GB Silver eSIM — Netizen"
                    className="admin-input"
                  />
                </Field>

                <Field label="SEO description">
                  <textarea
                    placeholder="iPhone 17 Pro 256 GB Silver eSIM — версия с памятью 256 GB, цветом Silver и поддержкой eSIM. Цена, наличие и доставка по Москве и Санкт-Петербургу."
                    className="admin-textarea min-h-[130px]"
                  />
                </Field>

                <Field label="Короткий SEO-текст позиции">
                  <textarea
                    placeholder="Эта конфигурация подойдёт тем, кому нужен iPhone 17 Pro с памятью 256 GB, цветом Silver и поддержкой eSIM."
                    className="admin-textarea min-h-[120px]"
                  />
                </Field>
              </div>
            </section>
          </div>

          <aside className="space-y-6">
            <section className="sticky top-6 space-y-6">
              <div className="rounded-[34px] border border-white/10 bg-white/[0.035] p-8">
                <div className="text-sm font-medium uppercase tracking-[0.2em] text-blue-400">
                  Структура
                </div>

                <h2 className="mt-3 text-3xl font-bold tracking-[-0.04em]">
                  Как это работает
                </h2>

                <div className="mt-6 space-y-3 text-sm text-white/55">
                  <InfoBox
                    title="Карточка товара"
                    text="iPhone 17 Pro — то, что клиент видит в каталоге."
                  />

                  <InfoBox
                    title="Позиция / SKU"
                    text="iPhone 17 Pro 256 GB Silver eSIM — конкретная конфигурация с ценой и наличием."
                  />

                  <InfoBox
                    title="Связь"
                    text="Позиция выбирает материнскую карточку через поле “модель”."
                  />
                </div>
              </div>

              <div className="rounded-[34px] border border-blue-500/25 bg-blue-500/10 p-6">
                <div className="font-semibold text-blue-400">XLSX</div>

                <p className="mt-2 text-sm leading-relaxed text-white/55">
                  Excel-импорт будет обновлять позиции по SKU: цену, старую
                  цену, наличие, статус и значения параметров.
                </p>
              </div>

              <div className="rounded-[34px] border border-white/10 bg-white/[0.035] p-8">
                <div className="text-sm font-medium uppercase tracking-[0.2em] text-blue-400">
                  Публикация
                </div>

                <h2 className="mt-3 text-3xl font-bold tracking-[-0.04em]">
                  Готовность
                </h2>

                <div className="mt-5 h-3 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full w-[72%] rounded-full bg-blue-600" />
                </div>

                <p className="mt-3 text-sm leading-relaxed text-white/55">
                  Для позиции нужны: модель, SKU, цена, наличие, значения
                  параметров и SEO slug.
                </p>
              </div>

              <div className="grid gap-3">
                <button className="rounded-xl bg-blue-600 px-5 py-4 text-sm font-medium text-white transition-colors hover:bg-blue-500">
                  Создать позицию
                </button>

                <button className="rounded-xl border border-white/10 bg-white/[0.03] px-5 py-4 text-sm font-medium transition-colors hover:border-blue-500/40 hover:bg-blue-500/10">
                  Сохранить черновик
                </button>
              </div>
            </section>
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

function InfoBox({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <div className="font-semibold text-white">{title}</div>
      <p className="mt-2 leading-relaxed">{text}</p>
    </div>
  );
}