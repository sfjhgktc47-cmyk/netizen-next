import type { ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ProductVariantCreateForm } from "@/components/admin/product-variant-create-form";
import {
  getAdminProductBySlug,
  getAdminStatusClass,
  getAdminStatusLabel,
} from "@/lib/admin-products-db";

export const dynamic = "force-dynamic";

function formatPrice(value: number | null | undefined) {
  if (value === null || value === undefined) {
    return "—";
  }

  return `${value.toLocaleString("ru-RU")} ₽`;
}

export default async function AdminProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getAdminProductBySlug(slug);

  if (!product) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#020814] px-4 py-4 text-white sm:px-6 sm:py-6">
      <div className="mx-auto max-w-[1440px]">
        <header className="flex min-h-[76px] items-center justify-between rounded-2xl border border-white/10 bg-white/[0.035] px-4 sm:px-6">
          <Link href="/nz-console" className="text-xl font-bold tracking-[-0.04em]">
            Netizen Console
          </Link>

          <div className="hidden items-center gap-3 text-sm text-white/55 md:flex">
            <span>Карточка товара</span>
            <span>·</span>
            <span>{product.name}</span>
          </div>

          <Link
            href="/nz-console/products"
            className="rounded-xl border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-medium transition-colors hover:border-blue-500/40 hover:bg-blue-500/10"
          >
            К карточкам →
          </Link>
        </header>

        <section className="mt-10">
          <Link href="/nz-console/products" className="text-sm text-blue-400 transition-colors hover:text-blue-300">
            ← Назад к карточкам
          </Link>

          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
            <div className="rounded-[34px] border border-white/10 bg-white/[0.035] p-6 sm:p-8">
              <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                <div className="flex items-start gap-5">
                  <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-3xl bg-white/[0.045] text-xs text-white/25">
                    Фото
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="text-sm font-medium uppercase tracking-[0.2em] text-blue-400">
                        Материнская карточка
                      </div>

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

                    <h1 className="mt-3 text-4xl font-bold tracking-[-0.055em] sm:text-5xl">
                      {product.name}
                    </h1>

                    <p className="mt-4 max-w-[720px] text-sm leading-relaxed text-white/55">
                      {product.description || product.shortDescription || "Описание пока не заполнено."}
                    </p>
                  </div>
                </div>

                <span className={`inline-flex w-fit whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium ${getAdminStatusClass(product.status)}`}>
                  {getAdminStatusLabel(product.status)}
                </span>
              </div>

              <div className="mt-8 grid gap-4 md:grid-cols-4">
                <InfoCard label="Категория" value={product.categoryName} />
                <InfoCard label="Бренд" value={product.brand} />
                <InfoCard label="Позиций / SKU" value={String(product.variantsCount)} />
                <InfoCard label="Цена от" value={formatPrice(product.minPrice)} />
              </div>
            </div>

            <aside className="rounded-[34px] border border-white/10 bg-white/[0.035] p-6 sm:p-8">
              <div className="text-sm font-medium uppercase tracking-[0.2em] text-blue-400">
                Действия
              </div>

              <h2 className="mt-3 text-3xl font-bold tracking-[-0.04em]">
                Управление
              </h2>

              <p className="mt-3 text-sm leading-relaxed text-white/55">
                Сейчас эта страница читает данные из БД. Позиции уже можно добавлять ниже на этой странице. Редактирование и скрытие подключим следующим проходом.
              </p>

              <div className="mt-6 grid gap-3">
                <Link
                  href="/nz-console/products/new"
                  className="rounded-xl bg-blue-600 px-5 py-4 text-center text-sm font-medium text-white transition-colors hover:bg-blue-500"
                >
                  Создать ещё товар
                </Link>

                <a
                  href="#add-variant"
                  className="rounded-xl border border-white/10 bg-white/[0.03] px-5 py-4 text-center text-sm font-medium transition-colors hover:border-blue-500/40 hover:bg-blue-500/10"
                >
                  Добавить позицию
                </a>
              </div>
            </aside>
          </div>
        </section>

        <section className="mt-8 rounded-[34px] border border-white/10 bg-white/[0.035] p-6 sm:p-8">
          <SectionTitle
            label="SKU"
            title="Позиции и конфигурации"
            text="Здесь видно конкретные позиции: артикул, память, цвет, SIM, цена и остаток."
          />

          <div className="mt-8 overflow-hidden rounded-[24px] border border-white/10">
            <div className="hidden grid-cols-[1fr_0.9fr_0.8fr_0.7fr_0.7fr_0.6fr] border-b border-white/10 bg-black/25 px-5 py-4 text-sm text-white/45 lg:grid">
              <div>SKU</div>
              <div>Позиция</div>
              <div>Параметры</div>
              <div>Цена</div>
              <div>Остаток</div>
              <div>Статус</div>
            </div>

            <div className="divide-y divide-white/10">
              {product.variants.length > 0 ? (
                product.variants.map((variant) => (
                  <div
                    key={variant.id}
                    className="grid gap-4 bg-white/[0.015] p-5 lg:grid-cols-[1fr_0.9fr_0.8fr_0.7fr_0.7fr_0.6fr] lg:items-center"
                  >
                    <AdminCell label="SKU">
                      <span className="font-semibold text-white">{variant.sku}</span>
                    </AdminCell>

                    <AdminCell label="Позиция">{variant.title}</AdminCell>

                    <AdminCell label="Параметры">
                      {[variant.memory, variant.color, variant.sim].filter(Boolean).join(" · ") || "—"}
                    </AdminCell>

                    <AdminCell label="Цена">{formatPrice(variant.price)}</AdminCell>

                    <AdminCell label="Остаток">{variant.stock} шт.</AdminCell>

                    <AdminCell label="Статус">
                      <span className={`rounded-full border px-3 py-1 text-sm ${getAdminStatusClass(variant.status)}`}>
                        {getAdminStatusLabel(variant.status)}
                      </span>
                    </AdminCell>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-sm text-white/45">
                  У карточки пока нет SKU-позиций. Добавьте первую позицию через форму ниже.
                </div>
              )}
            </div>
          </div>

          {product.source === "db" ? (
            <div id="add-variant">
              <ProductVariantCreateForm productId={product.id} productName={product.name} />
            </div>
          ) : (
            <div className="mt-8 rounded-[28px] border border-orange-500/20 bg-orange-500/10 p-6 text-sm leading-relaxed text-orange-100/80">
              Это демо-карточка из файлов. Позиции можно создавать только у товаров из БД.
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <div className="text-xs font-semibold uppercase tracking-[0.16em] text-white/35">{label}</div>
      <div className="mt-2 text-lg font-bold text-white">{value}</div>
    </div>
  );
}

function SectionTitle({ label, title, text }: { label: string; title: string; text: string }) {
  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-400">{label}</div>
      <h2 className="mt-2 text-3xl font-bold tracking-[-0.04em] text-white">{title}</h2>
      <p className="mt-3 max-w-[760px] text-sm leading-relaxed text-white/55">{text}</p>
    </div>
  );
}

function AdminCell({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <div className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-white/30 lg:hidden">
        {label}
      </div>
      <div className="text-sm text-white/70">{children}</div>
    </div>
  );
}
