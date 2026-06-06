"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import type {
  CustomerStatusRules,
  DiscountType,
} from "@/lib/customer-status-types";

type SaveState = "idle" | "saving" | "saved" | "error";

export function CustomerStatusSettingsForm({
  initialRules,
}: {
  initialRules: CustomerStatusRules;
}) {
  const router = useRouter();
  const [rules, setRules] = useState(initialRules);
  const [state, setState] = useState<SaveState>("idle");
  const [error, setError] = useState("");

  function update<K extends keyof CustomerStatusRules>(key: K, value: CustomerStatusRules[K]) {
    setRules((current) => ({ ...current, [key]: value }));
  }

  function updateNumber(key: keyof CustomerStatusRules, value: number) {
    update(key, Math.max(0, Math.round(value || 0)) as CustomerStatusRules[typeof key]);
  }

  async function save() {
    setState("saving");
    setError("");

    const response = await fetch("/api/admin/customer-status-settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rules }),
    }).catch(() => null);
    const payload = (await response?.json().catch(() => null)) as
      | { rules?: CustomerStatusRules; error?: string }
      | null;

    if (!response?.ok || !payload?.rules) {
      setState("error");
      setError(payload?.error || "Не удалось сохранить правила.");
      return;
    }

    setRules(payload.rules);
    setState("saved");
    router.refresh();
    window.setTimeout(() => setState("idle"), 2200);
  }

  return (
    <section className="rounded-[30px] border border-blue-500/25 bg-blue-500/10 p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="text-sm font-medium uppercase tracking-[0.18em] text-blue-400">
            Правила статусов и скидок
          </div>
          <h2 className="mt-2 text-3xl font-bold tracking-[-0.04em]">
            Новый → Постоянный → VIP
          </h2>
          <p className="mt-3 max-w-[900px] text-sm leading-relaxed text-white/55">
            Статусы считаются по завершённым заказам. Для постоянных и VIP можно назначить
            скидку в процентах или рублях и ограничить её минимальной суммой заказа и ценой товара.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void save()}
          disabled={state === "saving"}
          className="shrink-0 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-500 disabled:opacity-60"
        >
          {state === "saving" ? "Сохраняю..." : "Сохранить правила"}
        </button>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <RuleField
          label="Заказ учитывается от"
          value={rules.minOrderTotal}
          suffix="₽"
          onChange={(value) => updateNumber("minOrderTotal", value)}
        />
        <RuleField
          label="Постоянный клиент от"
          value={rules.regularOrders}
          suffix="заказов"
          min={1}
          onChange={(value) => updateNumber("regularOrders", value)}
        />
        <RuleField
          label="VIP от количества"
          value={rules.vipOrders}
          suffix="заказов"
          min={1}
          onChange={(value) => updateNumber("vipOrders", value)}
        />
        <RuleField
          label="VIP от суммы"
          value={rules.vipTotalSpent}
          suffix="₽"
          onChange={(value) => updateNumber("vipTotalSpent", value)}
        />
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-2">
        <StatusDiscountEditor
          title="Скидка постоянного клиента"
          enabled={rules.regularDiscountEnabled}
          type={rules.regularDiscountType}
          value={rules.regularDiscountValue}
          minOrderTotal={rules.regularDiscountMinOrderTotal}
          minItemPrice={rules.regularDiscountMinItemPrice}
          onEnabled={(value) => update("regularDiscountEnabled", value)}
          onType={(value) => update("regularDiscountType", value)}
          onValue={(value) => updateNumber("regularDiscountValue", value)}
          onMinOrder={(value) => updateNumber("regularDiscountMinOrderTotal", value)}
          onMinItem={(value) => updateNumber("regularDiscountMinItemPrice", value)}
        />
        <StatusDiscountEditor
          title="Скидка VIP"
          enabled={rules.vipDiscountEnabled}
          type={rules.vipDiscountType}
          value={rules.vipDiscountValue}
          minOrderTotal={rules.vipDiscountMinOrderTotal}
          minItemPrice={rules.vipDiscountMinItemPrice}
          onEnabled={(value) => update("vipDiscountEnabled", value)}
          onType={(value) => update("vipDiscountType", value)}
          onValue={(value) => updateNumber("vipDiscountValue", value)}
          onMinOrder={(value) => updateNumber("vipDiscountMinOrderTotal", value)}
          onMinItem={(value) => updateNumber("vipDiscountMinItemPrice", value)}
        />
      </div>

      <label className="mt-5 flex flex-col gap-3 rounded-2xl border border-white/10 bg-black/20 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="font-semibold">Совмещение скидки статуса и промокода</div>
          <div className="mt-1 text-sm text-white/45">
            «Суммировать» применяет обе скидки. «Лучшая» оставляет только более выгодную.
          </div>
        </div>
        <select
          value={rules.discountCombinationMode}
          onChange={(event) =>
            update("discountCombinationMode", event.target.value === "best" ? "best" : "stack")
          }
          className="h-12 rounded-xl border border-white/10 bg-[#06101f] px-4 text-sm outline-none"
        >
          <option value="stack">Суммировать</option>
          <option value="best">Только лучшая скидка</option>
        </select>
      </label>

      {state === "saved" ? (
        <div className="mt-4 text-sm text-green-300">Правила сохранены.</div>
      ) : null}
      {state === "error" ? <div className="mt-4 text-sm text-red-300">{error}</div> : null}
    </section>
  );
}

