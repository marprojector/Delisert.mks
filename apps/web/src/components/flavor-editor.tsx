import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowDown, ArrowUp, Plus, X } from "lucide-react";
import { useState } from "react";

import { Toggle } from "@/components/admin/toggle";
import { FlavorPhotoButton } from "@/components/flavor-photo-button";
import { useTRPC } from "@/utils/trpc";

/**
 * Editor varian rasa (mis. Matcha Oreo, Lotus Biscoff). Rasa tidak mengubah
 * harga; tiap perubahan langsung tersimpan seperti editor varian ukuran.
 */
export function FlavorEditor({ productId }: { productId: number }) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const detail = useQuery(trpc.adminProduct.byId.queryOptions({ id: productId }));
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const refresh = () => {
    void queryClient.invalidateQueries(trpc.adminProduct.byId.queryFilter({ id: productId }));
    void queryClient.invalidateQueries(trpc.adminProduct.list.queryFilter());
  };
  const options = (message: string) => ({ onSuccess: refresh, onError: () => setError(message) });

  const add = useMutation(
    trpc.adminProduct.addFlavor.mutationOptions({
      onSuccess: () => {
        setName("");
        setError(null);
        refresh();
      },
      onError: () => setError("Gagal menambah rasa."),
    }),
  );
  const update = useMutation(trpc.adminProduct.updateFlavor.mutationOptions(options("Gagal mengubah rasa.")));
  const move = useMutation(trpc.adminProduct.moveFlavor.mutationOptions(options("Gagal mengubah urutan.")));
  const remove = useMutation(trpc.adminProduct.removeFlavor.mutationOptions(options("Gagal menghapus rasa.")));

  const flavors = detail.data?.flavors ?? [];
  const busy = update.isPending || move.isPending || remove.isPending;

  const submit = () => {
    const value = name.trim();
    if (!value) return setError("Nama rasa wajib diisi.");
    if (flavors.some((flavor) => flavor.name.toLowerCase() === value.toLowerCase())) {
      return setError(`Rasa "${value}" sudah ada.`);
    }
    add.mutate({ productId, name: value });
  };

  return (
    <section className="flex flex-col gap-3 rounded-[1.25rem] bg-background p-4.5 lg:gap-3.5 lg:rounded-[1.375rem] lg:p-7">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-sans text-base font-semibold text-foreground lg:text-lg">
          Varian rasa
          {flavors.length > 0 ? (
            <span className="ml-2 rounded-full bg-secondary px-2 py-0.5 text-xs font-semibold text-primary">
              {flavors.length}
            </span>
          ) : null}
        </h2>
        <span className="text-xs text-muted-foreground lg:text-[0.8125rem]">Tersimpan otomatis</span>
      </div>
      <p className="text-[0.8125rem]/relaxed text-muted-foreground">
        Tampil sebagai pilihan rasa di menu dan halaman produk. Pasang foto rasa supaya foto produk ikut
        berganti saat pelanggan memilih rasa itu. Matikan sakelar bila rasa sedang habis.
      </p>

      {flavors.length === 0 ? (
        <p className="rounded-2xl bg-muted px-4 py-3 text-sm text-muted-foreground">Belum ada rasa.</p>
      ) : (
        <ul className="flex flex-col divide-y divide-border rounded-2xl border border-border">
          {flavors.map((flavor, index) => (
            <li key={flavor.id} className="flex items-center gap-2 px-3 py-2.5">
              <span className="w-5 shrink-0 text-center text-xs text-muted-foreground tabular-nums">{index + 1}</span>
              <FlavorPhotoButton
                flavorName={flavor.name}
                imageUrl={flavor.imageUrl}
                disabled={busy}
                onError={setError}
                onChange={(imageUrl) => {
                  setError(null);
                  update.mutate({ id: flavor.id, imageUrl });
                }}
              />
              <span
                className={
                  flavor.isAvailable
                    ? "min-w-0 flex-1 truncate text-sm font-semibold text-foreground"
                    : "min-w-0 flex-1 truncate text-sm font-semibold text-muted-foreground line-through"
                }
              >
                {flavor.name}
              </span>
              <span className="flex shrink-0 items-center">
                <button
                  type="button"
                  disabled={busy || index === 0}
                  onClick={() => move.mutate({ id: flavor.id, direction: "up" })}
                  className="flex size-8 items-center justify-center rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground disabled:opacity-30"
                >
                  <ArrowUp aria-hidden="true" className="size-4" />
                  <span className="sr-only">Naikkan {flavor.name}</span>
                </button>
                <button
                  type="button"
                  disabled={busy || index === flavors.length - 1}
                  onClick={() => move.mutate({ id: flavor.id, direction: "down" })}
                  className="flex size-8 items-center justify-center rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground disabled:opacity-30"
                >
                  <ArrowDown aria-hidden="true" className="size-4" />
                  <span className="sr-only">Turunkan {flavor.name}</span>
                </button>
              </span>
              <Toggle
                checked={flavor.isAvailable}
                disabled={busy}
                label={`${flavor.name} tersedia`}
                onChange={(isAvailable) => update.mutate({ id: flavor.id, isAvailable })}
              />
              <button
                type="button"
                disabled={busy}
                onClick={() => {
                  if (window.confirm(`Hapus rasa "${flavor.name}"?`)) remove.mutate({ id: flavor.id });
                }}
                className="flex size-8 shrink-0 items-center justify-center rounded-full text-destructive hover:bg-destructive/10"
              >
                <X aria-hidden="true" className="size-4" />
                <span className="sr-only">Hapus rasa {flavor.name}</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Bukan <form>: editor ini berada di dalam form produk. */}
      <div className="flex gap-2 pt-1">
        <label className="min-w-0 flex-1">
          <span className="sr-only">Nama rasa baru</span>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                submit();
              }
            }}
            placeholder="Nama rasa, mis. Taro Cheese"
            className="h-[2.875rem] w-full rounded-xl border border-border bg-white px-3.5 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/25"
          />
        </label>
        <button
          type="button"
          onClick={submit}
          disabled={add.isPending}
          className="inline-flex h-[2.875rem] shrink-0 items-center gap-1.5 rounded-full border border-primary px-4 text-sm font-semibold text-primary transition-colors hover:bg-primary/5 disabled:opacity-60"
        >
          <Plus aria-hidden="true" className="size-4" />
          {add.isPending ? "Menambah…" : "Tambah rasa"}
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
