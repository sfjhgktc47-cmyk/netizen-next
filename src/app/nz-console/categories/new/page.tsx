import Link from "next/link";

const categoryStatuses = ["Активна", "Черновик", "Скрыта"];

export default function AdminNewCategoryPage() {
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
            <span>новая категория</span>
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
                Новая категория
              </div>

              <h1 className="mt-5 text-5xl font-bold tracking-[-0.055em]">
                Создание категории
              </h1>

              <p className="mt-4 max-w-[760px] text-sm leading-relaxed text-white/55">
                Категория имеет технический ID для системы и нормальное название
                для клиента. Например: <span className="text-white">smartphones</span> →{" "}
                <span className="text-white">Смартфоны</span>.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button className="rounded-xl border border-white/10 bg-white/[0.03] px-6 py-4 text-sm font-medium transition-colors hover:border-blue-500/40 hover:bg-blue-500/10">
                Сохранить черновик
              </button>

              <button className="rounded-xl bg-blue-600 px-6 py-4 text-sm font-medium text-white transition-colors hover:bg-blue-500">
                Создать категорию →
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
                  <input placeholder="Смартфоны" className="admin-input" />
                </Field>

                <Field label="Технический ID / slug">
                  <input placeholder="smartphones" className="admin-input" />
                </Field>

                <Field label="Родительская категория">
                  <select className="admin-input">
                    <option>Нет родителя</option>
                    <option>Электроника</option>
                    <option>Аксессуары</option>
                  </select>
                </Field>

                <Field label="Статус">
                  <select className="admin-input">
                    {categoryStatuses.map((status) => (
                      <option key={status}>{status}</option>
                    ))}
                  </select>
                </Field>
              </div>

              <div className="mt-5">
                <Field label="Описание категории">
                  <textarea
                    placeholder="iPhone, Samsung и другие смартфоны."
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
                    placeholder="Купить смартфоны Apple и Samsung — Netizen"
                    className="admin-input"
                  />
                </Field>

                <Field label="SEO description">
                  <textarea
                    placeholder="Смартфоны Apple, Samsung и других брендов. Актуальные цены, наличие и доставка."
                    className="admin-textarea min-h-[120px]"
                  />
                </Field>

                <Field label="Видимый SEO-текст">
                  <textarea
                    placeholder="В разделе смартфонов собраны актуальные модели для работы, фото, видео и повседневного использования."
                    className="admin-textarea min-h-[160px]"
                  />
                </Field>
              </div>
            </section>

            <section className="rounded-[34px] border border-white/10 bg-white/[0.035] p-8">
              <SectionTitle
                label="Фильтры"
                title="Фильтры категории"
                text="Позже эти поля будут подставляться автоматически по шаблону категории."
              />

              <div className="mt-8 grid gap-4">
                <FilterRow name="Бренд" keyName="brand" active />
                <FilterRow name="Цена" keyName="price" active />
                <FilterRow name="Память" keyName="memory" />
                <FilterRow name="Цвет" keyName="color" />
              </div>

              <button className="mt-6 rounded-xl border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-medium transition-colors hover:border-blue-500/40 hover:bg-blue-500/10">
                Добавить фильтр →
              </button>
            </section>
          </div>

          <aside className="space-y-8">
            <section className="rounded-[34px] border border-white/10 bg-white/[0.035] p-8">
              <SectionTitle
                label="Пример"
                title="Как увидит клиент"
                text="Технические значения не показываются клиенту."
              />

              <div className="mt-6 grid gap-3">
                <InfoLine label="URL" value="/catalog/smartphones" />
                <InfoLine label="Название" value="Смартфоны" />
                <InfoLine label="ID в системе" value="smartphones" />
                <InfoLine label="Статус" value="Активна" />
              </div>
            </section>

            <section className="rounded-[34px] border border-blue-500/25 bg-blue-500/10 p-8">
              <div className="text-sm font-medium uppercase tracking-[0.2em] text-blue-400">
                Важно
              </div>

              <h2 className="mt-3 text-3xl font-bold tracking-[-0.04em]">
                ID и название разные
              </h2>

              <p className="mt-4 text-sm leading-relaxed text-white/55">
                В коде и БД хранится технический ключ, например smartphones.
                Клиент видит нормальное название: Смартфоны. Так интерфейс не
                будет показывать технические слова.
              </p>
            </section>

            <div className="grid gap-3">
              <button className="rounded-xl bg-blue-600 px-5 py-4 text-sm font-medium text-white transition-colors hover:bg-blue-500">
                Создать категорию
              </button>

              <Link
                href="/nz-console/categories"
                className="rounded-xl border border-white/10 bg-white/[0.03] px-5 py-4 text-center text-sm font-medium transition-colors hover:border-blue-500/40 hover:bg-blue-500/10"
              >
                Отмена
              </Link>
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