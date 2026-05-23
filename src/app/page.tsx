"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState, type PointerEvent, type ReactNode } from "react";
import { SiteHeader } from "@/components/site-header";
import { useTheme } from "@/components/theme-provider";
import { footerData } from "@/data/footer";

type HomeCategory = {
  id: string;
  slug: string;
  name: string;
  description: string;
  href: string;
  image?: string;
};

type HomeProduct = {
  slug: string;
  name: string;
  brand: string;
  category: string;
  categoryName: string;
  price: string;
  shortDescription?: string;
  image: string;
  images?: string[];
  colors: string[];
};

type HomePayload = {
  categories?: HomeCategory[];
  products?: HomeProduct[];
};

const defaultCategories: HomeCategory[] = [
  {
    id: "smartphones",
    slug: "smartphones",
    name: "Смартфоны",
    description: "iPhone, Samsung, Xiaomi и другие",
    href: "/catalog/smartphones",
  },
  {
    id: "laptops",
    slug: "laptops",
    name: "Ноутбуки",
    description: "MacBook, Windows и игровые модели",
    href: "/catalog/laptops",
  },
  {
    id: "watches",
    slug: "watches",
    name: "Умные часы",
    description: "Apple Watch, Samsung Galaxy Watch и другие",
    href: "/catalog/watches",
  },
  {
    id: "headphones",
    slug: "headphones",
    name: "Наушники",
    description: "AirPods, Sony, JBL и другие",
    href: "/catalog/headphones",
  },
  {
    id: "tablets",
    slug: "tablets",
    name: "Планшеты",
    description: "iPad, Samsung Galaxy и другие",
    href: "/catalog/tablets",
  },
  {
    id: "accessories",
    slug: "accessories",
    name: "Аксессуары",
    description: "Чехлы, зарядки, кабели и другое",
    href: "/catalog/accessories",
  },
  {
    id: "home",
    slug: "home",
    name: "Для дома",
    description: "Умные устройства для вашего дома",
    href: "/catalog/home",
  },
  {
    id: "gaming",
    slug: "gaming",
    name: "Игровая техника",
    description: "Консоли, геймпады и аксессуары",
    href: "/catalog/gaming",
  },
];

const demoProducts: HomeProduct[] = [
  {
    slug: "catalog",
    name: "iPhone 17 Pro",
    brand: "Apple",
    category: "smartphones",
    categoryName: "Смартфоны",
    price: "от 109 990 ₽",
    shortDescription: "Флагманская модель Apple",
    image: "",
    colors: ["#d9d9d9", "#4b5563", "#f97316"],
  },
  {
    slug: "catalog",
    name: "MacBook Pro 14",
    brand: "Apple",
    category: "laptops",
    categoryName: "Ноутбуки",
    price: "от 189 990 ₽",
    shortDescription: "Премиальный ноутбук",
    image: "",
    colors: ["#d1d5db", "#374151", "#111827"],
  },
  {
    slug: "catalog",
    name: "AirPods Pro",
    brand: "Apple",
    category: "headphones",
    categoryName: "Наушники",
    price: "от 24 990 ₽",
    shortDescription: "Компактные наушники",
    image: "",
    colors: ["#ffffff", "#1f2937"],
  },
  {
    slug: "catalog",
    name: "Apple Watch Ultra",
    brand: "Apple",
    category: "watches",
    categoryName: "Часы",
    price: "от 79 990 ₽",
    shortDescription: "Часы для спорта и города",
    image: "",
    colors: ["#2f2f2f", "#f97316", "#f3f4f6"],
  },
];

const benefitItems = [
  {
    icon: "▣",
    title: "Только оригинал",
    text: "Работаем напрямую с официальными поставщиками.",
  },
  {
    icon: "◇",
    title: "Гарантия и сервис",
    text: "Официальная гарантия и собственный сервисный центр.",
  },
  {
    icon: "▸",
    title: "Быстрая доставка",
    text: "Доставка от 1 дня по Москве и от 2 дней по России.",
  },
  {
    icon: "⌑",
    title: "Безопасная оплата",
    text: "Защищённые платежи и несколько способов оплаты.",
  },
  {
    icon: "☏",
    title: "Поддержка 24/7",
    text: "Мы всегда на связи и поможем с выбором.",
  },
];

