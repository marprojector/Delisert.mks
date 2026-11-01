import { productOrderMessage, waLink } from "@delisert.mks-1/api/data/business";
import { CategoryChips } from "@delisert.mks-1/ui/components/category-chips";
import { EmptyState } from "@delisert.mks-1/ui/components/empty-state";
import { ProductCard } from "@delisert.mks-1/ui/components/product-card";
import { WhatsAppButton } from "@delisert.mks-1/ui/components/whatsapp-button";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useMemo, useRef } from "react";
import { z } from "zod";

import { useReveal } from "@/lib/motion";

import { useTRPC } from "@/utils/trpc";
import { canonical } from "@/utils/seo";

const menuSearchSchema = z.object({
  category: z.string().optional().catch(undefined),
});

export const Route = createFileRoute("/menu/")({
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
  const navigate = useNavigate({ from: "/menu/" });
  const search = useSearch({ from: "/menu/" });
  const activeCategory = search.category;

  const products = useQuery(trpc.product.list.queryOptions());
  const categories = useQuery(trpc.product.categories.queryOptions());
  // Data loader dipakai untuk render pertama (SSR) dan sebelum hydration selesai.
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

  const activeName = allCategories.find((category) => category.slug === activeCategory)?.name;

  const setCategory = (slug?: string) => {
    void navigate({ search: (prev) => ({ ...prev, category: slug }), replace: true, resetScroll: false });
  };

  const pageRef = useRef<HTMLDivElement>(null);
  // Animasi masuk diulang setiap kali filter berganti.
  useReveal(pageRef, [activeCategory]);

  return (
    <div ref={pageRef} data-motion-scope className="cn-shell flex flex-col gap-4 pt-4 pb-16 lg:gap-7 lg:pt-12 lg:pb-24">
      <div className="flex flex-col gap-1.5 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-col gap-1.5 lg:gap-2.5">
          <h1 className="text-4xl font-semibold text-foreground lg:text-[4rem] lg:leading-none">Menu</h1>
          <p className="text-sm text-muted-foreground lg:text-[1.0625rem]">
            {activeName
              ? `${filtered.length} produk di ${activeName}`
              : `${filtered.length} produk · harga per porsi`}
          </p>
        </div>
        <p className="hidden text-sm text-muted-foreground lg:block">
          Dibuat dalam batch harian terbatas · pesan via WhatsApp
        </p>
      </div>

      <CategoryChips items={allCategories} active={activeCategory} onSelect={setCategory} />

      {filtered.length === 0 ? (
        <EmptyState
          className="mt-4"
          title="Belum ada produk di sini"
          description="Tanya stok batch berikutnya."
          action={
            <WhatsAppButton
              size="sm"
              href={waLink(
                `Halo Delisert, apakah ada ${activeName ?? "produk"} untuk batch berikutnya?`,
              )}
            >
              Tanya stok via WhatsApp
            </WhatsAppButton>
          }
          secondary={
            <button
              type="button"
              onClick={() => setCategory(undefined)}
              className="text-sm font-semibold text-primary"
            >
              Lihat semua menu
            </button>
          }
        />
      ) : (
        <ul
          key={activeCategory ?? "semua"}
          className="grid grid-cols-2 gap-x-3.5 gap-y-6 pt-2 sm:grid-cols-3 lg:grid-cols-4 lg:gap-x-6 lg:gap-y-10"
        >
          {filtered.map((product) => (
            <li key={product.id} className="min-w-0">
              <ProductCard
                product={product}
                waHref={waLink(productOrderMessage({ productName: product.name }))}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
