import Link from "next/link";
import { categories } from "@/data/categories";
import { productCards } from "@/data/product-cards";

function getCategoryCount(categoryId: string) {
  return productCards.filter((product) => product.category === categoryId).length;
}

export default function AdminCategoriesPage() {
  return (
    <main className="min-h-screen bg-[#020814] px-6 py-6 text-white">
      <div className="mx-auto max-w-[1440px]">
        <header className="flex min-h-[76px] items-center justify-between rounded-2xl border border-white/10 bg-white/[0.035] px-6">
          <Link
            href="/nz-console"
            className="text-xl font-bold tracking-[-0.04em]"
          >
            Netizen Console
          </Link>

          <div className="hidden items-center gap-3 text-sm text-white/55 md:flex">
            <span>Категории</span>
            <span>·</span>
            <span>структура каталога</span>
          </div>

          <Link
            href="/"
            className="rounded-xl border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-medium transition-colors hover:border-blue-500/40 hover:bg-blue-500/10"
          >
            На сайт →
          </Link>
        </header>

        <section className="mt-10">
          <Link
            href="/nz-console"
            className="text-sm text-blue-400 transition-colors hover:text-blue-300"
          >
            ← В админку
          </Link>

          <div className="mt-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="inline-flex rounded-full border border-blue-500/35 bg-blue-500/10 px-4 py-2 text-sm font-medium text-blue-400">
                Каталог
              </div>

              <h1 className="mt-5 text-5xl font-bold tracking-[-0.055em]">
                Категории
              </h1>

              <p className="mt-4 max-w-[760px] text-sm leading-relaxed text-white/55">
                Здесь управляем разделами каталога. В системе используется
                технический ID, а клиенту показывается нормальное название:
                например, <span className="text-white">smartphones</span> →
                <span className="text-white"> Смартфоны</span>.
              </p>
            </div>

            <Link
  href="/nz-console/categories/new"
  className="rounded-xl bg-blue-600 px-7 py-4 text-sm font-medium text-white transition-colors hover:bg-blue-500"
>
  Добавить категорию →
</Link>
          </div>
        </section>

        <section className="mt-8 grid gap-5 md:grid-cols-3">
          <MetricCard label="Всего категорий" value={String(categories.length)} />
          <MetricCard
            label="Активные"
            value={String(categories.length)}
          />
          <MetricCard
            label="Карточек в каталоге"
            value={String(productCards.length)}
          />
        </section>

        <section className="mt-8 rounded-[28px] border border-white/10 bg-white/[0.035] p-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-1 flex-col gap-3 md:flex-row">
              <input
                placeholder="Поиск по названию / ID категории"
                className="h-12 flex-1 rounded-xl border border-white/10 bg-black/20 px-5 text-sm text-white outline-none placeholder:text-white/35 focus:border-blue-500/50"
              />

              <button className="rounded-xl border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-medium transition-colors hover:border-blue-500/40 hover:bg-blue-500/10">
                Активные
              </button>

              <button className="rounded-xl border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-medium transition-colors hover:border-blue-500/40 hover:bg-blue-500/10">
                SEO
              </button>
            </div>

            <button className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-500">
              Добавить категорию
            </button>
          </div>
        </section>

        <section className="mt-6 overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.035]">
          <div className="hidden grid-cols-[1fr_0.75fr_1.25fr_0.55fr_0.65fr_150px] border-b border-white/10 bg-black/25 px-5 py-4 text-sm text-white/45 lg:grid">
            <div>Название</div>
            <div>ID / slug</div>
            <div>Описание</div>
            <div>Карточек</div>
            <div>Статус</div>
            <div className="text-right">Действия</div>
          </div>

          <div className="divide-y divide-white/10">
            {categories.map((category) => {
              const count = getCategoryCount(category.id);

              return (
                <div
                  key={category.id}
                  className="grid gap-5 bg-white/[0.015] p-5 transition-colors hover:bg-blue-500/[0.04] lg:grid-cols-[1fr_0.75fr_1.25fr_0.55fr_0.65fr_150px] lg:items-center"
                >
                  <div>
                    <div className="text-lg font-bold">{category.name}</div>
                    <div className="mt-1 text-sm text-white/35">
                      /catalog/{category.id}
                    </div>
                  </div>

                  <AdminCell label="ID / slug">
                    <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-sm text-white/65">
                      {category.id}
                    </span>
                  </AdminCell>

                  <AdminCell label="Описание">
                    <span className="text-white/55">
                      {category.description ?? "Описание пока не задано"}
                    </span>
                  </AdminCell>

                  <AdminCell label="Карточек">
                    <span className="rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-sm text-blue-400">
                      {count}
                    </span>
                  </AdminCell>

                  <AdminCell label="Статус">
                    <span className="rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1 text-sm text-green-300">
                      Активна
                    </span>
                  </AdminCell>

                  <div className="flex flex-wrap gap-2 lg:justify-end">
                    <Link
  href="/nz-console/categories/new"
  className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-sm transition-colors hover:border-blue-500/40 hover:bg-blue-500/10"
>
  Изменить
</Link>
                    <button className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-white/50 transition-colors hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-300">
                      Скрыть
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="my-8 rounded-[28px] border border-blue-500/25 bg-blue-500/10 p-6">
          <div className="text-sm font-medium uppercase tracking-[0.2em] text-blue-400">
            Важно
          </div>

          <h2 className="mt-3 text-2xl font-bold tracking-[-0.035em]">
            ID категории и название для клиента — разные вещи
          </h2>

          <p className="mt-3 max-w-[980px] text-sm leading-relaxed text-white/55">
            В коде и БД будет храниться технический ключ, например{" "}
            <span className="font-semibold text-white">smartphones</span>. На
            сайте клиент увидит нормальное название:{" "}
            <span className="font-semibold text-white">Смартфоны</span>. Так мы
            избежим технических слов в интерфейсе и сможем удобно строить URL.
          </p>
        </section>
      </div>
    </main>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[26px] border border-white/10 bg-white/[0.035] p-6">
      <div className="text-sm text-white/45">{label}</div>
      <div className="mt-3 text-4xl font-bold">{value}</div>
    </div>
  );
}

function AdminCell({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-1 text-xs text-white/35 lg:hidden">{label}</div>
      <div className="text-sm text-white/70">{children}</div>
    </div>
  );
}