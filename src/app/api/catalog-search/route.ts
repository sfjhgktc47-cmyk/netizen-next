import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { formatPrice } from "@/lib/product-pricing";
import { publicImageUrl } from "@/lib/public-image-urls";

export const dynamic = "force-dynamic";

function getDiscount(price: number, oldPrice: number | null) {
  if (!oldPrice || oldPrice <= price || price <= 0) {
    return 0;
  }

  return Math.round(((oldPrice - price) / oldPrice) * 100);
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const query = (url.searchParams.get("q") || "").trim();

  try {
    const products = await prisma.product.findMany({
      where: {
        status: "active",
        ...(query
          ? {
              OR: [
                { name: { contains: query, mode: "insensitive" } },
                { brand: { contains: query, mode: "insensitive" } },
                { categorySlug: { contains: query, mode: "insensitive" } },
                {
                  variants: {
                    some: {
                      OR: [
                        { title: { contains: query, mode: "insensitive" } },
                        { sku: { contains: query, mode: "insensitive" } },
                      ],
                    },
                  },
                },
              ],
            }
          : {
              OR: [{ isPopular: true }, { isNew: true }],
            }),
      },
      include: {
        variants: {
          where: {
            status: {
              in: ["active", "out_of_stock"],
            },
          },
          orderBy: [{ price: "asc" }, { createdAt: "asc" }],
        },
      },
      orderBy: query
        ? [{ sortOrder: "asc" }, { createdAt: "desc" }]
        : [{ isPopular: "desc" }, { isNew: "desc" }, { sortOrder: "asc" }],
      take: 8,
    });

    const result = products.map((product) => {
      const variant = product.variants.find((item) => item.price > 0) ?? product.variants[0];
      const price = variant?.price ?? 0;
      const oldPrice = variant?.oldPrice ?? null;
      const imageSource =
        (Array.isArray(product.images) && product.images[0]) ||
        product.image ||
        (variant && Array.isArray(variant.images) ? variant.images[0] : "") ||
        "";

      return {
        slug: product.slug,
        name: product.name,
        brand: product.brand,
        image: publicImageUrl("product", product.slug, "images", String(imageSource), 0),
        price: price > 0 ? formatPrice(price) : "Цена по запросу",
        oldPrice: oldPrice ? formatPrice(oldPrice) : "",
        discount: getDiscount(price, oldPrice),
      };
    });

    return NextResponse.json(
      { products: result },
      {
        headers: {
          "Cache-Control": query
            ? "private, max-age=30"
            : "public, max-age=120, stale-while-revalidate=300",
        },
      },
    );
  } catch (error) {
    console.error("Catalog search failed", error);
    return NextResponse.json({ products: [] }, { status: 200 });
  }
}
