import Link from "next/link";

const integrations = [
  {
    name: "МойСклад",
    key: "moysklad",
    status: "Не подключено",
    access: "Главный админ / Технический админ",
    text: "Остатки, склад, документы и синхронизация позиций по SKU.",
  },
  {
    name: "CRM",
    key: "crm",
    status: "Планируется",
    access: "Главный админ / Технический админ",
    text: "Передача заявок, клиентов, доставки и статусов заказов.",
  },
  {
    name: "Telegram",
    key: "telegram",
    status: "Не подключено",
    access: "Главный админ / Менеджер",
    text: "Уведомления о новых заявках, обращениях и ошибках интеграций.",
  },
  {
    name: "Оплата",
    key: "payments",
    status: "Позже",
    access: "Главный админ / Технический админ",
    text: "Платёжные ссылки, статусы оплат и webhook-уведомления.",
  },
];

const deliveryTypes = [
  {
    title: "Курьерская доставка",
    key: "courier",
    crmField: "delivery.type = courier",
    text: "Клиент указывает адрес, CRM получает технический тип courier и поле delivery.address.",
    active: true,
  },
  {
    title: "Пункт выдачи",
    key: "pickup_point",
    crmField: "delivery.type = pickup_point",
    text: "Клиент выбирает ПВЗ, CRM получает pickupPointId и pickupPointLabel.",
    active: true,
  },
  {
    title: "Самовывоз",
    key: "self_pickup",
    crmField: "delivery.type = self_pickup",
    text: "Клиент забирает заказ из точки магазина. Позже добавим список точек самовывоза.",
    active: false,
  },
];

const roles = [
  {
    name: "Главный админ",
    key: "owner",
    access: "Полный доступ",
    permissions: "Все разделы, роли, интеграции, безопасность.",
  },
  {
    name: "Редактор сайта",
    key: "site_editor",
    access: "Витрина сайта",
    permissions: "Редактор сайта, SEO, блоки главной, каталог, страница товара.",
  },
  {
    name: "Контент-менеджер",
    key: "content_manager",
    access: "Товары и контент",
    permissions: "Карточки товаров, позиции, категории, фото, характеристики.",
  },
  {
    name: "Менеджер",
    key: "manager",
    access: "Продажи",
    permissions: "Заявки, клиенты, обращения, подтверждение заказов.",
  },
  {
    name: "Оператор поддержки",
    key: "support_operator",
    access: "Обращения",
    permissions: "Обращения, ответы клиентам, связь с заявками.",
  },
  {
    name: "Склад",
    key: "warehouse",
    access: "Остатки",
    permissions: "Позиции, наличие, статусы склада, импорт XLSX.",
  },
];

const managers = [
  {
    name: "Дания",
    email: "admin@netizen.ru",
    role: "Главный админ",
    status: "Активен",
  },
  {
    name: "Менеджер 1",
    email: "manager@netizen.ru",
    role: "Менеджер",
    status: "Активен",
  },
  {
    name: "Редактор",
    email: "editor@netizen.ru",
    role: "Редактор сайта",
    status: "Приглашение",
  },
];

const notifications = [
  {
    title: "Новые заявки",
    text: "Уведомлять менеджеров о новых заявках с сайта.",
    channel: "Telegram / админка",
    active: true,
  },
  {
    title: "Новые обращения",
    text: "Уведомлять поддержку о новых сообщениях клиентов.",
    channel: "Telegram / админка",
    active: true,
  },
  {
    title: "Ошибки CRM",
    text: "Сообщать главному админу об ошибках синхронизации.",
    channel: "Telegram",
    active: true,
  },
  {
    title: "Низкий остаток",
    text: "Уведомлять, если позиция заканчивается на складе.",
    channel: "Админка",
    active: false,
  },
];

