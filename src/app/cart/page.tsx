"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { products } from "@/data/products";
import { productPositions } from "@/data/product-positions";
import { SiteHeader } from "@/components/site-header";
import { formatPrice, getPriceNumber } from "@/lib/product-pricing";

type CartItem = {
  sku: string;
  modelSlug: string;
  productName: string;
  brand: string;
  title: string;
  price: string;
  oldPrice?: string;
  memory: string;
  color: string;
  colorHex?: string;
  sim: string;
  quantity: number;
  stock?: number;
  status?: string;
};

type ProductPosition = (typeof productPositions)[number];
type ProductModel = (typeof products)[number];

type ModalType = "delivery" | "contacts" | null;
type DeliveryMethod = "courier" | "pickup" | null;

type CustomerData = {
  name: string;
  phone: string;
  email: string;
};

type DeliveryData = {
  method: DeliveryMethod;
  city: string;
  address: string;
  savedAddress: string;
  deliveryKey: string;
  deliveryTitle: string;
  pickupPointId: string;
};

type DeliveryAddress = {
  id: string;
  title: string;
  city: string;
  address: string;
  metro?: string;
  workingHours?: string;
  phone?: string;
};

type DeliveryOption = {
  key: string;
  title: string;
  type: "courier" | "pickup";
  text: string;
  addressId: string;
  address: DeliveryAddress | null;
};

type StoredProfile = Partial<CustomerData> & {
  addresses?: string[];
  deliveryAddresses?: string[];
};

const FALLBACK_PICKUP_POINT = {
  id: "fallback-pickup",
  title: "ПВЗ Netizen",
  city: "Москва",
  address: "г. Москва, ул. Тверская, 1",
  workingHours: "Ежедневно с 10:00 до 21:00",
};

const fallbackDeliveryOptions: DeliveryOption[] = [
  {
    key: "courier",
    title: "Курьерская доставка",
    type: "courier",
    text: "Доставим по адресу клиента.",
    addressId: "",
    address: null,
  },
  {
    key: "pickup_main",
    title: "Самовывоз",
    type: "pickup",
    text: "Забрать заказ из точки магазина.",
    addressId: FALLBACK_PICKUP_POINT.id,
    address: FALLBACK_PICKUP_POINT,
  },
];

const recentlyViewed = [...products].slice(0, 5);

