"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useEffect,
  useRef,
  useState,
  type MouseEvent,
  type PointerEvent,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
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
  brand?: string;
  category?: string;
  categoryName?: string;
  price: string;
  shortDescription?: string;
  image?: string;
  promoImage?: string;
  images?: string[];
  colors: string[];
  isNew?: boolean;
  isPopular?: boolean;
};

type HomePageBlock = {
  id: string;
  pageKey: string;
  type: string;
  title: string;
  description: string;
  enabled: boolean;
  sortOrder: number;
  settings?: Record<string, string | number | boolean | null>;
};

type HomeBanner = {
  id: string;
  adminTitle: string;
  label: string;
  title: string;
  subtitle: string;
  description: string;
  buttonText: string;
  buttonHref: string;
  imageLight: string;
  imageDark: string;
  imageMobile: string;
  placement: string;
  tone: string;
  layout: string;
  enabled: boolean;
  sortOrder: number;
};

type HomeBenefit = {
  id: string;
  title: string;
  description: string;
  icon: string;
  image: string;
  href: string;
  enabled: boolean;
  sortOrder: number;
};

type HomeBlockSetting = {
  id: string;
  enabled: boolean;
  order: number;
};

type PublicSiteSettings = {
  branding?: {
    storeName?: string;
    logoLight?: string;
    logoDark?: string;
  };
  contacts?: {
    phone?: string;
    phoneText?: string;
    email?: string;
    emailText?: string;
    telegram?: string;
    telegramText?: string;
  };
  homeBlocks?: HomeBlockSetting[];
};

type HomePayload = {
  categories?: HomeCategory[];
  products?: HomeProduct[];
  popularProducts?: HomeProduct[];
  newArrivals?: HomeProduct[];
  pageBlocks?: HomePageBlock[];
  siteSettings?: PublicSiteSettings;
  banners?: HomeBanner[];
  benefits?: HomeBenefit[];
};

const defaultHomePageBlocks: HomePageBlock[] = [
  { id: "hero", pageKey: "home", type: "hero", title: "Hero", description: "", enabled: true, sortOrder: 10, settings: {} },
  { id: "benefits", pageKey: "home", type: "benefits", title: "Преимущества", description: "", enabled: true, sortOrder: 20, settings: {} },
  { id: "categories", pageKey: "home", type: "category-grid", title: "Категории", description: "", enabled: true, sortOrder: 30, settings: { title: "Выберите категорию", subtitle: "Выберите направление и найдите свой идеальный гаджет", limit: 12, showButton: true, buttonText: "Смотреть все категории →", buttonHref: "/catalog" } },
  { id: "popular-products", pageKey: "home", type: "popular-products", title: "Популярные товары", description: "", enabled: true, sortOrder: 40, settings: { title: "Популярные товары", subtitle: "Выберите модель — конфигурацию подберёте на странице товара.", limit: 12, showButton: true, buttonText: "Смотреть все товары →", buttonHref: "/catalog?popular=1" } },
  { id: "new-arrivals", pageKey: "home", type: "new-arrivals", title: "Новинки", description: "", enabled: true, sortOrder: 50, settings: { title: "Новинки", subtitle: "Техника, которая только появилась", limit: 3 } },
  { id: "support", pageKey: "home", type: "support", title: "Поддержка", description: "", enabled: true, sortOrder: 60, settings: {} },
];

function getProductImage(product: HomeProduct) {
  const mainImage = typeof product.image === "string" ? product.image.trim() : "";

  if (mainImage) {
    return mainImage;
  }

  const galleryImage = Array.isArray(product.images)
    ? product.images.find((image) => typeof image === "string" && image.trim())
    : "";

  return typeof galleryImage === "string" ? galleryImage.trim() : "";
}

function isConfiguredProduct(product: HomeProduct) {
  return product.slug !== "catalog" && Boolean(getProductImage(product));
}


