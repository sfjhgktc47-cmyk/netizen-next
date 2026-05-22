import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { products } from "@/data/products";

type Product = (typeof products)[number];

type AlbumItem = {
  product?: Product;
  label?: string;
  title?: string;
  description?: string;
  price?: string;
  href?: string;
  accent?: boolean;
};

function findProduct(slug: string, fallbackIndex = 0) {
  return products.find((product) => product.slug === slug) ?? products[fallbackIndex] ?? products[0];
}

const albumRows = [
  {
    type: "wide-with-two",
    main: {
      product: findProduct("iphone-17", 1),
      label: "Новинка",
      title: "iPhone 17e",
      description:
        "Мощь. Красота. Доступнее. A19, великолепный OLED-дисплей и до 26 часов работы без подзарядки.",
      price: "от 89 990 ₽",
      href: "/catalog?category=smartphones",
    },
    left: {
      product: findProduct("iphone-air", 2),
      label: "Новинка",
    },
    right: {
      product: findProduct("iphone-16-pro", 3),
      label: "Новинка",
      accent: true,
    },
  },
  {
    type: "large-with-stack",
    main: {
      product: findProduct("iphone-17-pro", 0),
      label: "Главная новинка",
      accent: true,
    },
    left: {
      product: findProduct("iphone-17", 1),
      label: "Новинка",
    },
    right: {
      product: findProduct("airpods-pro", 7),
      label: "Аксессуар",
      accent: true,
    },
  },
  {
    type: "wide-with-two",
    main: {
      product: findProduct("macbook-pro-14", 4),
      label: "Для работы",
    },
    left: {
      product: findProduct("macbook-air-13", 5),
      label: "Лёгкий ноутбук",
    },
    right: {
      product: findProduct("ipad-pro-11", 6),
      label: "Планшет",
      accent: true,
    },
  },
  {
    type: "wide-with-two",
    main: {
      product: findProduct("samsung-galaxy-s25-ultra", 9),
      label: "Android-флагман",
      accent: true,
    },
    left: {
      product: findProduct("playstation-5-slim", 28),
      label: "Игровая техника",
    },
    right: {
      product: findProduct("dyson-v15-detect", 17),
      label: "Для дома",
      accent: true,
    },
  },
];

