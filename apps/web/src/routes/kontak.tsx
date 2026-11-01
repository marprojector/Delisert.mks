import {
  DELIVERY_METHODS,
  OPERATIONAL_ADDRESS,
  OPERATIONAL_ADDRESS_MAPS_URL,
  PICKUP_INSTRUCTION,
  SOCIAL_MEDIA,
  WHATSAPP_DISPLAY,
  waLink,
} from "@delisert.mks-1/api/data/business";
import { SectionHeading } from "@delisert.mks-1/ui/components/section-heading";
import { SocialLinks } from "@delisert.mks-1/ui/components/social-links";
import { WhatsAppButton } from "@delisert.mks-1/ui/components/whatsapp-button";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Bike, Home, MessageCircle, PackageCheck } from "lucide-react";

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

function ContactComponent() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
      <SectionHeading
        eyebrow="Kontak & Pesan"
        title="Pesan, konfirmasi, lalu kami siapkan."
        description="Semua pemesanan Delisert berjalan melalui WhatsApp. Tidak ada pembayaran daring di website ini."
      />

      <div className="flex flex-col gap-6 pt-12">
        <section className="flex flex-col gap-5 border border-primary/25 bg-primary/5 p-8">
          <div className="flex items-center gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center border border-border bg-background text-primary">
              <MessageCircle className="size-5" aria-hidden="true" />
            </span>
            <h2 className="text-2xl leading-snug">WhatsApp</h2>
          </div>
          <p className="text-sm/relaxed text-muted-foreground">
            Nomor WhatsApp bisnis Delisert:{" "}
            <strong className="font-medium text-foreground">{WHATSAPP_DISPLAY}</strong>. Klik tombol
            di bawah untuk membuka percakapan langsung.
          </p>
          <WhatsAppButton
            size="lg"
            href={waLink("Halo Delisert, saya ingin memesan.")}
            className="w-fit"
          >
            Chat via WhatsApp
          </WhatsAppButton>
          <p className="text-xs/relaxed text-muted-foreground">
            Mohon tidak membagikan nomor WhatsApp Anda secara publik di kolom komentar atau media
            sosial. Cukup kirim pesan langsung melalui tautan ini.
          </p>
        </section>

        <section className="flex flex-col gap-5 border border-border p-8">
          <h2 className="text-2xl leading-snug">Media sosial</h2>
          <p className="text-sm/relaxed text-muted-foreground">
            Update batch harian, menu musiman, dan pengumuman jadwal diumumkan lebih dulu di media
            sosial.
          </p>
          <SocialLinks items={SOCIAL_MEDIA} />
        </section>

        <section className="flex flex-col gap-5 border border-border p-8">
          <div className="flex items-center gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center border border-border bg-background text-primary">
              <Bike className="size-5" aria-hidden="true" />
            </span>
            <h2 className="text-2xl leading-snug">Informasi pengiriman</h2>
          </div>
          <p className="text-sm/relaxed text-muted-foreground">
            Delisert mengirim pesanan melalui layanan pengiriman berikut. Ketersediaan layanan
            bergantung pada lokasi tujuan dan dikonfirmasi saat pemesanan.
          </p>
          <ul className="grid gap-3 sm:grid-cols-2">
            {DELIVERY_METHODS.map((method) => (
              <li
                key={method.id}
                className="flex flex-col gap-1 border border-border bg-secondary/30 p-4"
              >
                <span className="text-sm font-medium">{method.name}</span>
                <span className="text-xs/relaxed text-muted-foreground">{method.note}</span>
              </li>
            ))}
          </ul>
          <p className="text-xs/relaxed text-muted-foreground">
            Tarif, cakupan area, dan estimasi waktu pengiriman tidak dipublikasikan di website ini
            karena bervariasi per pesanan. Detailnya dikonfirmasi langsung melalui WhatsApp.
          </p>
        </section>

        <section className="flex flex-col gap-5 border border-border p-8">
          <div className="flex items-center gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center border border-border bg-background text-primary">
              <PackageCheck className="size-5" aria-hidden="true" />
            </span>
            <h2 className="text-2xl leading-snug">Instruksi pengambilan</h2>
          </div>
          <p className="text-sm/relaxed text-muted-foreground">{PICKUP_INSTRUCTION}</p>
        </section>

        <section className="flex flex-col gap-5 border border-border p-8">
          <div className="flex items-center gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center border border-border bg-background text-primary">
              <Home className="size-5" aria-hidden="true" />
            </span>
            <h2 className="text-2xl leading-snug">Alamat operasional</h2>
          </div>
          <address className="text-base/relaxed text-foreground not-italic">
            {OPERATIONAL_ADDRESS.name}
            <br />
            {OPERATIONAL_ADDRESS.complex},
            <br />
            {OPERATIONAL_ADDRESS.street},
            <br />
            {OPERATIONAL_ADDRESS.rtRw}, {OPERATIONAL_ADDRESS.village},{" "}
            {OPERATIONAL_ADDRESS.district},
            <br />
            {OPERATIONAL_ADDRESS.city}, {OPERATIONAL_ADDRESS.province},{" "}
            {OPERATIONAL_ADDRESS.country}.
          </address>
          <p className="text-sm/relaxed text-muted-foreground">
            {OPERATIONAL_ADDRESS.note} Atur waktu pengambilan terlebih dahulu melalui WhatsApp.
          </p>
          <a
            href={OPERATIONAL_ADDRESS_MAPS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="w-fit text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            Buka di Google Maps →
          </a>
          <Link
            to="/jadwal"
            className="text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            Lihat jadwal & lokasi lengkap →
          </Link>
        </section>
      </div>
    </div>
  );
}
