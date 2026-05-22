import { notFound } from "next/navigation";
import { productCards } from "@/data/product-cards";
import { productPositions } from "@/data/product-positions";
import { ProductDetailView } from "@/components/product-detail-view";

export async function generateStaticParams() {
  return productCards.map((product) => ({
    slug: product.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const product = productCards.find((item) => item.slug === slug);

  if (!product) {
    return {
      title: "Товар не найден — Netizen",
    };
  }

  return {
    title: `${product.name} — купить в Netizen`,
    description: product.shortDescription,
  };
}

export default async function ProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ sku?: string }>;
}) {
  const { slug } = await params;
  const { sku } = await searchParams;

  const product = productCards.find((item) => item.slug === slug);

  if (!product) {
    notFound();
  }

  const selectedPosition = sku
    ? productPositions.find(
        (position) => position.modelSlug === product.slug && position.sku === sku
      )
    : undefined;

  return <ProductDetailView product={product} selectedPosition={selectedPosition} />;
}
