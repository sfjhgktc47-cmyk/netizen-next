import { NextResponse } from "next/server";

import { getPublicCatalogData } from "@/lib/public-catalog-db";
import { getPublicPageBlocks } from "@/lib/page-builder-db";
import { getSiteEditorSettings } from "@/lib/site-settings-db";
import { getSiteContentLibrary } from "@/lib/site-content-library-db";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

function cleanString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function GET() {
  try {
    const [catalog, siteSettings, pageBlocks, contentLibrary] =
      await Promise.all([
        getPublicCatalogData(),
        getSiteEditorSettings(),
        getPublicPageBlocks("home"),
        getSiteContentLibrary({ activeOnly: true }),
      ]);

    const categories = catalog.categories.map((category) => ({
      ...category,
      id: cleanString(category.id) || cleanString(category.slug),
      slug: cleanString(category.slug),
      name: cleanString(category.name),
      description: cleanString(category.description),
      image: cleanString(category.image),
      href:
        cleanString(category.href) || `/catalog/${cleanString(category.slug)}`,
    }));

    const dbProducts = catalog.productCards.filter(
      (product) => product.slug !== "catalog",
    );

    const configuredProducts = dbProducts.filter((product) => {
      const images = [
        product.image,
        ...(Array.isArray(product.images) ? product.images : []),
      ]
        .map((image) => cleanString(image))
        .filter(Boolean);

      return images.length > 0;
    });

    const explicitNewArrivals = dbProducts.filter((product) => product.isNew);

    return NextResponse.json(
      {
        categories,
        products: configuredProducts,
        popularProducts: configuredProducts.filter(
          (product) => product.isPopular,
        ),
        newArrivals:
          explicitNewArrivals.length > 0
            ? explicitNewArrivals
            : dbProducts.slice(0, 3),
        pageBlocks,
        siteSettings,
        banners: contentLibrary.banners,
        benefits: contentLibrary.benefits,
      },
      {
        headers: {
          "Cache-Control":
            "no-store, no-cache, must-revalidate, proxy-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      },
    );
  } catch (error) {
    console.error("Home data loading failed", error);

    return NextResponse.json(
      {
        categories: [],
        products: [],
        popularProducts: [],
        newArrivals: [],
        pageBlocks: [],
        banners: [],
        benefits: [],
      },
      { status: 500 },
    );
  }
}
