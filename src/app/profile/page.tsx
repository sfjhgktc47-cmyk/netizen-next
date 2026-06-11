"use client";

import Link from "next/link";
import Image from 'next/image';
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/site-header";

type CustomerProfile = {
  id: string;
  name: string;
  lastName: string;
  phone: string;
  email: string;
};

type ProfileOrderItem = {
  id: string;
  title: string;
  productTitle: string;
  brand: string;
  sku: string;
  memory: string;
  color: string;
  sim: string;
  image: string;
  quantity: number;
  price: number;
};

type ProfileOrder = {
  id: string;
  publicId: string;
  createdAt: string;
  total: number;
  status: string;
  delivery: string;
  items: ProfileOrderItem[];
};

type ProfileAddress = {
  id: string;
  value: string;
  type: "courier" | "pickup";
  isDefault: boolean;
};

type ProfileSupportRequest = {
  id: string;
  publicId: string;
  topic: string;
  message: string;
  status: string;
  createdAt: string;
  updatedAt: string;
};

type ProfileFavorite = {
  id: string;
  product: {
    slug: string;
    name: string;
    brand: string;
    image: string;
  };
};

type ProfileData = {
  profile: CustomerProfile;
  orders: ProfileOrder[];
  addresses: ProfileAddress[];
  supportRequests: ProfileSupportRequest[];
  favorites: ProfileFavorite[];
};

type ModalType = "profile" | "address" | null;

const emptyProfile: CustomerProfile = {
  id: "",
  name: "",
  lastName: "",
  phone: "",
  email: "",
};

