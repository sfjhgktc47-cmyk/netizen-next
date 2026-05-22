import Link from "next/link";
import { notFound } from "next/navigation";

const customers = [
  {
    id: "CL-1001",
    name: "Гость Нетизен",
    phone: "+7 999 000-00-00",
    email: "guest@netizen.ru",
    city: "Москва",
    status: "Постоянный",
    totalSpent: "134 980 ₽",
    ordersCount: 2,
    ticketsCount: 1,
    lastActivity: "Сегодня, 14:28",
    crmId: "CRM-CUSTOMER-1001",
    addresses: [
      {
        type: "Курьерская доставка",
        value: "Москва, ул. Тверская, 1, кв. 25",
      },
      {
        type: "ПВЗ",
        value: "Москва, ул. Тверская, 7",
      },
    ],
    orders: [
      {
        id: "NZ-1024",
        product: "iPhone 17 Pro 256 GB Silver eSIM",
        total: "109 990 ₽",
        status: "Новая",
        date: "Сегодня, 14:20",
      },
      {
        id: "NZ-1023",
        product: "AirPods Pro USB-C White",
        total: "24 990 ₽",
        status: "Ожидает подтверждения",
        date: "Сегодня, 12:05",
      },
    ],
    tickets: [
      {
        id: "SUP-204",
        topic: "Вопрос по доставке",
        linkedOrder: "NZ-1024",
        status: "Новое",
        date: "Сегодня, 14:28",
      },
    ],
  },
  {
    id: "CL-1002",
    name: "Иван",
    phone: "+7 999 222-33-44",
    email: "ivan@example.ru",
    city: "Москва",
    status: "Новый",
    totalSpent: "189 990 ₽",
    ordersCount: 1,
    ticketsCount: 1,
    lastActivity: "Вчера, 18:55",
    crmId: "",
    addresses: [
      {
        type: "ПВЗ",
        value: "Москва, ул. Тверская, 7",
      },
    ],
    orders: [
      {
        id: "NZ-1022",
        product: "MacBook Pro 14 M4 16/512 Space Black",
        total: "189 990 ₽",
        status: "В работе",
        date: "Вчера, 18:40",
      },
    ],
    tickets: [
      {
        id: "SUP-201",
        topic: "Доставка",
        linkedOrder: "NZ-1022",
        status: "Закрыто",
        date: "Вчера, 18:55",
      },
    ],
  },
  {
    id: "CL-1003",
    name: "Мария",
    phone: "+7 999 333-44-55",
    email: "maria@example.ru",
    city: "Москва",
    status: "VIP",
    totalSpent: "259 980 ₽",
    ordersCount: 3,
    ticketsCount: 1,
    lastActivity: "12 мая, 16:40",
    crmId: "CRM-CUSTOMER-1003",
    addresses: [
      {
        type: "Курьерская доставка",
        value: "Москва, Кутузовский проспект, 18, кв. 44",
      },
    ],
    orders: [
      {
        id: "NZ-1021",
        product: "iPhone 17 Pro 512 GB Silver eSIM",
        total: "259 980 ₽",
        status: "Завершена",
        date: "12 мая, 16:10",
      },
    ],
    tickets: [
      {
        id: "SUP-202",
        topic: "Гарантия",
        linkedOrder: "NZ-1021",
        status: "Ожидает клиента",
        date: "Вчера, 19:40",
      },
    ],
  },
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

  if (status === "Новая" || status === "Новое") {
    return "border-blue-500/35 bg-blue-500/10 text-blue-400";
  }

  if (status === "В работе") {
    return "border-purple-500/35 bg-purple-500/10 text-purple-300";
  }

  if (status === "Ожидает подтверждения" || status === "Ожидает клиента") {
    return "border-orange-500/35 bg-orange-500/10 text-orange-300";
  }

  if (status === "Завершена" || status === "Закрыто") {
    return "border-green-500/35 bg-green-500/10 text-green-300";
  }

  return "border-white/10 bg-white/[0.03] text-white/50";
}

