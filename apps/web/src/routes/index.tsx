import { CFD, TIKTOK_LIVE, productOrderMessage, waLink } from "@delisert.mks-1/api/data/business";
import type { RouterOutputs } from "@delisert.mks-1/api/routers/index";
import { PhotoPlaceholder } from "@delisert.mks-1/ui/components/photo-placeholder";
import { ProductCard } from "@delisert.mks-1/ui/components/product-card";
import { ScheduleCard } from "@delisert.mks-1/ui/components/schedule-card";
import { SectionHeading } from "@delisert.mks-1/ui/components/section-heading";
import { WhatsAppButton } from "@delisert.mks-1/ui/components/whatsapp-button";
import { categoryTint } from "@delisert.mks-1/ui/lib/category-tint";
import { photoSrcSet } from "@delisert.mks-1/ui/lib/photo";
import { cn } from "@delisert.mks-1/ui/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Play, Sun } from "lucide-react";
import { useRef } from "react";

import { parallaxOverscanPx, useHeroIntro, useParallax, useReveal } from "@/lib/motion";
import { canonical } from "@/utils/seo";
import { useTRPC } from "@/utils/trpc";

type Product = RouterOutputs["product"]["list"][number];
type Category = RouterOutputs["product"]["categories"][number];

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Delisert — Mochi & Dessert Makassar | Sejak 2021" },
      { property: "og:title", content: "Delisert — Mochi & Dessert Makassar | Sejak 2021" },
      {
        property: "og:description",
        content:
          "Dessert dan makanan homemade Makassar sejak 2021. Mochi, pancake durian, mango sticky rice, mille crepes, Dubai chewy cookie, dan slice cake.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: canonical("/") },
    ],
    links: [{ rel: "canonical", href: canonical("/") }],
  }),
  loader: async ({ context }) => {
    const [featured, categories] = await Promise.all([
      context.queryClient.fetchQuery(context.trpc.product.list.queryOptions({ featuredOnly: true })),
      context.queryClient.fetchQuery(context.trpc.product.categories.queryOptions()),
    ]);
    return { featured, categories };
  },
  component: HomeComponent,
});

const orderHref = (product: Product) => waLink(productOrderMessage({ productName: product.name }));

function HomeComponent() {
  const trpc = useTRPC();
  const featured = useQuery(trpc.product.list.queryOptions({ featuredOnly: true }));
  const categories = useQuery(trpc.product.categories.queryOptions());
  // Data loader dipakai untuk render pertama (SSR) dan sebelum hydration selesai.
  const initial = Route.useLoaderData();

  const featuredProducts = (featured.data ?? initial.featured).slice(0, 4);
  const categoryList = categories.data ?? initial.categories;

  const pageRef = useRef<HTMLDivElement>(null);
  useHeroIntro(pageRef);
  useParallax(pageRef);
  useReveal(pageRef);

  return (
    <div ref={pageRef} className="flex flex-col">
      <Hero products={featuredProducts} />
      <ScheduleStrip />
      <Featured products={featuredProducts} />
      <Categories categories={categoryList} />
      <Story />
    </div>
  );
}

