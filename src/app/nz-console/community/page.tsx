import Link from "next/link";

import { CommunityAdminClient } from "@/components/admin/community-admin-client";

export const dynamic = "force-dynamic";

export default function CommunityAdminPage() {
  return (
    <main className="min-h-screen bg-[#020814] px-4 py-4 text-white sm:px-6 sm:py-6">
      <div className="mx-auto max-w-[1450px]">
        <header className="flex min-h-[76px] flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.035] px-5">
          <Link href="/nz-console" className="text-xl font-bold">Netizen Console</Link>
          <div className="text-sm text-white/50">Модерация отзывов и ответы на вопросы</div>
          <Link href="/nz-console" className="rounded-xl border border-white/10 px-4 py-3 text-sm hover:border-blue-500/40">
            В админку
          </Link>
        </header>

        <section className="mt-8">
          <h1 className="text-4xl font-bold tracking-[-0.05em] sm:text-5xl">Отзывы и вопросы</h1>
          <p className="mt-3 max-w-[800px] text-sm leading-relaxed text-white/55">
            Отвечайте на вопросы покупателей, скрывайте нежелательный контент и проверяйте фотографии в отзывах.
          </p>
        </section>

        <section className="mt-8 pb-10">
          <CommunityAdminClient />
        </section>
      </div>
    </main>
  );
}
