import { NextResponse } from "next/server";

import { getPublicCatalogData } from "@/lib/public-catalog-db";
import { getPublicPageBlocks } from "@/lib/page-builder-db";
import { getSiteEditorSettings } from "@/lib/site-settings-db";
import { getSiteContentLibrary } from "@/lib/site-content-library-db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [catalog, siteSettings, pageBlocks, contentLibrary] = await Promise.all([
      getPublicCatalogData(),
      getSiteEditorSettings(),
      getPublicPageBlocks("home"),
      getSiteContentLibrary({ activeOnly: true, benefitPlacement: "store" }),
    ]);

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
      pageBlocks,
      siteSettings,
      banners: contentLibrary.banners,
      benefits: contentLibrary.benefits,
    });
  } catch (error) {
    console.error("Home data loading failed", error);

    return NextResponse.json({ categories: [], products: [], pageBlocks: [], banners: [], benefits: [] });
  }
}
