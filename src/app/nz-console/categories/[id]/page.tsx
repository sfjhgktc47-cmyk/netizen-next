import Link from "next/link";
import { notFound } from "next/navigation";
import { categories } from "@/data/categories";
import { productCards } from "@/data/product-cards";

const categoryStatuses = ["Активна", "Черновик", "Скрыта"];

const categoryDetails: Record<
  string,
  {
    status: string;
    parent: string;
    seoTitle: string;
    seoDescription: string;
    seoText: string;
    filters: {
      name: string;
      keyName: string;
      active: boolean;
    }[];
  }
> = {
  smartphones: {
    status: "Активна",
    parent: "Нет родителя",
    seoTitle: "Купить смартфоны Apple и Samsung — Netizen",
    seoDescription:
      "Смартфоны Apple, Samsung и других брендов. Актуальные цены, наличие и доставка.",
    seoText:
      "В разделе смартфонов собраны актуальные модели для работы, фото, видео и повседневного использования.",
    filters: [
      { name: "Бренд", keyName: "brand", active: true },
      { name: "Цена", keyName: "price", active: true },
      { name: "Память", keyName: "memory", active: true },
      { name: "Цвет", keyName: "color", active: true },
    ],
  },
  laptops: {
    status: "Активна",
    parent: "Нет родителя",
    seoTitle: "Купить ноутбуки — Netizen",
    seoDescription:
      "Ноутбуки для работы, учёбы и творчества. MacBook и другие модели.",
    seoText:
      "В категории ноутбуков собраны устройства для работы, бизнеса, дизайна и повседневных задач.",
    filters: [
      { name: "Бренд", keyName: "brand", active: true },
      { name: "Цена", keyName: "price", active: true },
      { name: "Процессор", keyName: "cpu", active: true },
      { name: "Оперативная память", keyName: "ram", active: true },
      { name: "SSD", keyName: "ssd", active: true },
    ],
  },
  headphones: {
    status: "Активна",
    parent: "Нет родителя",
    seoTitle: "Купить наушники — Netizen",
    seoDescription:
      "Беспроводные наушники, AirPods и другие модели с быстрой доставкой.",
    seoText:
      "В категории наушников собраны модели для музыки, звонков, работы и путешествий.",
    filters: [
      { name: "Бренд", keyName: "brand", active: true },
      { name: "Цена", keyName: "price", active: true },
      { name: "Тип подключения", keyName: "connection", active: false },
    ],
  },
};

function getProductCount(categoryId: string) {
  return productCards.filter((product) => product.category === categoryId)
    .length;
}

