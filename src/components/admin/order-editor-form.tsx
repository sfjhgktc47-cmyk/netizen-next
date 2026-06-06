"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

export type OrderCustomerOption = {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  city: string;
  addresses: Array<{ id: string; type: string; value: string; isDefault: boolean }>;
};

export type OrderPositionOption = {
  id: string;
  productId: string;
  sku: string;
  title: string;
  productTitle: string;
  brand: string;
  memory: string;
  color: string;
  sim: string;
  price: number;
  stock: number;
  status: string;
  image: string;
};

export type OrderStaffOption = { id: string; name: string; login: string };

type DraftItem = {
  variantId: string;
  quantity: number;
  price: number;
};

type InitialOrder = {
  publicId: string;
  customerId: string;
  customerName: string;
  phone: string;
  email: string;
  deliveryType: "courier" | "pickup";
  address: string;
  pickupPoint: string;
  paymentMethod: string;
  status: string;
  comment: string;
  managerComment: string;
  assignedToId: string;
  items: DraftItem[];
};

export function OrderEditorForm({
  mode,
  customers,
  positions,
  staff,
  initialOrder,
  defaultAssigneeId = "",
}: {
  mode: "create" | "edit";
  customers: OrderCustomerOption[];
  positions: OrderPositionOption[];
  staff: OrderStaffOption[];
  initialOrder?: InitialOrder;
  defaultAssigneeId?: string;
}) {
  const router = useRouter();
  const firstPosition = positions[0];
  const [customerId, setCustomerId] = useState(initialOrder?.customerId || "");
  const [customerName, setCustomerName] = useState(initialOrder?.customerName || "");
  const [phone, setPhone] = useState(initialOrder?.phone || "");
  const [email, setEmail] = useState(initialOrder?.email || "");
  const [deliveryType, setDeliveryType] = useState<"courier" | "pickup">(initialOrder?.deliveryType || "courier");
  const [address, setAddress] = useState(initialOrder?.address || "");
  const [pickupPoint, setPickupPoint] = useState(initialOrder?.pickupPoint || "");
  const [paymentMethod, setPaymentMethod] = useState(initialOrder?.paymentMethod || "cash");
  const [status, setStatus] = useState(initialOrder?.status || "new");
  const [comment, setComment] = useState(initialOrder?.comment || "");
  const [managerComment, setManagerComment] = useState(initialOrder?.managerComment || "");
  const [assignedToId, setAssignedToId] = useState(initialOrder?.assignedToId || defaultAssigneeId);
  const [items, setItems] = useState<DraftItem[]>(
    initialOrder?.items?.length
      ? initialOrder.items
      : firstPosition
        ? [{ variantId: firstPosition.id, quantity: 1, price: firstPosition.price }]
        : [],
  );
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const positionMap = useMemo(() => new Map(positions.map((position) => [position.id, position])), [positions]);
  const total = items.reduce((sum, item) => sum + Math.max(1, item.quantity) * Math.max(0, item.price), 0);

  function chooseCustomer(id: string) {
    setCustomerId(id);
    const customer = customers.find((item) => item.id === id);
    if (!customer) return;
    setCustomerName(customer.fullName);
    setPhone(customer.phone);
    setEmail(customer.email);
    const preferredAddress = customer.addresses.find((item) => item.isDefault) || customer.addresses[0];
    if (preferredAddress) {
      if (preferredAddress.type === "pickup") setPickupPoint(preferredAddress.value);
      else setAddress(preferredAddress.value);
    }
  }

  function changePosition(index: number, variantId: string) {
    const position = positionMap.get(variantId);
    setItems((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index
          ? { variantId, quantity: item.quantity || 1, price: position?.price || item.price || 1 }
          : item,
      ),
    );
  }

  async function submit() {
    if (!customerName.trim() || !phone.trim()) {
      setMessage("Укажи имя и телефон клиента.");
      return;
    }
    if (!items.length) {
      setMessage("Добавь хотя бы один товар.");
      return;
    }
    if (!window.confirm(mode === "create" ? "Создать заявку?" : "Сохранить изменения заявки?")) return;

    setSaving(true);
    setMessage("");
    try {
      const response = await fetch(
        mode === "create" ? "/api/admin/orders" : `/api/admin/orders/${initialOrder?.publicId}`,
        {
          method: mode === "create" ? "POST" : "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            customerId,
            customerName,
            phone,
            email,
            deliveryType,
            address,
            pickupPoint,
            paymentMethod,
            status,
            comment,
            managerComment,
            assignedToId: assignedToId || null,
            items,
          }),
        },
      );
      const payload = (await response.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
        order?: { publicId?: string };
      };
      if (!response.ok || !payload.ok) throw new Error(payload.error || "Не удалось сохранить заявку.");

      const publicId = payload.order?.publicId || initialOrder?.publicId;
      if (publicId) {
        router.push(`/nz-console/orders/${publicId}`);
        router.refresh();
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Ошибка сохранения.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-[30px] border border-white/10 bg-white/[0.035] p-5 sm:p-7">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-400">
            {mode === "create" ? "Новая заявка" : "Редактор заявки"}
          </div>
          <h2 className="mt-2 text-3xl font-bold tracking-[-0.045em]">
            {mode === "create" ? "Создать вручную" : "Изменить данные и товары"}
          </h2>
        </div>
        <Link href="/nz-console/orders" className="rounded-xl border border-white/10 px-4 py-3 text-sm text-white/65">
          К списку
        </Link>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Field label="Выбрать существующего клиента">
          <select value={customerId} onChange={(event) => chooseCustomer(event.target.value)} className={inputClass}>
            <option value="">Новый / без выбора</option>
            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>{customer.fullName} · {customer.phone}</option>
            ))}
          </select>
        </Field>
        <Field label="Имя клиента"><input value={customerName} onChange={(e) => setCustomerName(e.target.value)} className={inputClass} /></Field>
        <Field label="Телефон"><input value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} /></Field>
        <Field label="E-mail"><input value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} /></Field>
        <Field label="Ответственный">
          <select value={assignedToId} onChange={(e) => setAssignedToId(e.target.value)} className={inputClass}>
            <option value="">Без ответственного</option>
            {staff.map((member) => <option key={member.id} value={member.id}>{member.name || member.login}</option>)}
          </select>
        </Field>
        <Field label="Статус">
          <select value={status} onChange={(e) => setStatus(e.target.value)} className={inputClass}>
            <option value="new">Новая</option><option value="confirming">Ожидает подтверждения</option>
            <option value="in_work">В работе</option><option value="ready">Готова</option>
            <option value="completed">Завершена</option><option value="cancelled">Отменена</option>
          </select>
        </Field>
        <Field label="Способ получения">
          <select value={deliveryType} onChange={(e) => setDeliveryType(e.target.value as "courier" | "pickup")} className={inputClass}>
            <option value="courier">Курьерская доставка</option><option value="pickup">ПВЗ / самовывоз</option>
          </select>
        </Field>
        {deliveryType === "courier" ? (
          <Field label="Адрес доставки"><input value={address} onChange={(e) => setAddress(e.target.value)} className={inputClass} /></Field>
        ) : (
          <Field label="ПВЗ / точка самовывоза"><input value={pickupPoint} onChange={(e) => setPickupPoint(e.target.value)} className={inputClass} /></Field>
        )}
        <Field label="Оплата">
          <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className={inputClass}>
            <option value="cash">Наличными при получении</option><option value="card_on_delivery">Картой при получении</option>
            <option value="bank_transfer">Перевод / счёт</option>
          </select>
        </Field>
      </div>

      <div className="mt-7">
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-xl font-bold">Товары и SKU</h3>
          <button
            type="button"
            disabled={!positions.length}
            onClick={() => firstPosition && setItems((current) => [...current, { variantId: firstPosition.id, quantity: 1, price: firstPosition.price }])}
            className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold disabled:opacity-40"
          >
            + Добавить товар
          </button>
        </div>

        <div className="mt-4 grid gap-3">
          {items.map((item, index) => {
            const position = positionMap.get(item.variantId);
            return (
              <div key={`${item.variantId}-${index}`} className="grid gap-3 rounded-2xl border border-white/10 bg-black/20 p-4 lg:grid-cols-[minmax(280px,1fr)_120px_150px_auto] lg:items-end">
                <Field label="Позиция / SKU">
                  <select value={item.variantId} onChange={(e) => changePosition(index, e.target.value)} className={inputClass}>
                    {positions.map((option) => (
                      <option key={option.id} value={option.id}>{option.productTitle} · {option.sku} · остаток {option.stock}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Количество"><input type="number" min={1} value={item.quantity} onChange={(e) => setItems((current) => current.map((value, i) => i === index ? { ...value, quantity: Math.max(1, Number(e.target.value) || 1) } : value))} className={inputClass} /></Field>
                <Field label="Цена, ₽"><input type="number" min={1} value={item.price} onChange={(e) => setItems((current) => current.map((value, i) => i === index ? { ...value, price: Math.max(1, Number(e.target.value) || 1) } : value))} className={inputClass} /></Field>
                <button type="button" onClick={() => setItems((current) => current.filter((_, i) => i !== index))} className="h-12 rounded-xl border border-red-500/30 bg-red-500/10 px-4 text-sm text-red-200">Удалить</button>
                {position ? <div className="text-xs text-white/40 lg:col-span-4">{position.brand} · {position.memory} · {position.color} · {position.sim}</div> : null}
              </div>
            );
          })}
          {!items.length ? <div className="rounded-2xl border border-dashed border-white/15 p-6 text-sm text-white/45">Товары не добавлены.</div> : null}
        </div>
      </div>

      <div className="mt-7 grid gap-4 md:grid-cols-2">
        <Field label="Комментарий клиента"><textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={4} className={textareaClass} /></Field>
        <Field label="Внутренний комментарий менеджера"><textarea value={managerComment} onChange={(e) => setManagerComment(e.target.value)} rows={4} className={textareaClass} /></Field>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-2xl font-bold">Итого: {new Intl.NumberFormat("ru-RU").format(total)} ₽</div>
        <button type="button" onClick={() => void submit()} disabled={saving} className="rounded-xl bg-blue-600 px-7 py-4 text-sm font-semibold hover:bg-blue-500 disabled:opacity-50">
          {saving ? "Сохраняю..." : mode === "create" ? "Создать заявку" : "Сохранить изменения"}
        </button>
      </div>
      {message ? <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">{message}</div> : null}
    </div>
  );
}

const inputClass = "mt-2 h-12 w-full rounded-xl border border-white/10 bg-black/20 px-4 text-sm text-white outline-none focus:border-blue-500/50";
const textareaClass = "mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-blue-500/50";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="text-xs font-semibold uppercase tracking-[0.16em] text-white/45">{label}</span>{children}</label>;
}
