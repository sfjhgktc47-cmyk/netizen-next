import { NextResponse } from "next/server";

import { getPublicCatalogData } from "@/lib/public-catalog-db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const catalog = await getPublicCatalogData();

    return NextResponse.json({
      categories: catalog.categories.map((category) => ({
        ...category,
        image: category.image || "",
      })),
      products: catalog.productCards,
    });
  } catch (error) {
    console.error("Home data loading failed", error);

    return NextResponse.json({ categories: [], products: [] });
  }
}
