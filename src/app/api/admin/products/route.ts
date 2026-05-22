import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/db";

function normalizeImages(value: unknown) {
  if (Array.isArray(value)) {
    return value.map(String).map((item) => item.trim()).filter(Boolean);
  }

  if (typeof value === "string" && value.trim()) {
    return [value.trim()];
  }

  return [];
}

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

  if (!category) {
    return NextResponse.json(
      {
        error: "Категория не найдена. Сначала создайте её в админке или выберите существующую.",
      },
      { status: 400 },
    );
  }

  const images = normalizeImages(body.images);
  const mainImage = images[0] ?? String(body.image ?? "");

  const product = await prisma.product.create({
    data: {
      slug: String(body.slug),
      name: String(body.name),
      brand: String(body.brand),
      categorySlug: String(body.categorySlug),
      categoryId: category?.id ?? null,
      description: String(body.description ?? ""),
      shortDescription: String(body.shortDescription ?? ""),
      image: mainImage,
      images,
      colors: Array.isArray(body.colors) ? body.colors.map(String) : [],
      status: normalizeStatus(body.status),
      isNew: Boolean(body.isNew),
      isPopular: Boolean(body.isPopular),
      sortOrder: Number.isFinite(Number(body.sortOrder)) ? Number(body.sortOrder) : 100,
    },
  });

  return NextResponse.json({ product }, { status: 201 });
}
