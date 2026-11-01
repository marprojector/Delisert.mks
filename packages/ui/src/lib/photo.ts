/**
 * Foto produk responsif.
 *
 * Admin mengubah setiap foto menjadi beberapa lebar sebelum diunggah
 * (lihat apps/web/src/utils/image-resize.ts). Lebarnya tercatat di nama file:
 *
 *   /api/photos/products/<uuid>-w1600.webp   ← URL yang disimpan di database
 *   /api/photos/products/<uuid>-w960.webp
 *   /api/photos/products/<uuid>-w480.webp
 *
 * URL yang disimpan selalu versi TERBESAR. Versi lebih kecil hanya ada untuk
 * lebar standar yang lebih kecil dari versi terbesar. Foto lama (tanpa
 * "-w<angka>") dan URL HTTPS eksternal tidak punya srcset dan tampil apa adanya.
 *
 * Pola nama file ini juga dipakai packages/api/src/lib/image.ts — ubah keduanya
 * bersamaan.
 */

export const PHOTO_WIDTHS = [480, 960, 1600] as const;

const SIZED_PHOTO = /^(.*\/products\/[0-9a-f-]{36})-w(\d+)\.(webp|jpg)$/;

/** Daftar URL per lebar untuk foto bertingkat; null untuk foto lain. */
export function photoVariants(url: string): Array<{ url: string; width: number }> | null {
  const match = SIZED_PHOTO.exec(url);
  if (!match) return null;
  const [, base, maxText, extension] = match as unknown as [string, string, string, string];
  const max = Number(maxText);
  const widths = [...PHOTO_WIDTHS.filter((width) => width < max), max];
  return widths.map((width) => ({ url: `${base}-w${width}.${extension}`, width }));
}

/** Nilai atribut srcset, atau undefined bila foto tidak punya versi bertingkat. */
export function photoSrcSet(url: string): string | undefined {
  const variants = photoVariants(url);
  if (!variants || variants.length < 2) return undefined;
  return variants.map((variant) => `${variant.url} ${variant.width}w`).join(", ");
}