function Hero({ products }: { products: Product[] }) {
  const [main, second, third] = products;
  return (
    <section className="cn-shell grid gap-8 pt-5 pb-4 lg:grid-cols-[minmax(0,560fr)_minmax(0,576fr)] lg:items-center lg:gap-16 lg:pt-12 lg:pb-20">
      <div className="flex flex-col gap-4 lg:gap-6">
        <span
          data-hero-fade
          className="inline-flex w-fit items-center gap-2 rounded-full bg-secondary px-3 py-1.5 text-xs font-semibold text-primary lg:px-3.5 lg:text-[0.8125rem]"
        >
          <span aria-hidden="true" className="size-2 rounded-full bg-primary" />
          Dessert Makassar · Sejak 2021
        </span>
        <h1 className="text-[2.75rem] leading-[1.08] font-semibold text-foreground sm:text-6xl lg:text-[4.75rem] lg:leading-[1.05]">
          <span className="block overflow-hidden pb-1">
            <span data-hero-line className="block">
              Mochi lembut,
            </span>
          </span>
          <span className="block overflow-hidden pb-1">
            <span data-hero-line className="block">
              dibuat setiap hari.
            </span>
          </span>
        </h1>
        <p
          data-hero-fade
          className="max-w-[30rem] text-[0.9375rem]/relaxed text-muted-foreground lg:text-lg/relaxed"
        >
          Mochi, pancake durian, mango sticky rice, dan mille crepes homemade. Pesan langsung lewat
          WhatsApp.
        </p>
        <div data-hero-fade className="flex flex-wrap gap-2.5 pt-1 lg:gap-3 lg:pt-2">
          <Link
            to="/menu"
            className="inline-flex h-[3.125rem] items-center rounded-full bg-primary px-6 text-[0.9375rem] font-semibold text-primary-foreground transition-transform hover:bg-primary/90 active:scale-[0.97] lg:h-14 lg:px-7 lg:text-base"
          >
            Lihat Menu
          </Link>
          <WhatsAppButton
            tone="outline"
            href={waLink("Halo Delisert, saya ingin memesan.")}
            className="lg:h-14 lg:px-7 lg:text-base"
          >
            Pesan via WhatsApp
          </WhatsAppButton>
        </div>
      </div>

      <div className="grid h-[19rem] grid-cols-[1.6fr_1fr] gap-2.5 sm:h-[26rem] lg:h-[35rem] lg:gap-4">
        <HeroMedia product={main} slug="mochi" className="h-full" parallax={1} />
        <div className="flex flex-col gap-2.5 pt-10 lg:gap-4 lg:pt-16">
          <HeroMedia product={second} slug="mango-sticky-rice" className="flex-[1.3]" parallax={2} />
          <HeroMedia product={third} slug="pancake-durian" className="flex-1" parallax={2} />
        </div>
      </div>
    </section>
  );
}

function HeroMedia({
  product,
  slug,
  className,
  parallax,
}: {
  product: Product | undefined;
  slug: string;
  className?: string;
  parallax: number;
}) {
  return (
    <div
      data-hero-media
      className={cn("relative overflow-hidden rounded-3xl lg:rounded-[2rem]", className)}
    >
      <div
        data-parallax={parallax}
        className="absolute inset-x-0"
        style={{ top: -parallaxOverscanPx(parallax), bottom: -parallaxOverscanPx(parallax) }}
      >
        {product?.imageUrl ? (
          <img
            src={product.imageUrl}
            srcSet={photoSrcSet(product.imageUrl)}
            sizes="(min-width: 1024px) 30vw, 60vw"
            alt={product.imageAlt ?? `Foto ${product.name} Delisert Makassar`}
            width={660}
            height={1080}
            fetchPriority="high"
            className="size-full object-cover"
          />
        ) : (
          // Lapisan parallax lebih tinggi dari wadah; label diberi jarak supaya tetap terlihat.
          <PhotoPlaceholder
            categorySlug={product?.category.slug ?? slug}
            style={{ paddingBottom: parallaxOverscanPx(parallax) + 12 }}
          />
        )}
      </div>
    </div>
  );
}

function ScheduleStrip() {
  return (
    <section aria-label="Jadwal jualan" className="cn-shell grid gap-2.5 pt-4 lg:grid-cols-2 lg:gap-5 lg:pt-0">
      <ScheduleCard
        tone="rosewood"
        icon={Play}
        eyebrow={TIKTOK_LIVE.label}
        title={`${TIKTOK_LIVE.days} · ${TIKTOK_LIVE.hours}`}
      />
      <ScheduleCard
        tone="cream"
        icon={Sun}
        eyebrow="CFD Minggu"
        title={`${CFD.hours} · Boulevard & UNHAS`}
      />
    </section>
  );
}

