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

export async function getOrderEditorOptions() {
  const [customers, positions, staff] = await Promise.all([
    prisma.customer.findMany({
      orderBy: { updatedAt: "desc" },
      include: {
        addresses: {
          orderBy: [{ isDefault: "desc" }, { updatedAt: "desc" }],
        },
      },
    }),
    prisma.productVariant.findMany({
      orderBy: { updatedAt: "desc" },
      include: { product: true },
    }),
    prisma.adminUser.findMany({
      where: { isActive: true },
      orderBy: [{ name: "asc" }, { login: "asc" }],
      select: { id: true, name: true, login: true },
    }),
  ]);

  return {
    customers: customers.map((customer) => ({
      id: customer.id,
      fullName: [customer.name, customer.lastName].filter(Boolean).join(" ").trim(),
      phone: customer.phone,
      email: customer.email,
      city: customer.city,
      addresses: customer.addresses.map((address) => ({
        id: address.id,
        type: address.type,
        value: address.value,
        isDefault: address.isDefault,
      })),
    })),
    positions: positions.map((position) => ({
      id: position.id,
      productId: position.productId,
      sku: position.sku,
      title: position.title,
      productTitle: position.product.name,
      brand: position.product.brand,
      memory: position.memory,
      color: position.color,
      sim: position.sim,
      price: position.price,
      stock: position.stock,
      status: position.status,
      image: position.images[0] || position.product.image || position.product.images[0] || "",
    })),
    staff,
  };
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
      assignedTo: true,
      changes: { orderBy: { createdAt: "desc" } },
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
