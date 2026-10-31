import { CFD, SOCIAL_MEDIA, TIKTOK_LIVE, waLink } from "@delisert.mks-1/api/data/business";
import type { RouterOutputs } from "@delisert.mks-1/api/routers/index";
import { ProductCard } from "@delisert.mks-1/ui/components/product-card";
import { SectionHeading } from "@delisert.mks-1/ui/components/section-heading";
import { SocialLinks } from "@delisert.mks-1/ui/components/social-links";
import { WhatsAppButton } from "@delisert.mks-1/ui/components/whatsapp-button";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarDays, MapPin, Music2, Sparkles } from "lucide-react";

import { useTRPC } from "@/utils/trpc";
import { canonical } from "@/utils/seo";

type Product = RouterOutputs["product"]["list"][number];
type Category = RouterOutputs["product"]["categories"][number];

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      {
        title: "Delisert — Mochi & Dessert Makassar | Sejak 2021",
      },
      {
        property: "og:title",
        content: "Delisert — Mochi & Dessert Makassar | Sejak 2021",
      },
      {
        property: "og:description",
        content:
          "Dessert dan makanan homemade Makassar sejak 2021. Mochi, pancake durian, mango sticky rice, mille crepes, Dubai chewy cookie, dan slice cake.",
      },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: canonical("/") }],
  }),
  component: HomeComponent,
});

function HomeComponent() {
  const trpc = useTRPC();
  const featured = useQuery(trpc.product.list.queryOptions({ featuredOnly: true }));
  const categories = useQuery(trpc.product.categories.queryOptions());

  const featuredProducts = (featured.data ?? []).slice(0, 4);

  return (
    <div className="flex flex-col">
      <HeroSection />
      <BrandIntroSection />
      <FeaturedProductsSection products={featuredProducts} isLoading={featured.isLoading} />
      <CategoriesSection categories={categories.data ?? []} />
      <BrandStorySection />
      <TikTokLiveSection />
      <CfdSection />
      <SocialSection />
    </div>
  );
}

function HeroSection() {
  return (
    <section className="border-b border-border bg-secondary/40">
      <div className="mx-auto grid max-w-6xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16 lg:px-8 lg:py-28">
        <div className="flex flex-col gap-6">
          <span className="cn-eyebrow text-primary">Dessert Makassar · Sejak 2021</span>
          <h1 className="text-4xl leading-[1.08] text-balance sm:text-5xl lg:text-6xl">
            Mochi dan dessert artisan dari dapur Makassar.
          </h1>
          <p className="max-w-xl text-base/relaxed text-muted-foreground sm:text-lg/relaxed">
            Delisert membuat mochi, pancake durian, mango sticky rice, mille crepes, dan kue
            artisanal lainnya dalam batch terbatas. Setiap pesanan disiapkan segar dan diantar
            langsung ke pintu Anda.
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <WhatsAppButton size="lg" href={waLink("Halo Delisert, saya ingin memesan.")}>
              Pesan via WhatsApp
            </WhatsAppButton>
            <Link
              to="/menu"
              className="inline-flex h-9 items-center border border-border bg-background px-4 text-sm font-medium transition-colors hover:border-primary hover:text-primary"
            >
              Lihat Menu
            </Link>
          </div>
        </div>

        <div className="relative">
          <div className="aspect-4/5 w-full overflow-hidden border border-border bg-muted">
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-secondary via-background to-secondary text-muted-foreground">
              <span className="text-sm">Foto produk utama menyusul</span>
            </div>
          </div>
          <div className="absolute -bottom-4 -left-4 hidden border border-border bg-background px-5 py-4 shadow-lg shadow-primary/5 sm:block">
            <p className="cn-eyebrow text-muted-foreground">Produk anchor</p>
            <p className="cn-font-display text-lg text-primary">Artisanal Mochi Daifuku</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function BrandIntroSection() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
        <SectionHeading
          eyebrow="Tentang Delisert"
          title="Sebuah dapur kecil yang serius soal rasa."
        />
        <div className="flex flex-col gap-5 text-base/relaxed text-muted-foreground">
          <p>
            Delisert berdiri pada 2021 di Makassar dengan satu produk andalan: mochi. Dari situ
            lini produk tumbuh menjadi rangkaian dessert dan kue artisanal yang tetap dibuat dalam
            jumlah terbatas setiap hari.
          </p>
          <p>
            Kami bekerja dari dapur operasional di Borong, Manggala, Makassar. Pesanan diterima
            melalui WhatsApp, lalu disiapkan untuk diambil langsung atau dikirim melalui layanan
            pengiriman yang tersedia.
          </p>
          <Link
            to="/tentang"
            className="text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            Baca cerita lengkapnya →
          </Link>
        </div>
      </div>
    </section>
  );
}

