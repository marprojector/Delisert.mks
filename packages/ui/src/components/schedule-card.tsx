import { cn } from "@delisert.mks-1/ui/lib/utils";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

type Tone = "rosewood" | "cream";

/**
 * Kartu jadwal ringkas: ikon dalam kotak membulat, label kecil, lalu teks
 * jadwal. "rosewood" untuk TikTok Live, "cream" untuk CFD.
 */
export function ScheduleCard({
  icon: Icon,
  eyebrow,
  title,
  children,
  tone = "cream",
  className,
}: {
  icon: LucideIcon;
  eyebrow?: string;
  title: string;
  children?: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  const rosewood = tone === "rosewood";
  return (
    <section
      data-reveal
      className={cn(
        "flex items-center gap-3.5 rounded-[1.25rem] p-4 lg:gap-5 lg:rounded-[1.75rem] lg:p-7",
        rosewood ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground",
        className,
      )}
    >
      <span
        className={cn(
          "flex size-11 shrink-0 items-center justify-center rounded-[0.875rem] lg:size-15 lg:rounded-[1.125rem]",
          rosewood ? "bg-primary-foreground/15" : "bg-accent text-foreground",
        )}
      >
        <Icon aria-hidden="true" className="size-5 lg:size-6" />
      </span>
      <div className="flex min-w-0 flex-col gap-0.5">
        {eyebrow ? (
          <span className={cn("cn-eyebrow", rosewood ? "text-accent" : "text-primary")}>{eyebrow}</span>
        ) : null}
        <h2 className="font-sans text-[0.9375rem] leading-snug font-semibold lg:text-[1.375rem]">{title}</h2>
        {children}
      </div>
    </section>
  );
}
