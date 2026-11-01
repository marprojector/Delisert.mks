import { cn } from "@delisert.mks-1/ui/lib/utils";

export type ProductAvailability = "available" | "preorder" | "soldout";

/** Status selalu tertulis sebagai teks, bukan hanya warna. */
const availabilityConfig = {
  available: { label: "Tersedia", dot: "bg-success", text: "text-success" },
  preorder: { label: "Pre-Order", dot: "bg-warning", text: "text-[#9a6a12]" },
  soldout: { label: "Habis", dot: "bg-muted-foreground/70", text: "text-muted-foreground" },
} as const;

export const AVAILABILITY_LABEL: Record<ProductAvailability, string> = {
  available: availabilityConfig.available.label,
  preorder: availabilityConfig.preorder.label,
  soldout: availabilityConfig.soldout.label,
};

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
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full bg-background px-2.5 py-1 text-[0.6875rem] font-semibold leading-none",
        config.text,
        className,
      )}
    >
      <span aria-hidden="true" className={cn("size-1.5 shrink-0 rounded-full", config.dot)} />
      {showLabel ? config.label : <span className="sr-only">{config.label}</span>}
    </span>
  );
}
