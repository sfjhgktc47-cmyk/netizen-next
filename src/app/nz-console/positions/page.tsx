import type { ReactNode } from "react";
import Link from "next/link";

import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

function formatPrice(value: number | null | undefined) {
  if (value === null || value === undefined) {
    return "—";
  }

  return `${value.toLocaleString("ru-RU")} ₽`;
}

function getStockLabel(stock: number) {
  return stock > 0 ? `${stock} шт.` : "Нет";
}

function getStatusLabel(status: string) {
  if (status === "active") {
    return "В продаже";
  }

  if (status === "out_of_stock") {
    return "Нет в наличии";
  }

  if (status === "draft") {
    return "Под заказ";
  }

  return "Скрыта";
}

export default async function AdminPositionsPage() {
  const variants = await prisma.productVariant.findMany({
    include: {
      product: {
        select: {
          slug: true,
          name: true,
        },
      },
    },
    orderBy: [{ createdAt: "desc" }],
  });

  const activeCount = variants.filter((variant) => variant.status === "active" && variant.stock > 0).length;
  const outOfStockCount = variants.filter((variant) => variant.stock <= 0 || variant.status === "out_of_stock").length;
  const draftCount = variants.filter((variant) => variant.status === "draft").length;
  const hiddenCount = variants.filter((variant) => variant.status === "hidden").length;

  const tabs = [
    { label: "Все", count: variants.length, active: true },
    { label: "В продаже", count: activeCount, active: false },
    { label: "Нет в наличии", count: outOfStockCount, active: false },
    { label: "Под заказ", count: draftCount, active: false },
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
            <span>Позиции / SKU</span>
            <span>·</span>
            <span>цены и наличие из БД</span>
          </div>

          <Link
            href="/"
            className="rounded-xl border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-medium transition-colors hover:border-blue-500/40 hover:bg-blue-500/10"
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
              <h1 className="text-4xl font-bold tracking-[-0.055em] sm:text-5xl">
                Позиции / SKU
              </h1>

              <p className="mt-3 max-w-[760px] text-sm leading-relaxed text-white/55">
                Здесь лежат конкретные товары, которые реально продаются: конфигурация, цена, цена до акции, наличие и SKU. Каждая позиция привязана к материнской карточке товара.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button className="rounded-xl border border-blue-500/35 bg-blue-500/10 px-7 py-4 text-sm font-medium text-blue-400 transition-colors hover:bg-blue-500/15">
                Импорт XLSX
              </button>

              <Link
                href="/nz-console/positions/new"
                className="rounded-xl bg-blue-600 px-7 py-4 text-sm font-medium text-white transition-colors hover:bg-blue-500"
              >
                Добавить позицию →
              </Link>
            </div>
          </div>
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

                <span className={`ml-2 rounded-full px-2 py-0.5 text-xs ${tab.active ? "bg-blue-600 text-white" : "bg-white/10 text-white/45"}`}>
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
                placeholder="Поиск по названию / модели / SKU"
                className="h-12 flex-1 rounded-xl border border-white/10 bg-black/20 px-5 text-sm text-white outline-none placeholder:text-white/35 focus:border-blue-500/50"
              />

              <button className="rounded-xl border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-medium transition-colors hover:border-blue-500/40 hover:bg-blue-500/10">
                Модель
              </button>

              <button className="rounded-xl border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-medium transition-colors hover:border-blue-500/40 hover:bg-blue-500/10">
                Наличие
              </button>

              <button className="rounded-xl border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-medium transition-colors hover:border-blue-500/40 hover:bg-blue-500/10">
                Статус
              </button>
            </div>

            <Link
              href="/nz-console/positions/new"
              className="rounded-xl bg-blue-600 px-6 py-3 text-center text-sm font-medium text-white transition-colors hover:bg-blue-500"
            >
              Добавить позицию
            </Link>
          </div>
        </section>

        <section className="mt-6 overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.035]">
          <div className="hidden grid-cols-[1.15fr_1.25fr_0.75fr_0.65fr_0.65fr_0.75fr_0.75fr_0.7fr_140px] border-b border-white/10 bg-black/25 px-5 py-4 text-sm text-white/45 xl:grid">
            <div>Модель</div>
            <div>Позиция / SKU</div>
            <div>Цвет</div>
            <div>Память</div>
            <div>SIM</div>
            <div>Цена</div>
            <div>До акции</div>
            <div>Наличие</div>
            <div className="text-right">Редактировать</div>
          </div>

          <div className="divide-y divide-white/10">
            {variants.length > 0 ? (
              variants.map((variant) => (
                <div
                  key={variant.id}
                  className="grid gap-5 bg-white/[0.015] p-5 transition-colors hover:bg-blue-500/[0.04] xl:grid-cols-[1.15fr_1.25fr_0.75fr_0.65fr_0.65fr_0.75fr_0.75fr_0.7fr_140px] xl:items-center"
                >
                  <AdminCell label="Модель">
                    <Link
                      href={`/nz-console/products/${variant.product.slug}`}
                      className="rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-sm text-blue-400 transition-colors hover:bg-blue-500/15"
                    >
                      {variant.product.name}
                    </Link>
                  </AdminCell>

                  <div>
                    <div className="font-semibold">{variant.title}</div>
                    <div className="mt-1 text-sm text-white/35">SKU {variant.sku}</div>
                  </div>

                  <AdminCell label="Цвет">{variant.color || "—"}</AdminCell>
                  <AdminCell label="Память">{variant.memory || "—"}</AdminCell>
                  <AdminCell label="SIM">{variant.sim || "—"}</AdminCell>
                  <AdminCell label="Цена">{formatPrice(variant.price)}</AdminCell>

                  <AdminCell label="До акции">
                    <span className="text-white/50 line-through">{formatPrice(variant.oldPrice)}</span>
                  </AdminCell>

                  <div>
                    <div className="mb-1 text-xs text-white/35 xl:hidden">Наличие</div>
                    <span className={`rounded-full border px-3 py-1 text-sm ${variant.stock > 0 ? "border-green-500/30 bg-green-500/10 text-green-300" : "border-orange-500/30 bg-orange-500/10 text-orange-300"}`}>
                      {getStockLabel(variant.stock)}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2 xl:justify-end">
                    <Link
                      href={`/nz-console/products/${variant.product.slug}#edit-variant-${variant.id}`}
                      className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-sm transition-colors hover:border-blue-500/40 hover:bg-blue-500/10"
                    >
                      Изменить
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-sm text-white/45">
                В БД пока нет SKU-позиций. Нажмите «Добавить позицию», выберите карточку и создайте первую комплектацию.
              </div>
            )}
          </div>
        </section>

        <section className="my-8 rounded-[28px] border border-blue-500/25 bg-blue-500/10 p-6">
          <div className="text-sm font-medium uppercase tracking-[0.2em] text-blue-400">XLSX</div>
          <h2 className="mt-3 text-2xl font-bold tracking-[-0.035em]">Импорт позиций</h2>
          <p className="mt-3 max-w-[980px] text-sm leading-relaxed text-white/55">
            Excel будет обновлять именно позиции: sku, model, name, price, oldPrice, stock, color, memory, sim и status.
          </p>
        </section>
      </div>
    </main>
  );
}

function AdminCell({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <div className="mb-1 text-xs text-white/35 xl:hidden">{label}</div>
      <div className="text-sm text-white/70">{children}</div>
    </div>
  );
}
