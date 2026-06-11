"use client";

import { useEffect, useMemo, useState } from "react";

type Question = {
  id: string;
  categoryId: string;
  question: string;
  answer: string;
  isActive: boolean;
  sortOrder: number;
};

type Category = {
  id: string;
  slug: string;
  eyebrow: string;
  title: string;
  icon: string;
  description: string;
  isActive: boolean;
  sortOrder: number;
  questions: Question[];
};

const inputClass =
  "w-full rounded-xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none placeholder:text-white/25 focus:border-blue-500/60";

export function FaqAdminClient() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const selected = useMemo(
    () => categories.find((category) => category.id === selectedId) ?? categories[0],
    [categories, selectedId],
  );

  async function load() {
    setLoading(true);

    try {
      const response = await fetch("/api/admin/faq", { cache: "no-store" });
      const payload = await response.json();
      const next = Array.isArray(payload.categories) ? payload.categories : [];
      setCategories(next);
      setSelectedId((current) =>
        next.some((item: Category) => item.id === current)
          ? current
          : next[0]?.id ?? "",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function save(
    method: "POST" | "PATCH",
    body: Record<string, unknown>,
  ) {
    setSaving(true);
    setMessage("");

    try {
      const response = await fetch("/api/admin/faq", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "Не удалось сохранить.");
      }

      setMessage("Сохранено.");
      await load();
      return payload.item;
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Ошибка.");
      return null;
    } finally {
      setSaving(false);
    }
  }

  async function remove(entity: "category" | "question", id: string) {
    const confirmed = window.confirm(
      entity === "category"
        ? "Удалить раздел вместе со всеми вопросами?"
        : "Удалить вопрос?",
    );

    if (!confirmed) return;

    const response = await fetch(
      `/api/admin/faq?entity=${entity}&id=${encodeURIComponent(id)}`,
      { method: "DELETE" },
    );

    if (!response.ok) {
      setMessage("Не удалось удалить.");
      return;
    }

    setMessage("Удалено.");
    await load();
  }

  function patchCategory(id: string, patch: Partial<Category>) {
    setCategories((current) =>
      current.map((category) =>
        category.id === id ? { ...category, ...patch } : category,
      ),
    );
  }

  function patchQuestion(id: string, patch: Partial<Question>) {
    setCategories((current) =>
      current.map((category) => ({
        ...category,
        questions: category.questions.map((question) =>
          question.id === id ? { ...question, ...patch } : question,
        ),
      })),
    );
  }

  async function createCategory() {
    const item = await save("POST", {
      entity: "category",
      title: "Новый раздел",
      slug: `section-${Date.now()}`,
      eyebrow: "Раздел",
      icon: "?",
      description: "",
      isActive: true,
      sortOrder: (categories.at(-1)?.sortOrder ?? 0) + 10,
    });

    if (item?.id) setSelectedId(item.id);
  }

  async function createQuestion() {
    if (!selected) return;

    await save("POST", {
      entity: "question",
      categoryId: selected.id,
      question: "Новый вопрос",
      answer: "Введите ответ.",
      isActive: true,
      sortOrder: (selected.questions.at(-1)?.sortOrder ?? 0) + 10,
    });
  }

  if (loading) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-8 text-white/55">
        Загружаем FAQ…
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
      <aside className="h-fit rounded-[28px] border border-white/10 bg-white/[0.035] p-4 lg:sticky lg:top-6">
        <button
          type="button"
          onClick={() => void createCategory()}
          disabled={saving}
          className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-50"
        >
          Добавить раздел
        </button>

        <div className="mt-4 grid gap-2">
          {categories.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => setSelectedId(category.id)}
              className={`rounded-2xl border p-4 text-left transition-colors ${
                selected?.id === category.id
                  ? "border-blue-500/50 bg-blue-500/10"
                  : "border-white/10 bg-black/20 hover:border-blue-500/30"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 font-bold text-blue-400">
                  {category.icon || "?"}
                </span>
                <div className="min-w-0">
                  <div className="truncate font-semibold">{category.title}</div>
                  <div className="mt-1 text-xs text-white/40">
                    {category.questions.length} вопросов · порядок {category.sortOrder}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </aside>

      <section className="min-w-0">
        {!selected ? (
          <div className="rounded-[28px] border border-dashed border-white/10 p-8 text-white/50">
            Создайте первый раздел FAQ.
          </div>
        ) : (
          <>
            <div className="rounded-[28px] border border-white/10 bg-white/[0.035] p-5 sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-400">
                    Настройка раздела
                  </div>
                  <h1 className="mt-2 text-3xl font-bold">{selected.title}</h1>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() =>
                      void save("PATCH", {
                        entity: "category",
                        ...selected,
                      })
                    }
                    className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold hover:bg-blue-500 disabled:opacity-50"
                  >
                    Сохранить раздел
                  </button>
                  <button
                    type="button"
                    onClick={() => void remove("category", selected.id)}
                    className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm font-semibold text-red-200 hover:bg-red-500/20"
                  >
                    Удалить
                  </button>
                </div>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <Field label="Название">
                  <input
                    value={selected.title}
                    onChange={(event) =>
                      patchCategory(selected.id, { title: event.target.value })
                    }
                    className={inputClass}
                  />
                </Field>

                <Field label="Slug">
                  <input
                    value={selected.slug}
                    onChange={(event) =>
                      patchCategory(selected.id, { slug: event.target.value })
                    }
                    className={inputClass}
                  />
                </Field>

                <Field label="Надпись над заголовком">
                  <input
                    value={selected.eyebrow}
                    onChange={(event) =>
                      patchCategory(selected.id, { eyebrow: event.target.value })
                    }
                    className={inputClass}
                  />
                </Field>

                <Field label="Иконка / символ">
                  <input
                    value={selected.icon}
                    onChange={(event) =>
                      patchCategory(selected.id, {
                        icon: event.target.value.slice(0, 4),
                      })
                    }
                    className={inputClass}
                  />
                </Field>

                <Field label="Порядок">
                  <input
                    type="number"
                    value={selected.sortOrder}
                    onChange={(event) =>
                      patchCategory(selected.id, {
                        sortOrder: Number(event.target.value),
                      })
                    }
                    className={inputClass}
                  />
                </Field>

                <Field label="Статус">
                  <select
                    value={selected.isActive ? "active" : "hidden"}
                    onChange={(event) =>
                      patchCategory(selected.id, {
                        isActive: event.target.value === "active",
                      })
                    }
                    className={inputClass}
                  >
                    <option value="active">Показывать</option>
                    <option value="hidden">Скрыть</option>
                  </select>
                </Field>

                <div className="md:col-span-2">
                  <Field label="Описание">
                    <textarea
                      value={selected.description}
                      onChange={(event) =>
                        patchCategory(selected.id, {
                          description: event.target.value,
                        })
                      }
                      rows={3}
                      className={inputClass}
                    />
                  </Field>
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-[28px] border border-white/10 bg-white/[0.035] p-5 sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-400">
                    Вопросы раздела
                  </div>
                  <h2 className="mt-2 text-2xl font-bold">
                    {selected.questions.length} вопросов
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() => void createQuestion()}
                  disabled={saving}
                  className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold hover:bg-blue-500 disabled:opacity-50"
                >
                  Добавить вопрос
                </button>
              </div>

              <div className="mt-5 grid gap-4">
                {selected.questions.map((question) => (
                  <article
                    key={question.id}
                    className="rounded-2xl border border-white/10 bg-black/20 p-4"
                  >
                    <div className="grid gap-4 md:grid-cols-[1fr_120px_150px]">
                      <Field label="Вопрос">
                        <input
                          value={question.question}
                          onChange={(event) =>
                            patchQuestion(question.id, {
                              question: event.target.value,
                            })
                          }
                          className={inputClass}
                        />
                      </Field>

                      <Field label="Порядок">
                        <input
                          type="number"
                          value={question.sortOrder}
                          onChange={(event) =>
                            patchQuestion(question.id, {
                              sortOrder: Number(event.target.value),
                            })
                          }
                          className={inputClass}
                        />
                      </Field>

                      <Field label="Статус">
                        <select
                          value={question.isActive ? "active" : "hidden"}
                          onChange={(event) =>
                            patchQuestion(question.id, {
                              isActive: event.target.value === "active",
                            })
                          }
                          className={inputClass}
                        >
                          <option value="active">Показывать</option>
                          <option value="hidden">Скрыть</option>
                        </select>
                      </Field>
                    </div>

                    <div className="mt-4">
                      <Field label="Ответ">
                        <textarea
                          value={question.answer}
                          onChange={(event) =>
                            patchQuestion(question.id, {
                              answer: event.target.value,
                            })
                          }
                          rows={4}
                          className={inputClass}
                        />
                      </Field>
                    </div>

                    <div className="mt-4 flex justify-end gap-2">
                      <button
                        type="button"
                        disabled={saving}
                        onClick={() =>
                          void save("PATCH", {
                            entity: "question",
                            ...question,
                          })
                        }
                        className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold hover:bg-blue-500 disabled:opacity-50"
                      >
                        Сохранить вопрос
                      </button>

                      <button
                        type="button"
                        onClick={() => void remove("question", question.id)}
                        className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm font-semibold text-red-200 hover:bg-red-500/20"
                      >
                        Удалить
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            {message ? (
              <div className="mt-4 rounded-2xl border border-blue-500/25 bg-blue-500/10 px-4 py-3 text-sm text-blue-200">
                {message}
              </div>
            ) : null}
          </>
        )}
      </section>
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
    <label className="grid gap-2">
      <span className="text-xs font-semibold uppercase tracking-[0.14em] text-white/40">
        {label}
      </span>
      {children}
    </label>
  );
}
