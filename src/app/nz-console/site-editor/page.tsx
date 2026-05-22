import Link from "next/link";

const siteBlocks = [
  {
    id: "hero",
    title: "Hero-блок",
    type: "Главный экран",
    description: "Заголовок, подзаголовок, кнопки и главный баннер.",
    status: "Включён",
    order: 1,
  },
  {
    id: "benefits",
    title: "Преимущества",
    type: "Информационный блок",
    description: "Оригинал, гарантия, доставка, оплата и поддержка.",
    status: "Включён",
    order: 2,
  },
  {
    id: "categories",
    title: "Категории",
    type: "Сетка категорий",
    description: "Основные разделы каталога на главной странице.",
    status: "Включён",
    order: 3,
  },
  {
    id: "popular-products",
    title: "Популярные товары",
    type: "Сетка товаров",
    description: "Товары с флагом popular или ручная подборка.",
    status: "Включён",
    order: 4,
  },
  {
    id: "new-arrivals",
    title: "Новинки",
    type: "Промо-блок",
    description: "Новые поступления и акцентные карточки.",
    status: "Включён",
    order: 5,
  },
  {
    id: "favorites",
    title: "Избранные товары",
    type: "Сетка товаров",
    description: "Ручная подборка товаров. Сейчас скрыта.",
    status: "Скрыт",
    order: 6,
  },
  {
    id: "support",
    title: "Сервис и поддержка",
    type: "FAQ / поддержка",
    description: "FAQ, карточки сервиса и помощь клиенту.",
    status: "Включён",
    order: 7,
  },
];

const catalogSettings = [
  {
    title: "Фильтры каталога",
    text: "Показывать общий фильтр, который можно открывать и скрывать.",
    active: true,
  },
  {
    title: "Брендовые ряды",
    text: "Показывать товары по брендам отдельными секциями.",
    active: true,
  },
  {
    title: "Кнопка “Развернуть”",
    text: "Скрывать часть товаров, чтобы не ломать эстетику каталога.",
    active: true,
  },
  {
    title: "SEO-текст категории",
    text: "Показывать текстовый блок внизу страницы категории.",
    active: false,
  },
];

const productPageSettings = [
  {
    title: "Похожие товары",
    text: "Показывать блок похожих товаров на странице товара.",
    active: true,
  },
  {
    title: "С этим товаром покупают",
    text: "Показывать аксессуары и связанные товары.",
    active: true,
  },
  {
    title: "Характеристики",
    text: "Показывать характеристики модели и выбранной позиции.",
    active: true,
  },
  {
    title: "SEO-блок",
    text: "Показывать видимый SEO-блок “О модели”.",
    active: true,
  },
  {
    title: "Доставка и гарантия",
    text: "Показывать условия доставки, гарантии и получения.",
    active: true,
  },
  {
    title: "FAQ товара",
    text: "Показывать вопросы и ответы на странице товара.",
    active: false,
  },
];

