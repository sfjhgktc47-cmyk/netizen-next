"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { orderStatusOptions } from "@/lib/order-status";

type OrderStatusFormProps = {
  orderId: string;
  initialStatus: string;
  initialComment: string;
};

export function OrderStatusForm({
  orderId,
  initialStatus,
  initialComment,
}: OrderStatusFormProps) {
  const router = useRouter();
  const [status, setStatus] = useState(initialStatus);
  const [comment, setComment] = useState(initialComment);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function saveOrder() {
    setIsSaving(true);
    setMessage("");

    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status, comment }),
      });

      const result = (await response.json()) as { ok?: boolean; error?: string };

      if (!response.ok || !result.ok) {
        throw new Error(result.error || "Не удалось сохранить заявку.");
      }

      setMessage("Сохранено");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Ошибка сохранения");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="rounded-[28px] border border-white/10 bg-white/[0.035] p-6">
      <div className="text-xs font-semibold uppercase tracking-[0.34em] text-blue-400">
        Управление
      </div>

      <h2 className="mt-3 text-2xl font-bold tracking-[-0.04em]">
        Статус заявки
      </h2>

      <div className="mt-5 space-y-4">
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-[0.22em] text-white/45">
            Статус
          </span>
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="mt-2 h-12 w-full rounded-xl border border-white/10 bg-black/20 px-4 text-sm text-white outline-none focus:border-blue-500/50"
          >
            {orderStatusOptions.map((option) => (
              <option key={option.value} value={option.value} className="bg-[#020814]">
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-[0.22em] text-white/45">
            Комментарий менеджера / клиента
          </span>
          <textarea
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            rows={5}
            className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-blue-500/50"
            placeholder="Например: клиент ждёт звонка после 18:00"
          />
        </label>

        <button
          type="button"
          onClick={saveOrder}
          disabled={isSaving}
          className="w-full rounded-xl bg-blue-600 px-5 py-4 text-sm font-semibold text-white transition-colors hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSaving ? "Сохраняем..." : "Сохранить заявку"}
        </button>

        {message && <div className="text-sm text-white/55">{message}</div>}
      </div>
    </div>
  );
}
