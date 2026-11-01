import { formatRupiah } from "@delisert.mks-1/ui/lib/price";
import { cn } from "@delisert.mks-1/ui/lib/utils";

export type PickerVariant = {
  id: number;
  name: string;
  priceCents: number | null;
  isAvailable: boolean;
};

/**
 * Nama varian yang benar-benar bisa dipesan: pilihan pengguna bila masih
 * tersedia, kalau tidak varian tersedia pertama, atau null bila semua habis
 * (pesanan WhatsApp lalu dikirim tanpa nama varian).
 */
export function availableVariantName(
  variants: readonly PickerVariant[],
  chosen: string | null,
): string | null {
  const chosenVariant = variants.find((variant) => variant.name === chosen);
  if (chosenVariant?.isAvailable) return chosenVariant.name;
  return variants.find((variant) => variant.isAvailable)?.name ?? null;
}

/** Pilihan ukuran/rasa berupa kartu yang bisa ditekan. Input radio asli tetap ada. */
export function VariantPicker({
  name,
  variants,
  value,
  onChange,
  legend = "Pilih ukuran",
  className,
}: {
  name: string;
  variants: readonly PickerVariant[];
  value: string | null;
  onChange: (name: string) => void;
  legend?: string;
  className?: string;
}) {
  return (
    <fieldset className={cn("flex flex-col gap-2.5", className)}>
      <legend className="pb-2.5 text-[0.9375rem] font-semibold text-foreground">{legend}</legend>
      <div className="flex flex-col gap-2.5 lg:grid lg:grid-cols-3">
        {variants.map((variant) => {
          const checked = variant.name === value;
          return (
            <label
              key={variant.id}
              className={cn(
                "relative flex cursor-pointer items-center justify-between gap-3 rounded-2xl border p-4 transition-colors lg:flex-col lg:items-start lg:gap-1 lg:rounded-[1.125rem]",
                checked ? "border-2 border-primary bg-secondary" : "border-border hover:border-primary/60",
                !variant.isAvailable && "cursor-not-allowed opacity-55",
              )}
            >
              <input
                type="radio"
                name={name}
                value={variant.name}
                checked={checked}
                disabled={!variant.isAvailable}
                onChange={() => onChange(variant.name)}
                className="peer sr-only"
              />
              <span className="flex items-center gap-3">
                <span
                  aria-hidden="true"
                  className={cn(
                    "flex size-5 shrink-0 items-center justify-center rounded-full border-2 lg:hidden",
                    checked ? "border-primary bg-primary" : "border-[#c9c2b8]",
                  )}
                >
                  {checked ? <span className="size-2 rounded-full bg-background" /> : null}
                </span>
                <span className={cn("text-[0.9375rem] text-foreground", checked ? "font-semibold" : "font-medium")}>
                  {variant.name}
                </span>
              </span>
              <span
                className={cn(
                  "text-[0.9375rem] lg:text-sm",
                  checked ? "font-semibold text-primary" : "text-foreground lg:text-muted-foreground",
                )}
              >
                {!variant.isAvailable
                  ? "Habis"
                  : variant.priceCents === null
                    ? "Harga menyusul"
                    : formatRupiah(variant.priceCents)}
              </span>
              <span className="pointer-events-none absolute inset-0 rounded-[inherit] peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ring" />
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
