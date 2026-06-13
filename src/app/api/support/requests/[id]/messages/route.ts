import { NextResponse } from "next/server";
import { addSupportMessage, type SupportMessageRole } from "@/lib/support-store";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = (await request.json().catch(() => null)) as {
    text?: string;
    role?: SupportMessageRole;
    name?: string;
  } | null;

  if (!body?.text?.trim()) {
    return NextResponse.json({ error: "Сообщение пустое." }, { status: 400 });
  }

  const supportRequest = await addSupportMessage(id, {
    text: body.text,
    role: body.role === "MANAGER" ? "MANAGER" : "CLIENT",
    name: body.name,
  });

  if (!supportRequest) {
    return NextResponse.json({ error: "Обращение не найдено." }, { status: 404 });
  }

  return NextResponse.json({ request: supportRequest }, { status: 201 });
}
