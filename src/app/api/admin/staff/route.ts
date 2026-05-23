import { NextResponse } from "next/server";

import { getAuthSession, hashPassword, normalizeText } from "@/lib/auth";
import { getAdminStaff } from "@/lib/admin-staff-db";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

const roles = new Set(["owner", "admin", "manager", "content", "support"]);

async function requireAdmin() {
  const session = await getAuthSession();
  return session?.role === "admin";
}

function jsonError(message: string, status = 400) {
  return NextResponse.json({ ok: false, message }, { status });
}

function normalizeRole(value: unknown) {
  const role = normalizeText(value);
  return roles.has(role) ? role : "manager";
}

export async function GET() {
  if (!(await requireAdmin())) {
    return jsonError("Доступ запрещён", 401);
  }

  return NextResponse.json({ staff: await getAdminStaff() });
}

export async function POST(request: Request) {
  if (!(await requireAdmin())) {
    return jsonError("Доступ запрещён", 401);
  }

  const body = (await request.json().catch(() => null)) as
    | { login?: unknown; name?: unknown; password?: unknown; role?: unknown; isActive?: unknown }
    | null;

  const login = normalizeText(body?.login);
  const name = normalizeText(body?.name) || login;
  const password = normalizeText(body?.password);
  const role = normalizeRole(body?.role);

  if (!login) {
    return jsonError("Укажи логин сотрудника.");
  }

  if (!password || password.length < 6) {
    return jsonError("Пароль сотрудника должен быть минимум 6 символов.");
  }

  const exists = await prisma.adminUser.findUnique({ where: { login }, select: { id: true } });

  if (exists) {
    return jsonError("Сотрудник с таким логином уже есть.", 409);
  }

  await prisma.adminUser.create({
    data: {
      login,
      name,
      role,
      permissions: role === "owner" ? ["all"] : [],
      passwordHash: hashPassword(password),
      isActive: body?.isActive === false ? false : true,
    },
  });

  return NextResponse.json({ ok: true, staff: await getAdminStaff() });
}
