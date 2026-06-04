"use client";

import Link from "next/link";
import Image from 'next/image';
import { useEffect, useMemo, useRef, useState } from "react";
import type { KeyboardEvent, PointerEvent } from "react";
import { SiteHeader } from "@/components/site-header";
import { ProductTabs } from "@/components/product-tabs";
import type {
  PublicProductModel,
  PublicProductPosition,
} from "@/lib/public-catalog-db";
import { formatPrice, getPriceNumber } from "@/lib/product-pricing";

type ProductCard = PublicProductModel;
type ProductPosition = PublicProductPosition;

type ProductBenefit = {
  id: string;
  title: string;
  description: string;
  icon: string;
  image: string;
  href: string;
};

type ProductDetailViewProps = {
  product: ProductCard;
  positions: ProductPosition[];
  selectedPosition?: ProductPosition;
  benefits?: ProductBenefit[];
};

function uniqueBy<T>(items: T[], getKey: (item: T) => string) {
  const map = new Map<string, T>();

  items.forEach((item) => {
    const key = getKey(item);

    if (!map.has(key)) {
      map.set(key, item);
    }
  });

  return Array.from(map.values());
}

function getStatusName(status: string) {
  const statuses: Record<string, string> = {
    active: "В наличии",
    out_of_stock: "Нет в наличии",
    preorder: "Под заказ",
    hidden: "Скрыто",
    draft: "Черновик",
  };

  return statuses[status] ?? status;
}

function getProductStoryBlocks(product: ProductCard) {
  return Array.isArray(product.descriptionBlocks)
    ? product.descriptionBlocks
    : [];
}

function hasProductStory(product: ProductCard) {
  return (
    getProductStoryBlocks(product).length > 0 ||
    Boolean(product.description?.trim())
  );
}

function getFavoriteSlugs() {
  try {
    const saved = localStorage.getItem("netizen-favorite-slugs");
    const parsed = saved ? JSON.parse(saved) : [];

    return Array.isArray(parsed)
      ? parsed.filter((slug): slug is string => typeof slug === "string")
      : [];
  } catch {
    return [] as string[];
  }
}

function saveFavoriteSlugs(slugs: string[]) {
  const normalizedSlugs = Array.from(new Set(slugs));

  localStorage.setItem(
    "netizen-favorite-slugs",
    JSON.stringify(normalizedSlugs),
  );
  localStorage.setItem(
    "netizen-favorites-count",
    String(normalizedSlugs.length),
  );
  window.dispatchEvent(new Event("netizen-favorites-updated"));
}

function ProductMainImage({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="relative mx-auto flex h-full min-h-[180px] w-full items-center justify-center overflow-hidden rounded-[16px] border border-theme bg-slate-50 text-muted-soft sm:h-auto sm:min-h-0 sm:aspect-[3/4] sm:max-w-[520px] sm:rounded-[30px] sm:border-0 sm:bg-white">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <Image quality={75} src={src}
        alt={alt}
        draggable={false}
        className="pointer-events-none h-full w-full select-none object-contain"
      />
    </div>
  );
}

function ProductImagePlaceholder() {
  return (
    <div className="mx-auto flex h-full min-h-[180px] w-full items-center justify-center overflow-hidden rounded-[16px] border border-theme bg-blue-soft text-muted-soft sm:h-auto sm:min-h-0 sm:aspect-[3/4] sm:max-w-[520px] sm:rounded-[30px]">
      Фото товара
    </div>
  );
}

