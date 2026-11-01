import { formatRupiah } from "@delisert.mks-1/ui/lib/price";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

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

  return (
    <section className="flex flex-col gap-3 border-t border-border pt-6">
      <h2 className="text-xl leading-snug">Varian</h2>
      <p className="text-sm/relaxed text-muted-foreground">
        Tambahkan pilihan ukuran atau rasa. Kalau produk tidak punya varian, biarkan kosong.
      </p>

      {variants.length === 0 ? (
        <p className="text-sm text-muted-foreground">Belum ada varian.</p>
      ) : (
        <ul className="flex flex-col divide-y divide-border border-y border-border">
          {variants.map((variant) => (
            <li key={variant.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
              <span className="flex items-center gap-3 text-sm">
                <span className={variant.isAvailable ? "" : "text-muted-foreground line-through"}>
                  {variant.name}
                </span>
                <span className="text-primary">
                  {variant.priceCents === null ? "Harga menyusul" : formatRupiah(variant.priceCents)}
                </span>
              </span>
              <span className="flex items-center gap-3 text-sm">
                <button
                  type="button"
                  onClick={() =>
                    toggle.mutate({ id: variant.id, isAvailable: !variant.isAvailable })
                  }
                  className="text-primary underline-offset-4 hover:underline"
                >
                  {variant.isAvailable ? "Tandai habis" : "Tandai tersedia"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(`Hapus varian "${variant.name}"?`)) {
                      remove.mutate({ id: variant.id });
                    }
                  }}
                  className="text-destructive underline-offset-4 hover:underline"
                >
                  Hapus
                </button>
              </span>
            </li>
          ))}
        </ul>
      )}

      <form
        className="flex flex-wrap items-end gap-3"
        onSubmit={(event) => {
          event.preventDefault();
          if (!name.trim()) return setError("Nama varian wajib diisi.");
          add.mutate({
            productId,
            name: name.trim(),
            priceCents: price.replace(/[^\d]/g, "") ? Number(price.replace(/[^\d]/g, "")) : null,
            isAvailable: true,
            displayOrder: variants.length + 1,
          });
        }}
      >
        <div className="flex flex-col gap-1.5">
          <label htmlFor="variant-name" className="text-sm font-medium">
            Nama varian
          </label>
          <input
            id="variant-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Isi 4 pcs"
            className="h-10 border border-border bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="variant-price" className="text-sm font-medium">
            Harga (rupiah)
          </label>
          <input
            id="variant-price"
            inputMode="numeric"
            value={price}
            onChange={(event) => setPrice(event.target.value)}
            placeholder="30000"
            className="h-10 border border-border bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50"
          />
        </div>
        <button
          type="submit"
          disabled={add.isPending}
          className="inline-flex h-10 items-center border border-primary bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
        >
          {add.isPending ? "Menambah…" : "Tambah varian"}
        </button>
      </form>

      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </section>
  );
}
