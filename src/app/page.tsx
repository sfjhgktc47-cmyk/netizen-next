import { getPublicCatalogData } from "@/lib/public-catalog-db";
import { getPublicPageBlocks } from "@/lib/page-builder-db";
import { getSiteEditorSettings } from "@/lib/site-settings-db";
import { getSiteContentLibrary } from "@/lib/site-content-library-db";
import HomeClient from "./home-client";

export const revalidate = 60;

function cleanString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export default async function Page() {
  try {
    const [catalog, siteSettings, pageBlocks, contentLibrary] = await Promise.all([
      getPublicCatalogData(),
      getSiteEditorSettings(),
      getPublicPageBlocks("home"),
      getSiteContentLibrary({ activeOnly: true }),
    ]);

    const allProducts = catalog.productCards.filter(
      (p) => p.slug !== "catalog"
    );
    const configuredProducts = allProducts.filter((p) => {
      const imgs = [p.image, ...(Array.isArray(p.images) ? p.images : [])]
        .map((img) => cleanString(img))
        .filter(Boolean);
      return imgs.length > 0;
    });
    const explicitNew = allProducts.filter((p) => p.isNew);

    const initialData = {
      categories: catalog.categories.map((category) => ({
        ...category,
        id: cleanString(category.id) || cleanString(category.slug),
        slug: cleanString(category.slug),
        name: cleanString(category.name),
        description: cleanString(category.description),
        image: cleanString(category.image),
        href:
          cleanString(category.href) ||
          `/catalog/${cleanString(category.slug)}`,
      })),
      products: configuredProducts,
      popularProducts: configuredProducts.filter((p) => p.isPopular),
      newArrivals: explicitNew.length > 0 ? explicitNew : allProducts.slice(0, 3),
      pageBlocks,
      siteSettings,
      banners: contentLibrary.banners,
      benefits: contentLibrary.benefits,
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return <HomeClient initialData={initialData as any} />;
  } catch (err) {
    console.error("Home page server fetch failed:", err);
    return <HomeClient initialData={{}} />;
  }
}
