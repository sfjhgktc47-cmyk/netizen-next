import { NextResponse } from "next/server";

import { getPublicCatalogData } from "@/lib/public-catalog-db";

export const dynamic = "force-dynamic";

function cleanImages(product: { image?: unknown; images?: unknown }) {
  const mainImage = typeof product.image === "string" ? product.image.trim() : "";
  const galleryImages = Array.isArray(product.images)
    ? product.images
        .map((image) => (typeof image === "string" ? image.trim() : ""))
        .filter(Boolean)
    : [];

  return [mainImage, ...galleryImages].filter(Boolean);
}

function isRealProduct(product: {
  slug?: unknown;
  image?: unknown;
  images?: unknown;
}) {
  return String(product.slug ?? "") !== "catalog" && cleanImages(product).length > 0;
}

export async function GET() {
  try {
    const catalog = await getPublicCatalogData();
    const configuredProducts = catalog.productCards.filter(isRealProduct);
    const popularProducts = configuredProducts.filter((product) => Boolean(product.isPopular));
    const newArrivals = catalog.productCards.filter(
      (product) =>
        String(product.slug ?? "") !== "catalog" &&
        Boolean(product.isNew) &&
        String(product.promoImage ?? "").trim()
    );

    return NextResponse.json({
      categories: catalog.categories.map((category) => ({
        ...category,
        image: String(category.image ?? ""),
      })),
      products: configuredProducts,
      popularProducts,
      newArrivals,
    });
  } catch (error) {
    console.error("Home data loading failed", error);

    return NextResponse.json({
      categories: [],
      products: [],
      popularProducts: [],
      newArrivals: [],
    });
  }
}
