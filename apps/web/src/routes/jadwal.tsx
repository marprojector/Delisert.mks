import {
  CFD,
  CFD_MAPS_URLS,
  CLOSED_DAY,
  OPERATIONAL_ADDRESS,
  OPERATIONAL_ADDRESS_MAPS_URL,
  SOCIAL_MEDIA,
  TIKTOK_LIVE,
} from "@delisert.mks-1/api/data/business";
import { ScheduleCard } from "@delisert.mks-1/ui/components/schedule-card";
import { SectionHeading } from "@delisert.mks-1/ui/components/section-heading";
import { SocialLinks } from "@delisert.mks-1/ui/components/social-links";
import { createFileRoute } from "@tanstack/react-router";
import { CalendarX2, Home, MapPin, Music2 } from "lucide-react";

import { canonical } from "@/utils/seo";

export const Route = createFileRoute("/jadwal")({
  head: () => ({
    meta: [
      { title: "Jadwal & Lokasi Delisert — TikTok Live, CFD Minggu, Makassar" },
      {
        name: "description",
        content:
          "Jadwal TikTok Live Delisert (Selasa–Sabtu, 10:30–14:30 WITA), titik penjualan CFD Minggu di Boulevard dan UNHAS, serta alamat operasional dapur di Makassar.",
      },
      { property: "og:title", content: "Jadwal & Lokasi Delisert — TikTok Live, CFD Minggu" },
      { property: "og:type", content: "website" },
      { property: "og:url", content: canonical("/jadwal") },
    ],
    links: [{ rel: "canonical", href: canonical("/jadwal") }],
  }),
  component: ScheduleComponent,
});

function ScheduleComponent() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
      <SectionHeading
        eyebrow="Jadwal & Lokasi"
        title="Kapan dan di mana Delisert hadir."
        description="Empat informasi yang berbeda, dipisahkan dengan jelas agar tidak tertukar."
        as="h1"
      />

      <div className="flex flex-col gap-6 pt-12">
        <ScheduleCard icon={Music2} title={TIKTOK_LIVE.label} tone="accent">
          <dl className="flex flex-col gap-3 text-sm">
            <div className="flex flex-wrap items-baseline gap-x-3">
              <dt className="cn-eyebrow w-24 shrink-0 text-muted-foreground">Hari</dt>
              <dd className="text-base font-medium">{TIKTOK_LIVE.days}</dd>
            </div>
            <div className="flex flex-wrap items-baseline gap-x-3">
              <dt className="cn-eyebrow w-24 shrink-0 text-muted-foreground">Jam</dt>
              <dd className="text-base font-medium">{TIKTOK_LIVE.hours}</dd>
            </div>
          </dl>
          <p className="text-sm/relaxed text-muted-foreground">
            Jadwal ini bersifat statis. Status live ditampilkan di aplikasi TikTok, bukan di website
            ini.
          </p>
          <a
            href={TIKTOK_LIVE.ctaUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-9 w-fit items-center border border-primary bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            {TIKTOK_LIVE.ctaLabel}
          </a>
        </ScheduleCard>

        <ScheduleCard icon={MapPin} title="Aktivitas CFD Minggu">
          <p className="text-sm/relaxed text-muted-foreground">{CFD.description}</p>
          <div className="flex flex-col gap-2">
            <span className="cn-eyebrow text-muted-foreground">
              Jam aktivitas: {CFD.hours}
            </span>
          </div>
          <ul className="flex flex-col gap-3">
            {CFD.locations.map((location) => (
              <li
                key={location.id}
                className="flex flex-col gap-1 border border-border bg-background p-4"
              >
                <span className="text-sm font-medium">{location.name}</span>
                <span className="text-sm/relaxed text-muted-foreground">{location.landmark}</span>
                <a
                  href={CFD_MAPS_URLS[location.id as keyof typeof CFD_MAPS_URLS]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-fit pt-1 text-sm font-medium text-primary underline-offset-4 hover:underline"
                >
                  Buka di Google Maps →
                </a>
              </li>
            ))}
          </ul>
          <p className="border-l-2 border-primary bg-primary/5 px-4 py-3 text-sm/relaxed text-foreground">
            {CFD.scheduleNote}
          </p>
        </ScheduleCard>

        <ScheduleCard icon={CalendarX2} title="Hari Libur" tone="muted">
          <p className="text-base font-medium">
            {CLOSED_DAY.day} — {CLOSED_DAY.description}
          </p>
          <p className="text-sm/relaxed text-muted-foreground">
            Pada hari Senin dapur tidak memproses pesanan dan tidak ada titik penjualan CFD.
          </p>
        </ScheduleCard>

        <ScheduleCard icon={Home} title="Alamat Operasional">
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
          <p className="border-l-2 border-primary bg-primary/5 px-4 py-3 text-sm/relaxed text-foreground">
            {OPERATIONAL_ADDRESS.note}
          </p>
          <a
            href={OPERATIONAL_ADDRESS_MAPS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="w-fit text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            Buka di Google Maps →
          </a>
          <p className="text-sm/relaxed text-muted-foreground">
            Jam buka untuk alamat ini tidak dipublikasikan karena bukan toko ritel. Untuk pengambilan
            pesanan, atur waktu terlebih dahulu melalui WhatsApp.
          </p>
        </ScheduleCard>
      </div>

      <section className="border-t border-border pt-12">
        <h2 className="text-2xl leading-snug">Pengumuman jadwal</h2>
        <p className="pt-3 text-sm/relaxed text-muted-foreground">
          Perubahan jadwal, batch baru, dan informasi titik penjualan diumumkan lebih dulu melalui
          media sosial Delisert.
        </p>
        <SocialLinks items={SOCIAL_MEDIA} className="pt-5" />
      </section>
    </div>
  );
}
