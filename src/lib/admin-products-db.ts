/* eslint-disable @typescript-eslint/no-explicit-any */

import "server-only";

import { prisma } from "@/lib/db";

export type AdminProductStatus = "active" | "draft" | "hidden" | "out_of_stock";

export type ProductDescriptionBlock = {
  id: string;
  eyebrow: string;
  title: string;
  text: string;
  image: string;
  imageAlt: string;
  imageSide: "left" | "right";
  tone: "light" | "dark";
};

export type AdminCategoryOption = {
  id: string;
  slug: string;
  name: string;
};

export type AdminProductListItem = {
  id: string;
  slug: string;
  name: string;
  brand: string;
  categorySlug: string;
  categoryName: string;
  shortDescription: string;
  description: string;
  descriptionBlocks: ProductDescriptionBlock[];
  status: AdminProductStatus;
  image: string;
  promoImage: string;
  images: string[];
  isNew: boolean;
  isPopular: boolean;
  variantsCount: number;
  minPrice: number | null;
  stockTotal: number;
  source: "db";
};

export type AdminVariantItem = {
  id: string;
  sku: string;
  slug: string;
  title: string;
  memory: string;
  color: string;
  colorHex: string;
  sim: string;
  images: string[];
  price: number;
  oldPrice: number | null;
  stock: number;
  status: AdminProductStatus;
};

export type AdminProductDetail = AdminProductListItem & {
  variants: AdminVariantItem[];
};

const statusLabels: Record<string, string> = {
  active: "Активна",
  draft: "Черновик",
  hidden: "Скрыта",
  out_of_stock: "Нет в наличии",
};

export function getAdminStatusLabel(status: string) {
  return statusLabels[status] ?? status;
}

export function getAdminStatusClass(status: string) {
  if (status === "active") {
    return "border-green-500/30 bg-green-500/10 text-green-300";
  }

  if (status === "draft") {
    return "border-orange-500/30 bg-orange-500/10 text-orange-300";
  }

  if (status === "out_of_stock") {
    return "border-red-500/30 bg-red-500/10 text-red-300";
  }

  return "border-white/10 bg-white/[0.03] text-white/45";
}


function normalizeDescriptionBlocks(value: unknown): ProductDescriptionBlock[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item, index) => {
      if (!item || typeof item !== "object") {
        return null;
      }

      const record = item as Record<string, unknown>;
      const title = typeof record.title === "string" ? record.title : "";
      const text = typeof record.text === "string" ? record.text : "";
      const image = typeof record.image === "string" ? record.image : "";

      if (!title.trim() && !text.trim() && !image.trim()) {
        return null;
      }

      return {
        id: typeof record.id === "string" && record.id ? record.id : `block-${index}`,
        eyebrow: typeof record.eyebrow === "string" ? record.eyebrow : "",
        title,
        text,
        image,
        imageAlt: typeof record.imageAlt === "string" ? record.imageAlt : "",
        imageSide: record.imageSide === "left" ? "left" : "right",
        tone: record.tone === "dark" ? "dark" : "light",
      } satisfies ProductDescriptionBlock;
    })
    .filter((item): item is ProductDescriptionBlock => Boolean(item));
}

function normalizeProductImages(product: any) {
  const images = Array.isArray(product.images) ? product.images.map(String).filter(Boolean) : [];
  const mainImage = String(product.image ?? "");

  return images.length > 0 ? images : mainImage ? [mainImage] : [];
}

function toAdminProduct(product: any): AdminProductListItem {
  const variants = Array.isArray(product.variants) ? product.variants : [];
  const prices = variants
    .map((variant: any) => Number(variant.price))
    .filter((price: number) => Number.isFinite(price));

  return {
    id: String(product.id),
    slug: String(product.slug),
    name: String(product.name),
    brand: String(product.brand),
    categorySlug: String(product.categorySlug),
    categoryName: product.category?.name ?? product.categorySlug,
    shortDescription: String(product.shortDescription ?? ""),
    description: String(product.description ?? ""),
    descriptionBlocks: normalizeDescriptionBlocks(product.descriptionBlocks),
    status: product.status,
    image: normalizeProductImages(product)[0] ?? "",
    promoImage: String(product.promoImage ?? ""),
    images: normalizeProductImages(product),
    isNew: Boolean(product.isNew),
    isPopular: Boolean(product.isPopular),
    variantsCount: variants.length,
    minPrice: prices.length > 0 ? Math.min(...prices) : null,
    stockTotal: variants.reduce((sum: number, variant: any) => sum + Number(variant.stock ?? 0), 0),
    source: "db",
  };
}

function toAdminVariant(variant: any): AdminVariantItem {
  return {
    id: String(variant.id),
    sku: String(variant.sku),
    slug: String(variant.slug),
    title: String(variant.title),
    memory: String(variant.memory ?? ""),
    color: String(variant.color ?? ""),
    colorHex: String(variant.colorHex ?? ""),
    sim: String(variant.sim ?? ""),
    images: Array.isArray(variant.images) ? variant.images.map(String) : [],
    price: Number(variant.price),
    oldPrice: variant.oldPrice === null || variant.oldPrice === undefined ? null : Number(variant.oldPrice),
    stock: Number(variant.stock ?? 0),
    status: variant.status,
  };
}

export async function getAdminCategories(): Promise<AdminCategoryOption[]> {
  const dbCategories = await prisma.category.findMany({
    where: {
      status: {
        not: "hidden",
      },
    },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });

  return dbCategories.map((category) => ({
    id: category.id,
    slug: category.slug,
    name: category.name,
  }));
}

export async function getAdminProducts(): Promise<AdminProductListItem[]> {
  try {
    const dbProducts = await prisma.product.findMany({
      include: {
        category: true,
        variants: true,
      },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    });

    return dbProducts.map(toAdminProduct);
  } catch (error) {
    console.error("Failed to load products from database", error);
    return [];
  }
}

export async function getAdminProductBySlug(slug: string): Promise<AdminProductDetail | null> {
  try {
    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        category: true,
        variants: {
          orderBy: [{ price: "asc" }, { createdAt: "asc" }],
        },
      },
    });

    if (product) {
      return {
        ...toAdminProduct(product),
        variants: product.variants.map(toAdminVariant),
      };
    }
  } catch (error) {
    console.error("Failed to load product from database", error);
  }

  return null;
}
