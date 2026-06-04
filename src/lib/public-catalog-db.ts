import "server-only";

import { unstable_cache } from "next/cache";

import { prisma } from "@/lib/db";
import { formatPrice } from "@/lib/product-pricing";
import { getPublicCategoriesFromDb, type PublicCategory } from "@/lib/public-categories-db";

const PUBLIC_CACHE_SECONDS = 60;

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

export type PublicProductModel = {
  slug: string;
  name: string;
  brand: string;
  category: string;
  categoryName: string;
  price: string;
  description: string;
  shortDescription: string;
  descriptionBlocks: ProductDescriptionBlock[];
  image: string;
  promoImage: string;
  images: string[];
  colors: string[];
  status: string;
  isNew: boolean;
  isPopular: boolean;
  sortOrder: number;
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

type ProductWithVariants = Awaited<ReturnType<typeof getDbProductsForPublicCatalogUncached>>[number];

type PublicTransformOptions = {
  includeAllImages?: boolean;
  includeDescriptionBlocks?: boolean;
};

function firstCleanString(values: unknown[]) {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }

    if (Array.isArray(value)) {
      const first = value.map(String).find((item) => item.trim());

      if (first) {
        return first.trim();
      }
    }
  }

  return "";
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

function getVariantStatus(status: string, stock: number) {
  if (status === "out_of_stock" || stock <= 0) {
    return "out_of_stock";
  }

  if (status === "draft" || status === "hidden") {
    return status;
  }

  return "active";
}

function getProductImages(
  product: ProductWithVariants,
  options: PublicTransformOptions = {}
) {
  const includeAllImages = options.includeAllImages ?? true;
  const productImages = Array.isArray(product.images)
    ? product.images.map(String).filter(Boolean)
    : [];

  if (!includeAllImages) {
    const firstImage = firstCleanString([
      product.image,
      productImages,
      product.variants.flatMap((variant) =>
        Array.isArray(variant.images) ? variant.images : []
      ),
    ]);

    return firstImage ? [firstImage] : [];
  }

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

function getVariantImages(
  variant: ProductWithVariants["variants"][number],
  options: PublicTransformOptions = {}
) {
  const images = Array.isArray(variant.images)
    ? variant.images.map(String).filter(Boolean)
    : [];

  if (options.includeAllImages === false) {
    const firstImage = firstCleanString([images]);

    return firstImage ? [firstImage] : [];
  }

  return images;
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

  return `от ${formatPrice(minPrice)} до ${formatPrice(maxPrice)}`;
}

function toPublicProduct(
  product: ProductWithVariants,
  options: PublicTransformOptions = {}
): PublicProductModel {
  const images = getProductImages(product, options);

  return {
    slug: product.slug,
    name: product.name,
    brand: product.brand,
    category: product.categorySlug,
    categoryName: product.category?.name ?? product.categorySlug,
    price: getPriceRange(product.variants),
    description: product.description,
    shortDescription: product.shortDescription || product.description,
    descriptionBlocks:
      options.includeDescriptionBlocks === false
        ? []
        : normalizeDescriptionBlocks(product.descriptionBlocks),
    image: images[0] ?? "",
    promoImage: String(product.promoImage ?? ""),
    images,
    colors: getProductColors(product),
    status: product.status,
    isNew: Boolean(product.isNew),
    isPopular: Boolean(product.isPopular),
    sortOrder: Number(product.sortOrder ?? 100),
  };
}

function toPublicPosition(
  variant: ProductWithVariants["variants"][number],
  product: ProductWithVariants,
  options: PublicTransformOptions = {}
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
    images: getVariantImages(variant, options),
    seoTitle: variant.seoTitle || `${variant.title} — купить в Netizen`,
    seoDescription:
      variant.seoDescription ||
      `${variant.title} — конфигурация модели ${product.name}. Цена, наличие и доставка уточняются менеджером.`,
  };
}

