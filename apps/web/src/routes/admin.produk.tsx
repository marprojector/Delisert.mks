import { formatRupiah } from "@delisert.mks-1/ui/lib/price";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, Outlet } from "@tanstack/react-router";

import { useTRPC } from "@/utils/trpc";

export const Route = createFileRoute("/admin/produk")({
  head: () => ({
    meta: [
      { title: "Produk Admin — Delisert" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminProductList,
});

const AVAILABILITY_LABEL: Record<string, string> = {
  available: "Tersedia",
  preorder: "Pre-Order",
  soldout: "Habis",
};

function AdminProductList() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const products = useQuery(trpc.adminProduct.list.queryOptions());

  const remove = useMutation(
    trpc.adminProduct.remove.mutationOptions({
      onSuccess: () => queryClient.invalidateQueries(trpc.adminProduct.list.queryFilter()),
    }),
  );

  const rows = products.data ?? [];

  return (
    <>
      <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl leading-snug">Semua produk</h2>
        <Link
          to="/admin/produk/$id"
          params={{ id: "baru" }}
          className="inline-flex h-9 items-center border border-primary bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Tambah produk
        </Link>
      </div>

      {remove.isError ? (
        <p role="alert" className="text-sm text-destructive">
          Gagal menghapus produk. Coba lagi.
        </p>
      ) : null}

      {products.isLoading ? (
        <p className="text-sm text-muted-foreground">Memuat produk…</p>
      ) : rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">Belum ada produk. Tambahkan yang pertama.</p>
      ) : (
        <ul className="flex flex-col divide-y divide-border border-y border-border">
          {rows.map((row) => (
            <li key={row.id} className="flex flex-wrap items-center justify-between gap-4 py-4">
              <div className="flex min-w-0 flex-col gap-0.5">
                <span className="truncate text-sm font-medium">{row.name}</span>
                <span className="text-xs text-muted-foreground">
                  {row.slug} · {AVAILABILITY_LABEL[row.availability] ?? row.availability}
                  {row.isFeatured ? " · Unggulan" : ""}
                </span>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-sm text-primary">
                  {row.priceCents === null ? "Harga menyusul" : formatRupiah(row.priceCents)}
                </span>
                <Link
                  to="/admin/produk/$id"
                  params={{ id: String(row.id) }}
                  className="text-sm font-medium text-primary underline-offset-4 hover:underline"
                >
                  Ubah
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    if (
                      window.confirm(
                        `Hapus "${row.name}"? Produk akan hilang dari katalog publik.`,
                      )
                    ) {
                      remove.mutate({ id: row.id });
                    }
                  }}
                  disabled={remove.isPending}
                  className="text-sm text-destructive underline-offset-4 hover:underline disabled:opacity-60"
                >
                  Hapus
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
      </div>
      <Outlet />
    </>
  );
}
