export type OrderDeliveryKind = "courier" | "pickup" | string | null | undefined;

export type OrderStatusColor =
  | "blue"
  | "orange"
  | "purple"
  | "cyan"
  | "green"
  | "red"
  | "gray";

export type OrderWorkflowStatus = {
  id: string;
  label: string;
  color: OrderStatusColor;
};

export type OrderWorkflowSettings = {
  courierStatuses: OrderWorkflowStatus[];
  pickupStatuses: OrderWorkflowStatus[];
  defaultCourierStatus: string;
  defaultPickupStatus: string;
  resetStatusOnDeliveryChange: boolean;
};

export const orderStatusLabels = {
  new: "Новая",
  confirming: "Ожидает подтверждения",
  in_work: "В работе",
  ready: "Готова",
  completed: "Завершена",
  cancelled: "Отменена",
} as const;

export const pickupOrderStatusLabels = {
  new: "Новая заявка",
  confirming: "Ожидает подтверждения",
  in_work: "Комплектуем",
  ready: "Готова к выдаче",
  completed: "Выдана",
  cancelled: "Отменена",
} as const;

export const courierOrderStatusLabels = {
  new: "Новая заявка",
  confirming: "Ожидает подтверждения",
  in_work: "Собираем заказ",
  ready: "Передана курьеру",
  completed: "Доставлена",
  cancelled: "Отменена",
} as const;

export type OrderStatusKey = keyof typeof orderStatusLabels;

const statusColors: Record<OrderStatusKey, OrderStatusColor> = {
  new: "blue",
  confirming: "orange",
  in_work: "purple",
  ready: "cyan",
  completed: "green",
  cancelled: "red",
};

export const orderStatusOptions = Object.entries(orderStatusLabels).map(([value, label]) => ({
  value,
  label,
}));

function getLabelMap(deliveryType?: OrderDeliveryKind) {
  if (deliveryType === "pickup") return pickupOrderStatusLabels;
  if (deliveryType === "courier") return courierOrderStatusLabels;
  return orderStatusLabels;
}

function buildDefaultStatuses(deliveryType: "courier" | "pickup"): OrderWorkflowStatus[] {
  const labels = deliveryType === "pickup" ? pickupOrderStatusLabels : courierOrderStatusLabels;
  return (Object.keys(orderStatusLabels) as OrderStatusKey[]).map((key) => ({
    id: key,
    label: labels[key],
    color: statusColors[key],
  }));
}

export function getDefaultWorkflowSettings(): OrderWorkflowSettings {
  return {
    courierStatuses: buildDefaultStatuses("courier"),
    pickupStatuses: buildDefaultStatuses("pickup"),
    defaultCourierStatus: "new",
    defaultPickupStatus: "new",
    resetStatusOnDeliveryChange: false,
  };
}

function normalizeColor(value: unknown): OrderStatusColor {
  const allowed: OrderStatusColor[] = [
    "blue",
    "orange",
    "purple",
    "cyan",
    "green",
    "red",
    "gray",
  ];
  return allowed.includes(value as OrderStatusColor)
    ? (value as OrderStatusColor)
    : "gray";
}

function normalizeStatusList(value: unknown, fallback: OrderWorkflowStatus[]): OrderWorkflowStatus[] {
  if (!Array.isArray(value)) return fallback;

  const list = value
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const record = item as Record<string, unknown>;
      const id = typeof record.id === "string" ? record.id.trim() : "";
      const label = typeof record.label === "string" ? record.label.trim() : "";
      if (!id || !label) return null;
      return { id, label, color: normalizeColor(record.color) };
    })
    .filter((item): item is OrderWorkflowStatus => item !== null);

  return list.length > 0 ? list : fallback;
}

export function normalizeOrderWorkflowSettings(value: unknown): OrderWorkflowSettings {
  const defaults = getDefaultWorkflowSettings();

  if (!value || typeof value !== "object") {
    return defaults;
  }

  const record = value as Record<string, unknown>;

  const courierStatuses = normalizeStatusList(
    record.courierStatuses,
    defaults.courierStatuses,
  );
  const pickupStatuses = normalizeStatusList(
    record.pickupStatuses,
    defaults.pickupStatuses,
  );

  const defaultCourierStatus =
    typeof record.defaultCourierStatus === "string" &&
    courierStatuses.some((status) => status.id === record.defaultCourierStatus)
      ? record.defaultCourierStatus
      : courierStatuses[0]?.id ?? "new";

  const defaultPickupStatus =
    typeof record.defaultPickupStatus === "string" &&
    pickupStatuses.some((status) => status.id === record.defaultPickupStatus)
      ? record.defaultPickupStatus
      : pickupStatuses[0]?.id ?? "new";

  return {
    courierStatuses,
    pickupStatuses,
    defaultCourierStatus,
    defaultPickupStatus,
    resetStatusOnDeliveryChange: Boolean(record.resetStatusOnDeliveryChange),
  };
}

function getWorkflowStatuses(
  deliveryType: OrderDeliveryKind,
  workflow?: OrderWorkflowSettings,
): OrderWorkflowStatus[] {
  const settings = workflow ?? getDefaultWorkflowSettings();
  return deliveryType === "pickup"
    ? settings.pickupStatuses
    : settings.courierStatuses;
}

export function getStatusesForDelivery(
  deliveryType: OrderDeliveryKind,
  workflow?: OrderWorkflowSettings,
): string[] {
  return getWorkflowStatuses(deliveryType, workflow).map((status) => status.id);
}

export function getDefaultOrderStatus(
  deliveryType: OrderDeliveryKind,
  workflow?: OrderWorkflowSettings,
): string {
  const settings = workflow ?? getDefaultWorkflowSettings();
  const fallback = getWorkflowStatuses(deliveryType, settings)[0]?.id ?? "new";
  return deliveryType === "pickup"
    ? settings.defaultPickupStatus || fallback
    : settings.defaultCourierStatus || fallback;
}

export function getOrderStatusOptions(
  deliveryType?: OrderDeliveryKind,
  workflow?: OrderWorkflowSettings,
  currentStatus?: string,
) {
  const statuses = getWorkflowStatuses(deliveryType, workflow);

  const options = statuses.map((status) => ({
    value: status.id,
    label: status.label,
    color: status.color,
  }));

  if (currentStatus && !options.some((option) => option.value === currentStatus)) {
    options.push({
      value: currentStatus,
      label: getOrderStatusLabel(currentStatus, deliveryType),
      color: statusColors[currentStatus as OrderStatusKey] ?? "gray",
    });
  }

  return options;
}

export function getOrderStatusLabel(status: string, deliveryType?: OrderDeliveryKind) {
  const labels = getLabelMap(deliveryType);
  return labels[status as OrderStatusKey] ?? orderStatusLabels[status as OrderStatusKey] ?? status;
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
