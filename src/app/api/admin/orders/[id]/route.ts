import { NextResponse } from "next/server";
import { canAccessAdminSection } from "@/lib/admin-access";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getOrderWorkflowSettings } from "@/lib/order-workflow-db";
import {
  getDefaultOrderStatus,
  getStatusesForDelivery,
} from "@/lib/order-status";

function normalizeText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAuthSession();
    if (session?.role !== "admin" || !canAccessAdminSection(session, "orders")) {
      return NextResponse.json({ ok: false, error: "Недостаточно прав." }, { status: 403 });
    }

    const { id } = await params;
    const body = (await request.json()) as {
      status?: unknown;
      comment?: unknown;
      deliveryType?: unknown;
      address?: unknown;
      pickupPoint?: unknown;
    };

    const order = await prisma.order.findFirst({
      where: {
        OR: [{ id }, { publicId: id }],
      },
    });

    if (!order) {
      return NextResponse.json(
        { ok: false, error: "Заявка не найдена." },
        { status: 404 }
      );
    }

    const workflow = await getOrderWorkflowSettings();
    const deliveryType = body.deliveryType === "pickup" ? "pickup" : body.deliveryType === "courier" ? "courier" : order.deliveryType;
    const deliveryChanged = deliveryType !== order.deliveryType;
    const requestedStatus = normalizeText(body.status);
    const availableStatuses = getStatusesForDelivery(deliveryType, workflow);
    const requestedStatusExists = availableStatuses.some((status) => status.id === requestedStatus && status.active);

    let nextStatus = requestedStatusExists ? requestedStatus : order.status;
    const currentStatusExists = availableStatuses.some((status) => status.id === nextStatus && (status.active || status.id === order.status));

    if ((deliveryChanged && workflow.resetStatusOnDeliveryChange) || !currentStatusExists) {
      nextStatus = getDefaultOrderStatus(deliveryType, workflow);
    }

    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: {
        status: nextStatus,
        deliveryType,
        address: deliveryType === "courier" ? normalizeText(body.address) || order.address : order.address,
        pickupPoint: deliveryType === "pickup" ? normalizeText(body.pickupPoint) || order.pickupPoint : order.pickupPoint,
        comment:
          typeof body.comment === "string" ? body.comment.trim() : order.comment,
      },
    });

    return NextResponse.json({ ok: true, order: updatedOrder });
  } catch (error) {
    console.error("Order update error", error);

    return NextResponse.json(
      { ok: false, error: "Не удалось обновить заявку." },
      { status: 500 }
    );
  }
}
