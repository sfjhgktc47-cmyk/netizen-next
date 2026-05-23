"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import type { SiteEditorSettings } from "@/lib/site-settings-db";

type SaveState = "idle" | "saving" | "saved" | "error";

type Props = {
  initialSettings: SiteEditorSettings;
};

const blockLabels: Record<string, string> = {
  hero: "Hero",
  benefits: "Преимущества",
  categories: "Категории",
  "popular-products": "Популярные",
  "new-arrivals": "Новинки",
  support: "Поддержка",
};

export function SiteEditorForm({ initialSettings }: Props) {
  const [settings, setSettings] = useState(initialSettings);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const enabledBlocks = useMemo(
    () => settings.homeBlocks.filter((block) => block.enabled).length,
    [settings.homeBlocks]
  );

  function updateBranding<K extends keyof SiteEditorSettings["branding"]>(key: K, value: SiteEditorSettings["branding"][K]) {
    setSettings((current) => ({
      ...current,
      branding: {
        ...current.branding,
        [key]: value,
      },
    }));
  }

  function updateContacts<K extends keyof SiteEditorSettings["contacts"]>(key: K, value: SiteEditorSettings["contacts"][K]) {
    setSettings((current) => ({
      ...current,
      contacts: {
        ...current.contacts,
        [key]: value,
      },
    }));
  }

  function updateSeo<K extends keyof SiteEditorSettings["seo"]>(key: K, value: SiteEditorSettings["seo"][K]) {
    setSettings((current) => ({
      ...current,
      seo: {
        ...current.seo,
        [key]: value,
      },
    }));
  }

  function updateCatalog(key: keyof SiteEditorSettings["catalog"], value: boolean) {
    setSettings((current) => ({
      ...current,
      catalog: {
        ...current.catalog,
        [key]: value,
      },
    }));
  }

  function updateProductPage(key: keyof SiteEditorSettings["productPage"], value: boolean) {
    setSettings((current) => ({
      ...current,
      productPage: {
        ...current.productPage,
        [key]: value,
      },
    }));
  }

  function updateBlock(id: string, patch: Partial<SiteEditorSettings["homeBlocks"][number]>) {
    setSettings((current) => ({
      ...current,
      homeBlocks: current.homeBlocks.map((block) =>
        block.id === id ? { ...block, ...patch } : block
      ),
    }));
  }

  async function saveSettings() {
    setSaveState("saving");

    const response = await fetch("/api/admin/site-settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scope: "site", value: settings }),
    }).catch(() => null);

    if (!response?.ok) {
      setSaveState("error");
      return;
    }

    const payload = (await response.json().catch(() => null)) as {
      site?: SiteEditorSettings;
    } | null;

    if (payload?.site) {
      setSettings(payload.site);
    }

    setSaveState("saved");
    window.setTimeout(() => setSaveState("idle"), 2500);
  }

  return (
    <main className="min-h-screen bg-[#020814] px-4 py-4 text-white sm:px-6 sm:py-6">
      <div className="mx-auto max-w-[1440px]">
        <header className="flex min-h-[76px] flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.035] px-4 sm:px-6">
          <Link href="/nz-console" className="text-xl font-bold tracking-[-0.04em]">
            Netizen Console
          </Link>

          <div className="hidden items-center gap-3 text-sm text-white/55 md:flex">
            <span>Редактор сайта</span>
            <span>·</span>
            <span>сохраняется в БД</span>
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
              <div className="inline-flex rounded-full border border-blue-500/35 bg-blue-500/10 px-4 py-2 text-sm font-medium text-blue-400">
                Витрина сайта
              </div>

              <h1 className="mt-5 text-5xl font-bold tracking-[-0.055em]">
                Редактор сайта
              </h1>

              <p className="mt-4 max-w-[860px] text-sm leading-relaxed text-white/55">
                Здесь меняется внешний вид магазина: логотипы, контакты, SEO,
                включение блоков главной, настройки каталога и страницы товара.
                Данные сохраняются в PostgreSQL и дальше используются сайтом.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/"
                target="_blank"
                className="rounded-xl border border-white/10 bg-white/[0.03] px-7 py-4 text-sm font-medium transition-colors hover:border-blue-500/40 hover:bg-blue-500/10"
              >
                Предпросмотр
              </Link>

              <button
                type="button"
                onClick={saveSettings}
                disabled={saveState === "saving"}
                className="rounded-xl bg-blue-600 px-7 py-4 text-sm font-medium text-white transition-colors hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saveState === "saving" ? "Сохраняю..." : "Сохранить изменения →"}
              </button>
            </div>
          </div>

          {saveState === "saved" && (
            <div className="mt-5 rounded-2xl border border-green-500/30 bg-green-500/10 px-5 py-4 text-sm text-green-300">
              Изменения сохранены в БД.
            </div>
          )}

          {saveState === "error" && (
            <div className="mt-5 rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-sm text-red-300">
              Не удалось сохранить настройки. Проверьте авторизацию и подключение к БД.
            </div>
          )}
        </section>

        <section className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
          <div className="space-y-8">
            <section className="rounded-[34px] border border-white/10 bg-white/[0.035] p-6 sm:p-8">
              <SectionTitle
                label="Брендинг"
                title="Внешний вид магазина"
                text="Логотипы, название, тема и основные цвета сайта."
              />

              <div className="mt-8 grid gap-5 md:grid-cols-2">
                <Field label="Название магазина">
                  <input
                    value={settings.branding.storeName}
                    onChange={(event) => updateBranding("storeName", event.target.value)}
                    className="admin-input"
                  />
                </Field>

                <Field label="Тема по умолчанию">
                  <select
                    className="admin-input"
                    value={settings.branding.defaultTheme}
                    onChange={(event) =>
                      updateBranding(
                        "defaultTheme",
                        event.target.value as SiteEditorSettings["branding"]["defaultTheme"]
                      )
                    }
                  >
                    <option value="system">Системная</option>
                    <option value="light">Светлая</option>
                    <option value="dark">Тёмная</option>
                  </select>
                </Field>

                <Field label="Логотип для тёмной темы">
                  <input
                    value={settings.branding.logoLight}
                    onChange={(event) => updateBranding("logoLight", event.target.value)}
                    className="admin-input"
                  />
                </Field>

                <Field label="Логотип для светлой темы">
                  <input
                    value={settings.branding.logoDark}
                    onChange={(event) => updateBranding("logoDark", event.target.value)}
                    className="admin-input"
                  />
                </Field>

                <Field label="Основной цвет">
                  <input
                    value={settings.branding.primaryColor}
                    onChange={(event) => updateBranding("primaryColor", event.target.value)}
                    className="admin-input"
                  />
                </Field>

                <Field label="Акцентный цвет">
                  <input
                    value={settings.branding.accentColor}
                    onChange={(event) => updateBranding("accentColor", event.target.value)}
                    className="admin-input"
                  />
                </Field>
              </div>
            </section>

            <section className="rounded-[34px] border border-white/10 bg-white/[0.035] p-6 sm:p-8">
              <SectionTitle
                label="Главная"
                title="Блоки главной страницы"
                text="Блоки можно скрывать и менять порядок. Удалять из кода их не нужно."
              />

              <div className="mt-8 grid gap-4">
                {settings.homeBlocks.map((block) => (
                  <div key={block.id} className="rounded-2xl border border-white/10 bg-black/20 p-5">
                    <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-3">
                          <h3 className="text-xl font-bold">{block.title}</h3>
                          <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-white/45">
                            {blockLabels[block.id] ?? block.id}
                          </span>
                          <span
                            className={`rounded-full border px-3 py-1 text-xs ${
                              block.enabled
                                ? "border-green-500/30 bg-green-500/10 text-green-300"
                                : "border-red-500/30 bg-red-500/10 text-red-300"
                            }`}
                          >
                            {block.enabled ? "Включён" : "Скрыт"}
                          </span>
                        </div>

                        <p className="mt-3 text-sm leading-relaxed text-white/50">
                          {block.description}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-3">
                        <input
                          type="number"
                          min={1}
                          value={block.order}
                          onChange={(event) => updateBlock(block.id, { order: Number(event.target.value) })}
                          className="h-11 w-24 rounded-xl border border-white/10 bg-black/20 px-4 text-sm text-white outline-none focus:border-blue-500/50"
                          aria-label={`Порядок блока ${block.title}`}
                        />
                        <button
                          type="button"
                          onClick={() => updateBlock(block.id, { enabled: !block.enabled })}
                          className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-sm transition-colors hover:border-blue-500/40 hover:bg-blue-500/10"
                        >
                          {block.enabled ? "Скрыть" : "Показать"}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-[34px] border border-white/10 bg-white/[0.035] p-6 sm:p-8">
              <SectionTitle
                label="Контакты"
                title="Контакты на сайте"
                text="Эти данные используются в футере, поддержке и быстрых ссылках."
              />

              <div className="mt-8 grid gap-5 md:grid-cols-2">
                <Field label="Телефон">
                  <input value={settings.contacts.phone} onChange={(event) => updateContacts("phone", event.target.value)} className="admin-input" />
                </Field>
                <Field label="Подпись телефона">
                  <input value={settings.contacts.phoneText} onChange={(event) => updateContacts("phoneText", event.target.value)} className="admin-input" />
                </Field>
                <Field label="E-mail">
                  <input value={settings.contacts.email} onChange={(event) => updateContacts("email", event.target.value)} className="admin-input" />
                </Field>
                <Field label="Подпись e-mail">
                  <input value={settings.contacts.emailText} onChange={(event) => updateContacts("emailText", event.target.value)} className="admin-input" />
                </Field>
                <Field label="Telegram">
                  <input value={settings.contacts.telegram} onChange={(event) => updateContacts("telegram", event.target.value)} className="admin-input" />
                </Field>
                <Field label="Подпись Telegram">
                  <input value={settings.contacts.telegramText} onChange={(event) => updateContacts("telegramText", event.target.value)} className="admin-input" />
                </Field>
                <Field label="WhatsApp">
                  <input value={settings.contacts.whatsapp} onChange={(event) => updateContacts("whatsapp", event.target.value)} className="admin-input" />
                </Field>
                <Field label="Город">
                  <input value={settings.contacts.city} onChange={(event) => updateContacts("city", event.target.value)} className="admin-input" />
                </Field>
                <Field label="Режим работы">
                  <input value={settings.contacts.workingHours} onChange={(event) => updateContacts("workingHours", event.target.value)} className="admin-input" />
                </Field>
                <Field label="Адрес / шоурум">
                  <input value={settings.contacts.address} onChange={(event) => updateContacts("address", event.target.value)} className="admin-input" />
                </Field>
              </div>
            </section>

            <section className="rounded-[34px] border border-white/10 bg-white/[0.035] p-6 sm:p-8">
              <SectionTitle
                label="SEO"
                title="Главная страница"
                text="Базовые SEO-поля для витрины."
              />

              <div className="mt-8 grid gap-5">
                <Field label="Title главной">
                  <input value={settings.seo.homeTitle} onChange={(event) => updateSeo("homeTitle", event.target.value)} className="admin-input" />
                </Field>
                <Field label="Description главной">
                  <textarea value={settings.seo.homeDescription} onChange={(event) => updateSeo("homeDescription", event.target.value)} className="admin-textarea min-h-[110px]" />
                </Field>
                <Field label="Keywords">
                  <input value={settings.seo.keywords} onChange={(event) => updateSeo("keywords", event.target.value)} className="admin-input" />
                </Field>
              </div>
            </section>
          </div>

          <aside className="space-y-8">
            <section className="rounded-[34px] border border-blue-500/25 bg-blue-500/10 p-6 sm:p-8">
              <div className="text-sm font-medium uppercase tracking-[0.2em] text-blue-400">
                Статус
              </div>
              <h2 className="mt-3 text-3xl font-bold tracking-[-0.04em]">Готово к закрытию</h2>
              <p className="mt-4 text-sm leading-relaxed text-white/55">
                После сохранения эта вкладка уже не макет: настройки лежат в БД,
                а главная может скрывать блоки и брать контакты из настроек.
              </p>
              <div className="mt-6 grid gap-3 text-sm text-white/60">
                <InfoLine label="Включено блоков" value={`${enabledBlocks}/${settings.homeBlocks.length}`} />
                <InfoLine label="Логотипы" value="из настроек" />
                <InfoLine label="Контакты" value="из настроек" />
                <InfoLine label="Сохранение" value="PostgreSQL" />
              </div>
            </section>

            <section className="rounded-[34px] border border-white/10 bg-white/[0.035] p-6 sm:p-8">
              <SectionTitle label="Каталог" title="Поведение каталога" text="Переключатели для витрины каталога." />
              <div className="mt-6 grid gap-3">
                <ToggleRow title="Фильтры каталога" active={settings.catalog.showFilters} onChange={(value) => updateCatalog("showFilters", value)} />
                <ToggleRow title="Брендовые ряды" active={settings.catalog.showBrandRows} onChange={(value) => updateCatalog("showBrandRows", value)} />
                <ToggleRow title="Кнопка “Развернуть”" active={settings.catalog.showLoadMore} onChange={(value) => updateCatalog("showLoadMore", value)} />
                <ToggleRow title="SEO-текст категории" active={settings.catalog.showCategorySeoText} onChange={(value) => updateCatalog("showCategorySeoText", value)} />
              </div>
            </section>

            <section className="rounded-[34px] border border-white/10 bg-white/[0.035] p-6 sm:p-8">
              <SectionTitle label="Товар" title="Страница товара" text="Какие блоки показывать в карточке товара." />
              <div className="mt-6 grid gap-3">
                <ToggleRow title="Похожие товары" active={settings.productPage.showRelated} onChange={(value) => updateProductPage("showRelated", value)} />
                <ToggleRow title="С этим покупают" active={settings.productPage.showAccessories} onChange={(value) => updateProductPage("showAccessories", value)} />
                <ToggleRow title="Характеристики" active={settings.productPage.showSpecs} onChange={(value) => updateProductPage("showSpecs", value)} />
                <ToggleRow title="SEO-блок" active={settings.productPage.showSeoBlock} onChange={(value) => updateProductPage("showSeoBlock", value)} />
                <ToggleRow title="Доставка и гарантия" active={settings.productPage.showDeliveryWarranty} onChange={(value) => updateProductPage("showDeliveryWarranty", value)} />
                <ToggleRow title="FAQ товара" active={settings.productPage.showProductFaq} onChange={(value) => updateProductPage("showProductFaq", value)} />
              </div>
            </section>

            <button
              type="button"
              onClick={saveSettings}
              disabled={saveState === "saving"}
              className="w-full rounded-2xl bg-blue-600 px-7 py-5 text-sm font-semibold text-white transition-colors hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saveState === "saving" ? "Сохраняю..." : "Сохранить редактор сайта"}
            </button>
          </aside>
        </section>

        <AdminStyle />
      </div>
    </main>
  );
}

function SectionTitle({ label, title, text }: { label: string; title: string; text: string }) {
  return (
    <div>
      <div className="text-sm font-medium uppercase tracking-[0.2em] text-blue-400">{label}</div>
      <h2 className="mt-3 text-3xl font-bold tracking-[-0.04em]">{title}</h2>
      <p className="mt-3 max-w-[720px] text-sm leading-relaxed text-white/50">{text}</p>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="mb-2 text-sm font-medium text-white/70">{label}</div>
      {children}
    </label>
  );
}

function ToggleRow({ title, active, onChange }: { title: string; active: boolean; onChange: (value: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!active)}
      className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-black/20 p-4 text-left transition-colors hover:border-blue-500/35 hover:bg-blue-500/10"
    >
      <span className="text-sm font-medium">{title}</span>
      <span className={`flex h-7 w-12 shrink-0 items-center rounded-full p-1 ${active ? "bg-blue-600" : "bg-white/10"}`}>
        <span className={`h-5 w-5 rounded-full bg-white transition-transform ${active ? "translate-x-5" : "translate-x-0"}`} />
      </span>
    </button>
  );
}

function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-black/20 px-4 py-3">
      <span className="text-white/45">{label}</span>
      <span className="font-medium text-white">{value}</span>
    </div>
  );
}

function AdminStyle() {
  return (
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
  );
}
