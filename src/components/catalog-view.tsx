"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { products as fallbackProducts, type ProductModel as CatalogProductBase } from "@/data/products";
import { productPositions as fallbackProductPositions, type ProductPosition as CatalogPositionBase } from "@/data/product-positions";
import { getModelPriceRange, getPriceNumber } from "@/lib/product-pricing";
import { SiteHeader } from "@/components/site-header";
import { ProductCarousel } from "@/components/product-carousel";
import { useTheme } from "@/components/theme-provider";

type CategoryItem = {
  id: string;
  slug: string;
  name: string;
  description: string;
  href: string;
};

type CatalogViewProps = {
  categoryId?: string;
  productsData?: CatalogProductBase[];
  positionsData?: CatalogPositionBase[];
  categoriesData?: CategoryItem[];
};

type ProductModel = CatalogProductBase & {
  category?: string;
  image?: string;
  images?: string[];
  shortDescription?: string;
  status?: string;
  price: string;
  minPrice: number;
  maxPrice: number;
};

type ProductPosition = CatalogPositionBase;

type CatalogPosition = ProductPosition & {
  product: ProductModel;
  brand: string;
  category?: string;
  productName: string;
};

type ColorOption = {
  name: string;
  hex: string;
};

type SortMode = "popular" | "price_asc" | "price_desc" | "new";

const sortModeLabels: Record<SortMode, string> = {
  popular: "популярные",
  price_asc: "сначала дешевле",
  price_desc: "сначала дороже",
  new: "новинки",
};

const sortModeOptions: { value: SortMode; label: string; description: string }[] = [
  {
    value: "popular",
    label: "Популярные",
    description: "Порядок как в подборке",
  },
  {
    value: "price_asc",
    label: "Сначала дешевле",
    description: "От минимальной цены к максимальной",
  },
  {
    value: "price_desc",
    label: "Сначала дороже",
    description: "От максимальной цены к минимальной",
  },
  {
    value: "new",
    label: "Новинки",
    description: "Новые позиции выше",
  },
];

const filterBrands = ["Apple", "Samsung", "Dyson", "Sony", "JBL", "PlayStation"];
const emptyValue = "—";

function uniqueValues(values: string[]) {
  return Array.from(
    new Set(values.filter((value) => Boolean(value) && value !== emptyValue))
  );
}

function uniqueColorOptions(positions: ProductPosition[]) {
  const map = new Map<string, ColorOption>();

  positions.forEach((position) => {
    if (!position.color || position.color === emptyValue || map.has(position.color)) {
      return;
    }

    map.set(position.color, {
      name: position.color,
      hex: position.colorHex,
    });
  });

  return Array.from(map.values());
}

function getCleanImages(...sources: Array<string | string[] | undefined | null>) {
  return Array.from(
    new Set(
      sources
        .flatMap((source) => {
          if (Array.isArray(source)) {
            return source;
          }

          return source ? [source] : [];
        })
        .map((image) => image.trim())
        .filter(Boolean)
    )
  );
}
function getModelImages(product: CatalogProductBase) {
  const productWithImages = product as CatalogProductBase & {
    image?: string | null;
    images?: string[] | null;
  };

  return getCleanImages(productWithImages.image, productWithImages.images);
}

function getModelImage(product: ProductModel) {
  return getModelImages(product)[0] ?? "";
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

function getMemoryLabel(categoryId?: string) {
  if (categoryId === "laptops") {
    return "Память / SSD";
  }

  if (categoryId === "tablets") {
    return "Память";
  }

  return "Память";
}

function getOnlyDigits(value: string) {
  return Number(value.replace(/\D/g, ""));
}

function getProductPriceStats(
  modelSlug: string,
  fallbackPrice: string,
  positions: ProductPosition[]
) {
  const prices = positions
    .filter((position) => position.modelSlug === modelSlug)
    .map((position) => getPriceNumber(position.price))
    .filter((price) => price > 0);

  if (prices.length === 0) {
    const fallback = getPriceNumber(fallbackPrice);

    return {
      price: fallbackPrice,
      minPrice: fallback,
      maxPrice: fallback,
    };
  }

  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);

  return {
    price: getModelPriceRange(modelSlug, fallbackPrice),
    minPrice,
    maxPrice,
  };
}

function sortProductModels(items: ProductModel[], sortMode: SortMode) {
  if (sortMode === "popular") {
    return items;
  }

  return [...items].sort((a, b) => {
    if (sortMode === "price_asc") {
      return a.minPrice - b.minPrice;
    }

    if (sortMode === "price_desc") {
      return b.maxPrice - a.maxPrice;
    }

    return b.slug.localeCompare(a.slug);
  });
}

function sortCatalogPositions(items: CatalogPosition[], sortMode: SortMode) {
  if (sortMode === "popular") {
    return items;
  }

  return [...items].sort((a, b) => {
    const aPrice = getPriceNumber(a.price);
    const bPrice = getPriceNumber(b.price);

    if (sortMode === "price_asc") {
      return aPrice - bPrice;
    }

    if (sortMode === "price_desc") {
      return bPrice - aPrice;
    }

    return b.sku.localeCompare(a.sku);
  });
}



type CatalogUrlFilters = {
  selectedBrand: string | null;
  selectedModelSlug: string | null;
  selectedMemory: string | null;
  selectedColor: string | null;
  selectedSim: string | null;
  selectedStatus: string | null;
  priceFrom: string;
  priceTo: string;
  sortMode: SortMode;
};

const defaultUrlFilters: CatalogUrlFilters = {
  selectedBrand: null,
  selectedModelSlug: null,
  selectedMemory: null,
  selectedColor: null,
  selectedSim: null,
  selectedStatus: null,
  priceFrom: "",
  priceTo: "",
  sortMode: "popular",
};

function isSortMode(value: string | null): value is SortMode {
  return value === "popular" || value === "price_asc" || value === "price_desc" || value === "new";
}

