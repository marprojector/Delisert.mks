import { OPERATIONAL_ADDRESS, SOCIAL_MEDIA, waLink } from "@delisert.mks-1/api/data/business";
import { SectionHeading } from "@delisert.mks-1/ui/components/section-heading";
import { SocialLinks } from "@delisert.mks-1/ui/components/social-links";
import { WhatsAppButton } from "@delisert.mks-1/ui/components/whatsapp-button";
import { createFileRoute } from "@tanstack/react-router";
import { Clock, Home, Package } from "lucide-react";

import { canonical } from "@/utils/seo";

export const Route = createFileRoute("/tentang")({
  head: () => ({
    meta: [
      { title: "Tentang Delisert — Dessert & Mochi Makassar Sejak 2021" },
      {
        name: "description",
        content:
          "Kenali Delisert: dessert dan makanan homemade Makassar yang berdiri sejak 2021. Mochi sebagai produk anchor, plus lini dessert artisanal lainnya.",
      },
      { property: "og:title", content: "Tentang Delisert — Dessert & Mochi Makassar Sejak 2021" },
      { property: "og:type", content: "website" },
      { property: "og:url", content: canonical("/tentang") },
    ],
    links: [{ rel: "canonical", href: canonical("/tentang") }],
  }),
  component: AboutComponent,
});

function AboutComponent() {
  return (
    <div className="flex flex-col">
      <section className="border-b border-border bg-secondary/40">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
          <SectionHeading
            eyebrow="Tentang Delisert"
            title="Dapur kecil di Makassar yang memulai dari satu mangkuk mochi."
            description="Delisert berdiri pada 2021 dan tumbuh dari aktivitas Car Free Day di Jalan Boulevard, Makassar."
          />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
          <div className="flex flex-col gap-6 text-base/relaxed text-muted-foreground">
            <h2 className="text-2xl leading-snug text-foreground">Latar belakang</h2>
            <p>
              Delisert dimulai pada 2021 di Makassar dengan satu produk andalan: mochi buatan
              sendiri. Produk itu dijual sepanjang Jalan Boulevard saat aktivitas Car Free Day, dan
              respons yang datang membuat lini produk berkembang.
            </p>
            <p>
              Sejak itu dapur kami menambah pancake durian, mango sticky rice, mille crepes, Dubai
              chewy cookie, dan slice cake. Semua tetap dibuat dalam batch terbatas agar kualitas
              terjaga.
            </p>

            <h2 className="pt-4 text-2xl leading-snug text-foreground">Identitas produk</h2>
            <p>
              Mochi tetap menjadi produk anchor Delisert. Tersedia dalam delapan varian rasa dengan
              tiga ukuran porsi — 1 pcs, isi 4, dan isi 8. Sisanya adalah lini dessert artisanal yang
              dibuat dengan bahan yang sama hati-hatinya.
            </p>

            <h2 className="pt-4 text-2xl leading-snug text-foreground">Cara kerja kami</h2>
            <ul className="flex flex-col gap-5">
              <li className="flex gap-4">
                <span className="flex size-10 shrink-0 items-center justify-center border border-border bg-background text-primary">
                  <Clock className="size-5" aria-hidden="true" />
                </span>
                <span>
                  <strong className="font-medium text-foreground">Batch harian terbatas.</strong>{" "}
                  Produk dibuat segar setiap hari. Ketersediaan dipastikan ulang melalui WhatsApp
                  sebelum pesanan diproses.
                </span>
              </li>
              <li className="flex gap-4">
                <span className="flex size-10 shrink-0 items-center justify-center border border-border bg-background text-primary">
                  <Package className="size-5" aria-hidden="true" />
                </span>
                <span>
                  <strong className="font-medium text-foreground">Pesan, lalu diambil atau dikirim.</strong>{" "}
                  Pemesanan melalui WhatsApp. Pesanan dapat diambil di dapur operasional atau dikirim
                  melalui layanan pengiriman yang tersedia.
                </span>
              </li>
              <li className="flex gap-4">
                <span className="flex size-10 shrink-0 items-center justify-center border border-border bg-background text-primary">
                  <Home className="size-5" aria-hidden="true" />
                </span>
                <span>
                  <strong className="font-medium text-foreground">Hadir setiap Minggu di CFD.</strong>{" "}
                  Aktivitas Car Free Day tetap menjadi bagian dari rutinitas kami, dengan titik
                  penjualan di CFD Boulevard dan CFD UNHAS.
                </span>
              </li>
            </ul>
          </div>

          <aside className="flex flex-col gap-6 border border-border bg-secondary/30 p-8">
            <h2 className="text-xl leading-snug">Kenali kami lebih jauh</h2>
            <p className="text-sm/relaxed text-muted-foreground">
              Update batch harian, menu musiman, dan pengumuman jadwal diumumkan lebih dulu di media
              sosial Delisert.
            </p>
            <SocialLinks items={SOCIAL_MEDIA} />
            <hr className="border-border" />
            <h2 className="text-xl leading-snug">Ada pertanyaan?</h2>
            <p className="text-sm/relaxed text-muted-foreground">
              Tim Delisert membalas pesan WhatsApp pada jam operasional. Sertakan nama produk yang
              ingin ditanyakan agar kami bisa membantu lebih cepat.
            </p>
            <WhatsAppButton href={waLink("Halo Delisert, saya ingin bertanya.")} fullWidth>
              Chat via WhatsApp
            </WhatsAppButton>
            <p className="text-xs/relaxed text-muted-foreground">
              {OPERATIONAL_ADDRESS.note}
            </p>
          </aside>
        </div>
      </section>
    </div>
  );
}
