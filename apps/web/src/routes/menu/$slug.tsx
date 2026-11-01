import { productOrderMessage } from "@delisert.mks-1/api/data/business";
import { AvailabilityBadge } from "@delisert.mks-1/ui/components/availability-badge";
import { Disclosure } from "@delisert.mks-1/ui/components/disclosure";
import { FlavorPicker, availableFlavorName } from "@delisert.mks-1/ui/components/flavor-picker";
import { PhotoPlaceholder } from "@delisert.mks-1/ui/components/photo-placeholder";
import { ProductGallery } from "@delisert.mks-1/ui/components/product-gallery";
import { StickyOrderBar } from "@delisert.mks-1/ui/components/sticky-order-bar";
import {
  type VariantChoice,
  VariantPicker,
  availableVariantName,
  choiceForProduct,
} from "@delisert.mks-1/ui/components/variant-picker";
import { WhatsAppButton } from "@delisert.mks-1/ui/components/whatsapp-button";
import { photoSrcSet } from "@delisert.mks-1/ui/lib/photo";
import { formatRupiah } from "@delisert.mks-1/ui/lib/price";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Share2 } from "lucide-react";
import { useRef, useState } from "react";

import { AnimatedPrice } from "@/components/animated-price";
import { useReveal, useSlideUp } from "@/lib/motion";
import { useSiteContent, useWaLink } from "@/lib/site";
import { useTRPC } from "@/utils/trpc";
import { absoluteUrl, canonical, productJsonLd, siteUrl } from "@/utils/seo";

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
        { property: "og:url", content: canonical(`/menu/${product.slug}`) },
        ...(product.imageUrl
          ? [{ property: "og:image", content: absoluteUrl(product.imageUrl) }]
          : []),
      ],
      links: [{ rel: "canonical", href: canonical(`/menu/${product.slug}`) }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify(productJsonLd(product, siteUrl())),
        },
      ],
    };
  },
  component: ProductDetailComponent,
  notFoundComponent: ProductNotFound,
});

function ProductNotFound() {
  return (
    <div className="cn-shell flex flex-col items-center gap-4 py-24 text-center lg:py-32">
      <span
        aria-hidden="true"
        className="flex size-36 items-center justify-center rounded-full bg-secondary cn-font-display text-6xl font-semibold text-primary"
      >
        404
      </span>
      <h1 className="pt-2 text-[1.75rem] leading-tight font-semibold text-foreground lg:text-4xl">
        Produk tidak ditemukan
      </h1>
      <p className="max-w-sm text-[0.9375rem]/relaxed text-muted-foreground">
        Mungkin sudah diganti atau tidak dijual lagi.
      </p>
      <Link
        to="/menu"
        className="mt-2 inline-flex h-[3.25rem] w-full max-w-[21rem] items-center justify-center rounded-full bg-primary px-6 text-[0.9375rem] font-semibold text-primary-foreground"
      >
        Lihat semua menu
      </Link>
      <Link to="/" className="text-sm font-semibold text-primary">
        Kembali ke beranda
      </Link>
    </div>
  );
}