function formatPrice(value: number) {
  return new Intl.NumberFormat("ru-RU").format(value) + " ₽";
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

function getInitialLetter(profile: CustomerProfile) {
  const source = profile.name || profile.lastName || profile.phone || profile.email || "Н";
  return source.trim()[0]?.toUpperCase() ?? "Н";
}

function getFullName(profile: CustomerProfile) {
  return [profile.name, profile.lastName].filter(Boolean).join(" ").trim();
}

function getOrderTitle(order: ProfileOrder) {
  const firstItem = order.items[0];

  if (!firstItem) {
    return "Заявка без товаров";
  }

  return firstItem.productTitle || firstItem.title || `${order.items.length} товар(ов)`;
}

function getOrderStatusLabel(status: string) {
  const labels: Record<string, string> = {
    new: "Ожидает подтверждения",
    confirming: "Подтверждается",
    in_work: "В работе",
    ready: "Готов к выдаче",
    completed: "Завершён",
    cancelled: "Отменён",
  };

  return labels[status] ?? status;
}

function getSupportStatusLabel(status: string) {
  const labels: Record<string, string> = {
    new: "Новое",
    in_work: "В работе",
    waiting_client: "Ожидает клиента",
    closed: "Закрыто",
  };

  return labels[status] ?? status;
}

export default function ProfilePage() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [profile, setProfile] = useState<CustomerProfile>(emptyProfile);
  const [draftProfile, setDraftProfile] = useState<CustomerProfile>(emptyProfile);
  const [orders, setOrders] = useState<ProfileOrder[]>([]);
  const [addresses, setAddresses] = useState<ProfileAddress[]>([]);
  const [supportRequests, setSupportRequests] = useState<ProfileSupportRequest[]>([]);
  const [favorites, setFavorites] = useState<ProfileFavorite[]>([]);
  const [newAddress, setNewAddress] = useState("");
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [isProfileSaved, setIsProfileSaved] = useState(false);
  const [error, setError] = useState("");

  async function loadProfileState() {
    try {
      const meResponse = await fetch("/api/auth/me", { cache: "no-store" });
      const meData = (await meResponse.json().catch(() => ({}))) as {
        authenticated?: boolean;
        user?: { role?: "customer" | "admin" };
      };

      if (meData.authenticated && meData.user?.role === "admin") {
        window.location.href = "/nz-console";
        return;
      }

      if (!meData.authenticated || meData.user?.role !== "customer") {
        setIsAuthenticated(false);
        setProfile(emptyProfile);
        setDraftProfile(emptyProfile);
        setOrders([]);
        setAddresses([]);
        setSupportRequests([]);
        setFavorites([]);
        return;
      }

      const response = await fetch("/api/auth/profile", { cache: "no-store" });
      const data = (await response.json().catch(() => ({}))) as Partial<ProfileData> & {
        ok?: boolean;
        message?: string;
      };

      if (!response.ok || !data.profile) {
        setIsAuthenticated(false);
        setError(data.message || "Не получилось загрузить личный кабинет.");
        return;
      }

      setIsAuthenticated(true);
      setProfile(data.profile);
      setDraftProfile(data.profile);
      setOrders(data.orders ?? []);
      setAddresses(data.addresses ?? []);
      setSupportRequests(data.supportRequests ?? []);
      setFavorites(data.favorites ?? []);
      setError("");
    } catch {
      setIsAuthenticated(false);
      setError("Сервер личного кабинета не ответил.");
    } finally {
      setIsLoaded(true);
    }
  }

  useEffect(() => {
    void loadProfileState();

    const handleProfileUpdate = () => {
      void loadProfileState();
    };

    window.addEventListener("netizen-auth-updated", handleProfileUpdate);

    return () => {
      window.removeEventListener("netizen-auth-updated", handleProfileUpdate);
    };
  }, []);

  function openAuthModal(mode: "login" | "register" = "login") {
    window.dispatchEvent(new CustomEvent("netizen-open-auth", { detail: mode }));
  }

  async function saveProfile() {
    const normalizedProfile = {
      name: draftProfile.name.trim(),
      lastName: draftProfile.lastName.trim(),
      phone: draftProfile.phone.trim(),
      email: draftProfile.email.trim(),
    };

    const response = await fetch("/api/auth/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firstName: normalizedProfile.name,
        lastName: normalizedProfile.lastName,
        phone: normalizedProfile.phone,
        email: normalizedProfile.email,
      }),
    });
    const data = (await response.json().catch(() => ({}))) as {
      message?: string;
      user?: { profile?: CustomerProfile };
    };

    if (!response.ok || !data.user?.profile) {
      setError(data.message || "Не получилось сохранить профиль.");
      return;
    }

    setProfile(data.user.profile);
    setDraftProfile(data.user.profile);
    window.dispatchEvent(new Event("netizen-auth-updated"));
    setIsProfileSaved(true);
    setActiveModal(null);
    setError("");

    window.setTimeout(() => setIsProfileSaved(false), 1800);
  }

  async function addAddress() {
    const normalizedAddress = newAddress.trim();

    if (!normalizedAddress) {
      return;
    }

    const response = await fetch("/api/auth/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "add-address", address: normalizedAddress }),
    });
    const data = (await response.json().catch(() => ({}))) as {
      message?: string;
      addresses?: ProfileAddress[];
    };

    if (!response.ok) {
      setError(data.message || "Не получилось добавить адрес.");
      return;
    }

    setAddresses(data.addresses ?? []);
    setNewAddress("");
    setActiveModal(null);
    setError("");
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => null);
    window.dispatchEvent(new Event("netizen-auth-updated"));
    window.location.href = "/";
  }

  if (!isLoaded) {
    return null;
  }

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-page px-3 py-4 text-main transition-colors duration-700 sm:px-5 sm:py-6">
        <div className="mx-auto max-w-[1440px]">
          <SiteHeader />

          <section className="mt-10 grid min-h-[520px] place-items-center">
            <div className="card w-full max-w-[720px] rounded-[34px] p-8 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 text-2xl font-bold text-white">
                👤
              </div>

              <div className="mt-6 text-sm font-medium uppercase tracking-[0.2em] text-blue-500">
                Личный кабинет
              </div>

              <h1 className="mt-3 text-4xl font-bold tracking-[-0.05em] md:text-5xl">
                Войдите или зарегистрируйтесь
              </h1>

              <p className="mx-auto mt-4 max-w-[560px] text-sm leading-relaxed text-muted">
                Профиль, заявки, адреса доставки, избранное и обращения показываются
                только после входа клиента. Данные берутся из базы, а не из браузера.
              </p>

              {error && (
                <div className="mx-auto mt-5 max-w-[520px] rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-500">
                  {error}
                </div>
              )}

              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => openAuthModal("login")}
                  className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-500 sm:px-6 sm:py-3.5"
                >
                  Войти →
                </button>

                <button
                  type="button"
                  onClick={() => openAuthModal("register")}
                  className="rounded-xl border border-theme bg-transparent px-4 py-2.5 text-sm font-medium transition-colors hover:border-blue-500/40 hover:bg-blue-soft sm:px-6 sm:py-3.5"
                >
                  Зарегистрироваться
                </button>
              </div>
            </div>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-page px-3 py-4 text-main transition-colors duration-700 sm:px-5 sm:py-6">
      <div className="mx-auto max-w-[1440px]">
        <SiteHeader />

        <div className="mt-4 sm:mt-6">
          <Link
            href="/"
            className="text-sm text-blue-500 transition-colors hover:text-blue-400"
          >
            ← На главную
          </Link>
        </div>

        <section className="mt-4 grid gap-5 lg:mt-6 lg:grid-cols-[1fr_360px] lg:items-start lg:gap-8">
          <div className="space-y-5 sm:space-y-8">
            <section className="card rounded-[22px] p-4 sm:rounded-[28px] sm:p-6">
              <div className="inline-flex rounded-full border border-blue-500/35 bg-blue-500/10 px-3 py-1.5 text-xs font-medium text-blue-500 sm:px-4 sm:py-2 sm:text-sm">
                Личный кабинет
              </div>

              <h1 className="mt-3 max-w-[760px] text-3xl font-bold tracking-[-0.05em] sm:mt-4 sm:text-4xl">
                Ваши заказы, данные и обращения
              </h1>

              <p className="mt-3 max-w-[620px] text-sm leading-relaxed text-muted sm:mt-4">
                Здесь показываются только реальные данные клиента из базы: заявки,
                адреса доставки, избранные товары и обращения.
              </p>

              {error && (
                <div className="mt-5 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-500">
                  {error}
                </div>
              )}

              <div className="mt-4 flex flex-wrap gap-2 sm:mt-6 sm:gap-4">
                <Link
                  href="/catalog"
                  className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-500 sm:px-6 sm:py-3.5"
                >
                  Перейти в каталог →
                </Link>

                <Link
                  href="/help"
                  className="rounded-xl border border-theme bg-transparent px-4 py-2.5 text-sm font-medium transition-colors hover:border-blue-500/40 hover:bg-blue-soft sm:px-6 sm:py-3.5"
                >
                  Написать в поддержку
                </Link>

                <button
                  type="button"
                  onClick={logout}
                  className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm font-medium text-red-500 transition-colors hover:bg-red-500/15 sm:px-6 sm:py-3.5"
                >
                  Выйти
                </button>
              </div>
            </section>

            <section className="card rounded-[24px] p-4 sm:rounded-[34px] sm:p-8">
              <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                  <div className="text-xs font-medium uppercase tracking-[0.18em] text-blue-500 sm:text-sm sm:tracking-[0.2em]">
                    Заказы
                  </div>

                  <h2 className="mt-2 text-2xl font-bold tracking-[-0.045em] sm:mt-3 sm:text-4xl">
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
                <div className="mt-5 grid gap-3 sm:mt-8 sm:gap-4">
                  {orders.map((order) => (
                    <article
                      key={order.id}
                      className="rounded-2xl border border-theme bg-blue-soft p-4 sm:p-5"
                    >
                      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                        <div>
                          <div className="text-sm text-muted">{order.publicId}</div>

                          <h3 className="mt-1 text-lg font-bold sm:text-xl">
                            {getOrderTitle(order)}
                          </h3>

                          <p className="mt-2 text-sm text-muted">
                            {formatDate(order.createdAt)} · {formatPrice(order.total)}
                          </p>

                          <p className="mt-1 text-sm text-muted">{order.delivery}</p>
                        </div>

                        <div className="flex flex-col gap-3 md:items-end">
                          <span className="w-fit rounded-full border border-blue-500/35 bg-blue-500/10 px-4 py-2 text-sm font-medium text-blue-500">
                            {getOrderStatusLabel(order.status)}
                          </span>

                          <div className="text-sm text-muted">
                            {order.items.length} позиц.
                          </div>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="Заявок пока нет"
                  text="Когда клиент оформит заказ из корзины, заявка появится здесь из таблицы Order. Тестовые заявки больше не показываются."
                  href="/catalog"
                  action="Перейти в каталог →"
                />
              )}
            </section>

            <section id="favorites" className="card rounded-[24px] p-4 sm:rounded-[34px] sm:p-8">
              <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                  <div className="text-xs font-medium uppercase tracking-[0.18em] text-blue-500 sm:text-sm sm:tracking-[0.2em]">
                    Избранное
                  </div>

                  <h2 className="mt-2 text-2xl font-bold tracking-[-0.045em] sm:mt-3 sm:text-4xl">
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

              {favorites.length > 0 ? (
                <div className="mt-5 grid gap-3 sm:mt-8 md:grid-cols-2 md:gap-4">
                  {favorites.map((favorite) => (
                    <article
                      key={favorite.id}
                      className="rounded-2xl border border-theme bg-transparent p-3 transition-colors hover:border-blue-500/35 hover:bg-blue-soft sm:p-5"
                    >
                      <div className="flex gap-3 sm:gap-5">
                        <div className="soft-box flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white text-xs text-muted-soft sm:h-24 sm:w-24">
                          {favorite.product.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <Image quality={75} src={favorite.product.image}
                              alt={favorite.product.name}
                              className="h-full w-full object-contain"
                            />
                          ) : (
                            "Фото"
                          )}
                        </div>

                        <div className="flex min-w-0 flex-1 flex-col">
                          <div className="text-sm text-muted">{favorite.product.brand}</div>
                          <h3 className="mt-1 line-clamp-2 text-sm font-bold leading-tight sm:text-lg">
                            {favorite.product.name}
                          </h3>

                          <div className="mt-auto pt-5 text-sm font-medium">
                            <Link
                              href={`/product/${favorite.product.slug}`}
                              className="text-blue-500 transition-colors hover:text-blue-400"
                            >
                              Перейти →
                            </Link>
                          </div>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="Избранных товаров пока нет"
                  text="Избранное теперь хранится в базе. Когда добавим кнопку избранного в карточку товара, товары появятся здесь."
                  href="/catalog"
                  action="Перейти в каталог →"
                />
              )}
            </section>

            <section className="card rounded-[24px] p-4 sm:rounded-[34px] sm:p-8">
              <div className="text-sm font-medium uppercase tracking-[0.2em] text-blue-500">
                Поддержка
              </div>

              <h2 className="mt-2 text-2xl font-bold tracking-[-0.045em] sm:mt-3 sm:text-4xl">
                Обращения
              </h2>

              {supportRequests.length > 0 ? (
                <div className="mt-5 grid gap-3 sm:mt-8 sm:gap-4">
                  {supportRequests.map((request) => (
                    <article
                      key={request.id}
                      className="rounded-2xl border border-theme bg-transparent p-4 sm:p-5"
                    >
                      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div>
                          <div className="text-sm text-muted">{request.publicId}</div>
                          <h3 className="mt-1 text-lg font-bold sm:text-xl">{request.topic}</h3>

                          <p className="mt-2 text-sm leading-relaxed text-muted">
                            {request.message}
                          </p>
                        </div>

                        <span className="w-fit rounded-full border border-theme px-4 py-2 text-sm text-muted">
                          {getSupportStatusLabel(request.status)}
                        </span>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="Обращений пока нет"
                  text="Когда клиент напишет в поддержку, обращение появится здесь из базы. Тестовые обращения больше не выводятся."
                  href="/help"
                  action="Написать в поддержку →"
                />
              )}
            </section>
          </div>

          <aside className="space-y-5 sm:space-y-8 lg:sticky lg:top-6">
            <section className="card rounded-[22px] p-4 sm:rounded-[28px] sm:p-7">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-xl font-bold text-white sm:h-16 sm:w-16 sm:text-2xl">
                  {getInitialLetter(profile)}
                </div>

                <div>
                  <div className="text-sm text-muted">Профиль</div>
                  <h2 className="text-xl font-bold sm:text-2xl">
                    {getFullName(profile) || "Клиент Нетизен"}
                  </h2>
                </div>
              </div>

              <div className="mt-5 space-y-3 sm:mt-7 sm:space-y-4">
                <ProfileField label="Имя" value={profile.name || "Не указано"} />
                <ProfileField label="Фамилия" value={profile.lastName || "Не указана"} />
                <ProfileField label="Телефон" value={profile.phone || "Не указан"} />
                <ProfileField label="E-mail" value={profile.email || "Не указан"} />
              </div>

              <button
                type="button"
                onClick={() => {
                  setDraftProfile(profile);
                  setActiveModal("profile");
                }}
                className="mt-5 w-full rounded-xl bg-blue-600 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-500 sm:mt-7 sm:px-6 sm:py-4"
              >
                Редактировать данные
              </button>

              <button
                type="button"
                onClick={logout}
                className="mt-3 w-full rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-3 text-sm font-medium text-red-500 transition-colors hover:bg-red-500/15 sm:px-6 sm:py-4"
              >
                Выйти из аккаунта
              </button>

              {isProfileSaved && (
                <div className="mt-4 rounded-2xl border border-green-500/30 bg-green-500/10 p-3 text-sm text-green-500">
                  Данные сохранены
                </div>
              )}
            </section>

            <section className="card rounded-[24px] p-4 sm:rounded-[34px] sm:p-8">
              <div className="text-sm font-medium uppercase tracking-[0.2em] text-blue-500">
                Доставка
              </div>

              <h2 className="mt-2 text-2xl font-bold tracking-[-0.04em] sm:mt-3 sm:text-3xl">
                Адреса
              </h2>

              {addresses.length > 0 ? (
                <div className="mt-6 grid gap-3">
                  {addresses.slice(0, 3).map((address) => (
                    <div
                      key={address.id}
                      className="rounded-2xl border border-theme bg-blue-soft p-4 text-sm"
                    >
                      {address.value}
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

            <section className="card rounded-[24px] p-4 sm:rounded-[34px] sm:p-8">
              <div className="text-sm font-medium uppercase tracking-[0.2em] text-blue-500">
                Быстро
              </div>

              <h2 className="mt-2 text-2xl font-bold tracking-[-0.04em] sm:mt-3 sm:text-3xl">
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
              Фамилия
              <input
                value={draftProfile.lastName}
                onChange={(event) =>
                  setDraftProfile((current) => ({
                    ...current,
                    lastName: event.target.value,
                  }))
                }
                placeholder="Например, Иванов"
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
      <p className="mt-2 max-w-[560px] text-sm leading-relaxed text-muted">{text}</p>
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
  children: ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-8 backdrop-blur-md">
      <div className="w-full max-w-[560px] rounded-[28px] border border-theme bg-page p-6 text-main shadow-2xl">
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

        <div className="mt-4 sm:mt-6">{children}</div>
      </div>
    </div>
  );
}
