import { waLink } from "@delisert.mks-1/api/data/business";
import { ProductCard } from "@delisert.mks-1/ui/components/product-card";
import { SectionHeading } from "@delisert.mks-1/ui/components/section-heading";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useMemo } from "react";
import { z } from "zod";

import { useTRPC } from "@/utils/trpc";
import { canonical } from "@/utils/seo";

const menuSearchSchema = z.object({
  category: z.string().optional().catch(undefined),
});

export const Route = createFileRoute("/menu")({
  validateSearch: menuSearchSchema,
  loader: async ({ context }) => {
    const [products, categories] = await Promise.all([
      context.queryClient.fetchQuery(context.trpc.product.list.queryOptions()),
      context.queryClient.fetchQuery(context.trpc.product.categories.queryOptions()),
    ]);
    return { products, categories };
  },
  head: () => ({
    meta: [
      { title: "Menu Delisert — Mochi, Pancake Durian, Mille Crepes & Dessert Makassar" },
      {
        name: "description",
        content:
          "Katalog lengkap Delisert Makassar: mochi, pancake durian, mango sticky rice, Dubai chewy cookie, slice cake, dan mille crepes. Lihat harga dan pesan via WhatsApp.",
      },
      {
        property: "og:title",
        content: "Menu Delisert — Mochi, Pancake Durian, Mille Crepes & Dessert Makassar",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: canonical("/menu") },
    ],
    links: [{ rel: "canonical", href: canonical("/menu") }],
  }),
  component: MenuComponent,
});

function MenuComponent() {
  const trpc = useTRPC();
  const navigate = useNavigate({ from: "/menu" });
  const search = useSearch({ from: "/menu" });
  const activeCategory = search.category;

  const products = useQuery(trpc.product.list.queryOptions());
  const categories = useQuery(trpc.product.categories.queryOptions());
  // Data loader dipakai untuk render pertama (SSR) dan saat hydration belum selesai.
  const initial = Route.useLoaderData();

  const allProducts = products.data ?? initial.products;
  const allCategories = categories.data ?? initial.categories;

  const filtered = useMemo(
    () =>
      activeCategory
        ? allProducts.filter((product) => product.category.slug === activeCategory)
        : allProducts,
    [allProducts, activeCategory],
  );

  const setCategory = (slug: string | undefined) => {
    navigate({ search: (prev) => ({ ...prev, category: slug }), replace: true });
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
      <SectionHeading
        eyebrow="Menu"
        title="Katalog produk Delisert."
        description="Harga dapat berubah mengikuti musim buah. Ketersediaan setiap batch dipastikan ulang melalui WhatsApp sebelum pesanan diproses."
        as="h1"
      />

      <div className="flex flex-wrap items-center gap-2 pt-10">
        <FilterChip active={!activeCategory} onClick={() => setCategory(undefined)}>
          Semua
        </FilterChip>
        {allCategories.map((category) => (
          <FilterChip
            key={category.slug}
            active={activeCategory === category.slug}
            onClick={() => setCategory(category.slug)}
          >
            {category.name}
          </FilterChip>
        ))}
      </div>

      {products.isLoading ? (
        <p className="pt-16 text-sm text-muted-foreground">Memuat katalog…</p>
      ) : filtered.length === 0 ? (
        <div className="mt-10 flex flex-col items-center gap-4 border border-dashed border-border p-12 text-center">
          <h2 className="text-lg">Belum ada produk pada kategori ini.</h2>
          <p className="max-w-md text-sm/relaxed text-muted-foreground">
            Katalog kategori ini sedang disiapkan. Silakan lihat kategori lain atau tanyakan
            langsung ketersediaannya melalui WhatsApp.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => setCategory(undefined)}
              className="text-sm font-medium text-primary underline-offset-4 hover:underline"
            >
              Lihat semua produk
            </button>
            <a
              href={waLink("Halo Delisert, apakah produk ini tersedia?")}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-primary underline-offset-4 hover:underline"
            >
              Tanya via WhatsApp
            </a>
          </div>
        </div>
      ) : (
        <ul className="grid gap-6 pt-10 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((product) => (
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

      <div className="mt-16 flex flex-col items-start gap-4 border border-border bg-secondary/30 p-8 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg">Tidak menemukan yang dicari?</h2>
          <p className="text-sm/relaxed text-muted-foreground">
            Tanyakan ketersediaan batch hari ini langsung melalui WhatsApp.
          </p>
        </div>
        <a
          href={waLink("Halo Delisert, saya ingin bertanya tentang ketersediaan produk.")}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-9 shrink-0 items-center border border-primary bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Chat via WhatsApp
        </a>
      </div>

      <p className="pt-8 text-sm text-muted-foreground">
        Ingin tahu cara memesan?{" "}
        <Link to="/kontak" className="text-primary underline-offset-4 hover:underline">
          Lihat halaman Kontak & Pesan
        </Link>
        .
      </p>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={
        active
          ? "border border-primary bg-primary px-3.5 py-1.5 text-sm font-medium text-primary-foreground"
          : "border border-border bg-background px-3.5 py-1.5 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-primary"
      }
    >
      {children}
    </button>
  );
}
