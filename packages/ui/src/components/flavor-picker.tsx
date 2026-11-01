import { cn } from "@delisert.mks-1/ui/lib/utils";

export type PickerFlavor = { id: number; name: string; isAvailable: boolean };

/** Rasa yang dipesan: pilihan pengguna bila masih tersedia, selain itu tidak ada. */
export function availableFlavorName(flavors: readonly PickerFlavor[], chosen: string | null): string | null {
  const flavor = flavors.find((item) => item.name === chosen);
  return flavor?.isAvailable ? flavor.name : null;
}

/**
 * Pilihan rasa berupa chip. Memilih rasa bersifat opsional — tanpa pilihan,
 * pesan WhatsApp tidak menyebut rasa dan pelanggan bisa menyebutkannya sendiri
 * (mis. mencampur beberapa rasa dalam satu kotak).
 */
export function FlavorPicker({
  name,
  flavors,
  value,
  onChange,
  note,
}: {
  name: string;
  flavors: readonly PickerFlavor[];
  value: string | null;
  onChange: (name: string | null) => void;
  note?: string;
}) {
  if (flavors.length === 0) return null;
  const available = flavors.filter((flavor) => flavor.isAvailable).length;
  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="flex w-full items-baseline justify-between gap-3 pb-3">
        <span className="text-sm font-semibold text-foreground lg:text-base">Pilih rasa</span>
        <span className="text-xs text-muted-foreground lg:text-[0.8125rem]">
          {available} dari {flavors.length} rasa tersedia
        </span>
      </legend>
      <div className="flex flex-wrap gap-2">
        {flavors.map((flavor) => {
          const checked = flavor.name === value;
          return (
            <label
              key={flavor.id}
              className={cn(
                "relative inline-flex min-h-11 items-center gap-1.5 rounded-full border px-4 text-sm transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ring",
                !flavor.isAvailable && "cursor-not-allowed border-dashed border-border text-muted-foreground",
                flavor.isAvailable && !checked && "cursor-pointer border-border bg-background text-foreground hover:border-primary",
                checked && "cursor-pointer border-primary bg-primary font-semibold text-primary-foreground",
              )}
            >
              <input
                type="radio"
                name={name}
                value={flavor.name}
                checked={checked}
                disabled={!flavor.isAvailable}
                // Menekan rasa yang sudah dipilih membatalkan pilihan.
                onClick={() => {
                  if (checked) onChange(null);
                }}
                onChange={() => onChange(flavor.name)}
                className="sr-only"
              />
              {flavor.name}
              {flavor.isAvailable ? null : <span className="text-xs">· Habis</span>}
            </label>
          );
        })}
      </div>
      {note ? <p className="text-xs/relaxed text-muted-foreground lg:text-[0.8125rem]">{note}</p> : null}
    </fieldset>
  );
}

/** Ringkasan rasa di kartu produk: beberapa nama pertama + sisanya. */
export function FlavorPreview({
  flavors,
  max = 3,
  className,
}: {
  flavors: readonly PickerFlavor[];
  max?: number;
  className?: string;
}) {
  if (flavors.length === 0) return null;
  const shown = flavors.slice(0, max);
  const rest = flavors.length - shown.length;
  return (
    <p className={cn("flex flex-wrap items-center gap-1", className)}>
      <span className="sr-only">{flavors.length} rasa: </span>
      {shown.map((flavor) => (
        <span
          key={flavor.id}
          className="rounded-full bg-secondary px-2 py-0.5 text-[0.6875rem] font-medium text-foreground/80 lg:text-xs"
        >
          {flavor.name}
        </span>
      ))}
      {rest > 0 ? (
        <span className="rounded-full px-1 py-0.5 text-[0.6875rem] font-semibold text-primary lg:text-xs">
          +{rest} rasa
        </span>
      ) : null}
    </p>
  );
}
