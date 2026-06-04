import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ImageKind = "category" | "product" | "variant" | "banner" | "benefit" | "setting";

function parseDataImage(value: string) {
  const match = value.match(/^data:([^;]+);base64,(.*)$/s);

  if (!match) {
    return null;
  }

  return {
    contentType: match[1],
    body: Buffer.from(match[2], "base64"),
  };
}

function imageResponse(value: string) {
  const image = parseDataImage(value.trim());

  if (!image) {
    return new NextResponse("Image not found", { status: 404 });
  }

  return new NextResponse(image.body, {
    headers: {
      "Content-Type": image.contentType,
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
    },
  });
}

function pickArrayValue(values: unknown, index: number) {
  if (!Array.isArray(values)) {
    return "";
  }

  const value = values[index];
  return typeof value === "string" ? value : "";
}

function getIndex(request: Request) {
  const url = new URL(request.url);
  const rawIndex = Number(url.searchParams.get("index") ?? "0");

  return Number.isInteger(rawIndex) && rawIndex >= 0 ? rawIndex : 0;
}

async function getImage(kind: ImageKind, id: string, field: string, index: number) {
  if (kind === "category") {
    if (field !== "image") return "";

    const category = await prisma.category.findUnique({
      where: { slug: id },
      select: { image: true },
    });

    return category?.image ?? "";
  }

  if (kind === "product") {
    if (!["image", "promoImage", "images"].includes(field) && !field.startsWith("descriptionBlocks.")) return "";

    const product = await prisma.product.findUnique({
      where: { slug: id },
      select: { image: true, promoImage: true, images: true, descriptionBlocks: true },
    });

    if (!product) return "";

    if (field === "images") {
      const image = pickArrayValue(product.images, index);
      return image || (index === 0 ? product.image : "");
    }

    if (field.startsWith("descriptionBlocks.")) {
      const match = field.match(/^descriptionBlocks\.(\d+)\.image$/);
      const blockIndex = match ? Number(match[1]) : -1;
      const blocks = Array.isArray(product.descriptionBlocks) ? product.descriptionBlocks : [];
      const block = blocks[blockIndex];

      if (!block || typeof block !== "object") return "";

      const image = (block as Record<string, unknown>).image;
      return typeof image === "string" ? image : "";
    }

    if (field === "promoImage") return product.promoImage;
    return product.image;
  }

  if (kind === "variant") {
    if (field !== "images") return "";

    const variant = await prisma.productVariant.findUnique({
      where: { sku: id },
      select: { images: true },
    });

    return pickArrayValue(variant?.images, index);
  }

  if (kind === "banner") {
    if (!["imageLight", "imageDark", "imageMobile"].includes(field)) return "";

    const banner = await prisma.siteBanner.findUnique({
      where: { id },
      select: { imageLight: true, imageDark: true, imageMobile: true },
    });

    if (!banner) return "";
    if (field === "imageDark") return banner.imageDark;
    if (field === "imageMobile") return banner.imageMobile;
    return banner.imageLight;
  }

  if (kind === "benefit") {
    if (field !== "image") return "";

    const benefit = await prisma.siteBenefit.findUnique({
      where: { id },
      select: { image: true },
    });

    return benefit?.image ?? "";
  }

  if (kind === "setting") {
    if (id !== "branding") return "";

    const allowedFields = new Set([
      "logoLight",
      "logoDark",
      "mobileLogo",
      "favicon",
      "navIconHome",
      "navIconCatalog",
      "navIconNew",
      "navIconSupport",
      "navIconCart",
    ]);

    if (!allowedFields.has(field)) return "";

    const setting = await prisma.siteSetting.findUnique({
      where: { key: "site" },
      select: { value: true },
    });

    const value = setting?.value;

    if (!value || typeof value !== "object" || Array.isArray(value)) {
      return "";
    }

    const branding = (value as Record<string, unknown>).branding;

    if (!branding || typeof branding !== "object" || Array.isArray(branding)) {
      return "";
    }

    const image = (branding as Record<string, unknown>)[field];

    return typeof image === "string" ? image : "";
  }

  return "";
}

export async function GET(
  request: Request,
  context: { params: Promise<{ parts?: string[] }> },
) {
  const { parts = [] } = await context.params;
  const [kind, rawId, rawField] = parts;

  if (!kind || !rawId || !rawField) {
    return new NextResponse("Image not found", { status: 404 });
  }

  if (!["category", "product", "variant", "banner", "benefit", "setting"].includes(kind)) {
    return new NextResponse("Image not found", { status: 404 });
  }

  try {
    const id = decodeURIComponent(rawId);
    const field = decodeURIComponent(rawField);
    const index = getIndex(request);
    const value = await getImage(kind as ImageKind, id, field, index);

    return imageResponse(value);
  } catch (error) {
    console.error("Public image loading failed", error);
    return new NextResponse("Image loading failed", { status: 500 });
  }
}
