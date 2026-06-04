import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";

import { prisma } from "@/lib/db";

type EntityStatus = "active" | "draft" | "hidden" | "out_of_stock";
type ImportRow = Record<string, unknown>;

type ProductMatch = {
  id: string;
  slug: string;
  name: string;
  brand: string;
  categorySlug: string;
  image: string;
  images: string[];
  colors: string[];
};

const allowedStatuses = new Set<EntityStatus>(["active", "draft", "hidden", "out_of_stock"]);

function normalizeKey(value: string) {
  return value
    .toLowerCase()
    .replace(/ё/g, "е")
    .replace(/[^a-zа-я0-9]+/g, "")
    .trim();
}

function normalizeRow(row: ImportRow) {
  return Object.fromEntries(
    Object.entries(row).map(([key, value]) => [normalizeKey(key), value]),
  ) as ImportRow;
}

function getCell(row: ImportRow, keys: string[]) {
  const normalizedKeys = keys.map(normalizeKey);

  for (const key of normalizedKeys) {
    const value = row[key];

    if (value !== undefined && value !== null && String(value).trim() !== "") {
      return value;
    }
  }

  return "";
}

function toStringCell(row: ImportRow, keys: string[]) {
  return String(getCell(row, keys) ?? "").trim();
}

function toIntCell(row: ImportRow, keys: string[]) {
  const value = getCell(row, keys);

  if (value === "" || value === undefined || value === null) {
    return undefined;
  }

  const cleaned = String(value)
    .replace(/\s+/g, "")
    .replace(/[^0-9.,-]/g, "")
    .replace(",", ".");
  const numberValue = Number(cleaned);

  if (!Number.isFinite(numberValue)) {
    return undefined;
  }

  return Math.max(0, Math.round(numberValue));
}

function toBooleanCell(row: ImportRow, keys: string[]) {
  const value = toStringCell(row, keys).toLowerCase().replace(/\s+/g, "");

  if (!value) {
    return undefined;
  }

  if (["1", "true", "yes", "да", "новинка", "популярный", "hit", "хит"].includes(value)) {
    return true;
  }

  if (["0", "false", "no", "нет", "не"].includes(value)) {
    return false;
  }

  return undefined;
}

function normalizeStatus(value: string, stock?: number): EntityStatus | undefined {
  const normalized = value.trim().toLowerCase().replace(/\s+/g, "");

  if (!normalized) {
    return stock !== undefined ? (stock > 0 ? "active" : "out_of_stock") : undefined;
  }

  if (allowedStatuses.has(normalized as EntityStatus)) {
    return normalized as EntityStatus;
  }

  if (["active", "активна", "активный", "впродаже", "продажа", "sale", "вналичии"].includes(normalized)) {
    return "active";
  }

  if (["draft", "черновик", "подзаказ", "order"].includes(normalized)) {
    return "draft";
  }

  if (["hidden", "скрыта", "скрыт", "hide"].includes(normalized)) {
    return "hidden";
  }

  if (["outofstock", "out_of_stock", "нетвналичии", "нет", "закончился"].includes(normalized)) {
    return "out_of_stock";
  }

  return undefined;
}

function slugify(value: string) {
  const slug = value
    .toLowerCase()
    .trim()
    .replace(/ё/g, "e")
    .replace(/й/g, "i")
    .replace(/[^a-z0-9а-я]+/gi, "-")
    .replace(/^-+|-+$/g, "");

  return slug || "item";
}

function normalizeSku(value: string) {
  return value.trim().toUpperCase().replace(/\s+/g, "-");
}

function splitList(value: string) {
  return value
    .split(/[\n,;|]+/g)
    .map((item) => item.trim())
    .filter(Boolean);
}

function uniqueList(values: string[]) {
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)));
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Неизвестная ошибка.";
}

async function getUniqueProductSlug(baseValue: string) {
  const baseSlug = slugify(baseValue);
  let slug = baseSlug;
  let index = 2;

  while (await prisma.product.findUnique({ where: { slug }, select: { id: true } })) {
    slug = `${baseSlug}-${index}`;
    index += 1;
  }

  return slug;
}

