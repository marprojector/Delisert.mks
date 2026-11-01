import { cn } from "@delisert.mks-1/ui/lib/utils";
import { Plus } from "lucide-react";
import type { ReactNode } from "react";

/** Lipatan informasi memakai <details> native: bisa dibuka tanpa JavaScript. */
export function Disclosure({
  title,
  children,
  defaultOpen = false,
  className,
}: {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
  className?: string;
}) {
  return (
    <details open={defaultOpen} className={cn("group border-b border-border", className)}>
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-[0.9375rem] font-semibold text-foreground lg:py-[1.125rem] [&::-webkit-details-marker]:hidden">
        {title}
        <Plus
          aria-hidden="true"
          className="size-4 shrink-0 text-muted-foreground transition-transform duration-300 group-open:rotate-45"
        />
      </summary>
      <div className="pb-5 text-sm/relaxed text-muted-foreground">{children}</div>
    </details>
  );
}
