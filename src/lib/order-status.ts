export const orderStatusLabels = {
  new: "Новая",
  confirming: "Ожидает подтверждения",
  in_work: "В работе",
  ready: "Готова к выдаче",
  completed: "Завершена",
  cancelled: "Отменена",
} as const;

export type OrderStatusKey = keyof typeof orderStatusLabels;

export const orderStatusOptions = Object.entries(orderStatusLabels).map(([value, label]) => ({
  value,
  label,
}));

export function getOrderStatusLabel(status: string) {
  return orderStatusLabels[status as OrderStatusKey] ?? status;
}

export function getOrderStatusClass(status: string) {
  if (status === "new") {
    return "border-blue-500/35 bg-blue-500/10 text-blue-400";
  }

  if (status === "confirming") {
    return "border-orange-500/35 bg-orange-500/10 text-orange-300";
  }

  if (status === "in_work") {
    return "border-purple-500/35 bg-purple-500/10 text-purple-300";
  }

  if (status === "ready") {
    return "border-cyan-500/35 bg-cyan-500/10 text-cyan-300";
  }

  if (status === "completed") {
    return "border-green-500/35 bg-green-500/10 text-green-300";
  }

  if (status === "cancelled") {
    return "border-red-500/35 bg-red-500/10 text-red-300";
  }

  return "border-white/10 bg-white/[0.03] text-white/50";
}
