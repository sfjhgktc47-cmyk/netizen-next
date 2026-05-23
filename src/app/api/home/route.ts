import { NextResponse } from "next/server";

import { getPublicCatalogData } from "@/lib/public-catalog-db";
import { getPublicPageBlocks } from "@/lib/page-builder-db";
import { getSiteEditorSettings } from "@/lib/site-settings-db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [catalog, siteSettings, pageBlocks] = await Promise.all([
      getPublicCatalogData(),
      getSiteEditorSettings(),
      getPublicPageBlocks("home"),
    ]);

    const dbProducts = catalog.productCards.filter(
      (product) => product.slug !== "catalog"
    );

    const configuredProducts = dbProducts.filter((product) => {
      const images = [
        product.image,
        product.promoImage,
        ...(Array.isArray(product.images) ? product.images : []),
      ]
        .map((image) => String(image ?? "").trim())
        .filter(Boolean);

      return images.length > 0;
    });

    const explicitNewArrivals = dbProducts.filter((product) => product.isNew);

    return NextResponse.json({
      categories: catalog.categories.map((category) => ({
        ...category,
        image: category.image || "",
      })),
      products: dbProducts,
      popularProducts: configuredProducts.filter((product) => product.isPopular),
      newArrivals:
        explicitNewArrivals.length > 0
          ? explicitNewArrivals
          : dbProducts.slice(0, 3),
      pageBlocks,
      siteSettings,
    });
  } catch (error) {
    console.error("Home data loading failed", error);

    return NextResponse.json({ categories: [], products: [], pageBlocks: [] });
  }
}