function getUrlValue(params: URLSearchParams, key: string) {
  const value = params.get(key);
  return value && value.trim() ? value : null;
}

function parseCatalogUrlFilters(params: URLSearchParams): CatalogUrlFilters {
  const sort = params.get("sort");

  return {
    selectedBrand: getUrlValue(params, "brand"),
    selectedModelSlug: getUrlValue(params, "model"),
    selectedMemory: getUrlValue(params, "memory"),
    selectedColor: getUrlValue(params, "color"),
    selectedSim: getUrlValue(params, "sim"),
    selectedStatus: getUrlValue(params, "availability") ?? getUrlValue(params, "status"),
    priceFrom: params.get("priceFrom") ?? "",
    priceTo: params.get("priceTo") ?? "",
    sortMode: isSortMode(sort) ? sort : "popular",
  };
}

function getCatalogUrlFiltersFromWindow() {
  if (typeof window === "undefined") {
    return defaultUrlFilters;
  }

  return parseCatalogUrlFilters(new URLSearchParams(window.location.search));
}

function writeCatalogUrlFiltersToWindow(filters: CatalogUrlFilters) {
  if (typeof window === "undefined") {
    return;
  }

  const url = new URL(window.location.href);
  const params = url.searchParams;

  [
    "brand",
    "model",
    "memory",
    "color",
    "sim",
    "availability",
    "status",
    "priceFrom",
    "priceTo",
    "sort",
  ].forEach((key) => params.delete(key));

  if (filters.selectedBrand) params.set("brand", filters.selectedBrand);
  if (filters.selectedModelSlug) params.set("model", filters.selectedModelSlug);
  if (filters.selectedMemory) params.set("memory", filters.selectedMemory);
  if (filters.selectedColor) params.set("color", filters.selectedColor);
  if (filters.selectedSim) params.set("sim", filters.selectedSim);
  if (filters.selectedStatus) params.set("availability", filters.selectedStatus);
  if (filters.priceFrom) params.set("priceFrom", filters.priceFrom);
  if (filters.priceTo) params.set("priceTo", filters.priceTo);
  if (filters.sortMode !== "popular") params.set("sort", filters.sortMode);

  const nextUrl = `${url.pathname}${params.toString() ? `?${params.toString()}` : ""}${url.hash}`;
  const currentUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`;

  if (nextUrl !== currentUrl) {
    window.history.replaceState(null, "", nextUrl);
  }
}

function sanitizePriceInput(value: string) {
  return value.replace(/\D/g, "");
}

function getAvailabilityText(position: CatalogPosition) {
  if (position.status === "preorder") {
    return "Под заказ";
  }

  if (position.status === "out_of_stock" || position.stock <= 0) {
    return "Нет в наличии";
  }

  if (position.status === "active") {
    return position.stock > 0 ? `В наличии · ${position.stock} шт.` : "В наличии";
  }

  return getStatusName(position.status);
}

function getAvailabilityBadgeClass(position: CatalogPosition) {
  if (position.status === "active" && position.stock > 0) {
    return "bg-green-500/10 text-green-500";
  }

  if (position.status === "preorder") {
    return "bg-blue-500/10 text-blue-500";
  }

  return "bg-orange-500/10 text-orange-500";
}

type SpecificationKey = "memory" | "color" | "sim" | "status";

type SpecificationSelection = {
  selectedMemory: string | null;
  selectedColor: string | null;
  selectedSim: string | null;
  selectedStatus: string | null;
};

function isPositionAvailableForOption(
  position: CatalogPosition,
  key: SpecificationKey,
  value: string,
  selection: SpecificationSelection
) {
  const memory = key === "memory" ? value : selection.selectedMemory;
  const color = key === "color" ? value : selection.selectedColor;
  const sim = key === "sim" ? value : selection.selectedSim;
  const status = key === "status" ? value : selection.selectedStatus;

  return (
    (!memory || position.memory === memory) &&
    (!color || position.color === color) &&
    (!sim || position.sim === sim) &&
    (!status || position.status === status)
  );
}

function getDisabledOptions(
  options: string[],
  key: SpecificationKey,
  positions: CatalogPosition[],
  selection: SpecificationSelection
) {
  return options.filter(
    (option) =>
      !positions.some((position) =>
        isPositionAvailableForOption(position, key, option, selection)
      )
  );
}

export function CatalogView({
  categoryId,
  productsData = [],
  positionsData = [],
  categoriesData = [],
}: CatalogViewProps) {
  const { dark } = useTheme();

  const catalogProductsData = productsData.length > 0 ? productsData : fallbackProducts;
  const catalogPositionsData =
    positionsData.length > 0 ? positionsData : fallbackProductPositions;
  const categories = categoriesData;

  const activeCategoryIndex = categories.findIndex(
    (category) => category.id === categoryId
  );

  const isUrlSyncReady = useRef(false);
  const shouldSkipInitialUrlWrite = useRef(true);

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(
    () => activeCategoryIndex >= 6
  );
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [selectedModelSlug, setSelectedModelSlug] = useState<string | null>(null);
  const [selectedMemory, setSelectedMemory] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSim, setSelectedSim] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [priceFrom, setPriceFrom] = useState("");
  const [priceTo, setPriceTo] = useState("");
  const [sortMode, setSortMode] = useState<SortMode>("popular");
  const [isSortOpen, setIsSortOpen] = useState(false);

  useEffect(() => {
    if (activeCategoryIndex >= 6) {
      setIsCategoriesOpen(true);
    }
  }, [activeCategoryIndex]);

  useEffect(() => {
    function syncFiltersFromUrl() {
      const filters = getCatalogUrlFiltersFromWindow();

      setSelectedBrand(filters.selectedBrand);
      setSelectedModelSlug(filters.selectedModelSlug);
      setSelectedMemory(filters.selectedMemory);
      setSelectedColor(filters.selectedColor);
      setSelectedSim(filters.selectedSim);
      setSelectedStatus(filters.selectedStatus);
      setPriceFrom(filters.priceFrom);
      setPriceTo(filters.priceTo);
      setSortMode(filters.sortMode);
    }

    syncFiltersFromUrl();
    isUrlSyncReady.current = true;

    window.addEventListener("popstate", syncFiltersFromUrl);

    return () => window.removeEventListener("popstate", syncFiltersFromUrl);
  }, []);

  useEffect(() => {
    if (!isUrlSyncReady.current) {
      return;
    }

    if (shouldSkipInitialUrlWrite.current) {
      shouldSkipInitialUrlWrite.current = false;
      return;
    }

    writeCatalogUrlFiltersToWindow({
      selectedBrand,
      selectedModelSlug,
      selectedMemory,
      selectedColor,
      selectedSim,
      selectedStatus,
      priceFrom,
      priceTo,
      sortMode,
    });
  }, [
    priceFrom,
    priceTo,
    selectedBrand,
    selectedColor,
    selectedMemory,
    selectedModelSlug,
    selectedSim,
    selectedStatus,
    sortMode,
  ]);

  const allProducts = useMemo(
    () => {
      const positionImagesByModel = catalogPositionsData.reduce<Record<string, string[]>>(
        (acc, position) => {
          const images = getCleanImages(position.images);

          if (images.length === 0) {
            return acc;
          }

          acc[position.modelSlug] = getCleanImages(acc[position.modelSlug], images);
          return acc;
        },
        {}
      );

      return catalogProductsData.map((product) => {
        const priceStats = getProductPriceStats(
          product.slug,
          product.price,
          catalogPositionsData
        );
        const productImages = getModelImages(product);
        const positionImages = positionImagesByModel[product.slug] ?? [];
        const images = getCleanImages(productImages, positionImages);

        return {
          ...product,
          image: images[0] ?? "",
          images,
          ...priceStats,
        };
      }) as ProductModel[];
    },
    [catalogProductsData, catalogPositionsData]
  );

  const activeCategory = categories.find(
    (category) => category.id === categoryId
  );

  const selectedModel = allProducts.find(
    (product) => product.slug === selectedModelSlug
  );

  const effectiveCategoryId = activeCategory?.id ?? selectedModel?.category;
  const showSpecificationFilters = Boolean(effectiveCategoryId);
  const memoryLabel = getMemoryLabel(effectiveCategoryId);

  const categoryProducts = useMemo(
    () =>
      categoryId
        ? allProducts.filter((product) => product.category === categoryId)
        : allProducts,
    [allProducts, categoryId]
  );

  const visibleModelProducts = useMemo(
    () =>
      selectedBrand
        ? categoryProducts.filter((product) => product.brand === selectedBrand)
        : categoryProducts,
    [categoryProducts, selectedBrand]
  );

  const modelOptions = useMemo(() => {
    if (!activeCategory && !selectedBrand) {
      return [];
    }

    return visibleModelProducts;
  }, [activeCategory, selectedBrand, visibleModelProducts]);

  const productMap = useMemo(() => {
    return new Map(allProducts.map((product) => [product.slug, product]));
  }, [allProducts]);

  const enrichedPositions = useMemo(() => {
    return catalogPositionsData
      .map((position) => {
        const product = productMap.get(position.modelSlug);

        if (!product) {
          return null;
        }

        return {
          ...position,
          product,
          brand: product.brand,
          category: product.category,
          productName: product.name,
        };
      })
      .filter(Boolean) as CatalogPosition[];
  }, [catalogPositionsData, productMap]);

  const positionsForFilterOptions = useMemo(() => {
    return enrichedPositions.filter((position) => {
      if (categoryId && position.category !== categoryId) {
        return false;
      }

      if (selectedBrand && position.brand !== selectedBrand) {
        return false;
      }

      if (selectedModelSlug && position.modelSlug !== selectedModelSlug) {
        return false;
      }

      return true;
    });
  }, [categoryId, enrichedPositions, selectedBrand, selectedModelSlug]);

  const memoryOptions = useMemo(
    () => uniqueValues(positionsForFilterOptions.map((position) => position.memory)),
    [positionsForFilterOptions]
  );

  const colorOptions = useMemo(
    () => uniqueColorOptions(positionsForFilterOptions),
    [positionsForFilterOptions]
  );

  const simOptions = useMemo(
    () => uniqueValues(positionsForFilterOptions.map((position) => position.sim)),
    [positionsForFilterOptions]
  );

  const statusOptions = useMemo(
    () => uniqueValues(positionsForFilterOptions.map((position) => position.status)),
    [positionsForFilterOptions]
  );

  const specificationSelection = useMemo(
    () => ({ selectedMemory, selectedColor, selectedSim, selectedStatus }),
    [selectedColor, selectedMemory, selectedSim, selectedStatus]
  );

  const disabledMemoryOptions = useMemo(
    () =>
      getDisabledOptions(
        memoryOptions,
        "memory",
        positionsForFilterOptions,
        specificationSelection
      ),
    [memoryOptions, positionsForFilterOptions, specificationSelection]
  );

  const disabledColorOptions = useMemo(
    () =>
      getDisabledOptions(
        colorOptions.map((color) => color.name),
        "color",
        positionsForFilterOptions,
        specificationSelection
      ),
    [colorOptions, positionsForFilterOptions, specificationSelection]
  );

  const disabledSimOptions = useMemo(
    () =>
      getDisabledOptions(
        simOptions,
        "sim",
        positionsForFilterOptions,
        specificationSelection
      ),
    [simOptions, positionsForFilterOptions, specificationSelection]
  );

  const disabledStatusOptions = useMemo(
    () =>
      getDisabledOptions(
        statusOptions,
        "status",
        positionsForFilterOptions,
        specificationSelection
      ),
    [statusOptions, positionsForFilterOptions, specificationSelection]
  );

  const positionResults = useMemo(() => {
    const minPrice = getOnlyDigits(priceFrom);
    const maxPrice = getOnlyDigits(priceTo);

    return enrichedPositions.filter((position) => {
      const price = getPriceNumber(position.price);

      if (categoryId && position.category !== categoryId) {
        return false;
      }

      if (selectedBrand && position.brand !== selectedBrand) {
        return false;
      }

      if (selectedModelSlug && position.modelSlug !== selectedModelSlug) {
        return false;
      }

      if (selectedMemory && position.memory !== selectedMemory) {
        return false;
      }

      if (selectedColor && position.color !== selectedColor) {
        return false;
      }

      if (selectedSim && position.sim !== selectedSim) {
        return false;
      }

      if (selectedStatus && position.status !== selectedStatus) {
        return false;
      }

      if (minPrice > 0 && price < minPrice) {
        return false;
      }

      if (maxPrice > 0 && price > maxPrice) {
        return false;
      }

      return true;
    });
  }, [
    categoryId,
    enrichedPositions,
    priceFrom,
    priceTo,
    selectedBrand,
    selectedColor,
    selectedMemory,
    selectedModelSlug,
    selectedSim,
    selectedStatus,
  ]);

  const sortedVisibleModelProducts = useMemo(
    () => sortProductModels(visibleModelProducts, sortMode),
    [sortMode, visibleModelProducts]
  );

  const sortedPositionResults = useMemo(
    () => sortCatalogPositions(positionResults, sortMode),
    [positionResults, sortMode]
  );

  const productsByBrand = useMemo(() => {
    const grouped = visibleModelProducts.reduce<Record<string, ProductModel[]>>(
      (acc, product) => {
        if (!acc[product.brand]) {
          acc[product.brand] = [];
        }

        acc[product.brand].push(product);
        return acc;
      },
      {}
    );

    return Object.entries(grouped).map(([brand, brandProducts]) => [
      brand,
      sortProductModels(brandProducts, sortMode),
    ] as [string, ProductModel[]]);
  }, [sortMode, visibleModelProducts]);

  const hasSpecificationFilters = Boolean(
    selectedModelSlug ||
      selectedMemory ||
      selectedColor ||
      selectedSim ||
      selectedStatus ||
      priceFrom ||
      priceTo
  );

  const shouldShowPositionResults = Boolean(hasSpecificationFilters);
  const hasActiveFilters = Boolean(selectedBrand || hasSpecificationFilters);
  const resultCount = shouldShowPositionResults
    ? positionResults.length
    : visibleModelProducts.length;

  const pageTitle = selectedModel
    ? selectedModel.name
    : selectedBrand
      ? activeCategory
        ? `${activeCategory.name} ${selectedBrand}`
        : selectedBrand
      : activeCategory
        ? activeCategory.name
        : "Каталог техники";

  const pageDescription = shouldShowPositionResults
    ? "Показаны конкретные позиции / SKU из базы: фото, конфигурация, цена и наличие. Можно сразу открыть нужную комплектацию."
    : "Выберите устройство по категории, бренду или параметрам. В каталоге будут показаны конкретные позиции из БД.";

  const catalogTrail = [
    activeCategory?.name,
    selectedBrand,
    selectedModel?.name,
  ]
    .filter(Boolean)
    .join(" / ");

  function resetSpecificationFilters() {
    setSelectedModelSlug(null);
    setSelectedMemory(null);
    setSelectedColor(null);
    setSelectedSim(null);
    setSelectedStatus(null);
    setPriceFrom("");
    setPriceTo("");
  }

  function handleSelectBrand(brand: string) {
    setSelectedBrand((current) => (current === brand ? null : brand));
    resetSpecificationFilters();
  }

  function handleResetBrand() {
    setSelectedBrand(null);
    resetSpecificationFilters();
  }

  function handleResetCatalogState() {
    setSelectedBrand(null);
    resetSpecificationFilters();
    setSortMode("popular");
  }

  function handleSelectModel(modelSlug: string) {
    setSelectedModelSlug((current) => (current === modelSlug ? null : modelSlug));
    setSelectedMemory(null);
    setSelectedColor(null);
    setSelectedSim(null);
    setSelectedStatus(null);
    setPriceFrom("");
    setPriceTo("");
  }

  return (
    <main className="min-h-screen bg-page px-4 py-6 text-main transition-colors duration-700 sm:px-6 xl:px-8">
      <div className="w-full">
        <div className="mx-auto max-w-[1440px]">
          <SiteHeader />
        </div>

        <section className="mt-10">
          <Link
            href="/"
            className="text-sm text-blue-500 transition-colors hover:text-blue-400"
          >
            ← На главную
          </Link>

          <div className="mt-5 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex rounded-full border border-blue-500/40 bg-blue-500/10 px-4 py-2 text-xs font-medium text-blue-500">
                  Каталог
                </span>

                {catalogTrail ? (
                  <span className="text-sm text-muted">{catalogTrail}</span>
                ) : null}
              </div>

              <h1 className="mt-4 text-5xl font-bold tracking-[-0.055em] md:text-6xl">
                {pageTitle}
              </h1>

              <p className="mt-4 max-w-[760px] text-base leading-relaxed text-muted">
                {pageDescription}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setIsFilterOpen((prev) => !prev)}
                className={`rounded-xl border px-6 py-4 text-sm font-medium transition-all duration-300 ${
                  isFilterOpen
                    ? "border-blue-500 bg-blue-600 text-white"
                    : "border-theme bg-transparent hover:border-blue-500/40 hover:bg-blue-soft"
                }`}
              >
                {isFilterOpen ? "Скрыть фильтры" : "Фильтры"}
              </button>

              <SortControl
                sortMode={sortMode}
                isOpen={isSortOpen}
                onToggle={() => setIsSortOpen((prev) => !prev)}
                onSelect={(nextSortMode) => {
                  setSortMode(nextSortMode);
                  setIsSortOpen(false);
                }}
              />
            </div>
          </div>
        </section>

        <section className="mt-8">
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/catalog"
              onClick={handleResetCatalogState}
              className={`rounded-full border px-5 py-3 text-sm font-medium transition-all duration-300 ${
                !categoryId && !selectedBrand && !hasSpecificationFilters
                  ? "border-blue-500 bg-blue-600 text-white"
                  : "border-theme bg-transparent text-muted hover:border-blue-500/40 hover:bg-blue-soft hover:text-main"
              }`}
            >
              Все товары
            </Link>

            {(isCategoriesOpen ? categories : categories.slice(0, 6)).map(
              (category) => {
                const isActive = category.id === categoryId && !hasActiveFilters;

                return (
                  <Link
                    key={category.id}
                    href={category.href}
                    onClick={handleResetCatalogState}
                    className={`rounded-full border px-5 py-3 text-sm font-medium transition-all duration-300 ${
                      isActive
                        ? "border-blue-500 bg-blue-600 text-white"
                        : "border-theme bg-transparent text-muted hover:border-blue-500/40 hover:bg-blue-soft hover:text-main"
                    }`}
                  >
                    {category.name}
                  </Link>
                );
              }
            )}

            {categories.length > 6 && (
              <button
                type="button"
                onClick={() => setIsCategoriesOpen((prev) => !prev)}
                className="rounded-full border border-theme bg-transparent px-5 py-3 text-sm font-medium text-blue-500 transition-all duration-300 hover:border-blue-500/40 hover:bg-blue-soft"
              >
                {isCategoriesOpen ? "Свернуть" : "Развернуть"}
              </button>
            )}
          </div>
        </section>

        {hasActiveFilters && (
          <ActiveFilterSummary
            selectedBrand={selectedBrand}
            selectedModel={selectedModel?.name ?? null}
            selectedMemory={selectedMemory}
            selectedColor={selectedColor}
            selectedSim={selectedSim}
            selectedStatus={selectedStatus}
            priceFrom={priceFrom}
            priceTo={priceTo}
            showPositionResults={shouldShowPositionResults}
            resultCount={resultCount}
            onReset={handleResetCatalogState}
          />
        )}

        <section
          className="mt-8 flex flex-col gap-6 xl:flex-row xl:items-start"
          id="catalog-products"
        >
          {isFilterOpen && (
            <div className="fixed inset-0 z-50 overflow-y-auto bg-black/45 px-4 py-5 backdrop-blur-sm xl:sticky xl:top-6 xl:inset-auto xl:w-[320px] xl:shrink-0 xl:overflow-visible xl:bg-transparent xl:p-0 xl:backdrop-blur-0">
              <div className="mx-auto max-w-[430px] xl:mx-0 xl:max-h-[calc(100vh-48px)] xl:overflow-y-auto xl:pr-1 xl:pb-4">
                <FilterPanel
                  onClose={() => setIsFilterOpen(false)}
                  activeCategoryName={activeCategory?.name ?? null}
                  showSpecificationFilters={showSpecificationFilters}
                  memoryLabel={memoryLabel}
                  selectedBrand={selectedBrand}
                  selectedModelSlug={selectedModelSlug}
                  selectedMemory={selectedMemory}
                  selectedColor={selectedColor}
                  selectedSim={selectedSim}
                  selectedStatus={selectedStatus}
                  priceFrom={priceFrom}
                  priceTo={priceTo}
                  modelOptions={modelOptions}
                  memoryOptions={memoryOptions}
                  colorOptions={colorOptions}
                  simOptions={simOptions}
                  statusOptions={statusOptions}
                  disabledMemoryOptions={disabledMemoryOptions}
                  disabledColorOptions={disabledColorOptions}
                  disabledSimOptions={disabledSimOptions}
                  disabledStatusOptions={disabledStatusOptions}
                  resultCount={resultCount}
                  onSelectBrand={handleSelectBrand}
                  onResetBrand={handleResetBrand}
                  onSelectModel={handleSelectModel}
                  onSelectMemory={setSelectedMemory}
                  onSelectColor={setSelectedColor}
                  onSelectSim={setSelectedSim}
                  onSelectStatus={setSelectedStatus}
                  onPriceFromChange={(value) => setPriceFrom(sanitizePriceInput(value))}
                  onPriceToChange={(value) => setPriceTo(sanitizePriceInput(value))}
                  onResetSpecifications={resetSpecificationFilters}
                />
              </div>
            </div>
          )}

          <div className="min-w-0 flex-1">
            {shouldShowPositionResults ? (
              positionResults.length > 0 ? (
                <PositionGrid
                  positions={sortedPositionResults}
                  title={
                    selectedModel?.name ?? selectedBrand ?? activeCategory?.name ?? "Позиции / SKU"
                  }
                  subtitle={`${positionResults.length} конкретных позиций в подборке`}
                  dark={dark}
                />
              ) : (
                <EmptyCatalogState onReset={resetSpecificationFilters} />
              )
            ) : sortedVisibleModelProducts.length > 0 ? (
              productsByBrand.map(([brand, brandProducts]) => (
                <ProductCarousel
                  key={brand}
                  title={brand}
                  subtitle={
                    activeCategory
                      ? `${activeCategory.name} · ${brandProducts.length} товар`
                      : `${brandProducts.length} товар в подборке`
                  }
                  products={brandProducts}
                  actionLabel="Смотреть все"
                  actionOnClick={() => handleSelectBrand(brand)}
                  dark={dark}
                />
              ))
            ) : (
              <EmptyCatalogState onReset={handleResetCatalogState} />
            )}
          </div>
        </section>
      </div>
    </main>
  );
}


function SortControl({
  sortMode,
  isOpen,
  onToggle,
  onSelect,
}: {
  sortMode: SortMode;
  isOpen: boolean;
  onToggle: () => void;
  onSelect: (sortMode: SortMode) => void;
}) {
  return (
    <div className="relative">
      <button
        type="button"
        onClick={onToggle}
        className={`rounded-xl border px-6 py-4 text-sm font-medium transition-colors ${
          isOpen
            ? "border-blue-500/40 bg-blue-500/10 text-blue-500"
            : "border-theme bg-transparent hover:border-blue-500/40 hover:bg-blue-soft"
        }`}
      >
        Сортировка: {sortModeLabels[sortMode]}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-[calc(100%+10px)] z-30 w-[260px] rounded-2xl border border-theme bg-page p-2 shadow-[0_24px_90px_rgba(15,23,42,0.22)]">
          {sortModeOptions.map((option) => {
            const isActive = option.value === sortMode;

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => onSelect(option.value)}
                className={`w-full rounded-xl px-4 py-3 text-left transition-colors ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "text-main hover:bg-blue-soft"
                }`}
              >
                <div className="flex items-center justify-between gap-3 text-sm font-semibold">
                  <span>{option.label}</span>
                  {isActive && <span>✓</span>}
                </div>

                <div
                  className={`mt-1 text-xs ${
                    isActive ? "text-white/70" : "text-muted"
                  }`}
                >
                  {option.description}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ActiveFilterSummary({
  selectedBrand,
  selectedModel,
  selectedMemory,
  selectedColor,
  selectedSim,
  selectedStatus,
  priceFrom,
  priceTo,
  showPositionResults,
  resultCount,
  onReset,
}: {
  selectedBrand: string | null;
  selectedModel: string | null;
  selectedMemory: string | null;
  selectedColor: string | null;
  selectedSim: string | null;
  selectedStatus: string | null;
  priceFrom: string;
  priceTo: string;
  showPositionResults: boolean;
  resultCount: number;
  onReset: () => void;
}) {
  const filterTags = [
    selectedBrand ? `Бренд: ${selectedBrand}` : null,
    selectedModel ? `Модель: ${selectedModel}` : null,
    selectedMemory ? `Память: ${selectedMemory}` : null,
    selectedColor ? `Цвет: ${selectedColor}` : null,
    selectedSim ? `SIM: ${selectedSim}` : null,
    selectedStatus ? `Статус: ${getStatusName(selectedStatus)}` : null,
    priceFrom ? `Цена от: ${priceFrom}` : null,
    priceTo ? `Цена до: ${priceTo}` : null,
  ].filter(Boolean) as string[];

  return (
    <section className="mt-8 rounded-[28px] border border-blue-500/30 bg-blue-500/10 p-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-500">
            Активные фильтры
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {filterTags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-blue-500/25 bg-blue-500/10 px-3 py-2 text-sm font-medium text-blue-500"
              >
                {tag}
              </span>
            ))}
          </div>

          <p className="mt-3 text-sm text-muted">
            {showPositionResults
              ? `Показаны позиции / SKU: ${resultCount}.`
              : `Показаны модели товаров: ${resultCount}.`}
          </p>
        </div>

        <button
          type="button"
          onClick={onReset}
          className="w-full rounded-xl border border-theme bg-transparent px-5 py-4 text-sm font-medium transition-colors hover:border-blue-500/40 hover:bg-blue-soft md:w-auto"
        >
          Сбросить параметры
        </button>
      </div>
    </section>
  );
}

function PositionGrid({
  positions,
  title,
  subtitle,
  dark,
}: {
  positions: CatalogPosition[];
  title: string;
  subtitle: string;
  dark: boolean;
}) {
  return (
    <section>
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-[-0.04em]">{title}</h2>
          <p className="mt-2 text-sm text-muted">{subtitle}</p>
        </div>
      </div>

      <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
        {positions.map((position) => (
          <PositionProductCard key={position.sku} position={position} dark={dark} />
        ))}
      </div>
    </section>
  );
}

function PositionProductCard({
  position,
  dark,
}: {
  position: CatalogPosition;
  dark: boolean;
}) {
  return (
    <Link
      href={`/product/${position.modelSlug}?sku=${encodeURIComponent(position.sku)}`}
      className={`group block h-full rounded-3xl border p-4 transition-all duration-500 hover:-translate-y-1 ${
        dark
          ? "border-white/10 bg-white/[0.035] shadow-[0_20px_80px_rgba(0,60,255,0.08)] hover:border-blue-500/35 hover:bg-blue-500/[0.04]"
          : "border-black/10 bg-white shadow-[0_20px_80px_rgba(15,23,42,0.08)] hover:border-blue-500/35"
      }`}
    >
      <div
        className={`flex h-[220px] items-center justify-center overflow-hidden rounded-2xl transition-colors duration-700 ${
          dark ? "bg-white/[0.045] text-white/25" : "bg-slate-100 text-black/25"
        }`}
      >
        {position.images?.[0] || getModelImage(position.product) ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={position.images?.[0] ?? getModelImage(position.product)}
            alt={position.title}
            className="h-full w-full object-cover"
          />
        ) : (
          "Фото товара"
        )}
      </div>

      <div className="px-1 pb-1 pt-4">
        <div className="text-xs text-muted">
          {position.brand} · {position.productName}
        </div>

        <h3 className="mt-1 text-lg font-bold leading-tight">
          {position.title}
        </h3>

        <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted">
          {position.memory !== emptyValue && (
            <span className="rounded-full border border-theme px-2 py-1">
              {position.memory}
            </span>
          )}

          {position.sim !== emptyValue && (
            <span className="rounded-full border border-theme px-2 py-1">
              {position.sim}
            </span>
          )}

          <span className="flex items-center gap-1 rounded-full border border-theme px-2 py-1">
            <span
              className="h-3 w-3 rounded-full border border-theme"
              style={{ backgroundColor: position.colorHex }}
            />
            {position.color}
          </span>
        </div>

        <div className="mt-4 flex items-end justify-between gap-3">
          <div>
            {position.oldPrice && (
              <div className="text-xs text-muted line-through">
                {position.oldPrice}
              </div>
            )}

            <p className="text-lg font-bold tracking-[-0.03em]">
              {position.price}
            </p>
          </div>

          <div
            className={`rounded-full px-3 py-1 text-xs font-medium ${getAvailabilityBadgeClass(
              position
            )}`}
          >
            {getAvailabilityText(position)}
          </div>
        </div>

        <div className="mt-2 text-xs text-muted-soft">Код товара: {position.sku}</div>

        <div className="mt-5 w-full rounded-xl bg-blue-600 py-3 text-center text-sm font-medium text-white transition-all duration-300 group-hover:bg-blue-500">
          Открыть товар →
        </div>
      </div>
    </Link>
  );
}

function FilterPanel({
  onClose,
  activeCategoryName,
  showSpecificationFilters,
  memoryLabel,
  selectedBrand,
  selectedModelSlug,
  selectedMemory,
  selectedColor,
  selectedSim,
  selectedStatus,
  priceFrom,
  priceTo,
  modelOptions,
  memoryOptions,
  colorOptions,
  simOptions,
  statusOptions,
  disabledMemoryOptions,
  disabledColorOptions,
  disabledSimOptions,
  disabledStatusOptions,
  resultCount,
  onSelectBrand,
  onResetBrand,
  onSelectModel,
  onSelectMemory,
  onSelectColor,
  onSelectSim,
  onSelectStatus,
  onPriceFromChange,
  onPriceToChange,
  onResetSpecifications,
}: {
  onClose: () => void;
  activeCategoryName: string | null;
  showSpecificationFilters: boolean;
  memoryLabel: string;
  selectedBrand: string | null;
  selectedModelSlug: string | null;
  selectedMemory: string | null;
  selectedColor: string | null;
  selectedSim: string | null;
  selectedStatus: string | null;
  priceFrom: string;
  priceTo: string;
  modelOptions: ProductModel[];
  memoryOptions: string[];
  colorOptions: ColorOption[];
  simOptions: string[];
  statusOptions: string[];
  disabledMemoryOptions: string[];
  disabledColorOptions: string[];
  disabledSimOptions: string[];
  disabledStatusOptions: string[];
  resultCount: number;
  onSelectBrand: (brand: string) => void;
  onResetBrand: () => void;
  onSelectModel: (modelSlug: string) => void;
  onSelectMemory: (value: string | null) => void;
  onSelectColor: (value: string | null) => void;
  onSelectSim: (value: string | null) => void;
  onSelectStatus: (value: string | null) => void;
  onPriceFromChange: (value: string) => void;
  onPriceToChange: (value: string) => void;
  onResetSpecifications: () => void;
}) {
  const visibleModelOptions = selectedModelSlug
    ? modelOptions.filter((product) => product.slug === selectedModelSlug)
    : modelOptions;

  return (
    <aside className="card min-h-[560px] rounded-[30px] p-5 shadow-[0_30px_120px_rgba(37,99,235,0.18)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-xs font-medium uppercase tracking-[0.2em] text-blue-500">
            Фильтры
          </div>

          <h3 className="mt-3 text-3xl font-bold tracking-[-0.045em]">
            Уточнить выбор
          </h3>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-lg text-white transition-colors hover:bg-blue-500"
        >
          ×
        </button>
      </div>

      <div className="mt-7 space-y-7">
        <div>
          <div className="mb-3 text-sm font-semibold">Бренд</div>

          <div className="flex flex-wrap gap-2">
            {filterBrands.map((brand) => {
              const isActive = brand === selectedBrand;

              return (
                <button
                  key={brand}
                  type="button"
                  onClick={() => onSelectBrand(brand)}
                  className={`rounded-xl border px-3 py-2 text-sm transition-all duration-300 ${
                    isActive
                      ? "border-blue-500/40 bg-blue-500/10 text-blue-500"
                      : "border-theme bg-transparent text-muted hover:border-blue-500/35 hover:bg-blue-soft hover:text-main"
                  }`}
                >
                  {brand}
                </button>
              );
            })}
          </div>

          {selectedBrand && (
            <button
              type="button"
              onClick={onResetBrand}
              className="mt-3 text-sm font-medium text-blue-500 transition-colors hover:text-blue-400"
            >
              Сбросить бренд
            </button>
          )}
        </div>

        {visibleModelOptions.length > 0 && (
          <div>
            <div className="mb-3 text-sm font-semibold">Модель</div>

            <div className="grid gap-2">
              {visibleModelOptions.map((product) => {
                const isActive = product.slug === selectedModelSlug;

                return (
                  <button
                    key={product.slug}
                    type="button"
                    onClick={() => onSelectModel(product.slug)}
                    className={`flex items-center justify-between rounded-xl border px-4 py-3 text-left text-sm transition-colors ${
                      isActive
                        ? "border-blue-500/40 bg-blue-500/10 text-blue-500"
                        : "border-theme bg-transparent text-muted hover:border-blue-500/35 hover:bg-blue-soft hover:text-main"
                    }`}
                  >
                    <span>{product.name}</span>
                    {isActive && <span>✓</span>}
                  </button>
                );
              })}
            </div>

            {selectedModelSlug && (
              <button
                type="button"
                onClick={() => onSelectModel(selectedModelSlug)}
                className="mt-3 text-sm font-medium text-blue-500 transition-colors hover:text-blue-400"
              >
                Сбросить модель
              </button>
            )}
          </div>
        )}

        {showSpecificationFilters ? (
          <div className="rounded-2xl border border-theme bg-blue-soft p-4">
            <div className="font-semibold">
              Характеристики {activeCategoryName ? `· ${activeCategoryName}` : ""}
            </div>

            <div className="mt-5 space-y-5">
              {memoryOptions.length > 0 && (
                <FilterButtonGroup
                  title={memoryLabel}
                  options={memoryOptions}
                  selectedValue={selectedMemory}
                  disabledOptions={disabledMemoryOptions}
                  onSelect={onSelectMemory}
                />
              )}

              {colorOptions.length > 0 && (
                <div>
                  <div className="mb-3 text-sm font-semibold">Цвет</div>

                  <div className="flex flex-wrap gap-2">
                    {colorOptions.map((color) => {
                      const isActive = color.name === selectedColor;
                      const isDisabled = disabledColorOptions.includes(color.name);

                      return (
                        <button
                          key={color.name}
                          type="button"
                          disabled={isDisabled}
                          onClick={() => onSelectColor(isActive ? null : color.name)}
                          title={
                            isDisabled
                              ? "Недоступно для выбранной комбинации"
                              : undefined
                          }
                          className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm transition-all duration-300 ${
                            isActive
                              ? "border-blue-500/40 bg-blue-500/10 text-blue-500"
                              : isDisabled
                                ? "cursor-not-allowed border-theme bg-transparent text-muted-soft opacity-35"
                                : "border-theme bg-transparent text-muted hover:border-blue-500/35 hover:bg-blue-soft hover:text-main"
                          }`}
                        >
                          <span
                            className="h-4 w-4 rounded-full border border-theme"
                            style={{ backgroundColor: color.hex }}
                          />
                          {color.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {simOptions.length > 0 && (
                <FilterButtonGroup
                  title="SIM"
                  options={simOptions}
                  selectedValue={selectedSim}
                  disabledOptions={disabledSimOptions}
                  onSelect={onSelectSim}
                />
              )}

              {statusOptions.length > 0 && (
                <FilterButtonGroup
                  title="Наличие"
                  options={statusOptions}
                  selectedValue={selectedStatus}
                  disabledOptions={disabledStatusOptions}
                  onSelect={onSelectStatus}
                  getLabel={getStatusName}
                />
              )}
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-theme bg-blue-soft p-4">
            <div className="font-semibold">Умные фильтры</div>

            <p className="mt-2 text-sm leading-relaxed text-muted">
              Выберите категорию или модель. После этого появятся только нужные
              параметры: для смартфонов память, цвет и SIM, для ноутбуков —
              память/SSD и цвет.
            </p>
          </div>
        )}

        <div>
          <div className="mb-2 text-sm font-semibold">Цена</div>

          <p className="mb-3 text-xs leading-relaxed text-muted">
            Укажите диапазон, в который должна попадать цена товара.
          </p>

          <div className="grid grid-cols-2 gap-3">
            <input
              value={priceFrom}
              onChange={(event) => onPriceFromChange(event.target.value)}
              placeholder="от"
              className="h-12 rounded-xl border border-theme bg-transparent px-4 text-sm outline-none placeholder:text-muted-soft focus:border-blue-500/50"
            />

            <input
              value={priceTo}
              onChange={(event) => onPriceToChange(event.target.value)}
              placeholder="до"
              className="h-12 rounded-xl border border-theme bg-transparent px-4 text-sm outline-none placeholder:text-muted-soft focus:border-blue-500/50"
            />
          </div>
        </div>

        <div className="rounded-2xl border border-theme p-4">
          <div className="font-semibold">Результат</div>

          <p className="mt-2 text-sm leading-relaxed text-muted">
            Сейчас найдено: {resultCount}. Серые параметры недоступны для текущего
            выбора и не нажимаются.
          </p>

          <button
            type="button"
            onClick={onResetSpecifications}
            className="mt-3 text-sm font-medium text-blue-500 transition-colors hover:text-blue-400"
          >
            Сбросить характеристики
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={onClose}
        className="mt-7 w-full rounded-xl bg-blue-600 px-5 py-4 text-sm font-medium text-white transition-colors hover:bg-blue-500"
      >
        Показать товары
      </button>
    </aside>
  );
}

