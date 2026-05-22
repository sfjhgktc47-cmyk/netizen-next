import Link from "next/link";

const orders = [
  {
    id: "NZ-1024",
    client: "Гость Нетизен",
    phone: "+7 999 000-00-00",
    productCard: "iPhone 17 Pro",
    position: "iPhone 17 Pro 256 GB Silver eSIM",
    sku: "IP17P-256-SILVER-ESIM",
    quantity: 1,
    price: "109 990 ₽",
    total: "109 990 ₽",
    status: "Новая",
    source: "Корзина",
    date: "Сегодня, 14:20",
  },
  {
    id: "NZ-1023",
    client: "Гость Нетизен",
    phone: "+7 999 111-22-33",
    productCard: "AirPods Pro",
    position: "AirPods Pro USB-C White",
    sku: "APPRO-USBC-WHITE",
    quantity: 1,
    price: "24 990 ₽",
    total: "24 990 ₽",
    status: "Ожидает подтверждения",
    source: "Карточка товара",
    date: "Сегодня, 12:05",
  },
  {
    id: "NZ-1022",
    client: "Иван",
    phone: "+7 999 222-33-44",
    productCard: "MacBook Pro 14",
    position: "MacBook Pro 14 M4 16/512 Space Black",
    sku: "MBP14-M4-16-512-BLACK",
    quantity: 1,
    price: "189 990 ₽",
    total: "189 990 ₽",
    status: "В работе",
    source: "Каталог",
    date: "Вчера, 18:40",
  },
  {
    id: "NZ-1021",
    client: "Мария",
    phone: "+7 999 333-44-55",
    productCard: "iPhone 17 Pro",
    position: "iPhone 17 Pro 512 GB Silver eSIM",
    sku: "IP17P-512-SILVER-ESIM",
    quantity: 2,
    price: "129 990 ₽",
    total: "259 980 ₽",
    status: "Завершена",
    source: "Корзина",
    date: "12 мая, 16:10",
  },
];

const tabs = [
  { label: "Все", count: orders.length, active: true },
  { label: "Новые", count: 1, active: false },
  { label: "Ожидают", count: 1, active: false },
  { label: "В работе", count: 1, active: false },
  { label: "Завершены", count: 1, active: false },
  { label: "Отменены", count: 0, active: false },
];

function getStatusClass(status: string) {
  if (status === "Новая") {
    return "border-blue-500/35 bg-blue-500/10 text-blue-400";
  }

  if (status === "Ожидает подтверждения") {
    return "border-orange-500/35 bg-orange-500/10 text-orange-300";
  }

  if (status === "В работе") {
    return "border-purple-500/35 bg-purple-500/10 text-purple-300";
  }

  if (status === "Завершена") {
    return "border-green-500/35 bg-green-500/10 text-green-300";
  }

  return "border-white/10 bg-white/[0.03] text-white/50";
}

