import { NextResponse } from "next/server";

import { getAuthSession, hashPassword, normalizeText } from "@/lib/auth";
import { getAdminStaff } from "@/lib/admin-staff-db";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

const roles = new Set(["owner", "admin", "manager", "content", "support"]);

type RouteContext = {
  params: Promise<{ id: string }>;
};

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

export async function PATCH(request: Request, context: RouteContext) {
  if (!(await requireAdmin())) {
    return jsonError("Доступ запрещён", 401);
  }

  const { id } = await context.params;
  const body = (await request.json().catch(() => null)) as
    | { login?: unknown; name?: unknown; password?: unknown; role?: unknown; isActive?: unknown }
    | null;

  const current = await prisma.adminUser.findUnique({ where: { id }, select: { id: true, role: true } });

  if (!current) {
    return jsonError("Сотрудник не найден.", 404);
  }

  const data: {
    login?: string;
    name?: string;
    role?: string;
    permissions?: string[];
    passwordHash?: string;
    isActive?: boolean;
  } = {};

  if (body?.login !== undefined) {
    const login = normalizeText(body.login);
    if (!login) return jsonError("Логин не может быть пустым.");
    data.login = login;
  }

  if (body?.name !== undefined) {
    data.name = normalizeText(body.name) || "Сотрудник";
  }

  if (body?.role !== undefined) {
    const role = normalizeRole(body.role);
    data.role = role;
    data.permissions = role === "owner" ? ["all"] : [];
  }

  if (body?.password !== undefined) {
    const password = normalizeText(body.password);
    if (password && password.length < 6) return jsonError("Пароль должен быть минимум 6 символов.");
    if (password) data.passwordHash = hashPassword(password);
  }

  if (typeof body?.isActive === "boolean") {
    data.isActive = body.isActive;
  }

  await prisma.adminUser.update({ where: { id }, data });

  return NextResponse.json({ ok: true, staff: await getAdminStaff() });
}

export async function DELETE(_request: Request, context: RouteContext) {
  if (!(await requireAdmin())) {
    return jsonError("Доступ запрещён", 401);
  }

  const { id } = await context.params;

  await prisma.adminUser.update({ where: { id }, data: { isActive: false } });

  return NextResponse.json({ ok: true, staff: await getAdminStaff() });
}
