import { photoSrcSet } from "@delisert.mks-1/ui/lib/photo";
import { formatRupiah } from "@delisert.mks-1/ui/lib/price";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";

import { VariantEditor } from "@/components/variant-editor";
import { resizePhoto } from "@/utils/image-resize";
import { useTRPC } from "@/utils/trpc";
import {
  adminHeaders,
  centsToRupiahInput,
  readAdminToken,
  rupiahToCents,
} from "@/utils/admin-client";

export const Route = createFileRoute("/admin/produk/$id")({
  head: () => ({
    meta: [
      { title: "Ubah Produk — Delisert" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: ProductEditor,
});

const AVAILABILITY_OPTIONS = [
  { value: "available", label: "Tersedia" },
  { value: "preorder", label: "Pre-Order" },
  { value: "soldout", label: "Habis" },
] as const;

type Availability = (typeof AVAILABILITY_OPTIONS)[number]["value"];

function ProductEditor() {
  const { id } = Route.useParams();
  const isNew = id === "baru";

  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const categories = useQuery(trpc.adminProduct.categories.queryOptions());
  const existing = useQuery({
    ...trpc.adminProduct.byId.queryOptions({ id: Number(id) }),
    enabled: !isNew,
  });

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [categoryId, setCategoryId] = useState<number | "">("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [availability, setAvailability] = useState<Availability>("available");
  const [isFeatured, setIsFeatured] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [imageAlt, setImageAlt] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // Isi form SEKALI per produk. byId ikut di-refetch setiap kali varian
  // berubah atau jendela kembali fokus; kalau efek ini jalan lagi, isian yang
  // belum disimpan akan tertimpa data server.
  const filledFor = useRef<number | null>(null);
  useEffect(() => {
    const product = existing.data;
    if (!product || filledFor.current === product.id) return;
    filledFor.current = product.id;
    setName(product.name);
    setSlug(product.slug);
    setCategoryId(product.categoryId);
    setDescription(product.description ?? "");
    setPrice(centsToRupiahInput(product.priceCents));
    setAvailability(product.availability);
    setIsFeatured(product.isFeatured);
    setImageUrl(product.imageUrl ?? "");
    setImageAlt(product.imageAlt ?? "");
  }, [existing.data]);

  const invalidate = () => {
    void queryClient.invalidateQueries(trpc.adminProduct.list.queryFilter());
    if (!isNew) {
      void queryClient.invalidateQueries(
        trpc.adminProduct.byId.queryFilter({ id: Number(id) }),
      );
    }
  };

  const save = useMutation(
    trpc.adminProduct.update.mutationOptions({
      onSuccess: () => {
        invalidate();
        void navigate({ to: "/admin/produk" });
      },
      onError: (mutationError) => {
        setError(
          mutationError.data?.code === "CONFLICT"
            ? "Slug sudah dipakai produk lain."
            : "Gagal menyimpan. Periksa isian lalu coba lagi.",
        );
      },
    }),
  );

  const create = useMutation(
    trpc.adminProduct.create.mutationOptions({
      onSuccess: () => {
        invalidate();
        void navigate({ to: "/admin/produk" });
      },
      onError: (mutationError) => {
        setError(
          mutationError.data?.code === "CONFLICT"
            ? "Slug sudah dipakai produk lain."
            : "Gagal menyimpan. Periksa isian lalu coba lagi.",
        );
      },
    }),
  );

  const submit = () => {
    setError(null);
    if (!name.trim()) return setError("Nama produk wajib diisi.");
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      return setError("Slug hanya boleh huruf kecil, angka, dan tanda hubung.");
    }
    if (categoryId === "") return setError("Pilih kategori.");

    const payload = {
      categoryId,
      name: name.trim(),
      slug,
      description: description.trim() || null,
      priceCents: rupiahToCents(price),
      availability,
      isFeatured,
      imageUrl: imageUrl.trim() || null,
      imageAlt: imageAlt.trim() || null,
    };

    if (isNew) create.mutate(payload);
    else save.mutate({ id: Number(id), ...payload });
  };

  const upload = async (file: File) => {
    setError(null);
    setUploading(true);
    try {
      const form = new FormData();
      const sized = await resizePhoto(file);
      if (sized) {
        const extension = sized[0]?.blob.type === "image/webp" ? "webp" : "jpg";
        for (const { width, blob } of sized) {
          form.append(`w${width}`, blob, `foto-${width}.${extension}`);
        }
      } else {
        // Browser tidak bisa mengubah ukuran: unggah file asli apa adanya.
        form.append("file", file);
      }
      const response = await fetch("/api/upload", {
        method: "POST",
        headers: adminHeaders(readAdminToken()),
        body: form,
      });
      if (response.status === 401) {
        setError("Sesi admin sudah berakhir. Keluar lalu masuk lagi, kemudian unggah ulang fotonya.");
        return;
      }
      // Respons error tidak selalu JSON (misalnya halaman error dari proxy).
      const body = (await response.json().catch(() => ({}))) as {
        url?: string;
        error?: string;
      };
      if (!response.ok || !body.url) {
        setError(body.error ?? "Gagal mengunggah foto. Coba lagi.");
        return;
      }
      setImageUrl(body.url);
    } catch {
      setError("Gagal mengunggah foto. Periksa koneksi lalu coba lagi.");
    } finally {
      setUploading(false);
    }
  };

  const busy = save.isPending || create.isPending;

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <h2 className="text-xl leading-snug">{isNew ? "Tambah produk" : "Ubah produk"}</h2>

      <form
        className="flex flex-col gap-5"
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
      >
        <Field label="Nama produk" htmlFor="name">
          <input
            id="name"
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
            className={inputClass}
          />
        </Field>

        <Field label="Slug URL" htmlFor="slug" hint="Contoh: mochi-stroberi">
          <input
            id="slug"
            required
            value={slug}
            onChange={(event) => setSlug(event.target.value)}
            className={inputClass}
          />
        </Field>

        <Field label="Kategori" htmlFor="category">
          <select
            id="category"
            required
            value={categoryId}
            onChange={(event) =>
              setCategoryId(event.target.value === "" ? "" : Number(event.target.value))
            }
            className={inputClass}
          >
            <option value="">Pilih kategori…</option>
            {(categories.data ?? []).map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </Field>

        <Field
          label="Harga (rupiah)"
          htmlFor="price"
          hint={
            price && rupiahToCents(price) !== null
              ? `Tampil sebagai ${formatRupiah(rupiahToCents(price)!)}`
              : "Kosongkan bila harga belum ditentukan"
          }
        >
          <input
            id="price"
            inputMode="numeric"
            value={price}
            onChange={(event) => setPrice(event.target.value)}
            placeholder="8000"
            className={inputClass}
          />
        </Field>

        <Field label="Ketersediaan" htmlFor="availability">
          <select
            id="availability"
            value={availability}
            onChange={(event) => setAvailability(event.target.value as Availability)}
            className={inputClass}
          >
            {AVAILABILITY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Deskripsi" htmlFor="description">
          <textarea
            id="description"
            rows={4}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            className="border border-border bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50"
          />
        </Field>

        <fieldset className="flex flex-col gap-3">
          <legend className="text-sm font-medium">Foto produk</legend>
          <input
            id="photo"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void upload(file);
            }}
            className="text-sm"
          />
          <label htmlFor="photo" className="sr-only">
            Unggah foto produk
          </label>
          {uploading ? <p className="text-sm text-muted-foreground">Mengunggah…</p> : null}
          {imageUrl ? (
            <img
              src={imageUrl}
              srcSet={photoSrcSet(imageUrl)}
              sizes="240px"
              alt={imageAlt || `Foto ${name || "produk"}`}
              width={240}
              height={180}
              className="h-[180px] w-[240px] border border-border object-cover"
            />
          ) : (
            <p className="text-sm text-muted-foreground">Belum ada foto.</p>
          )}
        </fieldset>

        <Field label="Alt text foto" htmlFor="imageAlt" hint="Deskripsi singkat untuk pembaca layar">
          <input
            id="imageAlt"
            value={imageAlt}
            onChange={(event) => setImageAlt(event.target.value)}
            className={inputClass}
          />
        </Field>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={isFeatured}
            onChange={(event) => setIsFeatured(event.target.checked)}
            className="size-4 accent-primary"
          />
          Tampilkan sebagai produk unggulan di beranda
        </label>

        {error ? (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        ) : null}

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={busy || uploading}
            className="inline-flex h-10 items-center border border-primary bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
          >
            {busy ? "Menyimpan…" : "Simpan"}
          </button>
          <button
            type="button"
            onClick={() => void navigate({ to: "/admin/produk" })}
            className="inline-flex h-10 items-center border border-border px-5 text-sm transition-colors hover:border-primary hover:text-primary"
          >
            Batal
          </button>
        </div>
      </form>

      {/* Varian hanya bisa dikelola setelah produk punya id. */}
      {!isNew ? <VariantEditor productId={Number(id)} /> : null}
    </div>
  );
}

const inputClass =
  "h-10 border border-border bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50";

function Field({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-sm font-medium">
        {label}
      </label>
      {children}
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}
