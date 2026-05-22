import Link from "next/link";
import { notFound } from "next/navigation";

const tickets = [
  {
    id: "SUP-204",
    topic: "Вопрос по доставке",
    client: "Гость Нетизен",
    phone: "+7 999 000-00-00",
    email: "guest@netizen.ru",
    linkedOrder: "NZ-1024",
    status: "Новое",
    source: "Заявка",
    date: "Сегодня, 14:28",
    manager: "Не назначен",
    priority: "Средний",
    messages: [
      {
        author: "client",
        name: "Клиент",
        text: "Хочу уточнить, можно ли доставить завтра после 18:00.",
        time: "Сегодня, 14:28",
      },
      {
        author: "manager",
        name: "Менеджер Нетизен",
        text: "Да, можем доставить после 18:00. Менеджер подтвердит точный интервал.",
        time: "Сегодня, 14:34",
      },
    ],
    history: [
      {
        title: "Обращение создано",
        text: "Источник: заявка NZ-1024",
        time: "Сегодня, 14:28",
      },
      {
        title: "Связано с заявкой",
        text: "Обращение привязано к NZ-1024",
        time: "Сегодня, 14:28",
      },
      {
        title: "Получен ответ менеджера",
        text: "Менеджер ответил клиенту по доставке.",
        time: "Сегодня, 14:34",
      },
    ],
  },
  {
    id: "SUP-203",
    topic: "Подбор техники",
    client: "Гость Нетизен",
    phone: "+7 999 444-55-66",
    email: "guest@netizen.ru",
    linkedOrder: "",
    status: "В работе",
    source: "Профиль",
    date: "Сегодня, 13:10",
    manager: "Менеджер 1",
    priority: "Обычный",
    messages: [
      {
        author: "client",
        name: "Клиент",
        text: "Нужен смартфон для фото, видео и соцсетей.",
        time: "Сегодня, 13:10",
      },
      {
        author: "manager",
        name: "Менеджер Нетизен",
        text: "Подскажем. Уточните бюджет и желаемый бренд.",
        time: "Сегодня, 13:16",
      },
    ],
    history: [
      {
        title: "Обращение создано",
        text: "Источник: профиль клиента",
        time: "Сегодня, 13:10",
      },
      {
        title: "Назначен менеджер",
        text: "Менеджер 1 взял обращение в работу.",
        time: "Сегодня, 13:15",
      },
    ],
  },
  {
    id: "SUP-202",
    topic: "Гарантия",
    client: "Мария",
    phone: "+7 999 333-44-55",
    email: "maria@example.ru",
    linkedOrder: "NZ-1021",
    status: "Ожидает клиента",
    source: "Личный кабинет",
    date: "Вчера, 19:40",
    manager: "Менеджер 1",
    priority: "Обычный",
    messages: [
      {
        author: "client",
        name: "Клиент",
        text: "Подскажите, как работает гарантия на iPhone?",
        time: "Вчера, 19:20",
      },
      {
        author: "manager",
        name: "Менеджер Нетизен",
        text: "Отправили информацию по гарантии, ждём подтверждения.",
        time: "Вчера, 19:40",
      },
    ],
    history: [
      {
        title: "Обращение создано",
        text: "Источник: личный кабинет",
        time: "Вчера, 19:20",
      },
      {
        title: "Отправлен ответ",
        text: "Клиенту отправлена информация по гарантии.",
        time: "Вчера, 19:40",
      },
    ],
  },
  {
    id: "SUP-201",
    topic: "Доставка",
    client: "Иван",
    phone: "+7 999 222-33-44",
    email: "ivan@example.ru",
    linkedOrder: "NZ-1022",
    status: "Закрыто",
    source: "Заявка",
    date: "Вчера, 18:55",
    manager: "Менеджер 1",
    priority: "Обычный",
    messages: [
      {
        author: "client",
        name: "Клиент",
        text: "Можно поменять пункт выдачи?",
        time: "Вчера, 18:30",
      },
      {
        author: "manager",
        name: "Менеджер Нетизен",
        text: "Да, поменяли ПВЗ в заявке.",
        time: "Вчера, 18:48",
      },
      {
        author: "client",
        name: "Клиент",
        text: "Спасибо, подтверждаю.",
        time: "Вчера, 18:55",
      },
    ],
    history: [
      {
        title: "Обращение создано",
        text: "Источник: заявка NZ-1022",
        time: "Вчера, 18:30",
      },
      {
        title: "ПВЗ изменён",
        text: "Менеджер поменял пункт выдачи в заявке.",
        time: "Вчера, 18:48",
      },
      {
        title: "Обращение закрыто",
        text: "Клиент подтвердил изменение.",
        time: "Вчера, 18:55",
      },
    ],
  },
];

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

