import "server-only";

import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/db";
import {
  defaultCustomerStatusRules,
  getCustomerStatusLabel,
  isCustomerStatus,
  type CustomerStatus,
  type CustomerStatusProgress,
  type CustomerStatusRules,
} from "@/lib/customer-status-types";

const CUSTOMER_STATUS_SETTINGS_KEY = "customer-status-rules";

type StatusOrder = {
  status: string;
  total: number;
  createdAt: Date;
};

type StatusCustomer = {
  statusOverride?: string | null;
  statusOverrideAt?: Date | null;
  orders: StatusOrder[];
};

function numberValue(value: unknown, fallback: number, min: number, max: number) {
  const parsed = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, Math.round(parsed)));
}

export function normalizeCustomerStatusRules(value: unknown): CustomerStatusRules {
  const raw = value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};

  const regularOrders = numberValue(
    raw.regularOrders,
    defaultCustomerStatusRules.regularOrders,
    1,
    1000,
  );
  const vipOrders = Math.max(
    regularOrders,
    numberValue(raw.vipOrders, defaultCustomerStatusRules.vipOrders, 1, 1000),
  );

  const discountType = (value: unknown, fallback: "percent" | "fixed") =>
    value === "fixed" || value === "percent" ? value : fallback;
  const combinationMode = raw.discountCombinationMode === "best" ? "best" : "stack";

  return {
    minOrderTotal: numberValue(raw.minOrderTotal, defaultCustomerStatusRules.minOrderTotal, 0, 100_000_000),
    regularOrders,
    vipOrders,
    vipTotalSpent: numberValue(raw.vipTotalSpent, defaultCustomerStatusRules.vipTotalSpent, 1, 1_000_000_000),
    regularDiscountEnabled:
      typeof raw.regularDiscountEnabled === "boolean"
        ? raw.regularDiscountEnabled
        : defaultCustomerStatusRules.regularDiscountEnabled,
    regularDiscountType: discountType(raw.regularDiscountType, defaultCustomerStatusRules.regularDiscountType),
    regularDiscountValue: numberValue(raw.regularDiscountValue, defaultCustomerStatusRules.regularDiscountValue, 0, 100_000_000),
    regularDiscountMinOrderTotal: numberValue(
      raw.regularDiscountMinOrderTotal,
      defaultCustomerStatusRules.regularDiscountMinOrderTotal,
      0,
      100_000_000,
    ),
    regularDiscountMinItemPrice: numberValue(
      raw.regularDiscountMinItemPrice,
      defaultCustomerStatusRules.regularDiscountMinItemPrice,
      0,
      100_000_000,
    ),
    vipDiscountEnabled:
      typeof raw.vipDiscountEnabled === "boolean"
        ? raw.vipDiscountEnabled
        : defaultCustomerStatusRules.vipDiscountEnabled,
    vipDiscountType: discountType(raw.vipDiscountType, defaultCustomerStatusRules.vipDiscountType),
    vipDiscountValue: numberValue(raw.vipDiscountValue, defaultCustomerStatusRules.vipDiscountValue, 0, 100_000_000),
    vipDiscountMinOrderTotal: numberValue(
      raw.vipDiscountMinOrderTotal,
      defaultCustomerStatusRules.vipDiscountMinOrderTotal,
      0,
      100_000_000,
    ),
    vipDiscountMinItemPrice: numberValue(
      raw.vipDiscountMinItemPrice,
      defaultCustomerStatusRules.vipDiscountMinItemPrice,
      0,
      100_000_000,
    ),
    discountCombinationMode: combinationMode,
  };
}

export async function getCustomerStatusRules() {
  const setting = await prisma.siteSetting.findUnique({
    where: { key: CUSTOMER_STATUS_SETTINGS_KEY },
  });

  return normalizeCustomerStatusRules(setting?.value);
}

export async function saveCustomerStatusRules(value: unknown) {
  const rules = normalizeCustomerStatusRules(value);

  await prisma.siteSetting.upsert({
    where: { key: CUSTOMER_STATUS_SETTINGS_KEY },
    create: { key: CUSTOMER_STATUS_SETTINGS_KEY, value: rules as Prisma.InputJsonValue },
    update: { value: rules as Prisma.InputJsonValue },
  });

  return rules;
}

