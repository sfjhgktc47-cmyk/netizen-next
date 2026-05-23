import { NextRequest, NextResponse } from "next/server";

import { getAuthSession } from "@/lib/auth";
import {
  getSiteEditorSettings,
  getSystemSettings,
  saveSiteEditorSettings,
  saveSystemSettings,
} from "@/lib/site-settings-db";

export const dynamic = "force-dynamic";

async function requireAdmin() {
  const session = await getAuthSession();
  return session?.role === "admin";
}

export async function GET(request: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Доступ запрещён" }, { status: 401 });
  }

  const scope = request.nextUrl.searchParams.get("scope") ?? "all";

  if (scope === "site") {
    return NextResponse.json({ site: await getSiteEditorSettings() });
  }

  if (scope === "system") {
    return NextResponse.json({ system: await getSystemSettings() });
  }

  const [site, system] = await Promise.all([
    getSiteEditorSettings(),
    getSystemSettings(),
  ]);

  return NextResponse.json({ site, system });
}

export async function PATCH(request: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Доступ запрещён" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const scope = body?.scope;

  if (scope === "site") {
    const site = await saveSiteEditorSettings(body.value);
    return NextResponse.json({ ok: true, site });
  }

  if (scope === "system") {
    const system = await saveSystemSettings(body.value);
    return NextResponse.json({ ok: true, system });
  }

  return NextResponse.json(
    { error: "Передайте scope: site или system" },
    { status: 400 }
  );
}