export default function AdminOrdersPage() {
  return (
    <main className="min-h-screen bg-[#020814] px-6 py-6 text-white">
      <div className="mx-auto max-w-[1600px]">
        <header className="flex min-h-[76px] items-center justify-between rounded-2xl border border-white/10 bg-white/[0.035] px-6">
          <Link
            href="/nz-console"
            className="text-xl font-bold tracking-[-0.04em]"
          >
            Netizen Console
          </Link>

          <div className="hidden items-center gap-3 text-sm text-white/55 md:flex">
            <span>Заявки</span>
            <span>·</span>
            <span>заказы клиентов</span>
          </div>

          <Link
            href="/"
            className="rounded-xl border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-medium transition-colors hover:border-blue-500/40 hover:bg-blue-500/10"
          >
            На сайт →
          </Link>
        </header>

        <section className="mt-10">
          <Link
            href="/nz-console"
            className="text-sm text-blue-400 transition-colors hover:text-blue-300"
          >
            ← В админку
          </Link>

          <div className="mt-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="inline-flex rounded-full border border-blue-500/35 bg-blue-500/10 px-4 py-2 text-sm font-medium text-blue-400">
                Продажи
              </div>

              <h1 className="mt-5 text-5xl font-bold tracking-[-0.055em]">
                Заявки
              </h1>

              <p className="mt-4 max-w-[780px] text-sm leading-relaxed text-white/55">
                Здесь будут заявки с сайта: корзина, кнопка “Купить сейчас”,
                обращения по товару и ручные заявки менеджера. В заявке
                сохраняется конкретная позиция / SKU, а не только карточка.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button className="rounded-xl border border-white/10 bg-white/[0.03] px-7 py-4 text-sm font-medium transition-colors hover:border-blue-500/40 hover:bg-blue-500/10">
                Экспорт
              </button>

              <button className="rounded-xl bg-blue-600 px-7 py-4 text-sm font-medium text-white transition-colors hover:bg-blue-500">
                Создать заявку →
              </button>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-5 md:grid-cols-4">
          <MetricCard label="Всего заявок" value={String(orders.length)} />
          <MetricCard label="Новые" value="1" />
          <MetricCard label="В работе" value="1" />
          <MetricCard label="Сумма сегодня" value="134 980 ₽" />
        </section>

        <section className="mt-8">
          <div className="flex flex-wrap gap-2 border-b border-white/10">
            {tabs.map((tab) => (
              <button
                key={tab.label}
                className={`relative px-4 py-4 text-sm font-medium transition-colors ${
                  tab.active
                    ? "text-white"
                    : "text-white/45 hover:text-white"
                }`}
              >
                <span>{tab.label}</span>

                <span
                  className={`ml-2 rounded-full px-2 py-0.5 text-xs ${
                    tab.active
                      ? "bg-blue-600 text-white"
                      : "bg-white/10 text-white/45"
                  }`}
                >
                  {tab.count}
                </span>

                {tab.active && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full bg-blue-500" />
                )}
              </button>
            ))}
          </div>
        </section>

        <section className="mt-6 rounded-[28px] border border-white/10 bg-white/[0.035] p-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-1 flex-col gap-3 md:flex-row">
              <input
                placeholder="Поиск по номеру заявки / клиенту / телефону / SKU"
                className="h-12 flex-1 rounded-xl border border-white/10 bg-black/20 px-5 text-sm text-white outline-none placeholder:text-white/35 focus:border-blue-500/50"
              />

              <button className="rounded-xl border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-medium transition-colors hover:border-blue-500/40 hover:bg-blue-500/10">
                Статус
              </button>

              <button className="rounded-xl border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-medium transition-colors hover:border-blue-500/40 hover:bg-blue-500/10">
                Источник
              </button>

              <button className="rounded-xl border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-medium transition-colors hover:border-blue-500/40 hover:bg-blue-500/10">
                Дата
              </button>
            </div>

            <button className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-500">
              Новая заявка
            </button>
          </div>
        </section>

        <section className="mt-6 overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.035]">
          <div className="hidden grid-cols-[0.65fr_0.9fr_1.35fr_0.75fr_0.55fr_0.75fr_0.75fr_0.85fr_140px] border-b border-white/10 bg-black/25 px-5 py-4 text-sm text-white/45 xl:grid">
            <div>Заявка</div>
            <div>Клиент</div>
            <div>Позиция / SKU</div>
            <div>Карточка</div>
            <div>Кол-во</div>
            <div>Сумма</div>
            <div>Источник</div>
            <div>Статус</div>
            <div className="text-right">Действия</div>
          </div>

          <div className="divide-y divide-white/10">
            {orders.map((order) => (
              <div
                key={order.id}
                className="grid gap-5 bg-white/[0.015] p-5 transition-colors hover:bg-blue-500/[0.04] xl:grid-cols-[0.65fr_0.9fr_1.25fr_0.7fr_0.5fr_0.7fr_0.7fr_1.05fr_140px] xl:items-center"
              >
                <div>
                  <div className="font-bold text-blue-400">{order.id}</div>
                  <div className="mt-1 text-sm text-white/35">{order.date}</div>
                </div>

                <div>
                  <div className="font-semibold">{order.client}</div>
                  <div className="mt-1 text-sm text-white/45">
                    {order.phone}
                  </div>
                </div>

                <div>
                  <div className="font-semibold">{order.position}</div>
                  <div className="mt-1 text-sm text-white/35">
                    SKU {order.sku}
                  </div>
                </div>

                <AdminCell label="Карточка">
                  <span className="rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-sm text-blue-400">
                    {order.productCard}
                  </span>
                </AdminCell>

                <AdminCell label="Кол-во">{order.quantity}</AdminCell>

                <AdminCell label="Сумма">
                  <div className="font-semibold">{order.total}</div>
                  <div className="mt-1 text-xs text-white/35">
                    {order.price} / шт.
                  </div>
                </AdminCell>

                <AdminCell label="Источник">{order.source}</AdminCell>

                <AdminCell label="Статус">
<span
  className={`inline-flex min-w-[150px] justify-center whitespace-nowrap rounded-full border px-3 py-1 text-sm ${getStatusClass(
    order.status
  )}`}
>
  {order.status}
</span>
                </AdminCell>

                <div className="flex flex-wrap gap-2 xl:justify-end">
               <Link
    href={`/nz-console/orders/${order.id}`}
    className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-sm transition-colors hover:border-blue-500/40 hover:bg-blue-500/10"
  >
    Открыть
  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="my-8 rounded-[28px] border border-blue-500/25 bg-blue-500/10 p-6">
          <div className="text-sm font-medium uppercase tracking-[0.2em] text-blue-400">
            Логика заявок
          </div>

          <h2 className="mt-3 text-2xl font-bold tracking-[-0.035em]">
            Заявка должна хранить SKU
          </h2>

          <p className="mt-3 max-w-[980px] text-sm leading-relaxed text-white/55">
            Клиент видит материнскую карточку, но в заявку должна попадать
            конкретная позиция: SKU, цена, количество, выбранные параметры,
            наличие и итоговая сумма. Так менеджер всегда понимает, какую
            конфигурацию нужно подтвердить.
          </p>
        </section>
      </div>
    </main>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[26px] border border-white/10 bg-white/[0.035] p-6">
      <div className="text-sm text-white/45">{label}</div>
      <div className="mt-3 text-4xl font-bold">{value}</div>
    </div>
  );
}

function AdminCell({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-1 text-xs text-white/35 xl:hidden">{label}</div>
      <div className="text-sm text-white/70">{children}</div>
    </div>
  );
}