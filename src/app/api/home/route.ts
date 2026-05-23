import { NextResponse } from "next/server";

import { getPublicCatalogData } from "@/lib/public-catalog-db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const catalog = await getPublicCatalogData();

    const configuredProducts = catalog.productCards.filter((product) => {
      const images = [product.image, ...(Array.isArray(product.images) ? product.images : [])]
        .map((image) => String(image ?? "").trim())
        .filter(Boolean);

      return product.slug !== "catalog" && images.length > 0;
    });

    const dbProducts = catalog.productCards.filter(
      (product) => product.slug !== "catalog"
    );
    const explicitNewArrivals = dbProducts.filter((product) => product.isNew);

    return NextResponse.json({
      categories: catalog.categories.map((category) => ({
        ...category,
        image: category.image || "",
      })),
      products: configuredProducts,
      popularProducts: configuredProducts.filter((product) => product.isPopular),
      newArrivals:
        explicitNewArrivals.length > 0
          ? explicitNewArrivals
          : dbProducts.slice(0, 3),
    });
  } catch (error) {
    console.error("Home data loading failed", error);

    return NextResponse.json({ categories: [], products: [] });
  }
}