async function getUniqueVariantSlug(productId: string, baseValue: string) {
  const baseSlug = slugify(baseValue);
  let slug = baseSlug;
  let index = 2;

  while (
    await prisma.productVariant.findUnique({
      where: { productId_slug: { productId, slug } },
      select: { id: true },
    })
  ) {
    slug = `${baseSlug}-${index}`;
    index += 1;
  }

  return slug;
}

async function findOrCreateCategory(row: ImportRow) {
  const categorySlugValue = toStringCell(row, ["categorySlug", "slug категории"]);
  const categoryName = toStringCell(row, ["category", "категория", "раздел", "тип"]);

  if (!categorySlugValue && !categoryName) {
    return null;
  }

  const categorySlug = slugify(categorySlugValue || categoryName);
  const category = await prisma.category.findFirst({
    where: {
      OR: [
        { slug: categorySlug },
        ...(categoryName ? [{ name: categoryName }] : []),
      ],
    },
    select: { id: true, slug: true },
  });

  if (category) {
    const sortOrder = toIntCell(row, ["categorySortOrder", "порядок категории"]);

    if (sortOrder !== undefined) {
      await prisma.category.update({
        where: { id: category.id },
        data: { sortOrder },
      });
    }

    return category;
  }

  return prisma.category.create({
    data: {
      slug: categorySlug,
      name: categoryName || categorySlugValue,
      status: "active",
      sortOrder: toIntCell(row, ["categorySortOrder", "порядок категории"]) ?? 100,
    },
    select: { id: true, slug: true },
  });
}

async function findProduct(row: ImportRow): Promise<ProductMatch | null> {
  const productId = toStringCell(row, ["productId", "id товара", "id карточки"]);
  const productSlug = toStringCell(row, ["productSlug", "modelSlug", "slug модели", "slug товара"]);
  const modelName = toStringCell(row, ["model", "product", "модель", "карточка", "товар", "название модели"]);
  const brand = toStringCell(row, ["brand", "бренд", "производитель"]);

  if (productId) {
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (product) {
      return product;
    }
  }

  if (productSlug) {
    const product = await prisma.product.findFirst({
      where: {
        OR: [{ slug: productSlug }, { slug: slugify(productSlug) }, { name: productSlug }],
      },
    });

    if (product) {
      return product;
    }
  }

  if (modelName) {
    const product = await prisma.product.findFirst({
      where: {
        AND: [
          {
            OR: [{ name: modelName }, { slug: slugify(modelName) }],
          },
          ...(brand ? [{ brand }] : []),
        ],
      },
    });

    if (product) {
      return product;
    }
  }

  return null;
}


function buildProductUpdate(row: ImportRow, product: ProductMatch) {
  const variantImages = splitList(toStringCell(row, ["images", "image", "фото", "картинки", "изображения", "фото позиции"]));
  const productImage = toStringCell(row, ["productImage", "фото модели", "главное фото", "главная картинка", "фото карточки"]);
  const promoImage = toStringCell(row, ["promoImage", "промо фото", "promo image"]);
  const description = toStringCell(row, ["description", "описание модели", "описание товара", "описание карточки"]);
  const shortDescription = toStringCell(row, ["shortDescription", "короткое описание", "краткое описание"]);
  const status = normalizeStatus(toStringCell(row, ["productStatus", "статус модели", "статус товара", "статус карточки"]));
  const isNew = toBooleanCell(row, ["isNew", "новинка"]);
  const isPopular = toBooleanCell(row, ["isPopular", "популярный", "хит"]);
  const sortOrder = toIntCell(row, ["productSortOrder", "порядок модели", "порядок товара", "порядок карточки", "порядок"]);
  const color = toStringCell(row, ["color", "цвет"]);
  const images = uniqueList([
    ...(productImage ? [productImage] : []),
    ...variantImages,
  ]);

  return {
    ...(productImage ? { image: productImage } : {}),
    ...(promoImage ? { promoImage } : {}),
    ...(images.length ? { images: uniqueList([...product.images, ...images]) } : {}),
    ...(color ? { colors: uniqueList([...product.colors, color]) } : {}),
    ...(description ? { description } : {}),
    ...(shortDescription ? { shortDescription } : {}),
    ...(status ? { status } : {}),
    ...(isNew !== undefined ? { isNew } : {}),
    ...(isPopular !== undefined ? { isPopular } : {}),
    ...(sortOrder !== undefined ? { sortOrder } : {}),
  };
}

