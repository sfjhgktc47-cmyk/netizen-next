export const customerStatusValues = ["new", "regular", "vip"] as const;

export type CustomerStatus = (typeof customerStatusValues)[number];

export type CustomerStatusRules = {
  minOrderTotal: number;
  regularOrders: number;
  vipOrders: number;
  vipTotalSpent: number;
};

export type CustomerStatusProgress = {
  status: CustomerStatus;
  statusLabel: string;
  automaticStatus: CustomerStatus;
  automaticStatusLabel: string;
  isManual: boolean;
  statusDate: string | null;
  completedOrders: number;
  countedOrders: number;
  countedSpent: number;
  nextStatus: CustomerStatus | null;
  nextStatusLabel: string | null;
  progressPercent: number;
  remainingOrders: number;
  remainingSpent: number;
  explanation: string;
};

export const defaultCustomerStatusRules: CustomerStatusRules = {
  minOrderTotal: 10000,
  regularOrders: 3,
  vipOrders: 10,
  vipTotalSpent: 500000,
};

export function getCustomerStatusLabel(status: CustomerStatus) {
  if (status === "vip") return "VIP";
  if (status === "regular") return "Постоянный клиент";
  return "Новый клиент";
}

export function isCustomerStatus(value: unknown): value is CustomerStatus {
  return typeof value === "string" && (customerStatusValues as readonly string[]).includes(value);
}