function readJson<T>(key: string): T | null {
  try {
    const value = localStorage.getItem(key);

    if (!value) {
      return null;
    }

    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

function getStoredCartItems() {
  try {
    const savedItems = localStorage.getItem("netizen-cart-items");

    if (!savedItems) {
      return [] as CartItem[];
    }

    const parsedItems = JSON.parse(savedItems) as CartItem[];

    return Array.isArray(parsedItems) ? parsedItems : [];
  } catch {
    return [] as CartItem[];
  }
}

function saveCartItems(items: CartItem[]) {
  const normalizedItems = items.filter((item) => item.quantity > 0);
  const count = normalizedItems.reduce((sum, item) => sum + item.quantity, 0);

  localStorage.setItem("netizen-cart-items", JSON.stringify(normalizedItems));
  localStorage.setItem("netizen-cart-count", String(count));
  window.dispatchEvent(new Event("netizen-cart-updated"));
}

function getPositionBySku(sku: string) {
  return productPositions.find((position) => position.sku === sku);
}

function getProductBySlug(slug: string) {
  return products.find((product) => product.slug === slug);
}

function getStatusName(status?: string, stock?: number) {
  if (typeof stock === "number" && stock > 0) {
    return "В наличии";
  }

  const statuses: Record<string, string> = {
    active: "В наличии",
    out_of_stock: "Нет в наличии",
    preorder: "Под заказ",
    hidden: "Скрыто",
    draft: "Черновик",
  };

  return statuses[status ?? ""] ?? "Наличие уточняется";
}

function getItemStock(item: CartItem) {
  return item.stock ?? getPositionBySku(item.sku)?.stock ?? 99;
}

function getItemStatus(item: CartItem) {
  return item.status ?? getPositionBySku(item.sku)?.status;
}

function getItemLineTotal(item: CartItem) {
  return getPriceNumber(item.price) * item.quantity;
}

function getSavedProfile(): StoredProfile | undefined {
  const possibleProfiles = [
    readJson<StoredProfile>("netizen-user"),
    readJson<StoredProfile>("netizen-profile"),
    readJson<StoredProfile>("netizen-customer"),
  ].filter(Boolean) as StoredProfile[];

  return possibleProfiles.find((profile) =>
    Boolean(profile.name || profile.phone || profile.email)
  );
}

function getStoredAddresses(profile?: StoredProfile) {
  const profileAddresses = [
    ...(profile?.addresses ?? []),
    ...(profile?.deliveryAddresses ?? []),
  ];
  const savedAddresses = readJson<string[]>("netizen-delivery-addresses") ?? [];

  return Array.from(
    new Set(
      [...profileAddresses, ...savedAddresses].filter(
        (address) => typeof address === "string" && address.trim().length > 0
      )
    )
  );
}

function saveAddresses(addresses: string[]) {
  localStorage.setItem("netizen-delivery-addresses", JSON.stringify(addresses));
}

function getStoredCustomer(profile?: StoredProfile): CustomerData {
  const savedCustomer = readJson<CustomerData>("netizen-checkout-customer");

  return {
    name: profile?.name ?? savedCustomer?.name ?? "",
    phone: profile?.phone ?? savedCustomer?.phone ?? "",
    email: profile?.email ?? savedCustomer?.email ?? "",
  };
}

function getStoredDelivery(): DeliveryData {
  const savedDelivery = readJson<DeliveryData>("netizen-checkout-delivery");

  return {
    method: savedDelivery?.method ?? null,
    city: savedDelivery?.city ?? "",
    address: savedDelivery?.address ?? "",
    savedAddress: savedDelivery?.savedAddress ?? "",
    deliveryKey: savedDelivery?.deliveryKey ?? "",
    deliveryTitle: savedDelivery?.deliveryTitle ?? "",
    pickupPointId: savedDelivery?.pickupPointId ?? "",
  };
}

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartLoaded, setIsCartLoaded] = useState(false);
  const [itemPendingRemove, setItemPendingRemove] = useState<CartItem | null>(null);
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [customer, setCustomer] = useState<CustomerData>({
    name: "",
    phone: "",
    email: "",
  });
  const [delivery, setDelivery] = useState<DeliveryData>({
    method: null,
    city: "",
    address: "",
    savedAddress: "",
    deliveryKey: "",
    deliveryTitle: "",
    pickupPointId: "",
  });
  const [deliveryOptions, setDeliveryOptions] = useState<DeliveryOption[]>(fallbackDeliveryOptions);
  const [savedAddresses, setSavedAddresses] = useState<string[]>([]);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [newAddress, setNewAddress] = useState("");
  const [comment, setComment] = useState("");
  const [isOrderSent, setIsOrderSent] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");
  const [isOrderSubmitting, setIsOrderSubmitting] = useState(false);
  const [orderError, setOrderError] = useState("");
  const [recentlyAddedSku, setRecentlyAddedSku] = useState("");

  useEffect(() => {
    const profile = getSavedProfile();

    setItems(getStoredCartItems());
    setCustomer(getStoredCustomer(profile));
    setDelivery(getStoredDelivery());
    setSavedAddresses(getStoredAddresses(profile));
    setComment(localStorage.getItem("netizen-checkout-comment") ?? "");

    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data: { authenticated?: boolean }) => {
        setIsRegistered(Boolean(data.authenticated));
      })
      .catch(() => {
        setIsRegistered(false);
      })
      .finally(() => {
        setIsCartLoaded(true);
      });
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadDeliveryOptions() {
      const response = await fetch("/api/delivery-options").catch(() => null);
      const payload = (await response?.json().catch(() => null)) as
        | { deliveries?: DeliveryOption[] }
        | null;
      const nextOptions = payload?.deliveries?.length ? payload.deliveries : fallbackDeliveryOptions;

      if (isMounted) {
        setDeliveryOptions(nextOptions);
      }
    }

    void loadDeliveryOptions();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isCartLoaded) {
      return;
    }

    localStorage.setItem("netizen-checkout-customer", JSON.stringify(customer));
  }, [customer, isCartLoaded]);

  useEffect(() => {
    if (!isCartLoaded) {
      return;
    }

    localStorage.setItem("netizen-checkout-delivery", JSON.stringify(delivery));
  }, [delivery, isCartLoaded]);

  useEffect(() => {
    if (!isCartLoaded) {
      return;
    }

    localStorage.setItem("netizen-checkout-comment", comment);
  }, [comment, isCartLoaded]);

  const totalQuantity = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  );

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + getItemLineTotal(item), 0),
    [items]
  );

  const recommendationPositions = useMemo(() => {
    const cartSkus = new Set(items.map((item) => item.sku));
    const cartModels = new Set(items.map((item) => item.modelSlug));

    const availablePositions = productPositions.filter(
      (position) =>
        position.status !== "hidden" &&
        position.status !== "draft" &&
        (position.stock ?? 0) > 0 &&
        !cartSkus.has(position.sku)
    );

    const sameBrandPositions = availablePositions.filter((position) => {
      const product = getProductBySlug(position.modelSlug);
      const cartBrands = new Set(items.map((item) => item.brand));

      return product && cartBrands.has(product.brand) && !cartModels.has(position.modelSlug);
    });

    const baseList = sameBrandPositions.length > 0 ? sameBrandPositions : availablePositions;

    return baseList.slice(0, 5);
  }, [items]);

  const hasItems = items.length > 0;
  const hasGuestContacts = customer.name.trim().length > 0 && customer.phone.trim().length > 0;
  const hasCourierAddress = isRegistered
    ? delivery.savedAddress.trim().length > 0 || delivery.address.trim().length > 0
    : delivery.city.trim().length > 0 && delivery.address.trim().length > 0;
  const hasPickupAddress = delivery.method === "pickup" && delivery.address.trim().length > 0;
  const hasDelivery = hasPickupAddress || (delivery.method === "courier" && hasCourierAddress);
  const canPlaceOrder = hasItems && hasDelivery && (isRegistered || hasGuestContacts);

  const deliverySummary = getDeliverySummary(delivery, isRegistered);
  const contactSummary = isRegistered
    ? "Контакты взяты из профиля"
    : hasGuestContacts
      ? `${customer.name}, ${customer.phone}`
      : "Укажите имя и телефон";

  function updateItems(nextItems: CartItem[]) {
    setItems(nextItems);
    saveCartItems(nextItems);
  }

  function updateQuantity(sku: string, nextQuantity: number) {
    const nextItems = items.map((item) => {
      if (item.sku !== sku) {
        return item;
      }

      const stock = getItemStock(item);
      const safeQuantity = Math.min(Math.max(1, nextQuantity), Math.max(1, stock));

      return { ...item, quantity: safeQuantity };
    });

    updateItems(nextItems);
  }

  function addRecommendedPosition(position: ProductPosition) {
    const product = getProductBySlug(position.modelSlug);

    if (!product || (position.stock ?? 0) <= 0) {
      return;
    }

    const existingItem = items.find((item) => item.sku === position.sku);
    const nextItems = existingItem
      ? items.map((item) => {
          if (item.sku !== position.sku) {
            return item;
          }

          const nextQuantity = Math.min(
            item.quantity + 1,
            Math.max(1, position.stock ?? item.quantity + 1)
          );

          return { ...item, quantity: nextQuantity };
        })
      : [
          ...items,
          {
            sku: position.sku,
            modelSlug: position.modelSlug,
            productName: product.name,
            brand: product.brand,
            title: position.title,
            price: position.price,
            oldPrice: position.oldPrice,
            memory: position.memory,
            color: position.color,
            colorHex: position.colorHex,
            sim: position.sim,
            quantity: 1,
            stock: position.stock,
            status: position.status,
          },
        ];

    updateItems(nextItems);
    setRecentlyAddedSku(position.sku);
    window.setTimeout(() => setRecentlyAddedSku(""), 1400);
  }

  function removeItem(sku: string) {
    updateItems(items.filter((item) => item.sku !== sku));
    setItemPendingRemove(null);
  }

  function clearCart() {
    updateItems([]);
    setItemPendingRemove(null);
  }

  function getAddressText(address: DeliveryAddress | null | undefined) {
    if (!address) {
      return "";
    }

    return [address.city, address.address].filter(Boolean).join(", ");
  }

  function selectCourier(option: DeliveryOption) {
    setDelivery((current) => ({
      ...current,
      method: "courier",
      deliveryKey: option.key,
      deliveryTitle: option.title,
      pickupPointId: "",
      savedAddress: current.method === "courier" ? current.savedAddress : "",
    }));
  }

  function selectPickupPoint(option: DeliveryOption) {
    const address = getAddressText(option.address);

    setDelivery({
      method: "pickup",
      city: option.address?.city || "",
      address,
      savedAddress: address,
      deliveryKey: option.key,
      deliveryTitle: option.title,
      pickupPointId: option.address?.id || option.addressId || option.key,
    });
  }

  function selectSavedAddress(address: string) {
    setDelivery((current) => ({
      ...current,
      method: "courier",
      address,
      savedAddress: address,
      pickupPointId: "",
    }));
  }

  function addSavedAddress() {
    const normalizedAddress = newAddress.trim();

    if (!normalizedAddress) {
      return;
    }

    const nextAddresses = Array.from(new Set([...savedAddresses, normalizedAddress]));

    setSavedAddresses(nextAddresses);
    saveAddresses(nextAddresses);
    setNewAddress("");
    setIsAddingAddress(false);
    selectSavedAddress(normalizedAddress);
  }

  async function placeOrder() {
    if (!canPlaceOrder || isOrderSubmitting) {
      return;
    }

    setIsOrderSubmitting(true);
    setOrderError("");

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customer: isRegistered
            ? { ...customer, source: "profile" }
            : { ...customer, source: "guest" },
          delivery: {
            ...delivery,
            title: delivery.deliveryTitle || (delivery.method === "pickup" ? "ПВЗ / самовывоз" : "Курьерская доставка"),
          },
          comment,
          items,
        }),
      });

      const result = (await response.json()) as {
        ok?: boolean;
        error?: string;
        order?: { publicId?: string };
      };

      if (!response.ok || !result.ok || !result.order?.publicId) {
        throw new Error(result.error || "Не удалось создать заявку.");
      }

      const order = {
        number: result.order.publicId,
        createdAt: new Date().toISOString(),
        customer: isRegistered
          ? { ...customer, source: "profile" }
          : { ...customer, source: "guest" },
        delivery: {
          ...delivery,
          title: delivery.deliveryTitle || (delivery.method === "pickup" ? "ПВЗ / самовывоз" : "Курьерская доставка"),
        },
        payment: {
          type: "cash",
          label: "Наличными при получении",
        },
        comment,
        items,
        totalQuantity,
        subtotal,
      };

      localStorage.setItem("netizen-last-order", JSON.stringify(order));
      localStorage.removeItem("netizen-checkout-delivery");
      localStorage.removeItem("netizen-checkout-comment");
      clearCart();
      setOrderNumber(result.order.publicId);
      setIsOrderSent(true);
    } catch (error) {
      setOrderError(error instanceof Error ? error.message : "Не удалось создать заявку.");
    } finally {
      setIsOrderSubmitting(false);
    }
  }

  if (!isCartLoaded) {
    return null;
  }

  if (isOrderSent) {
    return (
      <main className="min-h-screen bg-page px-2 py-2.5 text-main transition-colors duration-700 sm:px-5 sm:py-6">
        <div className="mx-auto max-w-[1440px]">
          <SiteHeader />

          <section className="mx-auto mt-6 max-w-[760px] card rounded-[24px] p-6 text-center sm:mt-10 sm:rounded-[32px] sm:p-10">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-xl text-white sm:h-16 sm:w-16 sm:text-2xl">
              ✓
            </div>

            <h1 className="mt-4 text-3xl font-bold tracking-[-0.04em] sm:mt-6 sm:text-5xl">
              Заказ отправлен
            </h1>

            <p className="mx-auto mt-4 max-w-[560px] text-muted">
              Номер заказа: <span className="font-semibold text-main">{orderNumber}</span>.
              Менеджер свяжется с вами, подтвердит наличие, доставку и итоговую стоимость.
            </p>

            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/catalog"
                className="inline-flex justify-center rounded-xl bg-blue-600 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-500 sm:px-7 sm:py-4"
              >
                Продолжить покупки →
              </Link>

              <Link
                href="/profile"
                className="inline-flex justify-center rounded-xl border border-theme bg-transparent px-5 py-3 text-sm font-medium transition-colors hover:border-blue-500/40 hover:bg-blue-soft sm:px-7 sm:py-4"
              >
                Перейти в профиль
              </Link>
            </div>
          </section>
        </div>
      </main>
    );
  }

  if (!hasItems) {
    return (
      <main className="min-h-screen bg-page px-2 py-2.5 text-main transition-colors duration-700 sm:px-5 sm:py-6">
        <div className="mx-auto max-w-[1440px]">
          <SiteHeader />

          <section className="mt-5 card rounded-[24px] p-6 text-center sm:mt-6 sm:rounded-[32px] sm:p-10">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-xl text-white sm:h-16 sm:w-16 sm:text-2xl">
              🛒
            </div>

            <h1 className="mt-4 text-3xl font-bold tracking-[-0.04em] sm:mt-6 sm:text-5xl">
              Корзина пустая
            </h1>

            <p className="mx-auto mt-4 max-w-[560px] text-muted">
              Выберите модель, настройте цвет, память и другие параметры — после
              этого выбранная конфигурация появится здесь.
            </p>

            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/catalog"
                className="inline-flex justify-center rounded-xl bg-blue-600 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-500 sm:px-7 sm:py-4"
              >
                Перейти в каталог →
              </Link>

              <Link
                href="/new"
                className="inline-flex justify-center rounded-xl border border-theme bg-transparent px-5 py-3 text-sm font-medium transition-colors hover:border-blue-500/40 hover:bg-blue-soft sm:px-7 sm:py-4"
              >
                Смотреть новинки
              </Link>
            </div>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-page px-2 py-2.5 text-main transition-colors duration-700 sm:px-5 sm:py-6">
      <div className="mx-auto max-w-[1440px]">
        <SiteHeader />

        <div className="mt-3 sm:mt-6">
          <Link
            href="/catalog"
            className="text-sm text-blue-500 transition-colors hover:text-blue-400"
          >
            ← Вернуться в каталог
          </Link>
        </div>

        <div className="mt-3 grid items-start gap-3 lg:mt-6 lg:grid-cols-[1fr_420px] lg:gap-8">
          <div className="space-y-3 sm:space-y-6">
            <section className="card rounded-[20px] p-3 sm:rounded-[32px] sm:p-6 md:p-8">
              <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <div>
                  <h1 className="text-[24px] font-bold leading-none tracking-[-0.04em] sm:text-5xl">
                    Корзина
                  </h1>

                  <p className="mt-1 text-xs text-muted sm:mt-2 sm:text-base">
                    {totalQuantity} {totalQuantity === 1 ? "товар" : "товара"} в заказе
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:gap-3">
                  <Link
                    href="/catalog"
                    className="rounded-xl border border-theme bg-transparent px-3 py-2 text-center text-xs transition-colors hover:border-blue-500/40 hover:bg-blue-soft sm:px-5 sm:py-3 sm:text-sm"
                  >
                    Продолжить покупки
                  </Link>

                  <button
                    type="button"
                    onClick={clearCart}
                    className="rounded-xl border border-theme bg-transparent px-3 py-2 text-xs text-muted transition-colors hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-500 sm:px-5 sm:py-3 sm:text-sm"
                  >
                    Очистить корзину
                  </button>
                </div>
              </div>

              <div className="mt-3 space-y-2.5 sm:mt-8 sm:space-y-4">
                {items.map((item) => {
                  const stock = getItemStock(item);
                  const status = getItemStatus(item);
                  const canIncrease = stock <= 0 || item.quantity < stock;
                  const productHref = `/product/${item.modelSlug}?sku=${encodeURIComponent(item.sku)}`;

                  return (
                    <article
                      key={item.sku}
                      className="rounded-[18px] border border-theme bg-blue-soft p-2.5 sm:rounded-3xl sm:p-5"
                    >
                      <div className="grid grid-cols-[62px_minmax(0,1fr)] gap-2 sm:grid-cols-[110px_minmax(0,1fr)] sm:gap-4 md:grid-cols-[140px_1fr_auto] md:items-center md:gap-5">
                        <Link
                          href={productHref}
                          className="soft-box flex h-[62px] items-center justify-center rounded-2xl text-[10px] text-muted-soft sm:h-[110px] md:h-[140px] md:text-sm"
                        >
                          Фото
                        </Link>

                        <div>
                          <div className="truncate text-[10px] text-muted-soft sm:text-sm">{item.brand}</div>

                          <Link
                            href={productHref}
                            className="mt-0.5 line-clamp-2 block text-[12px] font-bold leading-tight transition-colors hover:text-blue-500 sm:mt-1 sm:text-xl"
                          >
                            {item.title || item.productName}
                          </Link>

                          <p className="mt-0.5 line-clamp-1 text-[10px] text-muted sm:mt-2 sm:text-sm">
                            {item.memory} · {item.color} · {item.sim}
                          </p>

                          <div className="mt-2 hidden flex-wrap gap-2 sm:flex sm:mt-3">
                            <span className="inline-flex rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs text-blue-500">
                              Код товара: {item.sku}
                            </span>

                            <span
                              className={`inline-flex rounded-full border px-3 py-1 text-xs ${
                                stock > 0
                                  ? "border-green-500/30 bg-green-500/10 text-green-500"
                                  : "border-orange-500/30 bg-orange-500/10 text-orange-500"
                              }`}
                            >
                              {getStatusName(status, stock)}{stock > 0 ? ` · ${stock} шт.` : ""}
                            </span>
                          </div>

                          <div className="mt-1 flex flex-wrap gap-1.5 text-[10px] text-muted-soft sm:mt-5 sm:gap-3 sm:text-sm">
                            <button className="transition-colors hover:text-blue-500">
                              В избранное
                            </button>
                            <span>·</span>
                            <button
                              type="button"
                              onClick={() => setItemPendingRemove(item)}
                              className="transition-colors hover:text-red-500"
                            >
                              Удалить
                            </button>
                          </div>
                        </div>

                        <div className="col-span-2 flex items-center justify-between gap-2 pt-1 md:col-span-1 md:flex-col md:items-end md:gap-6 md:pt-0">
                          <div className="flex items-center gap-1.5 sm:gap-3">
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.sku, item.quantity - 1)}
                              className="flex h-7 w-7 items-center justify-center rounded-xl border border-theme bg-transparent text-sm transition-colors hover:border-blue-500/40 hover:bg-blue-soft sm:h-9 sm:w-9 sm:text-lg"
                            >
                              −
                            </button>

                            <span className="w-6 text-center text-sm font-semibold sm:w-7 sm:text-base">
                              {item.quantity}
                            </span>

                            <button
                              type="button"
                              disabled={!canIncrease}
                              onClick={() => updateQuantity(item.sku, item.quantity + 1)}
                              className="flex h-7 w-7 items-center justify-center rounded-xl border border-theme bg-transparent text-sm transition-colors hover:border-blue-500/40 hover:bg-blue-soft disabled:cursor-not-allowed disabled:opacity-40 sm:h-9 sm:w-9 sm:text-lg"
                            >
                              +
                            </button>
                          </div>

                          <div className="text-right">
                            {item.oldPrice && (
                              <div className="text-[10px] text-muted-soft line-through sm:text-sm">
                                {item.oldPrice}
                              </div>
                            )}

                            <div className="text-base font-bold sm:text-xl">
                              {formatPrice(getItemLineTotal(item))}
                            </div>

                            <div className="mt-0.5 text-[10px] text-muted-soft sm:mt-1 sm:text-sm">
                              {item.price} за 1 шт.
                            </div>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>

            <section className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3">
              {!isRegistered && (
                <CheckoutCard
                  title="Данные клиента"
                  text={
                    hasGuestContacts
                      ? contactSummary
                      : "Оформление без регистрации. Укажите имя и телефон, чтобы менеджер подтвердил заказ."
                  }
                  status={hasGuestContacts ? "Заполнено" : "Заполнить"}
                  isComplete={hasGuestContacts}
                  action={hasGuestContacts ? "Изменить →" : "Контакты →"}
                  onClick={() => setActiveModal("contacts")}
                />
              )}

              <CheckoutCard
                title="Доставка"
                text={deliverySummary}
                status={hasDelivery ? "Заполнено" : "Выбрать"}
                isComplete={hasDelivery}
                action={hasDelivery ? "Изменить →" : "Доставка →"}
                onClick={() => setActiveModal("delivery")}
                className={isRegistered ? "sm:col-span-2" : ""}
              />
            </section>
          </div>

          <aside className="card h-fit rounded-[22px] p-3.5 sm:rounded-[32px] sm:p-8 lg:sticky lg:top-6">
            <h2 className="text-lg font-bold sm:text-2xl">Итого</h2>

            <div className="mt-3 space-y-2 text-xs text-muted sm:mt-6 sm:space-y-4 sm:text-base">
              <div className="flex justify-between gap-4">
                <span>Товары</span>
                <span className="text-main">{formatPrice(subtotal)}</span>
              </div>

              <div className="flex justify-between gap-4">
                <span>Количество</span>
                <span className="text-main">{totalQuantity} шт.</span>
              </div>

              <div className="flex justify-between gap-4">
                <span>Доставка</span>
                <span className="max-w-[190px] text-right text-main">{hasDelivery ? deliverySummary : "не выбрана"}</span>
              </div>

              {!isRegistered && (
                <div className="flex justify-between gap-4">
                  <span>Контакты</span>
                  <span className="max-w-[190px] text-right text-main">{hasGuestContacts ? customer.phone : "не указаны"}</span>
                </div>
              )}

              <div className="flex justify-between gap-4">
                <span>Оплата</span>
                <span className="text-main">наличными</span>
              </div>
            </div>

            <div className="mt-4 border-t border-theme pt-4 sm:mt-6 sm:pt-6">
              <div className="flex justify-between gap-4 text-base font-bold sm:text-xl">
                <span>К оплате</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
            </div>

            {!canPlaceOrder && (
              <div className="mt-4 rounded-2xl border border-orange-500/30 bg-orange-500/10 p-3 text-xs text-orange-500 sm:p-4 sm:text-sm">
                {getMissingText(hasDelivery, isRegistered, hasGuestContacts)}
              </div>
            )}

            {orderError && (
              <div className="mt-5 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-500">
                {orderError}
              </div>
            )}

            <button
              type="button"
              disabled={!canPlaceOrder || isOrderSubmitting}
              onClick={placeOrder}
              className="mt-4 flex w-full justify-center rounded-xl bg-blue-600 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-blue-600/40 disabled:text-white/60 sm:mt-6 sm:px-7 sm:py-4"
            >
              {isOrderSubmitting ? "Отправляем заявку..." : "Оформить заказ →"}
            </button>

            <p className="mt-3 text-[11px] leading-relaxed text-muted-soft sm:mt-4 sm:text-xs">
              Оплата только наличными при получении. Менеджер подтвердит наличие,
              доставку и итоговую стоимость заказа.
            </p>
          </aside>
        </div>

        <div className="mt-5 space-y-6 sm:mt-10 sm:space-y-12">
          <RecommendationStrip
            title="С этим товаром покупают"
            items={recommendationPositions}
            addedSku={recentlyAddedSku}
            onAdd={addRecommendedPosition}
          />
          <ProductStrip title="Вы смотрели" items={recentlyViewed} />
        </div>
      </div>

      {activeModal === "delivery" && (
        <Modal title="Получение заказа" onClose={() => setActiveModal(null)}>
          <div className="grid gap-4 md:grid-cols-2">
            {deliveryOptions.map((option) => (
              <button
                key={option.key}
                type="button"
                onClick={() => option.type === "courier" ? selectCourier(option) : selectPickupPoint(option)}
                className={`rounded-2xl border p-5 text-left transition-all ${
                  delivery.deliveryKey === option.key || (!delivery.deliveryKey && delivery.method === option.type)
                    ? "border-blue-500/50 bg-blue-500/10"
                    : "border-theme bg-blue-soft hover:border-blue-500/30"
                }`}
              >
                <div className="font-semibold">{option.title}</div>
                <p className="mt-2 text-sm text-muted">{option.text}</p>
                {option.type === "pickup" && option.address && (
                  <p className="mt-3 text-xs text-muted-soft">
                    {getAddressText(option.address)}
                  </p>
                )}
              </button>
            ))}
          </div>

          {delivery.method === "pickup" && (
            <div className="mt-5 rounded-2xl border border-blue-500/30 bg-blue-500/10 p-5">
              <div className="text-sm uppercase tracking-[0.18em] text-blue-500">
                Адрес ПВЗ
              </div>
              <div className="mt-2 text-xl font-bold">{delivery.deliveryTitle || "Самовывоз"}</div>
              <p className="mt-2 text-muted">{delivery.address}</p>
              <p className="mt-1 text-sm text-muted-soft">Адрес берётся из настроек сайта.</p>
            </div>
          )}

          {delivery.method === "courier" && (
            <div className="mt-5 space-y-4">
              {isRegistered ? (
                <>
                  <div>
                    <div className="font-semibold">Адрес доставки</div>
                    <p className="mt-1 text-sm text-muted">
                      Выберите сохранённый адрес или добавьте новый.
                    </p>
                  </div>

                  {savedAddresses.length > 0 && (
                    <div className="grid gap-3">
                      {savedAddresses.map((address) => (
                        <button
                          key={address}
                          type="button"
                          onClick={() => selectSavedAddress(address)}
                          className={`rounded-2xl border p-4 text-left text-sm transition-all ${
                            delivery.savedAddress === address || delivery.address === address
                              ? "border-blue-500/50 bg-blue-500/10"
                              : "border-theme bg-blue-soft hover:border-blue-500/30"
                          }`}
                        >
                          {address}
                        </button>
                      ))}
                    </div>
                  )}

                  {isAddingAddress ? (
                    <div className="rounded-2xl border border-theme bg-blue-soft p-4">
                      <input
                        value={newAddress}
                        onChange={(event) => setNewAddress(event.target.value)}
                        placeholder="Новый адрес доставки"
                        className="h-12 w-full rounded-xl border border-theme bg-transparent px-4 outline-none placeholder:text-muted-soft focus:border-blue-500/50"
                      />

                      <div className="mt-3 flex gap-3">
                        <button
                          type="button"
                          onClick={addSavedAddress}
                          className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-500"
                        >
                          Сохранить адрес
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setIsAddingAddress(false);
                            setNewAddress("");
                          }}
                          className="rounded-xl border border-theme bg-transparent px-3 py-2 text-center text-xs transition-colors hover:border-blue-500/40 hover:bg-blue-soft sm:px-5 sm:py-3 sm:text-sm"
                        >
                          Отмена
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsAddingAddress(true)}
                      className="w-full rounded-xl border border-theme bg-transparent px-5 py-3 text-sm font-medium transition-colors hover:border-blue-500/40 hover:bg-blue-soft"
                    >
                      Добавить адрес
                    </button>
                  )}
                </>
              ) : (
                <>
                  <div>
                    <div className="font-semibold">Адрес доставки</div>
                    <p className="mt-1 text-sm text-muted">
                      Для гостя достаточно указать город и адрес, куда нужно привезти заказ.
                    </p>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    <input
                      value={delivery.city}
                      onChange={(event) =>
                        setDelivery((current) => ({ ...current, method: "courier", city: event.target.value }))
                      }
                      placeholder="Город"
                      className="h-12 rounded-xl border border-theme bg-transparent px-4 outline-none placeholder:text-muted-soft focus:border-blue-500/50"
                    />

                    <input
                      value={delivery.address}
                      onChange={(event) =>
                        setDelivery((current) => ({ ...current, method: "courier", address: event.target.value, savedAddress: "" }))
                      }
                      placeholder="Улица, дом, квартира"
                      className="h-12 rounded-xl border border-theme bg-transparent px-4 outline-none placeholder:text-muted-soft focus:border-blue-500/50"
                    />
                  </div>
                </>
              )}
            </div>
          )}

          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={() => setActiveModal(null)}
              disabled={!hasDelivery}
              className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-blue-600/40 disabled:text-white/60"
            >
              Сохранить доставку
            </button>
          </div>
        </Modal>
      )}

      {activeModal === "contacts" && !isRegistered && (
        <Modal title="Контакты для заказа" onClose={() => setActiveModal(null)}>
          <p className="text-sm text-muted">
            Контакты нужны только для гостевого заказа. У зарегистрированного клиента
            этот блок скрыт, потому что данные берутся из профиля.
          </p>

          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <input
              value={customer.name}
              onChange={(event) => setCustomer((current) => ({ ...current, name: event.target.value }))}
              placeholder="Ваше имя"
              className="h-12 rounded-xl border border-theme bg-transparent px-4 outline-none placeholder:text-muted-soft focus:border-blue-500/50"
            />

            <input
              value={customer.phone}
              onChange={(event) => setCustomer((current) => ({ ...current, phone: event.target.value }))}
              placeholder="Телефон"
              className="h-12 rounded-xl border border-theme bg-transparent px-4 outline-none placeholder:text-muted-soft focus:border-blue-500/50"
            />

            <input
              value={customer.email}
              onChange={(event) => setCustomer((current) => ({ ...current, email: event.target.value }))}
              placeholder="E-mail, если удобно"
              className="h-12 rounded-xl border border-theme bg-transparent px-4 outline-none placeholder:text-muted-soft focus:border-blue-500/50 md:col-span-2"
            />
          </div>

          <textarea
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            placeholder="Комментарий к заказу"
            rows={4}
            className="mt-3 w-full rounded-xl border border-theme bg-transparent px-4 py-3 outline-none placeholder:text-muted-soft focus:border-blue-500/50"
          />

          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={() => setActiveModal(null)}
              disabled={!hasGuestContacts}
              className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-blue-600/40 disabled:text-white/60"
            >
              Сохранить контакты
            </button>
          </div>
        </Modal>
      )}

      {itemPendingRemove && (
        <Modal title="Удалить товар?" onClose={() => setItemPendingRemove(null)}>
          <p className="text-muted">
            {itemPendingRemove.title} будет удалён из корзины.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => setItemPendingRemove(null)}
              className="flex-1 rounded-xl border border-theme bg-transparent px-6 py-4 text-sm font-medium transition-colors hover:border-blue-500/40 hover:bg-blue-soft"
            >
              Оставить
            </button>

            <button
              type="button"
              onClick={() => removeItem(itemPendingRemove.sku)}
              className="flex-1 rounded-xl bg-red-500 px-6 py-4 text-sm font-medium text-white transition-colors hover:bg-red-400"
            >
              Удалить
            </button>
          </div>
        </Modal>
      )}
    </main>
  );
}