async function findOrCreateProduct(row: ImportRow): Promise<{ product: ProductMatch | null; createdProduct: boolean }> {
  const existingProduct = await findProduct(row);

  if (existingProduct) {
    return { product: existingProduct, createdProduct: false };
  }

  const modelName = toStringCell(row, ["model", "product", "модель", "карточка", "товар", "название модели"]);
  const brand = toStringCell(row, ["brand", "бренд", "производитель"]);
  const price = toIntCell(row, ["price", "цена", "цена продажи"]);

  if (!modelName || !brand || price === undefined) {
    return { product: null, createdProduct: false };
  }

  const category = await findOrCreateCategory(row);

  if (!category) {
    return { product: null, createdProduct: false };
  }

  const variantImages = splitList(toStringCell(row, ["images", "image", "фото", "картинки", "изображения", "фото позиции"]));
  const productImage = toStringCell(row, ["productImage", "фото модели", "главное фото", "главная картинка", "фото карточки"]) || variantImages[0] || "";
  const color = toStringCell(row, ["color", "цвет"]);
  const productSlug = await getUniqueProductSlug(toStringCell(row, ["productSlug", "modelSlug", "slug модели"]) || modelName);

  const product = await prisma.product.create({
    data: {
      slug: productSlug,
      name: modelName,
      brand,
      categoryId: category.id,
      categorySlug: category.slug,
      description: toStringCell(row, ["description", "описание модели", "описание", "описание товара", "описание карточки"]),
      shortDescription: toStringCell(row, ["shortDescription", "короткое описание", "краткое описание"]),
      image: productImage,
      promoImage: toStringCell(row, ["promoImage", "промо фото", "promo image"]),
      images: uniqueList([productImage, ...variantImages]),
      colors: uniqueList([color]),
      status: normalizeStatus(toStringCell(row, ["productStatus", "статус модели", "статус товара"])) ?? "active",
      isNew: toBooleanCell(row, ["isNew", "новинка"] ) ?? false,
      isPopular: toBooleanCell(row, ["isPopular", "популярный", "хит"] ) ?? false,
      sortOrder: toIntCell(row, ["productSortOrder", "порядок модели", "порядок товара", "порядок"]) ?? 100,
    },
  });

  return { product, createdProduct: true };
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Передайте XLSX-файл в поле file." }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const firstSheetName = workbook.SheetNames[0];

    if (!firstSheetName) {
      return NextResponse.json({ error: "В XLSX нет листов." }, { status: 400 });
    }

    const sheet = workbook.Sheets[firstSheetName];
    const rawRows = XLSX.utils.sheet_to_json<ImportRow>(sheet, { defval: "" });

    let created = 0;
    let updated = 0;
    let skipped = 0;
    let productsCreated = 0;
    const errors: string[] = [];

    for (const [index, rawRow] of rawRows.entries()) {
      const rowNumber = index + 2;
      const row = normalizeRow(rawRow);
      const sku = normalizeSku(toStringCell(row, ["sku", "артикул", "код", "sku товара"]));

      if (!sku) {
        skipped += 1;
        errors.push(`Строка ${rowNumber}: нет SKU.`);
        continue;
      }

      const price = toIntCell(row, ["price", "цена", "цена продажи"]);
      const oldPrice = toIntCell(row, ["oldPrice", "old price", "старая цена", "цена до акции", "до акции"]);
      const stock = toIntCell(row, ["stock", "остаток", "наличие", "qty", "quantity", "количество"]);
      const status = normalizeStatus(toStringCell(row, ["status", "статус"]), stock);
      const title = toStringCell(row, ["name", "title", "название", "позиция", "название позиции"]);
      const color = toStringCell(row, ["color", "цвет"]);
      const colorHex = toStringCell(row, ["colorHex", "hex", "цвет hex"]);
      const memory = toStringCell(row, ["memory", "память", "объем", "объём"]);
      const sim = toStringCell(row, ["sim", "сим", "sim card"]);
      const images = splitList(toStringCell(row, ["images", "image", "фото", "картинки", "изображения", "фото позиции"]));
      const existing = await prisma.productVariant.findUnique({
        where: { sku },
        include: { product: true },
      });

      if (existing) {
        const productUpdate = buildProductUpdate(row, existing.product);

        if (Object.keys(productUpdate).length > 0) {
          await prisma.product.update({
            where: { id: existing.productId },
            data: productUpdate,
          });
        }

        await prisma.productVariant.update({
          where: { sku },
          data: {
            ...(price !== undefined ? { price } : {}),
            ...(oldPrice !== undefined ? { oldPrice } : {}),
            ...(stock !== undefined ? { stock } : {}),
            ...(status ? { status } : {}),
            ...(title ? { title } : {}),
            ...(color ? { color } : {}),
            ...(colorHex ? { colorHex } : {}),
            ...(memory ? { memory } : {}),
            ...(sim ? { sim } : {}),
            ...(images.length ? { images } : {}),
            ...(toStringCell(row, ["seoTitle", "seo title", "сео заголовок"]) ? { seoTitle: toStringCell(row, ["seoTitle", "seo title", "сео заголовок"]) } : {}),
            ...(toStringCell(row, ["seoDescription", "seo description", "сео описание"]) ? { seoDescription: toStringCell(row, ["seoDescription", "seo description", "сео описание"]) } : {}),
            ...(toStringCell(row, ["seoKeywords", "seo keywords", "ключи", "сео ключи"]) ? { seoKeywords: toStringCell(row, ["seoKeywords", "seo keywords", "ключи", "сео ключи"]) } : {}),
          },
        });

        if (color && !existing.product.colors.includes(color)) {
          await prisma.product.update({
            where: { id: existing.productId },
            data: { colors: uniqueList([...existing.product.colors, color]) },
          });
        }

        updated += 1;
        continue;
      }

      const { product, createdProduct } = await findOrCreateProduct(row);

      if (!product || price === undefined) {
        skipped += 1;
        errors.push(
          `Строка ${rowNumber}: SKU ${sku} не найден. Для создания нужны sku, price/цена, model/модель, brand/бренд и category/категория.`,
        );
        continue;
      }

      const productUpdate = buildProductUpdate(row, product);

      if (Object.keys(productUpdate).length > 0) {
        await prisma.product.update({
          where: { id: product.id },
          data: productUpdate,
        });
      }

      const newStock = stock ?? 0;
      const variantTitle = title || [product.name, memory, color, sim].filter(Boolean).join(" ").trim() || product.name;
      const variantSlug = await getUniqueVariantSlug(product.id, toStringCell(row, ["slug", "variantSlug", "slug позиции", "slug sku"]) || sku);

      await prisma.productVariant.create({
        data: {
          productId: product.id,
          sku,
          slug: variantSlug,
          title: variantTitle,
          memory,
          color,
          colorHex,
          sim,
          images,
          price,
          oldPrice: oldPrice ?? null,
          stock: newStock,
          status: status ?? (newStock > 0 ? "active" : "out_of_stock"),
          seoTitle: toStringCell(row, ["seoTitle", "seo title", "сео заголовок"]),
          seoDescription: toStringCell(row, ["seoDescription", "seo description", "сео описание"]),
          seoKeywords: toStringCell(row, ["seoKeywords", "seo keywords", "ключи", "сео ключи"]),
        },
      });

      if (color && !product.colors.includes(color)) {
        await prisma.product.update({
          where: { id: product.id },
          data: { colors: uniqueList([...product.colors, color]) },
        });
      }

      if (images.length && product.images.length === 0) {
        await prisma.product.update({
          where: { id: product.id },
          data: { image: images[0], images },
        });
      }

      if (createdProduct) {
        productsCreated += 1;
      }

      created += 1;
    }

    return NextResponse.json({ ok: true, created, updated, skipped, productsCreated, errors });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Не удалось импортировать XLSX.",
        details: getErrorMessage(error),
      },
      { status: 500 },
    );
  }
}
