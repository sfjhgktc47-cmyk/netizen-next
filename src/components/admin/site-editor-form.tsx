"use client";

import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";

import type {
  ModuleDefinition,
  PageBlockSettings,
  PageBlockType,
  PageBuilderState,
  PageKey,
  SitePageBlock,
} from "@/lib/page-builder-db";
import type { SiteEditorSettings } from "@/lib/site-settings-db";

type SaveState = "idle" | "saving" | "saved" | "error";
type BuilderState = "idle" | "saving" | "saved" | "error";
type SettingsTab = "branding" | "contacts" | "seo";

type Props = {
  initialSettings: SiteEditorSettings;
  initialPageBuilder: PageBuilderState;
};

const settingTabs: Array<{ key: SettingsTab; title: string; text: string }> = [
  { key: "branding", title: "Шапка", text: "Логотипы, название и цвета." },
  { key: "contacts", title: "Футер и адреса", text: "Контакты, адреса, ПВЗ и шоурумы." },
  { key: "seo", title: "SEO", text: "Мета-теги главной страницы." },
];

export function SiteEditorForm({ initialSettings, initialPageBuilder }: Props) {
  const [settings, setSettings] = useState(initialSettings);
  const [pageBuilder, setPageBuilder] = useState(initialPageBuilder);
  const [activePage, setActivePage] = useState<PageKey>("home");
  const [activeSettingsTab, setActiveSettingsTab] = useState<SettingsTab>("branding");
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [builderState, setBuilderState] = useState<BuilderState>("idle");
  const [moduleToAdd, setModuleToAdd] = useState<PageBlockType>(
    initialPageBuilder.modules.find((module) => module.pageKeys.includes("home"))?.type ?? "promo-banner"
  );

  const activePageMeta = pageBuilder.pages.find((page) => page.key === activePage) ?? pageBuilder.pages[0];
  const activeBlocks = useMemo(
    () => [...(pageBuilder.blocks[activePage] ?? [])].sort((a, b) => a.sortOrder - b.sortOrder),
    [activePage, pageBuilder.blocks]
  );
  const availableModules = pageBuilder.modules.filter((module) => module.pageKeys.includes(activePage));
  const enabledBlocks = activeBlocks.filter((block) => block.enabled).length;

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

  function updateAddress(
    id: string,
    patch: Partial<SiteEditorSettings["contacts"]["addresses"][number]>
  ) {
    setSettings((current) => {
      const nextAddresses = current.contacts.addresses.map((address) =>
        address.id === id ? { ...address, ...patch } : address
      );
      const normalizedAddresses = patch.isMain
        ? nextAddresses.map((address) => ({ ...address, isMain: address.id === id }))
        : nextAddresses;
      const mainAddress = normalizedAddresses.find((address) => address.isMain) ?? normalizedAddresses[0];

      return {
        ...current,
        contacts: {
          ...current.contacts,
          address: mainAddress?.address ?? current.contacts.address,
          city: mainAddress?.city ?? current.contacts.city,
          workingHours: mainAddress?.workingHours ?? current.contacts.workingHours,
          addresses: normalizedAddresses,
        },
      };
    });
  }

  function addAddress() {
    const id = `address-${Date.now()}`;

    setSettings((current) => ({
      ...current,
      contacts: {
        ...current.contacts,
        addresses: [
          ...current.contacts.addresses,
          {
            id,
            title: "Новая точка",
            type: "pickup",
            city: current.contacts.city || "Москва",
            address: "",
            metro: "",
            workingHours: current.contacts.workingHours || "Ежедневно, 10:00–21:00",
            phone: current.contacts.phone,
            active: true,
            isMain: false,
          },
        ],
      },
    }));
  }

  function removeAddress(id: string) {
    setSettings((current) => {
      const nextAddresses = current.contacts.addresses.filter((address) => address.id !== id);
      const normalizedAddresses = nextAddresses.length
        ? nextAddresses.some((address) => address.isMain)
          ? nextAddresses
          : nextAddresses.map((address, index) => ({ ...address, isMain: index === 0 }))
        : current.contacts.addresses;
      const mainAddress = normalizedAddresses.find((address) => address.isMain) ?? normalizedAddresses[0];

      return {
        ...current,
        contacts: {
          ...current.contacts,
          address: mainAddress?.address ?? current.contacts.address,
          city: mainAddress?.city ?? current.contacts.city,
          workingHours: mainAddress?.workingHours ?? current.contacts.workingHours,
          addresses: normalizedAddresses,
        },
      };
    });
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

  function updateLocalBlock(id: string, patch: Partial<SitePageBlock>) {
    setPageBuilder((current) => ({
      ...current,
      blocks: {
        ...current.blocks,
        [activePage]: (current.blocks[activePage] ?? []).map((block) =>
          block.id === id ? { ...block, ...patch } : block
        ),
      },
    }));
  }

  function updateBlockSetting(id: string, key: string, value: PageBlockSettings[string]) {
    setPageBuilder((current) => ({
      ...current,
      blocks: {
        ...current.blocks,
        [activePage]: (current.blocks[activePage] ?? []).map((block) =>
          block.id === id
            ? {
                ...block,
                settings: {
                  ...block.settings,
                  [key]: value,
                },
              }
            : block
        ),
      },
    }));
  }

  async function refreshBuilder() {
    const response = await fetch("/api/admin/page-blocks", { cache: "no-store" });

    if (!response.ok) {
      throw new Error("Не удалось обновить список модулей.");
    }

    const payload = (await response.json()) as PageBuilderState;
    setPageBuilder(payload);
  }

  async function saveBlock(block: SitePageBlock) {
    setBuilderState("saving");

    const response = await fetch(`/api/admin/page-blocks/${block.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: block.title,
        description: block.description,
        enabled: block.enabled,
        sortOrder: block.sortOrder,
        type: block.type,
        settings: block.settings,
      }),
    }).catch(() => null);

    if (!response?.ok) {
      setBuilderState("error");
      return;
    }

    await refreshBuilder().catch(() => null);
    setBuilderState("saved");
    window.setTimeout(() => setBuilderState("idle"), 2200);
  }

  async function toggleBlock(block: SitePageBlock) {
    updateLocalBlock(block.id, { enabled: !block.enabled });
    await saveBlock({ ...block, enabled: !block.enabled });
  }

  async function moveBlock(block: SitePageBlock, direction: "up" | "down") {
    setBuilderState("saving");

    const response = await fetch(`/api/admin/page-blocks/${block.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "move", direction }),
    }).catch(() => null);

    if (!response?.ok) {
      setBuilderState("error");
      return;
    }

    await refreshBuilder().catch(() => null);
    setBuilderState("saved");
    window.setTimeout(() => setBuilderState("idle"), 1600);
  }

  async function addBlock() {
    setBuilderState("saving");

    const response = await fetch("/api/admin/page-blocks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pageKey: activePage, type: moduleToAdd }),
    }).catch(() => null);

    if (!response?.ok) {
      setBuilderState("error");
      return;
    }

    await refreshBuilder().catch(() => null);
    setBuilderState("saved");
    window.setTimeout(() => setBuilderState("idle"), 1800);
  }

  async function removeBlock(block: SitePageBlock) {
    const confirmed = window.confirm(`Удалить модуль “${block.title}”? Его можно будет добавить заново.`);

    if (!confirmed) return;

    setBuilderState("saving");

    const response = await fetch(`/api/admin/page-blocks/${block.id}`, {
      method: "DELETE",
    }).catch(() => null);

    if (!response?.ok) {
      setBuilderState("error");
      return;
    }

    await refreshBuilder().catch(() => null);
    setBuilderState("saved");
    window.setTimeout(() => setBuilderState("idle"), 1800);
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

    const payload = (await response.json().catch(() => null)) as { site?: SiteEditorSettings } | null;

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
            <span>модули страниц</span>
          </div>

          <Link
            href="/"
            target="_blank"
            className="rounded-xl border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-medium transition-colors hover:border-blue-500/40 hover:bg-blue-500/10"
          >
            Предпросмотр →
          </Link>
        </header>

        <section className="mt-10">
          <Link href="/nz-console" className="text-sm text-blue-400 transition-colors hover:text-blue-300">
            ← В админку
          </Link>

          <div className="mt-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="inline-flex rounded-full border border-blue-500/35 bg-blue-500/10 px-4 py-2 text-sm font-medium text-blue-400">
                Редактор сайта
              </div>

              <h1 className="mt-5 text-5xl font-bold tracking-[-0.055em]">
                Редактор сайта
              </h1>

              <p className="mt-4 max-w-[900px] text-sm leading-relaxed text-white/55">
                Выберите страницу, включайте нужные блоки и меняйте только основные настройки: заголовок, текст, кнопку, фото и лимит.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/"
                target="_blank"
                className="rounded-xl border border-white/10 bg-white/[0.03] px-7 py-4 text-sm font-medium transition-colors hover:border-blue-500/40 hover:bg-blue-500/10"
              >
                Открыть сайт
              </Link>
              <button
                type="button"
                onClick={saveSettings}
                disabled={saveState === "saving"}
                className="rounded-xl bg-blue-600 px-7 py-4 text-sm font-medium text-white transition-colors hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saveState === "saving" ? "Сохраняю..." : "Сохранить глобальные настройки"}
              </button>
            </div>
          </div>

          {saveState === "saved" && <Alert tone="success">Глобальные настройки сохранены.</Alert>}
          {saveState === "error" && <Alert tone="error">Не удалось сохранить настройки.</Alert>}
          {builderState === "saved" && <Alert tone="success">Блок обновлён.</Alert>}
          {builderState === "error" && <Alert tone="error">Не удалось сохранить модуль.</Alert>}
        </section>

        <section className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div className="space-y-8">
            <section className="rounded-[34px] border border-white/10 bg-white/[0.035] p-5 sm:p-8">
              <SectionTitle
                label="Страницы"
                title="Выберите страницу"
                text="Каждая вкладка — отдельная страница сайта со своим набором модулей."
              />

              <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
                {pageBuilder.pages.map((page) => (
                  <button
                    type="button"
                    key={page.key}
                    onClick={() => {
                      setActivePage(page.key);
                      const firstModule = pageBuilder.modules.find((module) => module.pageKeys.includes(page.key));
                      if (firstModule) setModuleToAdd(firstModule.type);
                    }}
                    className={`rounded-2xl border p-4 text-left transition-all ${
                      activePage === page.key
                        ? "border-blue-500/50 bg-blue-500/15 text-white"
                        : "border-white/10 bg-black/20 text-white/60 hover:border-blue-500/35 hover:bg-blue-500/10 hover:text-white"
                    }`}
                  >
                    <div className="text-base font-bold tracking-[-0.03em]">{page.title}</div>
                    <div className="mt-2 line-clamp-2 text-xs leading-relaxed text-white/45">{page.description}</div>
                  </button>
                ))}
              </div>
            </section>

            <section className="rounded-[34px] border border-white/10 bg-white/[0.035] p-5 sm:p-8">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <SectionTitle
                  label="Модули"
                  title={activePageMeta?.title ?? "Страница"}
                  text={activePageMeta?.description ?? "Настройте модули страницы."}
                />

                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div className="text-xs font-medium uppercase tracking-[0.16em] text-white/35">Добавить модуль</div>
                  <div className="mt-3 flex flex-col gap-3 sm:flex-row lg:flex-col">
                    <select
                      value={moduleToAdd}
                      onChange={(event) => setModuleToAdd(event.target.value as PageBlockType)}
                      className="admin-input min-w-[220px]"
                    >
                      {availableModules.map((module) => (
                        <option key={module.type} value={module.type}>
                          {module.title}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={addBlock}
                      disabled={builderState === "saving"}
                      className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      + Добавить
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-8 grid gap-5">
                {activeBlocks.map((block, index) => (
                  <ModuleCard
                    key={block.id}
                    block={block}
                    modules={availableModules}
                    first={index === 0}
                    last={index === activeBlocks.length - 1}
                    onChange={(patch) => updateLocalBlock(block.id, patch)}
                    onSettingChange={(key, value) => updateBlockSetting(block.id, key, value)}
                    onSave={() => saveBlock(block)}
                    onToggle={() => toggleBlock(block)}
                    onMove={(direction) => moveBlock(block, direction)}
                    onDelete={() => removeBlock(block)}
                    disabled={builderState === "saving"}
                  />
                ))}

                {activeBlocks.length === 0 && (
                  <div className="rounded-3xl border border-dashed border-white/15 bg-black/20 p-8 text-sm text-white/45">
                    На этой странице пока нет модулей. Добавьте первый модуль справа сверху.
                  </div>
                )}
              </div>
            </section>

            <section className="rounded-[34px] border border-white/10 bg-white/[0.035] p-5 sm:p-8">
              <SectionTitle
                label="Глобальные настройки"
                title="Шапка, футер, контакты и SEO"
                text="Эти данные используются на разных страницах сайта и хранятся отдельно от модулей."
              />

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {settingTabs.map((tab) => (
                  <button
                    type="button"
                    key={tab.key}
                    onClick={() => setActiveSettingsTab(tab.key)}
                    className={`rounded-2xl border p-4 text-left transition-all ${
                      activeSettingsTab === tab.key
                        ? "border-blue-500/50 bg-blue-500/15"
                        : "border-white/10 bg-black/20 hover:border-blue-500/35 hover:bg-blue-500/10"
                    }`}
                  >
                    <div className="text-sm font-bold">{tab.title}</div>
                    <div className="mt-2 text-xs leading-relaxed text-white/45">{tab.text}</div>
                  </button>
                ))}
              </div>

              <div className="mt-8">
                {activeSettingsTab === "branding" && (
                  <BrandingEditor settings={settings} updateBranding={updateBranding} />
                )}
                {activeSettingsTab === "contacts" && (
                  <ContactsEditor
                    settings={settings}
                    updateContacts={updateContacts}
                    updateAddress={updateAddress}
                    addAddress={addAddress}
                    removeAddress={removeAddress}
                  />
                )}
                {activeSettingsTab === "seo" && (
                  <SeoEditor settings={settings} updateSeo={updateSeo} />
                )}
              </div>

              <button
                type="button"
                onClick={saveSettings}
                disabled={saveState === "saving"}
                className="mt-8 w-full rounded-2xl bg-blue-600 px-7 py-5 text-sm font-semibold text-white transition-colors hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saveState === "saving" ? "Сохраняю..." : "Сохранить глобальные настройки"}
              </button>
            </section>
          </div>

          <aside className="space-y-8">
            <section className="rounded-[34px] border border-blue-500/25 bg-blue-500/10 p-6 sm:p-8">
              <div className="text-sm font-medium uppercase tracking-[0.2em] text-blue-400">Статус</div>
              <h2 className="mt-3 text-3xl font-bold tracking-[-0.04em]">Конструктор включён</h2>
              <p className="mt-4 text-sm leading-relaxed text-white/55">
                Главная уже рендерится по активным модулям из БД. Остальные вкладки подготовлены как структура, чтобы дальше подключать их к витрине без переписывания админки.
              </p>
              <div className="mt-6 grid gap-3 text-sm text-white/60">
                <InfoLine label="Страница" value={activePageMeta?.title ?? activePage} />
                <InfoLine label="Модулей" value={`${enabledBlocks}/${activeBlocks.length}`} />
                <InfoLine label="Сохранение" value="PostgreSQL" />
                <InfoLine label="Формат" value="PageBlock + JSON" />
              </div>
            </section>

            <section className="rounded-[34px] border border-white/10 bg-white/[0.035] p-6 sm:p-8">
              <SectionTitle label="Как работать" title="Без кода" text="Собирайте страницу как набор готовых модулей." />
              <div className="mt-6 space-y-3 text-sm text-white/55">
                <p>1. Выберите вкладку страницы: Главная, Каталог, Карточка товара.</p>
                <p>2. Добавьте модуль из библиотеки.</p>
                <p>3. Настройте заголовок, кнопку, фото, лимит или фильтр.</p>
                <p>4. Включайте, скрывайте и двигайте модули вверх/вниз.</p>
              </div>
            </section>

            <section className="rounded-[34px] border border-white/10 bg-white/[0.035] p-6 sm:p-8">
              <SectionTitle label="Библиотека" title="Доступные модули" text="Модули зависят от выбранной страницы." />
              <div className="mt-6 grid gap-3">
                {availableModules.map((module) => (
                  <div key={module.type} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <div className="text-sm font-semibold">{module.title}</div>
                    <div className="mt-1 text-xs leading-relaxed text-white/45">{module.description}</div>
                  </div>
                ))}
              </div>
            </section>
          </aside>
        </section>

        <AdminStyle />
      </div>
    </main>
  );
}

function ModuleCard({
  block,
  modules,
  first,
  last,
  onChange,
  onSettingChange,
  onSave,
  onToggle,
  onMove,
  onDelete,
  disabled,
}: {
  block: SitePageBlock;
  modules: ModuleDefinition[];
  first: boolean;
  last: boolean;
  onChange: (patch: Partial<SitePageBlock>) => void;
  onSettingChange: (key: string, value: PageBlockSettings[string]) => void;
  onSave: () => void;
  onToggle: () => void;
  onMove: (direction: "up" | "down") => void;
  onDelete: () => void;
  disabled: boolean;
}) {
  const selectedModule = modules.find((module) => module.type === block.type);

  return (
    <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-white/45">
              #{block.sortOrder}
            </span>
            <span className="rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs text-blue-300">
              {selectedModule?.title ?? block.type}
            </span>
            <span
              className={`rounded-full border px-3 py-1 text-xs ${
                block.enabled
                  ? "border-green-500/30 bg-green-500/10 text-green-300"
                  : "border-red-500/30 bg-red-500/10 text-red-300"
              }`}
            >
              {block.enabled ? "Показывается" : "Скрыт"}
            </span>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <Field label="Название блока в админке">
              <input
                value={block.title}
                onChange={(event) => onChange({ title: event.target.value })}
                className="admin-input"
              />
            </Field>

            <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-4 text-sm text-white/55">
              <div className="text-xs font-medium uppercase tracking-[0.16em] text-white/35">Тип блока</div>
              <div className="mt-2 font-semibold text-white">{selectedModule?.title ?? block.type}</div>
              <p className="mt-2 text-xs leading-relaxed text-white/45">
                Тип выбирается при добавлении блока. Чтобы заменить блок, проще скрыть или удалить текущий и добавить новый.
              </p>
            </div>
          </div>

          <ModuleSettings block={block} onSettingChange={onSettingChange} />
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:w-[250px] xl:grid-cols-1">
          <button type="button" onClick={onToggle} disabled={disabled} className="admin-action-button">
            {block.enabled ? "Скрыть" : "Показать"}
          </button>
          <button type="button" onClick={() => onMove("up")} disabled={disabled || first} className="admin-action-button disabled:opacity-35">
            ↑ Выше
          </button>
          <button type="button" onClick={() => onMove("down")} disabled={disabled || last} className="admin-action-button disabled:opacity-35">
            ↓ Ниже
          </button>
          <button type="button" onClick={onSave} disabled={disabled} className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-500 disabled:opacity-50">
            Сохранить
          </button>
          <button type="button" onClick={onDelete} disabled={disabled} className="rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-3 text-sm font-semibold text-red-300 transition-colors hover:bg-red-500/15 disabled:opacity-50">
            Удалить
          </button>
        </div>
      </div>
    </div>
  );
}

function ModuleSettings({
  block,
  onSettingChange,
}: {
  block: SitePageBlock;
  onSettingChange: (key: string, value: PageBlockSettings[string]) => void;
}) {
  const settings = block.settings;
  const textBlocks: PageBlockType[] = [
    "category-grid",
    "popular-products",
    "new-arrivals",
    "promo-banner",
    "text-image",
    "product-carousel",
    "catalog-header",
    "catalog-empty",
    "support",
  ];
  const buttonBlocks: PageBlockType[] = [
    "category-grid",
    "popular-products",
    "new-arrivals",
    "promo-banner",
    "product-carousel",
  ];
  const imageBlocks: PageBlockType[] = ["promo-banner", "text-image"];
  const limitBlocks: PageBlockType[] = [
    "category-grid",
    "popular-products",
    "new-arrivals",
    "product-carousel",
    "related-products",
    "catalog-grid",
  ];
  const filterBlocks: PageBlockType[] = ["popular-products", "product-carousel"];

  const hasTextFields = textBlocks.includes(block.type);
  const hasButtonFields = buttonBlocks.includes(block.type);
  const hasImageField = imageBlocks.includes(block.type);
  const hasLimitField = limitBlocks.includes(block.type);
  const hasFilterField = filterBlocks.includes(block.type);
  const isNewArrivalsBlock = block.type === "new-arrivals";

  if (!hasTextFields && !hasButtonFields && !hasImageField && !hasLimitField && !hasFilterField) {
    return (
      <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.025] p-4 text-sm leading-relaxed text-white/45">
        У этого блока нет текстовых настроек. Его можно показывать, скрывать и двигать выше/ниже.
      </div>
    );
  }

  return (
    <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.025] p-4">
      <div className="text-xs font-medium uppercase tracking-[0.16em] text-white/35">Настройки блока</div>

      {isNewArrivalsBlock && (
        <div className="mt-4 rounded-2xl border border-blue-500/25 bg-blue-500/10 p-4 text-sm leading-relaxed text-blue-100/75">
          Новинки теперь проще: товары выбираются не здесь, а в карточке товара.
          Откройте товар в админке, включите “Новинка” и загрузите “Фото для блока Новинки”.
          Здесь меняются только заголовок, описание, лимит и кнопка блока.
        </div>
      )}

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {hasTextFields && (
          <>
            <Field label="Заголовок на сайте">
              <input
                value={getSettingText(settings, "title")}
                onChange={(event) => onSettingChange("title", event.target.value)}
                className="admin-input"
              />
            </Field>
            <Field label="Описание / подзаголовок">
              <input
                value={getSettingText(settings, "subtitle")}
                onChange={(event) => onSettingChange("subtitle", event.target.value)}
                className="admin-input"
              />
            </Field>
          </>
        )}

        {hasLimitField && (
          <Field label="Сколько элементов показывать">
            <input
              type="number"
              min={1}
              value={getSettingNumber(settings, "limit", block.type === "new-arrivals" ? 3 : 12)}
              onChange={(event) => onSettingChange("limit", Number(event.target.value))}
              className="admin-input"
            />
          </Field>
        )}

        {hasFilterField && (
          <Field label="Фильтр товаров">
            <select
              value={getSettingText(settings, "filter") || "all"}
              onChange={(event) => onSettingChange("filter", event.target.value)}
              className="admin-input"
            >
              <option value="all">Все товары</option>
              <option value="popular">Только популярные</option>
              <option value="new">Только новинки</option>
            </select>
          </Field>
        )}

        {hasImageField && (
          <Field label="Изображение / баннер">
            <input
              value={getSettingText(settings, "image")}
              onChange={(event) => onSettingChange("image", event.target.value)}
              className="admin-input"
              placeholder="/uploads/banner.png или https://..."
            />
          </Field>
        )}

        {block.type === "text-image" && (
          <Field label="Сторона картинки">
            <select
              value={getSettingText(settings, "imageSide") || "right"}
              onChange={(event) => onSettingChange("imageSide", event.target.value)}
              className="admin-input"
            >
              <option value="right">Справа</option>
              <option value="left">Слева</option>
            </select>
          </Field>
        )}

        {["promo-banner", "text-image"].includes(block.type) && (
          <Field label="Тон блока">
            <select
              value={getSettingText(settings, "tone") || "blue"}
              onChange={(event) => onSettingChange("tone", event.target.value)}
              className="admin-input"
            >
              <option value="blue">Синий</option>
              <option value="dark">Тёмный</option>
              <option value="light">Светлый</option>
            </select>
          </Field>
        )}
      </div>

      {hasButtonFields && (
        <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-4">
          <label className="flex items-center gap-3 text-sm text-white/70">
            <input
              type="checkbox"
              checked={getSettingBoolean(settings, "showButton", true)}
              onChange={(event) => onSettingChange("showButton", event.target.checked)}
            />
            Показывать кнопку
          </label>

          {getSettingBoolean(settings, "showButton", true) && (
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <Field label="Текст кнопки">
                <input
                  value={getSettingText(settings, "buttonText")}
                  onChange={(event) => onSettingChange("buttonText", event.target.value)}
                  className="admin-input"
                />
              </Field>
              <Field label="Ссылка кнопки">
                <input
                  value={getSettingText(settings, "buttonHref")}
                  onChange={(event) => onSettingChange("buttonHref", event.target.value)}
                  className="admin-input"
                  placeholder="/catalog"
                />
              </Field>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function BrandingEditor({ settings, updateBranding }: { settings: SiteEditorSettings; updateBranding: <K extends keyof SiteEditorSettings["branding"]>(key: K, value: SiteEditorSettings["branding"][K]) => void }) {
  return (
    <div className="grid gap-5 md:grid-cols-2">
      <Field label="Название магазина"><input value={settings.branding.storeName} onChange={(event) => updateBranding("storeName", event.target.value)} className="admin-input" /></Field>
      <Field label="Тема по умолчанию">
        <select className="admin-input" value={settings.branding.defaultTheme} onChange={(event) => updateBranding("defaultTheme", event.target.value as SiteEditorSettings["branding"]["defaultTheme"])}>
          <option value="system">Системная</option>
          <option value="light">Светлая</option>
          <option value="dark">Тёмная</option>
        </select>
      </Field>
      <Field label="Логотип для тёмной темы"><input value={settings.branding.logoLight} onChange={(event) => updateBranding("logoLight", event.target.value)} className="admin-input" /></Field>
      <Field label="Логотип для светлой темы"><input value={settings.branding.logoDark} onChange={(event) => updateBranding("logoDark", event.target.value)} className="admin-input" /></Field>
      <Field label="Основной цвет"><input value={settings.branding.primaryColor} onChange={(event) => updateBranding("primaryColor", event.target.value)} className="admin-input" /></Field>
      <Field label="Акцентный цвет"><input value={settings.branding.accentColor} onChange={(event) => updateBranding("accentColor", event.target.value)} className="admin-input" /></Field>
    </div>
  );
}

function ContactsEditor({
  settings,
  updateContacts,
  updateAddress,
  addAddress,
  removeAddress,
}: {
  settings: SiteEditorSettings;
  updateContacts: <K extends keyof SiteEditorSettings["contacts"]>(key: K, value: SiteEditorSettings["contacts"][K]) => void;
  updateAddress: (id: string, patch: Partial<SiteEditorSettings["contacts"]["addresses"][number]>) => void;
  addAddress: () => void;
  removeAddress: (id: string) => void;
}) {
  return (
    <div>
      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Телефон"><input value={settings.contacts.phone} onChange={(event) => updateContacts("phone", event.target.value)} className="admin-input" /></Field>
        <Field label="Подпись телефона"><input value={settings.contacts.phoneText} onChange={(event) => updateContacts("phoneText", event.target.value)} className="admin-input" /></Field>
        <Field label="E-mail"><input value={settings.contacts.email} onChange={(event) => updateContacts("email", event.target.value)} className="admin-input" /></Field>
        <Field label="Подпись e-mail"><input value={settings.contacts.emailText} onChange={(event) => updateContacts("emailText", event.target.value)} className="admin-input" /></Field>
        <Field label="Telegram"><input value={settings.contacts.telegram} onChange={(event) => updateContacts("telegram", event.target.value)} className="admin-input" /></Field>
        <Field label="WhatsApp"><input value={settings.contacts.whatsapp} onChange={(event) => updateContacts("whatsapp", event.target.value)} className="admin-input" /></Field>
        <Field label="Город"><input value={settings.contacts.city} onChange={(event) => updateContacts("city", event.target.value)} className="admin-input" /></Field>
        <Field label="Режим работы"><input value={settings.contacts.workingHours} onChange={(event) => updateContacts("workingHours", event.target.value)} className="admin-input" /></Field>
      </div>

      <div className="mt-8 rounded-2xl border border-blue-500/25 bg-blue-500/10 p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-xl font-bold tracking-[-0.035em]">Адреса и точки выдачи</h3>
            <p className="mt-2 text-sm leading-relaxed text-white/50">Добавляйте шоурумы, офисы и ПВЗ. Эти адреса используются в способах получения.</p>
          </div>
          <button type="button" onClick={addAddress} className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-500">Добавить адрес →</button>
        </div>
      </div>

      <div className="mt-5 grid gap-4">
        {settings.contacts.addresses.map((address) => (
          <div key={address.id} className="rounded-2xl border border-white/10 bg-black/20 p-5">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Название точки"><input value={address.title} onChange={(event) => updateAddress(address.id, { title: event.target.value })} className="admin-input" /></Field>
              <Field label="Тип">
                <select value={address.type} onChange={(event) => updateAddress(address.id, { type: event.target.value as SiteEditorSettings["contacts"]["addresses"][number]["type"] })} className="admin-input">
                  <option value="showroom">Шоурум</option>
                  <option value="pickup">Пункт выдачи</option>
                  <option value="office">Офис</option>
                </select>
              </Field>
              <Field label="Город"><input value={address.city} onChange={(event) => updateAddress(address.id, { city: event.target.value })} className="admin-input" /></Field>
              <Field label="Метро / ориентир"><input value={address.metro} onChange={(event) => updateAddress(address.id, { metro: event.target.value })} className="admin-input" /></Field>
              <Field label="Адрес"><input value={address.address} onChange={(event) => updateAddress(address.id, { address: event.target.value })} className="admin-input" /></Field>
              <Field label="Режим работы"><input value={address.workingHours} onChange={(event) => updateAddress(address.id, { workingHours: event.target.value })} className="admin-input" /></Field>
              <Field label="Телефон точки"><input value={address.phone} onChange={(event) => updateAddress(address.id, { phone: event.target.value })} className="admin-input" /></Field>
              <div className="grid gap-3 sm:grid-cols-3 md:pt-7">
                <button type="button" onClick={() => updateAddress(address.id, { active: !address.active })} className={`rounded-xl border px-4 py-3 text-sm font-semibold transition-colors ${address.active ? "border-green-500/30 bg-green-500/10 text-green-300" : "border-red-500/30 bg-red-500/10 text-red-300"}`}>{address.active ? "Активен" : "Скрыт"}</button>
                <button type="button" onClick={() => updateAddress(address.id, { isMain: true })} className={`rounded-xl border px-4 py-3 text-sm font-semibold transition-colors ${address.isMain ? "border-blue-500/40 bg-blue-500/15 text-blue-300" : "border-white/10 bg-white/[0.03] text-white/70 hover:border-blue-500/40"}`}>Главный</button>
                <button type="button" onClick={() => removeAddress(address.id)} className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-300 transition-colors hover:bg-red-500/15">Удалить</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SeoEditor({ settings, updateSeo }: { settings: SiteEditorSettings; updateSeo: <K extends keyof SiteEditorSettings["seo"]>(key: K, value: SiteEditorSettings["seo"][K]) => void }) {
  return (
    <div className="grid gap-5">
      <Field label="Title главной"><input value={settings.seo.homeTitle} onChange={(event) => updateSeo("homeTitle", event.target.value)} className="admin-input" /></Field>
      <Field label="Description главной"><textarea value={settings.seo.homeDescription} onChange={(event) => updateSeo("homeDescription", event.target.value)} className="admin-textarea min-h-[110px]" /></Field>
      <Field label="Keywords"><input value={settings.seo.keywords} onChange={(event) => updateSeo("keywords", event.target.value)} className="admin-input" /></Field>
    </div>
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

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <div className="mb-2 text-sm font-medium text-white/70">{label}</div>
      {children}
    </label>
  );
}

function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
      <span>{label}</span>
      <span className="font-semibold text-white">{value}</span>
    </div>
  );
}

function Alert({ tone, children }: { tone: "success" | "error"; children: ReactNode }) {
  return (
    <div className={`mt-5 rounded-2xl border px-5 py-4 text-sm ${tone === "success" ? "border-green-500/30 bg-green-500/10 text-green-300" : "border-red-500/30 bg-red-500/10 text-red-300"}`}>
      {children}
    </div>
  );
}

function getSettingText(settings: PageBlockSettings, key: string) {
  const value = settings[key];
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  return "";
}

function getSettingNumber(settings: PageBlockSettings, key: string, fallback: number) {
  const value = settings[key];
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  return fallback;
}

function getSettingBoolean(settings: PageBlockSettings, key: string, fallback: boolean) {
  const value = settings[key];
  return typeof value === "boolean" ? value : fallback;
}

function AdminStyle() {
  return (
    <style jsx global>{`
      .admin-input,
      .admin-textarea {
        width: 100%;
        border-radius: 0.9rem;
        border: 1px solid rgba(255, 255, 255, 0.1);
        background: rgba(0, 0, 0, 0.22);
        padding: 0.85rem 1rem;
        color: white;
        outline: none;
        transition: border-color 0.2s ease, background-color 0.2s ease;
      }

      .admin-input:focus,
      .admin-textarea:focus {
        border-color: rgba(59, 130, 246, 0.65);
        background: rgba(0, 0, 0, 0.32);
      }

      .admin-input option {
        background: #020814;
        color: white;
      }

      .admin-action-button {
        border-radius: 0.75rem;
        border: 1px solid rgba(255, 255, 255, 0.1);
        background: rgba(255, 255, 255, 0.03);
        padding: 0.75rem 1.25rem;
        color: rgba(255, 255, 255, 0.82);
        font-size: 0.875rem;
        font-weight: 600;
        transition: border-color 0.2s ease, background-color 0.2s ease;
      }

      .admin-action-button:hover:not(:disabled) {
        border-color: rgba(59, 130, 246, 0.45);
        background: rgba(59, 130, 246, 0.1);
      }
    `}</style>
  );
}
