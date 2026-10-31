import { cn } from "@delisert.mks-1/ui/lib/utils";
import type { LucideIcon } from "lucide-react";

export function ScheduleCard({
  icon: Icon,
  title,
  children,
  tone = "default",
  className,
}: {
  icon: LucideIcon;
  title: string;
  children: React.ReactNode;
  tone?: "default" | "muted" | "accent";
  className?: string;
}) {
  return (
    <section
      className={cn(
        "flex flex-col gap-4 border border-border p-6 sm:p-8",
        tone === "muted" && "bg-secondary/50",
        tone === "accent" && "border-primary/25 bg-primary/5",
        className,
      )}
    >
      <div className="flex items-center gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center border border-border bg-background text-primary">
          <Icon className="size-5" aria-hidden="true" />
        </span>
        <h2 className="text-xl leading-snug">{title}</h2>
      </div>
      {children}
    </section>
  );
}