function FeaturedProductsSection({
  products,
  isLoading,
}: {
  products: Product[];
  isLoading: boolean;
}) {
  return (
    <section className="border-y border-border bg-secondary/30">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading
            eyebrow="Menu Andalan"
            title="Produk yang paling dicari."
            description="Batch terbatas, dibuat segar. Harga dapat berubah mengikuti musra buah."
          />
          <Link
            to="/menu"
            className="text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            Lihat semua menu →
          </Link>
        </div>

        {isLoading ? (
          <p className="pt-10 text-sm text-muted-foreground">Memuat produk…</p>
        ) : products.length === 0 ? (
          <p className="pt-10 text-sm text-muted-foreground">Katalog produk menyusul.</p>
        ) : (
          <ul className="grid gap-6 pt-10 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => (
              <li key={product.id} className="flex">
                <ProductCard
                  product={product}
                  waHref={waLink(
                    `Halo Delisert, saya ingin memesan ${product.name}. Apakah masih tersedia?`,
                  )}
                  className="w-full"
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

function CategoriesSection({ categories }: { categories: Category[] }) {
  return (
    <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="Kategori"
        title="Enam lini dessert, satu standar rasa."
        align="center"
        className="mx-auto items-center"
      />

      {categories.length === 0 ? (
        <p className="pt-10 text-center text-sm text-muted-foreground">Kategori menyusul.</p>
      ) : (
        <ul className="grid gap-4 pt-10 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <li key={category.slug}>
              <Link
                to="/menu"
                search={{ category: category.slug }}
                className="group flex h-full flex-col gap-2 border border-border p-6 transition-colors hover:border-primary hover:bg-primary/5"
              >
                <span className="flex items-center gap-2 text-primary">
                  <Sparkles className="size-4" aria-hidden="true" />
                  <span className="cn-eyebrow">{category.name}</span>
                </span>
                <span className="text-sm/relaxed text-muted-foreground">
                  {category.description ?? "Kategori produk Delisert."}
                </span>
                <span className="mt-auto pt-2 text-xs text-muted-foreground/80">
                  {category.productCount} produk
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function BrandStorySection() {
  return (
    <section className="border-y border-border bg-primary text-primary-foreground">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
        <div className="flex flex-col gap-5">
          <span className="cn-eyebrow opacity-70">Cerita Merek</span>
          <h2 className="text-3xl leading-tight text-balance sm:text-4xl">
            Dimulai dari satu mangkuk mochi di Jalan Boulevard.
          </h2>
        </div>
        <div className="flex flex-col gap-5 text-base/relaxed opacity-90">
          <p>
            Delisert tumbuh dari aktivitas Car Free Day di Makassar — berdiri sepanjang Jalan
            Boulevard dengan satu produk: mochi buatan sendiri. Permintaan yang terus datang membuat
            dapur ini berkembang menjadi lini dessert yang lebih lengkap.
          </p>
          <p>
            Sampai hari ini, aktivitas Minggu di CFD tetap menjadi bagian dari rutinitas kami.
            Sisanya disiapkan untuk pesanan WhatsApp dan pengiriman ke seluruh Makassar.
          </p>
          <Link
            to="/tentang"
            className="text-sm font-medium underline underline-offset-4 hover:opacity-80"
          >
            Kenali Delisert lebih dekat →
          </Link>
        </div>
      </div>
    </section>
  );
}

function TikTokLiveSection() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="grid gap-10 border border-border p-8 sm:p-12 lg:grid-cols-[1fr_auto] lg:items-center lg:gap-16">
        <div className="flex flex-col gap-4">
          <span className="flex items-center gap-2 text-primary">
            <Music2 className="size-4" aria-hidden="true" />
            <span className="cn-eyebrow">{TIKTOK_LIVE.label}</span>
          </span>
          <h2 className="text-3xl leading-tight text-balance sm:text-4xl">
            {TIKTOK_LIVE.days}, {TIKTOK_LIVE.hours}
          </h2>
          <p className="max-w-xl text-base/relaxed text-muted-foreground">
            Ikuti sesi live Delisert untuk melihat produk terbaru, batch harian, dan promo yang
            diumumkan langsung. Jadwal bersifat statis — status live ditampilkan di aplikasi TikTok.
          </p>
        </div>
        <WhatsAppButton variant="outline" size="lg" href={TIKTOK_LIVE.ctaUrl}>
          {TIKTOK_LIVE.ctaLabel}
        </WhatsAppButton>
      </div>
    </section>
  );
}

function CfdSection() {
  return (
    <section className="border-t border-border bg-secondary/30">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <div className="flex flex-col gap-5">
            <span className="flex items-center gap-2 text-primary">
              <CalendarDays className="size-4" aria-hidden="true" />
              <span className="cn-eyebrow">Aktivitas Minggu</span>
            </span>
            <h2 className="text-3xl leading-tight text-balance sm:text-4xl">
              Car Free Day, setiap hari Minggu.
            </h2>
            <p className="text-base/relaxed text-muted-foreground">{CFD.description}</p>
            <Link
              to="/jadwal"
              className="text-sm font-medium text-primary underline-offset-4 hover:underline"
            >
              Lihat jadwal & lokasi lengkap →
            </Link>
          </div>

          <ul className="grid gap-4 sm:grid-cols-2">
            {CFD.locations.map((location) => (
              <li
                key={location.id}
                className="flex flex-col gap-2 border border-border bg-background p-6"
              >
                <span className="flex items-center gap-2 text-primary">
                  <MapPin className="size-4" aria-hidden="true" />
                  <span className="cn-eyebrow">{location.name}</span>
                </span>
                <span className="text-sm/relaxed text-muted-foreground">{location.landmark}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function SocialSection() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="flex flex-col items-center gap-6 text-center">
        <SectionHeading
          eyebrow="Ikuti Kami"
          title="Update harian ada di media sosial."
          description="Batch baru, menu musiman, dan pengumuman jadwal diumumkan lebih dulu di Instagram dan TikTok."
          align="center"
        />
        <SocialLinks items={SOCIAL_MEDIA} />
      </div>
    </section>
  );
}