export default function NewPage() {
  return (
    <main className="min-h-screen bg-page px-4 py-4 text-main transition-colors duration-700 sm:px-6">
      <div className="mx-auto max-w-[1760px]">
        <SiteHeader />

        <div className="mt-5 space-y-5 md:mt-6 md:space-y-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="space-y-3">
              <Link
                href="/"
                className="block text-sm font-medium text-blue-500 hover:text-blue-400"
              >
                ← На главную
              </Link>

              <div className="inline-flex w-fit rounded-full border border-blue-500/40 bg-blue-500/10 px-4 py-2 text-xs font-medium uppercase tracking-[0.16em] text-blue-500">
                Альбом новинок
              </div>
            </div>

            <Link
              href="/catalog"
              className="inline-flex w-fit rounded-xl border border-theme px-5 py-3 text-sm font-semibold transition-colors hover:border-blue-500/40 hover:bg-blue-soft"
            >
              Открыть каталог →
            </Link>
          </div>

          <section className="space-y-5 md:space-y-6">
            {albumRows.map((row, index) => {
              if (row.type === "large-with-stack") {
                return (
                  <div key={index} className="grid gap-5 xl:grid-cols-[1.25fr_0.8fr]">
                    <LargeAlbumCard item={row.main} />
                    <div className="grid gap-5">
                      <CompactAlbumCard item={row.left} />
                      <CompactAlbumCard item={row.right} />
                    </div>
                  </div>
                );
              }

              return (
                <div key={index} className="grid gap-5">
                  <WideAlbumCard item={row.main} />
                  <div className="grid gap-5 xl:grid-cols-2">
                    <MediumAlbumCard item={row.left} />
                    <MediumAlbumCard item={row.right} />
                  </div>
                </div>
              );
            })}
          </section>

          <section className="rounded-[28px] border border-blue-500/20 bg-blue-soft p-6 sm:p-8">
            <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
              <div>
                <div className="inline-flex rounded-full border border-blue-500/40 bg-blue-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-blue-500">
                  Нужна помощь?
                </div>

                <h2 className="mt-4 text-3xl font-bold tracking-[-0.04em] text-main sm:text-4xl">
                  Не нашли нужную новинку?
                </h2>

                <p className="mt-3 max-w-[620px] text-sm leading-relaxed text-muted">
                  Напишите в поддержку — менеджер поможет подобрать модель, уточнит
                  наличие, конфигурацию, цену и способ получения.
                </p>

                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    href="/help"
                    className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-500"
                  >
                    Написать в поддержку →
                  </Link>

                  <Link
                    href="/faq"
                    className="rounded-xl border border-theme px-5 py-3 text-sm font-semibold transition-colors hover:border-blue-500/40 hover:bg-white/60"
                  >
                    Открыть FAQ
                  </Link>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-[22px] border border-theme bg-white/70 p-4">
                  <div className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-500">
                    Подбор
                  </div>
                  <div className="mt-2 text-sm text-main">
                    Поможем выбрать модель под задачи, бюджет и сценарий использования.
                  </div>
                </div>

                <div className="rounded-[22px] border border-theme bg-white/70 p-4">
                  <div className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-500">
                    Наличие
                  </div>
                  <div className="mt-2 text-sm text-main">
                    Уточним, что есть сейчас и что можно привезти под заказ.
                  </div>
                </div>

                <div className="rounded-[22px] border border-theme bg-white/70 p-4 sm:col-span-2">
                  <div className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-500">
                    Конфигурация
                  </div>
                  <div className="mt-2 text-sm text-main">
                    Подскажем по памяти, цвету, SIM, аксессуарам, доставке и итоговой цене.
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

function getItemHref(item: AlbumItem) {
  if (item.href) {
    return item.href;
  }

  return item.product ? `/product/${item.product.slug}` : "/catalog";
}

function getTitle(item: AlbumItem) {
  return item.title ?? item.product?.name ?? "Новая модель";
}

function getDescription(item: AlbumItem) {
  return item.description ?? item.product?.description ?? "Свежая позиция в подборке Netizen.";
}

function getPrice(item: AlbumItem) {
  return item.price ?? item.product?.price ?? "Цена по запросу";
}

function WideAlbumCard({ item }: { item: AlbumItem }) {
  return (
    <Link
      href={getItemHref(item)}
      className={`group relative min-h-[260px] overflow-hidden rounded-[24px] border p-5 transition-all duration-300 hover:-translate-y-1 hover:border-blue-500/35 sm:min-h-[300px] sm:rounded-[28px] sm:p-7 ${
        item.accent ? "border-blue-500/35 bg-blue-soft" : "card"
      }`}
    >
      <CardGlow />

      <div className="relative z-10 grid h-full gap-6 md:grid-cols-[0.78fr_1.22fr] md:items-center">
        <div>
          <AlbumBadge>{item.label ?? "Новинка"}</AlbumBadge>
          <h1 className="mt-5 text-3xl font-bold tracking-[-0.055em] sm:text-5xl">
            {getTitle(item)}
          </h1>
          <p className="mt-4 max-w-[470px] text-sm leading-relaxed text-muted">
            {getDescription(item)}
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-5">
            <span className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition-colors group-hover:bg-blue-500">
              Подробнее →
            </span>
            <span className="text-sm font-bold text-main">{getPrice(item)}</span>
          </div>
        </div>

        <ProductPhoto className="min-h-[220px] sm:min-h-[250px]" label="Фото товара" />
      </div>
    </Link>
  );
}

function MediumAlbumCard({ item }: { item: AlbumItem }) {
  return (
    <Link
      href={getItemHref(item)}
      className={`group relative min-h-[230px] overflow-hidden rounded-[24px] border p-5 transition-all duration-300 hover:-translate-y-1 hover:border-blue-500/35 sm:min-h-[255px] sm:rounded-[28px] sm:p-6 ${
        item.accent ? "border-blue-500/35 bg-blue-soft" : "card"
      }`}
    >
      <CardGlow />

      <div className="relative z-10 grid h-full gap-5 sm:grid-cols-[0.78fr_1fr] sm:items-center">
        <div>
          <AlbumBadge>{item.label ?? "Новинка"}</AlbumBadge>
          <h2 className="mt-4 text-3xl font-bold tracking-[-0.045em]">{getTitle(item)}</h2>
          <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted">
            {getDescription(item)}
          </p>

          <div className="mt-7 flex items-center gap-4">
            <span className="text-sm font-bold">{getPrice(item)}</span>
            <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-500/30 bg-blue-500/10 text-blue-500 transition-all duration-300 group-hover:translate-x-1 group-hover:bg-blue-500 group-hover:text-white">
              →
            </span>
          </div>
        </div>

        <ProductPhoto className="min-h-[165px] sm:min-h-[185px]" label="Фото" />
      </div>
    </Link>
  );
}

function LargeAlbumCard({ item }: { item: AlbumItem }) {
  return (
    <Link
      href={getItemHref(item)}
      className="group relative min-h-[360px] overflow-hidden rounded-[24px] border border-blue-500/35 bg-blue-soft p-5 transition-all duration-300 hover:-translate-y-1 hover:border-blue-500/45 sm:min-h-[430px] sm:rounded-[30px] sm:p-7"
    >
      <CardGlow />

      <div className="relative z-10 grid h-full gap-8 md:grid-cols-[0.9fr_1.1fr] md:items-end">
        <div>
          <AlbumBadge>{item.label ?? "Главная новинка"}</AlbumBadge>
          <h2 className="mt-6 text-4xl font-bold tracking-[-0.06em] sm:text-5xl">{getTitle(item)}</h2>
          <p className="mt-4 max-w-[450px] text-sm leading-relaxed text-muted">
            {getDescription(item)}
          </p>

          <div className="mt-14 sm:mt-20">
            <div className="text-2xl font-bold">{getPrice(item)}</div>

            {item.product?.colors?.length ? (
              <div className="mt-5 flex gap-3">
                {item.product.colors.slice(0, 4).map((color) => (
                  <span
                    key={color}
                    className="h-6 w-6 rounded-full border border-theme"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            ) : null}

            <div className="mt-7 inline-flex rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition-colors group-hover:bg-blue-500">
              Подробнее →
            </div>
          </div>
        </div>

        <ProductPhoto className="min-h-[230px]" label="Фото товара" />
      </div>
    </Link>
  );
}

function CompactAlbumCard({ item }: { item: AlbumItem }) {
  return (
    <Link
      href={getItemHref(item)}
      className={`group relative min-h-[205px] overflow-hidden rounded-[26px] border p-5 transition-all duration-300 hover:-translate-y-1 hover:border-blue-500/35 ${
        item.accent ? "border-blue-500/35 bg-blue-soft" : "card"
      }`}
    >
      <CardGlow />

      <div className="relative z-10 grid h-full gap-4 sm:grid-cols-[140px_1fr] sm:items-center">
        <ProductPhoto className="min-h-[135px]" label="Фото" />

        <div>
          <AlbumBadge>{item.label ?? "Новинка"}</AlbumBadge>
          <h3 className="mt-3 text-2xl font-bold tracking-[-0.04em]">{getTitle(item)}</h3>
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted">
            {getDescription(item)}
          </p>

          <div className="mt-5 flex items-center justify-between gap-4">
            <span className="text-sm font-bold">{getPrice(item)}</span>
            <span className="text-sm font-semibold text-blue-500">Подробнее →</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function AlbumBadge({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex rounded-full border border-blue-500/40 bg-blue-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-blue-500">
      {children}
    </div>
  );
}

function ProductPhoto({ className, label }: { className: string; label: string }) {
  return (
    <div className={`soft-box relative flex items-center justify-center overflow-hidden rounded-[22px] text-sm text-muted-soft ${className}`}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_28%,rgba(37,99,235,0.08),transparent_45%)]" />
      <span className="relative z-10">{label}</span>
    </div>
  );
}

function CardGlow() {
  return (
    <>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_84%_24%,rgba(37,99,235,0.13),transparent_42%)]" />
      <div className="absolute -bottom-24 right-0 h-[260px] w-[420px] rounded-full bg-blue-600/10 blur-3xl" />
    </>
  );
}
