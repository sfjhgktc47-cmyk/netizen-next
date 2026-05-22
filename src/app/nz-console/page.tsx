import Link from "next/link";

const adminSections = [
  {
    title: "Карточки товаров",
    description:
      "Материнские карточки, которые видит клиент: iPhone 17 Pro, MacBook Pro 14, AirPods Pro.",
    href: "/nz-console/products",
    value: "3",
    label: "карточки",
  },
  {
    title: "Позиции / SKU",
    description:
      "Конкретные конфигурации с ценой, наличием и SKU: память, цвет, SIM, склад.",
    href: "/nz-console/positions",
    value: "4",
    label: "позиции",
  },
  {
    title: "Заявки",
    description: "Корзина, новые заказы, статусы и подтверждение клиентов.",
    href: "/nz-console/orders",
    value: "4",
    label: "новые",
  },
  {
    title: "Обращения",
    description:
      "Единый центр коммуникации: темы, диалоги и связь с заявками.",
    href: "/nz-console/support",
    value: "7",
    label: "в работе",
  },
  {
    title: "Категории",
    description: "Категории каталога, SEO-страницы и структура витрины.",
    href: "/nz-console/categories",
    value: "12",
    label: "категорий",
  },
  {
    title: "Клиенты",
    description:
      "Клиентская база, заявки, обращения, адреса и история покупок.",
    href: "/nz-console/users",
    value: "3",
    label: "клиента",
  },
  {
    title: "Редактор сайта",
    description:
      "Витрина сайта: логотипы, цвета, hero, блоки главной, каталог и страница товара.",
    href: "/nz-console/site-editor",
    value: "8",
    label: "блоков",
  },
  {
    title: "Настройки",
    description: "Интеграции, роли, доставка, уведомления и безопасность.",
    href: "/nz-console/settings",
    value: "⚙",
    label: "система",
  },
];

const recentActions = [
  {
    title: "Создана карточка",
    text: "iPhone 17 Pro · материнская карточка товара",
    time: "Сегодня",
  },
  {
    title: "Добавлена позиция",
    text: "iPhone 17 Pro 256 GB Silver eSIM · 109 990 ₽ · 4 шт.",
    time: "Сегодня",
  },
  {
    title: "Новая заявка",
    text: "iPhone 17 Pro · Москва · ожидает подтверждения",
    time: "2 мин назад",
  },
  {
    title: "Обращение в поддержку",
    text: "Тема: Подбор техники",
    time: "12 мин назад",
  },
];

