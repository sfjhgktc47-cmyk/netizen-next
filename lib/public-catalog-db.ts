import "server-only";

import { prisma } from "@/lib/db";
import { formatPrice } from "@/lib/product-pricing";
import { getPublicCategoriesFromDb, type PublicCategory } from "@/lib/public-categories-db";

export type PublicProductModel = {
  slug: string;
  name: string;
  brand: string;
  category: string;
  categoryName: string;
  price: string;
  description: string;
  shortDescription: string;
  image: string;
  images: string[];
  colors: string[];
  status: string;
};

export type PublicProductPosition = {
  modelSlug: string;
  sku: string;
  slug: string;
  title: string;
  memory: string;
  color: string;
  colorHex: string;
  sim: string;
  price: string;
  oldPrice: string;
  stock: number;
  status: string;
  images: string[];
  seoTitle: string;
  seoDescription: string;
};

export type PublicCatalogData = {
  products: PublicProductModel[];
  productCards: PublicProductModel[];
  positions: PublicProductPosition[];
  categories: PublicCategory[];
};

type ProductWithVariants = Awaited<ReturnType<typeof getDbProductsForPublicCatalog>>[number];

function getVariantStatus(status: string, stock: number) {
  if (status === "out_of_stock" || stock <= 0) {
    return "out_of_stock";
  }

  if (status === "draft" || status === "hidden") {
    return status;
  }

  return "active";
}

function getProductImages(product: ProductWithVariants) {
  const productImages = Array.isArray(product.images)
    ? product.images.map(String).filter(Boolean)
    : [];

  if (productImages.length > 0) {
    return productImages;
  }

  if (product.image) {
    return [product.image];
  }

  return product.variants
    .flatMap((variant) => (Array.isArray(variant.images) ? variant.images : []))
    .map(String)
    .filter(Boolean);
}

function getProductColors(product: ProductWithVariants) {
  const variantColors = product.variants
    .map((variant) => variant.colorHex)
    .filter((color): color is string => Boolean(color));

  return Array.from(new Set([...product.colors, ...variantColors]));
}

function getPriceRange(variants: ProductWithVariants["variants"]) {
  const prices = variants
    .map((variant) => Number(variant.price))
    .filter((price) => Number.isFinite(price) && price > 0);

  if (prices.length === 0) {
    return "Цена по запросу";
  }

  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);

  if (minPrice === maxPrice) {
    return formatPrice(minPrice);
  }

  return `от ${formatPrice(minPrice)}`;
}

function toPublicProduct(product: ProductWithVariants): PublicProductModel {
  return {
    slug: product.slug,
    name: product.name,
    brand: product.brand,
    category: product.categorySlug,
    categoryName: product.category?.name ?? product.categorySlug,
    price: getPriceRange(product.variants),
    description: product.description,
    shortDescription: product.shortDescription || product.description,
    image: getProductImages(product)[0] ?? "",
    images: getProductImages(product),
    colors: getProductColors(product),
    status: product.status,
  };
}

function toPublicPosition(
  variant: ProductWithVariants["variants"][number],
  product: ProductWithVariants
): PublicProductPosition {
  return {
    modelSlug: product.slug,
    sku: variant.sku,
    slug: variant.slug,
    title: variant.title,
    memory: variant.memory,
    color: variant.color,
    colorHex: variant.colorHex,
    sim: variant.sim,
    price: formatPrice(variant.price),
    oldPrice: variant.oldPrice ? formatPrice(variant.oldPrice) : "",
    stock: variant.stock,
    status: getVariantStatus(variant.status, variant.stock),
    images: variant.images,
    seoTitle: variant.seoTitle || `${variant.title} — купить в Netizen`,
    seoDescription:
      variant.seoDescription ||
      `${variant.title} — конфигурация модели ${product.name}. Цена, наличие и доставка уточняются менеджером.`,
  };
}

async function getDbProductsForPublicCatalog() {
  return prisma.product.findMany({
    where: {
      status: "active",
    },
    include: {
      category: true,
      variants: {
        where: {
          status: {
            in: ["active", "out_of_stock"],
          },
        },
        orderBy: [{ price: "asc" }, { createdAt: "asc" }],
      },
    },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });
}

export async function getPublicCatalogData(): Promise<PublicCatalogData> {
  const [dbProducts, categories] = await Promise.all([
    getDbProductsForPublicCatalog(),
    getPublicCategoriesFromDb(),
  ]);
  const products = dbProducts.map(toPublicProduct);
  const positions = dbProducts.flatMap((product) =>
    product.variants.map((variant) => toPublicPosition(variant, product))
  );

  return {
    products,
    productCards: products,
    positions,
    categories,
  };
}

export async function getPublicProductBySlug(slug: string) {
  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      category: true,
      variants: {
        where: {
          status: {
            in: ["active", "out_of_stock"],
          },
        },
        orderBy: [{ price: "asc" }, { createdAt: "asc" }],
      },
    },
  });

  if (!product || product.status !== "active") {
    return null;
  }

  return {
    product: toPublicProduct(product),
    positions: product.variants.map((variant) => toPublicPosition(variant, product)),
  };
}

export async function getPublicProductSlugs() {
  const products = await prisma.product.findMany({
    where: { status: "active" },
    select: { slug: true },
  });

  return products.map((product) => product.slug);
}
