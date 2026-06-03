import { NextResponse } from "next/server";
import {
  AUTH_COOKIE_NAME,
  createAuthSessionToken,
  getAuthCookieOptions,
  hashPassword,
  normalizeAdminRoles,
  normalizeEmail,
  normalizeText,
  verifyPassword,
  type AdminRole,
} from "@/lib/auth";
import { prisma } from "@/lib/db";

const DEFAULT_ADMIN_LOGIN = "admin";
const DEFAULT_ADMIN_PASSWORD = "netizen-admin";
const DEFAULT_ADMIN_NAME = "Администратор";

function jsonError(message: string, status = 400) {
  return NextResponse.json({ ok: false, message }, { status });
}

function cleanEnvValue(value: string | undefined, fallback: string) {
  const normalized = normalizeText(value);

  if (!normalized) {
    return fallback;
  }

  return normalized.replace(/^["'`]+|["'`]+$/g, "").trim() || fallback;
}

function getConfiguredAdmin() {
  return {
    login: cleanEnvValue(process.env.ADMIN_LOGIN, DEFAULT_ADMIN_LOGIN),
    password: cleanEnvValue(process.env.ADMIN_PASSWORD, DEFAULT_ADMIN_PASSWORD),
    name: cleanEnvValue(process.env.ADMIN_NAME, DEFAULT_ADMIN_NAME),
    roles: ["owner"] as AdminRole[],
  };
}

function createAdminLoginResponse(admin: { login: string; name: string; role?: string; roles?: string[] }) {
  const roles = normalizeAdminRoles(admin.roles, normalizeAdminRoles(admin.role, ["admin"]));
  const token = createAuthSessionToken({
    role: "admin",
    login: admin.login,
    name: admin.name,
    adminRole: roles[0],
    roles,
    createdAt: new Date().toISOString(),
  });
  const response = NextResponse.json({
    ok: true,
    user: { role: "admin", roles },
    redirectTo: "/nz-console",
  });

  response.cookies.set(AUTH_COOKIE_NAME, token, getAuthCookieOptions());
  return response;
}

async function upsertAdminAndLogin(admin: { login: string; password: string; name: string; roles: AdminRole[] }) {
  const primaryRole = admin.roles[0] ?? "owner";
  const syncedAdmin = await prisma.adminUser.upsert({
    where: { login: admin.login },
    update: {
      name: admin.name,
      role: primaryRole,
      roles: admin.roles,
      permissions: admin.roles.includes("owner") ? ["all"] : [],
      passwordHash: hashPassword(admin.password),
      isActive: true,
    },
    create: {
      login: admin.login,
      name: admin.name,
      role: primaryRole,
      roles: admin.roles,
      permissions: admin.roles.includes("owner") ? ["all"] : [],
      passwordHash: hashPassword(admin.password),
      isActive: true,
    },
    select: {
      login: true,
      name: true,
      role: true,
      roles: true,
    },
  });

  return createAdminLoginResponse(syncedAdmin);
}

function matchesAdminCredentials(login: string, password: string, admin: { login: string; password: string }) {
  return login === admin.login && password === admin.password;
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

  try {
    const configuredAdmin = getConfiguredAdmin();
    const fallbackAdmin = {
      login: DEFAULT_ADMIN_LOGIN,
      password: DEFAULT_ADMIN_PASSWORD,
      name: configuredAdmin.name,
      roles: ["owner"] as AdminRole[],
    };

    if (matchesAdminCredentials(login, password, configuredAdmin)) {
      return upsertAdminAndLogin(configuredAdmin);
    }

    const envAdminIsDefault =
      configuredAdmin.login === DEFAULT_ADMIN_LOGIN &&
      configuredAdmin.password === DEFAULT_ADMIN_PASSWORD;

    if (envAdminIsDefault && matchesAdminCredentials(login, password, fallbackAdmin)) {
      return upsertAdminAndLogin(fallbackAdmin);
    }

    const admin = await prisma.adminUser.findUnique({
      where: { login },
      select: {
        login: true,
        name: true,
        role: true,
        roles: true,
        passwordHash: true,
        isActive: true,
      },
    });

    if (admin) {
      if (admin.isActive && verifyPassword(password, admin.passwordHash)) {
        return createAdminLoginResponse(admin);
      }

      return jsonError("Неверный логин или пароль.", 401);
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
  } catch (error) {
    console.error("Auth login error", error);

    return jsonError(
      "Ошибка авторизации на сервере. Проверь Railway DATABASE_URL и выполни db:push/db:seed для Railway-БД.",
      500
    );
  }
}
