import Link from "next/link";

const topics = [
  {
    id: "all",
    name: "Все обращения",
    count: 4,
  },
  {
    id: "delivery",
    name: "Вопрос по доставке",
    count: 2,
  },
  {
    id: "selection",
    name: "Подбор техники",
    count: 1,
  },
  {
    id: "warranty",
    name: "Гарантия",
    count: 1,
  },
  {
    id: "payment",
    name: "Оплата",
    count: 0,
  },
  {
    id: "other",
    name: "Другое",
    count: 0,
  },
];

const tickets = [
  {
    id: "SUP-204",
    topicId: "delivery",
    topic: "Вопрос по доставке",
    client: "Гость Нетизен",
    phone: "+7 999 000-00-00",
    linkedOrder: "NZ-1024",
    status: "Новое",
    source: "Заявка",
    date: "Сегодня, 14:28",
    lastMessage: "Хочу уточнить, можно ли доставить завтра после 18:00.",
    messages: [
      {
        author: "client",
        name: "Клиент",
        text: "Хочу уточнить, можно ли доставить завтра после 18:00.",
        time: "14:28",
      },
      {
        author: "manager",
        name: "Менеджер Нетизен",
        text: "Да, можем доставить после 18:00. Менеджер подтвердит точный интервал.",
        time: "14:34",
      },
    ],
  },
  {
    id: "SUP-203",
    topicId: "selection",
    topic: "Подбор техники",
    client: "Гость Нетизен",
    phone: "+7 999 444-55-66",
    linkedOrder: "",
    status: "В работе",
    source: "Профиль",
    date: "Сегодня, 13:10",
    lastMessage: "Нужен смартфон для фото, видео и соцсетей.",
    messages: [
      {
        author: "client",
        name: "Клиент",
        text: "Нужен смартфон для фото, видео и соцсетей.",
        time: "13:10",
      },
      {
        author: "manager",
        name: "Менеджер Нетизен",
        text: "Подскажем. Уточните бюджет и желаемый бренд.",
        time: "13:16",
      },
    ],
  },
  {
    id: "SUP-202",
    topicId: "warranty",
    topic: "Гарантия",
    client: "Мария",
    phone: "+7 999 333-44-55",
    linkedOrder: "NZ-1021",
    status: "Ожидает клиента",
    source: "Личный кабинет",
    date: "Вчера, 19:40",
    lastMessage: "Отправили информацию по гарантии, ждём подтверждения.",
    messages: [
      {
        author: "client",
        name: "Клиент",
        text: "Подскажите, как работает гарантия на iPhone?",
        time: "19:20",
      },
      {
        author: "manager",
        name: "Менеджер Нетизен",
        text: "Отправили информацию по гарантии, ждём подтверждения.",
        time: "19:40",
      },
    ],
  },
  {
    id: "SUP-201",
    topicId: "delivery",
    topic: "Вопрос по доставке",
    client: "Иван",
    phone: "+7 999 222-33-44",
    linkedOrder: "NZ-1022",
    status: "Закрыто",
    source: "Заявка",
    date: "Вчера, 18:55",
    lastMessage: "Клиент подтвердил пункт выдачи.",
    messages: [
      {
        author: "client",
        name: "Клиент",
        text: "Можно поменять пункт выдачи?",
        time: "18:30",
      },
      {
        author: "manager",
        name: "Менеджер Нетизен",
        text: "Да, поменяли ПВЗ в заявке.",
        time: "18:48",
      },
      {
        author: "client",
        name: "Клиент",
        text: "Спасибо, подтверждаю.",
        time: "18:55",
      },
    ],
  },
];

const selectedTicket = tickets[0];

function getStatusClass(status: string) {
  if (status === "Новое") {
    return "border-blue-500/35 bg-blue-500/10 text-blue-400";
  }

  if (status === "В работе") {
    return "border-purple-500/35 bg-purple-500/10 text-purple-300";
  }

  if (status === "Ожидает клиента") {
    return "border-orange-500/35 bg-orange-500/10 text-orange-300";
  }

  if (status === "Закрыто") {
    return "border-green-500/35 bg-green-500/10 text-green-300";
  }

  return "border-white/10 bg-white/[0.03] text-white/50";
}

