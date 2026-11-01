import { cn } from "@delisert.mks-1/ui/lib/utils";
import { useState } from "react";

import { formatNumber } from "./ui";

export type DailyPoint = { date: string; pageviews: number; visits: number };
export type Metric = "visits" | "pageviews";

export const METRIC_LABEL: Record<Metric, string> = {
  visits: "Pengunjung",
  pageviews: "Tayangan halaman",
};

const dayLabel = (date: string, long = false) =>
  new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    ...(long ? { weekday: "long" } : {}),
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));

/**
 * Label sumbu X yang ringkas: tanggal saja ("27"), dengan nama bulan hanya di
 * label pertama dan saat bulan berganti ("1 Nov") — supaya tidak bertumpuk di HP.
 */
export function axisLabel(date: string, previousLabelDate: string | undefined): string {
  const day = Number(date.slice(8, 10));
  if (previousLabelDate && previousLabelDate.slice(5, 7) === date.slice(5, 7)) return String(day);
  return dayLabel(date);
}

/** Pembulatan ke atas yang "rapi" untuk sumbu Y (1, 2, 5 × 10ⁿ). */
function niceMax(value: number): number {
  if (value <= 4) return 4;
  const power = 10 ** Math.floor(Math.log10(value));
  for (const step of [1, 2, 2.5, 5, 10]) {
    if (step * power >= value) return step * power;
  }
  return 10 * power;
}

/**
 * Grafik batang harian satu ukuran (pengunjung atau tayangan). Satu seri,
 * jadi tanpa legenda; judul kartu yang menamainya. Setiap batang punya
 * tooltip saat disentuh, diarahkan kursor, atau difokus keyboard.
 */