function StatusDiscountEditor({
  title,
  enabled,
  type,
  value,
  minOrderTotal,
  minItemPrice,
  onEnabled,
  onType,
  onValue,
  onMinOrder,
  onMinItem,
}: {
  title: string;
  enabled: boolean;
  type: DiscountType;
  value: number;
  minOrderTotal: number;
  minItemPrice: number;
  onEnabled: (value: boolean) => void;
  onType: (value: DiscountType) => void;
  onValue: (value: number) => void;
  onMinOrder: (value: number) => void;
  onMinItem: (value: number) => void;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
      <label className="flex items-center justify-between gap-4">
        <div className="font-bold">{title}</div>
        <input
          type="checkbox"
          checked={enabled}
          onChange={(event) => onEnabled(event.target.checked)}
          className="h-5 w-5 accent-blue-600"
        />
      </label>

      <div className={`mt-4 grid gap-3 sm:grid-cols-2 ${enabled ? "" : "pointer-events-none opacity-45"}`}>
        <label className="rounded-xl border border-white/10 bg-black/20 p-3">
          <span className="text-xs text-white/45">Тип скидки</span>
          <select
            value={type}
            onChange={(event) => onType(event.target.value === "fixed" ? "fixed" : "percent")}
            className="mt-2 w-full bg-transparent text-sm font-semibold outline-none"
          >
            <option value="percent">Проценты</option>
            <option value="fixed">Рубли</option>
          </select>
        </label>
        <RuleField
          label="Размер скидки"
          value={value}
          suffix={type === "percent" ? "%" : "₽"}
          onChange={onValue}
        />
        <RuleField label="Заказ от" value={minOrderTotal} suffix="₽" onChange={onMinOrder} />
        <RuleField label="Товар от" value={minItemPrice} suffix="₽" onChange={onMinItem} />
      </div>
    </div>
  );
}

function RuleField({
  label,
  value,
  suffix,
  min = 0,
  onChange,
}: {
  label: string;
  value: number;
  suffix: string;
  min?: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <span className="text-xs text-white/45">{label}</span>
      <div className="mt-2 flex items-center gap-3">
        <input
          type="number"
          min={min}
          value={value}
          onChange={(event) => onChange(Number(event.target.value))}
          className="min-w-0 flex-1 bg-transparent text-2xl font-bold outline-none"
        />
        <span className="text-sm text-white/45">{suffix}</span>
      </div>
    </label>
  );
}
