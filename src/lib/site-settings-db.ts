import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/db";

export type SiteBrandingSettings = {
  storeName: string;
  logoLight: string;
  logoDark: string;
  defaultTheme: "system" | "light" | "dark";
  accentColor: string;
  primaryColor: string;
};

export type SiteContactsSettings = {
  phone: string;
  phoneText: string;
  email: string;
  emailText: string;
  telegram: string;
  telegramText: string;
  whatsapp: string;
  city: string;
  workingHours: string;
  address: string;
};

export type HomeBlockSettings = {
  id: string;
  title: string;
  type: string;
  description: string;
  enabled: boolean;
  order: number;
};

export type SiteCatalogSettings = {
  showFilters: boolean;
  showBrandRows: boolean;
  showLoadMore: boolean;
  showCategorySeoText: boolean;
};

export type SiteProductPageSettings = {
  showRelated: boolean;
  showAccessories: boolean;
  showSpecs: boolean;
  showSeoBlock: boolean;
  showDeliveryWarranty: boolean;
  showProductFaq: boolean;
};

export type SiteSeoSettings = {
  homeTitle: string;
  homeDescription: string;
  keywords: string;
};

export type SiteEditorSettings = {
  branding: SiteBrandingSettings;
  contacts: SiteContactsSettings;
  homeBlocks: HomeBlockSettings[];
  catalog: SiteCatalogSettings;
  productPage: SiteProductPageSettings;
  seo: SiteSeoSettings;
};

export type DeliverySettings = {
  key: string;
  title: string;
  crmField: string;
  text: string;
  active: boolean;
};

export type NotificationSettings = {
  key: string;
  title: string;
  text: string;
  channel: string;
  active: boolean;
};

export type IntegrationSettings = {
  key: string;
  name: string;
  status: string;
  access: string;
  text: string;
  token: string;
  webhookUrl: string;
};

export type SystemSettings = {
  deliveries: DeliverySettings[];
  notifications: NotificationSettings[];
  integrations: IntegrationSettings[];
  lowStockLimit: number;
  orderPrefix: string;
};

const defaultHomeBlocks: HomeBlockSettings[] = [
  {
    id: "hero",
    title: "Hero-блок",
    type: "Главный экран",
    description: "Заголовок, подзаголовок, кнопки и главный баннер.",
    enabled: true,
    order: 1,
  },
  {
    id: "benefits",
    title: "Преимущества",
    type: "Информационный блок",
    description: "Оригинал, гарантия, доставка, оплата и поддержка.",
    enabled: true,
    order: 2,
  },
  {
    id: "categories",
    title: "Категории",
    type: "Сетка категорий",
    description: "Основные разделы каталога на главной странице.",
    enabled: true,
    order: 3,
  },
  {
    id: "popular-products",
    title: "Популярные товары",
    type: "Карусель товаров",
    description: "Товары с флагом “Популярный товар”.",
    enabled: true,
    order: 4,
  },
  {
    id: "new-arrivals",
    title: "Новинки",
    type: "Промо-блок",
    description: "Товары с флагом “Новинка” и отдельной promo-фотографией.",
    enabled: true,
    order: 5,
  },
  {
    id: "support",
    title: "Сервис и поддержка",
    type: "FAQ / поддержка",
    description: "FAQ, карточки сервиса и помощь клиенту.",
    enabled: true,
    order: 6,
  },
];

