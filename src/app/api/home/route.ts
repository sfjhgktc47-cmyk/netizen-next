import { NextResponse } from "next/server";

import { getPublicCatalogData } from "@/lib/public-catalog-db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const catalog = await getPublicCatalogData();
    const categoryImages = new Map<string, string>();

    for (const product of catalog.productCards) {
      if (!categoryImages.has(product.category) && product.image) {
        categoryImages.set(product.category, product.image);
      }
    }

    return NextResponse.json({
      categories: catalog.categories.map((category) => ({
        ...category,
        image: categoryImages.get(category.slug) ?? "",
      })),
      products: catalog.productCards,
    });
  } catch (error) {
    console.error("Home data loading failed", error);

    return NextResponse.json({ categories: [], products: [] });
  }
}
