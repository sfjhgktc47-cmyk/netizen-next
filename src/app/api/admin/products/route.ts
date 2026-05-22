import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/db";

function normalizeStatus(value: unknown) {
  if (value === "draft" || value === "hidden" || value === "out_of_stock") {
    return value;
  }

  return "active";
}

export async function GET() {
  const products = await prisma.product.findMany({
    include: {
      category: true,
      variants: {
        orderBy: [{ price: "asc" }, { createdAt: "asc" }],
      },
    },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });

  return NextResponse.json({ products });
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  if (!body?.slug || !body?.name || !body?.brand || !body?.categorySlug) {
    return NextResponse.json(
      {
        error: "slug, name, brand and categorySlug are required",
      },
      { status: 400 },
    );
  }

  const category = await prisma.category.findUnique({
    where: { slug: String(body.categorySlug) },
  });

  const product = await prisma.product.create({
    data: {
      slug: String(body.slug),
      name: String(body.name),
      brand: String(body.brand),
      categorySlug: String(body.categorySlug),
      categoryId: category?.id ?? null,
      description: String(body.description ?? ""),
      shortDescription: String(body.shortDescription ?? ""),
      image: String(body.image ?? ""),
      colors: Array.isArray(body.colors) ? body.colors.map(String) : [],
      status: normalizeStatus(body.status),
      isNew: Boolean(body.isNew),
      isPopular: Boolean(body.isPopular),
      sortOrder: Number.isFinite(Number(body.sortOrder)) ? Number(body.sortOrder) : 100,
    },
  });

  return NextResponse.json({ product }, { status: 201 });
}
