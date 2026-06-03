import "server-only";

import { prisma } from "@/lib/db";

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

export async function getPublicCategoriesFromDb(): Promise<PublicCategory[]> {
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

export async function getPublicCategoryBySlug(
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

export async function getPublicCategorySlugs() {
  const categories = await prisma.category.findMany({
    where: { status: "active" },
    select: { slug: true },
  });

  return categories.map((category) => category.slug);
}
