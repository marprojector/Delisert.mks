import { waLink } from "@delisert.mks-1/api/data/business";
import { AvailabilityBadge } from "@delisert.mks-1/ui/components/availability-badge";
import { ProductGallery } from "@delisert.mks-1/ui/components/product-gallery";
import { formatRupiah } from "@delisert.mks-1/ui/components/product-card";
import { WhatsAppButton } from "@delisert.mks-1/ui/components/whatsapp-button";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";

import { useTRPC } from "@/utils/trpc";
import { canonical, productJsonLd } from "@/utils/seo";

export const Route = createFileRoute("/menu/$slug")({
  loader: async ({ context, params }) => {
    const product = await context.queryClient.fetchQuery(
      context.trpc.product.bySlug.queryOptions({ slug: params.slug }),
    );
    if (!product) throw notFound();
    return product;
  },
  head: ({ loaderData }) => {
    const product = loaderData;
    if (!product) return { meta: [{ title: "Produk tidak ditemukan — Delisert" }] };

    const priceText =
      product.priceCents !== null ? ` — ${formatRupiah(product.priceCents)}` : "";

    return {
      meta: [
        { title: `${product.name}${priceText} — Delisert Makassar` },
        {
          name: "description",
          content:
            product.description ??
            `${product.name} dari Delisert Makassar. Pesan via WhatsApp.`,
        },
        { property: "og:title", content: `${product.name} — Delisert Makassar` },
        {
          property: "og:description",
          content:
            product.description ??
            `${product.name} dari Delisert Makassar. Pesan via WhatsApp.`,
        },
        { property: "og:type", content: "product" },
        ...(product.imageUrl ? [{ property: "og:image", content: product.imageUrl }] : []),
      ],
      links: [{ rel: "canonical", href: canonical(`/menu/${product.slug}`) }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify(productJsonLd(product)),
        },
      ],
    };
  },
  component: ProductDetailComponent,
});

function ProductDetailComponent() {
  const { slug } = Route.useParams();
  const trpc = useTRPC();
  const { data: product, isLoading } = useQuery(trpc.product.bySlug.queryOptions({ slug }));

  if (isLoading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
        <p className="text-sm text-muted-foreground">Memuat produk…</p>
      </div>
    );
  }

  if (!product) {
    throw notFound();
  }

  const galleryImages = product.imageUrl
    ? [{ url: product.imageUrl, alt: product.imageAlt ?? `Foto ${product.name} Delisert Makassar` }]
    : [];

  const variantText =
    product.variants.length > 0
      ? ` (varian: ${product.variants.map((variant) => variant.name).join(", ")})`
      : "";

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <nav aria-label="Breadcrumb">
        <ol className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
          <li>
            <Link to="/" className="hover:text-primary">
              Beranda
            </Link>
          </li>
          <ChevronRight className="size-3.5" aria-hidden="true" />
          <li>
            <Link to="/menu" className="hover:text-primary">
              Menu
            </Link>
          </li>
          <ChevronRight className="size-3.5" aria-hidden="true" />
          <li>
            <Link
              to="/menu"
              search={{ category: product.category.slug }}
              className="hover:text-primary"
            >
              {product.category.name}
            </Link>
          </li>
          <ChevronRight className="size-3.5" aria-hidden="true" />
          <li aria-current="page" className="text-foreground">
            {product.name}
          </li>
        </ol>
      </nav>

      <div className="grid gap-10 pt-8 lg:grid-cols-2 lg:gap-16">
        <ProductGallery images={galleryImages} productName={product.name} />

        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <span className="cn-eyebrow text-primary">{product.category.name}</span>
              <AvailabilityBadge availability={product.availability} />
            </div>
            <h1 className="text-3xl leading-tight text-balance sm:text-4xl">{product.name}</h1>
          </div>

          {product.description ? (
            <p className="text-base/relaxed text-muted-foreground">{product.description}</p>
          ) : null}

          {product.variants.length > 0 ? (
            <div className="flex flex-col gap-3">
              <h2 className="cn-eyebrow text-muted-foreground">Varian & harga</h2>
              <ul className="flex flex-col divide-y divide-border border-y border-border">
                {product.variants.map((variant) => (
                  <li
                    key={variant.id}
                    className="flex items-center justify-between gap-4 py-3 text-sm"
                  >
                    <span className="flex items-center gap-2">
                      {variant.name}
                      {!variant.isAvailable ? (
                        <span className="text-xs text-muted-foreground">(habis)</span>
                      ) : null}
                    </span>
                    <span className="font-medium text-primary">
                      {variant.priceCents !== null ? (
                        formatRupiah(variant.priceCents)
                      ) : (
                        <span className="text-muted-foreground">Harga menyusul</span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              <h2 className="cn-eyebrow text-muted-foreground">Harga</h2>
              <p className="text-2xl font-medium text-primary">
                {product.priceCents !== null ? (
                  formatRupiah(product.priceCents)
                ) : (
                  <span className="text-muted-foreground">Harga menyusul</span>
                )}
              </p>
            </div>
          )}

          <div className="flex flex-col gap-3 border border-border bg-secondary/30 p-5">
            <h2 className="text-sm font-medium">Cara memesan</h2>
            <p className="text-sm/relaxed text-muted-foreground">
              Klik tombol di bawah untuk membuka WhatsApp dengan pesan yang sudah terisi nama produk
              ini{variantText ? " dan varian pilihan Anda" : ""}. Tim Delisert akan mengonfirmasi
              ketersediaan, total harga, dan opsi pengiriman.
            </p>
            <WhatsAppButton
              size="lg"
              href={waLink(
                `Halo Delisert, saya ingin memesan ${product.name}${variantText}. Apakah masih tersedia?`,
              )}
              fullWidth
            >
              Pesan via WhatsApp
            </WhatsAppButton>
          </div>

          <p className="text-xs/relaxed text-muted-foreground">
            Tidak ada pembayaran daring di website ini. Semua pesanan dikonfirmasi melalui WhatsApp.
          </p>
        </div>
      </div>

      {product.related.length > 0 ? (
        <section className="border-t border-border pt-14">
          <h2 className="text-2xl leading-snug">Produk terkait</h2>
          <ul className="grid gap-6 pt-8 sm:grid-cols-2 lg:grid-cols-4">
            {product.related.map((related) => (
              <li key={related.slug}>
                <Link
                  to="/menu/$slug"
                  params={{ slug: related.slug }}
                  className="group flex h-full flex-col gap-3 border border-border p-5 transition-colors hover:border-primary"
                >
                  <span className="aspect-4/3 w-full overflow-hidden bg-muted">
                    {related.imageUrl ? (
                      <img
                        src={related.imageUrl}
                        alt={`Foto ${related.name} Delisert Makassar`}
                        width={320}
                        height={240}
                        loading="lazy"
                        decoding="async"
                        className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <span className="flex size-full items-center justify-center text-xs text-muted-foreground">
                        Foto menyusul
                      </span>
                    )}
                  </span>
                  <span className="text-sm font-medium group-hover:text-primary">
                    {related.name}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