function pageClass(dark: boolean) {
  return dark
    ? "min-h-screen bg-[#030811] text-white transition-colors duration-700"
    : "min-h-screen bg-[#f4f7fb] text-[#07111f] transition-colors duration-700";
}

function panelClass(dark: boolean) {
  return dark
    ? "border-white/10 bg-white/[0.035] shadow-[0_24px_90px_rgba(0,85,255,0.08)]"
    : "border-black/10 bg-white shadow-[0_24px_90px_rgba(15,23,42,0.08)]";
}

function softPanelClass(dark: boolean) {
  return dark
    ? "border-white/10 bg-[#07101d]"
    : "border-black/10 bg-white";
}

function textMuted(dark: boolean) {
  return dark ? "text-white/58" : "text-slate-500";
}

function blueButton() {
  return "inline-flex items-center justify-center rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-[0_12px_34px_rgba(37,99,235,0.28)] transition hover:-translate-y-0.5 hover:bg-blue-500";
}

function getProductHref(product: HomeProduct) {
  return product.slug === "catalog" ? "/catalog" : `/product/${product.slug}`;
}

function getImage(product: HomeProduct) {
  return product.image || product.images?.[0] || "";
}

export default function Home() {
  const { dark } = useTheme();
  const [categories, setCategories] = useState<HomeCategory[]>([]);
  const [products, setProducts] = useState<HomeProduct[]>([]);

  useEffect(() => {
    let mounted = true;

    fetch("/api/home", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : Promise.reject()))
      .then((payload: HomePayload) => {
        if (!mounted) return;

        setCategories(Array.isArray(payload.categories) ? payload.categories : []);
        setProducts(Array.isArray(payload.products) ? payload.products : []);
      })
      .catch(() => {
        if (!mounted) return;

        setCategories([]);
        setProducts([]);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const visibleCategories = categories.length ? categories : defaultCategories;
  const visibleProducts = products.length ? products : demoProducts;

  return (
    <main className={pageClass(dark)}>
      <div className="mx-auto max-w-[1440px] px-4 py-4 sm:px-5 lg:px-6">
        <SiteHeader />
        <Hero dark={dark} />
        <Benefits dark={dark} />
        <Categories dark={dark} categories={visibleCategories.slice(0, 12)} />
        <PopularProducts dark={dark} products={visibleProducts.slice(0, 8)} />
        <NewArrivals dark={dark} products={visibleProducts.slice(0, 3)} />
        <SupportBlock dark={dark} />
        <Footer dark={dark} />
      </div>
    </main>
  );
}

function Hero({ dark }: { dark: boolean }) {
  const slides = [
    {
      badge: "Оригинальная техника. Премиальный сервис.",
      title: "Техника премиум-класса для тех, кто создаёт будущее.",
      text: "Лучшие устройства от мировых брендов. Официальная гарантия, быстрая доставка и поддержка 24/7.",
      primaryLabel: "Перейти в каталог",
      primaryHref: "/catalog",
      secondaryLabel: "Новинки",
      secondaryHref: "/new",
      imageDark: "/hero/main-dark.png",
      imageLight: "/hero/main-light.png",
    },
    {
      badge: "Новинки уже в каталоге.",
      title: "Подберите технику под свои задачи.",
      text: "Смартфоны, ноутбуки, наушники и аксессуары с понятной конфигурацией перед покупкой.",
      primaryLabel: "Смотреть новинки",
      primaryHref: "/new",
      secondaryLabel: "Каталог",
      secondaryHref: "/catalog",
      imageDark: "/hero/main-dark.png",
      imageLight: "/hero/main-light.png",
    },
    {
      badge: "Поможем с выбором.",
      title: "Не уверены в модели? Подскажем.",
      text: "Расскажем, чем отличаются конфигурации, и поможем оформить заявку без лишних действий.",
      primaryLabel: "Написать в поддержку",
      primaryHref: "/help",
      secondaryLabel: "Популярное",
      secondaryHref: "/catalog",
      imageDark: "/hero/main-dark.png",
      imageLight: "/hero/main-light.png",
    },
  ];

  const [activeSlide, setActiveSlide] = useState(0);
  const [dragStartX, setDragStartX] = useState<number | null>(null);
  const [isHeroHovered, setIsHeroHovered] = useState(false);

  const slide = slides[activeSlide];
  const image = dark ? slide.imageDark : slide.imageLight;

  function goToNextSlide() {
    setActiveSlide((current) => (current + 1) % slides.length);
  }

  function goToPrevSlide() {
    setActiveSlide((current) =>
      current === 0 ? slides.length - 1 : current - 1
    );
  }

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    setDragStartX(event.clientX);
  }

  function handlePointerUp(event: PointerEvent<HTMLDivElement>) {
    if (dragStartX === null) return;

    const distance = dragStartX - event.clientX;
    const swipeThreshold = 50;

    if (Math.abs(distance) > swipeThreshold) {
      if (distance > 0) {
        goToNextSlide();
      } else {
        goToPrevSlide();
      }
    }

    setDragStartX(null);
  }

  useEffect(() => {
    if (slides.length <= 1 || isHeroHovered) return;

    const interval = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % slides.length);
    }, 5000);

    return () => window.clearInterval(interval);
  }, [slides.length, isHeroHovered]);

  return (
    <section className="relative mt-6 overflow-hidden rounded-[34px]">
      <div
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={() => {
          setDragStartX(null);
          setIsHeroHovered(false);
        }}
        onMouseEnter={() => setIsHeroHovered(true)}
        onMouseLeave={() => setIsHeroHovered(false)}
        className={`relative h-[560px] cursor-grab select-none overflow-hidden rounded-[34px] transition-all duration-700 active:cursor-grabbing ${
          dark ? "bg-[#020814]" : "bg-white"
        }`}
      >
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-700"
          style={{
            backgroundImage: `url(${image})`,
          }}
        />

        <div
          className={`absolute inset-0 transition-all duration-700 ${
            dark
              ? "bg-gradient-to-r from-[#020814]/95 via-[#020814]/55 to-[#020814]/5"
              : "bg-gradient-to-r from-white/95 via-white/55 to-white/5"
          }`}
        />

        <div className="relative z-10 flex h-full items-center px-8 py-12 sm:px-12 lg:px-16">
          <div className="max-w-[650px]">
            <div className="mb-7 inline-flex rounded-full border border-blue-500/50 bg-blue-500/10 px-4 py-2 text-sm font-medium text-blue-500">
              {slide.badge}
            </div>

            <h1 className="max-w-[620px] min-h-[220px] text-[42px] font-bold leading-[1.12] tracking-[-0.055em] sm:text-[54px] lg:text-[64px]">
              {slide.title}
            </h1>

            <p
              className={`mt-6 max-w-[470px] text-base leading-relaxed lg:text-lg ${textMuted(
                dark
              )}`}
            >
              {slide.text}
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href={slide.primaryHref}
                className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-7 py-4 text-sm font-medium text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-blue-500"
              >
                {slide.primaryLabel} →
              </Link>

              <Link
                href={slide.secondaryHref}
                className={`inline-flex items-center justify-center rounded-xl border px-7 py-4 text-sm font-medium transition-all duration-300 hover:-translate-y-0.5 ${
                  dark
                    ? "border-white/10 bg-white/[0.03] text-white hover:border-blue-500/40 hover:bg-blue-500/10"
                    : "border-black/10 bg-white text-black hover:border-blue-500/40 hover:bg-blue-50"
                }`}
              >
                {slide.secondaryLabel} →
              </Link>
            </div>

            <div className="mt-8 flex items-center gap-2">
              {slides.map((item, index) => {
                const isActive = activeSlide === index;

                return (
                  <button
                    key={item.title}
                    type="button"
                    onClick={() => setActiveSlide(index)}
                    aria-label={`Открыть слайд ${index + 1}`}
                    className={`rounded-full bg-blue-600 transition-all duration-300 ${
                      isActive ? "h-1.5 w-10" : "h-1.5 w-1.5"
                    }`}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Benefits({ dark }: { dark: boolean }) {
  return (
    <section className={`mt-6 grid grid-cols-1 gap-3 rounded-2xl border p-3 transition md:grid-cols-5 ${panelClass(dark)}`}>
      {benefitItems.map((item) => (
        <div
          key={item.title}
          className={`flex min-h-[86px] items-center gap-3 rounded-xl px-3 py-4 ${
            dark ? "bg-white/[0.018]" : "bg-white"
          }`}
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-blue-500/25 bg-blue-500/10 text-blue-500">
            {item.icon}
          </div>

          <div>
            <div className="text-sm font-bold">{item.title}</div>
            <div className={`mt-1 text-xs leading-snug ${textMuted(dark)}`}>{item.text}</div>
          </div>
        </div>
      ))}
    </section>
  );
}

function SectionTitle({
  title,
  text,
  dark,
  action,
}: {
  title: string;
  text: string;
  dark: boolean;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h2 className="text-[32px] font-black leading-none tracking-[-0.045em] sm:text-[42px]">{title}</h2>
        <p className={`mt-3 text-sm ${textMuted(dark)}`}>{text}</p>
      </div>
      {action}
    </div>
  );
}

function Categories({ dark, categories }: { dark: boolean; categories: HomeCategory[] }) {
  return (
    <section className="py-16">
      <SectionTitle
        title="Выберите категорию"
        text="Выберите направление и найдите свой идеальный гаджет"
        dark={dark}
      />

      <div className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {categories.map((category) => {
          const hasImage = Boolean(category.image);

          return (
            <Link
              key={category.slug || category.id || category.name}
              href={category.href || `/catalog/${category.slug}`}
              className={`group relative min-h-[170px] overflow-hidden rounded-2xl border p-5 transition duration-500 hover:-translate-y-1 sm:min-h-[160px] ${softPanelClass(dark)} ${
                dark
                  ? "hover:border-blue-500/40 hover:bg-blue-500/[0.045]"
                  : "hover:border-blue-500/40 hover:shadow-[0_18px_70px_rgba(15,23,42,0.1)]"
              }`}
            >
              <div className="relative z-10 flex h-full flex-col justify-between">
                <div className={hasImage ? "max-w-[58%]" : "max-w-full pr-16"}>
                  <h3 className="text-base font-black leading-tight">{category.name}</h3>
                  <p className={`mt-2 line-clamp-2 text-xs leading-relaxed ${textMuted(dark)}`}>{category.description}</p>
                </div>

                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-xl border text-sm transition group-hover:translate-x-1 ${
                    dark
                      ? "border-blue-500/30 bg-blue-500/10 text-blue-400 group-hover:bg-blue-600 group-hover:text-white"
                      : "border-black/10 bg-white text-slate-900 group-hover:border-blue-500 group-hover:bg-blue-600 group-hover:text-white"
                  }`}
                >
                  →
                </span>
              </div>

              {hasImage ? (
                <div className="absolute bottom-0 right-0 top-0 flex w-[48%] items-center justify-center overflow-hidden">
                  <Image
                    src={category.image || ""}
                    alt={category.name}
                    width={260}
                    height={200}
                    className="h-full w-full object-contain p-2 transition duration-500 group-hover:scale-105"
                    unoptimized
                  />
                </div>
              ) : (
                <div
                  className={`pointer-events-none absolute right-5 top-1/2 h-16 w-16 -translate-y-1/2 rounded-2xl border ${
                    dark
                      ? "border-blue-500/10 bg-blue-500/[0.055] shadow-[0_0_34px_rgba(37,99,235,0.12)]"
                      : "border-blue-500/10 bg-blue-50/80"
                  }`}
                />
              )}
            </Link>
          );
        })}
      </div>

      <div className="mt-7 flex justify-center">
        <Link
          href="/catalog"
          className={`inline-flex min-w-[260px] justify-center rounded-xl border px-8 py-3 text-sm font-semibold transition hover:-translate-y-0.5 ${
            dark ? "border-white/10 bg-white/[0.03] hover:bg-blue-500/10" : "border-black/10 bg-white hover:bg-blue-50"
          }`}
        >
          Смотреть все категории →
        </Link>
      </div>
    </section>
  );
}

function PopularProducts({ dark, products }: { dark: boolean; products: HomeProduct[] }) {
  return (
    <section className="pb-16">
      <SectionTitle
        title="Популярные товары"
        text="Выберите модель — конфигурацию подберёте на странице товара."
        dark={dark}
        action={
          <Link href="/catalog" className="text-sm font-semibold text-blue-500 transition hover:text-blue-400">
            Смотреть все →
          </Link>
        }
      />

      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={`${product.slug}-${product.name}`} product={product} dark={dark} />
        ))}
      </div>

      <div className="mt-8 flex justify-center lg:hidden">
        <Link href="/catalog" className={blueButton()}>
          Смотреть все товары →
        </Link>
      </div>
    </section>
  );
}

function ProductCard({ product, dark }: { product: HomeProduct; dark: boolean }) {
  const image = getImage(product);

  return (
    <Link
      href={getProductHref(product)}
      className={`group block rounded-2xl border p-4 transition duration-500 hover:-translate-y-1 ${panelClass(dark)} hover:border-blue-500/35`}
    >
      <div className={`relative aspect-[3/4] overflow-hidden rounded-xl ${image ? "bg-white" : dark ? "bg-white/[0.045]" : "bg-slate-100"}`}>
        {image ? (
          <Image
            src={image}
            alt={product.name}
            width={420}
            height={560}
            className="h-full w-full object-contain p-2 transition duration-500 group-hover:scale-105"
            unoptimized
          />
        ) : (
          <div className={`flex h-full items-center justify-center text-sm ${dark ? "text-white/30" : "text-slate-400"}`}>Фото товара</div>
        )}
      </div>

      <div className="pt-4">
        <p className={`text-xs ${textMuted(dark)}`}>{product.brand}</p>
        <h3 className="mt-1 line-clamp-2 min-h-[40px] text-base font-black leading-tight">{product.name}</h3>
        <p className={`mt-1 text-sm ${textMuted(dark)}`}>{product.price}</p>

        <div className="mt-3 flex h-5 gap-2">
          {product.colors.slice(0, 5).map((color) => (
            <span
              key={color}
              className={`h-4 w-4 rounded-full border ${dark ? "border-white/20" : "border-black/10"}`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>

        <div className="mt-4 rounded-xl bg-blue-600 py-3 text-center text-sm font-semibold text-white transition group-hover:bg-blue-500">
          Перейти →
        </div>
      </div>
    </Link>
  );
}

function NewArrivals({ dark, products }: { dark: boolean; products: HomeProduct[] }) {
  const [mainProduct, secondProduct, thirdProduct] = products;

  return (
    <section className="pb-16">
      <SectionTitle title="Новинки" text="Техника, которая только появилась" dark={dark} />

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <PromoCard
          product={mainProduct}
          dark={dark}
          large
          title={mainProduct?.name || "Новые модели уже в каталоге"}
          subtitle={mainProduct?.shortDescription || "Мощь. Красота. Доступнее."}
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          <PromoCard
            product={secondProduct}
            dark={dark}
            title={secondProduct?.name || "AirPods Max"}
            subtitle={secondProduct?.shortDescription || "Звук, в который хочется погружаться."}
          />
          <PromoCard
            product={thirdProduct}
            dark={dark}
            title={thirdProduct?.name || "Samsung Galaxy S25 Ultra"}
            subtitle={thirdProduct?.shortDescription || "AI-камера. Профессиональная мощность."}
          />
        </div>
      </div>
    </section>
  );
}

function PromoCard({
  product,
  dark,
  title,
  subtitle,
  large = false,
}: {
  product?: HomeProduct;
  dark: boolean;
  title: string;
  subtitle: string;
  large?: boolean;
}) {
  const image = product ? getImage(product) : "";
  const hasImage = Boolean(image);

  return (
    <Link
      href={product ? getProductHref(product) : "/catalog"}
      className={`group relative overflow-hidden rounded-2xl border transition duration-500 hover:-translate-y-1 ${panelClass(dark)} ${
        large ? "min-h-[330px]" : "min-h-[185px]"
      }`}
    >
      <div
        className={`pointer-events-none absolute inset-0 ${
          dark
            ? "bg-[radial-gradient(circle_at_82%_42%,rgba(37,99,235,0.22),transparent_34%),linear-gradient(135deg,rgba(37,99,235,0.08),transparent_55%)]"
            : "bg-[radial-gradient(circle_at_82%_42%,rgba(37,99,235,0.13),transparent_34%),linear-gradient(135deg,rgba(37,99,235,0.06),transparent_55%)]"
        }`}
      />

      <div className={`relative z-10 p-6 ${hasImage ? "max-w-[56%]" : "max-w-full"}`}>
        <div className="text-xs font-black uppercase tracking-[0.16em] text-blue-500">Новинка</div>
        <h3 className={`mt-4 break-words font-black tracking-[-0.04em] ${large ? "text-3xl sm:text-4xl" : "text-2xl"}`}>
          {title}
        </h3>
        <p className={`mt-3 max-w-[320px] text-sm leading-relaxed ${textMuted(dark)}`}>{subtitle}</p>
        <p className={`mt-5 text-sm ${textMuted(dark)}`}>{product?.price || "от 89 990 ₽"}</p>
        <span className="mt-6 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white transition group-hover:bg-blue-500">
          →
        </span>
      </div>

      {hasImage ? (
        <div className="absolute inset-y-0 right-0 flex w-[52%] items-center justify-center overflow-hidden">
          <div
            className={`absolute inset-0 ${
              dark
                ? "bg-[linear-gradient(90deg,rgba(3,8,17,0)_0%,rgba(15,23,42,0.55)_35%,rgba(37,99,235,0.13)_100%)]"
                : "bg-[linear-gradient(90deg,rgba(255,255,255,0)_0%,rgba(248,250,252,0.76)_42%,rgba(239,246,255,0.95)_100%)]"
            }`}
          />
          <Image
            src={image}
            alt={title}
            width={720}
            height={560}
            className={`relative z-10 h-full w-full object-cover transition duration-500 group-hover:scale-105 ${
              dark ? "mix-blend-screen opacity-85" : "opacity-95"
            }`}
            unoptimized
          />
          <div
            className={`pointer-events-none absolute inset-y-0 left-0 w-24 ${
              dark
                ? "bg-gradient-to-r from-[#07101d] to-transparent"
                : "bg-gradient-to-r from-white to-transparent"
            }`}
          />
        </div>
      ) : null}
    </Link>
  );
}

function SupportBlock({ dark }: { dark: boolean }) {
  const [open, setOpen] = useState(1);
  const questions = useMemo(
    () => [
      {
        id: 1,
        question: "Можно ли выбрать конфигурацию?",
        answer: "Да. На странице товара можно выбрать память, цвет и доступные параметры модели.",
      },
      {
        id: 2,
        question: "Есть ли техника в наличии?",
        answer: "Актуальное наличие показывается в карточке товара и подтверждается менеджером.",
      },
      {
        id: 3,
        question: "Как оформить заказ?",
        answer: "Добавьте товар в корзину, укажите контакты и способ доставки — дальше менеджер всё подтвердит.",
      },
      {
        id: 4,
        question: "Можно ли заказать под запрос?",
        answer: "Да, если нужной конфигурации нет в наличии, мы можем привезти её под заказ.",
      },
    ],
    [],
  );

  return (
    <section className={`mb-16 overflow-hidden rounded-[28px] border p-6 sm:p-8 lg:p-10 ${panelClass(dark)}`}>
      <div className="grid gap-8 lg:grid-cols-[0.86fr_1fr_0.7fr] lg:items-start">
        <div>
          <h2 className="text-[32px] font-black leading-tight tracking-[-0.045em] sm:text-[42px]">Сервис и поддержка Netizen</h2>
          <p className={`mt-3 text-sm leading-relaxed ${textMuted(dark)}`}>Подскажем, чем отличаются модели и как оформить заказ.</p>

          <div className="mt-7 grid grid-cols-2 gap-3">
            {benefitItems.slice(0, 4).map((item) => (
              <div key={item.title} className={`rounded-2xl border p-4 ${softPanelClass(dark)}`}>
                <div className="text-blue-500">{item.icon}</div>
                <div className="mt-4 text-sm font-black">{item.title}</div>
                <p className={`mt-2 text-xs leading-relaxed ${textMuted(dark)}`}>{item.text}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {questions.map((item) => {
            const isOpen = open === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setOpen(isOpen ? 0 : item.id)}
                className={`w-full rounded-2xl border p-5 text-left transition ${
                  isOpen
                    ? "border-blue-500/70 bg-blue-500/10"
                    : dark
                      ? "border-white/10 bg-white/[0.025] hover:border-blue-500/30"
                      : "border-black/10 bg-white hover:border-blue-500/30"
                }`}
              >
                <span className="flex items-center justify-between gap-4 font-semibold">
                  {item.question}
                  <span className="text-blue-500">{isOpen ? "−" : "+"}</span>
                </span>

                {isOpen ? <p className={`mt-4 text-sm leading-relaxed ${textMuted(dark)}`}>{item.answer}</p> : null}
              </button>
            );
          })}
        </div>

        <div className={`hidden min-h-[330px] items-end justify-center overflow-hidden rounded-3xl border lg:flex ${dark ? "border-white/10 bg-blue-500/10" : "border-black/10 bg-blue-50"}`}>
          <div className="pb-10 text-center">
            <div className="text-7xl">🐻</div>
            <div className="mt-4 rounded-full bg-blue-600 px-4 py-2 text-xs font-bold text-white">Поможем выбрать</div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer({ dark }: { dark: boolean }) {
  return (
    <footer className={`rounded-[28px] border p-6 sm:p-8 lg:p-10 ${panelClass(dark)}`}>
      <div className="grid gap-10 lg:grid-cols-[1.15fr_1fr_1fr_1fr]">
        <div>
          <Link href="/" className="flex text-2xl font-black tracking-[0.06em]">
            NETIZEN
          </Link>

          <div className="mt-7 space-y-4">
            <FooterContact icon="☎" title={footerData.contacts.phone} text={footerData.contacts.phoneText} dark={dark} />
            <FooterContact icon="✈" title={footerData.contacts.telegram} text={footerData.contacts.telegramText} dark={dark} />
            <FooterContact icon="✉" title={footerData.contacts.email} text={footerData.contacts.emailText} dark={dark} />
          </div>

          <div className={`mt-7 border-t pt-6 ${dark ? "border-white/10" : "border-black/10"}`}>
            <h3 className="text-base font-black">Будьте в курсе новинок</h3>
            <p className={`mt-2 text-sm leading-relaxed ${textMuted(dark)}`}>Подпишитесь и узнавайте первыми о новых поступлениях и акциях.</p>
            <div className={`mt-4 flex h-12 overflow-hidden rounded-xl border ${dark ? "border-white/10 bg-black/20" : "border-black/10 bg-white"}`}>
              <input
                placeholder="Ваш e-mail"
                className={`min-w-0 flex-1 bg-transparent px-4 text-sm outline-none ${dark ? "placeholder:text-white/35" : "placeholder:text-slate-400"}`}
              />
              <button className="w-12 bg-blue-600 text-white">→</button>
            </div>
          </div>
        </div>

        {footerData.columns.map((column) => (
          <FooterColumn key={column.title} title={column.title} items={column.links} dark={dark} />
        ))}
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        {footerData.socials.map((item) => (
          <button key={item} className={`rounded-xl border px-6 py-3 text-sm font-semibold text-blue-500 transition hover:-translate-y-0.5 ${dark ? "border-blue-500/25 bg-white/[0.02]" : "border-blue-500/20 bg-white"}`}>
            {item}
          </button>
        ))}
      </div>

      <div className={`mt-8 flex flex-col gap-4 border-t pt-6 text-xs sm:flex-row sm:items-center sm:justify-between ${dark ? "border-white/10 text-white/45" : "border-black/10 text-slate-500"}`}>
        <div>© 2024 Netizen. Все права защищены.</div>
        <div className="flex flex-wrap gap-4">
          {footerData.legal.map((item) => (
            <Link key={item} href="#" className="hover:text-blue-500">
              {item}
            </Link>
          ))}
        </div>
        <div className="flex gap-3 font-black opacity-70">
          {footerData.payments.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
      </div>
    </footer>
  );
}

function FooterContact({ icon, title, text, dark }: { icon: string; title: string; text: string; dark: boolean }) {
  return (
    <div className="flex items-start gap-3">
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-blue-500 ${dark ? "bg-blue-500/10" : "bg-blue-50"}`}>{icon}</div>
      <div>
        <div className="text-sm font-semibold">{title}</div>
        <div className={`mt-1 text-xs ${textMuted(dark)}`}>{text}</div>
      </div>
    </div>
  );
}

function FooterColumn({ title, items, dark }: { title: string; items: string[] | { label: string; href: string }[]; dark: boolean }) {
  return (
    <div>
      <h3 className="font-black">{title}</h3>
      <div className={`mt-5 flex flex-col gap-3 text-sm ${textMuted(dark)}`}>
        {items.map((item) => {
          const label = typeof item === "string" ? item : item.label;
          const href = typeof item === "string" ? "#" : item.href;

          return (
            <Link key={label} href={href} className="transition hover:text-blue-500">
              {label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
