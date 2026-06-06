"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import type { CustomerStatusRules } from "@/lib/customer-status-types";

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

  function update(key: keyof CustomerStatusRules, value: number) {
    setRules((current) => ({ ...current, [key]: Math.max(0, Math.round(value || 0)) }));
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
            Правила статусов
          </div>
          <h2 className="mt-2 text-3xl font-bold tracking-[-0.04em]">
            Новый → Постоянный → VIP
          </h2>
          <p className="mt-3 max-w-[820px] text-sm leading-relaxed text-white/55">
            В расчёт попадают только завершённые заказы не дешевле указанной суммы.
            VIP присваивается при выполнении любого из двух условий: количество заказов или сумма покупок.
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
          onChange={(value) => update("minOrderTotal", value)}
        />
        <RuleField
          label="Постоянный клиент от"
          value={rules.regularOrders}
          suffix="заказов"
          min={1}
          onChange={(value) => update("regularOrders", value)}
        />
        <RuleField
          label="VIP от количества"
          value={rules.vipOrders}
          suffix="заказов"
          min={1}
          onChange={(value) => update("vipOrders", value)}
        />
        <RuleField
          label="VIP от суммы"
          value={rules.vipTotalSpent}
          suffix="₽"
          onChange={(value) => update("vipTotalSpent", value)}
        />
      </div>

      {state === "saved" ? (
        <div className="mt-4 text-sm text-green-300">Правила сохранены. Статусы пересчитаются автоматически.</div>
      ) : null}
      {state === "error" ? (
        <div className="mt-4 text-sm text-red-300">{error}</div>
      ) : null}
    </section>
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
