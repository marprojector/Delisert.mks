import { photoSrcSet } from "@delisert.mks-1/ui/lib/photo";
import { cn } from "@delisert.mks-1/ui/lib/utils";

export type PickerFlavor = { id: number; name: string; isAvailable: boolean; imageUrl?: string | null };

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
  const selected = flavors.find((flavor) => flavor.name === value);
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
                "relative inline-flex min-h-11 items-center gap-1.5 rounded-full border text-sm transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ring",
                flavor.imageUrl ? "py-1 pr-4 pl-1" : "px-4",
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
              {flavor.imageUrl ? (
                <img
                  src={flavor.imageUrl}
                  srcSet={photoSrcSet(flavor.imageUrl)}
                  sizes="36px"
                  alt=""
                  width={36}
                  height={36}
                  loading="lazy"
                  decoding="async"
                  className={cn("size-9 rounded-full object-cover", !flavor.isAvailable && "opacity-50 grayscale")}
                />
              ) : null}
              {flavor.name}
              {flavor.isAvailable ? null : <span className="text-xs">· Habis</span>}
            </label>
          );
        })}
      </div>
      {/* HP: foto utama ada jauh di atas, jadi foto rasa terpilih ditampilkan di sini juga. */}
      {selected?.imageUrl ? (
        <figure
          key={selected.imageUrl}
          className="animate-in fade-in-0 zoom-in-95 overflow-hidden rounded-[1.25rem] bg-muted duration-300 lg:hidden"
        >
          <img
            src={selected.imageUrl}
            srcSet={photoSrcSet(selected.imageUrl)}
            sizes="100vw"
            alt={`Rasa ${selected.name}`}
            width={780}
            height={585}
            decoding="async"
            className="aspect-[4/3] w-full object-cover"
          />
          <figcaption className="px-3.5 py-2.5 text-[0.8125rem] font-semibold text-foreground">
            Rasa {selected.name}
          </figcaption>
        </figure>
      ) : null}
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
