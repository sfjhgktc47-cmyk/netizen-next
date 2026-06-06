"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";

type FaqQuestion = {
  id: string;
  question: string;
  answer: string;
  image: string;
};

type FaqCategory = {
  id: string;
  slug: string;
  eyebrow: string;
  title: string;
  icon: string;
  image: string;
  description: string;
  questions: FaqQuestion[];
};

type FaqHighlight = {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  image: string;
};

type FaqHeader = {
  title: string;
  subtitle: string;
  showSupportButton: boolean;
  supportButtonText: string;
  supportButtonHref: string;
  showCatalogButton: boolean;
  catalogButtonText: string;
  catalogButtonHref: string;
};

const defaultHeader: FaqHeader = {
  title: "Частые вопросы",
  subtitle: "Коротко объясняем, как работает выбор техники, корзина, доставка, оплата и связь с менеджером.",
  showSupportButton: true,
  supportButtonText: "Написать в поддержку",
  supportButtonHref: "/help",
  showCatalogButton: true,
  catalogButtonText: "Перейти в каталог",
  catalogButtonHref: "/catalog",
};

const emptyCategory: FaqCategory = {
  id: "",
  slug: "",
  eyebrow: "",
  title: "FAQ пока не заполнен",
  icon: "?",
  image: "",
  description: "Добавьте разделы и вопросы в админ-панели.",
  questions: [],
};

export default function FaqPage() {
  const [faqCategories, setFaqCategories] = useState<FaqCategory[]>([]);
  const [faqHighlights, setFaqHighlights] = useState<FaqHighlight[]>([]);
  const [faqHeader, setFaqHeader] = useState<FaqHeader>(defaultHeader);
  const [activeCategoryId, setActiveCategoryId] = useState("");
  const [faqLoading, setFaqLoading] = useState(true);
  const [activeQuestion, setActiveQuestion] = useState<number | null>(null);
  const activeQuestionRef = useRef<HTMLElement | null>(null);
  const questionsAreaRef = useRef<HTMLDivElement | null>(null);
  const [activeQuestionHeight, setActiveQuestionHeight] = useState(0);

  const activeCategory = useMemo(
    () =>
      faqCategories.find((category) => category.id === activeCategoryId) ??
      faqCategories[0] ??
      emptyCategory,
    [activeCategoryId, faqCategories],
  );

  useEffect(() => {
    let mounted = true;

    fetch("/api/faq", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : Promise.reject()))
      .then((payload: { categories?: FaqCategory[]; highlights?: FaqHighlight[]; header?: FaqHeader }) => {
        if (!mounted) return;

        const categories = Array.isArray(payload.categories)
          ? payload.categories
          : [];

        setFaqCategories(categories);
        setFaqHighlights(Array.isArray(payload.highlights) ? payload.highlights : []);
        setFaqHeader(payload.header ?? defaultHeader);
        setActiveCategoryId((current) =>
          categories.some((category) => category.id === current)
            ? current
            : categories[0]?.id ?? "",
        );
      })
      .catch(() => {
        if (!mounted) return;
        setFaqCategories([]);
        setActiveCategoryId("");
      })
      .finally(() => {
        if (mounted) setFaqLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

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
    <main className="min-h-screen bg-page px-6 py-6 text-main transition-colors duration-700">
      <div className="mx-auto max-w-[1440px]">
        <SiteHeader />

        <section className="mt-6">
          <nav
            aria-label="Хлебные крошки"
            className="flex flex-wrap items-center gap-2 text-xs text-muted sm:text-sm"
          >
            <Link href="/" className="transition-colors hover:text-blue-500">
              Главная
            </Link>
            <span className="text-muted-soft">›</span>
            <span className="font-medium text-main">FAQ</span>
          </nav>

          <div className="mt-5 flex flex-col gap-5 border-b border-theme pb-7 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="max-w-[820px] text-5xl font-bold tracking-[-0.055em] md:text-6xl">
                {faqHeader.title}
              </h1>

              <p className="mt-3 max-w-[720px] text-base leading-relaxed text-muted md:text-lg">
                {faqHeader.subtitle}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              {faqHeader.showSupportButton ? (
                <Link href={faqHeader.supportButtonHref} className="rounded-2xl bg-blue-600 px-6 py-4 text-sm font-semibold text-white transition-colors hover:bg-blue-500">
                  {faqHeader.supportButtonText} →
                </Link>
              ) : null}
              {faqHeader.showCatalogButton ? (
                <Link href={faqHeader.catalogButtonHref} className="rounded-2xl border border-theme px-6 py-4 text-sm font-semibold transition-colors hover:border-blue-500/45 hover:text-blue-500">
                  {faqHeader.catalogButtonText}
                </Link>
              ) : null}
            </div>
          </div>
        </section>

        {faqLoading ? (
          <div className="mt-6 rounded-3xl border border-theme bg-card p-8 text-sm text-muted">
            Загружаем FAQ…
          </div>
        ) : null}

        {!faqLoading && faqCategories.length === 0 ? (
          <div className="mt-6 rounded-3xl border border-dashed border-theme bg-card p-8 text-sm text-muted">
            FAQ пока пуст. Разделы можно добавить в админ-панели.
          </div>
        ) : null}

        {faqCategories.length > 0 ? (
        <section className="mt-6 grid gap-7 lg:grid-cols-[360px_1fr]">
          <aside className="grid h-fit gap-3 lg:sticky lg:top-6">
            {faqCategories.map((category) => {
              const isActive = category.id === activeCategoryId;

              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => selectCategory(category.id)}
                  className={`rounded-[26px] border p-5 text-left transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-500/40 ${
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
                      {category.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={category.image} alt="" className="h-full w-full object-contain p-1" />
                      ) : (
                        category.icon
                      )}
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
              className="relative p-5 pb-8 md:p-7 md:pb-10"
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
                  className="absolute left-5 right-5 top-5 z-30 cursor-pointer rounded-[24px] border border-blue-500/45 bg-[var(--card)] p-5 shadow-[0_30px_80px_rgba(15,23,42,0.24)] ring-1 ring-blue-500/10 md:left-7 md:right-7 md:top-7 md:p-6"
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
                  {selectedQuestion.image ? (
                    <div className="mt-5 overflow-hidden rounded-2xl border border-theme bg-white">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={selectedQuestion.image} alt="" className="max-h-[420px] w-full object-contain" />
                    </div>
                  ) : null}
                </article>
              )}

              <div className="relative z-10 grid gap-3">
                {activeCategory.questions.map((item, index) => {
                  const isActiveRow = activeQuestion === index;

                  return (
                    <button
                      key={item.id || item.question}
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

        ) : null}

        {faqHighlights.length > 0 ? (
          <section className="mt-6 grid gap-5 md:grid-cols-3">
            {faqHighlights.map((item) => (
              <div key={item.id} className="card overflow-hidden rounded-[28px]">
                {item.image ? (
                  <div className="flex h-44 items-center justify-center border-b border-theme bg-white p-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.image} alt="" className="h-full w-full object-contain" />
                  </div>
                ) : null}
                <div className="p-7">
                  <div className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-500">{item.eyebrow}</div>
                  <h3 className="mt-4 text-2xl font-bold tracking-[-0.04em]">{item.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted">{item.description}</p>
                </div>
              </div>
            ))}
          </section>
        ) : null}
      </div>
    </main>
  );
}
