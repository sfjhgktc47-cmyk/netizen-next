"use client";

import { useState } from "react";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";

type Topic = {
  id: string;
  eyebrow: string;
  title: string;
  text: string;
  icon: string;
  badge: string;
  intro: string;
  placeholder: string;
  quickMessages: string[];
  hints: string[];
};

type ChatMessage = {
  id: number;
  role: "client" | "manager";
  text: string;
};

const topics: Topic[] = [
  {
    id: "selection",
    eyebrow: "Выбор модели",
    title: "Подбор техники",
    text: "Поможем выбрать устройство под задачи, бюджет и сценарий использования.",
    icon: "✦",
    badge: "Выбор модели",
    intro:
      "Здравствуйте! Напишите ваш вопрос в свободной форме. Чтобы мы быстрее помогли, укажите: что хотите купить или с какой проблемой столкнулись, город, желаемую модель/конфигурацию и телефон для связи.",
    placeholder: "Например: нужен iPhone для фото до 120 000 ₽",
    quickMessages: [
      "Нужен телефон для фото",
      "Нужен ноутбук для работы",
      "Помогите выбрать подарок",
    ],
    hints: ["Для чего нужна техника", "Бюджет", "Желаемый бренд или модель", "Город получения"],
  },
  {
    id: "order",
    eyebrow: "Заявка / наличие",
    title: "Вопрос по заказу",
    text: "Уточним наличие, конфигурацию, доставку и итоговую стоимость.",
    icon: "№",
    badge: "Заказ",
    intro:
      "Напишите номер заявки, модель или конфигурацию, которую хотите уточнить. Менеджер проверит наличие, цену, доставку и ответит здесь.",
    placeholder: "Например: уточните наличие iPhone 17 Pro 256 GB Blue",
    quickMessages: ["Проверить наличие", "Уточнить итоговую цену", "Изменить доставку"],
    hints: ["Номер заявки, если есть", "Модель и память", "Цвет / SIM", "Город или способ получения"],
  },
  {
    id: "problem",
    eyebrow: "После покупки",
    title: "Брак / проблема",
    text: "Разберём проблему с товаром и подскажем дальнейшие действия.",
    icon: "!",
    badge: "Проблема",
    intro:
      "Опишите, что произошло с товаром после покупки. Чтобы менеджер быстрее разобрался, укажите номер заявки, модель, дату получения и коротко опишите ситуацию.",
    placeholder: "Например: после покупки не включается устройство",
    quickMessages: ["Товар не включается", "Есть внешний дефект", "Нужна консультация после покупки"],
    hints: ["Номер заявки", "Модель товара", "Дата получения", "Описание проблемы"],
  },
  {
    id: "warranty",
    eyebrow: "Сервис",
    title: "Гарантия",
    text: "Подскажем условия гарантии и что подготовить для обращения.",
    icon: "✓",
    badge: "Сервис",
    intro:
      "Напишите, какой товар купили и какой вопрос по гарантии возник. Менеджер подскажет условия, документы и следующие шаги.",
    placeholder: "Например: хочу уточнить гарантию по MacBook Pro",
    quickMessages: ["Какая гарантия?", "Какие документы нужны?", "Как обратиться по гарантии?"],
    hints: ["Модель", "Дата покупки", "Номер заявки", "Суть вопроса"],
  },
  {
    id: "delivery",
    eyebrow: "Курьер / ПВЗ",
    title: "Доставка",
    text: "Поможем уточнить адрес, сроки доставки и удобный способ получения.",
    icon: "→",
    badge: "Доставка",
    intro:
      "Напишите город, удобный способ получения и адрес, если нужна курьерская доставка. Если выбираете ПВЗ — укажите, что хотите забрать самовывозом.",
    placeholder: "Например: хочу оформить курьерскую доставку в Москве",
    quickMessages: ["Нужен курьер", "Хочу забрать в ПВЗ", "Уточнить сроки доставки"],
    hints: ["Город", "Курьер или ПВЗ", "Адрес для курьера", "Удобное время"],
  },
];

