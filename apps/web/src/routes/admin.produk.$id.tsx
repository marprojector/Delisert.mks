import { photoSrcSet } from "@delisert.mks-1/ui/lib/photo";
import { formatRupiah } from "@delisert.mks-1/ui/lib/price";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { PhotoDropzone } from "@/components/admin/photo-dropzone";
import { SaveBar } from "@/components/admin/save-bar";
import { Segmented } from "@/components/admin/segmented";
import { Toggle } from "@/components/admin/toggle";
import { VariantEditor } from "@/components/variant-editor";
import { adminHeaders, readAdminToken, rupiahToCents } from "@/utils/admin-client";
import { resizePhoto } from "@/utils/image-resize";
import {
  type Availability,
  EMPTY_FORM,
  type ProductForm,
  isDirty,
  toForm,
  toPayload,
  validateProductForm,
} from "@/utils/product-form";
import { useTRPC } from "@/utils/trpc";

export const Route = createFileRoute("/admin/produk/$id")({
  head: () => ({
    meta: [
      { title: "Ubah Produk — Delisert" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: ProductEditor,
});

const FORM_ID = "product-form";

const AVAILABILITY_OPTIONS: ReadonlyArray<{ value: Availability; label: string; tone: string }> = [
  { value: "available", label: "Tersedia", tone: "text-success" },
  { value: "preorder", label: "Pre-Order", tone: "text-[#9a6a12]" },
  { value: "soldout", label: "Habis", tone: "text-muted-foreground" },
];

const inputClass =
  "h-12 w-full rounded-xl border border-border bg-white px-3.5 text-[0.9375rem] text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/25";

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

  const [initial, setInitial] = useState<ProductForm>(EMPTY_FORM);
  const [form, setForm] = useState<ProductForm>(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  // HP: kategori, deskripsi, dan slug dilipat. Produk baru langsung terbuka.
  const [showMore, setShowMore] = useState(isNew);
  const errorRef = useRef<HTMLParagraphElement>(null);

  // Simpan ada di bar bawah layar; pastikan pesan error di atas benar-benar terlihat.
  useEffect(() => {
    if (!error) return;
    errorRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    errorRef.current?.focus({ preventScroll: true });
  }, [error]);

  const set = <Key extends keyof ProductForm>(key: Key, value: ProductForm[Key]) =>
    setForm((current) => ({ ...current, [key]: value }));

  // Isi form SEKALI per produk. byId ikut di-refetch setiap kali varian
  // berubah atau jendela kembali fokus; kalau efek ini jalan lagi, isian yang
  // belum disimpan akan tertimpa data server.
  const filledFor = useRef<number | null>(null);
  useEffect(() => {
    const product = existing.data;
    if (!product || filledFor.current === product.id) return;
    filledFor.current = product.id;
    const loaded = toForm(product);
    setInitial(loaded);
    setForm(loaded);
  }, [existing.data]);

  const dirty = isNew || isDirty(initial, form);

  const afterSave = () => {
    void queryClient.invalidateQueries(trpc.adminProduct.list.queryFilter());
    if (!isNew) {
      void queryClient.invalidateQueries(trpc.adminProduct.byId.queryFilter({ id: Number(id) }));
    }
    void navigate({ to: "/admin/produk" });
  };

  const onSaveError = (mutationError: { data?: { code?: string } | null }) => {
    if (mutationError.data?.code === "CONFLICT") setShowMore(true);
    setError(
      mutationError.data?.code === "CONFLICT"
        ? "Slug sudah dipakai produk lain."
        : "Gagal menyimpan. Periksa isian lalu coba lagi.",
    );
  };

  const save = useMutation(trpc.adminProduct.update.mutationOptions({ onSuccess: afterSave, onError: onSaveError }));
  const create = useMutation(trpc.adminProduct.create.mutationOptions({ onSuccess: afterSave, onError: onSaveError }));

  const submit = () => {
    setError(null);
    if (uploading) return setError("Tunggu sampai foto selesai diunggah.");
    const invalid = validateProductForm(form);
    if (invalid) {
      // Kategori dan slug ada di bagian yang dilipat di HP: buka supaya bisa diperbaiki.
      if (invalid.field !== "name") setShowMore(true);
      return setError(invalid.message);
    }
    if (form.categoryId === "") return;

    const payload = toPayload({ ...form, categoryId: form.categoryId });
    if (isNew) create.mutate(payload);
    else save.mutate({ id: Number(id), ...payload });
  };

  // Ref, bukan state: dua unggahan beruntun dalam satu render sama-sama
  // melihat state lama. Ref memastikan hanya satu unggahan berjalan.
  const uploadingRef = useRef(false);

  const upload = async (file: File) => {
    if (uploadingRef.current) return;
    uploadingRef.current = true;
    setError(null);
    setUploading(true);
    try {
      const body = new FormData();
      const sized = await resizePhoto(file);
      if (sized) {
        const extension = sized[0]?.blob.type === "image/webp" ? "webp" : "jpg";
        for (const { width, blob } of sized) body.append(`w${width}`, blob, `foto-${width}.${extension}`);
      } else {
        // Browser tidak bisa mengubah ukuran: unggah file asli apa adanya.
        body.append("file", file);
      }
      const response = await fetch("/api/upload", {
        method: "POST",
        headers: adminHeaders(readAdminToken()),
        body,
      });
      if (response.status === 401) {
        setError("Sesi admin sudah berakhir. Keluar lalu masuk lagi, kemudian unggah ulang fotonya.");
        return;
      }
      // Respons error tidak selalu JSON (misalnya halaman error dari proxy).
      const result = (await response.json().catch(() => ({}))) as { url?: string; error?: string };
      if (!response.ok || !result.url) {
        setError(result.error ?? "Gagal mengunggah foto. Coba lagi.");
        return;
      }
      set("imageUrl", result.url);
    } catch {
      setError("Gagal mengunggah foto. Periksa koneksi lalu coba lagi.");
    } finally {
      uploadingRef.current = false;
      setUploading(false);
    }
  };

  const busy = save.isPending || create.isPending;
  const priceCents = rupiahToCents(form.price);

  if (!isNew && existing.isError) {
    return (
      <div className="flex flex-col gap-3">
        <h1 className="text-[1.75rem] font-semibold">Ubah produk</h1>
        <p role="alert" className="text-sm text-destructive">
          Produk tidak ditemukan atau gagal dimuat.
        </p>
        <Link to="/admin/produk" className="text-sm font-semibold text-primary">
          ← Kembali ke daftar produk
        </Link>
      </div>
    );
  }

  const photoCard = (
    <section className="flex flex-col gap-3.5 rounded-[1.25rem] bg-background p-4.5 lg:rounded-[1.375rem] lg:p-6">
      <h2 className="hidden font-sans text-lg font-semibold text-foreground lg:block">Foto produk</h2>
      {form.imageUrl ? (
        <div className="relative overflow-hidden rounded-[1.125rem]">
          <img
            src={form.imageUrl}
            srcSet={photoSrcSet(form.imageUrl)}
            sizes="(min-width: 1024px) 352px, 100vw"
            alt={form.imageAlt || `Foto ${form.name || "produk"}`}
            width={352}
            height={264}
            className="aspect-[4/3] w-full object-cover"
          />
          <label
            htmlFor="photo"
            className="absolute right-2.5 bottom-2.5 cursor-pointer rounded-full bg-background px-3.5 py-2 text-[0.8125rem] font-semibold text-primary"
          >
            Ganti foto
          </label>
        </div>
      ) : null}
      <PhotoDropzone onFile={(file) => void upload(file)} uploading={uploading} />
      <label className="flex flex-col gap-2">
        <span className="text-sm font-semibold text-foreground">Alt text foto</span>
        <input
          value={form.imageAlt}
          onChange={(event) => set("imageAlt", event.target.value)}
          placeholder="Mochi daifuku Delisert Makassar"
          className={inputClass}
        />
        <span className="text-xs text-muted-foreground">Deskripsi singkat untuk pembaca layar.</span>
      </label>
    </section>
  );

  const secondaryFields = (
    <>
      <label className="flex flex-col gap-2">
        <span className="text-sm font-semibold text-foreground">Kategori</span>
        <span className="relative">
          <select
            required
            value={form.categoryId}
            onChange={(event) => set("categoryId", event.target.value === "" ? "" : Number(event.target.value))}
            className={`${inputClass} appearance-none pr-10`}
          >
            <option value="">Pilih kategori…</option>
            {(categories.data ?? []).map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          <ChevronDown aria-hidden="true" className="pointer-events-none absolute top-1/2 right-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
        </span>
      </label>
      <label className="flex flex-col gap-2">
        <span className="text-sm font-semibold text-foreground">Deskripsi</span>
        <textarea
          rows={4}
          value={form.description}
          onChange={(event) => set("description", event.target.value)}
          className="w-full rounded-xl border border-border bg-white px-3.5 py-3 text-[0.9375rem]/relaxed text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/25"
        />
      </label>
      <label className="flex flex-col gap-2">
        <span className="text-sm font-semibold text-foreground">Slug URL</span>
        <span className="flex h-12 items-center rounded-xl border border-border bg-muted px-3.5 text-sm focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/25">
          <span className="text-muted-foreground">/menu/</span>
          <input
            required
            value={form.slug}
            onChange={(event) => set("slug", event.target.value)}
            placeholder="mochi-stroberi"
            className="h-full min-w-0 flex-1 bg-transparent text-foreground outline-none"
          />
        </span>
      </label>
    </>
  );

  return (
    <div className="flex flex-col gap-5 pb-28 lg:gap-6 lg:pb-32">
      <div className="flex flex-col gap-1.5">
        <Link
          to="/admin/produk"
          className="inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground hover:text-primary"
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          Produk
        </Link>
        <h1 className="text-[1.75rem] font-semibold text-foreground lg:text-4xl">
          {isNew ? "Tambah produk" : "Ubah produk"}
        </h1>
      </div>

      {error ? (
        <p
          ref={errorRef}
          role="alert"
          tabIndex={-1}
          className="scroll-mt-20 rounded-xl bg-[#fbe9e7] px-3.5 py-3 text-sm text-destructive outline-none"
        >
          {error}
        </p>
      ) : null}

      <form
        id={FORM_ID}
        // Validasi lewat JS: isian yang dilipat tidak bisa difokuskan browser.
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
        className="grid gap-4 lg:grid-cols-[minmax(0,660fr)_minmax(0,400fr)] lg:items-start lg:gap-6"
      >
        {/* HP: foto lebih dulu. Desktop: kolom kanan. */}
        <div className="flex flex-col gap-4 lg:col-start-2 lg:row-start-1 lg:gap-5">
          {photoCard}
          <section className="flex flex-col gap-4 rounded-[1.25rem] bg-background p-4.5 lg:rounded-[1.375rem] lg:p-6">
            <h2 className="hidden font-sans text-lg font-semibold text-foreground lg:block">Tampilan di website</h2>
            <Segmented
              name="availability"
              label="Ketersediaan"
              value={form.availability}
              options={AVAILABILITY_OPTIONS}
              onChange={(value) => set("availability", value)}
            />
            <div className="flex items-center justify-between gap-4">
              <span className="flex flex-col">
                <span className="text-sm font-semibold text-foreground">Produk unggulan</span>
                <span className="text-xs text-muted-foreground">Tampil di beranda</span>
              </span>
              <Toggle
                checked={form.isFeatured}
                label="Produk unggulan"
                onChange={(value) => set("isFeatured", value)}
              />
            </div>
          </section>
        </div>

        <div className="flex flex-col gap-4 lg:col-start-1 lg:row-start-1 lg:gap-5">
          <section className="flex flex-col gap-4 rounded-[1.25rem] bg-background p-4.5 lg:gap-4.5 lg:rounded-[1.375rem] lg:p-7">
            <h2 className="hidden font-sans text-lg font-semibold text-foreground lg:block">Informasi produk</h2>
            <label className="flex flex-col gap-2">
              <span className="text-sm font-semibold text-foreground">Nama produk</span>
              <input
                required
                value={form.name}
                onChange={(event) => set("name", event.target.value)}
                className={inputClass}
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-sm font-semibold text-foreground">Harga dasar (rupiah)</span>
              <span className="flex h-12 items-center gap-2 rounded-xl border border-border bg-white px-3.5 focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/25">
                <span className="text-[0.9375rem] text-muted-foreground">Rp</span>
                <input
                  inputMode="numeric"
                  value={form.price}
                  onChange={(event) => set("price", event.target.value)}
                  placeholder="8000"
                  className="h-full min-w-0 flex-1 bg-transparent text-[0.9375rem] text-foreground outline-none"
                />
              </span>
              <span className="text-xs text-muted-foreground">
                {form.price && priceCents !== null
                  ? `Tampil sebagai ${formatRupiah(priceCents)}`
                  : "Kosongkan bila harga belum ditentukan"}
              </span>
            </label>

            {/* Desktop: semua isian terbuka. HP: dilipat supaya layar tidak panjang. */}
            <button
              type="button"
              aria-expanded={showMore}
              aria-controls="secondary-fields"
              onClick={() => setShowMore((value) => !value)}
              className="flex items-center justify-between py-1.5 text-sm text-foreground lg:hidden"
            >
              Kategori, deskripsi, slug
              <span className="flex items-center gap-1 font-semibold text-primary">
                {showMore ? "Tutup" : "Buka"}
                <ChevronDown
                  aria-hidden="true"
                  className={showMore ? "size-4 rotate-180 transition-transform" : "size-4 transition-transform"}
                />
              </span>
            </button>
            <div
              id="secondary-fields"
              className={showMore ? "flex flex-col gap-4 lg:gap-4.5" : "hidden flex-col gap-4.5 lg:flex"}
            >
              {secondaryFields}
            </div>
          </section>

          {/* Varian hanya bisa dikelola setelah produk punya id. */}
          {isNew ? (
            <p className="rounded-[1.25rem] bg-background p-4.5 text-sm text-muted-foreground lg:p-7">
              Simpan produk dulu, lalu tambahkan varian ukuran atau rasa.
            </p>
          ) : (
            <VariantEditor productId={Number(id)} />
          )}
        </div>
      </form>

      <SaveBar
        visible={dirty}
        busy={busy}
        disabled={uploading}
        formId={FORM_ID}
        message={isNew ? "Produk baru belum disimpan" : "Ada perubahan yang belum disimpan"}
        onCancel={() => {
          if (isNew) void navigate({ to: "/admin/produk" });
          else setForm(initial);
        }}
      />
    </div>
  );
}
