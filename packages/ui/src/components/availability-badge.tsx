import { cn } from "@delisert.mks-1/ui/lib/utils";
import { CheckCircle2, Clock, XCircle } from "lucide-react";

export type ProductAvailability = "available" | "preorder" | "soldout";

const availabilityConfig = {
  available: {
    label: "Tersedia",
    icon: CheckCircle2,
    className: "border-success/40 bg-success/10 text-success",
  },
  preorder: {
    label: "Pre-Order",
    icon: Clock,
    className: "border-warning/50 bg-warning/15 text-warning",
  },
  soldout: {
    label: "Habis",
    icon: XCircle,
    className: "border-danger/40 bg-danger/10 text-danger",
  },
} as const;

export function AvailabilityBadge({
  availability,
  className,
  showLabel = true,
}: {
  availability: ProductAvailability;
  className?: string;
  showLabel?: boolean;
}) {
  const config = availabilityConfig[availability];
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 border px-2 py-0.5 text-xs font-medium",
        config.className,
        className,
      )}
    >
      <Icon className="size-3.5 shrink-0" aria-hidden="true" />
      {showLabel ? config.label : <span className="sr-only">{config.label}</span>}
    </span>
  );
}