export default async function AdminCategoryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const category = categories.find((item) => item.id === id);

  if (!category) {
    notFound();
  }

  const details =
    categoryDetails[category.id] ??
    ({
      status: "Активна",
      parent: "Нет родителя",
      seoTitle: `${category.name} — Netizen`,
      seoDescription: category.description ?? "",
      seoText: category.description ?? "",
      filters: [
        { name: "Бренд", keyName: "brand", active: true },
        { name: "Цена", keyName: "price", active: true },
      ],
    } satisfies (typeof categoryDetails)[string]);

  const productCount = getProductCount(category.id);

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
            <span>Категории</span>
            <span>·</span>
            <span>{category.name}</span>
          </div>

          <Link
            href="/nz-console/categories"
            className="rounded-xl border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-medium transition-colors hover:border-blue-500/40 hover:bg-blue-500/10"
          >
            К категориям →
          </Link>
        </header>

        <section className="mt-10">
          <Link
            href="/nz-console/categories"
            className="text-sm text-blue-400 transition-colors hover:text-blue-300"
          >
            ← Назад к категориям
          </Link>

          <div className="mt-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="inline-flex rounded-full border border-blue-500/35 bg-blue-500/10 px-4 py-2 text-sm font-medium text-blue-400">
                Редактирование категории
              </div>

              <h1 className="mt-5 text-5xl font-bold tracking-[-0.055em]">
                {category.name}
              </h1>

              <p className="mt-4 max-w-[760px] text-sm leading-relaxed text-white/55">
                Категория имеет технический ID для системы и нормальное название
                для клиента. Сейчас редактируем категорию{" "}
                <span className="text-white">{category.id}</span> →{" "}
                <span className="text-white">{category.name}</span>.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button className="rounded-xl border border-white/10 bg-white/[0.03] px-6 py-4 text-sm font-medium transition-colors hover:border-blue-500/40 hover:bg-blue-500/10">
                Сохранить черновик
              </button>

              <button className="rounded-xl bg-blue-600 px-6 py-4 text-sm font-medium text-white transition-colors hover:bg-blue-500">
                Сохранить изменения →
              </button>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
          <div className="space-y-8">
            <section className="rounded-[34px] border border-white/10 bg-white/[0.035] p-8">
              <SectionTitle
                label="Категория"
                title="Основная информация"
                text="Эти данные используются в каталоге, фильтрах, карточках товара и URL."
              />

              <div className="mt-8 grid gap-5 md:grid-cols-2">
                <Field label="Название для клиента">
                  <input defaultValue={category.name} className="admin-input" />
                </Field>

                <Field label="Технический ID / slug">
                  <input defaultValue={category.id} className="admin-input" />
                </Field>

                <Field label="Родительская категория">
                  <select className="admin-input" defaultValue={details.parent}>
                    <option>Нет родителя</option>
                    <option>Электроника</option>
                    <option>Аксессуары</option>
                  </select>
                </Field>

                <Field label="Статус">
                  <select className="admin-input" defaultValue={details.status}>
                    {categoryStatuses.map((status) => (
                      <option key={status}>{status}</option>
                    ))}
                  </select>
                </Field>
              </div>

              <div className="mt-5">
                <Field label="Описание категории">
                  <textarea
                    defaultValue={category.description ?? ""}
                    className="admin-textarea min-h-[130px]"
                  />
                </Field>
              </div>
            </section>

            <section className="rounded-[34px] border border-white/10 bg-white/[0.035] p-8">
              <SectionTitle
                label="Витрина"
                title="Как показывать категорию"
                text="Настройки отображения категории на сайте."
              />

              <div className="mt-8 grid gap-4 md:grid-cols-2">
                <ToggleCard
                  title="Показывать в каталоге"
                  text="Категория будет доступна в основном каталоге сайта."
                  active
                />

                <ToggleCard
                  title="Показывать на главной"
                  text="Категория сможет отображаться в блоке категорий на главной."
                  active
                />

                <ToggleCard
                  title="Показывать в меню"
                  text="Категория появится в навигации сайта."
                  active
                />

                <ToggleCard
                  title="SEO-текст внизу"
                  text="Показывать текстовый SEO-блок внизу страницы категории."
                />
              </div>
            </section>

            <section className="rounded-[34px] border border-white/10 bg-white/[0.035] p-8">
              <SectionTitle
                label="SEO"
                title="SEO категории"
                text="Поля для поисковой выдачи и видимого SEO-блока категории."
              />

              <div className="mt-8 grid gap-5">
                <Field label="SEO title">
                  <input
                    defaultValue={details.seoTitle}
                    className="admin-input"
                  />
                </Field>

                <Field label="SEO description">
                  <textarea
                    defaultValue={details.seoDescription}
                    className="admin-textarea min-h-[120px]"
                  />
                </Field>

                <Field label="Видимый SEO-текст">
                  <textarea
                    defaultValue={details.seoText}
                    className="admin-textarea min-h-[160px]"
                  />
                </Field>
              </div>
            </section>

            <section className="rounded-[34px] border border-white/10 bg-white/[0.035] p-8">
              <SectionTitle
                label="Фильтры"
                title="Фильтры категории"
                text="Фильтры используются в каталоге и будут подтягиваться из характеристик товаров."
              />

              <div className="mt-8 grid gap-4">
                {details.filters.map((filter) => (
                  <FilterRow
                    key={filter.keyName}
                    name={filter.name}
                    keyName={filter.keyName}
                    active={filter.active}
                  />
                ))}
              </div>

              <button className="mt-6 rounded-xl border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-medium transition-colors hover:border-blue-500/40 hover:bg-blue-500/10">
                Добавить фильтр →
              </button>
            </section>
          </div>

          <aside className="space-y-8">
            <section className="rounded-[34px] border border-white/10 bg-white/[0.035] p-8">
              <SectionTitle
                label="Сводка"
                title="Категория"
                text="Краткая информация по текущей категории."
              />

              <div className="mt-6 grid gap-3">
                <InfoLine label="URL" value={`/catalog/${category.id}`} />
                <InfoLine label="Название" value={category.name} />
                <InfoLine label="ID в системе" value={category.id} />
                <InfoLine label="Статус" value={details.status} />
                <InfoLine label="Карточек" value={String(productCount)} />
              </div>
            </section>

            <section className="rounded-[34px] border border-blue-500/25 bg-blue-500/10 p-8">
              <div className="text-sm font-medium uppercase tracking-[0.2em] text-blue-400">
                Важно
              </div>

              <h2 className="mt-3 text-3xl font-bold tracking-[-0.04em]">
                Не ломаем slug без причины
              </h2>

              <p className="mt-4 text-sm leading-relaxed text-white/55">
                Технический ID категории участвует в URL и связях с товарами.
                Если поменять slug, надо будет обновить ссылки, товары и SEO.
              </p>
            </section>

            <section className="rounded-[34px] border border-white/10 bg-white/[0.035] p-8">
              <SectionTitle
                label="Связанные разделы"
                title="Куда перейти"
                text="Быстрые переходы по связанным разделам админки."
              />

              <div className="mt-6 grid gap-3">
                <Link
                  href="/nz-console/products"
                  className="rounded-xl border border-white/10 bg-white/[0.03] px-5 py-4 text-center text-sm font-medium transition-colors hover:border-blue-500/40 hover:bg-blue-500/10"
                >
                  Карточки товаров
                </Link>

                <Link
                  href="/nz-console/positions"
                  className="rounded-xl border border-white/10 bg-white/[0.03] px-5 py-4 text-center text-sm font-medium transition-colors hover:border-blue-500/40 hover:bg-blue-500/10"
                >
                  Позиции / SKU
                </Link>

                <Link
                  href="/nz-console/site-editor"
                  className="rounded-xl border border-white/10 bg-white/[0.03] px-5 py-4 text-center text-sm font-medium transition-colors hover:border-blue-500/40 hover:bg-blue-500/10"
                >
                  Редактор сайта
                </Link>
              </div>
            </section>

            <div className="grid gap-3">
              <button className="rounded-xl bg-blue-600 px-5 py-4 text-sm font-medium text-white transition-colors hover:bg-blue-500">
                Сохранить изменения
              </button>

              <button className="rounded-xl border border-white/10 bg-white/[0.03] px-5 py-4 text-sm font-medium text-white/55 transition-colors hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-300">
                Скрыть категорию
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

