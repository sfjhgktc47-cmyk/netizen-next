"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";

const faqCategories = [
  {
    id: "delivery",
    eyebrow: "Получение",
    title: "Доставка и ПВЗ",
    icon: "→",
    description: "Курьер, самовывоз, адрес и сроки получения заказа.",
    questions: [
      {
        question: "Как выбрать доставку?",
        answer:
          "В корзине откройте блок «Доставка» и выберите курьерскую доставку или ПВЗ / самовывоз. Пока способ получения не выбран, оформить заказ нельзя.",
      },
      {
        question: "Что нужно указать для курьерской доставки?",
        answer:
          "Незарегистрированный клиент указывает город и адрес доставки. Если клиент вошёл в личный кабинет, можно выбрать сохранённый адрес или добавить новый.",
      },
      {
        question: "Как работает ПВЗ / самовывоз?",
        answer:
          "Клиент выбирает пункт выдачи из доступного варианта на сайте. Адрес ПВЗ задаётся магазином и будет показан в корзине перед оформлением.",
      },
      {
        question: "Когда станет известен точный срок?",
        answer:
          "После заявки менеджер проверит наличие, город, способ получения и подтвердит точный срок вручную.",
      },
    ],
  },
  {
    id: "order",
    eyebrow: "Заявка",
    title: "Заказ и подтверждение",
    icon: "№",
    description: "Как проходит заявка, подтверждение и связь с менеджером.",
    questions: [
      {
        question: "Это онлайн-оплата или заявка?",
        answer:
          "Сейчас оформление работает как заявка. Клиент выбирает товар, доставку и контакты, а менеджер подтверждает наличие, конфигурацию и итоговую стоимость.",
      },
      {
        question: "Почему заказ подтверждает менеджер?",
        answer:
          "У техники могут меняться наличие, поставка, цвет, память и цена. Поэтому перед передачей товара менеджер проверяет детали и связывается с клиентом.",
      },
      {
        question: "Что будет после отправки заявки?",
        answer:
          "Менеджер получит данные заказа, проверит товар и свяжется с клиентом для подтверждения способа получения и итоговой суммы.",
      },
      {
        question: "Можно ли изменить конфигурацию после заявки?",
        answer:
          "Да. До подтверждения менеджером можно обсудить другую память, цвет, SIM/eSIM или похожую модель.",
      },
    ],
  },
  {
    id: "payment",
    eyebrow: "Оплата",
    title: "Наличные при получении",
    icon: "₽",
    description: "Как клиент оплачивает заказ и почему нет онлайн-оплаты.",
    questions: [
      {
        question: "Какая оплата доступна?",
        answer:
          "Оплата только наличными при получении. Онлайн-оплаты на сайте сейчас нет.",
      },
      {
        question: "Нужно ли вносить предоплату?",
        answer:
          "Для обычной заявки предоплата на сайте не требуется. Если товар редкий или под заказ, условия менеджер уточнит отдельно.",
      },
      {
        question: "Цена на сайте окончательная?",
        answer:
          "Цена показывает ориентир по выбранной модели или конкретной конфигурации. Итоговую сумму менеджер подтверждает перед получением.",
      },
    ],
  },
  {
    id: "products",
    eyebrow: "Каталог",
    title: "Товары и конфигурации",
    icon: "N",
    description: "Модели, память, цвет, SIM/eSIM и наличие.",
    questions: [
      {
        question: "Почему в каталоге цена “от — до”?",
        answer:
          "Каталог показывает модель товара, а цена считается по всем доступным конфигурациям: память, цвет, SIM/eSIM и наличие.",
      },
      {
        question: "Когда появляется точная цена?",
        answer:
          "Точная цена появляется после выбора конкретной конфигурации товара. Например: iPhone 17 Pro, 256 GB, Blue, eSIM.",
      },
      {
        question: "Почему некоторые параметры серые?",
        answer:
          "Серые параметры показывают варианты, которые недоступны в текущей комбинации. Их видно, но выбрать нельзя, чтобы клиент не собрал несуществующий товар.",
      },
      {
        question: "Можно ли заказать товар, которого нет в каталоге?",
        answer:
          "Да. Для этого лучше написать в поддержку и указать модель, желаемую конфигурацию и бюджет.",
      },
    ],
  },
  {
    id: "warranty",
    eyebrow: "После покупки",
    title: "Гарантия и проблема",
    icon: "!",
    description: "Что делать после покупки, если есть вопрос по товару.",
    questions: [
      {
        question: "Техника оригинальная?",
        answer:
          "Да, магазин работает с оригинальной техникой. Детали по конкретной поставке и гарантии менеджер подтверждает перед заказом.",
      },
      {
        question: "Что делать, если возникла проблема?",
        answer:
          "Напишите в поддержку и выберите тему «Брак / проблема». Лучше сразу указать модель, дату покупки, номер заявки и кратко описать ситуацию.",
      },
      {
        question: "Гарантия одинаковая на все товары?",
        answer:
          "Условия могут отличаться в зависимости от модели и поставки. Поэтому гарантию по конкретному товару лучше уточнить до оформления.",
      },
    ],
  },
];

