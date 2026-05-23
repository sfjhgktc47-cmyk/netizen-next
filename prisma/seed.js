const crypto = require("crypto");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

function cleanEnvValue(value, fallback) {
  const normalized = typeof value === "string" ? value.trim() : "";

  if (!normalized) {
    return fallback;
  }

  return normalized.replace(/^["\'`]+|["\'`]+$/g, "").trim() || fallback;
}

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

  const adminLogin = cleanEnvValue(process.env.ADMIN_LOGIN, "admin");
  const adminPassword = cleanEnvValue(process.env.ADMIN_PASSWORD, "netizen-admin");
  const adminName = cleanEnvValue(process.env.ADMIN_NAME, "Администратор");

  await prisma.adminUser.upsert({
    where: { login: adminLogin },
    update: {
      name: adminName,
      role: "owner",
      roles: ["owner"],
      permissions: ["all"],
      passwordHash: hashPassword(adminPassword),
      isActive: true,
    },
    create: {
      login: adminLogin,
      name: adminName,
      role: "owner",
      roles: ["owner"],
      permissions: ["all"],
      passwordHash: hashPassword(adminPassword),
      isActive: true,
    },
  });

  console.log(`Seed complete: categories and admin account are ready. Admin login: ${adminLogin}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
