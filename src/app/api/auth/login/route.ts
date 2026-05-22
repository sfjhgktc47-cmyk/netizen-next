import { NextResponse } from "next/server";
import {
  AUTH_COOKIE_NAME,
  createAuthSessionToken,
  getAuthCookieOptions,
  normalizeEmail,
  normalizeText,
  verifyPassword,
} from "@/lib/auth";
import { prisma } from "@/lib/db";

function jsonError(message: string, status = 400) {
  return NextResponse.json({ ok: false, message }, { status });
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as
    | { login?: unknown; password?: unknown }
    | null;
  const login = normalizeText(body?.login);
  const password = normalizeText(body?.password);

  if (!login || !password) {
    return jsonError("Укажи логин и пароль.");
  }

  const adminLogin = process.env.ADMIN_LOGIN || "admin";
  const adminPassword = process.env.ADMIN_PASSWORD || "netizen-admin";

  if (login === adminLogin && password === adminPassword) {
    const token = createAuthSessionToken({
      role: "admin",
      login: adminLogin,
      createdAt: new Date().toISOString(),
    });
    const response = NextResponse.json({
      ok: true,
      user: { role: "admin" },
      redirectTo: "/nz-console",
    });

    response.cookies.set(AUTH_COOKIE_NAME, token, getAuthCookieOptions());
    return response;
  }

  const normalizedEmail = normalizeEmail(login);
  const customer = await prisma.customer.findFirst({
    where: {
      OR: [{ phone: login }, { email: normalizedEmail }],
    },
    select: {
      id: true,
      name: true,
      lastName: true,
      phone: true,
      email: true,
      passwordHash: true,
    },
  });

  if (!customer || !verifyPassword(password, customer.passwordHash)) {
    return jsonError("Неверный логин или пароль.", 401);
  }

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
      profile: {
        id: customer.id,
        name: customer.name,
        lastName: customer.lastName,
        phone: customer.phone,
        email: customer.email,
      },
    },
    redirectTo: "/profile",
  });

  response.cookies.set(AUTH_COOKIE_NAME, token, getAuthCookieOptions());
  return response;
}
