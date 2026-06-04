import Link from "next/link";
import Image from 'next/image';
import { notFound } from "next/navigation";
import { OrderStatusForm } from "@/components/admin/order-status-form";
import {
  formatAdminDate,
  formatAdminPrice,
  getAdminOrder,
  getDeliveryLabel,
  getOrderStatusClass,
  getOrderStatusLabel,
} from "@/lib/admin-orders-db";

export const dynamic = "force-dynamic";

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getAdminOrder(id);

  if (!order) {
    notFound();
  }

  const deliveryValue =
    order.deliveryType === "pickup"
      ? order.pickupPoint || "ПВЗ не указан"
      : order.address || "Адрес не указан";

  return (
    <main className="min-h-screen bg-[#020814] px-6 py-6 text-white">
      <div className="mx-auto max-w-[1440px]">
        <header className="flex min-h-[76px] items-center justify-between rounded-2xl border border-white/10 bg-white/[0.035] px-6">
          <Link href="/nz-console" className="text-xl font-bold tracking-[-0.04em]">
            Netizen Console
          </Link>

          <div className="hidden items-center gap-3 text-sm text-white/55 md:flex">
            <span>Заявка</span>
            <span>·</span>
            <span>{order.publicId}</span>
          </div>

          <Link
            href="/nz-console/orders"
            className="rounded-xl border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-medium transition-colors hover:border-blue-500/40 hover:bg-blue-500/10"
          >
            К заявкам →
          </Link>
        </header>

        <section className="mt-10">
          <Link href="/nz-console/orders" className="text-sm text-blue-400 transition-colors hover:text-blue-300">
            ← Назад к заявкам
          </Link>

          <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
            <div className="rounded-[32px] border border-white/10 bg-white/[0.035] p-8">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.34em] text-blue-400">
                    Заявка
                  </div>
                  <h1 className="mt-3 text-5xl font-bold tracking-[-0.055em]">
                    {order.publicId}
                  </h1>
                  <p className="mt-3 text-sm text-white/45">
                    Создана: {formatAdminDate(order.createdAt)}
                  </p>
                </div>

                <span className={`inline-flex rounded-full border px-4 py-2 text-sm ${getOrderStatusClass(order.status)}`}>
                  {getOrderStatusLabel(order.status, order.deliveryType)}
                </span>
              </div>

              <div className="mt-8 grid gap-4 md:grid-cols-3">
                <InfoCard label="Клиент" value={order.customerName} hint={order.phone} />
                <InfoCard label="E-mail" value={order.email || "Не указан"} />
                <InfoCard label="Сумма" value={formatAdminPrice(order.total)} />
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <InfoCard label="Получение" value={getDeliveryLabel(order.deliveryType)} hint={deliveryValue} />
                <InfoCard label="Оплата" value="Наличными при получении" hint="Онлайн-оплаты нет" />
              </div>

              {order.comment && (
                <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-5">
                  <div className="text-xs font-semibold uppercase tracking-[0.22em] text-white/45">
                    Комментарий
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-white/70">{order.comment}</p>
                </div>
              )}
            </div>

            <OrderStatusForm
              orderId={order.publicId}
              initialStatus={order.status}
              initialComment={order.comment}
              deliveryType={order.deliveryType}
            />
          </div>
        </section>

        <section className="mt-6 overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.035]">
          <div className="border-b border-white/10 bg-black/25 px-6 py-5">
            <div className="text-xs font-semibold uppercase tracking-[0.34em] text-blue-400">
              Состав заявки
            </div>
            <h2 className="mt-2 text-2xl font-bold tracking-[-0.04em]">
              Товары / SKU
            </h2>
          </div>

          {order.items.map((item) => (
            <div
              key={item.id}
              className="grid gap-4 border-b border-white/10 px-6 py-5 last:border-b-0 md:grid-cols-[80px_1fr_0.55fr_0.55fr_0.55fr] md:items-center"
            >
              <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl bg-white/[0.04] text-xs text-white/35">
                {item.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <Image quality={75} src={item.image} alt={item.title} className="h-full w-full object-cover" />
                ) : (
                  "Фото"
                )}
              </div>

              <div>
                <div className="font-bold">{item.title}</div>
                <div className="mt-1 text-xs text-white/45">SKU {item.sku}</div>
                <div className="mt-2 flex flex-wrap gap-2 text-xs text-white/55">
                  {item.memory && <span>{item.memory}</span>}
                  {item.color && <span>{item.color}</span>}
                  {item.sim && <span>{item.sim}</span>}
                </div>
              </div>

              <div>
                <div className="text-xs text-white/45">Цена</div>
                <div className="mt-1 font-semibold">{formatAdminPrice(item.price)}</div>
              </div>

              <div>
                <div className="text-xs text-white/45">Кол-во</div>
                <div className="mt-1 font-semibold">{item.quantity} шт.</div>
              </div>

              <div>
                <div className="text-xs text-white/45">Итого</div>
                <div className="mt-1 font-bold">{formatAdminPrice(item.price * item.quantity)}</div>
              </div>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}

function InfoCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
      <div className="text-xs font-semibold uppercase tracking-[0.22em] text-white/45">
        {label}
      </div>
      <div className="mt-2 text-lg font-bold">{value}</div>
      {hint && <div className="mt-1 text-sm text-white/45">{hint}</div>}
    </div>
  );
}