export const defaultSiteEditorSettings: SiteEditorSettings = {
  branding: {
    storeName: "Netizen",
    logoLight: "/logo-light.png",
    logoDark: "/logo-dark.png",
    defaultTheme: "system",
    accentColor: "#2563eb",
    primaryColor: "#020814",
  },
  contacts: {
    phone: "8 (800) 123-45-67",
    phoneText: "Ежедневно с 10:00 до 21:00",
    email: "info@netizen.store",
    emailText: "Ответим на почту",
    telegram: "@netizen_store",
    telegramText: "Мы в Telegram",
    whatsapp: "+7 999 000-00-00",
    city: "Москва",
    workingHours: "Ежедневно, 10:00–21:00",
    address: "Москва, адрес будет указан позже",
  },
  homeBlocks: defaultHomeBlocks,
  catalog: {
    showFilters: true,
    showBrandRows: true,
    showLoadMore: true,
    showCategorySeoText: false,
  },
  productPage: {
    showRelated: true,
    showAccessories: true,
    showSpecs: true,
    showSeoBlock: true,
    showDeliveryWarranty: true,
    showProductFaq: false,
  },
  seo: {
    homeTitle: "Netizen — магазин техники",
    homeDescription: "Оригинальная техника, быстрая доставка и поддержка при выборе.",
    keywords: "техника, смартфоны, ноутбуки, гаджеты, Netizen",
  },
};