async function getDbProductsForPublicCatalogUncached() {
  return prisma.product.findMany({
    where: {
      status: "active",
    },
    select: {
      id: true,
      slug: true,
      name: true,
      brand: true,
      categorySlug: true,
      description: true,
      shortDescription: true,
      descriptionBlocks: true,
      image: true,
      promoImage: true,
      images: true,
      colors: true,
      status: true,
      isNew: true,
      isPopular: true,
      sortOrder: true,
      createdAt: true,
      category: {
        select: {
          name: true,
        },
      },
      variants: {
        where: {
          status: {
            in: ["active", "out_of_stock"],
          },
        },
        select: {
          sku: true,
          slug: true,
          title: true,
          memory: true,
          color: true,
          colorHex: true,
          sim: true,
          images: true,
          price: true,
          oldPrice: true,
          stock: true,
          status: true,
          seoTitle: true,
          seoDescription: true,
          createdAt: true,
        },
        orderBy: [{ price: "asc" }, { createdAt: "asc" }],
      },
    },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });
}

const getCachedDbProductsForPublicCatalog = unstable_cache(
  getDbProductsForPublicCatalogUncached,
  ["public-catalog-products-v2"],
  {
    revalidate: PUBLIC_CACHE_SECONDS,
    tags: ["public-catalog"],
  }
);

async function getDbProductsForPublicCatalog() {
  return getCachedDbProductsForPublicCatalog();
}

export async function getPublicCatalogData(): Promise<PublicCatalogData> {
  const [dbProducts, categories] = await Promise.all([
    getDbProductsForPublicCatalog(),
    getPublicCategoriesFromDb(),
  ]);

  const listOptions = {
    includeAllImages: false,
    includeDescriptionBlocks: false,
  } satisfies PublicTransformOptions;

  const products = dbProducts.map((product) => toPublicProduct(product, listOptions));
  const positions = dbProducts.flatMap((product) =>
    product.variants.map((variant) => toPublicPosition(variant, product, listOptions))
  );

  return {
    products,
    productCards: products,
    positions,
    categories,
  };
}

async function getPublicProductBySlugUncached(slug: string) {
  const product = await prisma.product.findUnique({
    where: { slug },
    select: {
      id: true,
      slug: true,
      name: true,
      brand: true,
      categorySlug: true,
      description: true,
      shortDescription: true,
      descriptionBlocks: true,
      image: true,
      promoImage: true,
      images: true,
      colors: true,
      status: true,
      isNew: true,
      isPopular: true,
      sortOrder: true,
      createdAt: true,
      category: {
        select: {
          name: true,
        },
      },
      variants: {
        where: {
          status: {
            in: ["active", "out_of_stock"],
          },
        },
        select: {
          sku: true,
          slug: true,
          title: true,
          memory: true,
          color: true,
          colorHex: true,
          sim: true,
          images: true,
          price: true,
          oldPrice: true,
          stock: true,
          status: true,
          seoTitle: true,
          seoDescription: true,
          createdAt: true,
        },
        orderBy: [{ price: "asc" }, { createdAt: "asc" }],
      },
    },
  });

  if (!product || product.status !== "active") {
    return null;
  }

  return {
    product: toPublicProduct(product, {
      includeAllImages: false,
      includeDescriptionBlocks: false,
    }),
    positions: product.variants.map((variant) =>
      toPublicPosition(variant, product, { includeAllImages: false })
    ),
  };
}

export async function getPublicProductBySlug(slug: string) {
  const cachedProductBySlug = unstable_cache(
    getPublicProductBySlugUncached,
    [`public-product-${slug}-v2`],
    {
      revalidate: PUBLIC_CACHE_SECONDS,
      tags: ["public-catalog", `public-product-${slug}`],
    }
  );

  return cachedProductBySlug(slug);
}

export async function getPublicProductSlugs() {
  const products = await prisma.product.findMany({
    where: { status: "active" },
    select: { slug: true },
  });

  return products.map((product) => product.slug);
}
