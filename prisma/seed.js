const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const categories = [
  { slug: "smartphones", name: "Смартфоны", sortOrder: 10 },
  { slug: "laptops", name: "Ноутбуки", sortOrder: 20 },
  { slug: "tablets", name: "Планшеты", sortOrder: 30 },
  { slug: "headphones", name: "Наушники", sortOrder: 40 },
  { slug: "watches", name: "Часы", sortOrder: 50 },
  { slug: "gaming", name: "Игровая техника", sortOrder: 60 },
];

const products = [
  {
    slug: "iphone-17-pro",
    name: "iPhone 17 Pro",
    brand: "Apple",
    categorySlug: "smartphones",
    description: "Премиальный смартфон Apple с мощной камерой и высокой производительностью.",
    shortDescription: "Флагман Apple с продвинутой камерой, мощным процессором и премиальным дизайном.",
    colors: ["#d1d5db", "#0f3b66", "#f97316"],
    isNew: true,
    isPopular: true,
    sortOrder: 10,
    variants: [
      {
        sku: "IP17P-256-SILVER-ESIM",
        slug: "256gb-silver-esim",
        title: "iPhone 17 Pro 256 GB Silver eSIM",
        memory: "256 GB",
        color: "Silver",
        colorHex: "#d1d5db",
        sim: "eSIM",
        price: 109990,
        oldPrice: 119990,
        stock: 4,
      },
      {
        sku: "IP17P-512-SILVER-ESIM",
        slug: "512gb-silver-esim",
        title: "iPhone 17 Pro 512 GB Silver eSIM",
        memory: "512 GB",
        color: "Silver",
        colorHex: "#d1d5db",
        sim: "eSIM",
        price: 129990,
        oldPrice: 139990,
        stock: 2,
      },
      {
        sku: "IP17P-1TB-ORANGE-SIM",
        slug: "1tb-orange-sim-esim",
        title: "iPhone 17 Pro 1 TB Orange SIM + eSIM",
        memory: "1 TB",
        color: "Orange",
        colorHex: "#f97316",
        sim: "SIM + eSIM",
        price: 159990,
        oldPrice: 169990,
        stock: 1,
      },
    ],
  },
  {
    slug: "macbook-pro-14",
    name: "MacBook Pro 14",
    brand: "Apple",
    categorySlug: "laptops",
    description: "Компактный профессиональный ноутбук для работы, дизайна и разработки.",
    shortDescription: "Компактный профессиональный ноутбук Apple для мощной работы.",
    colors: ["#4b5563", "#e5e7eb", "#111827"],
    isNew: true,
    isPopular: true,
    sortOrder: 20,
    variants: [
      {
        sku: "MBP14-M4-16-512-BLACK",
        slug: "m4-16-512-space-black",
        title: "MacBook Pro 14 M4 16/512 Space Black",
        memory: "16/512 GB",
        color: "Space Black",
        colorHex: "#111827",
        sim: "",
        price: 189990,
        oldPrice: 199990,
        stock: 2,
      },
    ],
  },
  {
    slug: "airpods-pro",
    name: "AirPods Pro",
    brand: "Apple",
    categorySlug: "headphones",
    description: "Беспроводные наушники с активным шумоподавлением и чистым звуком.",
    shortDescription: "Наушники Apple с шумоподавлением и быстрой связкой с экосистемой.",
    colors: ["#ffffff"],
    isNew: false,
    isPopular: true,
    sortOrder: 30,
    variants: [
      {
        sku: "APP-USB-C-WHITE",
        slug: "usb-c-white",
        title: "AirPods Pro USB-C White",
        memory: "",
        color: "White",
        colorHex: "#ffffff",
        sim: "",
        price: 24990,
        oldPrice: null,
        stock: 8,
      },
    ],
  },
];

async function main() {
  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: category,
      create: category,
    });
  }

  for (const item of products) {
    const category = await prisma.category.findUnique({ where: { slug: item.categorySlug } });
    const { variants, ...productData } = item;

    const product = await prisma.product.upsert({
      where: { slug: item.slug },
      update: {
        ...productData,
        categoryId: category?.id ?? null,
      },
      create: {
        ...productData,
        categoryId: category?.id ?? null,
      },
    });

    for (const variant of variants) {
      await prisma.productVariant.upsert({
        where: { sku: variant.sku },
        update: {
          ...variant,
          productId: product.id,
          status: variant.stock > 0 ? "active" : "out_of_stock",
        },
        create: {
          ...variant,
          productId: product.id,
          status: variant.stock > 0 ? "active" : "out_of_stock",
        },
      });
    }
  }

  console.log("Seed complete: categories, products and variants are ready.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
