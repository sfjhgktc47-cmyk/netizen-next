import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/db";

function toNullableInt(value: unknown) {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : null;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const variants = await prisma.productVariant.findMany({
    where: { productId: id },
    orderBy: [{ price: "asc" }, { createdAt: "asc" }],
  });

  return NextResponse.json({ variants });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await request.json();

  if (!body?.sku || !body?.slug || !body?.title || body?.price === undefined) {
    return NextResponse.json(
      {
        error: "sku, slug, title and price are required",
      },
      { status: 400 },
    );
  }

  const stock = Number.isFinite(Number(body.stock)) ? Number(body.stock) : 0;

  const variant = await prisma.productVariant.create({
    data: {
      productId: id,
      sku: String(body.sku),
      slug: String(body.slug),
      title: String(body.title),
      memory: String(body.memory ?? ""),
      color: String(body.color ?? ""),
      colorHex: String(body.colorHex ?? ""),
      sim: String(body.sim ?? ""),
      price: Number(body.price),
      oldPrice: toNullableInt(body.oldPrice),
      stock,
      status: stock > 0 ? "active" : "out_of_stock",
      seoTitle: String(body.seoTitle ?? ""),
      seoDescription: String(body.seoDescription ?? ""),
    },
  });

  return NextResponse.json({ variant }, { status: 201 });
}
