import { cn } from "@delisert.mks-1/ui/lib/utils";

/**
 * Baris chip kategori yang bisa digeser di HP dan menempel di bawah header
 * saat halaman di-scroll. Chip pertama selalu "Semua".
 */
export function CategoryChips({
  items,
  active,
  onSelect,
  className,
}: {
  items: ReadonlyArray<{ slug: string; name: string }>;
  active?: string;
  onSelect: (slug?: string) => void;
  className?: string;
}) {
  const chips = [{ slug: undefined, name: "Semua" }, ...items];

  return (
    <div
      className={cn(
        "sticky top-[3.75rem] z-30 -mx-5 border-b border-border/70 bg-background/95 backdrop-blur-md lg:top-20 lg:mx-0 lg:border-0 lg:bg-transparent lg:backdrop-blur-none",
        className,
      )}
    >
      <div
        role="group"
        aria-label="Filter kategori"
        className="cn-no-scrollbar flex snap-x scroll-px-5 gap-2 overflow-x-auto px-5 py-3 lg:flex-wrap lg:scroll-px-0 lg:px-0 lg:py-0"
      >
        {chips.map((chip) => {
          const pressed = chip.slug === active;
          return (
            <button
              key={chip.slug ?? "semua"}
              type="button"
              aria-pressed={pressed}
              onClick={() => onSelect(chip.slug)}
              className={cn(
                "shrink-0 snap-start rounded-full border px-4 py-2.5 text-sm whitespace-nowrap transition-colors lg:px-5 lg:py-3 lg:text-[0.9375rem]",
                pressed
                  ? "border-primary bg-primary font-semibold text-primary-foreground"
                  : "border-border font-medium text-foreground hover:border-primary hover:text-primary",
              )}
            >
              {chip.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
