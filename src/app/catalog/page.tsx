import { CatalogView } from "@/components/catalog-view";
import { getPublicCatalogData } from "@/lib/public-catalog-db";

export const revalidate = 60;

export default async function CatalogPage() {
  const catalog = await getPublicCatalogData();

  return (
    <CatalogView
      productsData={catalog.products}
      positionsData={catalog.positions}
      categoriesData={catalog.categories}
    />
  );
}