export const defaultSystemSettings: SystemSettings = {
  deliveries: [
    {
      key: "courier",
      title: "Курьерская доставка",
      crmField: "delivery.type = courier",
      text: "Клиент указывает адрес, CRM получает технический тип courier и поле delivery.address.",
      active: true,
    },
    {
      key: "pickup_point",
      title: "Пункт выдачи",
      crmField: "delivery.type = pickup_point",
      text: "Клиент выбирает ПВЗ, CRM получает pickupPointId и pickupPointLabel.",
      active: true,
    },
    {
      key: "self_pickup",
      title: "Самовывоз",
      crmField: "delivery.type = self_pickup",
      text: "Клиент забирает заказ из точки магазина.",
      active: false,
    },
  ],
  notifications: [
    {
      key: "new_orders",
      title: "Новые заявки",
      text: "Уведомлять менеджеров о новых заявках с сайта.",
      channel: "Telegram / админка",
      active: true,
    },
    {
      key: "new_support",
      title: "Новые обращения",
      text: "Уведомлять поддержку о новых сообщениях клиентов.",
      channel: "Telegram / админка",
      active: true,
    },
    {
      key: "integration_errors",
      title: "Ошибки интеграций",
      text: "Сообщать главному админу об ошибках синхронизации.",
      channel: "Telegram",
      active: true,
    },
    {
      key: "low_stock",
      title: "Низкий остаток",
      text: "Уведомлять, если позиция заканчивается на складе.",
      channel: "Админка",
      active: false,
    },
  ],
  integrations: [
    {
      key: "moysklad",
      name: "МойСклад",
      status: "Не подключено",
      access: "Главный админ / Технический админ",
      text: "Остатки, склад, документы и синхронизация позиций по SKU.",
      token: "",
      webhookUrl: "",
    },
    {
      key: "crm",
      name: "CRM",
      status: "Планируется",
      access: "Главный админ / Технический админ",
      text: "Передача заявок, клиентов, доставки и статусов заказов.",
      token: "",
      webhookUrl: "",
    },
    {
      key: "telegram",
      name: "Telegram",
      status: "Не подключено",
      access: "Главный админ / Менеджер",
      text: "Уведомления о новых заявках, обращениях и ошибках.",
      token: "",
      webhookUrl: "",
    },
  ],
  lowStockLimit: 3,
  orderPrefix: "NZ",
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function stringValue(value: unknown, fallback: string) {
  return typeof value === "string" ? value : fallback;
}

function numberValue(value: unknown, fallback: number) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function booleanValue(value: unknown, fallback: boolean) {
  return typeof value === "boolean" ? value : fallback;
}

function normalizeBranding(value: unknown): SiteBrandingSettings {
  const raw = isRecord(value) ? value : {};
  const defaultTheme = stringValue(raw.defaultTheme, defaultSiteEditorSettings.branding.defaultTheme);

  return {
    storeName: stringValue(raw.storeName, defaultSiteEditorSettings.branding.storeName),
    logoLight: stringValue(raw.logoLight, defaultSiteEditorSettings.branding.logoLight),
    logoDark: stringValue(raw.logoDark, defaultSiteEditorSettings.branding.logoDark),
    defaultTheme: defaultTheme === "light" || defaultTheme === "dark" ? defaultTheme : "system",
    accentColor: stringValue(raw.accentColor, defaultSiteEditorSettings.branding.accentColor),
    primaryColor: stringValue(raw.primaryColor, defaultSiteEditorSettings.branding.primaryColor),
  };
}

function normalizeContacts(value: unknown): SiteContactsSettings {
  const raw = isRecord(value) ? value : {};
  const defaults = defaultSiteEditorSettings.contacts;

  return {
    phone: stringValue(raw.phone, defaults.phone),
    phoneText: stringValue(raw.phoneText, defaults.phoneText),
    email: stringValue(raw.email, defaults.email),
    emailText: stringValue(raw.emailText, defaults.emailText),
    telegram: stringValue(raw.telegram, defaults.telegram),
    telegramText: stringValue(raw.telegramText, defaults.telegramText),
    whatsapp: stringValue(raw.whatsapp, defaults.whatsapp),
    city: stringValue(raw.city, defaults.city),
    workingHours: stringValue(raw.workingHours, defaults.workingHours),
    address: stringValue(raw.address, defaults.address),
  };
}

function normalizeHomeBlocks(value: unknown): HomeBlockSettings[] {
  const source = Array.isArray(value) ? value : [];
  const byId = new Map<string, Record<string, unknown>>();

  for (const item of source) {
    if (isRecord(item) && typeof item.id === "string") {
      byId.set(item.id, item);
    }
  }

  return defaultHomeBlocks
    .map((block) => {
      const raw = byId.get(block.id);

      return {
        ...block,
        title: stringValue(raw?.title, block.title),
        type: stringValue(raw?.type, block.type),
        description: stringValue(raw?.description, block.description),
        enabled: booleanValue(raw?.enabled, block.enabled),
        order: numberValue(raw?.order, block.order),
      };
    })
    .sort((a, b) => a.order - b.order);
}

function normalizeCatalog(value: unknown): SiteCatalogSettings {
  const raw = isRecord(value) ? value : {};
  const defaults = defaultSiteEditorSettings.catalog;

  return {
    showFilters: booleanValue(raw.showFilters, defaults.showFilters),
    showBrandRows: booleanValue(raw.showBrandRows, defaults.showBrandRows),
    showLoadMore: booleanValue(raw.showLoadMore, defaults.showLoadMore),
    showCategorySeoText: booleanValue(raw.showCategorySeoText, defaults.showCategorySeoText),
  };
}

function normalizeProductPage(value: unknown): SiteProductPageSettings {
  const raw = isRecord(value) ? value : {};
  const defaults = defaultSiteEditorSettings.productPage;

  return {
    showRelated: booleanValue(raw.showRelated, defaults.showRelated),
    showAccessories: booleanValue(raw.showAccessories, defaults.showAccessories),
    showSpecs: booleanValue(raw.showSpecs, defaults.showSpecs),
    showSeoBlock: booleanValue(raw.showSeoBlock, defaults.showSeoBlock),
    showDeliveryWarranty: booleanValue(raw.showDeliveryWarranty, defaults.showDeliveryWarranty),
    showProductFaq: booleanValue(raw.showProductFaq, defaults.showProductFaq),
  };
}

function normalizeSeo(value: unknown): SiteSeoSettings {
  const raw = isRecord(value) ? value : {};
  const defaults = defaultSiteEditorSettings.seo;

  return {
    homeTitle: stringValue(raw.homeTitle, defaults.homeTitle),
    homeDescription: stringValue(raw.homeDescription, defaults.homeDescription),
    keywords: stringValue(raw.keywords, defaults.keywords),
  };
}

export function normalizeSiteEditorSettings(value: unknown): SiteEditorSettings {
  const raw = isRecord(value) ? value : {};

  return {
    branding: normalizeBranding(raw.branding),
    contacts: normalizeContacts(raw.contacts),
    homeBlocks: normalizeHomeBlocks(raw.homeBlocks),
    catalog: normalizeCatalog(raw.catalog),
    productPage: normalizeProductPage(raw.productPage),
    seo: normalizeSeo(raw.seo),
  };
}

function normalizeDeliveries(value: unknown): DeliverySettings[] {
  const source = Array.isArray(value) ? value : defaultSystemSettings.deliveries;

  return source.map((item, index) => {
    const raw = isRecord(item) ? item : {};
    const fallback = defaultSystemSettings.deliveries[index] ?? defaultSystemSettings.deliveries[0];

    return {
      key: stringValue(raw.key, fallback.key),
      title: stringValue(raw.title, fallback.title),
      crmField: stringValue(raw.crmField, fallback.crmField),
      text: stringValue(raw.text, fallback.text),
      active: booleanValue(raw.active, fallback.active),
    };
  });
}

function normalizeNotifications(value: unknown): NotificationSettings[] {
  const source = Array.isArray(value) ? value : defaultSystemSettings.notifications;

  return source.map((item, index) => {
    const raw = isRecord(item) ? item : {};
    const fallback = defaultSystemSettings.notifications[index] ?? defaultSystemSettings.notifications[0];

    return {
      key: stringValue(raw.key, fallback.key),
      title: stringValue(raw.title, fallback.title),
      text: stringValue(raw.text, fallback.text),
      channel: stringValue(raw.channel, fallback.channel),
      active: booleanValue(raw.active, fallback.active),
    };
  });
}

function normalizeIntegrations(value: unknown): IntegrationSettings[] {
  const source = Array.isArray(value) ? value : defaultSystemSettings.integrations;

  return source.map((item, index) => {
    const raw = isRecord(item) ? item : {};
    const fallback = defaultSystemSettings.integrations[index] ?? defaultSystemSettings.integrations[0];

    return {
      key: stringValue(raw.key, fallback.key),
      name: stringValue(raw.name, fallback.name),
      status: stringValue(raw.status, fallback.status),
      access: stringValue(raw.access, fallback.access),
      text: stringValue(raw.text, fallback.text),
      token: stringValue(raw.token, ""),
      webhookUrl: stringValue(raw.webhookUrl, ""),
    };
  });
}

export function normalizeSystemSettings(value: unknown): SystemSettings {
  const raw = isRecord(value) ? value : {};

  return {
    deliveries: normalizeDeliveries(raw.deliveries),
    notifications: normalizeNotifications(raw.notifications),
    integrations: normalizeIntegrations(raw.integrations),
    lowStockLimit: numberValue(raw.lowStockLimit, defaultSystemSettings.lowStockLimit),
    orderPrefix: stringValue(raw.orderPrefix, defaultSystemSettings.orderPrefix),
  };
}

async function getSettingValue(key: string) {
  const setting = await prisma.siteSetting.findUnique({ where: { key } });
  return setting?.value;
}

async function upsertSettingValue(key: string, value: unknown) {
  return prisma.siteSetting.upsert({
    where: { key },
    create: { key, value: value as Prisma.InputJsonValue },
    update: { value: value as Prisma.InputJsonValue },
  });
}

export async function getSiteEditorSettings() {
  return normalizeSiteEditorSettings(await getSettingValue("site"));
}

export async function saveSiteEditorSettings(value: unknown) {
  const settings = normalizeSiteEditorSettings(value);
  await upsertSettingValue("site", settings);
  return settings;
}

export async function getSystemSettings() {
  return normalizeSystemSettings(await getSettingValue("system"));
}

export async function saveSystemSettings(value: unknown) {
  const settings = normalizeSystemSettings(value);
  await upsertSettingValue("system", settings);
  return settings;
}
