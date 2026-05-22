import type { ReactNode } from "react";
import Link from "next/link";

import {
  getAdminProducts,
  getAdminStatusClass,
  getAdminStatusLabel,
} from "@/lib/admin-products-db";

export const dynamic = "force-dynamic";

function formatPrice(value: number | null) {
  if (value === null) {
    return "—";
  }

  return `${value.toLocaleString("ru-RU")} ₽`;
}

export default async function AdminProductsPage() {
  const products = await getAdminProducts();
  const activeCount = products.filter((product) => product.status === "active").length;
  const draftCount = products.filter((product) => product.status === "draft").length;
  const hiddenCount = products.filter((product) => product.status === "hidden").length;
  const skuCount = products.reduce((sum, product) => sum + product.variantsCount, 0);
  const dbCount = products.filter((product) => product.source === "db").length;

  const tabs = [
    { label: "Все", count: products.length, active: true },
    { label: "Активные", count: activeCount, active: false },
    { label: "Черновики", count: draftCount, active: false },
    { label: "Скрытые", count: hiddenCount, active: false },
  ];

  return (
    <main className="min-h-screen bg-[#020814] px-4 py-4 text-white sm:px-6 sm:py-6">
      <div className="mx-auto max-w-[1600px]">
        <header className="flex min-h-[76px] items-center justify-between rounded-2xl border border-white/10 bg-white/[0.035] px-4 sm:px-6">
          <Link href="/nz-console" className="text-xl font-bold tracking-[-0.04em]">
            Netizen Console
          </Link>

          <div className="hidden items-center gap-3 text-sm text-white/55 md:flex">
            <span>Карточки товаров</span>
            <span>·</span>
            <span>{dbCount > 0 ? "PostgreSQL" : "демо fallback"}</span>
          </div>

          <Link
            href="/"
            className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-medium transition-colors hover:border-blue-500/40 hover:bg-blue-500/10 sm:px-5"
          >
            На сайт →
          </Link>
        </header>

        <section className="mt-10">
          <Link href="/nz-console" className="text-sm text-blue-400 transition-colors hover:text-blue-300">
            ← В админку
          </Link>

          <div className="mt-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="inline-flex rounded-full border border-blue-500/35 bg-blue-500/10 px-4 py-2 text-sm font-medium text-blue-400">
                {dbCount > 0 ? "Данные из БД" : "Fallback: демо-данные"}
              </div>

              <h1 className="mt-5 text-4xl font-bold tracking-[-0.055em] sm:text-5xl">
                Карточки товаров
              </h1>

              <p className="mt-3 max-w-[800px] text-sm leading-relaxed text-white/55">
                Это материнские карточки: iPhone 17 Pro, MacBook Pro 14, AirPods Pro. Теперь этот раздел умеет читать товары из PostgreSQL и создавать новые карточки через админку.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/nz-console/positions"
                className="rounded-xl border border-white/10 bg-white/[0.03] px-6 py-4 text-sm font-medium transition-colors hover:border-blue-500/40 hover:bg-blue-500/10"
              >
                Открыть позиции
              </Link>

              <Link
                href="/nz-console/products/new"
                className="rounded-xl bg-blue-600 px-6 py-4 text-sm font-medium text-white transition-colors hover:bg-blue-500"
              >
                Создать карточку →
              </Link>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-5 md:grid-cols-4">
          <MetricCard label="Всего карточек" value={String(products.length)} />
          <MetricCard label="Из БД" value={String(dbCount)} />
          <MetricCard label="Активные" value={String(activeCount)} />
          <MetricCard label="Позиции / SKU" value={String(skuCount)} />
        </section>

        <section className="mt-8">
          <div className="flex flex-wrap gap-2 border-b border-white/10">
            {tabs.map((tab) => (
              <button
                key={tab.label}
                className={`relative px-4 py-4 text-sm font-medium transition-colors ${
                  tab.active ? "text-white" : "text-white/45 hover:text-white"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`ml-2 rounded-full px-2 py-0.5 text-xs ${
                    tab.active ? "bg-blue-600 text-white" : "bg-white/10 text-white/45"
                  }`}
                >
                  {tab.count}
                </span>
                {tab.active && <span className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full bg-blue-500" />}
              </button>
            ))}
          </div>
        </section>

        <section className="mt-6 rounded-[28px] border border-white/10 bg-white/[0.035] p-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-1 flex-col gap-3 md:flex-row">
              <input
                placeholder="Поиск будет подключён следующим шагом"
                className="h-12 flex-1 rounded-xl border border-white/10 bg-black/20 px-5 text-sm text-white outline-none placeholder:text-white/35 focus:border-blue-500/50"
              />

              <button className="rounded-xl border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-medium text-white/55">
                Категория
              </button>

              <button className="rounded-xl border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-medium text-white/55">
                Бренд
              </button>

              <button className="rounded-xl border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-medium text-white/55">
                Статус
              </button>
            </div>

            <Link
              href="/nz-console/products/new"
              className="rounded-xl bg-blue-600 px-6 py-3 text-center text-sm font-medium text-white transition-colors hover:bg-blue-500"
            >
              Создать карточку
            </Link>
          </div>
        </section>

        <section className="mt-6 overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.035]">
          <div className="hidden grid-cols-[90px_1.3fr_0.8fr_0.7fr_0.6fr_0.7fr_0.7fr_150px] border-b border-white/10 bg-black/25 px-5 py-4 text-sm text-white/45 xl:grid">
            <div>Фото</div>
            <div>Карточка</div>
            <div>Категория</div>
            <div>Бренд</div>
            <div>SKU</div>
            <div>Цена от</div>
            <div>Статус</div>
            <div className="text-right">Редактировать</div>
          </div>

          <div className="divide-y divide-white/10">
            {products.map((product) => (
              <div
                key={`${product.source}-${product.id}`}
                className="grid gap-5 bg-white/[0.015] p-5 transition-colors hover:bg-blue-500/[0.04] xl:grid-cols-[90px_1.3fr_0.8fr_0.7fr_0.6fr_0.7fr_0.7fr_150px] xl:items-center"
              >
                <Link
                  href={`/product/${product.slug}`}
                  className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/[0.045] text-xs text-white/25"
                >
                  Фото
                </Link>

                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/nz-console/products/${product.slug}`}
                      className="block text-lg font-bold transition-colors hover:text-blue-400"
                    >
                      {product.name}
                    </Link>

                    <span
                      className={`rounded-full border px-2 py-0.5 text-[11px] ${
                        product.source === "db"
                          ? "border-blue-500/30 bg-blue-500/10 text-blue-300"
                          : "border-orange-500/30 bg-orange-500/10 text-orange-300"
                      }`}
                    >
                      {product.source === "db" ? "БД" : "Демо"}
                    </span>
                  </div>

                  <div className="mt-1 text-sm text-white/35">/product/{product.slug}</div>

                  <p className="mt-2 line-clamp-2 text-sm text-white/45">
                    {product.shortDescription || "Описание пока не заполнено."}
                  </p>
                </div>

                <AdminCell label="Категория">
                  <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-sm text-white/65">
                    {product.categoryName}
                  </span>
                </AdminCell>

                <AdminCell label="Бренд">{product.brand}</AdminCell>

                <AdminCell label="SKU">
                  <span className="rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-sm text-blue-400">
                    {product.variantsCount}
                  </span>
                </AdminCell>

                <AdminCell label="Цена от">{formatPrice(product.minPrice)}</AdminCell>

                <AdminCell label="Статус">
                  <span className={`rounded-full border px-3 py-1 text-sm ${getAdminStatusClass(product.status)}`}>
                    {getAdminStatusLabel(product.status)}
                  </span>
                </AdminCell>

                <div className="flex flex-wrap gap-2 xl:justify-end">
                  <Link
                    href={`/nz-console/products/${product.slug}`}
                    className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-sm transition-colors hover:border-blue-500/40 hover:bg-blue-500/10"
                  >
                    Открыть
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-white/[0.035] p-6">
      <div className="text-sm text-white/45">{label}</div>
      <div className="mt-3 text-4xl font-bold tracking-[-0.05em]">{value}</div>
    </div>
  );
}

function AdminCell({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <div className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-white/30 xl:hidden">
        {label}
      </div>
      <div className="text-sm text-white/70">{children}</div>
    </div>
  );
}
