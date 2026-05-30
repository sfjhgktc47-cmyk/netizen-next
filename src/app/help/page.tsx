"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { supportTopics } from "@/lib/support-topics";

type ChatMessage = {
  id: string;
  role: "CLIENT" | "MANAGER";
  name: string;
  text: string;
  createdAt: string;
};

type SupportRequest = {
  id: string;
  number: string;
  topicId: string;
  status: string;
  messages: ChatMessage[];
};

const statusLabels: Record<string, string> = {
  NEW: "Новое",
  IN_PROGRESS: "В работе",
  WAITING_CLIENT: "Ожидает клиента",
  CLOSED: "Закрыто",
};

export default function HelpPage() {
  const [activeTopicId, setActiveTopicId] = useState(supportTopics[0].id);
  const [message, setMessage] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [requestsByTopic, setRequestsByTopic] = useState<Record<string, SupportRequest>>({});
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");

  const activeTopic = useMemo(
    () => supportTopics.find((topic) => topic.id === activeTopicId) ?? supportTopics[0],
    [activeTopicId],
  );
  const activeRequest = requestsByTopic[activeTopicId];
  const messages = activeRequest?.messages ?? [];

  useEffect(() => {
    if (!activeRequest?.number || activeRequest.status === "CLOSED") {
      return;
    }

    const intervalId = window.setInterval(async () => {
      try {
        const response = await fetch(`/api/support/requests/${activeRequest.number}`, {
          cache: "no-store",
        });

        if (!response.ok) {
          return;
        }

        const data = (await response.json()) as { request: SupportRequest };
        setRequestsByTopic((current) => ({
          ...current,
          [data.request.topicId]: data.request,
        }));
      } catch {
        // В тестовой версии просто ждём следующую попытку.
      }
    }, 3000);

    return () => window.clearInterval(intervalId);
  }, [activeRequest?.number, activeRequest?.status]);

  function selectTopic(topicId: string) {
    setActiveTopicId(topicId);
    setMessage("");
    setError("");
  }

  async function sendMessage(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedMessage = message.trim();

    if (!trimmedMessage || isSending) {
      return;
    }

    setIsSending(true);
    setError("");

    try {
      const endpoint = activeRequest
        ? `/api/support/requests/${activeRequest.number}/messages`
        : "/api/support/requests";
      const payload = activeRequest
        ? {
            text: trimmedMessage,
            role: "CLIENT",
            name: customerName.trim() || "Клиент",
          }
        : {
            topicId: activeTopic.id,
            message: trimmedMessage,
            customerName: customerName.trim() || "Гость Нетизен",
            phone: phone.trim(),
            email: email.trim(),
            source: "Сайт",
          };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Не удалось отправить обращение.");
      }

      const data = (await response.json()) as { request: SupportRequest };
      setRequestsByTopic((current) => ({
        ...current,
        [data.request.topicId]: data.request,
      }));
      setMessage("");
    } catch {
      setError("Не получилось отправить сообщение. Попробуйте ещё раз.");
    } finally {
      setIsSending(false);
    }
  }

  return (
    <main className="min-h-screen bg-page px-6 py-6 text-main transition-colors duration-700">
      <div className="mx-auto max-w-[1440px]">
        <SiteHeader />

        <section className="mt-10">
          <Link href="/" className="text-sm text-blue-500 transition-colors hover:text-blue-400">
            ← На главную
          </Link>

          <div className="mt-5 flex">
            <span className="w-fit rounded-full border border-blue-500/35 bg-blue-500/10 px-4 py-2 text-sm font-medium text-blue-500">
              Поддержка Netizen
            </span>
          </div>

          <h1 className="mt-5 max-w-[940px] text-4xl font-bold tracking-[-0.055em] md:text-5xl">
            Напишите нам — поможем разобраться
          </h1>

          <p className="mt-3 max-w-[720px] text-sm leading-relaxed text-muted">
            Выберите тему обращения или сразу напишите вопрос. Сообщение попадёт в админку в нужную папку, а ответ менеджера появится в этом чате.
          </p>
        </section>

        <div className="mt-6 border-t border-theme" />

        <section className="mt-6 grid gap-8 lg:grid-cols-[320px_minmax(0,1fr)]">
          <aside className="grid gap-3 self-start">
            {supportTopics.map((topic) => {
              const isActive = topic.id === activeTopic.id;
              const hasStartedChat = Boolean(requestsByTopic[topic.id]);

              return (
                <button
                  key={topic.id}
                  type="button"
                  onClick={() => selectTopic(topic.id)}
                  className={`flex gap-4 rounded-[24px] border p-5 text-left transition-all hover:-translate-y-0.5 hover:border-blue-500/45 ${
                    isActive ? "border-blue-500/60 bg-blue-soft shadow-sm" : "card"
                  }`}
                >
                  <span
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-lg font-bold ${
                      isActive ? "bg-blue-600 text-white" : "bg-blue-500/10 text-blue-500"
                    }`}
                  >
                    {topic.icon}
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-3">
                      <span className="text-xs font-medium uppercase tracking-[0.22em] text-blue-500">
                        {topic.eyebrow}
                      </span>
                      {hasStartedChat ? (
                        <span className="rounded-full bg-red-500 px-2 py-0.5 text-[11px] font-bold text-white">
                          чат
                        </span>
                      ) : null}
                    </span>

                    <span className="mt-2 block text-xl font-bold tracking-[-0.035em]">
                      {topic.title}
                    </span>

                    <span className="mt-3 block text-sm leading-relaxed text-muted">
                      {topic.text}
                    </span>
                  </span>
                </button>
              );
            })}
          </aside>

          <section className="card overflow-hidden rounded-[32px]">
            <div className="flex flex-col gap-4 border-b border-theme p-7 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="text-xs font-medium uppercase tracking-[0.22em] text-blue-500">
                  Чат поддержки
                </div>

                <h2 className="mt-2 text-3xl font-bold tracking-[-0.045em]">
                  {activeTopic.title}
                </h2>

                {activeRequest ? (
                  <p className="mt-2 text-sm text-muted">
                    Обращение {activeRequest.number} · {statusLabels[activeRequest.status] ?? activeRequest.status}
                  </p>
                ) : null}
              </div>

              <span className="w-fit rounded-full border border-blue-500/35 bg-blue-500/10 px-4 py-2 text-sm font-medium text-blue-500">
                {activeTopic.badge}
              </span>
            </div>

            <div className="grid lg:grid-cols-[minmax(0,1fr)_280px]">
              <div className="flex min-h-[640px] flex-col">
                <div className="flex-1 space-y-4 p-6 md:p-8">
                  <div className="max-w-[720px] rounded-[24px] bg-blue-soft px-5 py-4 text-sm font-medium leading-relaxed text-main">
                    {activeTopic.intro}
                  </div>

                  {messages.map((chatMessage) => (
                    <div
                      key={chatMessage.id}
                      className={`flex ${chatMessage.role === "CLIENT" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[720px] rounded-[24px] px-5 py-4 text-sm leading-relaxed ${
                          chatMessage.role === "CLIENT" ? "bg-blue-600 text-white" : "bg-blue-soft text-main"
                        }`}
                      >
                        <div className="mb-1 text-xs opacity-70">{chatMessage.name}</div>
                        {chatMessage.text}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-theme p-5 md:p-6">
                  <div className="mb-4 flex flex-wrap gap-2">
                    {activeTopic.quickMessages.map((quickMessage) => (
                      <button
                        key={quickMessage}
                        type="button"
                        onClick={() => setMessage(quickMessage)}
                        className="rounded-full border border-theme bg-transparent px-4 py-2 text-sm text-muted transition-colors hover:border-blue-500/40 hover:bg-blue-soft hover:text-main"
                      >
                        {quickMessage}
                      </button>
                    ))}
                  </div>

                  {!activeRequest ? (
                    <div className="mb-3 grid gap-3 md:grid-cols-3">
                      <input
                        value={customerName}
                        onChange={(event) => setCustomerName(event.target.value)}
                        placeholder="Ваше имя"
                        className="min-h-11 rounded-2xl border border-theme bg-transparent px-4 text-sm outline-none placeholder:text-muted-soft focus:border-blue-500/50"
                      />
                      <input
                        value={phone}
                        onChange={(event) => setPhone(event.target.value)}
                        placeholder="Телефон"
                        className="min-h-11 rounded-2xl border border-theme bg-transparent px-4 text-sm outline-none placeholder:text-muted-soft focus:border-blue-500/50"
                      />
                      <input
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        placeholder="E-mail"
                        className="min-h-11 rounded-2xl border border-theme bg-transparent px-4 text-sm outline-none placeholder:text-muted-soft focus:border-blue-500/50"
                      />
                    </div>
                  ) : null}

                  <form onSubmit={sendMessage} className="flex flex-col gap-3 sm:flex-row">
                    <input
                      value={message}
                      onChange={(event) => setMessage(event.target.value)}
                      placeholder={activeTopic.placeholder}
                      className="min-h-12 flex-1 rounded-2xl border border-theme bg-transparent px-5 text-sm outline-none placeholder:text-muted-soft focus:border-blue-500/50"
                    />

                    <button
                      type="submit"
                      disabled={!message.trim() || isSending}
                      className="rounded-2xl bg-blue-600 px-7 py-4 text-sm font-medium text-white transition-colors hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-45"
                    >
                      {isSending ? "Отправляем..." : "Отправить"}
                    </button>
                  </form>

                  {error ? <p className="mt-3 text-xs text-red-500">{error}</p> : null}

                  <p className="mt-3 text-xs leading-relaxed text-muted-soft">
                    Обращение создаётся в нужной теме и сразу появляется в админке. Ответ менеджера подтягивается в этот чат автоматически.
                  </p>
                </div>
              </div>

              <aside className="space-y-4 border-t border-theme p-6 lg:border-l lg:border-t-0">
                <InfoCard title="Менеджер ответит здесь">
                  Клиент пишет на сайте, менеджер получает обращение в админке и отвечает. Ответ появится прямо в этом окне чата.
                </InfoCard>

                <ContactCard label="Telegram" value="@netizen_store" />
                <ContactCard label="Телефон" value="8 (800) 123-45-67" />
                <ContactCard label="E-mail" value="info@netizen.store" />

                <InfoCard title="Что лучше указать">
                  <ul className="space-y-2">
                    {activeTopic.hints.map((hint) => (
                      <li key={hint}>• {hint}</li>
                    ))}
                  </ul>
                </InfoCard>

                <Link
                  href="/faq"
                  className="block rounded-2xl border border-theme px-5 py-3 text-center text-sm font-medium transition-colors hover:border-blue-500/40 hover:bg-blue-soft"
                >
                  Открыть FAQ
                </Link>

                <Link
                  href="/cart"
                  className="block rounded-2xl bg-blue-600 px-5 py-3 text-center text-sm font-medium text-white transition-colors hover:bg-blue-500"
                >
                  Перейти в корзину
                </Link>
              </aside>
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}

function ContactCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-theme p-4">
      <div className="text-sm text-muted">{label}</div>
      <div className="mt-1 font-semibold">{value}</div>
    </div>
  );
}

function InfoCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-3xl border border-theme p-5">
      <h3 className="text-xl font-bold tracking-[-0.035em]">{title}</h3>
      <div className="mt-3 text-sm leading-relaxed text-muted">{children}</div>
    </div>
  );
}
