import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const categories = await prisma.faqCategory.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      include: {
        questions: {
          where: { isActive: true },
          orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
        },
      },
    });

    return NextResponse.json({
      categories: categories.map((category) => ({
        id: category.id,
        slug: category.slug,
        eyebrow: category.eyebrow,
        title: category.title,
        icon: category.icon,
        description: category.description,
        questions: category.questions.map((question) => ({
          id: question.id,
          question: question.question,
          answer: question.answer,
        })),
      })),
    });
  } catch (error) {
    console.error("FAQ public load failed", error);
    return NextResponse.json({ categories: [] }, { status: 500 });
  }
}