export default function AdminSupportPage() {
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
            <span>Обращения</span>
            <span>·</span>
            <span>темы и диалоги</span>
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
                Support inbox
              </div>

              <h1 className="mt-5 text-5xl font-bold tracking-[-0.055em]">
                Обращения
              </h1>

              <p className="mt-4 max-w-[820px] text-sm leading-relaxed text-white/55">
                Единый центр коммуникации: слева темы обращений, по центру
                диалоги клиентов, справа выбранное обращение и переписка. Если
                вопрос связан с заказом, обращение привязывается к заявке.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button className="rounded-xl border border-white/10 bg-white/[0.03] px-7 py-4 text-sm font-medium transition-colors hover:border-blue-500/40 hover:bg-blue-500/10">
                Настройки тем
              </button>

              <button className="rounded-xl bg-blue-600 px-7 py-4 text-sm font-medium text-white transition-colors hover:bg-blue-500">
                Создать обращение →
              </button>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-5 md:grid-cols-4">
          <MetricCard label="Всего обращений" value={String(tickets.length)} />
          <MetricCard label="Новые" value="1" />
          <MetricCard label="В работе" value="1" />
          <MetricCard label="Связаны с заявками" value="3" />
        </section>

        <section className="mt-8 rounded-[28px] border border-white/10 bg-white/[0.035] p-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-1 flex-col gap-3 md:flex-row">
              <input
                placeholder="Поиск по номеру / клиенту / телефону / теме / заявке"
                className="h-12 flex-1 rounded-xl border border-white/10 bg-black/20 px-5 text-sm text-white outline-none placeholder:text-white/35 focus:border-blue-500/50"
              />

              <button className="rounded-xl border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-medium transition-colors hover:border-blue-500/40 hover:bg-blue-500/10">
                Статус
              </button>

              <button className="rounded-xl border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-medium transition-colors hover:border-blue-500/40 hover:bg-blue-500/10">
                Источник
              </button>

              <button className="rounded-xl border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-medium transition-colors hover:border-blue-500/40 hover:bg-blue-500/10">
                Только с заявкой
              </button>
            </div>

            <button className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-500">
              Новое обращение
            </button>
          </div>
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-[280px_420px_1fr]">
          <aside className="rounded-[28px] border border-white/10 bg-white/[0.035] p-5">
            <div className="text-sm font-medium uppercase tracking-[0.2em] text-blue-400">
              Темы
            </div>

            <h2 className="mt-3 text-2xl font-bold tracking-[-0.04em]">
              Папки обращений
            </h2>

            <div className="mt-6 grid gap-2">
              {topics.map((topic, index) => (
                <button
                  key={topic.id}
                  className={`flex items-center justify-between rounded-2xl border px-4 py-4 text-left text-sm transition-colors ${
                    index === 0
                      ? "border-blue-500/35 bg-blue-500/10 text-white"
                      : "border-white/10 bg-black/20 text-white/55 hover:border-blue-500/35 hover:bg-blue-500/10 hover:text-white"
                  }`}
                >
                  <span className="font-medium">{topic.name}</span>

                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      index === 0
                        ? "bg-blue-600 text-white"
                        : "bg-white/10 text-white/45"
                    }`}
                  >
                    {topic.count}
                  </span>
                </button>
              ))}
            </div>

            <div className="mt-6 rounded-2xl border border-blue-500/25 bg-blue-500/10 p-4">
              <div className="font-semibold text-blue-400">Логика</div>

              <p className="mt-2 text-sm leading-relaxed text-white/55">
                Тема работает как папка. Внутри темы лежат отдельные обращения
                клиентов.
              </p>
            </div>
          </aside>

          <section className="rounded-[28px] border border-white/10 bg-white/[0.035] p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-sm font-medium uppercase tracking-[0.2em] text-blue-400">
                  Диалоги
                </div>

                <h2 className="mt-3 text-2xl font-bold tracking-[-0.04em]">
                  Все обращения
                </h2>
              </div>

              <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-sm text-white/45">
                {tickets.length}
              </span>
            </div>

            <div className="mt-6 grid gap-3">
              {tickets.map((ticket, index) => {
                const isActive = ticket.id === selectedTicket.id;

                return (
                  <Link
                    key={ticket.id}
                    href={`/nz-console/support/${ticket.id}`}
                    className={`rounded-3xl border p-5 transition-all duration-300 ${
                      isActive
                        ? "border-blue-500/40 bg-blue-500/10"
                        : "border-white/10 bg-black/20 hover:border-blue-500/30 hover:bg-blue-500/[0.04]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-sm font-bold text-blue-400">
                          {ticket.id}
                        </div>

                        <h3 className="mt-2 text-lg font-bold leading-tight">
                          {ticket.topic}
                        </h3>
                      </div>

                      <span
                        className={`inline-flex whitespace-nowrap rounded-full border px-3 py-1 text-xs ${getStatusClass(
                          ticket.status
                        )}`}
                      >
                        {ticket.status}
                      </span>
                    </div>

                    <div className="mt-4 text-sm text-white/55">
                      {ticket.client}
                    </div>

                    <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-white/45">
                      {ticket.lastMessage}
                    </p>

                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      {ticket.linkedOrder ? (
                        <span className="rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs text-blue-400">
                          {ticket.linkedOrder}
                        </span>
                      ) : (
                        <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-white/45">
                          Без заявки
                        </span>
                      )}

                      <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-white/45">
                        {ticket.source}
                      </span>

                      <span className="text-xs text-white/35">
                        {ticket.date}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>

          <section className="rounded-[28px] border border-white/10 bg-white/[0.035] p-6">
            <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
              <div>
                <div className="text-sm font-medium uppercase tracking-[0.2em] text-blue-400">
                  Выбранное обращение
                </div>

                <h2 className="mt-3 text-3xl font-bold tracking-[-0.04em]">
                  {selectedTicket.topic}
                </h2>

                <p className="mt-3 max-w-[680px] text-sm leading-relaxed text-white/50">
                  Диалог с клиентом внутри выбранной темы. Если обращение
                  связано с заявкой, можно быстро перейти к заказу.
                </p>
              </div>

              <span
                className={`inline-flex w-fit whitespace-nowrap rounded-full border px-4 py-2 text-sm ${getStatusClass(
                  selectedTicket.status
                )}`}
              >
                {selectedTicket.status}
              </span>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <InfoCard label="Номер" value={selectedTicket.id} />
              <InfoCard label="Клиент" value={selectedTicket.client} />
              <InfoCard label="Телефон" value={selectedTicket.phone} />
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <InfoCard label="Источник" value={selectedTicket.source} />
              <InfoCard label="Дата" value={selectedTicket.date} />

              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="text-sm text-white/40">Связанная заявка</div>

                {selectedTicket.linkedOrder ? (
                  <Link
                    href={`/nz-console/orders/${selectedTicket.linkedOrder}`}
                    className="mt-2 inline-flex rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-sm font-medium text-blue-400 transition-colors hover:bg-blue-500/15"
                  >
                    {selectedTicket.linkedOrder}
                  </Link>
                ) : (
                  <div className="mt-2 font-bold text-white/55">
                    Без заявки
                  </div>
                )}
              </div>
            </div>

            <div className="mt-8 rounded-[26px] border border-white/10 bg-black/20 p-5">
              <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4">
                <div>
                  <div className="font-bold">Чат обращения</div>
                  <div className="mt-1 text-sm text-white/45">
                    {selectedTicket.messages.length} сообщения
                  </div>
                </div>

                <Link
                  href={`/nz-console/support/${selectedTicket.id}`}
                  className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-sm transition-colors hover:border-blue-500/40 hover:bg-blue-500/10"
                >
                  Открыть полностью
                </Link>
              </div>

              <div className="mt-5 grid gap-4">
                {selectedTicket.messages.map((message, index) => {
                  const isManager = message.author === "manager";

                  return (
                    <div
                      key={`${message.time}-${index}`}
                      className={`flex ${isManager ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[78%] rounded-2xl border p-4 ${
                          isManager
                            ? "border-blue-500/25 bg-blue-500/10"
                            : "border-white/10 bg-white/[0.035]"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div className="text-sm font-semibold">
                            {message.name}
                          </div>

                          <div className="text-xs text-white/35">
                            {message.time}
                          </div>
                        </div>

                        <p className="mt-2 text-sm leading-relaxed text-white/65">
                          {message.text}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-5 flex gap-3 border-t border-white/10 pt-5">
                <input
                  placeholder="Написать ответ клиенту..."
                  className="h-12 flex-1 rounded-xl border border-white/10 bg-white/[0.03] px-5 text-sm text-white outline-none placeholder:text-white/35 focus:border-blue-500/50"
                />

                <button className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-500">
                  Отправить
                </button>
              </div>
            </div>

            <div className="mt-6 grid gap-3 md:grid-cols-3">
              <button className="rounded-xl bg-blue-600 px-5 py-4 text-sm font-medium text-white transition-colors hover:bg-blue-500">
                Взять в работу
              </button>

              <button className="rounded-xl border border-white/10 bg-white/[0.03] px-5 py-4 text-sm font-medium transition-colors hover:border-blue-500/40 hover:bg-blue-500/10">
                Ожидает клиента
              </button>

              <button className="rounded-xl border border-white/10 bg-white/[0.03] px-5 py-4 text-sm font-medium text-white/55 transition-colors hover:border-green-500/40 hover:bg-green-500/10 hover:text-green-300">
                Закрыть
              </button>
            </div>
          </section>
        </section>

        <section className="my-8 rounded-[28px] border border-blue-500/25 bg-blue-500/10 p-6">
          <div className="text-sm font-medium uppercase tracking-[0.2em] text-blue-400">
            Архитектура
          </div>

          <h2 className="mt-3 text-2xl font-bold tracking-[-0.035em]">
            Тема → обращение → сообщения
          </h2>

          <p className="mt-3 max-w-[980px] text-sm leading-relaxed text-white/55">
            Тема работает как папка, обращение — как отдельный диалог с
            клиентом, а сообщения хранят саму переписку. Если обращение связано
            с заказом, у него есть linkedOrder, например NZ-1024.
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

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <div className="text-sm text-white/40">{label}</div>
      <div className="mt-2 font-bold">{value}</div>
    </div>
  );
}