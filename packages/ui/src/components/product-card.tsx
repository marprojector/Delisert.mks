import { formatRupiah, summariseVariantPrice } from "@delisert.mks-1/ui/lib/price";
import type { ProductAvailability } from "@delisert.mks-1/ui/components/availability-badge";
import { AvailabilityBadge } from "@delisert.mks-1/ui/components/availability-badge";
import { FlavorPreview } from "@delisert.mks-1/ui/components/flavor-picker";
import { PhotoPlaceholder } from "@delisert.mks-1/ui/components/photo-placeholder";
import { RotatingPhotos } from "@delisert.mks-1/ui/components/rotating-photos";
import { productPhotos } from "@delisert.mks-1/ui/lib/product-photos";
import { photoSrcSet } from "@delisert.mks-1/ui/lib/photo";
import { cn } from "@delisert.mks-1/ui/lib/utils";
import { Plus } from "lucide-react";

export { formatRupiah };

export type ProductCardData = {
  id: number;
  slug: string;
  name: string;
  description: string | null;
  priceCents: number | null;
  imageUrl: string | null;
  imageAlt: string | null;
  availability: ProductAvailability;
  category: { slug: string; name: string };
  variants: Array<{ id: number; name: string; priceCents: number | null; isAvailable: boolean }>;
  /** Varian rasa; opsional supaya data lama tetap bisa dirender. */
  flavors?: Array<{ id: number; name: string; isAvailable: boolean; imageUrl?: string | null }>;
  /** Foto otomatis dari rasa (bergantian di kartu). */
  useFlavorPhotos?: boolean;
};

export function ProductPrice({
  priceCents,
  variants,
  className,
}: {
  priceCents: number | null;
  variants?: Array<{ name: string; priceCents: number | null }>;
  className?: string;
}) {
  const summary =
    variants && variants.length > 0
      ? summariseVariantPrice(variants.map((variant) => variant.priceCents))
      : priceCents === null
        ? ({ kind: "none" } as const)
        : ({ kind: "single", cents: priceCents } as const);

  if (summary.kind === "none") {
    return <span className={cn("text-muted-foreground", className)}>Harga menyusul</span>;
  }

  if (summary.kind === "single") {
    return <span className={className}>{formatRupiah(summary.cents)}</span>;
  }

  return (
    <span className={className}>
      {formatRupiah(summary.min)} – {formatRupiah(summary.max).replace("Rp ", "")}
    </span>
  );
}

/**
 * Kartu produk katalog. Seluruh kartu membuka halaman detail; tombol "+"
 * di pojok foto langsung membuka WhatsApp untuk produk itu (tanpa keranjang).
 */
export function ProductCard({
  product,
  waHref,
  className,
  sizes = "(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw",
}: {
  product: ProductCardData;
  waHref: string;
  className?: string;
  sizes?: string;
}) {
  const soldOut = product.availability === "soldout";
  const photos = productPhotos(product);
  const detailHref = `/menu/${product.slug}`;

  return (
    <article
      data-reveal
      data-slot="product-card"
      className={cn("group/product-card relative flex min-w-0 flex-col gap-2.5", className)}
    >
      <div className="relative aspect-square overflow-hidden rounded-[1.25rem] lg:rounded-3xl">
        {photos.length > 1 ? (
            <RotatingPhotos
              photos={photos}
              sizes={sizes}
              seed={product.id}
              imageClassName="transition-[opacity,transform] group-hover/product-card:scale-105"
            />
          ) : photos[0] ? (
            <img
              src={photos[0].url}
              srcSet={photoSrcSet(photos[0].url)}
              sizes={sizes}
              alt={photos[0].alt}
              width={640}
              height={640}
              loading="lazy"
              decoding="async"
              className="size-full object-cover transition-transform duration-700 ease-out group-hover/product-card:scale-105"
            />
          ) : (
            <PhotoPlaceholder
              categorySlug={product.category.slug}
              className="transition-transform duration-700 ease-out group-hover/product-card:scale-105"
            />
          )}
        <AvailabilityBadge availability={product.availability} className="absolute top-2.5 left-2.5" />
        <a
          href={waHref}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Pesan ${product.name} via WhatsApp`}
          className={cn(
            "absolute right-2.5 bottom-2.5 z-10 flex size-9 items-center justify-center rounded-full shadow-md transition-transform duration-200 hover:scale-110 active:scale-95 lg:size-11",
            soldOut
              ? "bg-border text-muted-foreground"
              : "bg-primary text-primary-foreground shadow-primary/25",
          )}
        >
          <Plus aria-hidden="true" className="size-4.5 lg:size-5" />
        </a>
      </div>

      <div className="flex min-w-0 flex-col gap-1">
        <span className="cn-eyebrow text-[0.625rem] text-primary lg:text-[0.6875rem]">
          {product.category.name}
        </span>
        <h3 className="font-sans text-[0.9375rem] leading-snug font-semibold break-words text-foreground lg:text-lg">
          <a href={detailHref} className="after:absolute after:inset-0 after:content-['']">
            {product.name}
          </a>
        </h3>
        {product.description ? (
          <p className="hidden text-sm/relaxed text-muted-foreground sm:line-clamp-2">
            {product.description}
          </p>
        ) : null}
        <ProductPrice
          priceCents={product.priceCents}
          variants={product.variants}
          className="text-sm font-semibold text-foreground lg:text-base"
        />
        {product.flavors && product.flavors.length > 0 ? (
          <FlavorPreview flavors={product.flavors} className="pt-1" />
        ) : null}
      </div>
    </article>
  );
}
