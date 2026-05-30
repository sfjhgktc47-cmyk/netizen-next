"use client";

import Link from "next/link";
import {
  useRef,
  useState,
  type MouseEvent,
  type PointerEvent,
} from "react";

type CarouselProduct = {
  slug: string;
  name: string;
  price: string;
  colors: string[];
  brand?: string;
  image?: string;
  images?: string[];
};

type ProductCarouselProps = {
  title: string;
  subtitle?: string;
  products: CarouselProduct[];
  actionLabel?: string;
  actionHref?: string;
  actionOnClick?: () => void;
  dark?: boolean;
};

function mutedTextClass(dark: boolean) {
  return dark ? "text-white/55" : "text-black/55";
}

function getProductImage(product: CarouselProduct) {
  const images = [
    product.image,
    ...(Array.isArray(product.images) ? product.images : []),
  ]
    .map((image) => image?.trim())
    .filter(Boolean) as string[];

  return images[0] ?? "";
}

export function ProductCarousel({
  title,
  subtitle,
  products,
  actionLabel = "Помочь с выбором",
  actionHref = "/help",
  actionOnClick,
  dark = false,
}: ProductCarouselProps) {
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

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    const slider = sliderRef.current;

    if (!slider) return;

    dragStartXRef.current = event.clientX;
    scrollStartRef.current = slider.scrollLeft;
    didDragRef.current = false;
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    const slider = sliderRef.current;

    if (!slider || dragStartXRef.current === null) return;

    const distance = dragStartXRef.current - event.clientX;

    if (Math.abs(distance) > 6) {
      didDragRef.current = true;
    }

    slider.scrollLeft = scrollStartRef.current + distance;
    updateProgress();
  }

  function handlePointerUp() {
    dragStartXRef.current = null;

    window.setTimeout(() => {
      didDragRef.current = false;
    }, 120);
  }

  function handleClickCapture(event: MouseEvent<HTMLDivElement>) {
    if (!didDragRef.current) return;

    event.preventDefault();
    event.stopPropagation();

    window.setTimeout(() => {
      didDragRef.current = false;
    }, 120);
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="mt-5 sm:mt-12">
      <div className="flex flex-col gap-2 sm:gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-[-0.04em] sm:text-3xl">{title}</h2>

          {subtitle && (
            <p className={`mt-1 text-sm sm:mt-2 ${mutedTextClass(dark)}`}>
              {subtitle}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {actionOnClick ? (
            <button
              type="button"
              onClick={actionOnClick}
              className="text-sm font-medium text-blue-500 transition-colors hover:text-blue-400"
            >
              {actionLabel} →
            </button>
          ) : (
            <Link
              href={actionHref}
              className="text-sm font-medium text-blue-500 transition-colors hover:text-blue-400"
            >
              {actionLabel} →
            </Link>
          )}

          <div className="hidden items-center gap-2 sm:flex">
            <button
              type="button"
              onClick={() => scrollProducts("prev")}
              className={`flex h-10 w-10 items-center justify-center rounded-xl border text-sm transition-all duration-300 hover:-translate-y-0.5 ${
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
              className={`flex h-10 w-10 items-center justify-center rounded-xl border text-sm transition-all duration-300 hover:-translate-y-0.5 ${
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
      </div>

      <div
        ref={sliderRef}
        onScroll={updateProgress}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onClickCapture={handleClickCapture}
        className="mt-3 cursor-grab select-none overflow-x-auto px-0.5 py-1.5 active:cursor-grabbing sm:mt-5 sm:px-1 sm:py-2 [&::-webkit-scrollbar]:hidden"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        <div className="flex gap-3 sm:gap-5">
          {products.map((product) => (
            <div
              key={product.slug}
              className="w-[148px] shrink-0 sm:w-[240px] md:w-[270px] lg:w-[280px]"
            >
              <CarouselProductCard product={product} dark={dark} />
            </div>
          ))}
        </div>
      </div>

      {products.length > 4 && (
        <div className="mt-4 flex justify-center">
          <div
            className={`h-1.5 w-[150px] overflow-hidden rounded-full ${
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
      )}
    </section>
  );
}

function CarouselProductCard({
  product,
  dark,
}: {
  product: CarouselProduct;
  dark: boolean;
}) {
  const image = getProductImage(product);

  return (
    <Link
      href={`/product/${product.slug}`}
      draggable={false}
      className={`group block h-full rounded-[18px] border p-2 transition-all duration-500 hover:-translate-y-1 sm:rounded-3xl sm:p-4 ${
        dark
          ? "border-white/10 bg-white/[0.035] shadow-[0_20px_80px_rgba(0,60,255,0.08)] hover:border-blue-500/35 hover:bg-blue-500/[0.04]"
          : "border-black/10 bg-white shadow-[0_20px_80px_rgba(15,23,42,0.08)] hover:border-blue-500/35"
      }`}
    >
      <div
        className={`flex aspect-square w-full items-center justify-center overflow-hidden rounded-[14px] transition-colors duration-700 sm:rounded-2xl sm:aspect-[3/4] ${
          image ? "bg-white text-slate-400" : dark ? "bg-white/[0.045] text-white/25" : "bg-slate-100 text-black/25"
        }`}
      >
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt={product.name}
            draggable={false}
            className="h-full w-full object-contain p-2 transition-transform duration-700 group-hover:scale-105 sm:p-3"
          />
        ) : (
          "Фото товара"
        )}
      </div>

      <div className="px-0.5 pb-0.5 pt-2 sm:px-1 sm:pb-1 sm:pt-4">
        {product.brand && (
          <div className={`truncate text-[11px] sm:text-xs ${mutedTextClass(dark)}`}>
            {product.brand}
          </div>
        )}

        <h3 className="mt-1 line-clamp-2 text-[13px] font-bold leading-tight sm:text-base">
          {product.name}
        </h3>

        <p className={`mt-1 text-sm font-semibold sm:font-normal ${mutedTextClass(dark)}`}>
          {product.price}
        </p>

        <div className="mt-2 flex gap-1.5 sm:mt-4 sm:gap-2">
          {product.colors.map((color) => (
            <span
              key={color}
              className={`h-3.5 w-3.5 rounded-full border sm:h-4 sm:w-4 ${
                dark ? "border-white/15" : "border-black/10"
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>

        <div className="mt-2 w-full rounded-xl bg-blue-600 py-2 text-center text-xs font-medium text-white transition-all duration-300 group-hover:bg-blue-500 sm:mt-5 sm:py-3 sm:text-sm">
          Перейти →
        </div>
      </div>
    </Link>
  );
}