function ToggleCard({
  title,
  text,
  active = false,
}: {
  title: string;
  text: string;
  active?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="font-semibold">{title}</div>
          <p className="mt-2 text-sm leading-relaxed text-white/45">{text}</p>
        </div>

        <span
          className={`flex h-7 w-12 shrink-0 items-center rounded-full p-1 ${
            active ? "bg-blue-600" : "bg-white/10"
          }`}
        >
          <span
            className={`h-5 w-5 rounded-full bg-white transition-transform ${
              active ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </span>
      </div>
    </div>
  );
}

function FilterRow({
  name,
  keyName,
  active = false,
}: {
  name: string;
  keyName: string;
  active?: boolean;
}) {
  return (
    <div className="grid gap-3 rounded-2xl border border-white/10 bg-black/20 p-4 md:grid-cols-[1fr_1fr_140px] md:items-center">
      <input defaultValue={name} className="admin-input" />
      <input defaultValue={keyName} className="admin-input" />

      <button
        className={`rounded-xl border px-4 py-3 text-sm font-medium ${
          active
            ? "border-blue-500/35 bg-blue-500/10 text-blue-400"
            : "border-white/10 bg-white/[0.03] text-white/45"
        }`}
      >
        {active ? "Активен" : "Скрыт"}
      </button>
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