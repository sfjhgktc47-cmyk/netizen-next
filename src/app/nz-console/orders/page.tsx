import Link from "next/link";
import {
  formatAdminDate,
  formatAdminPrice,
  getAdminOrders,
  getDeliveryLabel,
  getOrderMetrics,
  getOrderStatusClass,
  getOrderStatusLabel,
} from "@/lib/admin-orders-db";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const [orders, metrics] = await Promise.all([getAdminOrders(), getOrderMetrics()]);

  const tabs = [
    { label: "Все", count: orders.length, active: true },
    { label: "Новые", count: orders.filter((order) => order.status === "new").length, active: false },
    { label: "Ожидают", count: orders.filter((order) => order.status === "confirming").length, active: false },
    { label: "В работе", count: orders.filter((order) => order.status === "in_work").length, active: false },
    { label: "Завершены", count: orders.filter((order) => order.status === "completed").length, active: false },
    { label: "Отменены", count: orders.filter((order) => order.status === "cancelled").length, active: false },
  ];

  return (
    <main className="min-h-screen bg-[#020814] px-6 py-6 text-white">
      <div className="mx-auto max-w-[1600px]">
        <header className="flex min-h-[76px] items-center justify-between rounded-2xl border border-white/10 bg-white/[0.035] px-6">
          <Link href="/nz-console" className="text-xl font-bold tracking-[-0.04em]">
            Netizen Console
          </Link>

          <div className="hidden items-center gap-3 text-sm text-white/55 md:flex">
            <span>Заявки</span>
            <span>·</span>
            <span>PostgreSQL</span>
          </div>

          <Link
            href="/"
            className="rounded-xl border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-medium transition-colors hover:border-blue-500/40 hover:bg-blue-500/10"
          >
            На сайт →
          </Link>
        </header>

        <section className="mt-10">
          <Link href="/nz-console" className="text-sm text-blue-400 transition-colors hover:text-blue-300">
            ← В админку
          </Link>

          <div className="mt-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="inline-flex rounded-full border border-blue-500/35 bg-blue-500/10 px-4 py-2 text-sm font-medium text-blue-400">
                Заявки из БД
              </div>

              <h1 className="mt-5 text-5xl font-bold tracking-[-0.055em]">
                Заявки
              </h1>

              <p className="mt-4 max-w-[780px] text-sm leading-relaxed text-white/55">
                Здесь появляются реальные заявки из корзины. В заявке сохраняется конкретная позиция / SKU,
                цена на момент оформления, данные клиента и способ получения.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/catalog"
                className="rounded-xl border border-white/10 bg-white/[0.03] px-7 py-4 text-sm font-medium transition-colors hover:border-blue-500/40 hover:bg-blue-500/10"
              >
                Создать через сайт
              </Link>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-5 md:grid-cols-4">
          <MetricCard label="Всего заявок" value={String(metrics.total)} />
          <MetricCard label="Новые" value={String(metrics.new)} />
          <MetricCard label="В работе" value={String(metrics.inWork)} />
          <MetricCard label="Сумма сегодня" value={formatAdminPrice(metrics.todayTotal)} />
        </section>

        <section className="mt-8">
          <div className="flex flex-wrap gap-2 border-b border-white/10">
            {tabs.map((tab) => (
              <button
                key={tab.label}
                className={`relative px-4 py-4 text-sm font-medium transition-colors ${
                  tab.active ? "text-white" : "text-white/45 hover:text-white"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`ml-2 rounded-full px-2 py-0.5 text-xs ${
                    tab.active ? "bg-blue-600 text-white" : "bg-white/10 text-white/45"
                  }`}
                >
                  {tab.count}
                </span>
                {tab.active && <span className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full bg-blue-500" />}
              </button>
            ))}
          </div>
        </section>

        <section className="mt-6 rounded-[28px] border border-white/10 bg-white/[0.035] p-5">
          <div className="flex flex-col gap-3 md:flex-row">
            <input
              placeholder="Поиск подключим следующим шагом"
              className="h-12 flex-1 rounded-xl border border-white/10 bg-black/20 px-5 text-sm text-white outline-none placeholder:text-white/35 focus:border-blue-500/50"
              disabled
            />
            <button className="rounded-xl border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-medium text-white/60">
              Статус
            </button>
            <button className="rounded-xl border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-medium text-white/60">
              Дата
            </button>
          </div>
        </section>

        <section className="mt-6 overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.035]">
          <div className="hidden grid-cols-[0.7fr_1fr_1.55fr_0.75fr_0.8fr_0.85fr_120px] border-b border-white/10 bg-black/25 px-5 py-4 text-sm text-white/45 xl:grid">
            <div>Заявка</div>
            <div>Клиент</div>
            <div>Товары</div>
            <div>Сумма</div>
            <div>Получение</div>
            <div>Статус</div>
            <div className="text-right">Открыть</div>
          </div>

          {orders.length === 0 ? (
            <div className="p-10 text-center text-sm text-white/45">
              Заявок пока нет. Оформите тестовую заявку через корзину сайта.
            </div>
          ) : (
            orders.map((order) => {
              const firstItem = order.items[0];
              const itemsLabel = order.items
                .map((item) => `${item.title} × ${item.quantity}`)
                .join(", ");

              return (
                <div
                  key={order.id}
                  className="grid gap-4 border-b border-white/10 px-5 py-5 last:border-b-0 xl:grid-cols-[0.7fr_1fr_1.55fr_0.75fr_0.8fr_0.85fr_120px] xl:items-center"
                >
                  <div>
                    <div className="font-bold">{order.publicId}</div>
                    <div className="mt-1 text-xs text-white/45">{formatAdminDate(order.createdAt)}</div>
                  </div>

                  <div>
                    <div className="font-semibold">{order.customerName}</div>
                    <div className="mt-1 text-xs text-white/45">{order.phone}</div>
                  </div>

                  <div>
                    <div className="font-semibold">{itemsLabel || "Без товаров"}</div>
                    <div className="mt-1 text-xs text-white/45">{firstItem?.sku ?? "SKU не указан"}</div>
                  </div>

                  <div className="font-bold">{formatAdminPrice(order.total)}</div>

                  <div className="text-sm text-white/70">
                    {getDeliveryLabel(order.deliveryType)}
                  </div>

                  <div>
                    <span className={`inline-flex rounded-full border px-3 py-1 text-xs ${getOrderStatusClass(order.status)}`}>
                      {getOrderStatusLabel(order.status)}
                    </span>
                  </div>

                  <div className="xl:text-right">
                    <Link
                      href={`/nz-console/orders/${order.publicId}`}
                      className="inline-flex rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-semibold transition-colors hover:border-blue-500/40 hover:bg-blue-500/10"
                    >
                      Открыть
                    </Link>
                  </div>
                </div>
              );
            })
          )}
        </section>
      </div>
    </main>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[26px] border border-white/10 bg-white/[0.035] p-6">
      <div className="text-sm text-white/45">{label}</div>
      <div className="mt-3 text-4xl font-bold tracking-[-0.05em]">{value}</div>
    </div>
  );
}
