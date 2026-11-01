import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { useTRPC } from "@/utils/trpc";
import { formatRupiah } from "@delisert.mks-1/ui/lib/price";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [{ title: "Ringkasan Admin — Delisert" }, { name: "robots", content: "noindex, nofollow" }],
  }),
  component: AdminDashboard,
});

const AVAILABILITY_LABEL: Record<string, string> = {
  available: "Tersedia",
  preorder: "Pre-Order",
  soldout: "Habis",
};

function AdminDashboard() {
  const trpc = useTRPC();
  const products = useQuery(trpc.adminProduct.list.queryOptions());
  const rows = products.data ?? [];

  const featured = rows.filter((row) => row.isFeatured).length;
  const soldOut = rows.filter((row) => row.availability === "soldout").length;
  const withoutPhoto = rows.filter((row) => !row.imageUrl).length;

  return (
    <div className="flex flex-col gap-8">
      {products.isLoading ? (
        <p className="text-sm text-muted-foreground">Memuat ringkasan…</p>
      ) : null}

      {products.isError ? (
        <p role="alert" className="text-sm text-destructive">
          Gagal memuat data. Coba muat ulang halaman.
        </p>
      ) : null}

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Total produk" value={rows.length} />
        <Stat label="Produk unggulan" value={featured} />
        <Stat label="Stok habis" value={soldOut} />
        <Stat label="Belum ada foto" value={withoutPhoto} />
      </ul>

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl leading-snug">Produk terbaru</h2>
          <Link
            to="/admin/produk"
            className="text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            Kelola semua produk →
          </Link>
        </div>

        {rows.length === 0 && !products.isLoading ? (
          <p className="text-sm text-muted-foreground">Belum ada produk.</p>
        ) : (
          <ul className="flex flex-col divide-y divide-border border-y border-border">
            {rows.slice(0, 5).map((row) => (
              <li key={row.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <span className="flex flex-col">
                  <span className="text-sm font-medium">{row.name}</span>
                  <span className="text-xs text-muted-foreground">{row.slug}</span>
                </span>
                <span className="flex items-center gap-4 text-sm">
                  <span className="text-primary">
                    {row.priceCents === null ? "Harga menyusul" : formatRupiah(row.priceCents)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {AVAILABILITY_LABEL[row.availability] ?? row.availability}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <li className="flex flex-col gap-1 border border-border p-5">
      <span className="cn-eyebrow text-muted-foreground">{label}</span>
      <span className="text-3xl font-medium text-primary">{value}</span>
    </li>
  );
}
