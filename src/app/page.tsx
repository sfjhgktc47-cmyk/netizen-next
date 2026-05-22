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
import { categories as catalogCategories } from "@/data/categories";
import { footerData } from "@/data/footer";
import { products } from "@/data/products";

export default function Home() {
  const { dark } = useTheme();

  return (
    <main
      className={
        dark
          ? "min-h-screen bg-[#020814] text-white transition-colors duration-700 ease-in-out"
          : "min-h-screen bg-[#f6f8fb] text-[#0b1220] transition-colors duration-700 ease-in-out"
      }
    >
      <div className="mx-auto max-w-[1760px] px-4 py-4 sm:px-6 lg:px-8">
        <SiteHeader />

        <Hero dark={dark} />
        <Benefits dark={dark} />
        <Categories dark={dark} />
        <PopularProducts dark={dark} />
        <NewArrivals dark={dark} />
        <SupportBlock dark={dark} />
        <Footer dark={dark} />
      </div>
    </main>
  );
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

        <div className="relative z-10 flex h-full items-center px-5 py-8 sm:px-10 sm:py-12 lg:px-16">
          <div className="max-w-[650px]">
            <div className="mb-7 inline-flex rounded-full border border-blue-500/50 bg-blue-500/10 px-4 py-2 text-sm font-medium text-blue-500">
              {slide.badge}
            </div>

            <h1 className="max-w-[620px] min-h-[150px] text-[36px] font-bold leading-[1.08] tracking-[-0.055em] sm:min-h-[190px] sm:text-[52px] lg:min-h-[220px] lg:text-[64px]">
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

function Benefits({ dark }: { dark: boolean }) {
  const items = [
    "Только оригинал",
    "Гарантия и сервис",
    "Быстрая доставка",
    "Безопасная оплата",
    "Поддержка 24/7",
  ];

  return (
    <section
      className={`mt-10 grid grid-cols-1 gap-4 rounded-2xl border p-6 transition-all duration-700 md:grid-cols-5 ${panelClass(
        dark
      )}`}
    >
      {items.map((item) => (
        <div key={item} className="flex gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-blue-500/30 text-blue-500">
            ✓
          </div>

          <div>
            <div className="font-semibold">{item}</div>
            <div className={`mt-1 text-sm ${mutedTextClass(dark)}`}>
              Короткое описание преимущества.
            </div>
          </div>
        </div>
      ))}
    </section>
  );
}

function Categories({ dark }: { dark: boolean }) {
  const categoryVisuals: Record<string, string> = {
    smartphones: "/categories/smartphones.png",
    laptops: "/categories/laptops.png",
    watches: "/categories/watches.png",
    headphones: "/categories/headphones.png",
    tablets: "/categories/tablets.png",
    accessories: "/categories/accessories.png",
    home: "/categories/home.png",
    vacuums: "/categories/vacuums.png",
    beauty: "/categories/beauty.png",
    monitors: "/categories/monitors.png",
    gaming: "/categories/gaming.png",
    tv: "/categories/tv.png",
  };

  return (
    <section className="py-20">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-4xl font-bold tracking-[-0.04em]">
            Выберите категорию
          </h2>

          <p className={`mt-3 ${mutedTextClass(dark)}`}>
            Выберите направление и найдите свой идеальный гаджет
          </p>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 auto-rows-fr gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {catalogCategories.map((category) => {
          const image = categoryVisuals[category.id];

          return (
            <Link
              key={category.id}
              href={category.href}
              className={`group relative h-[190px] overflow-hidden rounded-2xl border p-5 transition-all duration-500 hover:-translate-y-1 ${
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
                    className={`mt-2 line-clamp-2 text-sm leading-relaxed ${mutedTextClass(
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

              <div className="absolute bottom-0 right-0 top-0 flex w-[48%] items-center justify-center overflow-hidden">
                {image ? (
                  <div
                    className="h-full w-full bg-contain bg-center bg-no-repeat opacity-95 transition-transform duration-500 group-hover:scale-105"
                    style={{
                      backgroundImage: `url(${image})`,
                    }}
                  />
                ) : (
                  <div
                    className={`h-24 w-24 rounded-2xl ${
                      dark ? "bg-white/[0.04]" : "bg-slate-100"
                    }`}
                  />
                )}
              </div>

              <div
                className={`pointer-events-none absolute inset-y-0 right-0 w-[55%] ${
                  dark
                    ? "bg-gradient-to-l from-blue-500/5 to-transparent"
                    : "bg-gradient-to-l from-slate-50/80 to-transparent"
                }`}
              />
            </Link>
          );
        })}
      </div>

      <div className="mt-8 flex justify-center">
        <Link
          href="/catalog"
          className={`min-w-[280px] rounded-xl border px-10 py-4 text-center text-sm font-medium transition-all duration-500 hover:-translate-y-0.5 ${
            dark
              ? "border-white/10 bg-white/[0.035] text-white hover:border-blue-500/40 hover:bg-blue-500/10"
              : "border-black/10 bg-white text-black shadow-sm hover:border-blue-500/40 hover:bg-blue-50"
          }`}
        >
          Смотреть все категории →
        </Link>
      </div>
    </section>
  );
}

function PopularProducts({ dark }: { dark: boolean }) {
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

  return (
    <section className="pb-20">
      <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-[42px] font-bold leading-none tracking-[-0.04em] lg:text-[52px]">
            Популярные товары
          </h2>

          <p className={`mt-3 text-base ${mutedTextClass(dark)}`}>
            Выберите модель — конфигурацию подберёте на странице товара.
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
        className="mobile-scroll-snap mt-8 cursor-grab select-none overflow-x-auto px-1 py-2 active:cursor-grabbing [&::-webkit-scrollbar]:hidden"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        <div className="flex gap-6">
          {products.map((product) => (
            <div
              key={product.slug}
              className="w-[78vw] max-w-[320px] shrink-0 sm:w-[300px] lg:w-[310px]"
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

      <div className="mt-8 flex justify-center">
        <Link
          href="/catalog"
          className={`min-w-[320px] rounded-xl border px-10 py-4 text-center text-sm font-medium transition-all duration-500 hover:-translate-y-0.5 ${
            dark
              ? "border-white/10 bg-white/[0.035] text-white hover:border-blue-500/40 hover:bg-blue-500/10"
              : "border-black/10 bg-white text-black shadow-sm hover:border-blue-500/40 hover:bg-blue-50"
          }`}
        >
          Смотреть все товары →
        </Link>
      </div>
    </section>
  );
}

function ProductCard({
  product,
  dark,
}: {
  product: {
    slug: string;
    name: string;
    price: string;
    colors: string[];
  };
  dark: boolean;
}) {
  return (
    <Link
      href={`/product/${product.slug}`}
      draggable={false}
      className={`group block h-full rounded-3xl border p-4 transition-all duration-500 hover:-translate-y-1 ${
        dark
          ? "border-white/10 bg-white/[0.035] shadow-[0_20px_80px_rgba(0,60,255,0.08)] hover:border-blue-500/35 hover:bg-blue-500/[0.04]"
          : "border-black/10 bg-white shadow-[0_20px_80px_rgba(15,23,42,0.08)] hover:border-blue-500/35"
      }`}
    >
      <div
        className={`flex h-[230px] items-center justify-center rounded-2xl transition-colors duration-700 ${
          dark ? "bg-white/[0.045] text-white/25" : "bg-slate-100 text-black/25"
        }`}
      >
        Фото товара
      </div>

      <div className="px-1 pb-1 pt-4">
        <h3 className="text-lg font-bold leading-tight">{product.name}</h3>

        <p className={`mt-1 text-sm ${mutedTextClass(dark)}`}>
          {product.price}
        </p>

        <div className="mt-4 flex gap-3">
          {product.colors.map((color) => (
            <span
              key={color}
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

function NewArrivals({ dark }: { dark: boolean }) {
  return (
    <section className="pb-20">
      <h2 className="text-5xl font-bold">Новинки</h2>

      <p className={`mt-3 ${mutedTextClass(dark)}`}>
        Техника, которая только появилась
      </p>

      <div className="mt-8 grid gap-5 lg:grid-cols-2">
        <div
          className={`min-h-[360px] rounded-3xl border p-10 transition-all duration-700 ${panelClass(
            dark
          )}`}
        >
          <div className="text-sm font-bold uppercase text-blue-500">
            Новинка
          </div>

          <h3 className="mt-6 text-5xl font-bold">iPhone 17e</h3>

          <p className={`mt-4 text-xl ${mutedTextClass(dark)}`}>
            Мощь. Красота. Доступнее.
          </p>

          <Link
            href="/catalog"
            className="mt-10 inline-flex rounded-xl bg-blue-600 px-8 py-4 font-medium text-white transition-all duration-300 hover:bg-blue-500"
          >
            Подробнее →
          </Link>
        </div>

        <div className="grid gap-5">
          {["AirPods Max", "Samsung Galaxy S25 Ultra"].map((item) => (
            <div
              key={item}
              className={`rounded-3xl border p-8 transition-all duration-700 ${panelClass(
                dark
              )}`}
            >
              <div className="text-sm font-bold uppercase text-blue-500">
                Новинка
              </div>

              <h3 className="mt-4 text-3xl font-bold">{item}</h3>

              <p className={`mt-3 ${mutedTextClass(dark)}`}>от 59 990 ₽</p>
            </div>
          ))}
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

function Footer({ dark }: { dark: boolean }) {
  return (
    <footer
      className={`rounded-[32px] border p-10 transition-all duration-700 ${panelClass(
        dark
      )}`}
    >
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-[1.25fr_1fr_1fr_1fr] lg:gap-10">
        <div>
          <Link
            href="/"
            className="relative flex h-12 w-[170px] items-center justify-start overflow-hidden"
          >
            <Image
              src={dark ? "/logo-light.png" : "/logo-dark.png"}
              alt="Нетизен"
              width={170}
              height={48}
              className="h-auto max-h-10 w-auto object-contain transition-opacity duration-700"
            />
          </Link>

          <div className="mt-8 space-y-6">
            <FooterContact
              icon="☎"
              title={footerData.contacts.phone}
              text={footerData.contacts.phoneText}
              dark={dark}
            />

            <FooterContact
              icon="✈"
              title={footerData.contacts.telegram}
              text={footerData.contacts.telegramText}
              dark={dark}
            />

            <FooterContact
              icon="✉"
              title={footerData.contacts.email}
              text={footerData.contacts.emailText}
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

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:mt-10 lg:grid-cols-3">
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
        <div>© 2024 Netizen. Все права защищены.</div>

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
