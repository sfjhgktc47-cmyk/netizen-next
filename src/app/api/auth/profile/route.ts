import { NextResponse } from "next/server";
import {
  AUTH_COOKIE_NAME,
  createAuthSessionToken,
  getAuthCookieOptions,
  getAuthSession,
  normalizeEmail,
  normalizeText,
} from "@/lib/auth";
import { prisma } from "@/lib/db";

function jsonError(message: string, status = 400) {
  return NextResponse.json({ ok: false, message }, { status });
}

export async function PATCH(request: Request) {
  const session = await getAuthSession();

  if (!session || session.role !== "customer" || !session.customerId) {
    return jsonError("Нужно войти в личный кабинет.", 401);
  }

  const body = (await request.json().catch(() => null)) as
    | { firstName?: unknown; lastName?: unknown; phone?: unknown; email?: unknown }
    | null;
  const firstName = normalizeText(body?.firstName);
  const lastName = normalizeText(body?.lastName);
  const phone = normalizeText(body?.phone);
  const email = normalizeEmail(normalizeText(body?.email));

  if (!firstName || !lastName || !phone) {
    return jsonError("Укажи имя, фамилию и телефон.");
  }

  const customer = await prisma.customer.update({
    where: { id: session.customerId },
    data: {
      name: firstName,
      lastName,
      phone,
      email,
    },
    select: {
      id: true,
      name: true,
      lastName: true,
      phone: true,
      email: true,
    },
  });

  const token = createAuthSessionToken({
    role: "customer",
    customerId: customer.id,
    name: customer.name,
    lastName: customer.lastName,
    phone: customer.phone,
    email: customer.email,
    createdAt: new Date().toISOString(),
  });
  const response = NextResponse.json({
    ok: true,
    user: {
      role: "customer",
      profile: customer,
    },
  });

  response.cookies.set(AUTH_COOKIE_NAME, token, getAuthCookieOptions());
  return response;
}