function FilterButtonGroup({
  title,
  options,
  selectedValue,
  disabledOptions = [],
  onSelect,
  getLabel,
}: {
  title: string;
  options: string[];
  selectedValue: string | null;
  disabledOptions?: string[];
  onSelect: (value: string | null) => void;
  getLabel?: (value: string) => string;
}) {
  return (
    <div>
      <div className="mb-3 text-sm font-semibold">{title}</div>

      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const isActive = option === selectedValue;
          const isDisabled = disabledOptions.includes(option);

          return (
            <button
              key={option}
              type="button"
              disabled={isDisabled}
              onClick={() => onSelect(isActive ? null : option)}
              title={
                isDisabled ? "Недоступно для выбранной комбинации" : undefined
              }
              className={`rounded-xl border px-3 py-2 text-sm transition-all duration-300 ${
                isActive
                  ? "border-blue-500/40 bg-blue-500/10 text-blue-500"
                  : isDisabled
                    ? "cursor-not-allowed border-theme bg-transparent text-muted-soft opacity-35"
                    : "border-theme bg-transparent text-muted hover:border-blue-500/35 hover:bg-blue-soft hover:text-main"
              }`}
            >
              {getLabel ? getLabel(option) : option}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function EmptyCatalogState({
  onReset,
}: {
  onReset: () => void;
}) {
  return (
    <div className="transition-all duration-300">
      <div className="card rounded-[34px] p-12 text-center">
        <h2 className="text-4xl font-bold tracking-[-0.04em]">
          Ничего не найдено
        </h2>

        <p className="mx-auto mt-4 max-w-[560px] text-muted">
          По выбранным фильтрам товаров нет. Попробуйте убрать цвет, память,
          SIM или изменить диапазон цены.
        </p>

        <button
          type="button"
          onClick={onReset}
          className="mt-8 inline-flex rounded-xl bg-blue-600 px-7 py-4 text-sm font-medium text-white transition-colors hover:bg-blue-500"
        >
          Сбросить параметры →
        </button>
      </div>
    </div>
  );
}
