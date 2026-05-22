"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { products } from "@/data/products";
import { formatPrice, getModelPriceRange } from "@/lib/product-pricing";

type CustomerProfile = {
  name: string;
  phone: string;
  email: string;
};

type OrderItem = {
  sku: string;
  title: string;
  productName?: string;
  price: string;
  quantity: number;
  memory?: string;
  color?: string;
  sim?: string;
};

type StoredOrder = {
  number: string;
  createdAt: string;
  subtotal: number;
  totalQuantity: number;
  delivery?: {
    title?: string;
    method?: string;
    address?: string;
    savedAddress?: string;
    city?: string;
  };
  payment?: {
    label?: string;
  };
  items: OrderItem[];
};

type ModalType = "profile" | "address" | null;

const supportRequests = [
  {
    topic: "Подбор техники",
    text: "Нужен смартфон для фото и видео.",
    status: "В работе",
  },
  {
    topic: "Доставка",
    text: "Уточнение по адресу доставки.",
    status: "Закрыто",
  },
];

const emptyProfile: CustomerProfile = {
  name: "",
  phone: "",
  email: "",
};

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

function writeJson<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Дата не указана";
  }

  return date.toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function getOrderDelivery(order: StoredOrder) {
  if (!order.delivery) {
    return "Доставка не указана";
  }

  if (order.delivery.method === "pickup") {
    return order.delivery.address || order.delivery.savedAddress || "ПВЗ / самовывоз";
  }

  if (order.delivery.savedAddress || order.delivery.address) {
    return order.delivery.savedAddress || order.delivery.address || "Курьерская доставка";
  }

  return order.delivery.title || "Курьерская доставка";
}

function getInitialLetter(name: string) {
  const trimmedName = name.trim();

  if (!trimmedName) {
    return "Н";
  }

  return trimmedName[0]?.toUpperCase() ?? "Н";
}