function ProductDetailComponent() {
  const { slug } = Route.useParams();
  const trpc = useTRPC();
  const { data: product } = useQuery(trpc.product.bySlug.queryOptions({ slug }));
  const initial = Route.useLoaderData();
  const [choice, setChoice] = useState<VariantChoice>(null);
  const [flavorChoice, setFlavorChoice] = useState<VariantChoice>(null);
  const pageRef = useRef<HTMLDivElement>(null);
  useReveal(pageRef, [slug]);
  useSlideUp(pageRef);
  const { contact, schedule } = useSiteContent();
  const waLink = useWaLink();

  const current = product ?? initial;
  if (!current) return <ProductNotFound />;

  const galleryImages = current.imageUrl
    ? [{ url: current.imageUrl, alt: current.imageAlt ?? `Foto ${current.name} Delisert Makassar` }]
    : [];

  // Varian yang dipesan selalu yang benar-benar tersedia (atau tanpa varian bila semua habis).
  const variantName = availableVariantName(current.variants, choiceForProduct(choice, current.slug));
  const variant = current.variants.find((item) => item.name === variantName);
  const flavorName = availableFlavorName(current.flavors, choiceForProduct(flavorChoice, current.slug));
  const orderLabel = [variantName, flavorName].filter(Boolean).join(" · ");
  const priceCents = variant ? variant.priceCents : current.priceCents;
  const orderHref = waLink(
    productOrderMessage({
      productName: current.name,
      variantName: variantName ?? undefined,
      flavorName: flavorName ?? undefined,
    }),
  );

  const share = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: current.name, url }).catch(() => {});
    } else {
      await navigator.clipboard?.writeText(url).catch(() => {});
    }
  };

  return (
    <div ref={pageRef} data-motion-scope className="pb-12 lg:pb-24">
      <nav aria-label="Breadcrumb" className="cn-shell hidden pt-6 lg:block">
        <ol className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <li>
            <Link to="/menu" className="hover:text-primary">
              Menu
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link to="/menu" search={{ category: current.category.slug }} className="hover:text-primary">
              {current.category.name}
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-foreground">
            {current.name}
          </li>
        </ol>
      </nav>

      <div className="lg:cn-shell lg:grid lg:grid-cols-[minmax(0,640fr)_minmax(0,496fr)] lg:gap-16 lg:pt-7">
        <div className="relative">
          <ProductGallery
            images={galleryImages}
            productName={current.name}
            categorySlug={current.category.slug}
          />
          <div className="absolute inset-x-4 top-4 flex justify-between lg:hidden">
            <Link
              to="/menu"
              className="flex size-[2.625rem] items-center justify-center rounded-full bg-background shadow-sm"
            >
              <ArrowLeft aria-hidden="true" className="size-5" />
              <span className="sr-only">Kembali ke menu</span>
            </Link>
            <button
              type="button"
              onClick={share}
              className="flex size-[2.625rem] items-center justify-center rounded-full bg-background shadow-sm"
            >
              <Share2 aria-hidden="true" className="size-4.5" />
              <span className="sr-only">Bagikan produk</span>
            </button>
          </div>
        </div>

        <div className="relative -mt-7 flex flex-col gap-5 rounded-t-[1.75rem] bg-background px-5 pt-6 lg:mt-0 lg:gap-6 lg:rounded-none lg:px-0 lg:pt-2">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="cn-eyebrow text-primary">{current.category.name}</span>
            <AvailabilityBadge availability={current.availability} className="bg-secondary" />
          </div>
          <h1 className="-mt-1 text-[1.875rem] leading-[1.15] font-semibold text-foreground lg:text-5xl lg:leading-[1.1]">
            {current.name}
          </h1>
          <p className="hidden text-[1.75rem] font-semibold text-primary lg:block">
            <AnimatedPrice cents={priceCents} />
          </p>
          {current.description ? (
            <p className="text-[0.9375rem]/relaxed text-muted-foreground lg:text-base/relaxed">
              {current.description}
            </p>
          ) : null}

          {current.variants.length > 0 ? (
            <VariantPicker
              name={`varian-${current.slug}`}
              legend="Pilih ukuran"
              variants={current.variants}
              value={variantName}
              onChange={(name) => setChoice({ slug: current.slug, name })}
            />
          ) : null}

          <FlavorPicker
            name={`rasa-${current.slug}`}
            flavors={current.flavors}
            value={flavorName}
            onChange={(name) => setFlavorChoice(name ? { slug: current.slug, name } : null)}
            note={
              current.variants.some((item) => /isi\s*\d/i.test(item.name))
                ? "Mau campur beberapa rasa dalam satu kotak? Sebutkan saja rasanya di chat WhatsApp."
                : undefined
            }
          />

          <div className="hidden flex-col gap-3 lg:flex">
            <WhatsAppButton href={orderHref} size="lg" fullWidth className="h-[3.75rem] text-[1.0625rem]">
              {orderLabel ? `Pesan ${orderLabel} via WhatsApp` : "Pesan via WhatsApp"}
            </WhatsAppButton>
            <p className="text-[0.8125rem] text-muted-foreground">
              Pesan WhatsApp sudah terisi nama produk{current.variants.length > 0 ? ", ukuran" : ""}
              {current.flavors.length > 0 ? ", dan rasa" : ""}. Stok dikonfirmasi oleh tim.
            </p>
          </div>

          <div className="border-t border-border">
            <Disclosure title="Cara ambil & kirim">
              <p>{contact.pickupInstruction}</p>
              <p className="pt-2">
                Pengiriman: {contact.deliveryMethods.join(", ")}. {contact.deliveryNote}
              </p>
            </Disclosure>
            <Disclosure title="Jadwal jualan">
              <p>
                {schedule.liveLabel}: {schedule.liveDays}, {schedule.liveHours}.
              </p>
              <p className="pt-2">
                CFD Minggu: {schedule.cfdHours}
                {schedule.cfdLocations.length > 0
                  ? `, di ${schedule.cfdLocations.map((location) => location.name).join(" dan ")}.`
                  : "."}
              </p>
            </Disclosure>
          </div>
        </div>
      </div>

      {current.related.length > 0 ? (
        <section className="cn-shell flex flex-col gap-4 pt-10 lg:gap-6 lg:pt-24">
          <h2 data-reveal className="text-[1.375rem] font-semibold text-foreground lg:text-4xl">
            Coba juga
          </h2>
          <ul className="cn-no-scrollbar -mx-5 flex snap-x scroll-px-5 gap-3 overflow-x-auto px-5 lg:mx-0 lg:grid lg:grid-cols-4 lg:gap-6 lg:px-0">
            {current.related.map((related) => (
              <li key={related.slug} data-reveal className="w-[9.5rem] shrink-0 snap-start lg:w-auto">
                <Link to="/menu/$slug" params={{ slug: related.slug }} className="group flex flex-col gap-2.5">
                  <span className="block aspect-[5/4] overflow-hidden rounded-2xl lg:aspect-[282/220] lg:rounded-3xl">
                    {related.imageUrl ? (
                      <img
                        src={related.imageUrl}
                        srcSet={photoSrcSet(related.imageUrl)}
                        sizes="(min-width: 1024px) 25vw, 40vw"
                        alt={`Foto ${related.name} Delisert Makassar`}
                        width={320}
                        height={256}
                        loading="lazy"
                        decoding="async"
                        className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <PhotoPlaceholder />
                    )}
                  </span>
                  <span className="text-sm font-semibold text-foreground lg:text-[1.0625rem]">
                    {related.name}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <StickyOrderBar
        label={orderLabel ? `${current.name} · ${orderLabel}` : current.name}
        priceText={<AnimatedPrice cents={priceCents} />}
        href={orderHref}
      />
    </div>
  );
}