export default function AdminDashboardPage() {
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
            <span>Панель управления</span>
            <span>·</span>
            <span>тестовый режим</span>
          </div>

          <Link
            href="/"
            className="rounded-xl border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-medium transition-colors hover:border-blue-500/40 hover:bg-blue-500/10"
          >
            На сайт →
          </Link>
        </header>

        <section className="mt-10 grid gap-8 lg:grid-cols-[1fr_360px]">
          <div className="rounded-[34px] border border-white/10 bg-white/[0.035] p-8">
            <div className="inline-flex rounded-full border border-blue-500/35 bg-blue-500/10 px-4 py-2 text-sm font-medium text-blue-400">
              Админ-панель
            </div>

            <h1 className="mt-6 max-w-[760px] text-5xl font-bold tracking-[-0.055em] md:text-6xl">
              Управление магазином
            </h1>

            <p className="mt-5 max-w-[720px] text-sm leading-relaxed text-white/55">
              Здесь будет управление карточками товаров, позициями / SKU,
              заявками, категориями, обращениями клиентов, витриной сайта,
              ролями и системными настройками.
            </p>

            <div className="mt-8 grid gap-4 md:grid-cols-4">
              <MetricCard label="Карточки" value="3" />
              <MetricCard label="Позиции / SKU" value="4" />
              <MetricCard label="Заявки сегодня" value="4" />
              <MetricCard label="Обращения" value="7" />
            </div>
          </div>

          <aside className="rounded-[34px] border border-white/10 bg-white/[0.035] p-8">
            <div className="text-sm font-medium uppercase tracking-[0.2em] text-blue-400">
              Быстрые действия
            </div>

            <h2 className="mt-3 text-3xl font-bold tracking-[-0.04em]">
              Что делаем
            </h2>

            <div className="mt-6 grid gap-3">
              <Link
                href="/nz-console/products/new"
                className="rounded-xl bg-blue-600 px-5 py-4 text-center text-sm font-medium text-white transition-colors hover:bg-blue-500"
              >
                Создать карточку →
              </Link>

              <Link
                href="/nz-console/positions/new"
                className="rounded-xl border border-white/10 bg-white/[0.03] px-5 py-4 text-center text-sm font-medium transition-colors hover:border-blue-500/40 hover:bg-blue-500/10"
              >
                Добавить позицию
              </Link>

              <Link
                href="/nz-console/orders"
                className="rounded-xl border border-white/10 bg-white/[0.03] px-5 py-4 text-center text-sm font-medium transition-colors hover:border-blue-500/40 hover:bg-blue-500/10"
              >
                Смотреть заявки
              </Link>

              <Link
                href="/nz-console/site-editor"
                className="rounded-xl border border-white/10 bg-white/[0.03] px-5 py-4 text-center text-sm font-medium transition-colors hover:border-blue-500/40 hover:bg-blue-500/10"
              >
                Редактор сайта
              </Link>
            </div>

            <div className="mt-8 rounded-2xl border border-blue-500/25 bg-blue-500/10 p-5">
              <div className="font-semibold text-blue-400">Важно</div>

              <p className="mt-2 text-sm leading-relaxed text-white/55">
                Карточка — это то, что видит клиент. Позиция / SKU — это
                конкретная конфигурация с ценой, наличием и складом.
              </p>
            </div>
          </aside>
        </section>

        <section className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {adminSections.map((section) => (
            <Link
              key={section.href}
              href={section.href}
              className="group rounded-[30px] border border-white/10 bg-white/[0.035] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-blue-500/35 hover:bg-blue-500/[0.05]"
            >
              <div className="flex items-start justify-between gap-5">
                <div>
                  <h2 className="text-2xl font-bold tracking-[-0.035em]">
                    {section.title}
                  </h2>

                  <p className="mt-3 min-h-[72px] text-sm leading-relaxed text-white/55">
                    {section.description}
                  </p>
                </div>

                <div className="shrink-0 rounded-2xl border border-blue-500/30 bg-blue-500/10 px-4 py-3 text-center">
                  <div className="text-2xl font-bold text-blue-400">
                    {section.value}
                  </div>

                  <div className="mt-1 text-xs text-white/45">
                    {section.label}
                  </div>
                </div>
              </div>

              <div className="mt-7 inline-flex text-sm font-medium text-blue-400 transition-transform duration-300 group-hover:translate-x-1">
                Открыть раздел →
              </div>
            </Link>
          ))}
        </section>

        <section className="my-10 rounded-[34px] border border-white/10 bg-white/[0.035] p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="text-sm font-medium uppercase tracking-[0.2em] text-blue-400">
                Активность
              </div>

              <h2 className="mt-3 text-4xl font-bold tracking-[-0.045em]">
                Последние события
              </h2>
            </div>

            <button className="w-fit rounded-xl border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-medium transition-colors hover:border-blue-500/40 hover:bg-blue-500/10">
              Обновить
            </button>
          </div>

          <div className="mt-8 grid gap-4">
            {recentActions.map((action) => (
              <div
                key={`${action.title}-${action.time}`}
                className="rounded-2xl border border-white/10 bg-black/20 p-5"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h3 className="text-lg font-bold">{action.title}</h3>

                    <p className="mt-1 text-sm text-white/55">{action.text}</p>
                  </div>

                  <span className="w-fit rounded-full border border-white/10 px-4 py-2 text-sm text-white/45">
                    {action.time}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
      <div className="text-sm text-white/45">{label}</div>
      <div className="mt-2 text-3xl font-bold">{value}</div>
    </div>
  );
}