function earliestDate(values: Array<Date | null>) {
  return values
    .filter((value): value is Date => Boolean(value))
    .sort((first, second) => first.getTime() - second.getTime())[0] ?? null;
}

function automaticStatusData(customer: StatusCustomer, rules: CustomerStatusRules) {
  const completedOrders = customer.orders
    .filter((order) => order.status === "completed")
    .sort((first, second) => first.createdAt.getTime() - second.createdAt.getTime());
  const counted = completedOrders.filter((order) => order.total >= rules.minOrderTotal);
  const countedSpent = counted.reduce((sum, order) => sum + order.total, 0);

  const regularReached = counted.length >= rules.regularOrders;
  const vipByOrders = counted.length >= rules.vipOrders;
  const vipBySpent = rules.vipTotalSpent > 0 && countedSpent >= rules.vipTotalSpent;

  let automaticStatus: CustomerStatus = "new";
  if (vipByOrders || vipBySpent) automaticStatus = "vip";
  else if (regularReached) automaticStatus = "regular";

  const regularDate = regularReached ? counted[rules.regularOrders - 1]?.createdAt ?? null : null;
  const vipOrdersDate = vipByOrders ? counted[rules.vipOrders - 1]?.createdAt ?? null : null;
  let runningSpent = 0;
  let vipSpentDate: Date | null = null;
  if (rules.vipTotalSpent > 0) {
    for (const order of counted) {
      runningSpent += order.total;
      if (runningSpent >= rules.vipTotalSpent) {
        vipSpentDate = order.createdAt;
        break;
      }
    }
  }

  const automaticDate = automaticStatus === "vip"
    ? earliestDate([vipOrdersDate, vipSpentDate])
    : automaticStatus === "regular"
      ? regularDate
      : null;

  return {
    completedOrders: completedOrders.length,
    countedOrders: counted.length,
    countedSpent,
    automaticStatus,
    automaticDate,
  };
}

export function calculateCustomerStatus(
  customer: StatusCustomer,
  rules: CustomerStatusRules,
): CustomerStatusProgress {
  const data = automaticStatusData(customer, rules);
  const manualStatus = isCustomerStatus(customer.statusOverride) ? customer.statusOverride : null;
  const status = manualStatus ?? data.automaticStatus;
  const isManual = Boolean(manualStatus);

  let nextStatus: CustomerStatus | null = null;
  let progressPercent = 100;
  let remainingOrders = 0;
  let remainingSpent = 0;
  let explanation = "Максимальный статус получен.";

  if (data.automaticStatus === "new") {
    nextStatus = "regular";
    remainingOrders = Math.max(0, rules.regularOrders - data.countedOrders);
    progressPercent = Math.min(100, Math.round((data.countedOrders / rules.regularOrders) * 100));
    explanation = `До статуса «Постоянный клиент» — ещё ${remainingOrders} учтённых заказов.`;
  } else if (data.automaticStatus === "regular") {
    nextStatus = "vip";
    remainingOrders = Math.max(0, rules.vipOrders - data.countedOrders);
    remainingSpent = Math.max(0, rules.vipTotalSpent - data.countedSpent);
    const ordersProgress = rules.vipOrders > 0 ? data.countedOrders / rules.vipOrders : 0;
    const spentProgress = rules.vipTotalSpent > 0 ? data.countedSpent / rules.vipTotalSpent : 0;
    progressPercent = Math.min(100, Math.round(Math.max(ordersProgress, spentProgress) * 100));
    explanation = `До VIP — ещё ${remainingOrders} заказов или покупок на ${remainingSpent.toLocaleString("ru-RU")} ₽.`;
  }

  const statusDate = isManual
    ? customer.statusOverrideAt ?? null
    : data.automaticDate;

  return {
    status,
    statusLabel: getCustomerStatusLabel(status),
    automaticStatus: data.automaticStatus,
    automaticStatusLabel: getCustomerStatusLabel(data.automaticStatus),
    isManual,
    statusDate: statusDate?.toISOString() ?? null,
    completedOrders: data.completedOrders,
    countedOrders: data.countedOrders,
    countedSpent: data.countedSpent,
    nextStatus,
    nextStatusLabel: nextStatus ? getCustomerStatusLabel(nextStatus) : null,
    progressPercent,
    remainingOrders,
    remainingSpent,
    explanation,
  };
}
