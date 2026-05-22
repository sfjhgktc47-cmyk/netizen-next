import { NextResponse } from "next/server";
import {
  AUTH_COOKIE_NAME,
  createAuthSessionToken,
  getAuthCookieOptions,
  hashPassword,
  normalizeEmail,
  normalizeText,
  verifyPassword,
} from "@/lib/auth";
import { prisma } from "@/lib/db";

function jsonError(message: string, status = 400) {
  return NextResponse.json({ ok: false, message }, { status });
}

function getConfiguredAdmin() {
  return {
    login: normalizeText(process.env.ADMIN_LOGIN) || "admin",
    password: normalizeText(process.env.ADMIN_PASSWORD) || "netizen-admin",
    name: normalizeText(process.env.ADMIN_NAME) || "Администратор",
  };
}

function createAdminLoginResponse(admin: { login: string; name: string }) {
  const token = createAuthSessionToken({
    role: "admin",
    login: admin.login,
    name: admin.name,
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

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as
    | { login?: unknown; password?: unknown }
    | null;
  const login = normalizeText(body?.login);
  const password = normalizeText(body?.password);

  if (!login || !password) {
    return jsonError("Укажи логин и пароль.");
  }

  const configuredAdmin = getConfiguredAdmin();
  const admin = await prisma.adminUser.findUnique({
    where: { login },
    select: {
      id: true,
      login: true,
      name: true,
      passwordHash: true,
      isActive: true,
    },
  });

  if (admin) {
    const passwordIsValid = verifyPassword(password, admin.passwordHash);
    const isConfiguredAdminLogin = login === configuredAdmin.login;
    const isConfiguredAdminPassword = password === configuredAdmin.password;

    if (admin.isActive && passwordIsValid) {
      return createAdminLoginResponse(admin);
    }

    // Если админ уже есть в БД, но пароль из .env поменяли или seed ещё не запускали,
    // разрешаем войти по текущим ADMIN_LOGIN / ADMIN_PASSWORD и сразу синхронизируем hash в БД.
    if (isConfiguredAdminLogin && isConfiguredAdminPassword) {
      const syncedAdmin = await prisma.adminUser.update({
        where: { id: admin.id },
        data: {
          name: configuredAdmin.name,
          passwordHash: hashPassword(configuredAdmin.password),
          isActive: true,
        },
        select: {
          login: true,
          name: true,
        },
      });

      return createAdminLoginResponse(syncedAdmin);
    }

    return jsonError("Неверный логин или пароль.", 401);
  }

  // Если таблица AdminUser пустая или seed не применился, создаём первого админа
  // только при точном совпадении с ADMIN_LOGIN / ADMIN_PASSWORD.
  if (login === configuredAdmin.login && password === configuredAdmin.password) {
    const createdAdmin = await prisma.adminUser.create({
      data: {
        login: configuredAdmin.login,
        name: configuredAdmin.name,
        passwordHash: hashPassword(configuredAdmin.password),
        isActive: true,
      },
      select: {
        login: true,
        name: true,
      },
    });

    return createAdminLoginResponse(createdAdmin);
  }

  const normalizedEmail = normalizeEmail(login);
  const customer = await prisma.customer.findFirst({
    where: {
      OR: [{ phone: login }, ...(normalizedEmail ? [{ email: normalizedEmail }] : [])],
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