export function DailyBarChart({
  data,
  metric,
  className,
  dim = false,
}: {
  data: DailyPoint[];
  metric: Metric;
  className?: string;
  /** Data sedang dimuat ulang: tahan gambar lama dengan opasitas rendah. */
  dim?: boolean;
}) {
  const [active, setActive] = useState<number | null>(null);
  const values = data.map((point) => point[metric]);
  const max = niceMax(Math.max(0, ...values));
  const ticks = [0, max / 2, max];
  const labelEvery = data.length > 45 ? 14 : data.length > 14 ? 5 : 1;
  const point = active === null ? null : data[active];

  return (
    <div className={cn("relative flex flex-col gap-2 transition-opacity", dim && "opacity-50", className)}>
      <div className="relative flex h-52 gap-2 lg:h-64">
        {/* Sumbu Y */}
        <div aria-hidden="true" className="flex w-8 shrink-0 flex-col-reverse justify-between text-right text-[0.6875rem] text-muted-foreground tabular-nums">
          {ticks.map((tick) => (
            <span key={tick} className="-my-1.5 leading-none">
              {formatNumber(Math.round(tick))}
            </span>
          ))}
        </div>
        <div className="relative min-w-0 flex-1">
          {/* Garis bantu */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 flex flex-col justify-between">
            {ticks.map((tick) => (
              <span key={tick} className={cn("h-px w-full", tick === 0 ? "bg-border" : "bg-border/50")} />
            ))}
          </div>
          <ol
            aria-label={`${METRIC_LABEL[metric]} per hari`}
            className="absolute inset-0 flex items-end gap-[2px]"
            onPointerLeave={() => setActive(null)}
          >
            {data.map((day, index) => {
              const value = day[metric];
              const height = max === 0 ? 0 : (value / max) * 100;
              return (
                <li key={day.date} className="flex h-full min-w-0 flex-1 items-end">
                  <button
                    type="button"
                    onPointerEnter={() => setActive(index)}
                    onFocus={() => setActive(index)}
                    onBlur={() => setActive(null)}
                    className="group flex h-full w-full items-end justify-center rounded-t-md outline-none focus-visible:bg-secondary/70"
                  >
                    <span className="sr-only">
                      {dayLabel(day.date)}: {formatNumber(value)} {METRIC_LABEL[metric].toLowerCase()}
                    </span>
                    <span
                      aria-hidden="true"
                      className={cn(
                        "block w-full max-w-9 rounded-t-[4px] transition-colors",
                        value === 0 ? "bg-border" : "bg-primary group-hover:bg-[#9b4752]",
                        active === index && value > 0 && "bg-[#9b4752]",
                      )}
                      style={{ height: value === 0 ? 2 : `max(${height}%, 3px)` }}
                    />
                  </button>
                </li>
              );
            })}
          </ol>
          {point && active !== null ? (
            <div
              role="status"
              className="pointer-events-none absolute -top-2 z-10 -translate-x-1/2 -translate-y-full rounded-xl bg-foreground px-3 py-2 text-background shadow-lg"
              style={{ left: `${((active + 0.5) / data.length) * 100}%` }}
            >
              <span className="block text-[0.6875rem] whitespace-nowrap text-background/70">{dayLabel(point.date, true)}</span>
              <span className="flex items-center gap-1.5 text-sm whitespace-nowrap">
                <span aria-hidden="true" className="h-0.5 w-3 rounded-full bg-[#e7a8b0]" />
                <strong className="font-semibold tabular-nums">{formatNumber(point[metric])}</strong>
                <span className="text-background/75">{METRIC_LABEL[metric].toLowerCase()}</span>
              </span>
              <span className="block text-[0.6875rem] whitespace-nowrap text-background/70">
                {formatNumber(metric === "visits" ? point.pageviews : point.visits)}{" "}
                {(metric === "visits" ? METRIC_LABEL.pageviews : METRIC_LABEL.visits).toLowerCase()}
              </span>
            </div>
          ) : null}
        </div>
      </div>
      {/* Sumbu X */}
      <div aria-hidden="true" className="flex gap-[2px] pl-10 text-[0.6875rem] text-muted-foreground">
        {data.map((day, index) => (
          <span key={day.date} className="min-w-0 flex-1 overflow-visible text-center whitespace-nowrap">
            {index % labelEvery === 0 ? axisLabel(day.date, data[index - labelEvery]?.date) : ""}
          </span>
        ))}
      </div>
    </div>
  );
}

/** Daftar peringkat dengan batang tipis proporsional (halaman, sumber, negara). */
export function RankedBars({
  rows,
  empty = "Belum ada data.",
  format = (label) => label,
}: {
  rows: Array<{ label: string; count: number }>;
  empty?: string;
  format?: (label: string) => string;
}) {
  if (rows.length === 0) return <p className="py-6 text-center text-sm text-muted-foreground">{empty}</p>;
  const max = Math.max(...rows.map((row) => row.count));
  return (
    <ul className="flex flex-col gap-2.5">
      {rows.map((row) => (
        <li key={row.label} className="flex flex-col gap-1">
          <span className="flex items-baseline justify-between gap-3 text-sm">
            <span className="min-w-0 truncate text-foreground" title={format(row.label)}>
              {format(row.label)}
            </span>
            <span className="shrink-0 font-semibold text-foreground tabular-nums">{formatNumber(row.count)}</span>
          </span>
          <span aria-hidden="true" className="h-1.5 overflow-hidden rounded-full bg-muted">
            <span
              className="block h-full rounded-full bg-primary/80"
              style={{ width: `${max === 0 ? 0 : Math.max(2, (row.count / max) * 100)}%` }}
            />
          </span>
        </li>
      ))}
    </ul>
  );
}

const COUNTRY = new Intl.DisplayNames(["id"], { type: "region" });
/** "ID" → "Indonesia". Nilai yang bukan kode negara dibiarkan. */
export const countryName = (code: string) => {
  if (!/^[A-Z]{2}$/.test(code)) return code;
  try {
    return COUNTRY.of(code) ?? code;
  } catch {
    return code;
  }
};

const DEVICE: Record<string, string> = { mobile: "HP", desktop: "Komputer", tablet: "Tablet" };
export const deviceName = (value: string) => DEVICE[value.toLowerCase()] ?? value;

const PAGE: Record<string, string> = {
  "/": "Beranda",
  "/menu": "Menu",
  "/tentang": "Tentang",
  "/jadwal": "Jadwal & Lokasi",
  "/kontak": "Kontak",
};
/** "/menu/mille-crepes" → "Menu · mille-crepes". */
export const pageName = (path: string) => {
  const clean = path.replace(/\/$/, "") || "/";
  if (PAGE[clean]) return `${PAGE[clean]} (${clean})`;
  const product = clean.match(/^\/menu\/(.+)$/);
  return product ? `Produk · ${product[1]}` : clean;
};
