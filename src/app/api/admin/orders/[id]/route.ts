import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const allowedStatuses = [
  "new",
  "confirming",
  "in_work",
  "ready",
  "completed",
  "cancelled",
] as const;

type AllowedStatus = (typeof allowedStatuses)[number];

function isAllowedStatus(value: unknown): value is AllowedStatus {
  return typeof value === "string" && allowedStatuses.includes(value as AllowedStatus);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = (await request.json()) as { status?: unknown; comment?: unknown };

    if (!isAllowedStatus(body.status)) {
      return NextResponse.json(
        { ok: false, error: "Некорректный статус заявки." },
        { status: 400 }
      );
    }

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

    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: {
        status: body.status,
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
