import { NextResponse } from "next/server";

import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

type CommunityBody = {
  type?: "review" | "question";
  rating?: number;
  text?: string;
  authorName?: string;
  authorEmail?: string;
};

function normalizeText(value: unknown, maxLength = 2000) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

async function findProduct(slug: string) {
  return prisma.product.findUnique({
    where: { slug },
    select: { id: true, name: true },
  });
}

async function hasCompletedPurchase(customerId: string, productId: string) {
  const order = await prisma.order.findFirst({
    where: {
      customerId,
      status: "completed",
      items: {
        some: {
          productId,
        },
      },
    },
    select: { id: true },
  });

  return Boolean(order);
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const { slug } = await context.params;
  const product = await findProduct(slug);

  if (!product) {
    return NextResponse.json({ error: "Товар не найден." }, { status: 404 });
  }

  const session = await getAuthSession();

  const [reviews, questions, reviewAggregate, existingReview] = await Promise.all([
    prisma.productReview.findMany({
      where: { productId: product.id },
      orderBy: { createdAt: "desc" },
      take: 30,
      include: {
        customer: {
          select: { name: true, lastName: true },
        },
      },
    }),
    prisma.productQuestion.findMany({
      where: { productId: product.id },
      orderBy: { createdAt: "desc" },
      take: 30,
    }),
    prisma.productReview.aggregate({
      where: { productId: product.id },
      _avg: { rating: true },
      _count: { id: true },
    }),
    session?.role === "customer" && session.customerId
      ? prisma.productReview.findUnique({
          where: {
            productId_customerId: {
              productId: product.id,
              customerId: session.customerId,
            },
          },
          select: { id: true },
        })
      : Promise.resolve(null),
  ]);

  const canReview =
    session?.role === "customer" && session.customerId
      ? !existingReview &&
        (await hasCompletedPurchase(session.customerId, product.id))
      : false;

  return NextResponse.json({
    summary: {
      rating: Number(reviewAggregate._avg.rating ?? 0),
      reviewsCount: reviewAggregate._count.id,
      questionsCount: questions.length,
    },
    authenticated: Boolean(session?.role === "customer" && session.customerId),
    canReview,
    hasReview: Boolean(existingReview),
    reviews: reviews.map((review) => ({
      id: review.id,
      rating: review.rating,
      text: review.text,
      verifiedPurchase: review.verifiedPurchase,
      author:
        [review.customer.name, review.customer.lastName].filter(Boolean).join(" ") ||
        "Покупатель",
      createdAt: review.createdAt.toISOString(),
    })),
    questions: questions.map((question) => ({
      id: question.id,
      authorName: question.authorName,
      text: question.text,
      answer: question.answer,
      createdAt: question.createdAt.toISOString(),
    })),
  });
}

export async function POST(
  request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const { slug } = await context.params;
  const product = await findProduct(slug);

  if (!product) {
    return NextResponse.json({ error: "Товар не найден." }, { status: 404 });
  }

  const body = (await request.json().catch(() => ({}))) as CommunityBody;
  const text = normalizeText(body.text);

  if (text.length < 3) {
    return NextResponse.json(
      { error: "Напишите сообщение длиной хотя бы 3 символа." },
      { status: 400 },
    );
  }

  const session = await getAuthSession();

  if (body.type === "review") {
    if (session?.role !== "customer" || !session.customerId) {
      return NextResponse.json(
        { error: "Чтобы оставить отзыв, войдите в аккаунт." },
        { status: 401 },
      );
    }

    const rating = Math.round(Number(body.rating));

    if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Выберите оценку от 1 до 5." },
        { status: 400 },
      );
    }

    const purchased = await hasCompletedPurchase(session.customerId, product.id);

    if (!purchased) {
      return NextResponse.json(
        { error: "Отзыв можно оставить только после завершённой покупки этого товара." },
        { status: 403 },
      );
    }

    const existing = await prisma.productReview.findUnique({
      where: {
        productId_customerId: {
          productId: product.id,
          customerId: session.customerId,
        },
      },
      select: { id: true },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Вы уже оставили отзыв об этом товаре." },
        { status: 409 },
      );
    }

    await prisma.productReview.create({
      data: {
        productId: product.id,
        customerId: session.customerId,
        rating,
        text,
        verifiedPurchase: true,
      },
    });

    return NextResponse.json({ ok: true });
  }

  const customer =
    session?.role === "customer" && session.customerId
      ? await prisma.customer.findUnique({
          where: { id: session.customerId },
          select: { id: true, name: true, lastName: true, email: true },
        })
      : null;

  const authorName =
    [customer?.name, customer?.lastName].filter(Boolean).join(" ") ||
    normalizeText(body.authorName, 80);
  const authorEmail = customer?.email || normalizeText(body.authorEmail, 120);

  if (!authorName) {
    return NextResponse.json(
      { error: "Укажите имя." },
      { status: 400 },
    );
  }

  await prisma.productQuestion.create({
    data: {
      productId: product.id,
      customerId: customer?.id,
      authorName,
      authorEmail,
      text,
    },
  });

  return NextResponse.json({ ok: true });
}
