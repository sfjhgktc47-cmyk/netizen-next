import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/db";

type EntityStatus = "active" | "draft" | "hidden" | "out_of_stock";

const allowedStatuses = new Set<EntityStatus>(["active", "draft", "hidden", "out_of_stock"]);

function normalizeStatus(value: unknown): EntityStatus {
  if (typeof value === "string" && allowedStatuses.has(value as EntityStatus)) {
    return value as EntityStatus;
  }

  return "active";
}

function toStringValue(value: unknown) {
  return typeof value === "string" ? value : "";
}

function toStringArrayValue(value: unknown) {
  if (Array.isArray(value)) {
    return value.map(String).map((item) => item.trim()).filter(Boolean);
  }

  if (typeof value === "string" && value.trim()) {
    return [value.trim()];
  }

  return [];
}

function toBooleanValue(value: unknown) {
  return value === true || value === "true";
}

function toSortOrder(value: unknown) {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? Math.round(numericValue) : 100;
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Неизвестная ошибка.";
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await request.json();

  const name = toStringValue(body?.name).trim();
  const slug = toStringValue(body?.slug).trim();
  const brand = toStringValue(body?.brand).trim();
  const categorySlug = toStringValue(body?.categorySlug).trim();

  if (!name || !slug || !brand || !categorySlug) {
    return NextResponse.json(
      {
        error: "Заполните название, slug, бренд и категорию.",
      },
      { status: 400 },
    );
  }

  const category = await prisma.category.findUnique({
    where: { slug: categorySlug },
  });

  if (!category) {
    return NextResponse.json(
      {
        error: "Категория не найдена. Сначала создайте её в админке или выберите существующую.",
      },
      { status: 400 },
    );
  }

  const images = toStringArrayValue(body?.images);
  const mainImage = images[0] ?? toStringValue(body?.image);

  try {
    const product = await prisma.product.update({
      where: { id },
      data: {
        name,
        slug,
        brand,
        categorySlug,
        categoryId: category?.id ?? null,
        shortDescription: toStringValue(body?.shortDescription),
        description: toStringValue(body?.description),
        image: mainImage,
        promoImage: toStringValue(body?.promoImage).trim(),
        images,
        status: normalizeStatus(body?.status),
        isNew: toBooleanValue(body?.isNew),
        isPopular: toBooleanValue(body?.isPopular),
        sortOrder: toSortOrder(body?.sortOrder),
      },
    });

    return NextResponse.json({ product });
  } catch (error) {
    const message = getErrorMessage(error);

    if (message.includes("Unique constraint")) {
      return NextResponse.json(
        {
          error: "Карточка с таким slug уже есть.",
        },
        { status: 409 },
      );
    }

    return NextResponse.json(
      {
        error: "Не удалось сохранить карточку.",
        details: message,
      },
      { status: 500 },
    );
  }
}
