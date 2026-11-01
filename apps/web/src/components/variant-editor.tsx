import { formatRupiah } from "@delisert.mks-1/ui/lib/price";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import { useState } from "react";

import { Toggle } from "@/components/admin/toggle";
import { rupiahToCents } from "@/utils/admin-client";

import { useTRPC } from "@/utils/trpc";

/**
 * Editor varian untuk satu produk. Dipisah dari editor produk supaya tiap
 * perubahan varian langsung tersimpan (produk harus sudah ada lebih dulu).
 */
export function VariantEditor({ productId }: { productId: number }) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const detail = useQuery(trpc.adminProduct.byId.queryOptions({ id: productId }));
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [error, setError] = useState<string | null>(null);

  const refresh = () => {
    void queryClient.invalidateQueries(trpc.adminProduct.byId.queryFilter({ id: productId }));
    void queryClient.invalidateQueries(trpc.adminProduct.list.queryFilter());
  };

  const add = useMutation(
    trpc.adminProduct.addVariant.mutationOptions({
      onSuccess: () => {
        setName("");
        setPrice("");
        setError(null);
        refresh();
      },
      onError: () => setError("Gagal menambah varian."),
    }),
  );

  const remove = useMutation(
    trpc.adminProduct.removeVariant.mutationOptions({
      onSuccess: refresh,
      onError: () => setError("Gagal menghapus varian."),
    }),
  );

  const toggle = useMutation(
    trpc.adminProduct.updateVariant.mutationOptions({
      onSuccess: refresh,
      onError: () => setError("Gagal mengubah ketersediaan varian."),
    }),
  );

  const variants = detail.data?.variants ?? [];

  const submitVariant = () => {
    if (!name.trim()) return setError("Nama varian wajib diisi.");
    add.mutate({
      productId,
      name: name.trim(),
      priceCents: rupiahToCents(price),
      isAvailable: true,
      displayOrder: variants.length + 1,
    });
  };

  return (
    <section className="flex flex-col gap-3 rounded-[1.25rem] bg-background p-4.5 lg:gap-3.5 lg:rounded-[1.375rem] lg:p-7">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-sans text-base font-semibold text-foreground lg:text-lg">Varian</h2>
        <span className="text-xs text-muted-foreground lg:text-[0.8125rem]">Tersimpan otomatis</span>
      </div>
      <p className="text-[0.8125rem]/relaxed text-muted-foreground">
        Pilihan ukuran atau rasa. Matikan sakelar bila varian sedang habis.
      </p>

      {variants.length === 0 ? (
        <p className="rounded-2xl bg-muted px-4 py-3 text-sm text-muted-foreground">Belum ada varian.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {variants.map((variant) => (
            <li
              key={variant.id}
              className="flex items-center gap-3 rounded-2xl border border-border px-3.5 py-3"
            >
              <span className="flex min-w-0 flex-1 flex-col xl:flex-row xl:items-center xl:gap-6">
                <span
                  className={
                    variant.isAvailable
                      ? "truncate text-sm font-semibold text-foreground xl:w-60 lg:text-[0.9375rem]"
                      : "truncate text-sm font-semibold text-muted-foreground line-through xl:w-60 lg:text-[0.9375rem]"
                  }
                >
                  {variant.name}
                </span>
                <span className="text-[0.8125rem] text-muted-foreground lg:text-[0.9375rem] lg:text-foreground">
                  {variant.priceCents === null ? "Harga menyusul" : formatRupiah(variant.priceCents)}
                </span>
              </span>
              <Toggle
                checked={variant.isAvailable}
                disabled={toggle.isPending}
                label={`${variant.name} tersedia`}
                onChange={(isAvailable) => toggle.mutate({ id: variant.id, isAvailable })}
              />
              <button
                type="button"
                onClick={() => {
                  if (window.confirm(`Hapus varian "${variant.name}"?`)) remove.mutate({ id: variant.id });
                }}
                className="flex size-9 shrink-0 items-center justify-center rounded-full text-destructive transition-colors hover:bg-destructive/10 sm:size-auto sm:px-1 sm:text-[0.8125rem]"
              >
                <Trash2 aria-hidden="true" className="size-4 sm:hidden" />
                <span className="sr-only sm:not-sr-only">Hapus</span>
                <span className="sr-only"> varian {variant.name}</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Bukan <form>: editor ini berada di dalam form produk. */}
      {/* Kolom kiri editor sempit di 1024–1280px: susun bertumpuk sampai xl. */}
      <div className="flex flex-col gap-2 pt-1 sm:flex-row lg:flex-col xl:flex-row">
        <label className="flex-1">
          <span className="sr-only">Nama varian baru</span>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                submitVariant();
              }
            }}
            placeholder="Nama varian, mis. Isi 12 pcs"
            className="h-[2.875rem] w-full rounded-xl border border-border bg-white px-3.5 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/25"
          />
        </label>
        <label className="flex h-[2.875rem] items-center gap-2 rounded-xl border border-border bg-white px-3.5 focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/25 sm:w-40 lg:w-auto xl:w-40">
          <span className="text-sm text-muted-foreground">Rp</span>
          <span className="sr-only">Harga varian baru</span>
          <input
            inputMode="numeric"
            value={price}
            onChange={(event) => setPrice(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                submitVariant();
              }
            }}
            placeholder="30000"
            className="h-full min-w-0 flex-1 bg-transparent text-sm outline-none"
          />
        </label>
        <button
          type="button"
          onClick={submitVariant}
          disabled={add.isPending}
          className="h-[2.875rem] rounded-full border border-primary px-5 text-sm font-semibold text-primary transition-colors hover:bg-primary/5 disabled:opacity-60"
        >
          {add.isPending ? "Menambah…" : "+ Tambah varian"}
        </button>
      </div>

      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </section>
  );
}
