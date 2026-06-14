import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

const productSelect = {
  select: { id: true, name: true, brand: true, slug: true },
};

const customerSelect = {
  select: { name: true, lastName: true, email: true, phone: true },
};

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const entity = params.get("entity") === "reviews" ? "reviews" : "questions";
  const search = (params.get("search") || "").trim();

  if (entity === "reviews") {
    const reviews = await prisma.productReview.findMany({
      where: search
        ? {
            OR: [
              { text: { contains: search, mode: "insensitive" } },
              { product: { name: { contains: search, mode: "insensitive" } } },
            ],
          }
        : undefined,
      orderBy: { createdAt: "desc" },
      take: 100,
      include: { product: productSelect, customer: customerSelect },
    });

    return NextResponse.json({
      reviews: reviews.map((review) => ({
        id: review.id,
        rating: review.rating,
        text: review.text,
        images: review.images,
        verifiedPurchase: review.verifiedPurchase,
        helpfulCount: review.helpfulCount,
        unhelpfulCount: review.unhelpfulCount,
        isVisible: review.isVisible,
        createdAt: review.createdAt.toISOString(),
        product: review.product,
        customer: review.customer,
      })),
      questions: [],
    });
  }

  const questions = await prisma.productQuestion.findMany({
    where: search
      ? {
          OR: [
            { text: { contains: search, mode: "insensitive" } },
            { authorName: { contains: search, mode: "insensitive" } },
            { product: { name: { contains: search, mode: "insensitive" } } },
          ],
        }
      : undefined,
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { product: productSelect, customer: customerSelect },
  });

  return NextResponse.json({
    questions: questions.map((question) => ({
      id: question.id,
      authorName: question.authorName,
      authorEmail: question.authorEmail,
      text: question.text,
      answer: question.answer,
      answeredAt: question.answeredAt ? question.answeredAt.toISOString() : null,
      isVisible: question.isVisible,
      createdAt: question.createdAt.toISOString(),
      product: question.product,
      customer: question.customer,
    })),
    reviews: [],
  });
}

export async function PATCH(request: NextRequest) {
  const body = await request.json().catch(() => null);

  if (!body || typeof body.id !== "string") {
    return NextResponse.json({ error: "Некорректный запрос." }, { status: 400 });
  }

  if (body.entity === "review") {
    await prisma.productReview.update({
      where: { id: body.id },
      data: {
        isVisible:
          typeof body.isVisible === "boolean" ? body.isVisible : undefined,
        adminReply:
          typeof body.adminReply === "string" ? body.adminReply : undefined,
      },
    });

    return NextResponse.json({ ok: true });
  }

  const answer = typeof body.answer === "string" ? body.answer.trim() : "";

  await prisma.productQuestion.update({
    where: { id: body.id },
    data: {
      answer,
      answeredAt: answer ? new Date() : null,
      isVisible:
        typeof body.isVisible === "boolean" ? body.isVisible : undefined,
    },
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const entity = params.get("entity");
  const id = params.get("id");

  if (!id) {
    return NextResponse.json({ error: "Не указан ID." }, { status: 400 });
  }

  if (entity === "review") {
    await prisma.productReview.delete({ where: { id } });
  } else {
    await prisma.productQuestion.delete({ where: { id } });
  }

  return NextResponse.json({ ok: true });
}
