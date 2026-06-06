/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";

import { getAuthSession, normalizeText } from "@/lib/auth";
import { prisma } from "@/lib/db";

const allowedStatuses = ["new", "confirming", "in_work", "ready", "completed", "cancelled"] as const;
const allowedDeliveryTypes = ["courier", "pickup"] as const;

type DraftItem = { variantId?: unknown; quantity?: unknown; price?: unknown };

function positiveInteger(value: unknown, fallback = 1) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.max(1, Math.trunc(parsed)) : fallback;
}

async function requireAdmin() {
  const session = await getAuthSession();
  if (session?.role !== "admin") return null;
  const admin = session.login
    ? await prisma.adminUser.findUnique({
        where: { login: session.login },
        select: { id: true, name: true, login: true, isActive: true },
      })
    : null;
  if (admin && !admin.isActive) return null;
  return { id: admin?.id, name: admin?.name || session.name || session.login || "Менеджер" };
}

async function prepareItems(rawItems: DraftItem[]) {
  const variantIds = rawItems.map((item) => normalizeText(item.variantId)).filter(Boolean);
  const variants = await prisma.productVariant.findMany({
    where: { id: { in: variantIds } },
    include: { product: true },
  });
  const byId = new Map(variants.map((variant) => [variant.id, variant]));

  if (!rawItems.length) throw new Error("В заявке должен остаться хотя бы один товар.");

  return rawItems.map((item) => {
    const variant = byId.get(normalizeText(item.variantId));
    if (!variant) throw new Error("Одна из выбранных позиций больше не существует.");
    return {
      productId: variant.productId,
      variantId: variant.id,
      title: variant.title,
      productTitle: variant.product.name,
      brand: variant.product.brand,
      sku: variant.sku,
      memory: variant.memory,
      color: variant.color,
      sim: variant.sim,
      image: variant.images[0] || variant.product.image || variant.product.images[0] || "",
      quantity: positiveInteger(item.quantity),
      price: positiveInteger(item.price, variant.price),
    };
  });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ ok: false, error: "Нет доступа." }, { status: 401 });

  try {
    const { id } = await params;
    const body = (await request.json()) as Record<string, unknown> & { items?: DraftItem[] };
    const order = await prisma.order.findFirst({
      where: { OR: [{ id }, { publicId: id }] },
      include: { items: true },
    });
    if (!order) return NextResponse.json({ ok: false, error: "Заявка не найдена." }, { status: 404 });

    const isFullEdit = Array.isArray(body.items) || body.customerName !== undefined || body.assignedToId !== undefined;
    const status = allowedStatuses.includes(body.status as never)
      ? (body.status as (typeof allowedStatuses)[number])
      : order.status;
    const managerComment = body.managerComment !== undefined
      ? normalizeText(body.managerComment)
      : body.comment !== undefined && !isFullEdit
        ? normalizeText(body.comment)
        : order.managerComment;

    if (!isFullEdit) {
      const updated = await prisma.order.update({
        where: { id: order.id },
        data: { status, managerComment },
      });
      await prisma.orderChange.create({
        data: {
          orderId: order.id,
          adminId: admin.id,
          adminName: admin.name,
          action: "Изменены статус или комментарий",
          details: `${order.status} → ${updated.status}`,
        },
      });
      return NextResponse.json({ ok: true, order: updated });
    }

    const customerName = normalizeText(body.customerName) || order.customerName;
    const phone = normalizeText(body.phone) || order.phone;
    const email = body.email !== undefined ? normalizeText(body.email).toLowerCase() : order.email;
    const customerId = normalizeText(body.customerId) || order.customerId || undefined;
    const deliveryType = allowedDeliveryTypes.includes(body.deliveryType as never)
      ? (body.deliveryType as "courier" | "pickup")
      : order.deliveryType;
    const address = body.address !== undefined ? normalizeText(body.address) : order.address;
    const pickupPoint = body.pickupPoint !== undefined ? normalizeText(body.pickupPoint) : order.pickupPoint;
    const paymentMethod = body.paymentMethod !== undefined ? normalizeText(body.paymentMethod) || "cash" : order.paymentMethod;
    const comment = body.comment !== undefined ? normalizeText(body.comment) : order.comment;
    const assignedToId = body.assignedToId === null ? undefined : normalizeText(body.assignedToId) || undefined;
    const preparedItems = Array.isArray(body.items) ? await prepareItems(body.items) : null;

    const assignee = assignedToId
      ? await prisma.adminUser.findFirst({
          where: { id: assignedToId, isActive: true },
          select: { id: true, name: true, login: true },
        })
      : null;

    if (deliveryType === "courier" && !address) throw new Error("Укажи адрес доставки.");
    if (deliveryType === "pickup" && !pickupPoint) throw new Error("Укажи ПВЗ или точку самовывоза.");

    const changed: string[] = [];
    if (customerName !== order.customerName || phone !== order.phone || email !== order.email) changed.push("контакты клиента");
    if (deliveryType !== order.deliveryType || address !== order.address || pickupPoint !== order.pickupPoint) changed.push("получение и адрес");
    if (paymentMethod !== order.paymentMethod) changed.push("способ оплаты");
    if (status !== order.status) changed.push("статус");
    if ((assignee?.id || null) !== (order.assignedToId || null)) changed.push("ответственный");
    if (preparedItems) changed.push("состав и стоимость товаров");
    if (comment !== order.comment || managerComment !== order.managerComment) changed.push("комментарии");

    const updated = await prisma.$transaction(async (tx) => {
      const existingCustomer = customerId
        ? await tx.customer.findUnique({ where: { id: customerId } })
        : await tx.customer.findFirst({ where: { phone } });
      const nameParts = customerName.split(/\s+/).filter(Boolean);
      const savedCustomer = existingCustomer
        ? await tx.customer.update({
            where: { id: existingCustomer.id },
            data: {
              name: nameParts[0] || customerName,
              lastName: nameParts.slice(1).join(" "),
              phone,
              email,
            },
          })
        : await tx.customer.create({
            data: {
              name: nameParts[0] || customerName,
              lastName: nameParts.slice(1).join(" "),
              phone,
              email,
            },
          });

      if (preparedItems) {
        await tx.orderItem.deleteMany({ where: { orderId: order.id } });
        await (tx as any).promoCodeUsage.deleteMany({ where: { orderId: order.id } });
        await tx.orderItem.createMany({
          data: preparedItems.map((item) => ({ orderId: order.id, ...item })),
        });
      }

      const total = preparedItems
        ? preparedItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
        : order.total;

      const savedOrder = await tx.order.update({
        where: { id: order.id },
        data: ({
          customerId: savedCustomer.id,
          customerName,
          phone,
          email,
          deliveryType,
          address: deliveryType === "courier" ? address : "",
          pickupPoint: deliveryType === "pickup" ? pickupPoint : "",
          paymentMethod,
          subtotal: preparedItems
            ? total
            : Number((order as any).subtotal || order.total),
          statusDiscount: preparedItems ? 0 : Number((order as any).statusDiscount || 0),
          promoDiscount: preparedItems ? 0 : Number((order as any).promoDiscount || 0),
          promoCode: preparedItems ? "" : String((order as any).promoCode || ""),
          discountTotal: preparedItems ? 0 : Number((order as any).discountTotal || 0),
          total,
          status,
          comment,
          managerComment,
          assignedToId: assignee?.id ?? null,
          assignedToName: assignee?.name || assignee?.login || "",
        } as any),
      });

      await tx.orderChange.create({
        data: {
          orderId: order.id,
          adminId: admin.id,
          adminName: admin.name,
          action: "Заявка отредактирована",
          details: changed.length ? `Изменено: ${changed.join(", ")}.` : "Сохранено без изменения данных.",
        },
      });

      return savedOrder;
    });

    return NextResponse.json({ ok: true, order: updated });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Не удалось обновить заявку." },
      { status: 500 },
    );
  }
}
