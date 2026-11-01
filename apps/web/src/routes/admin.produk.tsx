import { AVAILABILITY_LABEL } from "@delisert.mks-1/ui/components/availability-badge";
import { PhotoPlaceholder } from "@delisert.mks-1/ui/components/photo-placeholder";
import { photoSrcSet } from "@delisert.mks-1/ui/lib/photo";
import { formatRupiah } from "@delisert.mks-1/ui/lib/price";
import { cn } from "@delisert.mks-1/ui/lib/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { ArrowDown, ArrowUp, Plus, Search } from "lucide-react";
import { useState } from "react";

import { type Availability, type StatusFilter, filterProducts } from "@/utils/admin-filter";
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

const STATUS_FILTERS: ReadonlyArray<{ value: StatusFilter; label: string }> = [
  { value: "all", label: "Semua" },
  { value: "available", label: AVAILABILITY_LABEL.available },
  { value: "preorder", label: AVAILABILITY_LABEL.preorder },
  { value: "soldout", label: AVAILABILITY_LABEL.soldout },
];

const DOT: Record<Availability, string> = {
  available: "bg-success",
  preorder: "bg-warning",
  soldout: "bg-muted-foreground/70",
};

function AdminProductList() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const products = useQuery(trpc.adminProduct.list.queryOptions());
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");

  const refresh = () => queryClient.invalidateQueries(trpc.adminProduct.list.queryFilter());

  const remove = useMutation(trpc.adminProduct.remove.mutationOptions({ onSuccess: refresh }));
  const setAvailability = useMutation(
    trpc.adminProduct.setAvailability.mutationOptions({ onSuccess: refresh }),
  );
  const move = useMutation(trpc.adminProduct.move.mutationOptions({ onSuccess: refresh }));

  // /admin/produk/$id dirender lewat <Outlet/> di sini. Saat editor terbuka,
  // tampilkan editornya saja — jangan di bawah seluruh daftar.
  const isEditing = useRouterState({
    select: (state) => state.location.pathname.replace(/\/$/, "") !== "/admin/produk",
  });
  if (isEditing) return <Outlet />;

  const rows = filterProducts(products.data ?? [], query, status);

  const confirmRemove = (id: number, name: string) => {
    if (window.confirm(`Hapus "${name}"? Produk akan hilang dari katalog publik.`)) {
      remove.mutate({ id });
    }
  };

  const availabilitySelect = (row: (typeof rows)[number]) => (
    <label className="relative inline-flex items-center">
      <span className="sr-only">Ketersediaan {row.name}</span>
      <span
        aria-hidden="true"
        className={cn("pointer-events-none absolute left-3 size-2 rounded-full", DOT[row.availability])}
      />
      <select
        value={row.availability}
        disabled={setAvailability.isPending}
        onChange={(event) =>
          setAvailability.mutate({ id: row.id, availability: event.target.value as Availability })
        }
        className="h-9 appearance-none rounded-full border border-border bg-background pr-8 pl-7 text-[0.8125rem] text-foreground"
      >
        {STATUS_FILTERS.filter((option) => option.value !== "all").map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <span aria-hidden="true" className="pointer-events-none absolute right-3 text-xs text-muted-foreground">
        ⌄
      </span>
    </label>
  );

  const thumb = (row: (typeof rows)[number], size: string) => (
    <span className={cn("shrink-0 overflow-hidden rounded-[0.875rem]", size)}>
      {row.thumbnailUrl ? (
        <img
          src={row.thumbnailUrl}
          srcSet={photoSrcSet(row.thumbnailUrl)}
          sizes="64px"
          alt=""
          width={64}
          height={64}
          className="size-full object-cover"
        />
      ) : (
        <PhotoPlaceholder label="" />
      )}
    </span>
  );

  const meta = (row: (typeof rows)[number]) =>
    [
      row.categoryName,
      row.variantCount > 0 ? `${row.variantCount} ukuran` : null,
      row.flavorCount > 0 ? `${row.flavorCount} rasa` : null,
      row.isFeatured ? "★ Unggulan" : null,
    ]
      .filter(Boolean)
      .join(" · ");

  const price = (cents: number | null) => (cents === null ? "Harga menyusul" : formatRupiah(cents));

  return (
    <div className="flex flex-col gap-4 lg:gap-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-[1.75rem] font-semibold text-foreground lg:text-[2.5rem]">Produk</h1>
        <Link
          to="/admin/produk/$id"
          params={{ id: "baru" }}
          className="inline-flex h-10 items-center gap-1.5 rounded-full bg-primary px-4 text-[0.8125rem] font-semibold text-primary-foreground lg:h-12 lg:px-5.5 lg:text-[0.9375rem]"
        >
          <Plus aria-hidden="true" className="size-4" />
          Tambah produk
        </Link>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <label className="relative flex h-11 items-center rounded-full border border-border bg-background px-4 focus-within:border-ring lg:w-[26rem]">
          <Search aria-hidden="true" className="size-4 text-muted-foreground" />
          <span className="sr-only">Cari nama produk</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Cari nama produk…"
            className="h-full min-w-0 flex-1 bg-transparent pl-2.5 text-sm outline-none placeholder:text-muted-foreground"
          />
        </label>
        <div role="group" aria-label="Filter ketersediaan" className="cn-no-scrollbar flex gap-2 overflow-x-auto">
          {STATUS_FILTERS.map((option) => (
            <button
              key={option.value}
              type="button"
              aria-pressed={status === option.value}
              onClick={() => setStatus(option.value)}
              className={cn(
                "shrink-0 rounded-full px-3.5 py-2 text-[0.8125rem] transition-colors lg:px-4 lg:py-2.5 lg:text-sm",
                status === option.value
                  ? "bg-foreground font-semibold text-background"
                  : "border border-border text-foreground hover:border-primary",
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {remove.isError || setAvailability.isError || move.isError ? (
        <p role="alert" className="text-sm text-destructive">
          Gagal menyimpan perubahan. Coba lagi.
        </p>
      ) : null}

      {products.isLoading ? (
        <p className="text-sm text-muted-foreground">Memuat produk…</p>
      ) : products.isError ? (
        // Gagal memuat ≠ katalog kosong: jangan sampai pemilik mengira semua produk hilang.
        <div role="alert" className="flex flex-col items-start gap-3 rounded-[1.125rem] bg-background p-6">
          <p className="text-sm text-destructive">
            Gagal memuat produk. Periksa koneksi, atau keluar lalu masuk lagi bila sesi sudah berakhir.
          </p>
          <button
            type="button"
            onClick={() => void products.refetch()}
            className="h-10 rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground"
          >
            Coba lagi
          </button>
        </div>
      ) : rows.length === 0 ? (
        <p className="rounded-[1.125rem] bg-background p-6 text-sm text-muted-foreground">
          {(products.data ?? []).length === 0
            ? "Belum ada produk. Tambahkan yang pertama."
            : "Tidak ada produk yang cocok dengan pencarian."}
        </p>
      ) : (
        <>
          {/* HP: kartu */}
          <ul className="flex flex-col gap-2.5 lg:hidden">
            {rows.map((row) => (
              <li key={row.id} className="flex items-center gap-3 rounded-[1.125rem] bg-background p-3">
                {thumb(row, "size-16")}
                <Link to="/admin/produk/$id" params={{ id: String(row.id) }} className="flex min-w-0 flex-1 flex-col gap-1">
                  <span className="truncate text-[0.9375rem] font-semibold text-foreground">{row.name}</span>
                  <span className="truncate text-[0.8125rem] text-muted-foreground">
                    {price(row.priceCents)}
                    {row.variantCount > 0 ? ` · ${row.variantCount} ukuran` : ""}
                    {row.flavorCount > 0 ? ` · ${row.flavorCount} rasa` : ""}
                  </span>
                  <span className="flex items-center gap-1.5 text-xs">
                    <span aria-hidden="true" className={cn("size-2 rounded-full", DOT[row.availability])} />
                    {AVAILABILITY_LABEL[row.availability]}
                  </span>
                </Link>
                <button
                  type="button"
                  onClick={() => confirmRemove(row.id, row.name)}
                  disabled={remove.isPending}
                  className="shrink-0 rounded-full px-2.5 py-1.5 text-xs text-destructive"
                >
                  Hapus
                </button>
              </li>
            ))}
          </ul>

          {/* Desktop: tabel */}
          <div className="hidden overflow-x-auto rounded-[1.375rem] bg-background px-6 py-2 lg:block">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border text-xs font-semibold text-muted-foreground uppercase">
                  <th scope="col" className="w-20 py-3.5 font-semibold">Foto</th>
                  <th scope="col" className="py-3.5 font-semibold">Produk</th>
                  <th scope="col" className="w-32 py-3.5 font-semibold xl:w-40">Harga</th>
                  <th scope="col" className="w-40 py-3.5 font-semibold xl:w-48">Ketersediaan</th>
                  <th scope="col" className="w-48 py-3.5 font-semibold xl:w-56">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map((row) => (
                  <tr key={row.id}>
                    <td className="py-3.5">{thumb(row, "size-16 block")}</td>
                    <td className="py-3.5">
                      <span className="block text-[0.9375rem] font-semibold text-foreground">{row.name}</span>
                      <span className="block text-[0.8125rem] text-muted-foreground">{meta(row)}</span>
                    </td>
                    <td className="py-3.5 text-[0.9375rem] font-semibold text-foreground">{price(row.priceCents)}</td>
                    <td className="py-3.5">{availabilitySelect(row)}</td>
                    <td className="py-3.5">
                      <span className="flex items-center gap-4 text-sm">
                        {/* Urutan hanya bermakna tanpa pencarian/filter: daftar penuh = urutan menu. */}
                        {query === "" && status === "all" ? (
                          <span className="flex">
                            <button
                              type="button"
                              disabled={move.isPending || row.id === rows[0]?.id}
                              onClick={() => move.mutate({ id: row.id, direction: "up" })}
                              className="flex size-8 items-center justify-center rounded-full text-muted-foreground hover:bg-secondary disabled:opacity-30"
                            >
                              <ArrowUp aria-hidden="true" className="size-4" />
                              <span className="sr-only">Naikkan {row.name}</span>
                            </button>
                            <button
                              type="button"
                              disabled={move.isPending || row.id === rows.at(-1)?.id}
                              onClick={() => move.mutate({ id: row.id, direction: "down" })}
                              className="flex size-8 items-center justify-center rounded-full text-muted-foreground hover:bg-secondary disabled:opacity-30"
                            >
                              <ArrowDown aria-hidden="true" className="size-4" />
                              <span className="sr-only">Turunkan {row.name}</span>
                            </button>
                          </span>
                        ) : null}
                        <Link
                          to="/admin/produk/$id"
                          params={{ id: String(row.id) }}
                          className="font-semibold text-primary"
                        >
                          Ubah
                          <span className="sr-only"> {row.name}</span>
                        </Link>
                        <button
                          type="button"
                          onClick={() => confirmRemove(row.id, row.name)}
                          disabled={remove.isPending}
                          className="text-destructive disabled:opacity-60"
                        >
                          Hapus
                          <span className="sr-only"> {row.name}</span>
                        </button>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