export default function FaqPage() {
  const [activeCategoryId, setActiveCategoryId] = useState(faqCategories[0].id);
  const [activeQuestion, setActiveQuestion] = useState<number | null>(null);
  const activeQuestionRef = useRef<HTMLElement | null>(null);
  const questionsAreaRef = useRef<HTMLDivElement | null>(null);
  const [activeQuestionHeight, setActiveQuestionHeight] = useState(0);

  const activeCategory = useMemo(
    () =>
      faqCategories.find((category) => category.id === activeCategoryId) ??
      faqCategories[0],
    [activeCategoryId]
  );

  const selectedQuestion =
    activeQuestion === null ? null : activeCategory.questions[activeQuestion] ?? null;

  useEffect(() => {
    if (!selectedQuestion || !activeQuestionRef.current) {
      setActiveQuestionHeight(0);
      return;
    }

    const element = activeQuestionRef.current;

    function updateHeight() {
      setActiveQuestionHeight(element.getBoundingClientRect().height);
    }

    updateHeight();

    const observer = new ResizeObserver(updateHeight);
    observer.observe(element);

    window.addEventListener("resize", updateHeight);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateHeight);
    };
  }, [selectedQuestion]);

  useEffect(() => {
    if (!selectedQuestion) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setActiveQuestion(null);
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedQuestion]);

  function toggleQuestion(index: number) {
    setActiveQuestion((current) => (current === index ? null : index));
  }

  function selectCategory(categoryId: string) {
    setActiveCategoryId(categoryId);
    setActiveQuestion(null);
  }

  return (
    <main className="min-h-screen bg-page px-4 py-4 text-main transition-colors duration-700 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1760px]">
        <SiteHeader />

        <section className="mt-6">
          <div className="flex flex-col items-start gap-3">
            <Link href="/" className="text-sm font-medium text-blue-500">
              ← На главную
            </Link>

            <div className="inline-flex rounded-full border border-blue-500/35 bg-blue-500/10 px-4 py-2 text-sm font-medium text-blue-500">
              FAQ Netizen
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-5 border-b border-theme pb-7 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="max-w-[820px] text-4xl font-bold tracking-[-0.055em] sm:text-5xl lg:text-6xl">
                Частые вопросы
              </h1>

              <p className="mt-3 max-w-[720px] text-base leading-relaxed text-muted md:text-lg">
                Коротко объясняем, как работает выбор техники, корзина, доставка,
                оплата наличными и связь с менеджером.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/help"
                className="rounded-2xl bg-blue-600 px-6 py-4 text-sm font-semibold text-white transition-colors hover:bg-blue-500"
              >
                Написать в поддержку →
              </Link>
              <Link
                href="/catalog"
                className="rounded-2xl border border-theme px-6 py-4 text-sm font-semibold transition-colors hover:border-blue-500/45 hover:text-blue-500"
              >
                Перейти в каталог
              </Link>
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-5 lg:grid-cols-[320px_1fr] xl:grid-cols-[360px_1fr] xl:gap-7">
          <aside className="mobile-scroll-snap -mx-1 flex gap-3 overflow-x-auto px-1 pb-2 lg:mx-0 lg:grid lg:overflow-visible lg:px-0 lg:pb-0 lg:sticky lg:top-6">
            {faqCategories.map((category) => {
              const isActive = category.id === activeCategoryId;

              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => selectCategory(category.id)}
                  className={`min-w-[280px] rounded-[24px] border p-4 text-left transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-500/40 sm:p-5 lg:min-w-0 lg:rounded-[26px] ${
                    isActive ? "border-blue-500/45 bg-blue-soft" : "card"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-base font-bold ${
                        isActive
                          ? "bg-blue-600 text-white"
                          : "bg-blue-soft text-blue-500"
                      }`}
                    >
                      {category.icon}
                    </div>

                    <div>
                      <div className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-500">
                        {category.eyebrow}
                      </div>
                      <h2 className="mt-1 text-lg font-bold">
                        {category.title}
                      </h2>
                      <p className="mt-2 text-sm leading-relaxed text-muted">
                        {category.description}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </aside>

          <div className="card overflow-hidden rounded-[34px]">
            <div className="border-b border-theme p-7 md:p-9">
              <div className="text-sm font-semibold uppercase tracking-[0.22em] text-blue-500">
                {activeCategory.eyebrow}
              </div>

              <div className="mt-3 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                  <h2 className="text-4xl font-bold tracking-[-0.05em]">
                    {activeCategory.title}
                  </h2>
                  <p className="mt-3 max-w-[640px] text-sm leading-relaxed text-muted md:text-base">
                    {activeCategory.description}
                  </p>
                </div>

                <div className="rounded-2xl border border-blue-500/30 bg-blue-500/10 px-5 py-4 text-sm text-blue-500">
                  {activeCategory.questions.length} ответа в разделе
                </div>
              </div>
            </div>

            <div
              ref={questionsAreaRef}
              className="relative p-4 pb-7 sm:p-5 sm:pb-8 md:p-7 md:pb-10"
              style={{
                minHeight: selectedQuestion
                  ? `${Math.max(activeQuestionHeight + 48, 260)}px`
                  : undefined,
              }}
            >
              {selectedQuestion && (
                <article
                  ref={activeQuestionRef}
                  role="button"
                  tabIndex={0}
                  onClick={() => setActiveQuestion(null)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      setActiveQuestion(null);
                    }
                  }}
                  className="absolute left-4 right-4 top-4 z-30 cursor-pointer rounded-[22px] border border-blue-500/45 bg-[var(--card)] p-4 shadow-[0_30px_80px_rgba(15,23,42,0.24)] ring-1 ring-blue-500/10 sm:left-5 sm:right-5 sm:top-5 sm:p-5 md:left-7 md:right-7 md:top-7 md:p-6"
                >
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="min-w-0 max-w-[920px] break-words text-lg font-bold leading-snug tracking-[-0.03em] md:text-xl">
                      {selectedQuestion.question}
                    </h3>

                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        setActiveQuestion(null);
                      }}
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-blue-500/30 bg-blue-soft text-lg font-medium text-blue-500 transition-colors hover:bg-blue-600 hover:text-white"
                      aria-label="Свернуть вопрос"
                    >
                      ×
                    </button>
                  </div>

                  <p className="mt-4 max-w-[860px] break-words text-sm leading-relaxed text-muted md:text-base">
                    {selectedQuestion.answer}
                  </p>
                </article>
              )}

              <div className="relative z-10 grid gap-3">
                {activeCategory.questions.map((item, index) => {
                  const isActiveRow = activeQuestion === index;

                  return (
                    <button
                      key={item.question}
                      type="button"
                      onClick={() => toggleQuestion(index)}
                      className={`group relative z-0 flex w-full items-start justify-between gap-4 rounded-[22px] border bg-[var(--card)] px-5 py-4 text-left transition-colors duration-300 hover:border-blue-500/40 hover:bg-blue-soft ${
                        isActiveRow ? "border-blue-500/35" : "border-theme"
                      }`}
                    >
                      <span className="min-w-0 break-words text-base font-bold leading-snug tracking-[-0.02em] md:text-lg">
                        {item.question}
                      </span>

                      <span
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl border text-lg font-medium transition-colors ${
                          isActiveRow
                            ? "border-blue-600 bg-blue-600 text-white"
                            : "border-theme bg-[var(--card)] text-blue-500 group-hover:border-blue-500/40 group-hover:bg-blue-600 group-hover:text-white"
                        }`}
                      >
                        {isActiveRow ? "×" : "+"}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-5 md:grid-cols-3">
          <div className="card rounded-[28px] p-7">
            <div className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-500">
              Подбор
            </div>
            <h3 className="mt-4 text-2xl font-bold tracking-[-0.04em]">
              Не знаете модель?
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              Напишите в поддержку задачу и бюджет — менеджер подскажет подходящую технику.
            </p>
          </div>

          <div className="card rounded-[28px] p-7">
            <div className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-500">
              Заказ
            </div>
            <h3 className="mt-4 text-2xl font-bold tracking-[-0.04em]">
              Всё подтверждается
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              Наличие, доставка и итоговая сумма подтверждаются менеджером перед получением.
            </p>
          </div>

          <div className="card rounded-[28px] p-7">
            <div className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-500">
              Оплата
            </div>
            <h3 className="mt-4 text-2xl font-bold tracking-[-0.04em]">
              Только наличными
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              Онлайн-оплаты нет. Клиент оплачивает заказ наличными при получении.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
