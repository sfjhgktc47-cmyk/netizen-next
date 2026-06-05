"use client";

import { useEffect, useState } from "react";

type Feature = {
  id: string;
  title: string;
  text: string;
  icon: string;
  isActive: boolean;
  sortOrder: number;
};

type Question = {
  id: string;
  question: string;
  answer: string;
  isActive: boolean;
  sortOrder: number;
};

const fieldClass =
  "w-full rounded-xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none focus:border-blue-500/60";

export function SupportContentAdminClient() {
  const [features, setFeatures] = useState<Feature[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function load() {
    const response = await fetch("/api/admin/support-content", { cache: "no-store" });
    const payload = await response.json();
    setFeatures(Array.isArray(payload.features) ? payload.features : []);
    setQuestions(Array.isArray(payload.questions) ? payload.questions : []);
  }

  useEffect(() => {
    void load();
  }, []);

  async function save(method: "POST" | "PATCH", body: Record<string, unknown>) {
    setSaving(true);
    setMessage("");

    try {
      const response = await fetch("/api/admin/support-content", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const payload = await response.json();

      if (!response.ok) throw new Error(payload.error || "Не удалось сохранить.");

      setMessage("Сохранено.");
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Ошибка.");
    } finally {
      setSaving(false);
    }
  }

  async function remove(entity: "feature" | "question", id: string) {
    if (!window.confirm("Удалить этот элемент?")) return;

    const response = await fetch(
      `/api/admin/support-content?entity=${entity}&id=${encodeURIComponent(id)}`,
      { method: "DELETE" },
    );

    if (response.ok) {
      setMessage("Удалено.");
      await load();
    }
  }

  return (
    <div className="grid gap-6">
      <AdminSection
        title="Преимущества слева"
        buttonLabel="Добавить преимущество"
        onAdd={() =>
          void save("POST", {
            entity: "feature",
            title: "Новое преимущество",
            text: "",
            icon: "✓",
            isActive: true,
            sortOrder: (features.at(-1)?.sortOrder ?? 0) + 10,
          })
        }
      >
        {features.map((item) => (
          <div key={item.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <div className="grid gap-3 md:grid-cols-[90px_1fr_130px_150px]">
              <input
                value={item.icon}
                onChange={(event) =>
                  setFeatures((current) =>
                    current.map((value) =>
                      value.id === item.id ? { ...value, icon: event.target.value } : value,
                    ),
                  )
                }
                className={fieldClass}
                placeholder="Иконка"
              />
              <input
                value={item.title}
                onChange={(event) =>
                  setFeatures((current) =>
                    current.map((value) =>
                      value.id === item.id ? { ...value, title: event.target.value } : value,
                    ),
                  )
                }
                className={fieldClass}
                placeholder="Название"
              />
              <input
                type="number"
                value={item.sortOrder}
                onChange={(event) =>
                  setFeatures((current) =>
                    current.map((value) =>
                      value.id === item.id
                        ? { ...value, sortOrder: Number(event.target.value) }
                        : value,
                    ),
                  )
                }
                className={fieldClass}
              />
              <select
                value={item.isActive ? "active" : "hidden"}
                onChange={(event) =>
                  setFeatures((current) =>
                    current.map((value) =>
                      value.id === item.id
                        ? { ...value, isActive: event.target.value === "active" }
                        : value,
                    ),
                  )
                }
                className={fieldClass}
              >
                <option value="active">Показывать</option>
                <option value="hidden">Скрыть</option>
              </select>
            </div>

            <textarea
              value={item.text}
              onChange={(event) =>
                setFeatures((current) =>
                  current.map((value) =>
                    value.id === item.id ? { ...value, text: event.target.value } : value,
                  ),
                )
              }
              rows={3}
              className={`${fieldClass} mt-3`}
              placeholder="Описание"
            />

            <div className="mt-3 flex justify-end gap-2">
              <button
                type="button"
                disabled={saving}
                onClick={() => void save("PATCH", { entity: "feature", ...item })}
                className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold hover:bg-blue-500 disabled:opacity-50"
              >
                Сохранить
              </button>
              <button
                type="button"
                onClick={() => void remove("feature", item.id)}
                className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm font-semibold text-red-200"
              >
                Удалить
              </button>
            </div>
          </div>
        ))}
      </AdminSection>

      <AdminSection
        title="Вопросы справа"
        buttonLabel="Добавить вопрос"
        onAdd={() =>
          void save("POST", {
            entity: "question",
            question: "Новый вопрос",
            answer: "Введите ответ.",
            isActive: true,
            sortOrder: (questions.at(-1)?.sortOrder ?? 0) + 10,
          })
        }
      >
        {questions.map((item) => (
          <div key={item.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <div className="grid gap-3 md:grid-cols-[1fr_130px_150px]">
              <input
                value={item.question}
                onChange={(event) =>
                  setQuestions((current) =>
                    current.map((value) =>
                      value.id === item.id ? { ...value, question: event.target.value } : value,
                    ),
                  )
                }
                className={fieldClass}
                placeholder="Вопрос"
              />
              <input
                type="number"
                value={item.sortOrder}
                onChange={(event) =>
                  setQuestions((current) =>
                    current.map((value) =>
                      value.id === item.id
                        ? { ...value, sortOrder: Number(event.target.value) }
                        : value,
                    ),
                  )
                }
                className={fieldClass}
              />
              <select
                value={item.isActive ? "active" : "hidden"}
                onChange={(event) =>
                  setQuestions((current) =>
                    current.map((value) =>
                      value.id === item.id
                        ? { ...value, isActive: event.target.value === "active" }
                        : value,
                    ),
                  )
                }
                className={fieldClass}
              >
                <option value="active">Показывать</option>
                <option value="hidden">Скрыть</option>
              </select>
            </div>

            <textarea
              value={item.answer}
              onChange={(event) =>
                setQuestions((current) =>
                  current.map((value) =>
                    value.id === item.id ? { ...value, answer: event.target.value } : value,
                  ),
                )
              }
              rows={4}
              className={`${fieldClass} mt-3`}
              placeholder="Ответ"
            />

            <div className="mt-3 flex justify-end gap-2">
              <button
                type="button"
                disabled={saving}
                onClick={() => void save("PATCH", { entity: "question", ...item })}
                className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold hover:bg-blue-500 disabled:opacity-50"
              >
                Сохранить
              </button>
              <button
                type="button"
                onClick={() => void remove("question", item.id)}
                className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm font-semibold text-red-200"
              >
                Удалить
              </button>
            </div>
          </div>
        ))}
      </AdminSection>

      {message ? (
        <div className="rounded-2xl border border-blue-500/25 bg-blue-500/10 px-4 py-3 text-sm text-blue-200">
          {message}
        </div>
      ) : null}
    </div>
  );
}

function AdminSection({
  title,
  buttonLabel,
  onAdd,
  children,
}: {
  title: string;
  buttonLabel: string;
  onAdd: () => void;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[28px] border border-white/10 bg-white/[0.035] p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-2xl font-bold">{title}</h2>
        <button
          type="button"
          onClick={onAdd}
          className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold hover:bg-blue-500"
        >
          {buttonLabel}
        </button>
      </div>
      <div className="mt-5 grid gap-4">{children}</div>
    </section>
  );
}
