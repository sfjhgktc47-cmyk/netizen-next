import "server-only";

import { unstable_cache } from "next/cache";

import { prisma } from "@/lib/db";

const PUBLIC_CACHE_SECONDS = 60;

export type PublicCategory = {
  id: string;
  slug: string;
  name: string;
  description: string;
  image: string;
  href: string;
  seoTitle: string;
  seoDescription: string;
};

function cleanString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function toPublicCategory(category: {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  image: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
}): PublicCategory {
  const slug = cleanString(category.slug);

  return {
    id: cleanString(category.id) || slug,
    slug,
    name: cleanString(category.name),
    description: cleanString(category.description),
    image: cleanString(category.image),
    href: `/catalog/${slug}`,
    seoTitle: cleanString(category.seoTitle),
    seoDescription: cleanString(category.seoDescription),
  };
}

async function getPublicCategoriesFromDbUncached(): Promise<PublicCategory[]> {
  const categories = await prisma.category.findMany({
    where: {
      status: "active",
    },
    select: {
      id: true,
      slug: true,
      name: true,
      description: true,
      image: true,
      seoTitle: true,
      seoDescription: true,
      sortOrder: true,
    },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });

  return categories.map(toPublicCategory);
}

const getCachedPublicCategoriesFromDb = unstable_cache(
  getPublicCategoriesFromDbUncached,
  ["public-categories-v2"],
  {
    revalidate: PUBLIC_CACHE_SECONDS,
    tags: ["public-categories", "public-catalog"],
  },
);

export async function getPublicCategoriesFromDb(): Promise<PublicCategory[]> {
  return getCachedPublicCategoriesFromDb();
}

async function getPublicCategoryBySlugUncached(
  slug: string,
): Promise<PublicCategory | null> {
  const category = await prisma.category.findFirst({
    where: {
      slug,
      status: "active",
    },
    select: {
      id: true,
      slug: true,
      name: true,
      description: true,
      image: true,
      seoTitle: true,
      seoDescription: true,
    },
  });

  return category ? toPublicCategory(category) : null;
}

export async function getPublicCategoryBySlug(
  slug: string,
): Promise<PublicCategory | null> {
  const cachedCategoryBySlug = unstable_cache(
    getPublicCategoryBySlugUncached,
    [`public-category-${slug}-v2`],
    {
      revalidate: PUBLIC_CACHE_SECONDS,
      tags: ["public-categories", "public-catalog", `public-category-${slug}`],
    },
  );

  return cachedCategoryBySlug(slug);
}

export async function getPublicCategorySlugs() {
  const categories = await prisma.category.findMany({
    where: { status: "active" },
    select: { slug: true },
  });

  return categories.map((category) => category.slug);
}