export function ProductDetailView({
  product,
  positions,
  selectedPosition,
  benefits = [],
}: ProductDetailViewProps) {
  const [selectedColor, setSelectedColor] = useState(
    selectedPosition?.color ?? "",
  );
  const [selectedMemory, setSelectedMemory] = useState(
    selectedPosition?.memory ?? "",
  );
  const [selectedSim, setSelectedSim] = useState(selectedPosition?.sim ?? "");

  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showConfigEditor, setShowConfigEditor] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const galleryDragStartRef = useRef<{
    x: number;
    y: number;
    pointerId: number;
  } | null>(null);

  const categoryName = product.categoryName || product.category;

  const memoryOptions = uniqueBy(positions, (position) => position.memory);
  const colorOptions = uniqueBy(positions, (position) => position.color);
  const simOptions = uniqueBy(positions, (position) => position.sim);

  const isConfigurationComplete =
    Boolean(selectedColor) && Boolean(selectedMemory) && Boolean(selectedSim);

  const activePosition = useMemo(() => {
    if (!isConfigurationComplete) {
      return undefined;
    }

    return positions.find(
      (position) =>
        position.color === selectedColor &&
        position.memory === selectedMemory &&
        position.sim === selectedSim,
    );
  }, [
    isConfigurationComplete,
    positions,
    selectedColor,
    selectedMemory,
    selectedSim,
  ]);

  useEffect(() => { if (activePosition) setShowConfigEditor(false); }, [activePosition]);

  const hasInvalidCompleteConfiguration =
    isConfigurationComplete && !activePosition;

  // Фото позиции показываем только тогда, когда клиент реально выбрал
  // конкретную конфигурацию или пришёл по ссылке на конкретный SKU.
  // До выбора конфигурации остаётся фото материнской карточки, чтобы
  // разные комплектации не смешивались в галерее.
  const previewPosition = activePosition ?? selectedPosition;
  const detailsPosition = previewPosition ?? positions[0];
  const mediaImages =
    previewPosition?.images && previewPosition.images.length > 0
      ? previewPosition.images
      : product.images && product.images.length > 0
        ? product.images
        : product.image
          ? [product.image]
          : [];

  const activeImage = mediaImages[activeImageIndex] ?? mediaImages[0] ?? "";

  useEffect(() => {
    setActiveImageIndex(0);
  }, [previewPosition?.sku, product.slug]);

  function showPreviousImage() {
    if (mediaImages.length <= 1) return;
    setActiveImageIndex((current) =>
      current <= 0 ? mediaImages.length - 1 : current - 1,
    );
  }

  function showNextImage() {
    if (mediaImages.length <= 1) return;
    setActiveImageIndex((current) =>
      current >= mediaImages.length - 1 ? 0 : current + 1,
    );
  }

  function handleGalleryPointerDown(event: PointerEvent<HTMLDivElement>) {
    if (mediaImages.length <= 1) return;
    if (event.pointerType === "mouse" && event.button !== 0) return;

    const target = event.target;

    if (target instanceof Element && target.closest("button")) return;

    galleryDragStartRef.current = {
      x: event.clientX,
      y: event.clientY,
      pointerId: event.pointerId,
    };

    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      // pointer capture может быть недоступен в отдельных браузерах.
    }
  }

  function handleGalleryPointerUp(event: PointerEvent<HTMLDivElement>) {
    const dragStart = galleryDragStartRef.current;
    galleryDragStartRef.current = null;

    if (!dragStart || mediaImages.length <= 1) return;

    try {
      event.currentTarget.releasePointerCapture(dragStart.pointerId);
    } catch {
      // Если браузер уже сам отпустил pointer capture — это нормально.
    }

    const diffX = event.clientX - dragStart.x;
    const diffY = event.clientY - dragStart.y;

    if (Math.abs(diffX) < 28 || Math.abs(diffX) < Math.abs(diffY) * 1.15)
      return;

    if (diffX < 0) {
      showNextImage();
    } else {
      showPreviousImage();
    }
  }

  function handleGalleryPointerCancel() {
    galleryDragStartRef.current = null;
  }

  function handleGalleryKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (mediaImages.length <= 1) return;

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      showPreviousImage();
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      showNextImage();
    }
  }

  const priceRange = useMemo(() => {
    const prices = positions
      .map((position) => getPriceNumber(position.price))
      .filter((price) => price > 0);

    if (prices.length === 0) {
      return "Цена по запросу";
    }

    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    if (minPrice === maxPrice) {
      return formatPrice(minPrice);
    }

    return `от ${formatPrice(minPrice)} до ${formatPrice(maxPrice)}`;
  }, [positions]);

  useEffect(() => {
    setIsFavorite(getFavoriteSlugs().includes(product.slug));
  }, [product.slug]);

  function toggleFavorite() {
    const favoriteSlugs = getFavoriteSlugs();
    const nextSlugs = favoriteSlugs.includes(product.slug)
      ? favoriteSlugs.filter((slug) => slug !== product.slug)
      : [...favoriteSlugs, product.slug];

    saveFavoriteSlugs(nextSlugs);
    setIsFavorite(nextSlugs.includes(product.slug));
  }

  function canSelectConfiguration(nextSelection: {
    color?: string;
    memory?: string;
    sim?: string;
  }) {
    return positions.some((position) => {
      const color = nextSelection.color ?? selectedColor;
      const memory = nextSelection.memory ?? selectedMemory;
      const sim = nextSelection.sim ?? selectedSim;

      return (
        (!color || position.color === color) &&
        (!memory || position.memory === memory) &&
        (!sim || position.sim === sim)
      );
    });
  }

  function saveSelectedPositionToCart() {
    if (!activePosition) return;

    const cartItem = {
      sku: activePosition.sku,
      modelSlug: product.slug,
      productName: product.name,
      brand: product.brand,
      title: activePosition.title,
      price: activePosition.price,
      oldPrice: activePosition.oldPrice,
      memory: activePosition.memory,
      color: activePosition.color,
      colorHex: activePosition.colorHex,
      sim: activePosition.sim,
      quantity,
      stock: activePosition.stock,
      status: activePosition.status,
    };

    try {
      const savedItems = localStorage.getItem("netizen-cart-items");
      const parsedItems = savedItems ? JSON.parse(savedItems) : [];
      const currentItems = Array.isArray(parsedItems) ? parsedItems : [];
      const existingItem = currentItems.find(
        (item: { sku?: string }) => item.sku === activePosition.sku,
      );

      const nextItems = existingItem
        ? currentItems.map((item: typeof cartItem) =>
            item.sku === activePosition.sku
              ? {
                  ...item,
                  ...cartItem,
                  quantity: Math.min(
                    activePosition.stock,
                    Number(item.quantity || 0) + quantity,
                  ),
                }
              : item,
          )
        : [...currentItems, cartItem];

      const cartCount = nextItems.reduce(
        (sum: number, item: { quantity?: number }) =>
          sum + Number(item.quantity || 0),
        0,
      );

      localStorage.setItem("netizen-cart-items", JSON.stringify(nextItems));
      localStorage.setItem("netizen-cart-count", String(cartCount));
      window.dispatchEvent(new Event("netizen-cart-updated"));
    } catch {
      localStorage.setItem("netizen-cart-items", JSON.stringify([cartItem]));
      localStorage.setItem("netizen-cart-count", String(quantity));
      window.dispatchEvent(new Event("netizen-cart-updated"));
    }
  }

  function decreaseQuantity() {
    setQuantity((current) => Math.max(1, current - 1));
  }

  function increaseQuantity() {
    if (!activePosition) return;

    setQuantity((current) => Math.min(activePosition.stock, current + 1));
  }

  function handleAddToCart() {
    if (!activePosition) return;

    saveSelectedPositionToCart();
    setAddedToCart(true);

    setTimeout(() => {
      setAddedToCart(false);
    }, 1800);
  }

  function selectColor(value: string) {
    setSelectedColor((current) => (current === value ? "" : value));
    setQuantity(1);
  }

  function selectMemory(value: string) {
    setSelectedMemory((current) => (current === value ? "" : value));
    setQuantity(1);
  }

  function selectSim(value: string) {
    setSelectedSim((current) => (current === value ? "" : value));
    setQuantity(1);
  }

  return (
    <main className="min-h-screen bg-page px-3 py-4 text-main transition-colors duration-700 sm:px-5 sm:py-6">
      <div className="mx-auto max-w-[1440px]">
        <SiteHeader />

        <div className="mt-4 sm:mt-10">
          <Link
            href="/catalog"
            className="text-sm text-blue-500 transition-colors hover:text-blue-400"
          >
            ← Вернуться в каталог
          </Link>
        </div>

        <section className="mt-4 grid grid-cols-[52%_1fr] items-start gap-3 lg:mt-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
          <div className="h-full sm:card sm:rounded-[36px] sm:p-6">
            <div
              className="relative cursor-grab touch-pan-y select-none active:cursor-grabbing"
              role="region"
              tabIndex={0}
              aria-label="Галерея товара. Проведите мышкой или пальцем влево или вправо, чтобы сменить фото."
              onPointerDown={handleGalleryPointerDown}
              onPointerUp={handleGalleryPointerUp}
              onPointerCancel={handleGalleryPointerCancel}
              onKeyDown={handleGalleryKeyDown}
            >
              {activeImage ? (
                <ProductMainImage
                  src={activeImage}
                  alt={previewPosition?.title ?? product.name}
                />
              ) : (
                <ProductImagePlaceholder />
              )}

              {mediaImages.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={showPreviousImage}
                    className="absolute left-2 top-1/2 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl border border-theme bg-card/90 text-main shadow-soft backdrop-blur transition-colors hover:border-blue-500/50 hover:bg-blue-soft sm:flex sm:left-4 sm:h-11 sm:w-11 sm:rounded-2xl"
                    aria-label="Предыдущее фото"
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    onClick={showNextImage}
                    className="absolute right-2 top-1/2 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl border border-theme bg-card/90 text-main shadow-soft backdrop-blur transition-colors hover:border-blue-500/50 hover:bg-blue-soft sm:flex sm:right-4 sm:h-11 sm:w-11 sm:rounded-2xl"
                    aria-label="Следующее фото"
                  >
                    →
                  </button>
                </>
              )}
            </div>

            <div className="mx-auto mt-1.5 flex justify-center gap-1 sm:hidden">
              {mediaImages.slice(0, 7).map((_, dotIndex) => (
                <button
                  key={dotIndex}
                  type="button"
                  onClick={() => setActiveImageIndex(dotIndex)}
                  className={`h-1 rounded-full transition-all duration-300 ${
                    activeImageIndex === dotIndex ? "w-4 bg-blue-500" : "w-1.5 bg-black/20"
                  }`}
                />
              ))}
            </div>
            <div className="hidden sm:grid mx-auto mt-6 max-w-[520px] grid-cols-4 gap-4">
              {(mediaImages.length > 0
                ? mediaImages.slice(0, 8)
                : Array.from({ length: 4 })
              ).map((image, index) => (
                <button
                  key={typeof image === "string" ? `${image}-${index}` : index}
                  type="button"
                  onClick={() =>
                    typeof image === "string" && setActiveImageIndex(index)
                  }
                  className={`flex aspect-square items-center justify-center overflow-hidden rounded-xl border bg-white text-xs text-muted-soft transition-all sm:aspect-[3/4] sm:rounded-2xl ${
                    activeImageIndex === index && typeof image === "string"
                      ? "border-blue-500 ring-2 ring-blue-500/20"
                      : "border-theme hover:border-blue-500/50"
                  }`}
                  aria-label={`Показать фото ${index + 1}`}
                >
                  {typeof image === "string" ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <Image quality={75} src={image}
                      alt={`${product.name} фото ${index + 1}`}
                      draggable={false}
                      className="pointer-events-none h-full w-full select-none object-contain p-1"
                    />
                  ) : (
                    "Фото"
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="lg:sticky lg:top-6">
            <div className="card rounded-[22px] p-3 sm:rounded-[36px] sm:p-8">
              <div className="text-[11px] sm:text-sm text-muted">{product.brand}</div>

              <h1 className="mt-1 text-[15px] font-bold leading-tight tracking-[-0.03em] sm:mt-2 sm:text-5xl">
                {product.name}
              </h1>

              <p className="mt-2 hidden max-w-[620px] text-sm leading-relaxed text-muted sm:mt-4 sm:block">
                {product.shortDescription}
              </p>

              <div className="mt-4 sm:mt-5">
                <button
                  type="button"
                  onClick={toggleFavorite}
                  className={`rounded-xl border px-3 py-2 text-xs font-medium transition-colors sm:px-5 sm:py-3 sm:text-sm ${
                    isFavorite
                      ? "border-blue-500 bg-blue-500/10 text-blue-500 hover:bg-blue-500/15"
                      : "border-theme bg-transparent text-muted hover:border-blue-500/40 hover:bg-blue-soft hover:text-main"
                  }`}
                >
                  {isFavorite ? "В избранном ✓" : "В избранное"}
                </button>
              </div>

              {!activePosition && (
                <div className="mt-3 hidden rounded-[18px] border border-blue-500/30 bg-blue-soft p-3 sm:mt-7 sm:block sm:rounded-3xl sm:p-5">
                  <div className="text-sm text-blue-500">
                    Соберите конфигурацию
                  </div>

                  <h2 className="mt-1.5 text-[14px] font-bold sm:text-xl sm:mt-2">
                    Выберите цвет, память и SIM
                  </h2>

                  <div className="mt-3 grid grid-cols-3 gap-2 text-xs text-muted sm:gap-3 sm:text-sm">
                    <div>
                      <div className="text-muted-soft">Цвет</div>
                      <div className="mt-1 font-semibold text-main">
                        {selectedColor || "Не выбран"}
                      </div>
                    </div>

                    <div>
                      <div className="text-muted-soft">Память</div>
                      <div className="mt-1 font-semibold text-main">
                        {selectedMemory || "Не выбрана"}
                      </div>
                    </div>

                    <div>
                      <div className="text-muted-soft">SIM</div>
                      <div className="mt-1 font-semibold text-main">
                        {selectedSim || "Не выбрана"}
                      </div>
                    </div>
                  </div>

                  <p className="mt-3 text-sm leading-relaxed text-muted sm:mt-4">
                    После выбора всех параметров появится конкретная позиция,
                    SKU, наличие и итоговая цена.
                  </p>
                </div>
              )}

              {activePosition && (
                <div className="mt-5 hidden rounded-[22px] border border-blue-500/30 bg-blue-soft p-4 sm:mt-7 sm:block sm:rounded-3xl sm:p-5">
                  <div className="text-sm text-blue-500">
                    Выбранная конфигурация
                  </div>

                  <h2 className="mt-2 text-lg font-bold sm:text-xl">
                    {activePosition.title}
                  </h2>

                  <div className="mt-4 grid gap-3 text-sm text-muted sm:grid-cols-4">
                    <div>
                      <div className="text-muted-soft">Память</div>
                      <div className="mt-1 font-semibold text-main">
                        {activePosition.memory}
                      </div>
                    </div>

                    <div>
                      <div className="text-muted-soft">Цвет</div>
                      <div className="mt-1 font-semibold text-main">
                        {activePosition.color}
                      </div>
                    </div>

                    <div>
                      <div className="text-muted-soft">SIM</div>
                      <div className="mt-1 font-semibold text-main">
                        {activePosition.sim}
                      </div>
                    </div>

                    <div>
                      <div className="text-muted-soft">SKU</div>
                      <div className="mt-1 font-semibold text-main">
                        {activePosition.sku}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Mobile: compact horizontal chips when config complete */}
              {activePosition && !showConfigEditor && (
                <div className="mt-2 flex flex-wrap items-center gap-1.5 sm:hidden">
                  <button
                    type="button"
                    onClick={() => setShowConfigEditor(true)}
                    className="flex items-center gap-1 rounded-lg border border-blue-500 bg-blue-500/10 px-2 py-1 text-[11px] text-blue-500"
                  >
                    <span
                      className="h-3 w-3 rounded-full border border-blue-500/20"
                      style={{ backgroundColor: colorOptions.find((c) => c.color === selectedColor)?.colorHex }}
                    />
                    {selectedColor}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowConfigEditor(true)}
                    className="rounded-lg border border-blue-500 bg-blue-500/10 px-2 py-1 text-[11px] text-blue-500"
                  >
                    {selectedMemory}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowConfigEditor(true)}
                    className="rounded-lg border border-blue-500 bg-blue-500/10 px-2 py-1 text-[11px] text-blue-500"
                  >
                    {selectedSim}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowConfigEditor(true)}
                    className="rounded-lg border border-blue-500/30 bg-transparent px-2 py-1 text-[11px] text-muted"
                  >
                    Изменить →
                  </button>
                </div>
              )}

              {/* Full vertical selectors — always desktop, mobile only when not complete or editing */}
              <div className={activePosition && !showConfigEditor ? "hidden sm:block" : ""}>

              <div className="mt-2 sm:mt-8">
                <div className="text-[11px] font-semibold text-muted sm:text-sm sm:text-main">Цвет</div>

                <div className="mt-1.5 flex flex-wrap gap-1.5 sm:mt-3 sm:gap-3">
                  {colorOptions.map((position) => {
                    const isActive = selectedColor === position.color;
                    const isDisabled =
                      !isActive &&
                      !canSelectConfiguration({ color: position.color });

                    return (
                      <button
                        key={position.color}
                        type="button"
                        disabled={isDisabled}
                        onClick={() => selectColor(position.color)}
                        className={`flex items-center gap-1 rounded-lg border px-2 py-1 text-[11px] transition-all duration-300 sm:gap-3 sm:px-4 sm:py-3 sm:text-sm ${
                          isActive
                            ? "border-blue-500 bg-blue-500/10 text-blue-500"
                            : isDisabled
                              ? "cursor-not-allowed border-theme bg-transparent text-muted-soft opacity-40"
                              : "border-theme bg-transparent text-muted hover:border-blue-500/40 hover:bg-blue-soft hover:text-main"
                        }`}
                      >
                        <span
                          className="h-3 w-3 rounded-full border border-theme sm:h-5 sm:w-5"
                          style={{ backgroundColor: position.colorHex }}
                        />

                        {position.color}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-2 sm:mt-7">
                <div className="text-[11px] font-semibold text-muted sm:text-sm sm:text-main">Память</div>

                <div className="mt-1.5 flex flex-wrap gap-1.5 sm:mt-3 sm:gap-3">
                  {memoryOptions.map((position) => {
                    const isActive = selectedMemory === position.memory;
                    const isDisabled =
                      !isActive &&
                      !canSelectConfiguration({ memory: position.memory });

                    return (
                      <button
                        key={position.memory}
                        type="button"
                        disabled={isDisabled}
                        onClick={() => selectMemory(position.memory)}
                        className={`rounded-lg border px-2 py-1 text-[11px] transition-all duration-300 sm:px-5 sm:py-3 sm:text-sm ${
                          isActive
                            ? "border-blue-500 bg-blue-500/10 text-blue-500"
                            : isDisabled
                              ? "cursor-not-allowed border-theme bg-transparent text-muted-soft opacity-40"
                              : "border-theme bg-transparent text-muted hover:border-blue-500/40 hover:bg-blue-soft hover:text-main"
                        }`}
                      >
                        {position.memory}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-2 sm:mt-7">
                <div className="text-[11px] font-semibold text-muted sm:text-sm sm:text-main">SIM</div>

                <div className="mt-1.5 flex flex-wrap gap-1.5 sm:mt-3 sm:gap-3">
                  {simOptions.map((position) => {
                    const isActive = selectedSim === position.sim;
                    const isDisabled =
                      !isActive &&
                      !canSelectConfiguration({ sim: position.sim });

                    return (
                      <button
                        key={position.sim}
                        type="button"
                        disabled={isDisabled}
                        onClick={() => selectSim(position.sim)}
                        className={`rounded-lg border px-2 py-1 text-[11px] transition-all duration-300 sm:px-5 sm:py-3 sm:text-sm ${
                          isActive
                            ? "border-blue-500 bg-blue-500/10 text-blue-500"
                            : isDisabled
                              ? "cursor-not-allowed border-theme bg-transparent text-muted-soft opacity-40"
                              : "border-theme bg-transparent text-muted hover:border-blue-500/40 hover:bg-blue-soft hover:text-main"
                        }`}
                      >
                        {position.sim}
                      </button>
                    );
                  })}
                </div>
              </div>

              </div>{/* end config editor wrapper */}

              {!activePosition && (
                <div className="mt-5 border-t border-theme pt-5 sm:mt-8 sm:pt-7">
                  <div className="text-sm text-muted">Цена</div>

                  <div className="mt-1 text-[28px] font-bold tracking-[-0.045em] sm:text-4xl">
                    {priceRange}
                  </div>

                  <p className="mt-3 text-sm leading-relaxed text-muted sm:mt-4">
                    {hasInvalidCompleteConfiguration
                      ? "Такой конфигурации нет. Выберите другую комбинацию параметров."
                      : "Итоговая цена и наличие появятся после выбора цвета, памяти и SIM."}
                  </p>

                  <div className="mt-4 grid gap-3 sm:mt-6 sm:grid-cols-2">
                    <button
                      type="button"
                      disabled
                      className="flex cursor-not-allowed justify-center rounded-xl bg-blue-600/50 px-5 py-3 text-sm font-medium text-white sm:px-7 sm:py-4"
                    >
                      Купить сейчас →
                    </button>

                    <button
                      type="button"
                      disabled
                      className="flex cursor-not-allowed justify-center rounded-xl border border-theme px-5 py-3 text-sm font-medium text-muted-soft sm:px-7 sm:py-4"
                    >
                      В корзину
                    </button>
                  </div>

                  <Link
                    href="/help"
                    className="mt-3 flex justify-center rounded-xl border border-theme bg-transparent px-5 py-3 text-sm font-medium transition-colors hover:border-blue-500/40 hover:bg-blue-soft sm:px-7 sm:py-4"
                  >
                    Задать вопрос
                  </Link>
                </div>
              )}

              {activePosition && (
                <div className="mt-5 border-t border-theme pt-5 sm:mt-8 sm:pt-7">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      {activePosition.oldPrice && (
                        <div className="text-sm text-muted line-through">
                          {activePosition.oldPrice}
                        </div>
                      )}

                      <div className="mt-1 text-[28px] font-bold tracking-[-0.045em] sm:text-4xl">
                        {activePosition.price}
                      </div>
                    </div>

                    {activePosition.stock > 0 ? (
                      <div className="w-fit rounded-full border border-green-500/30 bg-green-500/10 px-4 py-2 text-sm font-medium text-green-500">
                        {getStatusName(activePosition.status)} ·{" "}
                        {activePosition.stock} шт.
                      </div>
                    ) : (
                      <div className="w-fit rounded-full border border-orange-500/30 bg-orange-500/10 px-4 py-2 text-sm font-medium text-orange-500">
                        {getStatusName(activePosition.status)}
                      </div>
                    )}
                  </div>

                  <div className="mt-4 sm:mt-7">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <div className="text-sm font-semibold">Количество</div>

                        <div className="mt-3 flex h-12 w-fit items-center overflow-hidden rounded-xl border border-theme">
                          <button
                            type="button"
                            onClick={decreaseQuantity}
                            className="flex h-full w-10 items-center justify-center text-lg transition-colors hover:bg-blue-soft sm:w-12"
                          >
                            −
                          </button>

                          <div className="flex h-full w-12 items-center justify-center border-x border-theme text-sm font-bold sm:w-14">
                            {quantity}
                          </div>

                          <button
                            type="button"
                            onClick={increaseQuantity}
                            disabled={activePosition.stock <= 0}
                            className="flex h-full w-10 items-center justify-center text-lg transition-colors hover:bg-blue-soft disabled:cursor-not-allowed disabled:opacity-40 sm:w-12"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {activePosition.stock > 0 ? (
                        <div className="text-sm text-muted">
                          Можно добавить до {activePosition.stock} шт.
                        </div>
                      ) : (
                        <div className="text-sm text-orange-500">
                          Нет в наличии
                        </div>
                      )}
                    </div>

                    <div className="mt-4 grid gap-3 sm:mt-6 sm:grid-cols-2">
                      {activePosition.stock > 0 ? (
                        <Link
                          href="/cart"
                          onClick={saveSelectedPositionToCart}
                          className="flex justify-center rounded-xl bg-blue-600 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-500 sm:px-7 sm:py-4"
                        >
                          Купить сейчас →
                        </Link>
                      ) : (
                        <button
                          type="button"
                          disabled
                          className="flex cursor-not-allowed justify-center rounded-xl bg-blue-600/50 px-5 py-3 text-sm font-medium text-white sm:px-7 sm:py-4"
                        >
                          Купить сейчас →
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={handleAddToCart}
                        disabled={activePosition.stock <= 0}
                        className={`flex justify-center rounded-xl border px-5 py-3 text-sm font-medium transition-colors sm:px-7 sm:py-4 ${
                          activePosition.stock > 0
                            ? "border-theme bg-transparent hover:border-blue-500/40 hover:bg-blue-soft"
                            : "cursor-not-allowed border-theme bg-transparent text-muted-soft"
                        }`}
                      >
                        {addedToCart ? "Добавлено ✓" : "В корзину"}
                      </button>
                    </div>

                    <Link
                      href="/help"
                      className="mt-3 flex justify-center rounded-xl border border-theme bg-transparent px-5 py-3 text-sm font-medium transition-colors hover:border-blue-500/40 hover:bg-blue-soft sm:px-7 sm:py-4"
                    >
                      Задать вопрос
                    </Link>
                  </div>

                  <p className="mt-4 text-xs leading-relaxed text-muted">
                    Цена и наличие могут измениться. Менеджер подтвердит
                    конфигурацию, доставку и итоговую стоимость после
                    оформления.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        {hasProductStory(product) ? <ProductStory product={product} /> : null}

        <section className="mt-6 sm:mt-10">
          <ProductTabs
            productName={product.name}
            brand={product.brand}
            category={categoryName}
            memory={detailsPosition?.memory || "Не выбрано"}
            color={detailsPosition?.color || "Не выбрано"}
            sim={detailsPosition?.sim || "Не выбрано"}
            sku={detailsPosition?.sku || "Будет выбран после конфигурации"}
            description={product.description}
            shortDescription={product.shortDescription}
            benefits={benefits}
          />
        </section>

        <section className="mt-6 sm:mt-10">
          <ProductStrip title="С этим товаром покупают" />
        </section>

        <section className="mb-8 mt-6 sm:mb-10 sm:mt-10">
          <ProductStrip title="Похожие товары" />
        </section>
      </div>
    </main>
  );
}

function ProductStory({ product }: { product: ProductCard }) {
  const blocks = getProductStoryBlocks(product);

  if (blocks.length === 0 && product.description.trim()) {
    return (
      <section className="mt-6 rounded-[24px] border border-theme bg-card p-4 text-main shadow-soft sm:mt-10 sm:rounded-[38px] sm:p-8 lg:p-12">
        <div className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-500">
          Описание
        </div>
        <h2 className="mt-2 text-2xl font-bold tracking-[-0.05em] sm:mt-3 sm:text-4xl lg:text-5xl">
          {product.name}
        </h2>
        <p className="mt-3 max-w-[860px] whitespace-pre-line text-sm leading-relaxed text-muted sm:mt-5 sm:text-base lg:text-lg">
          {product.description}
        </p>
      </section>
    );
  }

  return (
    <section className="mt-6 space-y-4 sm:mt-10 sm:space-y-5">
      {blocks.map((block, index) => {
        const hasImage = Boolean(block.image);
        const imageFirst = block.imageSide === "left";
        const isDark = block.tone === "dark";

        return (
          <article
            key={block.id || `${block.title}-${index}`}
            className={`overflow-hidden rounded-[24px] border shadow-soft sm:rounded-[38px] ${
              isDark
                ? "border-white/10 bg-[#050914] text-white"
                : "border-theme bg-card text-main"
            }`}
          >
            <div className="grid min-h-[260px] lg:min-h-[360px] lg:grid-cols-2">
              <div
                className={`flex flex-col justify-center p-4 sm:p-8 lg:p-12 ${imageFirst ? "lg:order-2" : ""}`}
              >
                {block.eyebrow ? (
                  <div className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-500">
                    {block.eyebrow}
                  </div>
                ) : null}

                {block.title ? (
                  <h2 className="mt-3 text-2xl font-bold tracking-[-0.055em] sm:mt-4 sm:text-4xl lg:text-6xl">
                    {block.title}
                  </h2>
                ) : null}

                {block.text ? (
                  <p
                    className={`mt-3 whitespace-pre-line text-sm leading-relaxed sm:mt-5 sm:text-base lg:text-lg ${isDark ? "text-white/65" : "text-muted"}`}
                  >
                    {block.text}
                  </p>
                ) : null}
              </div>

              <div
                className={`flex min-h-[220px] items-center justify-center sm:min-h-[320px] ${imageFirst ? "lg:order-1" : ""} ${isDark ? "bg-white/[0.03]" : "bg-blue-soft"}`}
              >
                {hasImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <Image quality={75} src={block.image}
                    alt={block.imageAlt || block.title || product.name}
                    className="h-full max-h-[520px] w-full object-contain p-6 lg:p-10"
                  />
                ) : (
                  <div className="text-sm text-muted-soft">Фото блока</div>
                )}
              </div>
            </div>
          </article>
        );
      })}
    </section>
  );
}

function ProductStrip({ title }: { title: string }) {
  return (
    <section>
      <h2 className="text-2xl font-bold tracking-[-0.04em] sm:text-3xl">{title}</h2>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:mt-5 sm:gap-5 md:grid-cols-3 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <Link
            key={index}
            href="/catalog"
            className="card group rounded-[20px] p-3 transition-all duration-300 hover:-translate-y-1 hover:border-blue-500/35 hover:bg-blue-soft sm:rounded-3xl sm:p-4"
          >
            <div className="soft-box flex aspect-[3/4] items-center justify-center rounded-2xl text-sm text-muted-soft">
              Фото
            </div>

            <div className="pt-4">
              <div className="text-sm text-muted-soft">Аксессуар</div>

              <h3 className="mt-1 line-clamp-2 font-bold leading-tight">
                Рекомендованный товар
              </h3>

              <p className="mt-1 text-sm text-muted">от 9 990 ₽</p>

              <div className="mt-3 flex items-center justify-center rounded-xl bg-blue-600 py-2.5 text-sm font-medium text-white transition-colors group-hover:bg-blue-500 sm:mt-4 sm:py-3">
                Смотреть →
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