export default function AdminSiteEditorPage() {
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
            <span>Редактор сайта</span>
            <span>·</span>
            <span>витрина и блоки</span>
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
                Доступ: Главный админ / Редактор сайта
              </div>

              <h1 className="mt-5 text-5xl font-bold tracking-[-0.055em]">
                Редактор сайта
              </h1>

              <p className="mt-4 max-w-[840px] text-sm leading-relaxed text-white/55">
                Здесь управляем витриной сайта: логотипами, цветами, контактами,
                hero-блоком, блоками главной страницы, каталогом, страницей
                товара и SEO. Блоки можно скрывать, менять порядок и добавлять
                свои.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button className="rounded-xl border border-white/10 bg-white/[0.03] px-7 py-4 text-sm font-medium transition-colors hover:border-blue-500/40 hover:bg-blue-500/10">
                Предпросмотр
              </button>

              <button className="rounded-xl bg-blue-600 px-7 py-4 text-sm font-medium text-white transition-colors hover:bg-blue-500">
                Сохранить изменения →
              </button>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
          <div className="space-y-8">
            <section className="rounded-[34px] border border-white/10 bg-white/[0.035] p-8">
              <SectionTitle
                label="Брендинг"
                title="Внешний вид магазина"
                text="Базовые элементы, которые влияют на внешний вид всего сайта."
              />

              <div className="mt-8 grid gap-5 md:grid-cols-2">
                <Field label="Название магазина">
                  <input defaultValue="Netizen" className="admin-input" />
                </Field>

                <Field label="Тема по умолчанию">
                  <select className="admin-input" defaultValue="Системная">
                    <option>Системная</option>
                    <option>Светлая</option>
                    <option>Тёмная</option>
                  </select>
                </Field>

                <Field label="Логотип светлый">
                  <input defaultValue="/logo-light.png" className="admin-input" />
                </Field>

                <Field label="Логотип тёмный">
                  <input defaultValue="/logo-dark.png" className="admin-input" />
                </Field>

                <Field label="Основной цвет сайта">
                  <input defaultValue="#020814" className="admin-input" />
                </Field>

                <Field label="Акцентный цвет">
                  <input defaultValue="#2563eb" className="admin-input" />
                </Field>
              </div>
            </section>

            <section className="rounded-[34px] border border-white/10 bg-white/[0.035] p-8">
              <SectionTitle
                label="Контакты"
                title="Контакты на сайте"
                text="Эти данные будут показываться клиенту в футере, блоке поддержки, контактах и быстрых ссылках."
              />

              <div className="mt-8 grid gap-5 md:grid-cols-2">
                <Field label="Телефон">
                  <input defaultValue="+7 999 000-00-00" className="admin-input" />
                </Field>

                <Field label="E-mail">
                  <input defaultValue="hello@netizen.ru" className="admin-input" />
                </Field>

                <Field label="Telegram">
                  <input defaultValue="@netizen" className="admin-input" />
                </Field>

                <Field label="WhatsApp">
                  <input defaultValue="+7 999 000-00-00" className="admin-input" />
                </Field>

                <Field label="Город по умолчанию">
                  <input defaultValue="Москва" className="admin-input" />
                </Field>

                <Field label="Режим работы">
                  <input
                    defaultValue="Ежедневно, 10:00–21:00"
                    className="admin-input"
                  />
                </Field>

                <Field label="Адрес / шоурум">
                  <input
                    defaultValue="Москва, адрес будет указан позже"
                    className="admin-input"
                  />
                </Field>

                <Field label="Текст блока поддержки">
                  <input
                    defaultValue="Поможем подобрать технику, уточнить наличие и оформить заявку."
                    className="admin-input"
                  />
                </Field>
              </div>

              <div className="mt-6 rounded-2xl border border-blue-500/25 bg-blue-500/10 p-5">
                <div className="font-semibold text-blue-400">
                  Это часть витрины сайта
                </div>

                <p className="mt-2 text-sm leading-relaxed text-white/55">
                  Контакты видит клиент, поэтому они находятся в редакторе
                  сайта, а не в системных настройках. В настройках остаются
                  интеграции, роли, доставка, CRM и безопасность.
                </p>
              </div>
            </section>

            <section className="rounded-[34px] border border-white/10 bg-white/[0.035] p-8">
              <SectionTitle
                label="Главная"
                title="Hero-блок"
                text="Главный экран сайта: бейдж, заголовок, описание, кнопки и баннер."
              />

              <div className="mt-8 grid gap-5">
                <Field label="Бейдж">
                  <input
                    defaultValue="Оригинальная техника. Премиальный сервис."
                    className="admin-input"
                  />
                </Field>

                <Field label="Заголовок">
                  <textarea
                    defaultValue="Техника премиум-класса для тех, кто создаёт будущее."
                    className="admin-textarea min-h-[100px]"
                  />
                </Field>

                <Field label="Подзаголовок">
                  <textarea
                    defaultValue="Лучшие устройства от мировых брендов. Официальная гарантия, быстрая доставка и поддержка 24/7."
                    className="admin-textarea min-h-[120px]"
                  />
                </Field>

                <div className="grid gap-5 md:grid-cols-2">
                  <Field label="Главная кнопка">
                    <input
                      defaultValue="Перейти в каталог"
                      className="admin-input"
                    />
                  </Field>

                  <Field label="Ссылка главной кнопки">
                    <input defaultValue="/catalog" className="admin-input" />
                  </Field>

                  <Field label="Вторая кнопка">
                    <input defaultValue="Новинки" className="admin-input" />
                  </Field>

                  <Field label="Ссылка второй кнопки">
                    <input defaultValue="/new" className="admin-input" />
                  </Field>
                </div>

                <Field label="Баннер / слайдер">
                  <input defaultValue="hero-slider" className="admin-input" />
                </Field>

                <ToggleCard
                  title="Показывать Hero-блок"
                  text="Если выключить, главная начнётся сразу со следующего блока."
                  active
                />
              </div>
            </section>

            <section className="rounded-[34px] border border-white/10 bg-white/[0.035] p-8">
              <SectionTitle
                label="Блоки главной"
                title="Структура главной страницы"
                text="Блоки можно включать, скрывать, менять порядок и позже добавлять свои."
              />

              <div className="mt-8 grid gap-4">
                <div className="hidden grid-cols-[80px_1fr_0.85fr_120px_150px] gap-3 px-4 text-sm text-white/40 xl:grid">
                  <div>Порядок</div>
                  <div>Блок</div>
                  <div>Тип</div>
                  <div>Статус</div>
                  <div className="text-right">Действия</div>
                </div>

                {siteBlocks.map((block) => (
                  <div
                    key={block.id}
                    className="grid gap-4 rounded-2xl border border-white/10 bg-black/20 p-4 xl:grid-cols-[80px_1fr_0.85fr_120px_150px] xl:items-center"
                  >
                    <div>
                      <div className="mb-1 text-xs text-white/35 xl:hidden">
                        Порядок
                      </div>

                      <div className="text-xl font-bold text-blue-400">
                        {block.order}
                      </div>
                    </div>

                    <div>
                      <div className="font-semibold">{block.title}</div>

                      <p className="mt-1 text-sm leading-relaxed text-white/45">
                        {block.description}
                      </p>
                    </div>

                    <AdminCell label="Тип">{block.type}</AdminCell>

                    <AdminCell label="Статус">
                      <span
                        className={`inline-flex rounded-full border px-3 py-1 text-sm ${
                          block.status === "Включён"
                            ? "border-green-500/30 bg-green-500/10 text-green-300"
                            : "border-white/10 bg-white/[0.03] text-white/45"
                        }`}
                      >
                        {block.status}
                      </span>
                    </AdminCell>

                    <div className="flex flex-wrap gap-2 xl:justify-end">
                      <button className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-sm transition-colors hover:border-blue-500/40 hover:bg-blue-500/10">
                        Изменить
                      </button>

                      <button className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-white/50 transition-colors hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-300">
                        {block.status === "Включён" ? "Скрыть" : "Показать"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <button className="mt-6 rounded-xl bg-blue-600 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-500">
                Добавить свой блок →
              </button>
            </section>

            <section className="rounded-[34px] border border-white/10 bg-white/[0.035] p-8">
              <SectionTitle
                label="Добавить блок"
                title="Типы пользовательских блоков"
                text="Позже редактор сможет добавлять эти блоки на главную страницу без правки кода."
              />

              <div className="mt-8 grid gap-4 md:grid-cols-2">
                <BlockTypeCard
                  title="Баннер"
                  text="Заголовок, описание, изображение, кнопка и ссылка."
                />

                <BlockTypeCard
                  title="Сетка товаров"
                  text="Товары по источнику: popular, new, manual, category, brand."
                />

                <BlockTypeCard
                  title="Слайдер товаров"
                  text="Горизонтальная подборка товаров с ручным или автоматическим источником."
                />

                <BlockTypeCard
                  title="Сетка категорий"
                  text="Набор категорий с описаниями и быстрыми переходами."
                />

                <BlockTypeCard
                  title="FAQ"
                  text="Вопросы и ответы, которые можно показывать на главной или в товаре."
                />

                <BlockTypeCard
                  title="Промо-блок"
                  text="Акции, новинки, подборки и сезонные предложения."
                />
              </div>
            </section>

            <section className="rounded-[34px] border border-white/10 bg-white/[0.035] p-8">
              <SectionTitle
                label="Каталог"
                title="Настройки каталога"
                text="Управление фильтрами, брендовыми рядами и SEO-блоками категорий."
              />

              <div className="mt-8 grid gap-4 md:grid-cols-2">
                {catalogSettings.map((item) => (
                  <ToggleCard
                    key={item.title}
                    title={item.title}
                    text={item.text}
                    active={item.active}
                  />
                ))}
              </div>
            </section>

            <section className="rounded-[34px] border border-white/10 bg-white/[0.035] p-8">
              <SectionTitle
                label="Страница товара"
                title="Блоки карточки товара"
                text="Какие блоки показывать на странице конкретного товара."
              />

              <div className="mt-8 grid gap-4 md:grid-cols-2">
                {productPageSettings.map((item) => (
                  <ToggleCard
                    key={item.title}
                    title={item.title}
                    text={item.text}
                    active={item.active}
                  />
                ))}
              </div>
            </section>
          </div>

          <aside className="space-y-8">
            <section className="rounded-[34px] border border-white/10 bg-white/[0.035] p-8">
              <SectionTitle
                label="Доступ"
                title="Кто может редактировать"
                text="Редактор сайта управляет витриной, но не получает доступ к заявкам, CRM и ролям."
              />

              <div className="mt-6 grid gap-3">
                <InfoLine label="Главный админ" value="полный доступ" />
                <InfoLine label="Редактор сайта" value="витрина / SEO" />
                <InfoLine label="Контент-менеджер" value="товары / фото" />
              </div>
            </section>

            <section className="rounded-[34px] border border-blue-500/25 bg-blue-500/10 p-8">
              <div className="text-sm font-medium uppercase tracking-[0.2em] text-blue-400">
                Архитектура
              </div>

              <h2 className="mt-3 text-3xl font-bold tracking-[-0.04em]">
                Блоки не удаляются из кода
              </h2>

              <p className="mt-4 text-sm leading-relaxed text-white/55">
                Блок можно выключить, поменять порядок или источник данных.
                Например, “Избранные товары” можно скрыть, а позже снова
                включить без переписывания страницы.
              </p>
            </section>

            <section className="rounded-[34px] border border-white/10 bg-white/[0.035] p-8">
              <SectionTitle
                label="Источники товаров"
                title="Откуда брать товары"
                text="Для товарных блоков можно будет выбрать источник данных."
              />

              <div className="mt-6 grid gap-3">
                <InfoLine label="popular" value="популярные" />
                <InfoLine label="new" value="новинки" />
                <InfoLine label="manual" value="ручная подборка" />
                <InfoLine label="category" value="по категории" />
                <InfoLine label="brand" value="по бренду" />
              </div>
            </section>

            <section className="rounded-[34px] border border-white/10 bg-white/[0.035] p-8">
              <SectionTitle
                label="SEO"
                title="Витрина и индексация"
                text="SEO-блоки должны быть видимыми для пользователя, а не скрытыми."
              />

              <div className="mt-6 grid gap-3">
                <InfoLine label="Главная" value="title / description" />
                <InfoLine label="Категории" value="SEO-текст" />
                <InfoLine label="Товар" value="О модели" />
                <InfoLine label="Позиция" value="SEO позиции" />
              </div>
            </section>

            <section className="rounded-[34px] border border-white/10 bg-white/[0.035] p-8">
              <SectionTitle
                label="Связь"
                title="Где системные настройки"
                text="Интеграции, роли, доставка и безопасность находятся отдельно."
              />

              <Link
                href="/nz-console/settings"
                className="mt-6 inline-flex rounded-xl border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-medium transition-colors hover:border-blue-500/40 hover:bg-blue-500/10"
              >
                Открыть настройки →
              </Link>
            </section>
          </aside>
        </section>

        <style>{`
          .admin-input {
            height: 52px;
            width: 100%;
            border-radius: 14px;
            border: 1px solid rgba(255,255,255,0.1);
            background: rgba(0,0,0,0.2);
            padding: 0 18px;
            color: white;
            outline: none;
            font-size: 14px;
          }

          .admin-input::placeholder {
            color: rgba(255,255,255,0.35);
          }

          .admin-input:focus {
            border-color: rgba(59,130,246,0.55);
          }

          .admin-textarea {
            width: 100%;
            resize: vertical;
            border-radius: 18px;
            border: 1px solid rgba(255,255,255,0.1);
            background: rgba(0,0,0,0.2);
            padding: 18px;
            color: white;
            outline: none;
            font-size: 14px;
            line-height: 1.6;
          }

          .admin-textarea::placeholder {
            color: rgba(255,255,255,0.35);
          }

          .admin-textarea:focus {
            border-color: rgba(59,130,246,0.55);
          }
        `}</style>
      </div>
    </main>
  );
}

function SectionTitle({
  label,
  title,
  text,
}: {
  label: string;
  title: string;
  text: string;
}) {
  return (
    <div>
      <div className="text-sm font-medium uppercase tracking-[0.2em] text-blue-400">
        {label}
      </div>

      <h2 className="mt-3 text-3xl font-bold tracking-[-0.04em]">{title}</h2>

      <p className="mt-3 max-w-[720px] text-sm leading-relaxed text-white/50">
        {text}
      </p>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <div className="mb-2 text-sm font-medium text-white/70">{label}</div>
      {children}
    </label>
  );
}

function ToggleCard({
  title,
  text,
  active = false,
}: {
  title: string;
  text: string;
  active?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="font-semibold">{title}</div>

          <p className="mt-2 text-sm leading-relaxed text-white/45">{text}</p>
        </div>

        <span
          className={`flex h-7 w-12 shrink-0 items-center rounded-full p-1 ${
            active ? "bg-blue-600" : "bg-white/10"
          }`}
        >
          <span
            className={`h-5 w-5 rounded-full bg-white transition-transform ${
              active ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </span>
      </div>
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
      <div className="mb-1 text-xs text-white/35 xl:hidden">{label}</div>
      <div className="text-sm text-white/70">{children}</div>
    </div>
  );
}

function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-5 rounded-2xl border border-white/10 bg-black/20 p-4 text-sm">
      <span className="text-white/45">{label}</span>
      <span className="text-right font-semibold">{value}</span>
    </div>
  );
}

function BlockTypeCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
      <div className="font-semibold">{title}</div>

      <p className="mt-2 text-sm leading-relaxed text-white/45">{text}</p>

      <button className="mt-5 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-medium transition-colors hover:border-blue-500/40 hover:bg-blue-500/10">
        Добавить →
      </button>
    </div>
  );
}