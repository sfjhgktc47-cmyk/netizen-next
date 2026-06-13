import "server-only";

import { prisma } from "@/lib/db";
import { formatPrice } from "@/lib/product-pricing";
export { getOrderStatusClass, getOrderStatusLabel } from "@/lib/order-status";

export function getDeliveryLabel(type: string) {
  return type === "pickup" ? "ПВЗ / самовывоз" : "Курьерская доставка";
}

export function formatAdminDate(value: Date) {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  }).format(value);
}

export function formatAdminPrice(value: number) {
  return formatPrice(value);
}

export async function getAdminOrders() {
  return prisma.order.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      items: {
        include: {
          product: true,
          variant: true,
        },
      },
    },
  });
}

export async function getAdminOrder(idOrPublicId: string) {
  return prisma.order.findFirst({
    where: {
      OR: [{ id: idOrPublicId }, { publicId: idOrPublicId }],
    },
    include: {
      customer: true,
      items: {
        include: {
          product: true,
          variant: true,
        },
      },
    },
  });
}

export async function getOrderMetrics() {
  const [orders, newOrders, inWorkOrders] = await Promise.all([
    prisma.order.findMany({ select: { total: true, status: true, createdAt: true } }),
    prisma.order.count({ where: { status: "new" } }),
    prisma.order.count({ where: { status: "in_work" } }),
  ]);

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const todayTotal = orders
    .filter((order) => order.createdAt >= startOfToday)
    .reduce((sum, order) => sum + order.total, 0);

  return {
    total: orders.length,
    new: newOrders,
    inWork: inWorkOrders,
    todayTotal,
  };
}
