import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getPriceNumber } from "@/lib/product-pricing";

type IncomingOrderItem = {
  sku?: string;
  quantity?: number;
  title?: string;
  productName?: string;
  brand?: string;
  price?: string | number;
  memory?: string;
  color?: string;
  sim?: string;
};

type IncomingOrderBody = {
  customer?: {
    name?: string;
    phone?: string;
    email?: string;
  };
  delivery?: {
    method?: "courier" | "pickup" | null;
    city?: string;
    address?: string;
    savedAddress?: string;
    title?: string;
  };
  comment?: string;
  items?: IncomingOrderItem[];
};

function normalizeText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeQuantity(value: unknown) {
  const quantity = Number(value);
  return Number.isFinite(quantity) && quantity > 0 ? Math.floor(quantity) : 1;
}

async function generateOrderPublicId() {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const suffix = `${Date.now().toString().slice(-6)}${attempt ? attempt : ""}`;
    const publicId = `NZ-${suffix}`;
    const existing = await prisma.order.findUnique({ where: { publicId } });

    if (!existing) {
      return publicId;
    }
  }

  return `NZ-${Date.now()}`;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as IncomingOrderBody;
    const customerName = normalizeText(body.customer?.name);
    const phone = normalizeText(body.customer?.phone);
    const email = normalizeText(body.customer?.email);
    const deliveryMethod = body.delivery?.method === "pickup" ? "pickup" : "courier";
    const city = normalizeText(body.delivery?.city);
    const rawAddress = normalizeText(body.delivery?.savedAddress) || normalizeText(body.delivery?.address);
    const address = deliveryMethod === "courier" ? [city, rawAddress].filter(Boolean).join(", ") : "";
    const pickupPoint = deliveryMethod === "pickup" ? rawAddress || "ПВЗ Netizen" : "";
    const comment = normalizeText(body.comment);
    const incomingItems = Array.isArray(body.items) ? body.items : [];

    if (!customerName || !phone) {
      return NextResponse.json(
        { ok: false, error: "Укажите имя и телефон." },
        { status: 400 }
      );
    }

    if (incomingItems.length === 0) {
      return NextResponse.json(
        { ok: false, error: "Корзина пустая." },
        { status: 400 }
      );
    }

    if (deliveryMethod === "courier" && !address) {
      return NextResponse.json(
        { ok: false, error: "Укажите адрес доставки." },
        { status: 400 }
      );
    }

    const skus = incomingItems
      .map((item) => normalizeText(item.sku))
      .filter(Boolean);

    const variants = await prisma.productVariant.findMany({
      where: {
        sku: {
          in: skus,
        },
      },
      include: {
        product: true,
      },
    });

    const variantBySku = new Map(variants.map((variant) => [variant.sku, variant]));

    const preparedItems = incomingItems.map((item) => {
      const sku = normalizeText(item.sku);
      const variant = variantBySku.get(sku);
      const quantity = normalizeQuantity(item.quantity);
      const price = variant?.price ?? getPriceNumber(item.price);
      const title = variant?.title || normalizeText(item.title) || normalizeText(item.productName) || sku;
      const productTitle = variant?.product.name || normalizeText(item.productName) || title;
      const image = variant?.images?.[0] || variant?.product.image || variant?.product.images?.[0] || "";

      return {
        productId: variant?.productId,
        variantId: variant?.id,
        title,
        productTitle,
        brand: variant?.product.brand || normalizeText(item.brand),
        sku,
        memory: variant?.memory || normalizeText(item.memory),
        color: variant?.color || normalizeText(item.color),
        sim: variant?.sim || normalizeText(item.sim),
        image,
        quantity,
        price,
      };
    });

    const invalidItem = preparedItems.find((item) => !item.sku || item.price <= 0);

    if (invalidItem) {
      return NextResponse.json(
        { ok: false, error: "В корзине есть позиция без SKU или цены." },
        { status: 400 }
      );
    }

    const total = preparedItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const customer = phone
      ? await prisma.customer.findFirst({ where: { phone } })
      : null;

    const savedCustomer = customer
      ? await prisma.customer.update({
          where: { id: customer.id },
          data: {
            name: customerName,
            email,
            city,
          },
        })
      : await prisma.customer.create({
          data: {
            name: customerName,
            phone,
            email,
            city,
          },
        });

    const deliveryValue = deliveryMethod === "courier" ? address : pickupPoint;

    if (deliveryValue) {
      await prisma.address.updateMany({
        where: {
          customerId: savedCustomer.id,
          NOT: {
            value: deliveryValue,
          },
        },
        data: {
          isDefault: false,
        },
      });

      const existingAddress = await prisma.address.findFirst({
        where: {
          customerId: savedCustomer.id,
          type: deliveryMethod,
          value: deliveryValue,
        },
      });

      if (existingAddress) {
        await prisma.address.update({
          where: { id: existingAddress.id },
          data: { isDefault: true },
        });
      } else {
        await prisma.address.create({
          data: {
            customerId: savedCustomer.id,
            type: deliveryMethod,
            value: deliveryValue,
            isDefault: true,
          },
        });
      }
    }

    const order = await prisma.order.create({
      data: {
        publicId: await generateOrderPublicId(),
        customerId: savedCustomer.id,
        customerName,
        phone,
        email,
        deliveryType: deliveryMethod,
        address,
        pickupPoint,
        total,
        comment,
        status: "new",
        items: {
          create: preparedItems.map((item) => ({
            productId: item.productId,
            variantId: item.variantId,
            title: item.title,
            productTitle: item.productTitle,
            brand: item.brand,
            sku: item.sku,
            memory: item.memory,
            color: item.color,
            sim: item.sim,
            image: item.image,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
      include: {
        items: true,
      },
    });

    return NextResponse.json({
      ok: true,
      order: {
        id: order.id,
        publicId: order.publicId,
        total: order.total,
      },
    });
  } catch (error) {
    console.error("Order create error", error);

    return NextResponse.json(
      { ok: false, error: "Не удалось создать заявку." },
      { status: 500 }
    );
  }
}
