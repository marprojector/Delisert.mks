import { cn } from "@delisert.mks-1/ui/lib/utils";
import { useEffect, useState } from "react";

type Kind = "off" | "live" | "cfd";

export const WEEK: ReadonlyArray<{ short: string; long: string; kind: Kind }> = [
  { short: "Sen", long: "Senin", kind: "off" },
  { short: "Sel", long: "Selasa", kind: "live" },
  { short: "Rab", long: "Rabu", kind: "live" },
  { short: "Kam", long: "Kamis", kind: "live" },
  { short: "Jum", long: "Jumat", kind: "live" },
  { short: "Sab", long: "Sabtu", kind: "live" },
  { short: "Min", long: "Minggu", kind: "cfd" },
];

const LABEL: Record<Kind, { short: string; long: string }> = {
  off: { short: "Libur", long: "Libur" },
  live: { short: "Live", long: "TikTok Live" },
  cfd: { short: "CFD", long: "CFD" },
};

const STYLE: Record<Kind, string> = {
  off: "bg-muted text-muted-foreground",
  live: "bg-primary text-primary-foreground",
  cfd: "bg-accent text-foreground",
};

/** Indeks hari (0 = Senin … 6 = Minggu) menurut waktu Makassar (WITA). */
export function makassarWeekdayIndex(date: Date): number {
  const short = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    timeZone: "Asia/Makassar",
  }).format(date);
  return ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].indexOf(short);
}

/**
 * Pita satu minggu: Senin libur, Selasa–Sabtu TikTok Live, Minggu CFD.
 * Hari ini ditandai setelah hydration supaya markup SSR tetap stabil.
 */
export function WeekStrip({ className }: { className?: string }) {
  const [today, setToday] = useState<number | null>(null);
  useEffect(() => setToday(makassarWeekdayIndex(new Date())), []);

  return (
    <ol className={cn("grid grid-cols-7 gap-1.5 lg:gap-3", className)} aria-label="Jadwal minggu ini">
      {WEEK.map((day, index) => {
        const isToday = index === today;
        return (
          <li
            key={day.short}
            data-day={day.short}
            data-reveal
            aria-current={isToday ? "date" : undefined}
            className={cn(
              "flex h-16 flex-col items-center justify-center gap-1 rounded-[0.875rem] lg:h-28 lg:items-start lg:gap-1.5 lg:rounded-[1.375rem] lg:px-5",
              STYLE[day.kind],
              isToday && "ring-2 ring-foreground ring-offset-2 ring-offset-background",
            )}
          >
            <span className="text-[0.6875rem] opacity-80 lg:text-sm">
              <span className="lg:hidden">{day.short}</span>
              <span className="hidden lg:inline">{day.long}</span>
            </span>
            <span className="text-[0.6875rem] font-semibold lg:text-lg">
              <span className="lg:hidden">{LABEL[day.kind].short}</span>
              <span className="hidden lg:inline">{LABEL[day.kind].long}</span>
            </span>
            {isToday ? <span className="sr-only">(hari ini)</span> : null}
          </li>
        );
      })}
    </ol>
  );
}
