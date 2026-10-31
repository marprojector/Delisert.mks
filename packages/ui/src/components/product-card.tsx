import type { ProductAvailability } from "@delisert.mks-1/ui/components/availability-badge";
import { AvailabilityBadge } from "@delisert.mks-1/ui/components/availability-badge";
import { Card } from "@delisert.mks-1/ui/components/card";
import { cn } from "@delisert.mks-1/ui/lib/utils";
import { MessageCircle } from "lucide-react";

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
};

export function formatRupiah(cents: number): string {
  return `Rp ${cents.toLocaleString("id-ID")}`;
}

export function ProductPrice({
  priceCents,
  variants,
  className,
}: {
  priceCents: number | null;
  variants?: Array<{ name: string; priceCents: number | null }>;
  className?: string;
}) {
  if (variants && variants.length > 0) {
    const prices = variants
      .map((variant) => variant.priceCents)
      .filter((price): price is number => price !== null);
    if (prices.length === 0) {
      return <span className={cn("text-muted-foreground", className)}>Harga menyusul</span>;
    }
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    return (
      <span className={className}>
        {min === max ? formatRupiah(min) : `${formatRupiah(min)} – ${formatRupiah(max)}`}
      </span>
    );
  }

  if (priceCents === null) {
    return <span className={cn("text-muted-foreground", className)}>Harga menyusul</span>;
  }

  return <span className={className}>{formatRupiah(priceCents)}</span>;
}

export function ProductCard({
  product,
  waHref,
  className,
}: {
  product: ProductCardData;
  waHref: string;
  className?: string;
}) {
  return (
    <Card
      data-slot="product-card"
      className={cn(
        "group/product-card gap-0 transition-shadow duration-300 hover:shadow-lg hover:shadow-primary/5",
        className,
      )}
    >
      <a href={`/menu/${product.slug}`} className="block overflow-hidden bg-muted">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.imageAlt ?? `Foto ${product.name} Delisert Makassar`}
            width={640}
            height={480}
            loading="lazy"
            decoding="async"
            className="aspect-4/3 w-full object-cover transition-transform duration-500 group-hover/product-card:scale-105"
          />
        ) : (
          <div className="flex aspect-4/3 w-full items-center justify-center bg-secondary text-muted-foreground">
            <span className="text-xs">Foto menyusul</span>
          </div>
        )}
      </a>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="cn-eyebrow text-muted-foreground">{product.category.name}</span>
          <AvailabilityBadge availability={product.availability} />
        </div>

        <h3 className="text-lg leading-snug">
          <a href={`/menu/${product.slug}`} className="hover:text-primary">
            {product.name}
          </a>
        </h3>

        {product.description ? (
          <p className="line-clamp-2 text-sm/relaxed text-muted-foreground">{product.description}</p>
        ) : null}

        {product.variants.length > 0 ? (
          <ul className="flex flex-wrap gap-1.5">
            {product.variants.map((variant) => (
              <li
                key={variant.id}
                className="border border-border bg-secondary/60 px-2 py-0.5 text-xs text-secondary-foreground"
              >
                {variant.name}
              </li>
            ))}
          </ul>
        ) : null}

        <div className="mt-auto flex items-end justify-between gap-3 pt-2">
          <span className="text-base font-medium text-primary">
            <ProductPrice priceCents={product.priceCents} variants={product.variants} />
          </span>
          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-primary underline-offset-4 hover:underline"
          >
            <MessageCircle className="size-3.5" aria-hidden="true" />
            Pesan via WhatsApp
            <span className="sr-only"> untuk {product.name}</span>
          </a>
        </div>
      </div>
    </Card>
  );
}