function getDeliverySummary(delivery: DeliveryData, isRegistered: boolean) {
  if (delivery.method === "pickup") {
    return `${delivery.deliveryTitle || "Самовывоз"}: ${delivery.address || "адрес не выбран"}`;
  }

  if (delivery.method === "courier") {
    if (isRegistered && (delivery.savedAddress || delivery.address)) {
      return delivery.savedAddress || delivery.address;
    }

    if (delivery.city && delivery.address) {
      return `${delivery.city}, ${delivery.address}`;
    }

    return `${delivery.deliveryTitle || "Курьерская доставка"}: адрес не указан`;
  }

  return "Выберите курьера или ПВЗ";
}

function getMissingText(
  hasDelivery: boolean,
  isRegistered: boolean,
  hasGuestContacts: boolean
) {
  if (!hasDelivery && !isRegistered && !hasGuestContacts) {
    return "Чтобы оформить заказ, выберите доставку и заполните контакты.";
  }

  if (!hasDelivery) {
    return "Чтобы оформить заказ, выберите способ получения заказа.";
  }

  if (!isRegistered && !hasGuestContacts) {
    return "Чтобы оформить заказ, укажите имя и телефон.";
  }

  return "Заполните обязательные данные.";
}

function CheckoutCard({
  title,
  text,
  status,
  isComplete,
  action,
  onClick,
  className = "",
}: {
  title: string;
  text: string;
  status: string;
  isComplete: boolean;
  action: string;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`card flex min-h-[110px] w-full flex-col justify-between rounded-[20px] p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-500/30 hover:bg-blue-soft ${className}`}
    >
      <div className="w-full min-w-0">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0 flex-1 truncate text-[15px] font-bold leading-snug">{title}</div>
          <span
            className={`shrink-0 rounded-full border px-2.5 py-0.5 text-[11px] font-medium leading-5 ${
              isComplete
                ? "border-green-500/30 bg-green-500/10 text-green-500"
                : "border-orange-500/30 bg-orange-500/10 text-orange-500"
            }`}
          >
            {status}
          </span>
        </div>

        <p className="mt-2 line-clamp-2 text-[13px] leading-relaxed text-muted">{text}</p>
      </div>

      <div className="mt-3 text-[13px] font-medium text-blue-500">{action}</div>
    </button>
  );
}