export default function HelpPage() {
  const [activeTopicId, setActiveTopicId] = useState(topics[0].id);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const activeTopic = topics.find((topic) => topic.id === activeTopicId) ?? topics[0];

  function selectTopic(topicId: string) {
    setActiveTopicId(topicId);
    setMessage("");
    setMessages([]);
  }

  function sendMessage(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedMessage = message.trim();

    if (!trimmedMessage) {
      return;
    }

    const nextId = Date.now();

    setMessages((currentMessages) => [
      ...currentMessages,
      {
        id: nextId,
        role: "client",
        text: trimmedMessage,
      },
      {
        id: nextId + 1,
        role: "manager",
        text:
          "Спасибо, обращение попадёт менеджеру в CRM и Telegram. После подключения интеграции ответ появится прямо в этом чате.",
      },
    ]);
    setMessage("");
  }

  return (
    <main className="min-h-screen bg-page px-4 py-4 text-main transition-colors duration-700 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1760px]">
        <SiteHeader />

        <section className="mt-10">
          <Link
            href="/"
            className="text-sm text-blue-500 transition-colors hover:text-blue-400"
          >
            ← На главную
          </Link>

          <div className="mt-5 flex">
            <span className="w-fit rounded-full border border-blue-500/35 bg-blue-500/10 px-4 py-2 text-sm font-medium text-blue-500">
              Поддержка Netizen
            </span>
          </div>

          <h1 className="mt-5 max-w-[940px] text-3xl font-bold tracking-[-0.055em] sm:text-4xl md:text-5xl">
            Напишите нам — поможем разобраться
          </h1>

          <p className="mt-3 max-w-[720px] text-sm leading-relaxed text-muted">
            Выберите тему обращения или сразу напишите вопрос. Менеджер поможет с
            подбором, заказом, доставкой, гарантией или проблемой после покупки.
          </p>
        </section>

        <div className="mt-6 border-t border-theme" />

        <section className="mt-6 grid gap-5 lg:grid-cols-[300px_minmax(0,1fr)] xl:grid-cols-[320px_minmax(0,1fr)] xl:gap-8">
          <aside className="grid gap-4 self-start">
            {topics.map((topic) => {
              const isActive = topic.id === activeTopic.id;

              return (
                <button
                  key={topic.id}
                  type="button"
                  onClick={() => selectTopic(topic.id)}
                  className={`min-w-[280px] flex gap-4 rounded-[24px] border p-4 text-left transition-all hover:-translate-y-0.5 hover:border-blue-500/45 sm:p-5 lg:min-w-0 lg:rounded-[26px] ${
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

                  <span>
                    <span className="text-xs font-medium uppercase tracking-[0.22em] text-blue-500">
                      {topic.eyebrow}
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
              </div>

              <span className="w-fit rounded-full border border-blue-500/35 bg-blue-500/10 px-4 py-2 text-sm font-medium text-blue-500">
                {activeTopic.badge}
              </span>
            </div>

            <div className="grid lg:grid-cols-[minmax(0,1fr)_280px]">
              <div className="flex min-h-[520px] flex-col lg:min-h-[640px]">
                <div className="flex-1 space-y-4 p-6 md:p-8">
                  <div className="max-w-[720px] rounded-[24px] bg-blue-soft px-5 py-4 text-sm font-medium leading-relaxed text-main">
                    {activeTopic.intro}
                  </div>

                  {messages.map((chatMessage) => (
                    <div
                      key={chatMessage.id}
                      className={`flex ${chatMessage.role === "client" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[720px] rounded-[24px] px-5 py-4 text-sm leading-relaxed ${
                          chatMessage.role === "client"
                            ? "bg-blue-600 text-white"
                            : "bg-blue-soft text-main"
                        }`}
                      >
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

                  <form onSubmit={sendMessage} className="flex flex-col gap-3 sm:flex-row">
                    <input
                      value={message}
                      onChange={(event) => setMessage(event.target.value)}
                      placeholder={activeTopic.placeholder}
                      className="min-h-12 flex-1 rounded-2xl border border-theme bg-transparent px-5 text-sm outline-none placeholder:text-muted-soft focus:border-blue-500/50"
                    />

                    <button
                      type="submit"
                      disabled={!message.trim()}
                      className="rounded-2xl bg-blue-600 px-7 py-4 text-sm font-medium text-white transition-colors hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-45"
                    >
                      Отправить
                    </button>
                  </form>

                  <p className="mt-3 text-xs leading-relaxed text-muted-soft">
                    Сейчас это чат-макет. Позже отправку можно подключить к Telegram-боту,
                    чат-сервису или CRM, а ответ менеджера показывать прямо здесь.
                  </p>
                </div>
              </div>

              <aside className="space-y-4 border-t border-theme p-6 lg:border-l lg:border-t-0">
                <InfoCard title="Менеджер ответит здесь">
                  Клиент пишет на сайте, менеджер получает обращение и отвечает. Ответ
                  появится прямо в этом окне чата.
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

        <section className="mt-9 grid gap-5 md:grid-cols-3">
          <BottomCard
            title="Подбор без давления"
            text="Поможем выбрать модель под задачи и бюджет без навязывания лишнего."
          />
          <BottomCard
            title="Вопросы по заказу"
            text="Уточним наличие, конфигурацию, доставку и итоговую стоимость."
          />
          <BottomCard
            title="Помощь после покупки"
            text="Если возник вопрос по товару, подскажем дальнейшие действия."
          />
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

function BottomCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="card rounded-[26px] p-6">
      <h3 className="text-2xl font-bold tracking-[-0.04em]">{title}</h3>
      <p className="mt-3 text-sm leading-relaxed text-muted">{text}</p>
    </div>
  );
}
