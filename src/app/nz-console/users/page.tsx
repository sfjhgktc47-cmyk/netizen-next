import Link from "next/link";

const customers = [
  {
    id: "CL-1001",
    name: "Гость Нетизен",
    phone: "+7 999 000-00-00",
    email: "guest@netizen.ru",
    city: "Москва",
    orders: 2,
    tickets: 1,
    totalSpent: "134 980 ₽",
    status: "Постоянный",
    lastActivity: "Сегодня, 14:28",
  },
  {
    id: "CL-1002",
    name: "Иван",
    phone: "+7 999 222-33-44",
    email: "ivan@example.ru",
    city: "Москва",
    orders: 1,
    tickets: 1,
    totalSpent: "189 990 ₽",
    status: "Новый",
    lastActivity: "Вчера, 18:55",
  },
  {
    id: "CL-1003",
    name: "Мария",
    phone: "+7 999 333-44-55",
    email: "maria@example.ru",
    city: "Москва",
    orders: 3,
    tickets: 1,
    totalSpent: "259 980 ₽",
    status: "VIP",
    lastActivity: "12 мая, 16:40",
  },
];

const tabs = [
  { label: "Все", count: customers.length, active: true },
  { label: "Новые", count: 1, active: false },
  { label: "Постоянные", count: 1, active: false },
  { label: "VIP", count: 1, active: false },
  { label: "Требуют внимания", count: 0, active: false },
];

function getStatusClass(status: string) {
  if (status === "VIP") {
    return "border-purple-500/35 bg-purple-500/10 text-purple-300";
  }

  if (status === "Постоянный") {
    return "border-blue-500/35 bg-blue-500/10 text-blue-400";
  }

  if (status === "Новый") {
    return "border-green-500/35 bg-green-500/10 text-green-300";
  }

  return "border-orange-500/35 bg-orange-500/10 text-orange-300";
}

export default function AdminUsersPage() {
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
            <span>Клиенты</span>
            <span>·</span>
            <span>CRM-lite</span>
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
                Клиентская база
              </div>

              <h1 className="mt-5 text-5xl font-bold tracking-[-0.055em]">
                Клиенты
              </h1>

              <p className="mt-4 max-w-[820px] text-sm leading-relaxed text-white/55">
                Здесь будет база клиентов магазина: контакты, заявки,
                обращения, сумма покупок, город, адреса доставки и статус
                клиента. Это основа для простой CRM внутри админки.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button className="rounded-xl border border-white/10 bg-white/[0.03] px-7 py-4 text-sm font-medium transition-colors hover:border-blue-500/40 hover:bg-blue-500/10">
                Экспорт
              </button>

              <button className="rounded-xl bg-blue-600 px-7 py-4 text-sm font-medium text-white transition-colors hover:bg-blue-500">
                Добавить клиента →
              </button>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-5 md:grid-cols-4">
          <MetricCard label="Всего клиентов" value={String(customers.length)} />
          <MetricCard label="Постоянные" value="1" />
          <MetricCard label="VIP" value="1" />
          <MetricCard label="Сумма покупок" value="584 950 ₽" />
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
                placeholder="Поиск по имени / телефону / e-mail / городу"
                className="h-12 flex-1 rounded-xl border border-white/10 bg-black/20 px-5 text-sm text-white outline-none placeholder:text-white/35 focus:border-blue-500/50"
              />

              <button className="rounded-xl border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-medium transition-colors hover:border-blue-500/40 hover:bg-blue-500/10">
                Статус
              </button>

              <button className="rounded-xl border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-medium transition-colors hover:border-blue-500/40 hover:bg-blue-500/10">
                Город
              </button>

              <button className="rounded-xl border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-medium transition-colors hover:border-blue-500/40 hover:bg-blue-500/10">
                Активность
              </button>
            </div>

            <button className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-500">
              Добавить клиента
            </button>
          </div>
        </section>

        <section className="mt-6 grid gap-5 xl:grid-cols-[1fr_380px]">
          <div className="grid gap-4">
            {customers.map((customer) => (
              <Link
                key={customer.id}
                href={`/nz-console/users/${customer.id}`}
                className="rounded-[30px] border border-white/10 bg-white/[0.035] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-blue-500/35 hover:bg-blue-500/[0.04]"
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex items-start gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-xl font-bold text-white">
                      {customer.name.slice(0, 1)}
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <h2 className="text-2xl font-bold tracking-[-0.035em]">
                          {customer.name}
                        </h2>

                        <span
                          className={`rounded-full border px-3 py-1 text-sm ${getStatusClass(
                            customer.status
                          )}`}
                        >
                          {customer.status}
                        </span>
                      </div>

                      <div className="mt-2 text-sm text-white/45">
                        {customer.id} · {customer.city}
                      </div>

                      <div className="mt-3 flex flex-wrap gap-3 text-sm text-white/55">
                        <span>{customer.phone}</span>
                        <span>·</span>
                        <span>{customer.email}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-4 lg:min-w-[560px]">
                    <MiniStat label="Заявок" value={String(customer.orders)} />
                    <MiniStat label="Обращений" value={String(customer.tickets)} />
                    <MiniStat label="Покупки" value={customer.totalSpent} />
                    <MiniStat label="Активность" value={customer.lastActivity} />
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <aside className="space-y-5">
            <section className="rounded-[30px] border border-white/10 bg-white/[0.035] p-6">
              <div className="text-sm font-medium uppercase tracking-[0.2em] text-blue-400">
                CRM-lite
              </div>

              <h2 className="mt-3 text-3xl font-bold tracking-[-0.04em]">
                Что хранит клиент
              </h2>

              <div className="mt-6 grid gap-3">
                <InfoLine label="Контакты" value="телефон, e-mail" />
                <InfoLine label="Заявки" value="история покупок" />
                <InfoLine label="Обращения" value="чаты и темы" />
                <InfoLine label="Доставка" value="адреса / ПВЗ" />
                <InfoLine label="Статус" value="новый / VIP" />
              </div>
            </section>

            <section className="rounded-[30px] border border-blue-500/25 bg-blue-500/10 p-6">
              <div className="font-semibold text-blue-400">
                Зачем это нужно
              </div>

              <p className="mt-3 text-sm leading-relaxed text-white/55">
                Менеджер сможет быстро понять, кто клиент: новый, постоянный
                или VIP, что он покупал, какие обращения создавал и какие адреса
                использовал.
              </p>
            </section>
          </aside>
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

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <div className="text-xs text-white/35">{label}</div>
      <div className="mt-2 text-sm font-semibold">{value}</div>
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