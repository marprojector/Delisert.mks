import { categoryTint } from "@delisert.mks-1/ui/lib/category-tint";
import { cn } from "@delisert.mks-1/ui/lib/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { ArrowDown, ArrowUp, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

import { Toggle } from "@/components/admin/toggle";
import { Card, Notice, PageHeader, TextField, buttonClass } from "@/components/admin/ui";
import { useTRPC } from "@/utils/trpc";

export const Route = createFileRoute("/admin/kategori")({
  head: () => ({
    meta: [{ title: "Kategori — Admin Delisert" }, { name: "robots", content: "noindex, nofollow" }],
  }),
  component: CategoriesPage,
});

/** "Es Krim Spesial" → "es-krim-spesial". */
const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

type Draft = { id: number | null; name: string; slug: string; description: string; slugTouched: boolean };
const EMPTY: Draft = { id: null, name: "", slug: "", description: "", slugTouched: false };

function CategoriesPage() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const list = useQuery(trpc.adminCategory.list.queryOptions());
  const [draft, setDraft] = useState<Draft | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = () => {
    void queryClient.invalidateQueries(trpc.adminCategory.list.queryFilter());
    void queryClient.invalidateQueries(trpc.adminProduct.categories.queryFilter());
    void queryClient.invalidateQueries(trpc.adminProduct.list.queryFilter());
  };
  const onError = (mutationError: { message: string }) => setError(mutationError.message);

  const create = useMutation(
    trpc.adminCategory.create.mutationOptions({ onSuccess: () => (setDraft(null), refresh()), onError }),
  );
  const update = useMutation(
    trpc.adminCategory.update.mutationOptions({ onSuccess: () => (setDraft(null), refresh()), onError }),
  );
  const toggle = useMutation(trpc.adminCategory.update.mutationOptions({ onSuccess: refresh, onError }));
  const move = useMutation(trpc.adminCategory.move.mutationOptions({ onSuccess: refresh, onError }));
  const remove = useMutation(trpc.adminCategory.remove.mutationOptions({ onSuccess: refresh, onError }));

  const rows = list.data ?? [];
  const busy = move.isPending || toggle.isPending || remove.isPending;

  const save = () => {
    if (!draft) return;
    setError(null);
    const payload = {
      name: draft.name.trim(),
      slug: draft.slug.trim(),
      description: draft.description.trim() || null,
    };
    if (!payload.name) return setError("Nama kategori wajib diisi.");
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(payload.slug)) {
      return setError("Slug hanya boleh huruf kecil, angka, dan tanda hubung.");
    }
    if (draft.id === null) create.mutate({ ...payload, isActive: true });
    else update.mutate({ id: draft.id, ...payload });
  };

  const editor = draft ? (
    <Card title={draft.id === null ? "Kategori baru" : "Ubah kategori"} className="border-primary/40">
      <div className="grid grid-cols-1 gap-4 @lg:grid-cols-2">
        <TextField
          label="Nama"
          value={draft.name}
          maxLength={60}
          onChange={(name) =>
            setDraft({ ...draft, name, slug: draft.slugTouched ? draft.slug : slugify(name) })
          }
          placeholder="Es Krim"
        />
        <TextField
          label="Slug URL"
          hint={`Tampil sebagai /menu?category=${draft.slug || "…"}`}
          value={draft.slug}
          onChange={(slug) => setDraft({ ...draft, slug, slugTouched: true })}
          placeholder="es-krim"
        />
        <TextField
          className="@lg:col-span-2"
          label="Deskripsi singkat"
          value={draft.description}
          maxLength={400}
          multiline
          rows={2}
          onChange={(description) => setDraft({ ...draft, description })}
        />
      </div>
      <div className="flex flex-wrap justify-end gap-2">
        <button type="button" onClick={() => setDraft(null)} className={buttonClass("ghost")}>
          Batal
        </button>
        <button type="button" onClick={save} disabled={create.isPending || update.isPending} className={buttonClass("primary")}>
          {create.isPending || update.isPending ? "Menyimpan…" : "Simpan kategori"}
        </button>
      </div>
    </Card>
  ) : null;

  return (
    <div className="flex flex-col gap-6 lg:gap-8">
      <PageHeader
        eyebrow="Katalog"
        title="Kategori"
        description="Atur kategori yang tampil sebagai filter di halaman Menu dan ubin di beranda. Kategori nonaktif menyembunyikan semua produknya dari website."
        actions={
          <button
            type="button"
            onClick={() => (setError(null), setDraft(EMPTY))}
            className={buttonClass("primary")}
          >
            <Plus aria-hidden="true" className="size-4" />
            Tambah kategori
          </button>
        }
      />

      {error ? <Notice tone="error">{error}</Notice> : null}
      {draft?.id === null ? editor : null}

      <Card bodyClassName="gap-0 p-2 lg:p-3">
        {list.isLoading ? <p className="p-4 text-sm text-muted-foreground">Memuat kategori…</p> : null}
        <ol className="flex flex-col">
          {rows.map((row, index) => (
            <li key={row.id} className="flex flex-col">
              <div className="flex flex-wrap items-center gap-3 rounded-2xl px-2.5 py-3 sm:flex-nowrap lg:px-3.5">
                <span aria-hidden="true" className={cn("size-11 shrink-0 rounded-xl", categoryTint(row.slug))} />
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className={cn("truncate text-[0.9375rem] font-semibold", row.isActive ? "text-foreground" : "text-muted-foreground")}>
                    {row.name}
                    {row.isActive ? null : (
                      <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-[0.6875rem] font-semibold text-muted-foreground">
                        Disembunyikan
                      </span>
                    )}
                  </span>
                  <span className="truncate text-xs text-muted-foreground">
                    /{row.slug} · {row.productCount} produk
                  </span>
                </span>
                <span className="flex w-full items-center justify-end gap-1 border-t border-border/50 pt-2 sm:w-auto sm:border-0 sm:pt-0">
                  <button
                    type="button"
                    disabled={busy || index === 0}
                    onClick={() => move.mutate({ id: row.id, direction: "up" })}
                    className="flex size-9 items-center justify-center rounded-full text-muted-foreground hover:bg-secondary disabled:opacity-30"
                  >
                    <ArrowUp aria-hidden="true" className="size-4" />
                    <span className="sr-only">Naikkan {row.name}</span>
                  </button>
                  <button
                    type="button"
                    disabled={busy || index === rows.length - 1}
                    onClick={() => move.mutate({ id: row.id, direction: "down" })}
                    className="flex size-9 items-center justify-center rounded-full text-muted-foreground hover:bg-secondary disabled:opacity-30"
                  >
                    <ArrowDown aria-hidden="true" className="size-4" />
                    <span className="sr-only">Turunkan {row.name}</span>
                  </button>
                  <Toggle
                    checked={row.isActive}
                    disabled={busy}
                    label={`Tampilkan ${row.name} di website`}
                    onChange={(isActive) => toggle.mutate({ id: row.id, isActive })}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      (setError(null),
                      setDraft({
                        id: row.id,
                        name: row.name,
                        slug: row.slug,
                        description: row.description ?? "",
                        slugTouched: true,
                      }))
                    }
                    className="ml-1 flex size-9 items-center justify-center rounded-full text-foreground hover:bg-secondary"
                  >
                    <Pencil aria-hidden="true" className="size-4" />
                    <span className="sr-only">Ubah {row.name}</span>
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => {
                      if (row.productCount > 0) {
                        setError(`"${row.name}" masih dipakai ${row.productCount} produk. Pindahkan produknya dulu, atau sembunyikan kategorinya.`);
                        return;
                      }
                      if (window.confirm(`Hapus kategori "${row.name}"?`)) remove.mutate({ id: row.id });
                    }}
                    className="flex size-9 items-center justify-center rounded-full text-destructive hover:bg-[#fbe9e7]"
                  >
                    <Trash2 aria-hidden="true" className="size-4" />
                    <span className="sr-only">Hapus {row.name}</span>
                  </button>
                </span>
              </div>
              {draft?.id === row.id ? <div className="px-1 pb-3">{editor}</div> : null}
              {index < rows.length - 1 ? <span aria-hidden="true" className="mx-3 h-px bg-border/60" /> : null}
            </li>
          ))}
        </ol>
      </Card>
    </div>
  );
}