export default function Home() {
  const { dark } = useTheme();
  const [categories, setCategories] = useState<HomeCategory[]>([]);
  const [popularProducts, setPopularProducts] = useState<HomeProduct[]>([]);
  const [newArrivals, setNewArrivals] = useState<HomeProduct[]>([]);
  const [homeBlocks, setHomeBlocks] = useState<HomePageBlock[]>([]);
  const [banners, setBanners] = useState<HomeBanner[]>([]);
  const [benefits, setBenefits] = useState<HomeBenefit[]>([]);
  const [siteSettings, setSiteSettings] = useState<PublicSiteSettings | null>(null);

  useEffect(() => {
    let mounted = true;

    fetch("/api/home", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : Promise.reject()))
      .then((payload: HomePayload) => {
        if (!mounted) return;

        const allProducts = Array.isArray(payload.products) ? payload.products : [];
        const dbPopularProducts = Array.isArray(payload.popularProducts)
          ? payload.popularProducts
          : allProducts;
        const dbNewArrivals = Array.isArray(payload.newArrivals)
          ? payload.newArrivals
          : allProducts.filter((product) => product.isNew);

        setCategories(Array.isArray(payload.categories) ? payload.categories : []);
        setSiteSettings(payload.siteSettings ?? null);
        setHomeBlocks(Array.isArray(payload.pageBlocks) ? payload.pageBlocks : []);
        setBanners(Array.isArray(payload.banners) ? payload.banners : []);
        setBenefits(Array.isArray(payload.benefits) ? payload.benefits : []);
        setPopularProducts(dbPopularProducts.filter(isConfiguredProduct));
        setNewArrivals(
          dbNewArrivals
            .filter((product) => product.slug !== "catalog")
            .slice(0, 3)
        );
      })
      .catch(() => {
        if (!mounted) return;

        setCategories([]);
        setSiteSettings(null);
        setHomeBlocks([]);
        setBanners([]);
        setBenefits([]);
        setPopularProducts([]);
        setNewArrivals([]);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const visibleCategories = categories;
  const visibleHomeBlocks = (homeBlocks.length ? homeBlocks : defaultHomePageBlocks)
    .filter((block) => block.enabled)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <main
      className={
        dark
          ? "min-h-screen bg-[#020814] text-white transition-colors duration-700 ease-in-out"
          : "min-h-screen bg-[#f6f8fb] text-[#0b1220] transition-colors duration-700 ease-in-out"
      }
    >
      <div className="mx-auto max-w-[1440px] px-6 py-6">
        <SiteHeader />

        {visibleHomeBlocks.map((block) => (
          <HomeModule
            key={block.id}
            block={block}
            dark={dark}
            categories={visibleCategories}
            popularProducts={popularProducts}
            allProducts={popularProducts.length ? popularProducts : newArrivals}
            newArrivals={newArrivals}
            banners={banners}
            benefits={benefits}
          />
        ))}
        <Footer dark={dark} siteSettings={siteSettings} />
      </div>
    </main>
  );
}


function HomeModule({
  block,
  dark,
  categories,
  popularProducts,
  allProducts,
  newArrivals,
  banners,
  benefits,
}: {
  block: HomePageBlock;
  dark: boolean;
  categories: HomeCategory[];
  popularProducts: HomeProduct[];
  allProducts: HomeProduct[];
  newArrivals: HomeProduct[];
  banners: HomeBanner[];
  benefits: HomeBenefit[];
}) {
  const settings = block.settings ?? {};
  const type = block.type || block.id;
  const limit = getBlockNumber(settings, "limit", 12);

  if (type === "hero") {
    return <Hero dark={dark} />;
  }

  if (type === "benefits") {
    return (
      <Benefits
        dark={dark}
        benefits={benefits.slice(0, getBlockNumber(settings, "limit", 6))}
        title={getBlockText(settings, "title", "Преимущества")}
        subtitle={getBlockText(settings, "subtitle", "Почему выбирают Netizen")}
      />
    );
  }

  if (type === "category-grid" || type === "categories") {
    return (
      <Categories
        dark={dark}
        categories={categories.slice(0, limit)}
        title={getBlockText(settings, "title", "Выберите категорию")}
        subtitle={getBlockText(settings, "subtitle", "Выберите направление и найдите свой идеальный гаджет")}
        buttonText={getBlockText(settings, "buttonText", "Смотреть все категории →")}
        buttonHref={getBlockText(settings, "buttonHref", "/catalog")}
        showButton={getBlockBoolean(settings, "showButton", true)}
      />
    );
  }

  if (type === "popular-products") {
    return (
      <PopularProducts
        dark={dark}
        products={popularProducts.slice(0, limit)}
        title={getBlockText(settings, "title", "Популярные товары")}
        subtitle={getBlockText(settings, "subtitle", "Выберите модель — конфигурацию подберёте на странице товара.")}
        buttonText={getBlockText(settings, "buttonText", "Смотреть все товары →")}
        buttonHref={getBlockText(settings, "buttonHref", "/catalog?popular=1")}
        showButton={getBlockBoolean(settings, "showButton", true)}
      />
    );
  }

  if (type === "product-carousel") {
    const filter = getBlockText(settings, "filter", "all");
    const source = filter === "popular" ? popularProducts : filter === "new" ? newArrivals : allProducts;

    return (
      <PopularProducts
        dark={dark}
        products={source.slice(0, limit)}
        title={getBlockText(settings, "title", "Товары")}
        subtitle={getBlockText(settings, "subtitle", "Подборка из каталога")}
        buttonText={getBlockText(settings, "buttonText", "Открыть каталог →")}
        buttonHref={getBlockText(settings, "buttonHref", "/catalog")}
        showButton={getBlockBoolean(settings, "showButton", true)}
      />
    );
  }

  if (type === "new-arrivals") {
    return (
      <NewArrivals
        dark={dark}
        products={newArrivals.slice(0, getBlockNumber(settings, "limit", 3))}
        title={getBlockText(settings, "title", "Новинки")}
        subtitle={getBlockText(settings, "subtitle", "Техника, которая только появилась")}
      />
    );
  }

  if (type === "promo-banner") {
    const bannerId = getBlockText(settings, "bannerId", "");
    const selectedBanner = banners.find((banner) => banner.id === bannerId);

    return <PromoBanner dark={dark} settings={settings} banner={selectedBanner} />;
  }

  if (type === "text-image") {
    return <TextImageModule dark={dark} settings={settings} />;
  }

  if (type === "support") {
    return <SupportBlock dark={dark} />;
  }

  return null;
}

function getBlockText(settings: Record<string, string | number | boolean | null>, key: string, fallback: string) {
  const value = settings[key];

  if (typeof value === "string") {
    return value || fallback;
  }

  if (typeof value === "number") {
    return String(value);
  }

  return fallback;
}

function getBlockNumber(settings: Record<string, string | number | boolean | null>, key: string, fallback: number) {
  const value = settings[key];

  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  return fallback;
}

function getBlockBoolean(settings: Record<string, string | number | boolean | null>, key: string, fallback: boolean) {
  const value = settings[key];
  return typeof value === "boolean" ? value : fallback;
}

function panelClass(dark: boolean) {
  return dark
    ? "border-white/10 bg-white/[0.035] shadow-[0_20px_80px_rgba(0,60,255,0.08)]"
    : "border-black/10 bg-white shadow-[0_20px_80px_rgba(15,23,42,0.08)]";
}

function mutedTextClass(dark: boolean) {
  return dark ? "text-white/55" : "text-black/55";
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
              className={`mt-6 max-w-[470px] text-base leading-relaxed lg:text-lg ${mutedTextClass(
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

function Benefits({
  dark,
  benefits,
  title = "Преимущества",
  subtitle = "Почему выбирают Netizen",
}: {
  dark: boolean;
  benefits: HomeBenefit[];
  title?: string;
  subtitle?: string;
}) {
  const fallbackItems: HomeBenefit[] = [
    { id: "original", title: "Только оригинал", description: "Работаем с проверенными поставщиками.", icon: "✓", image: "", href: "", enabled: true, sortOrder: 10 },
    { id: "warranty", title: "Гарантия и сервис", description: "Поможем после покупки и решим вопросы.", icon: "✓", image: "", href: "", enabled: true, sortOrder: 20 },
    { id: "delivery", title: "Быстрая доставка", description: "По Москве — быстро, по России — надёжно.", icon: "✓", image: "", href: "", enabled: true, sortOrder: 30 },
    { id: "payment", title: "Безопасная оплата", description: "Удобные способы оплаты и подтверждение заказа.", icon: "✓", image: "", href: "", enabled: true, sortOrder: 40 },
    { id: "support", title: "Поддержка 24/7", description: "Подскажем с выбором и конфигурацией.", icon: "✓", image: "", href: "", enabled: true, sortOrder: 50 },
  ];
  const items = benefits.length ? benefits : fallbackItems;

  return (
    <section className={`mt-10 rounded-2xl border p-6 transition-all duration-700 ${panelClass(dark)}`}>
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-[-0.04em]">{title}</h2>
          <p className={`mt-2 text-sm ${mutedTextClass(dark)}`}>{subtitle}</p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-5">
        {items.map((item) => {
          const card = (
            <div className="flex gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border border-blue-500/30 text-blue-500">
                {item.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.image} alt="" className="h-full w-full object-cover" />
                ) : (
                  item.icon || "✓"
                )}
              </div>

              <div>
                <div className="font-semibold">{item.title}</div>
                <div className={`mt-1 text-sm ${mutedTextClass(dark)}`}>
                  {item.description}
                </div>
              </div>
            </div>
          );

          return item.href ? (
            <Link key={item.id} href={item.href} className="rounded-xl transition-opacity hover:opacity-80">
              {card}
            </Link>
          ) : (
            <div key={item.id}>{card}</div>
          );
        })}
      </div>
    </section>
  );
}

function Categories({
  dark,
  categories,
  title = "Выберите категорию",
  subtitle = "Выберите направление и найдите свой идеальный гаджет",
  buttonText = "Смотреть все категории →",
  buttonHref = "/catalog",
  showButton = true,
}: {
  dark: boolean;
  categories: HomeCategory[];
  title?: string;
  subtitle?: string;
  buttonText?: string;
  buttonHref?: string;
  showButton?: boolean;
}) {
  return (
    <section className="py-20">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-4xl font-bold tracking-[-0.04em]">
            {title}
          </h2>

          <p className={`mt-3 ${mutedTextClass(dark)}`}>
            {subtitle}
          </p>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 auto-rows-fr gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {categories.map((category) => {
          const image = category.image?.trim() ?? "";

          return (
            <Link
              key={category.id || category.slug}
              href={category.href || `/catalog/${category.slug}`}
              className={`group relative h-[160px] overflow-hidden rounded-2xl border p-5 transition-all duration-500 hover:-translate-y-1 ${
                dark
                  ? "border-white/10 bg-white/[0.035] shadow-[0_20px_80px_rgba(0,60,255,0.08)] hover:border-blue-500/35 hover:bg-blue-500/[0.04]"
                  : "border-black/10 bg-white shadow-[0_20px_70px_rgba(15,23,42,0.08)] hover:border-blue-500/35 hover:shadow-[0_28px_90px_rgba(15,23,42,0.12)]"
              }`}
            >
              <div className="relative z-10 flex h-full min-h-0 flex-col justify-between">
                <div className="max-w-[58%]">
                  <h3 className="text-lg font-bold leading-tight">
                    {category.name}
                  </h3>

                  <p
                    className={`mt-2 line-clamp-2 text-xs leading-relaxed ${mutedTextClass(
                      dark
                    )}`}
                  >
                    {category.description}
                  </p>
                </div>

                <div
                  className={`mt-5 flex h-10 w-10 items-center justify-center rounded-xl border text-base font-bold transition-all duration-300 group-hover:translate-x-1 ${
                    dark
                      ? "border-blue-500/35 bg-blue-500/10 text-blue-400 group-hover:bg-blue-600 group-hover:text-white"
                      : "border-black/10 bg-white text-black shadow-sm group-hover:border-blue-500 group-hover:bg-blue-600 group-hover:text-white"
                  }`}
                >
                  →
                </div>
              </div>

              <div className="absolute right-5 top-1/2 flex h-[92px] w-[92px] -translate-y-1/2 items-center justify-center overflow-hidden rounded-2xl">
                {image ? (
                  <div
                    className="h-full w-full bg-contain bg-center bg-no-repeat opacity-95 transition-transform duration-500 group-hover:scale-105"
                    style={{
                      backgroundImage: `url(${image})`,
                    }}
                  />
                ) : (
                  <div
                    className={`h-full w-full rounded-2xl ${
                      dark ? "bg-white/[0.04]" : "bg-slate-100"
                    }`}
                  />
                )}
              </div>

              <div
                className={`pointer-events-none absolute inset-y-0 right-0 w-[45%] ${
                  dark
                    ? "bg-gradient-to-l from-blue-500/5 to-transparent"
                    : "bg-gradient-to-l from-slate-50/80 to-transparent"
                }`}
              />
            </Link>
          );
        })}
      </div>

      {showButton ? (
        <div className="mt-8 flex justify-center">
          <Link
            href={buttonHref}
            className={`min-w-[280px] rounded-xl border px-10 py-4 text-center text-sm font-medium transition-all duration-500 hover:-translate-y-0.5 ${
              dark
                ? "border-white/10 bg-white/[0.035] text-white hover:border-blue-500/40 hover:bg-blue-500/10"
                : "border-black/10 bg-white text-black shadow-sm hover:border-blue-500/40 hover:bg-blue-50"
            }`}
          >
            {buttonText}
          </Link>
        </div>
      ) : null}
    </section>
  );
}

function PopularProducts({
  dark,
  products,
  title = "Популярные товары",
  subtitle = "Выберите модель — конфигурацию подберёте на странице товара.",
  buttonText = "Смотреть все товары →",
  buttonHref = "/catalog?popular=1",
  showButton = true,
}: {
  dark: boolean;
  products: HomeProduct[];
  title?: string;
  subtitle?: string;
  buttonText?: string;
  buttonHref?: string;
  showButton?: boolean;
}) {
  const sliderRef = useRef<HTMLDivElement | null>(null);
  const dragStartXRef = useRef<number | null>(null);
  const scrollStartRef = useRef(0);
  const didDragRef = useRef(false);

  const [scrollProgress, setScrollProgress] = useState(0);

  function updateProgress() {
    const slider = sliderRef.current;

    if (!slider) return;

    const maxScroll = slider.scrollWidth - slider.clientWidth;

    if (maxScroll <= 0) {
      setScrollProgress(0);
      return;
    }

    setScrollProgress(slider.scrollLeft / maxScroll);
  }

  function scrollProducts(direction: "prev" | "next") {
    const slider = sliderRef.current;

    if (!slider) return;

    const distance = direction === "next" ? 330 : -330;

    slider.scrollBy({
      left: distance,
      behavior: "smooth",
    });

    window.setTimeout(updateProgress, 350);
  }

  function handleProductsPointerDown(event: PointerEvent<HTMLDivElement>) {
    const slider = sliderRef.current;

    if (!slider) return;

    dragStartXRef.current = event.clientX;
    scrollStartRef.current = slider.scrollLeft;
    didDragRef.current = false;
  }

  function handleProductsPointerMove(event: PointerEvent<HTMLDivElement>) {
    const slider = sliderRef.current;

    if (!slider || dragStartXRef.current === null) return;

    const distance = dragStartXRef.current - event.clientX;

    if (Math.abs(distance) > 6) {
      didDragRef.current = true;
    }

    slider.scrollLeft = scrollStartRef.current + distance;
    updateProgress();
  }

  function handleProductsPointerUp() {
    dragStartXRef.current = null;

    window.setTimeout(() => {
      didDragRef.current = false;
    }, 120);
  }

  function handleProductsClickCapture(event: MouseEvent<HTMLDivElement>) {
    if (!didDragRef.current) return;

    event.preventDefault();
    event.stopPropagation();

    window.setTimeout(() => {
      didDragRef.current = false;
    }, 120);
  }

  if (products.length === 0) {
    return (
      <section className="pb-20">
        <div>
          <h2 className="text-[42px] font-bold leading-none tracking-[-0.04em] lg:text-[52px]">
            {title}
          </h2>

          <p className={`mt-3 text-base ${mutedTextClass(dark)}`}>
            {subtitle || "Добавьте реальные товары в БД и загрузите фото, чтобы они появились на главной."}
          </p>
        </div>

        <div
          className={`mt-8 rounded-3xl border p-8 text-center text-sm ${
            dark
              ? "border-white/10 bg-white/[0.035] text-white/55"
              : "border-black/10 bg-white text-black/55"
          }`}
        >
          Популярные товары пока не настроены.
        </div>
      </section>
    );
  }

  return (
    <section className="pb-20">
      <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-[42px] font-bold leading-none tracking-[-0.04em] lg:text-[52px]">
            {title}
          </h2>

          <p className={`mt-3 text-base ${mutedTextClass(dark)}`}>
            {subtitle}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => scrollProducts("prev")}
            className={`flex h-11 w-11 items-center justify-center rounded-xl border text-lg transition-all duration-300 hover:-translate-y-0.5 ${
              dark
                ? "border-white/10 bg-white/[0.03] text-white hover:border-blue-500/40 hover:bg-blue-500/10"
                : "border-black/10 bg-white text-black shadow-sm hover:border-blue-500/40 hover:bg-blue-50"
            }`}
            aria-label="Предыдущие товары"
          >
            ←
          </button>

          <button
            type="button"
            onClick={() => scrollProducts("next")}
            className={`flex h-11 w-11 items-center justify-center rounded-xl border text-lg transition-all duration-300 hover:-translate-y-0.5 ${
              dark
                ? "border-white/10 bg-white/[0.03] text-white hover:border-blue-500/40 hover:bg-blue-500/10"
                : "border-black/10 bg-white text-black shadow-sm hover:border-blue-500/40 hover:bg-blue-50"
            }`}
            aria-label="Следующие товары"
          >
            →
          </button>
        </div>
      </div>

      <div
        ref={sliderRef}
        onScroll={updateProgress}
        onPointerDown={handleProductsPointerDown}
        onPointerMove={handleProductsPointerMove}
        onPointerUp={handleProductsPointerUp}
        onPointerCancel={handleProductsPointerUp}
        onPointerLeave={handleProductsPointerUp}
        onClickCapture={handleProductsClickCapture}
        className="mt-8 cursor-grab select-none overflow-x-auto px-1 py-2 active:cursor-grabbing [&::-webkit-scrollbar]:hidden"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        <div className="flex gap-6">
          {products.map((product) => (
            <div
              key={product.slug}
              className="w-[280px] shrink-0 sm:w-[300px] lg:w-[310px]"
            >
              <ProductCard product={product} dark={dark} />
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 flex justify-center">
        <div
          className={`h-1.5 w-[180px] overflow-hidden rounded-full ${
            dark ? "bg-white/10" : "bg-black/10"
          }`}
        >
          <div
            className="h-full rounded-full bg-blue-600 transition-all duration-300"
            style={{
              width: `${Math.max(18, scrollProgress * 100)}%`,
            }}
          />
        </div>
      </div>

      {showButton ? (
        <div className="mt-8 flex justify-center">
          <Link
            href={buttonHref}
            className={`min-w-[320px] rounded-xl border px-10 py-4 text-center text-sm font-medium transition-all duration-500 hover:-translate-y-0.5 ${
              dark
                ? "border-white/10 bg-white/[0.035] text-white hover:border-blue-500/40 hover:bg-blue-500/10"
                : "border-black/10 bg-white text-black shadow-sm hover:border-blue-500/40 hover:bg-blue-50"
            }`}
          >
            {buttonText}
          </Link>
        </div>
      ) : null}
    </section>
  );
}

function ProductCard({
  product,
  dark,
}: {
  product: HomeProduct;
  dark: boolean;
}) {
  const image = getProductImage(product);
  const href = product.slug === "catalog" ? "/catalog" : `/product/${product.slug}`;

  return (
    <Link
      href={href}
      draggable={false}
      className={`group block h-full rounded-3xl border p-4 transition-all duration-500 hover:-translate-y-1 ${
        dark
          ? "border-white/10 bg-white/[0.035] shadow-[0_20px_80px_rgba(0,60,255,0.08)] hover:border-blue-500/35 hover:bg-blue-500/[0.04]"
          : "border-black/10 bg-white shadow-[0_20px_80px_rgba(15,23,42,0.08)] hover:border-blue-500/35"
      }`}
    >
      <div
        className={`flex h-[230px] items-center justify-center overflow-hidden rounded-2xl transition-colors duration-700 ${
          image
            ? "bg-white"
            : dark
              ? "bg-white/[0.045] text-white/25"
              : "bg-slate-100 text-black/25"
        }`}
      >
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt={product.name}
            draggable={false}
            className="h-full w-full object-contain"
          />
        ) : (
          "Фото товара"
        )}
      </div>

      <div className="px-1 pb-1 pt-4">
        {product.brand ? (
          <p className={`mb-1 text-xs ${mutedTextClass(dark)}`}>{product.brand}</p>
        ) : null}

        <h3 className="text-lg font-bold leading-tight">{product.name}</h3>

        <p className={`mt-1 text-sm ${mutedTextClass(dark)}`}>
          {product.price}
        </p>

        <div className="mt-4 flex gap-3">
          {product.colors.slice(0, 5).map((color, index) => (
            <span
              key={`${color}-${index}`}
              className={`h-5 w-5 rounded-full border ${
                dark ? "border-white/15" : "border-black/10"
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>

        <div className="mt-5 w-full rounded-xl bg-blue-600 py-3.5 text-center text-sm font-medium text-white transition-all duration-300 group-hover:bg-blue-500">
          Перейти →
        </div>
      </div>
    </Link>
  );
}

function NewArrivals({
  dark,
  products,
  title = "Новинки",
  subtitle = "Техника, которая только появилась",
}: {
  dark: boolean;
  products: HomeProduct[];
  title?: string;
  subtitle?: string;
}) {
  const items = products
    .filter((product) => product.slug !== "catalog")
    .slice(0, 3);
  const [mainItem, ...secondaryItems] = items;

  if (!mainItem) {
    return (
      <section className="pb-20">
        <div className="mb-8">
          <h2 className="text-[42px] font-bold leading-none tracking-[-0.04em] lg:text-[52px]">
            {title}
          </h2>
          <p className={`mt-3 text-base ${mutedTextClass(dark)}`}>
            {subtitle}
          </p>
        </div>

        <div
          className={`rounded-3xl border p-8 text-sm ${
            dark
              ? "border-white/10 bg-white/[0.035] text-white/55"
              : "border-black/10 bg-white text-black/55"
          }`}
        >
          Новинки пока не выбраны. Добавьте товар в админке, включите галочку
          “Новинка” и загрузите фото для блока “Новинки”.
        </div>
      </section>
    );
  }

  return (
    <section className="pb-20">
      <div className="mb-8">
        <h2 className="text-[42px] font-bold leading-none tracking-[-0.04em] lg:text-[52px]">
          {title}
        </h2>

        <p className={`mt-3 text-base ${mutedTextClass(dark)}`}>
          {subtitle}
        </p>
      </div>

      <div className="grid gap-4">
        <NewArrivalCard item={mainItem} dark={dark} featured />

        {secondaryItems.length > 0 ? (
          <div className="grid gap-4 lg:grid-cols-2">
            {secondaryItems.map((item) => (
              <NewArrivalCard key={`${item.slug}-${item.name}`} item={item} dark={dark} />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}

function NewArrivalCard({
  item,
  dark,
  featured = false,
}: {
  item: HomeProduct;
  dark: boolean;
  featured?: boolean;
}) {
  const promoImage = item.promoImage?.trim() ?? "";
  const href = item.slug === "catalog" ? "/catalog" : `/product/${item.slug}`;
  const description =
    item.shortDescription ||
    "Новая модель в каталоге. Откройте карточку, чтобы выбрать конфигурацию.";

  return (
    <Link
      href={href}
      className={`group relative grid min-h-[250px] overflow-hidden rounded-3xl border transition-all duration-500 hover:-translate-y-1 ${
        featured
          ? "lg:min-h-[340px] lg:grid-cols-[minmax(0,0.95fr)_minmax(340px,1.1fr)]"
          : "lg:min-h-[240px] lg:grid-cols-[minmax(0,0.95fr)_minmax(260px,1fr)]"
      } ${
        dark
          ? "border-white/10 bg-white/[0.035] shadow-[0_24px_90px_rgba(0,60,255,0.09)] hover:border-blue-500/35"
          : "border-black/10 bg-white shadow-[0_24px_90px_rgba(15,23,42,0.08)] hover:border-blue-500/35"
      }`}
    >
      <div className={`${featured ? "p-8 lg:p-10" : "p-7 lg:p-8"} relative z-10 flex flex-col items-start justify-center`}>
        <div className="text-xs font-bold uppercase tracking-[0.18em] text-blue-500">
          Новинка
        </div>

        <h3
          className={`mt-4 max-w-[420px] font-bold leading-[1.05] tracking-[-0.045em] ${
            featured ? "text-4xl lg:text-5xl" : "text-2xl lg:text-3xl"
          }`}
        >
          {item.name}
        </h3>

        <p
          className={`mt-4 max-w-[360px] leading-relaxed ${
            featured ? "text-base" : "text-sm"
          } ${mutedTextClass(dark)}`}
        >
          {description}
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-4">
          <span
            className={`inline-flex h-11 items-center justify-center rounded-xl bg-blue-600 px-5 text-sm font-medium text-white transition-colors group-hover:bg-blue-500 ${
              featured ? "min-w-[118px]" : "w-11 px-0"
            }`}
          >
            {featured ? "Подробнее →" : "→"}
          </span>

          <span className={`text-sm ${mutedTextClass(dark)}`}>{item.price}</span>
        </div>
      </div>

      <div
        className={`relative min-h-[210px] overflow-hidden ${
          dark
            ? "bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.16),rgba(2,8,20,0.03)_58%,transparent_72%)]"
            : "bg-[radial-gradient(circle_at_50%_50%,rgba(37,99,235,0.12),rgba(248,250,252,0.78)_60%,transparent_74%)]"
        } ${featured ? "lg:min-h-full" : "lg:min-h-full"}`}
      >
        {promoImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={promoImage}
            alt={item.name}
            draggable={false}
            className="h-full w-full object-contain object-right transition-transform duration-700 group-hover:scale-[1.03]"
          />
        ) : (
          <div
            className={`absolute inset-6 rounded-[28px] border border-dashed ${
              dark ? "border-white/10 bg-white/[0.025]" : "border-black/10 bg-slate-50/80"
            }`}
          />
        )}
      </div>
    </Link>
  );
}


function PromoBanner({
  dark,
  settings,
  banner,
}: {
  dark: boolean;
  settings: Record<string, string | number | boolean | null>;
  banner?: HomeBanner;
}) {
  const title = banner?.title || getBlockText(settings, "title", "Промо-блок");
  const subtitle = banner?.subtitle || banner?.description || getBlockText(settings, "subtitle", "Добавьте текст и изображение в редакторе сайта.");
  const image = banner
    ? dark
      ? banner.imageDark || banner.imageLight || banner.imageMobile
      : banner.imageLight || banner.imageDark || banner.imageMobile
    : getBlockText(settings, "image", "");
  const label = banner?.label || getBlockText(settings, "label", "Промо");
  const buttonText = banner?.buttonText || getBlockText(settings, "buttonText", "Подробнее →");
  const buttonHref = banner?.buttonHref || getBlockText(settings, "buttonHref", "/catalog");

  return (
    <section className="pb-20">
      <Link
        href={buttonHref}
        className={`group grid min-h-[260px] overflow-hidden rounded-[34px] border transition-all duration-500 hover:-translate-y-1 lg:grid-cols-[0.95fr_1.05fr] ${
          dark
            ? "border-blue-500/20 bg-blue-600/10 shadow-[0_24px_90px_rgba(0,60,255,0.10)] hover:border-blue-500/40"
            : "border-blue-100 bg-white shadow-[0_24px_90px_rgba(15,23,42,0.08)] hover:border-blue-400/40"
        }`}
      >
        <div className="flex flex-col items-start justify-center p-8 lg:p-10">
          <div className="text-xs font-bold uppercase tracking-[0.18em] text-blue-500">{label}</div>
          <h2 className="mt-4 max-w-[520px] text-4xl font-bold leading-[1.05] tracking-[-0.05em] lg:text-5xl">
            {title}
          </h2>
          <p className={`mt-4 max-w-[430px] text-base leading-relaxed ${mutedTextClass(dark)}`}>
            {subtitle}
          </p>
          <span className="mt-7 inline-flex rounded-xl bg-blue-600 px-6 py-4 text-sm font-medium text-white transition-colors group-hover:bg-blue-500">
            {buttonText}
          </span>
        </div>

        <div className={`flex min-h-[220px] items-center justify-center ${dark ? "bg-white/[0.035]" : "bg-slate-50"}`}>
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={image} alt={title} className="h-full max-h-[360px] w-full object-contain p-6 transition-transform duration-500 group-hover:scale-105" />
          ) : (
            <div className={`mx-6 h-[180px] w-full rounded-3xl border border-dashed ${dark ? "border-white/10 bg-white/[0.03]" : "border-black/10 bg-white"}`} />
          )}
        </div>
      </Link>
    </section>
  );
}

function TextImageModule({
  dark,
  settings,
}: {
  dark: boolean;
  settings: Record<string, string | number | boolean | null>;
}) {
  const title = getBlockText(settings, "title", "Заголовок секции");
  const subtitle = getBlockText(settings, "subtitle", "Описание секции можно менять в редакторе сайта.");
  const image = getBlockText(settings, "image", "");
  const imageSide = getBlockText(settings, "imageSide", "right");

  return (
    <section className="pb-20">
      <div
        className={`grid overflow-hidden rounded-[34px] border lg:grid-cols-2 ${
          dark
            ? "border-white/10 bg-white/[0.035]"
            : "border-black/10 bg-white shadow-[0_24px_90px_rgba(15,23,42,0.08)]"
        }`}
      >
        <div className={`flex min-h-[300px] items-center justify-center p-8 ${imageSide === "left" ? "lg:order-1" : "lg:order-2"}`}>
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={image} alt={title} className="max-h-[360px] w-full object-contain" />
          ) : (
            <div className={`h-[240px] w-full rounded-3xl border border-dashed ${dark ? "border-white/10 bg-white/[0.03]" : "border-black/10 bg-slate-50"}`} />
          )}
        </div>
        <div className={`flex flex-col justify-center p-8 lg:p-12 ${imageSide === "left" ? "lg:order-2" : "lg:order-1"}`}>
          <h2 className="max-w-[520px] text-4xl font-bold leading-[1.05] tracking-[-0.05em] lg:text-5xl">
            {title}
          </h2>
          <p className={`mt-5 max-w-[520px] text-base leading-relaxed lg:text-lg ${mutedTextClass(dark)}`}>
            {subtitle}
          </p>
        </div>
      </div>
    </section>
  );
}

function SupportBlock({ dark }: { dark: boolean }) {
  const [activeFaqId, setActiveFaqId] = useState<number | null>(1);

  const supportCards = [
    {
      title: "Только оригинал",
      text: "Работаем напрямую с официальными поставщиками.",
    },
    {
      title: "Официальная гарантия",
      text: "Гарантия производителя и собственная поддержка.",
    },
    {
      title: "Быстрая доставка",
      text: "По Москве — 1 день, по России — от 2 дней.",
    },
    {
      title: "Безопасная оплата",
      text: "Защищённые платежи и удобные способы оплаты.",
    },
  ];

  const questions = [
    {
      id: 1,
      question: "Можно ли выбрать конфигурацию?",
      answer:
        "Да. На странице товара можно выбрать нужный объём памяти, цвет и доступные параметры модели.",
    },
    {
      id: 2,
      question: "Есть ли техника в наличии?",
      answer:
        "Да, большинство популярных моделей есть в наличии. Актуальный статус наличия показывается в карточке товара.",
    },
    {
      id: 3,
      question: "Как оформить заказ?",
      answer:
        "Добавьте товар в корзину, укажите контакты и способ доставки — после этого менеджер подтвердит заказ.",
    },
    {
      id: 4,
      question: "Можно ли заказать товар под запрос?",
      answer:
        "Да. Если нужной конфигурации нет в наличии, мы можем привезти её под заказ. Сроки и условия уточняются индивидуально.",
    },
  ];

  const orderedQuestions =
    activeFaqId === null
      ? questions
      : [
          ...questions.filter((item) => item.id === activeFaqId),
          ...questions.filter((item) => item.id !== activeFaqId),
        ];

  return (
    <section
      className={`mb-20 rounded-[32px] border p-8 transition-all duration-700 md:p-10 ${panelClass(
        dark
      )}`}
    >
      <h2 className="text-4xl font-bold tracking-[-0.04em] md:text-5xl">
        Сервис и поддержка Нетизен
      </h2>

      <p className={`mt-4 text-lg md:text-xl ${mutedTextClass(dark)}`}>
        Подскажем, чем отличаются модели и как оформить заказ.
      </p>

      <div className="mt-8 grid items-start gap-6 lg:grid-cols-2">
        <div className="grid grid-cols-1 gap-5 self-start sm:grid-cols-2">
          {supportCards.map((item) => (
            <div
              key={item.title}
              className={`flex h-[170px] flex-col justify-start rounded-2xl border p-6 transition-colors duration-300 ${
                dark
                  ? "border-white/10 bg-white/[0.025] hover:border-blue-500/25 hover:bg-blue-500/[0.03]"
                  : "border-black/10 bg-white/80 hover:border-blue-500/25 hover:bg-blue-50/40"
              }`}
            >
              <div className="text-lg leading-none text-blue-500">✓</div>

              <h3 className="mt-6 text-base font-bold leading-tight">
                {item.title}
              </h3>

              <p
                className={`mt-3 text-sm leading-relaxed ${mutedTextClass(
                  dark
                )}`}
              >
                {item.text}
              </p>
            </div>
          ))}
        </div>

        <div className="relative min-h-[330px] self-start">
          <div className="grid gap-4">
            {orderedQuestions.map((item) => {
              const isOpen = activeFaqId === item.id;

              return (
                <motion.div
                  key={item.id}
                  layout
                  transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                  className={`relative rounded-2xl border transition-colors duration-300 ${
                    isOpen ? "z-20" : "z-0"
                  } ${
                    dark
                      ? "border-white/10 bg-[#08111f] hover:border-blue-500/30"
                      : "border-black/10 bg-white hover:border-blue-500/30"
                  }`}
                >
                  <button
                    onClick={() =>
                      setActiveFaqId((prev) =>
                        prev === item.id ? null : item.id
                      )
                    }
                    className="group relative w-full px-6 py-5 text-left"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <span className="font-semibold">{item.question}</span>

                      <span
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border text-blue-500 transition-all duration-300 group-hover:translate-x-1 ${
                          dark
                            ? "border-white/10 bg-white/[0.03] group-hover:border-blue-500/40 group-hover:bg-blue-500/10"
                            : "border-black/10 bg-white group-hover:border-blue-500/40 group-hover:bg-blue-50"
                        } ${isOpen ? "rotate-45" : "rotate-0"}`}
                      >
                        +
                      </span>
                    </div>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.25 }}
                        className={`absolute left-0 right-0 top-[62px] z-30 rounded-b-2xl border-x border-b px-6 pb-6 pt-1 shadow-2xl ${
                          dark
                            ? "border-white/10 bg-[#08111f]"
                            : "border-black/10 bg-white"
                        }`}
                      >
                        <p
                          className={`pr-10 text-sm leading-relaxed ${mutedTextClass(
                            dark
                          )}`}
                        >
                          {item.answer}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer({
  dark,
  siteSettings,
}: {
  dark: boolean;
  siteSettings: PublicSiteSettings | null;
}) {
  const contacts = siteSettings?.contacts;
  const branding = siteSettings?.branding;
  const logoLight = branding?.logoLight?.trim() || "/logo-light.png";
  const logoDark = branding?.logoDark?.trim() || "/logo-dark.png";
  const storeName = branding?.storeName?.trim() || "Netizen";

  return (
    <footer
      className={`rounded-[32px] border p-10 transition-all duration-700 ${panelClass(
        dark
      )}`}
    >
      <div className="grid gap-10 lg:grid-cols-[1.25fr_1fr_1fr_1fr]">
        <div>
          <Link
            href="/"
            className="relative flex h-12 w-[170px] items-center justify-start overflow-hidden"
          >
            <Image
              src={dark ? logoLight : logoDark}
              alt={storeName}
              width={170}
              height={48}
              className="h-auto max-h-10 w-auto object-contain transition-opacity duration-700"
            />
          </Link>

          <div className="mt-8 space-y-6">
            <FooterContact
              icon="☎"
              title={contacts?.phone || footerData.contacts.phone}
              text={contacts?.phoneText || footerData.contacts.phoneText}
              dark={dark}
            />

            <FooterContact
              icon="✈"
              title={contacts?.telegram || footerData.contacts.telegram}
              text={contacts?.telegramText || footerData.contacts.telegramText}
              dark={dark}
            />

            <FooterContact
              icon="✉"
              title={contacts?.email || footerData.contacts.email}
              text={contacts?.emailText || footerData.contacts.emailText}
              dark={dark}
            />
          </div>

          <div
            className={`mt-8 border-t pt-7 ${
              dark ? "border-white/10" : "border-black/10"
            }`}
          >
            <h3 className="text-xl font-bold">Будьте в курсе новинок</h3>

            <p
              className={`mt-3 max-w-[360px] text-sm leading-relaxed ${mutedTextClass(
                dark
              )}`}
            >
              Подпишитесь и узнавайте первыми о новых поступлениях и акциях.
            </p>

            <div
              className={`mt-5 flex h-14 overflow-hidden rounded-xl border transition-all duration-700 ${
                dark ? "border-white/10 bg-black/20" : "border-black/10 bg-white"
              }`}
            >
              <input
                placeholder="Ваш e-mail"
                className={`min-w-0 flex-1 bg-transparent px-5 outline-none ${
                  dark
                    ? "text-white placeholder:text-white/35"
                    : "text-black placeholder:text-black/35"
                }`}
              />

              <button className="w-16 bg-blue-600 text-2xl text-white transition-colors hover:bg-blue-500">
                →
              </button>
            </div>
          </div>
        </div>

        {footerData.columns.map((column) => (
          <FooterColumn
            key={column.title}
            title={column.title}
            items={column.links}
          />
        ))}
      </div>

      <div className="mt-10 grid gap-5 lg:grid-cols-3">
        {footerData.socials.map((item) => (
          <button
            key={item}
            className={`rounded-xl border px-10 py-4 text-blue-500 transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-500 hover:bg-blue-500/10 ${
              dark
                ? "border-blue-500/30 bg-white/[0.02]"
                : "border-blue-500/30 bg-white"
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      <div
        className={`mt-10 flex flex-col gap-6 border-t pt-8 text-sm transition-colors duration-700 lg:flex-row lg:items-center lg:justify-between ${
          dark ? "border-white/10 text-white/45" : "border-black/10 text-black/45"
        }`}
      >
        <div>© 2024 {storeName}. Все права защищены.</div>

        <div className="flex flex-wrap gap-6">
          {footerData.legal.map((item) => (
            <Link
              key={item}
              href="#"
              className="transition-colors hover:text-blue-500"
            >
              {item}
            </Link>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-5 text-lg font-bold opacity-70">
          {footerData.payments.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
      </div>
    </footer>
  );
}

function FooterContact({
  icon,
  title,
  text,
  dark,
}: {
  icon: string;
  title: string;
  text: string;
  dark: boolean;
}) {
  return (
    <div className="flex items-start gap-4">
      <div
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-blue-500 transition-all duration-700 ${
          dark ? "bg-blue-500/10" : "bg-blue-50"
        }`}
      >
        {icon}
      </div>

      <div>
        <div className="font-semibold">{title}</div>
        <div className={`mt-1 text-sm ${mutedTextClass(dark)}`}>{text}</div>
      </div>
    </div>
  );
}

function FooterColumn({
  title,
  items,
}: {
  title: string;
  items: string[] | { label: string; href: string }[];
}) {
  return (
    <div>
      <h3 className="text-xl font-bold">{title}</h3>

      <div className="mt-6 flex flex-col gap-4 opacity-60">
        {items.map((item) => {
          const label = typeof item === "string" ? item : item.label;
          const href = typeof item === "string" ? "#" : item.href;

          return (
            <Link
              key={label}
              href={href}
              className="transition-colors hover:text-blue-500"
            >
              {label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
