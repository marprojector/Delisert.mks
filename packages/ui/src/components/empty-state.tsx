import { cn } from "@delisert.mks-1/ui/lib/utils";
import type { ReactNode } from "react";

export function EmptyState({
  title,
  description,
  action,
  secondary,
  className,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  secondary?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-3.5 rounded-3xl bg-secondary px-6 py-10 text-center sm:px-10",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className="flex size-16 items-center justify-center rounded-full bg-background text-primary"
      >
        <span className="size-5 rounded-full border-2 border-current" />
      </span>
      <h2 className="text-[1.375rem] leading-snug text-foreground">{title}</h2>
      {description ? <p className="max-w-sm text-sm/relaxed text-muted-foreground">{description}</p> : null}
      {action ? <div className="pt-1">{action}</div> : null}
      {secondary}
    </div>
  );
}
