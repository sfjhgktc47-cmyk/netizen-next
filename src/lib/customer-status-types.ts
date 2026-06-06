export const customerStatusValues = ["new", "regular", "vip"] as const;

export type CustomerStatus = (typeof customerStatusValues)[number];
export type DiscountType = "percent" | "fixed";
export type DiscountCombinationMode = "stack" | "best";

export type CustomerStatusRules = {
  minOrderTotal: number;
  regularOrders: number;
  vipOrders: number;
  vipTotalSpent: number;
  regularDiscountEnabled: boolean;
  regularDiscountType: DiscountType;
  regularDiscountValue: number;
  regularDiscountMinOrderTotal: number;
  regularDiscountMinItemPrice: number;
  vipDiscountEnabled: boolean;
  vipDiscountType: DiscountType;
  vipDiscountValue: number;
  vipDiscountMinOrderTotal: number;
  vipDiscountMinItemPrice: number;
  discountCombinationMode: DiscountCombinationMode;
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
  regularDiscountEnabled: true,
  regularDiscountType: "percent",
  regularDiscountValue: 3,
  regularDiscountMinOrderTotal: 10000,
  regularDiscountMinItemPrice: 0,
  vipDiscountEnabled: true,
  vipDiscountType: "percent",
  vipDiscountValue: 5,
  vipDiscountMinOrderTotal: 10000,
  vipDiscountMinItemPrice: 0,
  discountCombinationMode: "stack",
};

export function getCustomerStatusLabel(status: CustomerStatus) {
  if (status === "vip") return "VIP";
  if (status === "regular") return "Постоянный клиент";
  return "Новый клиент";
}

export function isCustomerStatus(value: unknown): value is CustomerStatus {
  return typeof value === "string" && (customerStatusValues as readonly string[]).includes(value);
}
