import {
  DELIVERY_METHODS,
  PICKUP_INSTRUCTION,
  SOCIAL_MEDIA,
  WHATSAPP_DISPLAY,
  waLink,
} from "@delisert.mks-1/api/data/business";
import { SocialLinks } from "@delisert.mks-1/ui/components/social-links";
import { createFileRoute } from "@tanstack/react-router";
import { useRef } from "react";

import { useReveal } from "@/lib/motion";
import { canonical } from "@/utils/seo";

export const Route = createFileRoute("/kontak")({
  head: () => ({
    meta: [
      { title: "Kontak & Pesan Delisert — WhatsApp, Instagram, TikTok Makassar" },
      {
        name: "description",
        content:
          "Hubungi Delisert Makassar via WhatsApp 0851 9002 1421. Informasi pengiriman Gojek, GrabExpress, Maxim, Shopee, instruksi pengambilan, dan alamat operasional.",
      },
      { property: "og:title", content: "Kontak & Pesan Delisert — Makassar" },
      { property: "og:type", content: "website" },
      { property: "og:url", content: canonical("/kontak") },
    ],
    links: [{ rel: "canonical", href: canonical("/kontak") }],
  }),
  component: ContactComponent,
});

const STEPS = [
  "Pilih produk dan ukuran di Menu",
  "Tekan \"Pesan via WhatsApp\" — pesan sudah terisi",
  "Konfirmasi stok, harga, dan pengiriman",
] as const;

function ContactComponent() {
  const pageRef = useRef<HTMLDivElement>(null);
  useReveal(pageRef);

  return (
    <div
      ref={pageRef}
      className="cn-shell grid gap-8 pt-4 pb-16 lg:grid-cols-[560fr_576fr] lg:gap-16 lg:pt-16 lg:pb-24"
    >
      <div className="flex flex-col gap-2 lg:col-start-1 lg:gap-3">
        <h1 className="text-4xl leading-tight font-semibold text-foreground lg:text-[4rem]">Kontak & Pesan</h1>
        <p className="text-sm/relaxed text-muted-foreground lg:text-lg">
          Semua pesanan lewat WhatsApp. Tidak perlu daftar akun.
        </p>
      </div>

      <aside className="flex flex-col gap-4 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:gap-5">
        <section
          data-reveal
          className="flex flex-col gap-3.5 rounded-3xl bg-foreground p-5.5 text-background lg:gap-4.5 lg:rounded-[2rem] lg:p-10"
        >
          <span className="flex items-center gap-2.5 cn-eyebrow text-accent">
            <span aria-hidden="true" className="size-2.5 rounded-full bg-[#25d366]" />
            WhatsApp
          </span>
          <p className="cn-font-display text-[1.75rem] font-semibold lg:text-[2.75rem]">{WHATSAPP_DISPLAY}</p>
          <p className="text-sm/relaxed text-background/75 lg:text-base/relaxed">
            Sertakan nama produk dan ukuran supaya kami bisa membalas lebih cepat.
          </p>
          <a
            href={waLink("Halo Delisert, saya ingin memesan.")}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-[3.125rem] items-center justify-center rounded-full bg-primary text-[0.9375rem] font-semibold text-primary-foreground transition-transform active:scale-[0.97] lg:h-[3.625rem] lg:text-base"
          >
            Chat sekarang
          </a>
        </section>
        <SocialLinks items={SOCIAL_MEDIA} />
      </aside>

      <div className="flex flex-col gap-8 lg:col-start-1 lg:gap-7">
        <section data-reveal className="flex flex-col gap-3 lg:gap-4">
          <h2 className="text-[1.375rem] font-semibold text-foreground lg:text-2xl">Cara pesan</h2>
          <ol className="flex flex-col gap-3">
            {STEPS.map((step, index) => (
              <li key={step} className="flex items-center gap-3 lg:gap-3.5">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary text-[0.8125rem] font-bold text-primary lg:size-10 lg:text-[0.9375rem]">
                  {index + 1}
                </span>
                <span className="text-sm text-foreground lg:text-base">{step}</span>
              </li>
            ))}
          </ol>
        </section>

        <section data-reveal className="flex flex-col gap-2 rounded-[1.25rem] bg-secondary p-4.5 lg:rounded-3xl lg:p-6">
          <h2 className="font-sans text-[0.9375rem] font-semibold text-foreground lg:text-base">
            Saat mengambil pesanan
          </h2>
          <p className="text-[0.8125rem]/relaxed text-muted-foreground lg:text-[0.9375rem]/relaxed">
            {PICKUP_INSTRUCTION}
          </p>
        </section>

        <section data-reveal className="flex flex-col gap-2.5 lg:gap-3">
          <h2 className="text-[1.375rem] font-semibold text-foreground lg:text-2xl">Pengiriman</h2>
          <ul className="flex flex-wrap gap-2 lg:gap-2.5">
            {DELIVERY_METHODS.map((method) => (
              <li
                key={method.id}
                className="rounded-[0.875rem] border border-border px-3.5 py-2.5 text-[0.8125rem] font-medium text-foreground lg:px-4 lg:text-sm"
              >
                {method.name}
              </li>
            ))}
          </ul>
          <p className="text-xs text-muted-foreground lg:text-[0.8125rem]">
            Ketersediaan dan ongkir dikonfirmasi saat memesan.
          </p>
        </section>
      </div>
    </div>
  );
}