export default function ProfilePage() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [profile, setProfile] = useState<CustomerProfile>(emptyProfile);
  const [draftProfile, setDraftProfile] = useState<CustomerProfile>(emptyProfile);
  const [addresses, setAddresses] = useState<string[]>([]);
  const [newAddress, setNewAddress] = useState("");
  const [orders, setOrders] = useState<StoredOrder[]>([]);
  const [favoriteSlugs, setFavoriteSlugs] = useState<string[]>([]);
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [isProfileSaved, setIsProfileSaved] = useState(false);

  useEffect(() => {
    const savedProfile =
      readJson<Partial<CustomerProfile>>("netizen-profile") ??
      readJson<Partial<CustomerProfile>>("netizen-user") ??
      readJson<Partial<CustomerProfile>>("netizen-customer") ??
      emptyProfile;

    const normalizedProfile = {
      name: savedProfile.name ?? "",
      phone: savedProfile.phone ?? "",
      email: savedProfile.email ?? "",
    };

    const savedAddresses = readJson<string[]>("netizen-delivery-addresses") ?? [];
    const orderHistory = readJson<StoredOrder[]>("netizen-orders") ?? [];
    const lastOrder = readJson<StoredOrder>("netizen-last-order");
    const savedFavoriteSlugs = readJson<string[]>("netizen-favorite-slugs") ?? [];

    setProfile(normalizedProfile);
    setDraftProfile(normalizedProfile);
    setAddresses(savedAddresses);
    setFavoriteSlugs(savedFavoriteSlugs);

    if (lastOrder && !orderHistory.some((order) => order.number === lastOrder.number)) {
      setOrders([lastOrder, ...orderHistory]);
    } else {
      setOrders(orderHistory);
    }

    setIsLoaded(true);
  }, []);

  const favoriteProducts = useMemo(
    () => products.filter((product) => favoriteSlugs.includes(product.slug)),
    [favoriteSlugs]
  );

  const previewFavorites = favoriteProducts.slice(0, 4);

  function saveProfile() {
    const normalizedProfile = {
      name: draftProfile.name.trim(),
      phone: draftProfile.phone.trim(),
      email: draftProfile.email.trim(),
    };

    setProfile(normalizedProfile);
    writeJson("netizen-profile", normalizedProfile);
    setIsProfileSaved(true);
    setActiveModal(null);

    window.setTimeout(() => setIsProfileSaved(false), 1800);
  }

  function addAddress() {
    const normalizedAddress = newAddress.trim();

    if (!normalizedAddress) {
      return;
    }

    const nextAddresses = Array.from(new Set([...addresses, normalizedAddress]));

    setAddresses(nextAddresses);
    writeJson("netizen-delivery-addresses", nextAddresses);
    setNewAddress("");
    setActiveModal(null);
  }

  function removeFavorite(slug: string) {
    const nextFavoriteSlugs = favoriteSlugs.filter((item) => item !== slug);

    setFavoriteSlugs(nextFavoriteSlugs);
    writeJson("netizen-favorite-slugs", nextFavoriteSlugs);
  }

  if (!isLoaded) {
    return null;
  }

  return (
    <main className="min-h-screen bg-page px-4 py-4 text-main transition-colors duration-700 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1760px]">
        <SiteHeader />

        <div className="mt-6">
          <Link
            href="/"
            className="text-sm text-blue-500 transition-colors hover:text-blue-400"
          >
            ← На главную
          </Link>
        </div>

        <section className="mt-6 grid gap-8 lg:grid-cols-[1fr_360px] lg:items-start">
          <div className="space-y-8">
            <section className="card rounded-[28px] p-6">
              <div className="inline-flex rounded-full border border-blue-500/35 bg-blue-500/10 px-4 py-2 text-sm font-medium text-blue-500">
                Личный кабинет
              </div>

              <h1 className="mt-4 max-w-[760px] text-4xl font-bold tracking-[-0.05em]">
                Ваши заказы, данные и обращения
              </h1>

              <p className="mt-4 max-w-[620px] text-sm leading-relaxed text-muted">
                Здесь будет храниться история заявок, адреса доставки,
                избранные товары и переписка с поддержкой.
              </p>

              <div className="mt-6 flex flex-wrap gap-4">
                <Link
                  href="/catalog"
                  className="rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-medium text-white transition-colors hover:bg-blue-500"
                >
                  Перейти в каталог →
                </Link>

                <Link
                  href="/help"
                  className="rounded-xl border border-theme bg-transparent px-6 py-3.5 text-sm font-medium transition-colors hover:border-blue-500/40 hover:bg-blue-soft"
                >
                  Написать в поддержку
                </Link>
              </div>
            </section>

            <section className="card rounded-[34px] p-8">
              <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                  <div className="text-sm font-medium uppercase tracking-[0.2em] text-blue-500">
                    Заказы
                  </div>

                  <h2 className="mt-3 text-4xl font-bold tracking-[-0.045em]">
                    Мои заявки
                  </h2>
                </div>

                <Link
                  href="/cart"
                  className="text-sm font-medium text-blue-500 transition-colors hover:text-blue-400"
                >
                  Оформить новую заявку →
                </Link>
              </div>

              {orders.length > 0 ? (
                <div className="mt-8 grid gap-4">
                  {orders.map((order) => (
                    <article
                      key={order.number}
                      className="rounded-2xl border border-theme bg-blue-soft p-5"
                    >
                      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                        <div>
                          <div className="text-sm text-muted">{order.number}</div>

                          <h3 className="mt-1 text-xl font-bold">
                            {order.items[0]?.productName ||
                              order.items[0]?.title ||
                              `${order.totalQuantity} товар(ов)`}
                          </h3>

                          <p className="mt-2 text-sm text-muted">
                            {formatDate(order.createdAt)} · {formatPrice(order.subtotal)}
                          </p>

                          <p className="mt-1 text-sm text-muted">
                            {getOrderDelivery(order)}
                          </p>
                        </div>

                        <div className="flex flex-col gap-3 md:items-end">
                          <span className="w-fit rounded-full border border-blue-500/35 bg-blue-500/10 px-4 py-2 text-sm font-medium text-blue-500">
                            Ожидает подтверждения
                          </span>

                          <button className="text-sm font-medium text-blue-500 transition-colors hover:text-blue-400">
                            Подробнее →
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="Заявок пока нет"
                  text="Когда клиент оформит заказ из корзины, заявка появится здесь."
                  href="/catalog"
                  action="Перейти в каталог →"
                />
              )}
            </section>

            <section id="favorites" className="card rounded-[34px] p-8">
              <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                  <div className="text-sm font-medium uppercase tracking-[0.2em] text-blue-500">
                    Избранное
                  </div>

                  <h2 className="mt-3 text-4xl font-bold tracking-[-0.045em]">
                    Избранные товары
                  </h2>
                </div>

                <Link
                  href="/catalog"
                  className="text-sm font-medium text-blue-500 transition-colors hover:text-blue-400"
                >
                  Добавить товары →
                </Link>
              </div>

              {previewFavorites.length > 0 ? (
                <div className="mt-6 grid gap-4 sm:mt-8 sm:grid-cols-2">
                  {previewFavorites.map((product) => (
                    <article
                      key={product.slug}
                      className="rounded-2xl border border-theme bg-transparent p-5 transition-colors hover:border-blue-500/35 hover:bg-blue-soft"
                    >
                      <div className="flex gap-5">
                        <div className="soft-box flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl text-xs text-muted-soft">
                          Фото
                        </div>

                        <div className="flex min-w-0 flex-1 flex-col">
                          <h3 className="text-lg font-bold leading-tight">
                            {product.name}
                          </h3>

                          <p className="mt-2 text-sm text-muted">
                            {getModelPriceRange(product.slug, product.price)}
                          </p>

                          <div className="mt-auto flex flex-wrap gap-4 pt-5 text-sm font-medium">
                            <Link
                              href={`/product/${product.slug}`}
                              className="text-blue-500 transition-colors hover:text-blue-400"
                            >
                              Перейти →
                            </Link>

                            <button
                              type="button"
                              onClick={() => removeFavorite(product.slug)}
                              className="text-muted transition-colors hover:text-main"
                            >
                              Убрать
                            </button>
                          </div>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="Избранных товаров пока нет"
                  text="Избранное скрыто внутри личного кабинета. Клиент сможет добавлять сюда модели из карточки товара."
                  href="/catalog"
                  action="Перейти в каталог →"
                />
              )}
            </section>

            <section className="card rounded-[34px] p-8">
              <div className="text-sm font-medium uppercase tracking-[0.2em] text-blue-500">
                Поддержка
              </div>

              <h2 className="mt-3 text-4xl font-bold tracking-[-0.045em]">
                Обращения
              </h2>

              <div className="mt-8 grid gap-4">
                {supportRequests.map((request) => (
                  <article
                    key={request.topic}
                    className="rounded-2xl border border-theme bg-transparent p-5"
                  >
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div>
                        <h3 className="text-xl font-bold">{request.topic}</h3>

                        <p className="mt-2 text-sm leading-relaxed text-muted">
                          {request.text}
                        </p>
                      </div>

                      <span className="w-fit rounded-full border border-theme px-4 py-2 text-sm text-muted">
                        {request.status}
                      </span>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </div>

          <aside className="space-y-6 xl:sticky xl:top-6 xl:space-y-8">
            <section className="card rounded-[28px] p-7">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 text-2xl font-bold text-white">
                  {getInitialLetter(profile.name)}
                </div>

                <div>
                  <div className="text-sm text-muted">Профиль</div>
                  <h2 className="text-2xl font-bold">
                    {profile.name || "Гость Нетизен"}
                  </h2>
                </div>
              </div>

              <div className="mt-7 space-y-4">
                <ProfileField label="Имя" value={profile.name || "Не указано"} />
                <ProfileField label="Телефон" value={profile.phone || "Не указан"} />
                <ProfileField label="E-mail" value={profile.email || "Не указан"} />
              </div>

              <button
                type="button"
                onClick={() => {
                  setDraftProfile(profile);
                  setActiveModal("profile");
                }}
                className="mt-7 w-full rounded-xl bg-blue-600 px-6 py-4 text-sm font-medium text-white transition-colors hover:bg-blue-500"
              >
                Редактировать данные
              </button>

              {isProfileSaved && (
                <div className="mt-4 rounded-2xl border border-green-500/30 bg-green-500/10 p-3 text-sm text-green-500">
                  Данные сохранены
                </div>
              )}
            </section>

            <section className="card rounded-[34px] p-8">
              <div className="text-sm font-medium uppercase tracking-[0.2em] text-blue-500">
                Доставка
              </div>

              <h2 className="mt-3 text-3xl font-bold tracking-[-0.04em]">
                Адреса
              </h2>

              {addresses.length > 0 ? (
                <div className="mt-6 grid gap-3">
                  {addresses.slice(0, 3).map((address) => (
                    <div
                      key={address}
                      className="rounded-2xl border border-theme bg-blue-soft p-4 text-sm"
                    >
                      {address}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-5 rounded-2xl border border-theme bg-blue-soft p-4 text-sm text-muted">
                  Адреса пока не добавлены.
                </p>
              )}

              <button
                type="button"
                onClick={() => setActiveModal("address")}
                className="mt-6 w-full rounded-xl border border-theme bg-transparent px-5 py-3 text-sm font-medium transition-colors hover:border-blue-500/40 hover:bg-blue-soft"
              >
                Добавить адрес
              </button>
            </section>

            <section className="card rounded-[34px] p-8">
              <div className="text-sm font-medium uppercase tracking-[0.2em] text-blue-500">
                Быстро
              </div>

              <h2 className="mt-3 text-3xl font-bold tracking-[-0.04em]">
                Действия
              </h2>

              <div className="mt-6 grid gap-3">
                <Link
                  href="/cart"
                  className="rounded-xl bg-blue-600 px-5 py-3 text-center text-sm font-medium text-white transition-colors hover:bg-blue-500"
                >
                  Новая заявка →
                </Link>

                <Link
                  href="#favorites"
                  className="rounded-xl border border-theme bg-transparent px-5 py-3 text-center text-sm font-medium transition-colors hover:border-blue-500/40 hover:bg-blue-soft"
                >
                  Избранные товары
                </Link>

                <Link
                  href="/help"
                  className="rounded-xl border border-theme bg-transparent px-5 py-3 text-center text-sm font-medium transition-colors hover:border-blue-500/40 hover:bg-blue-soft"
                >
                  Поддержка
                </Link>
              </div>
            </section>
          </aside>
        </section>
      </div>

      {activeModal === "profile" && (
        <Modal title="Данные профиля" onClose={() => setActiveModal(null)}>
          <div className="grid gap-4">
            <label className="grid gap-2 text-sm font-medium">
              Имя
              <input
                value={draftProfile.name}
                onChange={(event) =>
                  setDraftProfile((current) => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
                placeholder="Например, Иван"
                className="h-12 rounded-xl border border-theme bg-transparent px-4 outline-none placeholder:text-muted-soft focus:border-blue-500/50"
              />
            </label>

            <label className="grid gap-2 text-sm font-medium">
              Телефон
              <input
                value={draftProfile.phone}
                onChange={(event) =>
                  setDraftProfile((current) => ({
                    ...current,
                    phone: event.target.value,
                  }))
                }
                placeholder="+7 999 000-00-00"
                className="h-12 rounded-xl border border-theme bg-transparent px-4 outline-none placeholder:text-muted-soft focus:border-blue-500/50"
              />
            </label>

            <label className="grid gap-2 text-sm font-medium">
              E-mail
              <input
                value={draftProfile.email}
                onChange={(event) =>
                  setDraftProfile((current) => ({
                    ...current,
                    email: event.target.value,
                  }))
                }
                placeholder="mail@example.com"
                className="h-12 rounded-xl border border-theme bg-transparent px-4 outline-none placeholder:text-muted-soft focus:border-blue-500/50"
              />
            </label>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={saveProfile}
              className="rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-medium text-white transition-colors hover:bg-blue-500"
            >
              Сохранить
            </button>

            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="rounded-xl border border-theme bg-transparent px-6 py-3.5 text-sm font-medium transition-colors hover:border-blue-500/40 hover:bg-blue-soft"
            >
              Отмена
            </button>
          </div>
        </Modal>
      )}

      {activeModal === "address" && (
        <Modal title="Добавить адрес" onClose={() => setActiveModal(null)}>
          <label className="grid gap-2 text-sm font-medium">
            Адрес доставки
            <input
              value={newAddress}
              onChange={(event) => setNewAddress(event.target.value)}
              placeholder="Город, улица, дом, квартира"
              className="h-12 rounded-xl border border-theme bg-transparent px-4 outline-none placeholder:text-muted-soft focus:border-blue-500/50"
            />
          </label>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={addAddress}
              className="rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-medium text-white transition-colors hover:bg-blue-500"
            >
              Сохранить адрес
            </button>

            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="rounded-xl border border-theme bg-transparent px-6 py-3.5 text-sm font-medium transition-colors hover:border-blue-500/40 hover:bg-blue-soft"
            >
              Отмена
            </button>
          </div>
        </Modal>
      )}
    </main>
  );
}

function ProfileField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-theme bg-blue-soft p-4">
      <div className="text-sm text-muted">{label}</div>
      <div className="mt-1 font-semibold">{value}</div>
    </div>
  );
}

function EmptyState({
  title,
  text,
  href,
  action,
}: {
  title: string;
  text: string;
  href: string;
  action: string;
}) {
  return (
    <div className="mt-8 rounded-2xl border border-theme bg-blue-soft p-6">
      <h3 className="text-xl font-bold">{title}</h3>
      <p className="mt-2 max-w-[520px] text-sm leading-relaxed text-muted">{text}</p>
      <Link
        href={href}
        className="mt-5 inline-flex rounded-xl bg-blue-600 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-500"
      >
        {action}
      </Link>
    </div>
  );
}

function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4 py-8 backdrop-blur-sm">
      <div className="card w-full max-w-[560px] rounded-[24px] p-4 shadow-2xl sm:rounded-[28px] sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-sm font-medium uppercase tracking-[0.2em] text-blue-500">
              Личный кабинет
            </div>
            <h2 className="mt-2 text-3xl font-bold tracking-[-0.04em]">{title}</h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-theme text-lg transition-colors hover:border-blue-500/40 hover:bg-blue-soft"
            aria-label="Закрыть"
          >
            ×
          </button>
        </div>

        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}
