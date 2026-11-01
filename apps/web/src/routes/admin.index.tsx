import { AvailabilityBadge } from "@delisert.mks-1/ui/components/availability-badge";
import { PhotoPlaceholder } from "@delisert.mks-1/ui/components/photo-placeholder";
import { photoSrcSet } from "@delisert.mks-1/ui/lib/photo";
import { formatRupiah } from "@delisert.mks-1/ui/lib/price";
import { cn } from "@delisert.mks-1/ui/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Plus } from "lucide-react";

import { useTRPC } from "@/utils/trpc";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [{ title: "Ringkasan Admin — Delisert" }, { name: "robots", content: "noindex, nofollow" }],
  }),
  component: AdminDashboard,
});

function AdminDashboard() {
  const trpc = useTRPC();
  const products = useQuery(trpc.adminProduct.list.queryOptions());
  const rows = products.data ?? [];

  const featured = rows.filter((row) => row.isFeatured).length;
  const soldOut = rows.filter((row) => row.availability === "soldout").length;
  const withoutPhoto = rows.filter((row) => !row.imageUrl).length;

  return (
    <div className="flex flex-col gap-5 lg:gap-7">
      <div className="flex items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <span className="hidden text-sm text-muted-foreground lg:block">Selamat datang kembali</span>
          <h1 className="text-[1.75rem] font-semibold text-foreground lg:text-[2.5rem]">
            <span className="lg:hidden">Ringkasan</span>
            <span className="hidden lg:inline">Ringkasan katalog</span>
          </h1>
        </div>
        <Link
          to="/admin/produk/$id"
          params={{ id: "baru" }}
          className="inline-flex size-10 items-center justify-center gap-2 rounded-full bg-primary text-[0.9375rem] font-semibold text-primary-foreground lg:h-12 lg:w-auto lg:px-5.5"
        >
          <Plus aria-hidden="true" className="size-5 lg:size-4" />
          <span className="sr-only lg:not-sr-only">Tambah produk</span>
        </Link>
      </div>

      {products.isError ? (
        <p role="alert" className="text-sm text-destructive">
          Gagal memuat data. Coba muat ulang halaman.
        </p>
      ) : null}

      <ul className="grid grid-cols-2 gap-2.5 lg:grid-cols-4 lg:gap-4">
        <Stat label="Total produk" value={rows.length} loading={products.isLoading} />
        <Stat label="Produk unggulan" value={featured} loading={products.isLoading} />
        <Stat label="Stok habis" value={soldOut} loading={products.isLoading} />
        <Stat
          label="Belum ada foto"
          value={withoutPhoto}
          loading={products.isLoading}
          highlight={withoutPhoto > 0}
          action={
            withoutPhoto > 0 ? (
              <Link to="/admin/produk" className="text-[0.8125rem] font-semibold text-primary">
                Lengkapi foto →
              </Link>
            ) : null
          }
        />
      </ul>

      <section className="flex flex-col rounded-[1.125rem] bg-background p-4 lg:rounded-[1.375rem] lg:p-6">
        <div className="flex items-center justify-between gap-4 pb-2 lg:pb-3">
          <h2 className="font-sans text-base font-semibold text-foreground lg:text-xl">Produk terbaru</h2>
          <Link
            to="/admin/produk"
            className="hidden items-center gap-1.5 text-sm font-semibold text-primary lg:inline-flex"
          >
            Kelola semua produk <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        </div>
        {rows.length === 0 && !products.isLoading ? (
          <p className="py-6 text-sm text-muted-foreground">Belum ada produk. Tambahkan yang pertama.</p>
        ) : (
          <ul className="flex flex-col divide-y divide-border">
            {rows.slice(0, 5).map((row) => (
              <li key={row.id}>
                <Link
                  to="/admin/produk/$id"
                  params={{ id: String(row.id) }}
                  className="flex items-center gap-3 py-2.5 lg:gap-4 lg:py-3"
                >
                  <span className="size-11 shrink-0 overflow-hidden rounded-xl lg:size-12">
                    {row.imageUrl ? (
                      <img
                        src={row.imageUrl}
                        srcSet={photoSrcSet(row.imageUrl)}
                        sizes="48px"
                        alt=""
                        width={48}
                        height={48}
                        className="size-full object-cover"
                      />
                    ) : (
                      <PhotoPlaceholder label="" />
                    )}
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-sm font-semibold text-foreground lg:text-[0.9375rem]">
                      {row.name}
                    </span>
                    <span className="truncate text-xs text-muted-foreground lg:text-[0.8125rem]">
                      <span className="lg:hidden">
                        {row.priceCents === null ? "Harga menyusul" : formatRupiah(row.priceCents)}
                      </span>
                      <span className="hidden lg:inline">
                        {row.categoryName}
                        {row.variantCount > 0 ? ` · ${row.variantCount} varian` : ""}
                      </span>
                    </span>
                  </span>
                  <span className="hidden w-44 text-[0.9375rem] font-semibold text-foreground lg:block">
                    {row.priceCents === null ? "Harga menyusul" : formatRupiah(row.priceCents)}
                  </span>
                  <AvailabilityBadge availability={row.availability} className="bg-muted" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Stat({
  label,
  value,
  loading,
  highlight = false,
  action,
}: {
  label: string;
  value: number;
  loading: boolean;
  highlight?: boolean;
  action?: React.ReactNode;
}) {
  return (
    <li
      className={cn(
        "flex flex-col gap-1.5 rounded-[1.125rem] p-4 lg:gap-2.5 lg:rounded-[1.375rem] lg:p-6",
        highlight ? "border border-accent bg-[#fff4e0]" : "bg-background",
      )}
    >
      <span className={cn("text-xs lg:text-sm", highlight ? "text-[#7a5a1e]" : "text-muted-foreground")}>
        {label}
      </span>
      <span
        className={cn(
          "cn-font-display text-[2rem] leading-none font-semibold lg:text-[2.75rem]",
          highlight ? "text-[#7a5a1e]" : "text-foreground",
        )}
      >
        {loading ? "–" : value}
      </span>
      {action}
    </li>
  );
}
