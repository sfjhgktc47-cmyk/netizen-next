import Link from "next/link";
import { notFound } from "next/navigation";

const orders = [
  {
    id: "NZ-1024",
    client: "Гость Нетизен",
    phone: "+7 999 000-00-00",
    email: "guest@netizen.ru",
    city: "Москва",
    delivery: {
      type: "courier",
      label: "Курьерская доставка",
      address: "Москва, ул. Тверская, 1, кв. 25",
      pickupPointId: "",
      pickupPointLabel: "",
    },
    crm: {
      exportStatus: "pending",
      exportStatusLabel: "Ожидает отправки",
      crmOrderId: "",
      lastSyncAt: "",
      syncError: "",
    },
    productCard: "iPhone 17 Pro",
    position: "iPhone 17 Pro 256 GB Silver eSIM",
    sku: "IP17P-256-SILVER-ESIM",
    quantity: 1,
    price: "109 990 ₽",
    total: "109 990 ₽",
    status: "Новая",
    source: "Корзина",
    date: "Сегодня, 14:20",
    comment: "Хочу уточнить наличие и срок доставки.",
  },
  {
    id: "NZ-1023",
    client: "Гость Нетизен",
    phone: "+7 999 111-22-33",
    email: "guest@netizen.ru",
    city: "Санкт-Петербург",
    delivery: {
      type: "pickup_point",
      label: "Пункт выдачи",
      address: "",
      pickupPointId: "PVZ-SPB-NEVSKY-10",
      pickupPointLabel: "Санкт-Петербург, Невский проспект, 10",
    },
    crm: {
      exportStatus: "pending",
      exportStatusLabel: "Ожидает отправки",
      crmOrderId: "",
      lastSyncAt: "",
      syncError: "",
    },
    productCard: "AirPods Pro",
    position: "AirPods Pro USB-C White",
    sku: "APPRO-USBC-WHITE",
    quantity: 1,
    price: "24 990 ₽",
    total: "24 990 ₽",
    status: "Ожидает подтверждения",
    source: "Карточка товара",
    date: "Сегодня, 12:05",
    comment: "Нужно подтвердить комплектацию.",
  },
  {
    id: "NZ-1022",
    client: "Иван",
    phone: "+7 999 222-33-44",
    email: "ivan@example.ru",
    city: "Москва",
    delivery: {
      type: "pickup_point",
      label: "Пункт выдачи",
      address: "",
      pickupPointId: "PVZ-MSK-TVERSKAYA-7",
      pickupPointLabel: "Москва, ул. Тверская, 7",
    },
    crm: {
      exportStatus: "synced",
      exportStatusLabel: "Отправлено",
      crmOrderId: "CRM-88421",
      lastSyncAt: "Вчера, 19:05",
      syncError: "",
    },
    productCard: "MacBook Pro 14",
    position: "MacBook Pro 14 M4 16/512 Space Black",
    sku: "MBP14-M4-16-512-BLACK",
    quantity: 1,
    price: "189 990 ₽",
    total: "189 990 ₽",
    status: "В работе",
    source: "Каталог",
    date: "Вчера, 18:40",
    comment: "Клиент ждёт звонка менеджера.",
  },
  {
    id: "NZ-1021",
    client: "Мария",
    phone: "+7 999 333-44-55",
    email: "maria@example.ru",
    city: "Москва",
    delivery: {
      type: "courier",
      label: "Курьерская доставка",
      address: "Москва, Кутузовский проспект, 18, кв. 44",
      pickupPointId: "",
      pickupPointLabel: "",
    },
    crm: {
      exportStatus: "synced",
      exportStatusLabel: "Отправлено",
      crmOrderId: "CRM-88390",
      lastSyncAt: "12 мая, 16:40",
      syncError: "",
    },
    productCard: "iPhone 17 Pro",
    position: "iPhone 17 Pro 512 GB Silver eSIM",
    sku: "IP17P-512-SILVER-ESIM",
    quantity: 2,
    price: "129 990 ₽",
    total: "259 980 ₽",
    status: "Завершена",
    source: "Корзина",
    date: "12 мая, 16:10",
    comment: "Заказ завершён.",
  },
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

function getCrmStatusClass(status: string) {
  if (status === "pending") {
    return "border-orange-500/35 bg-orange-500/10 text-orange-300";
  }

  if (status === "synced") {
    return "border-green-500/35 bg-green-500/10 text-green-300";
  }

  if (status === "error") {
    return "border-red-500/35 bg-red-500/10 text-red-300";
  }

  return "border-white/10 bg-white/[0.03] text-white/50";
}

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const order = orders.find((item) => item.id === id);

  if (!order) {
    notFound();
  }

  const isCourier = order.delivery.type === "courier";
  const isPickupPoint = order.delivery.type === "pickup_point";

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
            <span>Заявка</span>
            <span>·</span>
            <span>{order.id}</span>
          </div>

          <Link
            href="/nz-console/orders"
            className="rounded-xl border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-medium transition-colors hover:border-blue-500/40 hover:bg-blue-500/10"
          >
            К заявкам →
          </Link>
        </header>

        <section className="mt-10">
          <Link
            href="/nz-console/orders"
            className="text-sm text-blue-400 transition-colors hover:text-blue-300"
          >
            ← Назад к заявкам
          </Link>

          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
            <div className="rounded-[34px] border border-white/10 bg-white/[0.035] p-8">
              <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="text-sm font-medium uppercase tracking-[0.2em] text-blue-400">
                    Заявка
                  </div>

                  <h1 className="mt-3 text-5xl font-bold tracking-[-0.055em]">
                    {order.id}
                  </h1>

                  <p className="mt-4 max-w-[720px] text-sm leading-relaxed text-white/55">
                    Заявка создана из источника “{order.source}”. Внутри
                    хранится конкретная позиция / SKU, количество, сумма и
                    технические поля для будущей CRM-интеграции.
                  </p>
                </div>

                <span
                  className={`inline-flex w-fit whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium ${getStatusClass(
                    order.status
                  )}`}
                >
                  {order.status}
                </span>
              </div>

              <div className="mt-8 grid gap-4 md:grid-cols-3">
                <InfoCard label="Дата" value={order.date} />
                <InfoCard label="Источник" value={order.source} />
                <InfoCard label="Итого" value={order.total} />
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
                  Подтвердить заявку
                </button>

                <button className="rounded-xl border border-white/10 bg-white/[0.03] px-5 py-4 text-sm font-medium transition-colors hover:border-blue-500/40 hover:bg-blue-500/10">
                  Создать обращение
                </button>

                <button className="rounded-xl border border-white/10 bg-white/[0.03] px-5 py-4 text-sm font-medium text-white/55 transition-colors hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-300">
                  Отменить заявку
                </button>
              </div>
            </aside>
          </div>
        </section>

        <section className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
          <div className="space-y-8">
            <section className="rounded-[34px] border border-white/10 bg-white/[0.035] p-8">
              <SectionTitle
                label="Товар"
                title="Позиция в заявке"
                text="Клиент выбрал конкретную конфигурацию. Именно она должна уходить менеджеру, в складской учёт и будущую CRM."
              />

              <div className="mt-8 rounded-3xl border border-white/10 bg-black/20 p-6">
                <div className="grid gap-6 md:grid-cols-[120px_1fr] md:items-start">
                  <div className="flex h-28 w-28 items-center justify-center rounded-2xl bg-white/[0.045] text-xs text-white/25">
                    Фото
                  </div>

                  <div>
                    <div className="text-sm text-white/45">
                      {order.productCard}
                    </div>

                    <h2 className="mt-1 text-2xl font-bold tracking-[-0.035em]">
                      {order.position}
                    </h2>

                    <div className="mt-3 text-sm text-white/45">
                      SKU {order.sku}
                    </div>

                    <div className="mt-6 grid gap-4 md:grid-cols-3">
                      <InfoCard label="Цена" value={order.price} />
                      <InfoCard
                        label="Количество"
                        value={String(order.quantity)}
                      />
                      <InfoCard label="Сумма" value={order.total} />
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-[34px] border border-white/10 bg-white/[0.035] p-8">
              <SectionTitle
                label="Доставка"
                title="Способ получения"
                text="Менеджер видит понятное описание, а CRM получает технический тип доставки и нужные поля."
              />

              <div className="mt-8 grid gap-4 md:grid-cols-2">
                <InfoCard label="Тип" value={order.delivery.label} />
                <InfoCard label="Город" value={order.city} />

                {isCourier && (
                  <div className="md:col-span-2">
                    <InfoCard label="Адрес курьерской доставки" value={order.delivery.address} />
                  </div>
                )}

                {isPickupPoint && (
                  <>
                    <InfoCard label="ПВЗ" value={order.delivery.pickupPointLabel} />
                    <InfoCard label="ID ПВЗ" value={order.delivery.pickupPointId} />
                  </>
                )}
              </div>
            </section>

            <section className="rounded-[34px] border border-white/10 bg-white/[0.035] p-8">
              <SectionTitle
                label="Комментарий"
                title="Сообщение клиента"
                text="Здесь будет комментарий из корзины, карточки товара или формы заявки."
              />

              <div className="mt-8 rounded-2xl border border-white/10 bg-black/20 p-5 text-sm leading-relaxed text-white/65">
                {order.comment}
              </div>
            </section>

            <section className="rounded-[34px] border border-white/10 bg-white/[0.035] p-8">
              <SectionTitle
                label="История"
                title="События по заявке"
                text="Позже здесь будет реальная история действий менеджера и системных уведомлений."
              />

              <div className="mt-8 grid gap-4">
                <TimelineItem
                  title="Заявка создана"
                  text={`${order.date} · источник: ${order.source}`}
                />

                <TimelineItem
                  title="Позиция добавлена в заявку"
                  text={`${order.position} · ${order.quantity} шт.`}
                />

                <TimelineItem
                  title="Выбран способ получения"
                  text={
                    isCourier
                      ? `${order.delivery.label} · ${order.delivery.address}`
                      : `${order.delivery.label} · ${order.delivery.pickupPointLabel}`
                  }
                />

                <TimelineItem
                  title="Ожидает действия менеджера"
                  text="Нужно подтвердить наличие и при необходимости создать обращение для переписки с клиентом."
                />
              </div>
            </section>
          </div>

          <aside className="space-y-8">
            <section className="rounded-[34px] border border-white/10 bg-white/[0.035] p-8">
              <SectionTitle
                label="Клиент"
                title={order.client}
                text="Контактные данные клиента для подтверждения заявки."
              />

              <div className="mt-6 grid gap-3">
                <InfoLine label="Телефон" value={order.phone} />
                <InfoLine label="E-mail" value={order.email} />
                <InfoLine label="Город" value={order.city} />
                <InfoLine label="Способ получения" value={order.delivery.label} />

                {isCourier ? (
                  <InfoLine label="Адрес" value={order.delivery.address} />
                ) : (
                  <InfoLine label="ПВЗ" value={order.delivery.pickupPointLabel} />
                )}
              </div>
            </section>

            <section className="rounded-[34px] border border-white/10 bg-white/[0.035] p-8">
              <SectionTitle
                label="CRM"
                title="Интеграция"
                text="Технические поля для будущей синхронизации заявки с CRM или МойСклад."
              />

              <div className="mt-6 grid gap-3">
                <div className="flex items-center justify-between gap-5 rounded-2xl border border-white/10 bg-black/20 p-4 text-sm">
                  <span className="text-white/45">Статус экспорта</span>
                  <span
                    className={`inline-flex whitespace-nowrap rounded-full border px-3 py-1 text-xs font-medium ${getCrmStatusClass(
                      order.crm.exportStatus
                    )}`}
                  >
                    {order.crm.exportStatusLabel}
                  </span>
                </div>

                <InfoLine
                  label="CRM ID"
                  value={order.crm.crmOrderId || "Не создан"}
                />

                <InfoLine label="delivery.type" value={order.delivery.type} />

                {isPickupPoint && (
                  <InfoLine
                    label="pickupPointId"
                    value={order.delivery.pickupPointId}
                  />
                )}

                {isCourier && (
                  <InfoLine
                    label="delivery.address"
                    value={order.delivery.address}
                  />
                )}

                <InfoLine
                  label="Последняя синхронизация"
                  value={order.crm.lastSyncAt || "Не выполнялась"}
                />

                <InfoLine label="Ошибка" value={order.crm.syncError || "Нет"} />
              </div>
            </section>

            <section className="rounded-[34px] border border-blue-500/25 bg-blue-500/10 p-8">
              <div className="text-sm font-medium uppercase tracking-[0.2em] text-blue-400">
                Логика
              </div>

              <h2 className="mt-3 text-3xl font-bold tracking-[-0.04em]">
                Почему важны техполя
              </h2>

              <p className="mt-4 text-sm leading-relaxed text-white/55">
                Менеджер видит красивое описание доставки, а CRM получает
                стабильные значения: delivery.type, адрес или ID ПВЗ, CRM ID и
                статус синхронизации. Так интеграция не будет зависеть от
                произвольного текста.
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

function TimelineItem({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
      <div className="font-semibold">{title}</div>
      <p className="mt-2 text-sm leading-relaxed text-white/45">{text}</p>
    </div>
  );
}