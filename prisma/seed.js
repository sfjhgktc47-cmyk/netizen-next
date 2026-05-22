const crypto = require("crypto");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 120000, 64, "sha512").toString("hex");

  return `${salt}:${hash}`;
}

const categories = [
  { slug: "smartphones", name: "Смартфоны", sortOrder: 10 },
  { slug: "laptops", name: "Ноутбуки", sortOrder: 20 },
  { slug: "tablets", name: "Планшеты", sortOrder: 30 },
  { slug: "headphones", name: "Наушники", sortOrder: 40 },
  { slug: "watches", name: "Часы", sortOrder: 50 },
  { slug: "accessories", name: "Аксессуары", sortOrder: 60 },
  { slug: "home", name: "Для дома", sortOrder: 70 },
  { slug: "vacuums", name: "Пылесосы", sortOrder: 80 },
  { slug: "beauty", name: "Фены и стайлеры", sortOrder: 90 },
  { slug: "monitors", name: "Мониторы", sortOrder: 100 },
  { slug: "gaming", name: "Игровая техника", sortOrder: 110 },
  { slug: "tv", name: "ТВ и мультимедиа", sortOrder: 120 },
];

async function main() {
  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: category,
      create: category,
    });
  }

  const adminLogin = process.env.ADMIN_LOGIN || "admin";
  const adminPassword = process.env.ADMIN_PASSWORD || "netizen-admin";

  await prisma.adminUser.upsert({
    where: { login: adminLogin },
    update: {
      name: process.env.ADMIN_NAME || "Администратор",
      passwordHash: hashPassword(adminPassword),
      isActive: true,
    },
    create: {
      login: adminLogin,
      name: process.env.ADMIN_NAME || "Администратор",
      passwordHash: hashPassword(adminPassword),
      isActive: true,
    },
  });

  console.log("Seed complete: categories and admin account are ready. Demo products are not created.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
