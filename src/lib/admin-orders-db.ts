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

export async function getOrderEditorOptions() {
  const [customers, variants, staff] = await Promise.all([
    prisma.customer.findMany({
      orderBy: { createdAt: "desc" },
      take: 500,
      include: {
        addresses: {
          select: { id: true, type: true, value: true, isDefault: true },
        },
      },
    }),
    prisma.productVariant.findMany({
      where: { status: "active" },
      orderBy: { title: "asc" },
      take: 1000,
      include: {
        product: { select: { id: true, name: true, brand: true } },
      },
    }),
    prisma.adminUser.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, login: true },
    }),
  ]);

  return {
    customers: customers.map((customer) => ({
      id: customer.id,
      fullName: [customer.name, customer.lastName].filter(Boolean).join(" ") || customer.name,
      phone: customer.phone,
      email: customer.email,
      city: customer.city,
      addresses: customer.addresses.map((address) => ({
        id: address.id,
        type: String(address.type),
        value: address.value,
        isDefault: address.isDefault,
      })),
    })),
    positions: variants.map((variant) => ({
      id: variant.id,
      productId: variant.productId,
      sku: variant.sku,
      title: variant.title,
      productTitle: variant.product.name,
      brand: variant.product.brand,
      memory: variant.memory,
      color: variant.color,
      sim: variant.sim,
      price: variant.price,
      stock: variant.stock,
      status: String(variant.status),
      image: variant.images[0] ?? "",
    })),
    staff: staff.map((member) => ({
      id: member.id,
      name: member.name,
      login: member.login,
    })),
  };
}