function Featured({ products }: { products: Product[] }) {
  return (
    <section className="flex flex-col gap-5 pt-14 lg:gap-7 lg:pt-24">
      <div className="cn-shell flex items-end justify-between gap-4">
        <SectionHeading eyebrow="Menu Andalan" title="Yang paling sering dipesan" />
        <Link
          to="/menu"
          className="hidden h-[2.875rem] shrink-0 items-center gap-2 rounded-full border border-border px-5.5 text-sm font-semibold text-foreground transition-colors hover:border-primary hover:text-primary sm:inline-flex"
        >
          Lihat semua menu <ArrowRight aria-hidden="true" className="size-4" />
        </Link>
      </div>

      {products.length === 0 ? (
        <p className="cn-shell text-sm text-muted-foreground">Katalog produk menyusul.</p>
      ) : (
        <ul className="cn-no-scrollbar flex snap-x snap-mandatory scroll-px-5 gap-3 overflow-x-auto px-5 pb-2 lg:cn-shell lg:grid lg:grid-cols-4 lg:gap-6 lg:overflow-visible lg:px-8">
          {products.map((product) => (
            <li key={product.id} className="w-[12.5rem] shrink-0 snap-start lg:w-auto">
              <ProductCard product={product} waHref={orderHref(product)} />
            </li>
          ))}
        </ul>
      )}

      <Link
        to="/menu"
        className="cn-shell inline-flex items-center gap-2 text-sm font-semibold text-primary sm:hidden"
      >
        Lihat semua menu <ArrowRight aria-hidden="true" className="size-4" />
      </Link>
    </section>
  );
}

function Categories({ categories }: { categories: Category[] }) {
  if (categories.length === 0) return null;
  return (
    <section className="cn-shell flex flex-col gap-5 pt-14 lg:gap-7 lg:pt-24">
      <SectionHeading eyebrow="Kategori" title="Pilih kategori" />

      {/* HP: chip ringkas. Desktop: ubin berwarna. */}
      <ul className="flex flex-wrap gap-2 lg:hidden">
        {categories.map((category) => (
          <li key={category.slug}>
            <Link
              to="/menu"
              search={{ category: category.slug }}
              className="inline-flex rounded-full bg-secondary px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
            >
              {category.name}
            </Link>
          </li>
        ))}
      </ul>

      <ul className="hidden grid-cols-6 gap-4 lg:grid">
        {categories.map((category) => (
          <li key={category.slug} data-reveal>
            <Link
              to="/menu"
              search={{ category: category.slug }}
              className={cn(
                "group flex h-56 flex-col justify-between rounded-3xl p-5 transition-transform duration-300 hover:-translate-y-1",
                categoryTint(category.slug),
              )}
            >
              <span className="text-xs font-medium text-foreground/60">
                {category.productCount} produk
              </span>
              <span className="flex items-end justify-between gap-2 text-lg leading-snug font-semibold text-foreground">
                {category.name}
                <ArrowRight
                  aria-hidden="true"
                  className="size-4 shrink-0 -translate-x-1 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100"
                />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Story() {
  return (
    <section className="cn-shell pt-14 pb-16 lg:pt-24 lg:pb-24">
      <div
        data-reveal
        className="grid gap-6 rounded-3xl bg-secondary p-5 lg:grid-cols-[420px_1fr] lg:items-center lg:gap-16 lg:rounded-[2.25rem] lg:p-14"
      >
        <div className="aspect-[4/3] overflow-hidden rounded-[1.25rem] lg:aspect-auto lg:h-80 lg:rounded-[1.75rem]">
          <PhotoPlaceholder categorySlug="mochi" />
        </div>
        <div className="flex flex-col gap-3 lg:gap-4">
          <span className="cn-eyebrow text-primary">Cerita kami</span>
          <h2 className="text-[1.75rem] leading-[1.15] font-semibold text-balance text-foreground lg:text-[2.5rem]">
            Dimulai dari satu mangkuk mochi di CFD Boulevard.
          </h2>
          <p className="text-[0.9375rem]/relaxed text-muted-foreground lg:text-[1.0625rem]/relaxed">
            Sejak 2021 dapur kecil kami di Makassar membuat dessert dalam batch terbatas, supaya
            setiap porsi tetap segar.
          </p>
          <Link
            to="/tentang"
            className="inline-flex w-fit items-center gap-2 pt-1 text-[0.9375rem] font-semibold text-primary"
          >
            Kenali Delisert <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