function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 px-4 py-4 backdrop-blur-sm md:items-center md:px-6">
      <div className="card max-h-[92vh] w-full max-w-[720px] overflow-y-auto rounded-[24px] p-5 shadow-[0_30px_120px_rgba(0,102,255,0.25)] sm:rounded-[28px] sm:p-6 md:p-8">
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-2xl font-bold tracking-[-0.04em] sm:text-3xl">{title}</h2>

          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-theme bg-transparent text-xl transition-colors hover:border-blue-500/40 hover:bg-blue-soft"
            aria-label="Закрыть"
          >
            ×
          </button>
        </div>

        <div className="mt-3 sm:mt-6">{children}</div>
      </div>
    </div>
  );
}

function RecommendationStrip({
  title,
  items,
  addedSku,
  onAdd,
}: {
  title: string;
  items: ProductPosition[];
  addedSku: string;
  onAdd: (position: ProductPosition) => void;
}) {
  if (items.length === 0) {
    return null;
  }

  return (
    <section>
      <h2 className="text-2xl font-bold">{title}</h2>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:mt-5 sm:grid-cols-2 sm:gap-5 md:grid-cols-3 xl:grid-cols-5">
        {items.map((position) => {
          const product = getProductBySlug(position.modelSlug);
          const isAdded = addedSku === position.sku;

          if (!product) {
            return null;
          }

          return (
            <article
              key={position.sku}
              className="card rounded-[20px] p-3 transition-all duration-300 hover:-translate-y-1 hover:border-blue-500/35 hover:bg-blue-soft sm:rounded-3xl sm:p-4"
            >
              <div className="soft-box flex h-[108px] items-center justify-center rounded-2xl text-xs text-muted-soft sm:h-[150px] sm:text-sm">
                Фото
              </div>

              <div className="pt-4">
                <div className="text-sm text-muted-soft">{product.brand}</div>

                <h3 className="mt-1 line-clamp-2 text-sm font-bold leading-tight sm:min-h-[40px] sm:text-base">
                  {position.title}
                </h3>

                <div className="mt-2 flex flex-wrap gap-1 text-xs text-muted-soft">
                  <span>{position.memory}</span>
                  <span>·</span>
                  <span>{position.color}</span>
                  <span>·</span>
                  <span>{position.sim}</span>
                </div>

                <p className="mt-3 text-base font-bold">{position.price}</p>

                {position.oldPrice && (
                  <p className="text-xs text-muted-soft line-through">{position.oldPrice}</p>
                )}

                <button
                  type="button"
                  onClick={() => onAdd(position)}
                  className={`mt-4 flex w-full items-center justify-center rounded-xl py-3 text-sm font-medium text-white transition-colors ${
                    isAdded
                      ? "bg-green-500 hover:bg-green-500"
                      : "bg-blue-600 hover:bg-blue-500"
                  }`}
                >
                  {isAdded ? "Добавлено ✓" : "В корзину"}
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function ProductStrip({
  title,
  items,
}: {
  title: string;
  items: ProductModel[];
}) {
  return (
    <section>
      <h2 className="text-2xl font-bold">{title}</h2>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:mt-5 sm:grid-cols-2 sm:gap-5 md:grid-cols-3 xl:grid-cols-5">
        {items.map((product, index) => (
          <Link
            key={`${product.slug}-${index}`}
            href={`/product/${product.slug}`}
            className="card group rounded-[20px] p-3 transition-all duration-300 hover:-translate-y-1 hover:border-blue-500/35 hover:bg-blue-soft sm:rounded-3xl sm:p-4"
          >
            <div className="soft-box flex h-[108px] items-center justify-center rounded-2xl text-xs text-muted-soft sm:h-[150px] sm:text-sm">
              Фото
            </div>

            <div className="pt-4">
              <div className="text-sm text-muted-soft">{product.brand}</div>

              <h3 className="mt-1 line-clamp-2 font-bold leading-tight">
                {product.name}
              </h3>

              <p className="mt-1 text-sm text-muted">{product.price}</p>

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