export default async function AdminSupportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const ticket = tickets.find((item) => item.id === id);

  if (!ticket) {
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
            <span>Обращение</span>
            <span>·</span>
            <span>{ticket.id}</span>
          </div>

          <Link
            href="/nz-console/support"
            className="rounded-xl border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-medium transition-colors hover:border-blue-500/40 hover:bg-blue-500/10"
          >
            К обращениям →
          </Link>
        </header>

        <section className="mt-10">
          <Link
            href="/nz-console/support"
            className="text-sm text-blue-400 transition-colors hover:text-blue-300"
          >
            ← Назад к обращениям
          </Link>

          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
            <div className="rounded-[34px] border border-white/10 bg-white/[0.035] p-8">
              <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="text-sm font-medium uppercase tracking-[0.2em] text-blue-400">
                    Обращение
                  </div>

                  <h1 className="mt-3 text-5xl font-bold tracking-[-0.055em]">
                    {ticket.topic}
                  </h1>

                  <p className="mt-4 max-w-[740px] text-sm leading-relaxed text-white/55">
                    Это отдельный диалог с клиентом. Обращение может быть
                    связано с заявкой, но чат хранится только здесь, чтобы не
                    размазывать переписки по разным разделам.
                  </p>
                </div>

                <span
                  className={`inline-flex w-fit whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium ${getStatusClass(
                    ticket.status
                  )}`}
                >
                  {ticket.status}
                </span>
              </div>

              <div className="mt-8 grid gap-4 md:grid-cols-4">
                <InfoCard label="Номер" value={ticket.id} />
                <InfoCard label="Источник" value={ticket.source} />
                <InfoCard label="Приоритет" value={ticket.priority} />
                <InfoCard label="Дата" value={ticket.date} />
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
                  Взять в работу
                </button>

                <button className="rounded-xl border border-white/10 bg-white/[0.03] px-5 py-4 text-sm font-medium transition-colors hover:border-blue-500/40 hover:bg-blue-500/10">
                  Ожидает клиента
                </button>

                <button className="rounded-xl border border-white/10 bg-white/[0.03] px-5 py-4 text-sm font-medium text-white/55 transition-colors hover:border-green-500/40 hover:bg-green-500/10 hover:text-green-300">
                  Закрыть обращение
                </button>
              </div>
            </aside>
          </div>
        </section>

        <section className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
          <div className="space-y-8">
            <section className="rounded-[34px] border border-white/10 bg-white/[0.035] p-8">
              <SectionTitle
                label="Чат"
                title="Переписка с клиентом"
                text="Все сообщения по теме хранятся внутри одного обращения."
              />

              <div className="mt-8 rounded-[28px] border border-white/10 bg-black/20 p-5">
                <div className="grid gap-5">
                  {ticket.messages.map((message, index) => {
                    const isManager = message.author === "manager";

                    return (
                      <div
                        key={`${message.time}-${index}`}
                        className={`flex ${
                          isManager ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-[78%] rounded-2xl border p-5 ${
                            isManager
                              ? "border-blue-500/25 bg-blue-500/10"
                              : "border-white/10 bg-white/[0.035]"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-5">
                            <div className="font-semibold">{message.name}</div>
                            <div className="text-xs text-white/35">
                              {message.time}
                            </div>
                          </div>

                          <p className="mt-3 text-sm leading-relaxed text-white/70">
                            {message.text}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-6 border-t border-white/10 pt-6">
                  <div className="grid gap-3">
                    <textarea
                      placeholder="Написать ответ клиенту..."
                      className="min-h-[130px] w-full resize-none rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-sm text-white outline-none placeholder:text-white/35 focus:border-blue-500/50"
                    />

                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div className="text-sm text-white/40">
                        Ответ будет отправлен клиенту в личный кабинет.
                      </div>

                      <button className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-500">
                        Отправить сообщение →
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-[34px] border border-white/10 bg-white/[0.035] p-8">
              <SectionTitle
                label="История"
                title="События обращения"
                text="Системная история по этому обращению."
              />

              <div className="mt-8 grid gap-4">
                {ticket.history.map((item) => (
                  <TimelineItem
                    key={`${item.title}-${item.time}`}
                    title={item.title}
                    text={item.text}
                    time={item.time}
                  />
                ))}
              </div>
            </section>
          </div>

          <aside className="space-y-8">
            <section className="rounded-[34px] border border-white/10 bg-white/[0.035] p-8">
              <SectionTitle
                label="Клиент"
                title={ticket.client}
                text="Контактные данные клиента по обращению."
              />

              <div className="mt-6 grid gap-3">
                <InfoLine label="Телефон" value={ticket.phone} />
                <InfoLine label="E-mail" value={ticket.email} />
                <InfoLine label="Менеджер" value={ticket.manager} />
                <InfoLine label="Статус" value={ticket.status} />
              </div>
            </section>

            <section className="rounded-[34px] border border-white/10 bg-white/[0.035] p-8">
              <SectionTitle
                label="Связь"
                title="Привязка к заявке"
                text="Если вопрос связан с заказом, обращение получает linkedOrder."
              />

              <div className="mt-6">
                {ticket.linkedOrder ? (
                  <Link
                    href={`/nz-console/orders/${ticket.linkedOrder}`}
                    className="flex items-center justify-between gap-5 rounded-2xl border border-blue-500/30 bg-blue-500/10 p-5 transition-colors hover:bg-blue-500/15"
                  >
                    <div>
                      <div className="text-sm text-blue-300">Заявка</div>
                      <div className="mt-2 text-2xl font-bold">
                        {ticket.linkedOrder}
                      </div>
                    </div>

                    <span className="text-sm text-blue-300">Открыть →</span>
                  </Link>
                ) : (
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
                    <div className="font-semibold">Без заявки</div>
                    <p className="mt-2 text-sm leading-relaxed text-white/45">
                      Это общее обращение клиента, не связанное с конкретным
                      заказом.
                    </p>
                  </div>
                )}
              </div>
            </section>

            <section className="rounded-[34px] border border-blue-500/25 bg-blue-500/10 p-8">
              <div className="text-sm font-medium uppercase tracking-[0.2em] text-blue-400">
                Логика
              </div>

              <h2 className="mt-3 text-3xl font-bold tracking-[-0.04em]">
                Один центр коммуникации
              </h2>

              <p className="mt-4 text-sm leading-relaxed text-white/55">
                Все чаты живут в обращениях. Заявка хранит заказную часть:
                товар, SKU, сумму, доставку и статус. Обращение хранит
                переписку.
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

function TimelineItem({
  title,
  text,
  time,
}: {
  title: string;
  text: string;
  time: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="font-semibold">{title}</div>
          <p className="mt-2 text-sm leading-relaxed text-white/45">{text}</p>
        </div>

        <span className="w-fit rounded-full border border-white/10 px-3 py-1 text-xs text-white/40">
          {time}
        </span>
      </div>
    </div>
  );
}