export default async function AdminCustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const customer = customers.find((item) => item.id === id);

  if (!customer) {
    notFound();
  }

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
            <span>Клиент</span>
            <span>·</span>
            <span>{customer.id}</span>
          </div>

          <Link
            href="/nz-console/users"
            className="rounded-xl border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-medium transition-colors hover:border-blue-500/40 hover:bg-blue-500/10"
          >
            К клиентам →
          </Link>
        </header>

        <section className="mt-10">
          <Link
            href="/nz-console/users"
            className="text-sm text-blue-400 transition-colors hover:text-blue-300"
          >
            ← Назад к клиентам
          </Link>

          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
            <div className="rounded-[34px] border border-white/10 bg-white/[0.035] p-8">
              <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                <div className="flex items-start gap-5">
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-blue-600 text-3xl font-bold">
                    {customer.name.slice(0, 1)}
                  </div>

                  <div>
                    <div className="text-sm font-medium uppercase tracking-[0.2em] text-blue-400">
                      Клиент
                    </div>

                    <h1 className="mt-3 text-5xl font-bold tracking-[-0.055em]">
                      {customer.name}
                    </h1>

                    <p className="mt-4 max-w-[720px] text-sm leading-relaxed text-white/55">
                      Карточка клиента хранит контакты, заявки, обращения,
                      адреса доставки, сумму покупок и CRM-статус.
                    </p>
                  </div>
                </div>

                <span
                  className={`inline-flex w-fit whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium ${getStatusClass(
                    customer.status
                  )}`}
                >
                  {customer.status}
                </span>
              </div>

              <div className="mt-8 grid gap-4 md:grid-cols-4">
                <InfoCard label="Заявки" value={String(customer.ordersCount)} />
                <InfoCard
                  label="Обращения"
                  value={String(customer.ticketsCount)}
                />
                <InfoCard label="Покупки" value={customer.totalSpent} />
                <InfoCard label="Активность" value={customer.lastActivity} />
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
                  Создать заявку
                </button>

                <button className="rounded-xl border border-white/10 bg-white/[0.03] px-5 py-4 text-sm font-medium transition-colors hover:border-blue-500/40 hover:bg-blue-500/10">
                  Создать обращение
                </button>

                <button className="rounded-xl border border-white/10 bg-white/[0.03] px-5 py-4 text-sm font-medium transition-colors hover:border-blue-500/40 hover:bg-blue-500/10">
                  Изменить статус
                </button>
              </div>
            </aside>
          </div>
        </section>

        <section className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
          <div className="space-y-8">
            <section className="rounded-[34px] border border-white/10 bg-white/[0.035] p-8">
              <SectionTitle
                label="Заявки"
                title="История заказов"
                text="Все заявки клиента с привязкой к конкретным SKU и статусам."
              />

              <div className="mt-8 grid gap-4">
                {customer.orders.map((order) => (
                  <Link
                    key={order.id}
                    href={`/nz-console/orders/${order.id}`}
                    className="rounded-2xl border border-white/10 bg-black/20 p-5 transition-colors hover:border-blue-500/35 hover:bg-blue-500/[0.04]"
                  >
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div>
                        <div className="font-bold text-blue-400">
                          {order.id}
                        </div>

                        <h3 className="mt-2 text-lg font-bold">
                          {order.product}
                        </h3>

                        <div className="mt-1 text-sm text-white/35">
                          {order.date}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        <span className="font-bold">{order.total}</span>

                        <span
                          className={`rounded-full border px-3 py-1 text-sm ${getStatusClass(
                            order.status
                          )}`}
                        >
                          {order.status}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>

            <section className="rounded-[34px] border border-white/10 bg-white/[0.035] p-8">
              <SectionTitle
                label="Обращения"
                title="Диалоги клиента"
                text="Все обращения клиента из общего центра поддержки."
              />

              <div className="mt-8 grid gap-4">
                {customer.tickets.map((ticket) => (
                  <Link
                    key={ticket.id}
                    href={`/nz-console/support/${ticket.id}`}
                    className="rounded-2xl border border-white/10 bg-black/20 p-5 transition-colors hover:border-blue-500/35 hover:bg-blue-500/[0.04]"
                  >
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div>
                        <div className="font-bold text-blue-400">
                          {ticket.id}
                        </div>

                        <h3 className="mt-2 text-lg font-bold">
                          {ticket.topic}
                        </h3>

                        <div className="mt-1 text-sm text-white/35">
                          Связано с {ticket.linkedOrder} · {ticket.date}
                        </div>
                      </div>

                      <span
                        className={`w-fit rounded-full border px-3 py-1 text-sm ${getStatusClass(
                          ticket.status
                        )}`}
                      >
                        {ticket.status}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>

            <section className="rounded-[34px] border border-white/10 bg-white/[0.035] p-8">
              <SectionTitle
                label="Доставка"
                title="Адреса и ПВЗ"
                text="Адреса, которые клиент использовал в заявках."
              />

              <div className="mt-8 grid gap-4">
                {customer.addresses.map((address, index) => (
                  <div
                    key={`${address.type}-${index}`}
                    className="rounded-2xl border border-white/10 bg-black/20 p-5"
                  >
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <div className="text-sm text-white/40">
                          {address.type}
                        </div>

                        <div className="mt-2 font-bold">{address.value}</div>
                      </div>

                      <span className="w-fit rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-sm text-blue-400">
                        Использовался
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <aside className="space-y-8">
            <section className="rounded-[34px] border border-white/10 bg-white/[0.035] p-8">
              <SectionTitle
                label="Контакты"
                title="Данные клиента"
                text="Основные контактные данные для связи."
              />

              <div className="mt-6 grid gap-3">
                <InfoLine label="ID" value={customer.id} />
                <InfoLine label="Телефон" value={customer.phone} />
                <InfoLine label="E-mail" value={customer.email} />
                <InfoLine label="Город" value={customer.city} />
              </div>
            </section>

            <section className="rounded-[34px] border border-white/10 bg-white/[0.035] p-8">
              <SectionTitle
                label="CRM"
                title="Интеграция"
                text="Технические поля для будущей синхронизации с CRM."
              />

              <div className="mt-6 grid gap-3">
                <InfoLine
                  label="CRM ID"
                  value={customer.crmId || "Не создан"}
                />
                <InfoLine label="Статус" value={customer.status} />
                <InfoLine label="Сумма покупок" value={customer.totalSpent} />
                <InfoLine
                  label="Последняя активность"
                  value={customer.lastActivity}
                />
              </div>
            </section>

            <section className="rounded-[34px] border border-blue-500/25 bg-blue-500/10 p-8">
              <div className="text-sm font-medium uppercase tracking-[0.2em] text-blue-400">
                CRM-lite
              </div>

              <h2 className="mt-3 text-3xl font-bold tracking-[-0.04em]">
                Зачем нужна карточка клиента
              </h2>

              <p className="mt-4 text-sm leading-relaxed text-white/55">
                Менеджер сразу видит, кто перед ним: новый клиент, постоянный
                или VIP, какие заявки были раньше, какие обращения открыты и
                какие адреса использовались.
              </p>
            </section>
          </aside>
        </section>
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