export default function AdminSettingsPage() {
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
            <span>Настройки</span>
            <span>·</span>
            <span>система и доступы</span>
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
                Системные настройки
              </div>

              <h1 className="mt-5 text-5xl font-bold tracking-[-0.055em]">
                Настройки
              </h1>

              <p className="mt-4 max-w-[820px] text-sm leading-relaxed text-white/55">
                Здесь находятся внутренние настройки системы: доставка и
                CRM-ключи, интеграции, уведомления, команда, роли и
                безопасность. Всё, что касается внешнего вида сайта, вынесено в
                “Редактор сайта”.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/nz-console/site-editor"
                className="rounded-xl border border-white/10 bg-white/[0.03] px-7 py-4 text-sm font-medium transition-colors hover:border-blue-500/40 hover:bg-blue-500/10"
              >
                Редактор сайта
              </Link>

              <button className="rounded-xl bg-blue-600 px-7 py-4 text-sm font-medium text-white transition-colors hover:bg-blue-500">
                Сохранить настройки →
              </button>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-5 md:grid-cols-4">
          <MetricCard label="Интеграции" value={String(integrations.length)} />
          <MetricCard label="Роли" value={String(roles.length)} />
          <MetricCard label="Сотрудники" value={String(managers.length)} />
          <MetricCard label="Доставка" value={String(deliveryTypes.length)} />
        </section>

        <section className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
          <div className="space-y-8">
            <section className="rounded-[34px] border border-white/10 bg-white/[0.035] p-8">
              <SectionTitle
                label="Доставка"
                title="Способы получения и CRM-ключи"
                text="Менеджер видит понятное название доставки, а CRM получает стабильный технический ключ."
              />

              <div className="mt-8 grid gap-4">
                {deliveryTypes.map((item) => (
                  <div
                    key={item.key}
                    className="rounded-2xl border border-white/10 bg-black/20 p-5"
                  >
                    <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-3">
                          <h3 className="text-xl font-bold">{item.title}</h3>

                          <span
                            className={`rounded-full border px-3 py-1 text-sm ${
                              item.active
                                ? "border-green-500/30 bg-green-500/10 text-green-300"
                                : "border-white/10 bg-white/[0.03] text-white/45"
                            }`}
                          >
                            {item.active ? "Активен" : "Выключен"}
                          </span>
                        </div>

                        <p className="mt-3 text-sm leading-relaxed text-white/50">
                          {item.text}
                        </p>

                        <div className="mt-4 flex flex-wrap gap-2">
                          <span className="rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs text-blue-400">
                            {item.key}
                          </span>

                          <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-white/45">
                            {item.crmField}
                          </span>
                        </div>
                      </div>

                      <button className="w-fit rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-sm transition-colors hover:border-blue-500/40 hover:bg-blue-500/10">
                        Изменить
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <button className="mt-6 rounded-xl border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-medium transition-colors hover:border-blue-500/40 hover:bg-blue-500/10">
                Добавить способ доставки →
              </button>
            </section>

            <section className="rounded-[34px] border border-white/10 bg-white/[0.035] p-8">
              <SectionTitle
                label="Интеграции"
                title="Внешние сервисы"
                text="Сайт не должен напрямую зависеть от внешних сервисов. Всё идёт через нашу БД и backend."
              />

              <div className="mt-8 grid gap-4 md:grid-cols-2">
                {integrations.map((item) => (
                  <div
                    key={item.key}
                    className="rounded-2xl border border-white/10 bg-black/20 p-5"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-xl font-bold">{item.name}</h3>

                        <p className="mt-2 text-sm leading-relaxed text-white/45">
                          {item.text}
                        </p>
                      </div>

                      <span className="whitespace-nowrap rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-white/45">
                        {item.status}
                      </span>
                    </div>

                    <div className="mt-5 rounded-xl border border-white/10 bg-white/[0.03] p-3 text-xs text-white/45">
                      Доступ: {item.access}
                    </div>

                    <button className="mt-4 w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-medium transition-colors hover:border-blue-500/40 hover:bg-blue-500/10">
                      Настроить →
                    </button>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-[34px] border border-white/10 bg-white/[0.035] p-8">
              <SectionTitle
                label="Уведомления"
                title="Системные события"
                text="Что отправлять менеджерам, поддержке и главному админу."
              />

              <div className="mt-8 grid gap-4 md:grid-cols-2">
                {notifications.map((item) => (
                  <ToggleCard
                    key={item.title}
                    title={item.title}
                    text={item.text}
                    channel={item.channel}
                    active={item.active}
                  />
                ))}
              </div>
            </section>

            <section className="rounded-[34px] border border-white/10 bg-white/[0.035] p-8">
              <SectionTitle
                label="Команда"
                title="Менеджеры и сотрудники"
                text="Главный админ добавляет сотрудников и назначает им роли."
              />

              <div className="mt-8 grid gap-4">
                {managers.map((manager) => (
                  <div
                    key={manager.email}
                    className="rounded-2xl border border-white/10 bg-black/20 p-5"
                  >
                    <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                      <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-lg font-bold">
                          {manager.name.slice(0, 1)}
                        </div>

                        <div>
                          <h3 className="text-lg font-bold">{manager.name}</h3>
                          <p className="mt-1 text-sm text-white/45">
                            {manager.email}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <span className="rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-sm text-blue-400">
                          {manager.role}
                        </span>

                        <span className="rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1 text-sm text-green-300">
                          {manager.status}
                        </span>

                        <button className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-sm transition-colors hover:border-blue-500/40 hover:bg-blue-500/10">
                          Изменить
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button className="mt-6 rounded-xl bg-blue-600 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-500">
                Добавить сотрудника →
              </button>
            </section>

            <section className="rounded-[34px] border border-white/10 bg-white/[0.035] p-8">
              <SectionTitle
                label="Роли"
                title="Права доступа"
                text="Каждая роль получает доступ только к нужным разделам админки."
              />

              <div className="mt-8 grid gap-4">
                {roles.map((role) => (
                  <div
                    key={role.key}
                    className="rounded-2xl border border-white/10 bg-black/20 p-5"
                  >
                    <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-3">
                          <h3 className="text-xl font-bold">{role.name}</h3>

                          <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-white/45">
                            {role.key}
                          </span>
                        </div>

                        <p className="mt-3 text-sm leading-relaxed text-white/50">
                          {role.permissions}
                        </p>
                      </div>

                      <span className="w-fit rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-sm text-blue-400">
                        {role.access}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <button className="mt-6 rounded-xl border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-medium transition-colors hover:border-blue-500/40 hover:bg-blue-500/10">
                Создать роль →
              </button>
            </section>
          </div>

          <aside className="space-y-8">
            <section className="rounded-[34px] border border-blue-500/25 bg-blue-500/10 p-8">
              <div className="text-sm font-medium uppercase tracking-[0.2em] text-blue-400">
                Важно
              </div>

              <h2 className="mt-3 text-3xl font-bold tracking-[-0.04em]">
                Витрина отдельно
              </h2>

              <p className="mt-4 text-sm leading-relaxed text-white/55">
                Логотипы, цвета, hero, блоки главной, каталог и страница товара
                находятся в “Редакторе сайта”. Настройки — это системная часть:
                интеграции, роли, доставка и безопасность.
              </p>

              <Link
                href="/nz-console/site-editor"
                className="mt-6 inline-flex rounded-xl bg-blue-600 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-500"
              >
                Открыть редактор сайта →
              </Link>
            </section>

            <section className="rounded-[34px] border border-white/10 bg-white/[0.035] p-8">
              <SectionTitle
                label="Безопасность"
                title="Админка"
                text="Защита доступа и системные ограничения."
              />

              <div className="mt-6 grid gap-3">
                <InfoLine label="Адрес админки" value="/nz-console" />
                <InfoLine label="Роли" value="6 ролей" />
                <InfoLine label="2FA" value="позже" />
                <InfoLine label="Логи действий" value="позже" />
                <InfoLine label="Сессии" value="позже" />
              </div>
            </section>

            <section className="rounded-[34px] border border-white/10 bg-white/[0.035] p-8">
              <SectionTitle
                label="Backend"
                title="Слой интеграций"
                text="Все внешние сервисы подключаются только через backend."
              />

              <div className="mt-6 grid gap-3">
                <InfoLine label="Сайт" value="наша БД" />
                <InfoLine label="МойСклад" value="через API" />
                <InfoLine label="CRM" value="webhook / API" />
                <InfoLine label="Telegram" value="bot API" />
                <InfoLine label="Оплата" value="webhook" />
              </div>
            </section>

            <section className="rounded-[34px] border border-white/10 bg-white/[0.035] p-8">
              <SectionTitle
                label="Импорт"
                title="XLSX"
                text="Массовые обновления должны идти через позиции / SKU."
              />

              <div className="mt-6 grid gap-3">
                <InfoLine label="Обновление" value="по SKU" />
                <InfoLine label="Цена" value="позиция" />
                <InfoLine label="Остаток" value="позиция" />
                <InfoLine label="Статус" value="позиция" />
              </div>
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

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[26px] border border-white/10 bg-white/[0.035] p-6">
      <div className="text-sm text-white/45">{label}</div>
      <div className="mt-3 text-4xl font-bold">{value}</div>
    </div>
  );
}

function ToggleCard({
  title,
  text,
  channel,
  active = false,
}: {
  title: string;
  text: string;
  channel: string;
  active?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="font-semibold">{title}</div>

          <p className="mt-2 text-sm leading-relaxed text-white/45">{text}</p>

          <div className="mt-3 w-fit rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-white/45">
            {channel}
          </div>
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

function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-5 rounded-2xl border border-white/10 bg-black/20 p-4 text-sm">
      <span className="text-white/45">{label}</span>
      <span className="text-right font-semibold">{value}</span>
    </div>
  );
}