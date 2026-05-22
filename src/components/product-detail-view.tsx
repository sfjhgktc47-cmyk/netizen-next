"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { ProductTabs } from "@/components/product-tabs";
import type { PublicProductModel, PublicProductPosition } from "@/lib/public-catalog-db";
import { formatPrice, getPriceNumber } from "@/lib/product-pricing";

type ProductCard = PublicProductModel;
type ProductPosition = PublicProductPosition;

type ProductDetailViewProps = {
  product: ProductCard;
  positions: ProductPosition[];
  selectedPosition?: ProductPosition;
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

  localStorage.setItem("netizen-favorite-slugs", JSON.stringify(normalizedSlugs));
  localStorage.setItem("netizen-favorites-count", String(normalizedSlugs.length));
  window.dispatchEvent(new Event("netizen-favorites-updated"));
}

export function ProductDetailView({
  product,
  positions,
  selectedPosition,
}: ProductDetailViewProps) {

  const [selectedColor, setSelectedColor] = useState(selectedPosition?.color ?? "");
  const [selectedMemory, setSelectedMemory] = useState(selectedPosition?.memory ?? "");
  const [selectedSim, setSelectedSim] = useState(selectedPosition?.sim ?? "");

  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

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
        position.sim === selectedSim
    );
  }, [
    isConfigurationComplete,
    positions,
    selectedColor,
    selectedMemory,
    selectedSim,
  ]);

  const hasInvalidCompleteConfiguration = isConfigurationComplete && !activePosition;

  // Фото позиции показываем только тогда, когда клиент реально выбрал
  // конкретную конфигурацию или пришёл по ссылке на конкретный SKU.
  // До выбора конфигурации остаётся фото материнской карточки, чтобы
  // разные комплектации не смешивались в галерее.
  const previewPosition = activePosition ?? selectedPosition;
  const mediaImages =
    previewPosition?.images && previewPosition.images.length > 0
      ? previewPosition.images
      : product.images && product.images.length > 0
        ? product.images
        : product.image
          ? [product.image]
          : [];

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
        (item: { sku?: string }) => item.sku === activePosition.sku
      );

      const nextItems = existingItem
        ? currentItems.map((item: typeof cartItem) =>
            item.sku === activePosition.sku
              ? {
                  ...item,
                  ...cartItem,
                  quantity: Math.min(
                    activePosition.stock,
                    Number(item.quantity || 0) + quantity
                  ),
                }
              : item
          )
        : [...currentItems, cartItem];

      const cartCount = nextItems.reduce(
        (sum: number, item: { quantity?: number }) =>
          sum + Number(item.quantity || 0),
        0
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
    <main className="min-h-screen bg-page px-6 py-6 text-main transition-colors duration-700">
      <div className="mx-auto max-w-[1440px]">
        <SiteHeader />

        <div className="mt-10">
          <Link
            href="/catalog"
            className="text-sm text-blue-500 transition-colors hover:text-blue-400"
          >
            ← Вернуться в каталог
          </Link>
        </div>

        <section className="mt-8 grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
          <div className="card rounded-[36px] p-6">
            <div className="soft-box mx-auto flex aspect-[3/4] w-full max-w-[520px] items-center justify-center overflow-hidden rounded-[30px] text-muted-soft">
              {mediaImages[0] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={mediaImages[0]}
                  alt={previewPosition?.title ?? product.name}
                  className="h-full w-full object-contain p-4"
                />
              ) : (
                "Фото товара"
              )}
            </div>

            <div className="mx-auto mt-6 grid max-w-[520px] grid-cols-4 gap-4">
              {(mediaImages.length > 0 ? mediaImages.slice(0, 4) : Array.from({ length: 4 })).map(
                (image, index) => (
                  <div
                    key={typeof image === "string" ? `${image}-${index}` : index}
                    className="soft-box flex aspect-[3/4] items-center justify-center overflow-hidden rounded-2xl text-xs text-muted-soft"
                  >
                    {typeof image === "string" ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={image}
                        alt={`${product.name} фото ${index + 1}`}
                        className="h-full w-full object-contain p-1"
                      />
                    ) : (
                      "Фото"
                    )}
                  </div>
                )
              )}
            </div>
          </div>

          <div className="lg:sticky lg:top-6">
            <div className="card rounded-[36px] p-8">
              <div className="text-sm text-muted">{product.brand}</div>

              <h1 className="mt-2 text-5xl font-bold tracking-[-0.055em]">
                {product.name}
              </h1>

              <p className="mt-4 max-w-[620px] text-sm leading-relaxed text-muted">
                {product.shortDescription}
              </p>

              <div className="mt-5">
                <button
                  type="button"
                  onClick={toggleFavorite}
                  className={`rounded-xl border px-5 py-3 text-sm font-medium transition-colors ${
                    isFavorite
                      ? "border-blue-500 bg-blue-500/10 text-blue-500 hover:bg-blue-500/15"
                      : "border-theme bg-transparent text-muted hover:border-blue-500/40 hover:bg-blue-soft hover:text-main"
                  }`}
                >
                  {isFavorite ? "В избранном ✓" : "В избранное"}
                </button>
              </div>

              {!activePosition && (
                <div className="mt-7 rounded-3xl border border-blue-500/30 bg-blue-soft p-5">
                  <div className="text-sm text-blue-500">
                    Соберите конфигурацию
                  </div>

                  <h2 className="mt-2 text-xl font-bold">
                    Выберите цвет, память и SIM
                  </h2>

                  <div className="mt-4 grid gap-3 text-sm text-muted sm:grid-cols-3">
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

                  <p className="mt-4 text-sm leading-relaxed text-muted">
                    После выбора всех параметров появится конкретная позиция,
                    SKU, наличие и итоговая цена.
                  </p>
                </div>
              )}

              {activePosition && (
                <div className="mt-7 rounded-3xl border border-blue-500/30 bg-blue-soft p-5">
                  <div className="text-sm text-blue-500">
                    Выбранная конфигурация
                  </div>

                  <h2 className="mt-2 text-xl font-bold">
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

              <div className="mt-8">
                <div className="text-sm font-semibold">Цвет</div>

                <div className="mt-3 flex flex-wrap gap-3">
                  {colorOptions.map((position) => {
                    const isActive = selectedColor === position.color;
                    const isDisabled =
                      !isActive && !canSelectConfiguration({ color: position.color });

                    return (
                      <button
                        key={position.color}
                        type="button"
                        disabled={isDisabled}
                        onClick={() => selectColor(position.color)}
                        className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-sm transition-all duration-300 ${
                          isActive
                            ? "border-blue-500 bg-blue-500/10 text-blue-500"
                            : isDisabled
                              ? "cursor-not-allowed border-theme bg-transparent text-muted-soft opacity-40"
                              : "border-theme bg-transparent text-muted hover:border-blue-500/40 hover:bg-blue-soft hover:text-main"
                        }`}
                      >
                        <span
                          className="h-5 w-5 rounded-full border border-theme"
                          style={{ backgroundColor: position.colorHex }}
                        />

                        {position.color}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-7">
                <div className="text-sm font-semibold">Память</div>

                <div className="mt-3 flex flex-wrap gap-3">
                  {memoryOptions.map((position) => {
                    const isActive = selectedMemory === position.memory;
                    const isDisabled =
                      !isActive && !canSelectConfiguration({ memory: position.memory });

                    return (
                      <button
                        key={position.memory}
                        type="button"
                        disabled={isDisabled}
                        onClick={() => selectMemory(position.memory)}
                        className={`rounded-xl border px-5 py-3 text-sm transition-all duration-300 ${
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

              <div className="mt-7">
                <div className="text-sm font-semibold">SIM</div>

                <div className="mt-3 flex flex-wrap gap-3">
                  {simOptions.map((position) => {
                    const isActive = selectedSim === position.sim;
                    const isDisabled =
                      !isActive && !canSelectConfiguration({ sim: position.sim });

                    return (
                      <button
                        key={position.sim}
                        type="button"
                        disabled={isDisabled}
                        onClick={() => selectSim(position.sim)}
                        className={`rounded-xl border px-5 py-3 text-sm transition-all duration-300 ${
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

              {!activePosition && (
                <div className="mt-8 border-t border-theme pt-7">
                  <div className="text-sm text-muted">Цена</div>

                  <div className="mt-1 text-4xl font-bold tracking-[-0.045em]">
                    {priceRange}
                  </div>

                  <p className="mt-4 text-sm leading-relaxed text-muted">
                    {hasInvalidCompleteConfiguration
                      ? "Такой конфигурации нет. Выберите другую комбинацию параметров."
                      : "Итоговая цена и наличие появятся после выбора цвета, памяти и SIM."}
                  </p>

                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    <button
                      type="button"
                      disabled
                      className="flex cursor-not-allowed justify-center rounded-xl bg-blue-600/50 px-7 py-4 text-sm font-medium text-white"
                    >
                      Купить сейчас →
                    </button>

                    <button
                      type="button"
                      disabled
                      className="flex cursor-not-allowed justify-center rounded-xl border border-theme px-7 py-4 text-sm font-medium text-muted-soft"
                    >
                      В корзину
                    </button>
                  </div>

                  <Link
                    href="/help"
                    className="mt-3 flex justify-center rounded-xl border border-theme bg-transparent px-7 py-4 text-sm font-medium transition-colors hover:border-blue-500/40 hover:bg-blue-soft"
                  >
                    Задать вопрос
                  </Link>
                </div>
              )}

              {activePosition && (
                <div className="mt-8 border-t border-theme pt-7">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      {activePosition.oldPrice && (
                        <div className="text-sm text-muted line-through">
                          {activePosition.oldPrice}
                        </div>
                      )}

                      <div className="mt-1 text-4xl font-bold tracking-[-0.045em]">
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

                  <div className="mt-7">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <div className="text-sm font-semibold">Количество</div>

                        <div className="mt-3 flex h-12 w-fit items-center overflow-hidden rounded-xl border border-theme">
                          <button
                            type="button"
                            onClick={decreaseQuantity}
                            className="flex h-full w-12 items-center justify-center text-lg transition-colors hover:bg-blue-soft"
                          >
                            −
                          </button>

                          <div className="flex h-full w-14 items-center justify-center border-x border-theme text-sm font-bold">
                            {quantity}
                          </div>

                          <button
                            type="button"
                            onClick={increaseQuantity}
                            disabled={activePosition.stock <= 0}
                            className="flex h-full w-12 items-center justify-center text-lg transition-colors hover:bg-blue-soft disabled:cursor-not-allowed disabled:opacity-40"
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

                    <div className="mt-6 grid gap-3 sm:grid-cols-2">
                      {activePosition.stock > 0 ? (
                        <Link
                          href="/cart"
                          onClick={saveSelectedPositionToCart}
                          className="flex justify-center rounded-xl bg-blue-600 px-7 py-4 text-sm font-medium text-white transition-colors hover:bg-blue-500"
                        >
                          Купить сейчас →
                        </Link>
                      ) : (
                        <button
                          type="button"
                          disabled
                          className="flex cursor-not-allowed justify-center rounded-xl bg-blue-600/50 px-7 py-4 text-sm font-medium text-white"
                        >
                          Купить сейчас →
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={handleAddToCart}
                        disabled={activePosition.stock <= 0}
                        className={`flex justify-center rounded-xl border px-7 py-4 text-sm font-medium transition-colors ${
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
                      className="mt-3 flex justify-center rounded-xl border border-theme bg-transparent px-7 py-4 text-sm font-medium transition-colors hover:border-blue-500/40 hover:bg-blue-soft"
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

        <section className="mt-10">
          {previewPosition && (
            <ProductTabs
              productName={product.name}
              brand={product.brand}
              category={categoryName}
              memory={previewPosition.memory}
              color={previewPosition.color}
              sim={previewPosition.sim}
              sku={previewPosition.sku}
            />
          )}
        </section>

        <section className="mt-10">
          <ProductStrip title="С этим товаром покупают" />
        </section>

        <section className="mb-10 mt-10">
          <ProductStrip title="Похожие товары" />
        </section>
      </div>
    </main>
  );
}

function ProductStrip({ title }: { title: string }) {
  return (
    <section>
      <h2 className="text-3xl font-bold tracking-[-0.04em]">{title}</h2>

      <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-3 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <Link
            key={index}
            href="/catalog"
            className="card group rounded-3xl p-4 transition-all duration-300 hover:-translate-y-1 hover:border-blue-500/35 hover:bg-blue-soft"
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

              <div className="mt-4 flex items-center justify-center rounded-xl bg-blue-600 py-3 text-sm font-medium text-white transition-colors group-hover:bg-blue-500">
                Смотреть →
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}