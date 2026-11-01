import {
  CFD,
  CFD_MAPS_URLS,
  OPERATIONAL_ADDRESS,
  OPERATIONAL_ADDRESS_MAPS_URL,
  TIKTOK_LIVE,
} from "@delisert.mks-1/api/data/business";
import { WeekStrip } from "@delisert.mks-1/ui/components/week-strip";
import { createFileRoute } from "@tanstack/react-router";
import { ArrowUpRight, MapPin } from "lucide-react";
import { useRef } from "react";

import { useReveal } from "@/lib/motion";
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

const fullAddress = [
  OPERATIONAL_ADDRESS.complex,
  OPERATIONAL_ADDRESS.street,
  OPERATIONAL_ADDRESS.rtRw,
  OPERATIONAL_ADDRESS.village,
  OPERATIONAL_ADDRESS.district,
  OPERATIONAL_ADDRESS.city,
  OPERATIONAL_ADDRESS.province,
].join(", ");

function ScheduleComponent() {
  const pageRef = useRef<HTMLDivElement>(null);
  useReveal(pageRef);

  return (
    <div ref={pageRef} data-motion-scope className="cn-shell flex flex-col gap-6 pt-4 pb-16 lg:gap-10 lg:pt-16 lg:pb-24">
      <div className="flex flex-col gap-2 lg:gap-3">
        <h1 className="text-4xl leading-tight font-semibold text-foreground lg:text-[4rem]">
          Jadwal & Lokasi
        </h1>
        <p className="text-sm/relaxed text-muted-foreground lg:text-lg">
          Kapan dan di mana kamu bisa menemukan Delisert minggu ini.
        </p>
      </div>

      <section aria-labelledby="minggu-ini" className="flex flex-col gap-2.5">
        <h2 id="minggu-ini" className="font-sans text-[0.8125rem] font-semibold text-foreground lg:sr-only">
          Minggu ini
        </h2>
        <WeekStrip />
      </section>

      <div className="grid gap-4 lg:grid-cols-[500fr_676fr] lg:gap-6">
        <section
          data-reveal
          className="flex flex-col gap-3 rounded-3xl bg-primary p-5 text-primary-foreground lg:gap-4 lg:rounded-[2rem] lg:p-9"
        >
          <span className="cn-eyebrow text-accent">{TIKTOK_LIVE.label}</span>
          <h2 className="text-[1.625rem] font-semibold lg:text-[2.5rem]">{TIKTOK_LIVE.days}</h2>
          <p className="text-base font-semibold lg:text-[1.375rem]">{TIKTOK_LIVE.hours}</p>
          <p className="hidden max-w-sm text-[0.9375rem]/relaxed text-primary-foreground/80 lg:block">
            Kanal jualan utama kami. Promo batch dan PO diumumkan saat live.
          </p>
          <a
            href={TIKTOK_LIVE.ctaUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 inline-flex h-11 w-fit items-center rounded-full bg-primary-foreground px-4.5 text-sm font-semibold text-primary lg:h-[3.125rem] lg:px-5.5 lg:text-[0.9375rem]"
          >
            Follow @delisert.mkss
          </a>
        </section>

        <section
          data-reveal
          className="flex flex-col gap-3 rounded-3xl bg-secondary p-5 lg:gap-4 lg:rounded-[2rem] lg:p-9"
        >
          <h2 className="cn-eyebrow font-sans text-primary">CFD Minggu · {CFD.hours}</h2>
          <p className="text-sm/relaxed text-muted-foreground">{CFD.description}</p>
          <ul className="flex flex-col divide-y divide-border lg:gap-3 lg:divide-y-0">
            {CFD.locations.map((location) => (
              <li
                key={location.id}
                className="flex items-center justify-between gap-3 py-3 lg:gap-4 lg:rounded-[1.375rem] lg:bg-background lg:p-5"
              >
                <span className="hidden size-11 shrink-0 items-center justify-center rounded-full bg-secondary text-primary lg:flex">
                  <MapPin aria-hidden="true" className="size-5" />
                </span>
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="text-base font-semibold text-foreground lg:text-lg">{location.name}</span>
                  <span className="text-[0.8125rem] text-muted-foreground lg:text-sm">{location.landmark}</span>
                </span>
                <a
                  href={CFD_MAPS_URLS[location.id]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex shrink-0 items-center gap-1 rounded-full border border-primary px-3.5 py-2 text-xs font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground lg:text-[0.8125rem]"
                >
                  Peta
                  <ArrowUpRight aria-hidden="true" className="size-3.5" />
                  <span className="sr-only"> untuk {location.name}</span>
                </a>
              </li>
            ))}
          </ul>
          <p className="text-xs/relaxed text-muted-foreground lg:text-[0.8125rem]">{CFD.scheduleNote}</p>
        </section>
      </div>

      <section
        data-reveal
        aria-labelledby="alamat"
        className="flex flex-col gap-4 lg:grid lg:grid-cols-[520px_1fr] lg:gap-12 lg:rounded-[2rem] lg:border lg:border-border lg:p-10"
      >
        <a
          href={OPERATIONAL_ADDRESS_MAPS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-40 items-center justify-center gap-2 rounded-[1.25rem] bg-[#e9e3d8] text-sm font-medium text-muted-foreground lg:order-none lg:h-56 lg:rounded-3xl"
        >
          <MapPin aria-hidden="true" className="size-5" />
          Buka peta alamat
        </a>
        <div className="flex flex-col gap-2.5 lg:gap-3.5 lg:pt-2">
          <span className="cn-eyebrow text-primary">Alamat operasional</span>
          <h2 id="alamat" className="text-[1.375rem] font-semibold text-foreground lg:text-3xl">
            {OPERATIONAL_ADDRESS.name}
          </h2>
          <address className="text-sm/relaxed text-foreground not-italic lg:text-base/relaxed">
            {fullAddress}
          </address>
          <p className="text-xs/relaxed text-muted-foreground lg:text-sm">
            {OPERATIONAL_ADDRESS.note}
          </p>
        </div>
      </section>
    </div>
  );
}
