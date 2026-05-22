import { notFound } from "next/navigation";
import { categories } from "@/data/categories";
import { CatalogView } from "@/components/catalog-view";
import { getPublicCatalogData } from "@/lib/public-catalog-db";

export async function generateStaticParams() {
  return categories.map((category) => ({
    category: category.id,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;

  const activeCategory = categories.find((item) => item.id === category);

  if (!activeCategory) {
    return {
      title: "Категория не найдена — Netizen",
    };
  }

  return {
    title: `${activeCategory.name} — каталог Netizen`,
    description: activeCategory.description,
  };
}

export const dynamic = "force-dynamic";

export default async function CatalogCategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;

  const activeCategory = categories.find((item) => item.id === category);

  if (!activeCategory) {
    notFound();
  }

  const catalog = await getPublicCatalogData();

  return (
    <CatalogView
      categoryId={category}
      productsData={catalog.products}
      positionsData={catalog.positions}
    />
  );
}
