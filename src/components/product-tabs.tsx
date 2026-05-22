"use client";

import { useState, type ReactNode } from "react";

type ProductTabsProps = {
  productName: string;
  brand: string;
  category: string;
  memory: string;
  color: string;
  sim: string;
  sku: string;
};

const advantages = [
  {
    title: "Бесплатная доставка",
    text: "В день заказа в пределах МКАД.",
  },
  {
    title: "Под заказ",
    text: "Привозим редкие модели и конфигурации.",
  },
  {
    title: "Для юр. лиц",
    text: "Работаем с компаниями и документами.",
  },
  {
    title: "Оригинальные товары",
    text: "Проверяем устройство перед передачей клиенту.",
  },
  {
    title: "Гарантия",
    text: "Поддержка после покупки и помощь с обращениями.",
  },
  {
    title: "Самовывоз",
    text: "Можно забрать рядом с м. Багратионовская.",
  },
  {
    title: "Trade-In",
    text: "Поможем выгодно обновить устройство.",
  },
];

export function ProductTabs({
  productName,
  brand,
  category,
  memory,
  color,
  sim,
  sku,
}: ProductTabsProps) {
  const [activeTab, setActiveTab] = useState<
    "description" | "characteristics" | "advantages"
  >("description");

  return (
    <section className="card rounded-[32px] p-7">
      <div className="flex flex-wrap justify-center gap-2 border-b border-theme pb-4">
        <TabButton
          active={activeTab === "description"}
          onClick={() => setActiveTab("description")}
        >
          Описание
        </TabButton>

        <TabButton
          active={activeTab === "characteristics"}
          onClick={() => setActiveTab("characteristics")}
        >
          Характеристики
        </TabButton>

        <TabButton
          active={activeTab === "advantages"}
          onClick={() => setActiveTab("advantages")}
        >
          Преимущества
        </TabButton>
      </div>

      <div className="pt-6">
        {activeTab === "description" && (
          <div>
            <div className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-blue-500">
              О модели
            </div>

            <h2 className="text-3xl font-bold tracking-[-0.045em] text-main">
              {productName}
            </h2>

            <p className="mt-4 max-w-[850px] text-base leading-7 text-muted">
              {productName} — премиальное устройство для работы, общения,
              контента и повседневного использования. Карточка показывает общую
              модель, а выбранная конфигурация определяет память, цвет, SIM,
              цену, наличие и SKU.
            </p>

            <p className="mt-4 max-w-[850px] text-base leading-7 text-muted">
              Перед оформлением менеджер подтвердит наличие, комплектацию,
              способ получения и итоговую стоимость заказа.
            </p>
          </div>
        )}

        {activeTab === "characteristics" && (
          <div>
            <div className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-blue-500">
              Характеристики
            </div>

            <h2 className="text-3xl font-bold tracking-[-0.045em] text-main">
              Основное
            </h2>

            <div className="mt-6 grid gap-3 md:grid-cols-2">
              <Characteristic label="Бренд" value={brand} />
              <Characteristic label="Категория" value={category} />
              <Characteristic label="Модель" value={productName} />
              <Characteristic label="Память" value={memory} />
              <Characteristic label="Цвет" value={color} />
              <Characteristic label="SIM" value={sim} />
              <Characteristic label="SKU" value={sku} />
              <Characteristic label="Гарантия" value="12 месяцев" />
            </div>
          </div>
        )}

        {activeTab === "advantages" && (
          <div>
            <div className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-blue-500">
              Преимущества
            </div>

            <h2 className="text-3xl font-bold tracking-[-0.045em] text-main">
              Почему у нас удобно покупать
            </h2>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {advantages.map((item) => (
                <div
                  key={item.title}
                  className="rounded-2xl border border-theme bg-blue-soft p-5"
                >
                  <div className="flex gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-theme bg-card text-lg text-blue-500">
                      ✦
                    </div>

                    <div>
                      <div className="font-bold text-main">{item.title}</div>
                      <p className="mt-1 text-sm leading-6 text-muted">
                        {item.text}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl px-5 py-3 text-sm font-semibold transition-colors ${
        active
          ? "bg-blue-600 text-white"
          : "border border-theme bg-transparent text-muted hover:border-blue-500/40 hover:bg-blue-soft hover:text-main"
      }`}
    >
      {children}
    </button>
  );
}

function Characteristic({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-5 rounded-2xl border border-theme bg-blue-soft px-5 py-4">
      <span className="text-sm text-muted">{label}</span>
      <span className="text-right text-sm font-bold text-main">{value}</span>
    </div>
  );
}