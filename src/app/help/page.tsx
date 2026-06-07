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
 <main className="min-h-screen bg-page px-2 py-2.5 text-main transition-colors duration-700 sm:px-4 sm:py-5 lg:px-5 lg:py-6">
 <div className="mx-auto max-w-[1440px]">
 <SiteHeader />

 <section className="mt-3 sm:mt-6 lg:mt-10">
 <nav aria-label="Хлебные крошки" className="hidden flex-wrap items-center gap-2 text-xs text-muted sm:flex sm:text-sm">
 <Link href="/" className="transition-colors hover:text-blue-500">Главная</Link>
 <span className="text-muted-soft">›</span>
 <span className="font-medium text-main">Поддержка</span>
 </nav>

 <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-blue-500 sm:hidden">Связь с магазином</div>
 <h1 className="mt-1 max-w-[940px] text-[26px] font-bold leading-[1.05] tracking-[-0.05em] sm:mt-5 sm:text-4xl md:text-5xl">
 Напишите нам — поможем разобраться
 </h1>
 <p className="mt-2 max-w-[720px] text-xs leading-relaxed text-muted sm:mt-3 sm:text-sm">
 Выберите тему обращения и напишите вопрос. Ответ менеджера появится прямо в этом чате.
 </p>
 </section>

 <div className="mt-4 border-t border-theme sm:mt-6" />

 <section className="mt-3 grid gap-3 sm:mt-5 lg:grid-cols-[320px_minmax(0,1fr)] lg:gap-8">
 <aside className="-mx-2 flex snap-x snap-mandatory gap-2 overflow-x-auto px-2 pb-2 sm:-mx-4 sm:gap-3 sm:px-4 lg:mx-0 lg:grid lg:self-start lg:overflow-visible lg:px-0 lg:pb-0">
 {supportTopics.map((topic) => {
 const isActive = topic.id === activeTopic.id;
 const hasStartedChat = Boolean(requestsByTopic[topic.id]);

 return (
 <button
 key={topic.id}
 type="button"
 onClick={() => selectTopic(topic.id)}
 className={`relative flex min-w-[108px] snap-start flex-col items-center rounded-2xl border px-2 py-3 text-center transition-colors sm:min-w-[124px] sm:px-3 sm:py-4 lg:min-w-0 lg:flex-row lg:items-start lg:gap-4 lg:rounded-[24px] lg:p-5 lg:text-left ${isActive ? "border-blue-500/60 bg-blue-soft" : "card"}`}
 >
 <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-base font-bold sm:h-14 sm:w-14 sm:text-lg lg:h-11 lg:w-11 ${isActive ? "bg-blue-600 text-white" : "bg-blue-500/10 text-blue-500"}`}>
 {topic.icon}
 </span>

 <span className="min-w-0 lg:flex-1">
 <span className="hidden items-center justify-between gap-3 lg:flex">
 <span className="text-xs font-medium uppercase tracking-[0.22em] text-blue-500">{topic.eyebrow}</span>
 {hasStartedChat ? <span className="rounded-full bg-red-500 px-2 py-0.5 text-[11px] font-bold text-white">чат</span> : null}
 </span>
 <span className="mt-2 block line-clamp-2 text-xs font-bold leading-tight sm:text-sm lg:mt-2 lg:text-xl">{topic.title}</span>
 <span className="mt-3 hidden text-sm leading-relaxed text-muted lg:block">{topic.text}</span>
 </span>

 {hasStartedChat ? <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-red-500 lg:hidden" /> : null}
 {isActive ? <span className="absolute bottom-0 left-1/2 h-1 w-8 -translate-x-1/2 rounded-full bg-blue-600 lg:hidden" /> : null}
 </button>
 );
 })}
 </aside>

 <section className="card overflow-hidden rounded-[20px] sm:rounded-[26px] lg:rounded-[32px]">
 <div className="flex items-start justify-between gap-3 border-b border-theme p-3.5 sm:p-5 lg:p-7">
 <div className="min-w-0">
 <div className="text-[9px] font-medium uppercase tracking-[0.16em] text-blue-500 sm:text-[10px] lg:text-xs lg:tracking-[0.22em]">Чат поддержки</div>
 <h2 className="mt-1 truncate text-xl font-bold tracking-[-0.04em] sm:text-2xl lg:mt-2 lg:text-3xl">{activeTopic.title}</h2>
 {activeRequest ? <p className="mt-1 text-[10px] text-muted sm:text-xs lg:text-sm">Обращение {activeRequest.number} · {statusLabels[activeRequest.status] ?? activeRequest.status}</p> : null}
 </div>
 <span className="shrink-0 rounded-full border border-blue-500/35 bg-blue-500/10 px-2.5 py-1 text-[10px] font-medium text-blue-500 sm:text-xs lg:px-4 lg:py-2 lg:text-sm">{activeTopic.badge}</span>
 </div>

 <div className="grid lg:grid-cols-[minmax(0,1fr)_280px]">
 <div className="flex min-h-[390px] flex-col sm:min-h-[480px] lg:min-h-[640px]">
 <div className="flex-1 space-y-2 overflow-y-auto p-3 sm:space-y-3 sm:p-5 lg:space-y-4 lg:p-8">
 <div className="max-w-[720px] rounded-[16px] bg-blue-soft px-3 py-2.5 text-xs font-medium leading-relaxed text-main sm:px-4 sm:py-3 sm:text-sm lg:rounded-[24px] lg:px-5 lg:py-4">{activeTopic.intro}</div>

 {messages.map((chatMessage) => (
 <div key={chatMessage.id} className={`flex ${chatMessage.role === "CLIENT" ? "justify-end" : "justify-start"}`}>
 <div className={`max-w-[88%] rounded-[18px] px-3.5 py-2.5 text-xs leading-relaxed sm:max-w-[78%] sm:px-4 sm:py-3 sm:text-sm lg:max-w-[720px] lg:rounded-[24px] lg:px-5 lg:py-4 ${chatMessage.role === "CLIENT" ? "bg-blue-600 text-white" : "bg-blue-soft text-main"}`}>
 <div className="mb-1 text-[10px] opacity-70 sm:text-xs">{chatMessage.name}</div>
 {chatMessage.text}
 </div>
 </div>
 ))}
 </div>

 <div className="border-t border-theme p-3 sm:p-4 lg:p-6">
 <div className="-mx-1 mb-2 flex gap-1.5 overflow-x-auto px-1 pb-1 sm:mb-3 sm:gap-2">
 {activeTopic.quickMessages.map((quickMessage) => (
 <button key={quickMessage} type="button" onClick={() => setMessage(quickMessage)} className="shrink-0 rounded-full border border-theme bg-transparent px-3 py-1.5 text-[10px] text-muted transition-colors hover:border-blue-500/40 hover:bg-blue-soft hover:text-main sm:text-xs lg:px-4 lg:py-2 lg:text-sm">{quickMessage}</button>
 ))}
 </div>

 {!activeRequest ? (
 <div className="mb-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
 <input value={customerName} onChange={(event) => setCustomerName(event.target.value)} placeholder="Ваше имя" className="min-h-10 rounded-xl border border-theme bg-transparent px-3 text-xs outline-none placeholder:text-muted-soft focus:border-blue-500/50 sm:rounded-2xl sm:text-sm" />
 <input value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="Телефон" className="min-h-10 rounded-xl border border-theme bg-transparent px-3 text-xs outline-none placeholder:text-muted-soft focus:border-blue-500/50 sm:rounded-2xl sm:text-sm" />
 <input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="E-mail" className="min-h-10 rounded-xl border border-theme bg-transparent px-3 text-xs outline-none placeholder:text-muted-soft focus:border-blue-500/50 sm:col-span-2 sm:rounded-2xl sm:text-sm lg:col-span-1" />
 </div>
 ) : null}

 <form onSubmit={sendMessage} className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
 <input value={message} onChange={(event) => setMessage(event.target.value)} placeholder={activeTopic.placeholder} className="min-h-11 min-w-0 rounded-xl border border-theme bg-transparent px-3 text-xs outline-none placeholder:text-muted-soft focus:border-blue-500/50 sm:rounded-2xl sm:px-4 sm:text-sm" />
 <button type="submit" disabled={!message.trim() || isSending} className="min-h-11 rounded-xl bg-blue-600 px-5 text-xs font-medium text-white transition-colors hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-45 sm:rounded-2xl sm:px-7 sm:text-sm">{isSending ? "Отправляем..." : "Отправить"}</button>
 </form>

 {error ? <p className="mt-2 text-xs text-red-500">{error}</p> : null}
 </div>
 </div>

 {/* Compact contacts for phones and mini-tablets */}
 <details className="border-t border-theme lg:hidden">
 <summary className="cursor-pointer list-none px-4 py-3 text-sm font-semibold text-blue-500 sm:px-5 sm:py-4">Контакты и подсказки</summary>
 <div className="grid gap-2 border-t border-theme p-3 sm:grid-cols-2 sm:p-5">
 <ContactCard label="Telegram" value="@netizen_store" />
 <ContactCard label="Телефон" value="8 (800) 123-45-67" />
 <ContactCard label="E-mail" value="info@netizen.store" />
 <InfoCard title="Что лучше указать"><ul className="space-y-1.5">{activeTopic.hints.map((hint) => <li key={hint}>• {hint}</li>)}</ul></InfoCard>
 <Link href="/faq" className="flex min-h-10 items-center justify-center rounded-xl border border-theme px-4 text-center text-xs font-medium transition-colors hover:border-blue-500/40 hover:bg-blue-soft sm:text-sm">Открыть FAQ</Link>
 <Link href="/cart" className="flex min-h-10 items-center justify-center rounded-xl bg-blue-600 px-4 text-center text-xs font-medium text-white transition-colors hover:bg-blue-500 sm:text-sm">Перейти в корзину</Link>
 </div>
 </details>

 <aside className="hidden space-y-4 border-l border-theme p-6 lg:block">
 <InfoCard title="Менеджер ответит здесь">Клиент пишет на сайте, менеджер получает обращение в админке и отвечает. Ответ появится прямо в этом окне чата.</InfoCard>
 <ContactCard label="Telegram" value="@netizen_store" />
 <ContactCard label="Телефон" value="8 (800) 123-45-67" />
 <ContactCard label="E-mail" value="info@netizen.store" />
 <InfoCard title="Что лучше указать"><ul className="space-y-2">{activeTopic.hints.map((hint) => <li key={hint}>• {hint}</li>)}</ul></InfoCard>
 <Link href="/faq" className="block rounded-2xl border border-theme px-5 py-3 text-center text-sm font-medium transition-colors hover:border-blue-500/40 hover:bg-blue-soft">Открыть FAQ</Link>
 <Link href="/cart" className="block rounded-2xl bg-blue-600 px-5 py-3 text-center text-sm font-medium text-white transition-colors hover:bg-blue-500">Перейти в корзину</Link>
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
 <div className="rounded-2xl border border-theme p-2.5 sm:p-4">
 <div className="text-xs text-muted sm:text-sm">{label}</div>
 <div className="mt-0.5 text-sm font-semibold sm:mt-1 sm:text-base">{value}</div>
 </div>
 );
}

function InfoCard({ title, children }: { title: string; children: React.ReactNode }) {
 return (
 <div className="rounded-2xl border border-theme p-3 sm:rounded-3xl sm:p-5">
 <h3 className="text-base font-bold tracking-[-0.035em] sm:text-xl">{title}</h3>
 <div className="mt-1.5 text-xs leading-relaxed text-muted sm:mt-3 sm:text-sm">{children}</div>
 </div>
 );
}
