import { categoryTint } from "@delisert.mks-1/ui/lib/category-tint";
import { cn } from "@delisert.mks-1/ui/lib/utils";

/** Tempat foto berwarna selama foto produk asli belum diunggah. */
export function PhotoPlaceholder({
  categorySlug,
  label = "Foto menyusul",
  className,
}: {
  categorySlug?: string;
  label?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex size-full items-end justify-start p-3 text-[0.6875rem] font-medium text-foreground/55",
        categoryTint(categorySlug),
        className,
      )}
    >
      <span>{label}</span>
    </div>
  );
}
