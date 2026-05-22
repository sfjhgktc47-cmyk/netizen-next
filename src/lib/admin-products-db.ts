import "server-only";

import { prisma } from "@/lib/db";
import { categories as fileCategories } from "@/data/categories";
import { productCards } from "@/data/product-cards";
import { productPositions } from "@/data/product-positions";

export type AdminProductStatus = "active" | "draft" | "hidden" | "out_of_stock";

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
  status: AdminProductStatus;
  image: string;
  isNew: boolean;
  isPopular: boolean;
  variantsCount: number;
  minPrice: number | null;
  stockTotal: number;
  source: "db" | "demo";
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


function moneyToNumber(value: unknown) {
  if (typeof value === "number") {
    return value;
  }

  if (typeof value !== "string") {
    return 0;
  }

  const normalized = value.replace(/[^0-9]/g, "");
  return normalized ? Number(normalized) : 0;
}

function getDemoCategoryName(categorySlug: string) {
  return fileCategories.find((category) => category.id === categorySlug)?.name ?? categorySlug;
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
    status: product.status,
    image: String(product.image ?? ""),
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
    price: Number(variant.price),
    oldPrice: variant.oldPrice === null || variant.oldPrice === undefined ? null : Number(variant.oldPrice),
    stock: Number(variant.stock ?? 0),
    status: variant.status,
  };
}

function getDemoProducts(): AdminProductListItem[] {
  return productCards.map((product) => {
    const variants = productPositions.filter((position) => position.modelSlug === product.slug);
    const prices = variants.map((variant) => moneyToNumber(variant.price)).filter((price) => price > 0);

    return {
      id: product.slug,
      slug: product.slug,
      name: product.name,
      brand: product.brand,
      categorySlug: product.category,
      categoryName: getDemoCategoryName(product.category),
      shortDescription: product.shortDescription,
      description: product.shortDescription,
      status: product.status === "active" ? "active" : "draft",
      image: "",
      isNew: false,
      isPopular: true,
      variantsCount: variants.length,
      minPrice: prices.length > 0 ? Math.min(...prices) : null,
      stockTotal: variants.reduce((sum, variant) => sum + variant.stock, 0),
      source: "demo",
    };
  });
}

function getDemoProductBySlug(slug: string): AdminProductDetail | null {
  const product = getDemoProducts().find((item) => item.slug === slug);

  if (!product) {
    return null;
  }

  const variants = productPositions
    .filter((position) => position.modelSlug === slug)
    .map((position) => ({
      id: position.sku,
      sku: position.sku,
      slug: position.sku.toLowerCase(),
      title: position.title,
      memory: position.memory,
      color: position.color,
      colorHex: position.colorHex,
      sim: position.sim,
      price: moneyToNumber(position.price),
      oldPrice: position.oldPrice ? moneyToNumber(position.oldPrice) : null,
      stock: position.stock,
      status: position.stock > 0 ? "active" : "out_of_stock",
    } satisfies AdminVariantItem));

  return {
    ...product,
    variants,
  };
}

export async function getAdminCategories(): Promise<AdminCategoryOption[]> {
  try {
    const dbCategories = await prisma.category.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    });

    if (dbCategories.length > 0) {
      return dbCategories.map((category) => ({
        id: category.id,
        slug: category.slug,
        name: category.name,
      }));
    }
  } catch (error) {
    console.error("Failed to load categories from database", error);
  }

  return fileCategories.map((category) => ({
    id: category.id,
    slug: category.id,
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

    if (dbProducts.length > 0) {
      return dbProducts.map(toAdminProduct);
    }
  } catch (error) {
    console.error("Failed to load products from database", error);
  }

  return getDemoProducts();
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

  return getDemoProductBySlug(slug);
}
