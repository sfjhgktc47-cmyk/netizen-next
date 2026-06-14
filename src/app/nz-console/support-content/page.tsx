import Link from "next/link";

import { SupportContentAdminClient } from "@/components/admin/support-content-admin-client";

export const dynamic = "force-dynamic";

export default function SupportContentAdminPage() {
  return (
    <main className="min-h-screen bg-[#020814] px-4 py-4 text-white sm:px-6 sm:py-6">
      <div className="mx-auto max-w-[1450px]">
        <header className="flex min-h-[76px] items-center justify-between rounded-2xl border border-white/10 bg-white/[0.035] px-5">
          <Link href="/nz-console" className="text-xl font-bold">
            Netizen Console
          </Link>
          <Link
            href="/"
            className="rounded-xl border border-white/10 px-4 py-3 text-sm hover:border-blue-500/40"
          >
            Открыть сайт
          </Link>
        </header>

        <section className="mt-8">
          <h1 className="text-4xl font-bold tracking-[-0.05em] sm:text-5xl">
            Сервис и поддержка
          </h1>
          <p className="mt-3 text-sm text-white/55">
            Настройка преимуществ и вопросов на главной странице.
          </p>
        </section>

        <section className="mt-8 pb-10">
          <SupportContentAdminClient />
        </section>
      </div>
    </main>
  );
}
