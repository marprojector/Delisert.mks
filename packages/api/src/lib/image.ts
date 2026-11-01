/**
 * Validasi unggahan foto produk.
 *
 * Kunci objek selalu dibuat dari UUID, bukan dari nama file pengguna — itu
 * menghapus path traversal sejak awal. Nama file hanya dipakai tidak sama
 * sekali; ekstensi ditentukan dari MIME type. SVG ditolak karena bisa
 * membawa script.
 */

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

const EXTENSION_BY_TYPE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export type ImageUploadInput = { filename: string; contentType: string; size: number };

export type ImageUploadResult =
  | { ok: true; key: string; extension: string }
  | { ok: false; reason: string };

export function validateImageUpload(input: ImageUploadInput): ImageUploadResult {
  if (input.filename.includes("..") || input.filename.includes("/") || input.filename.includes("\\")) {
    return { ok: false, reason: "Nama file tidak valid." };
  }

  const extension = EXTENSION_BY_TYPE[input.contentType];
  if (!extension) {
    return { ok: false, reason: "Format foto harus JPG, PNG, atau WebP." };
  }
  if (input.size <= 0) {
    return { ok: false, reason: "File kosong." };
  }
  if (input.size > MAX_IMAGE_BYTES) {
    return { ok: false, reason: "Ukuran foto maksimal 5 MB." };
  }
  return { ok: true, key: `products/${crypto.randomUUID()}.${extension}`, extension };
}

/** Lebar standar foto bertingkat. Sama dengan PHOTO_WIDTHS di packages/ui/src/lib/photo.ts. */
export const PHOTO_WIDTHS = [480, 960, 1600] as const;
export const MAX_PHOTO_WIDTH = 1600;

/** Kunci R2 untuk satu lebar foto bertingkat: products/<uuid>-w<lebar>.<ext>. */
export function sizedPhotoKey(id: string, width: number, extension: string): string {
  return `products/${id}-w${width}.${extension}`;
}

const SIZED_PHOTO_KEY = /^(products\/[0-9a-f-]{36})-w(\d+)\.(webp|jpg)$/;

/**
 * Semua kunci R2 milik satu foto, dari URL yang disimpan di database.
 * Foto bertingkat punya beberapa objek; foto lama hanya satu.
 * URL di luar /api/photos/products/ menghasilkan daftar kosong.
 */
export function photoKeysForUrl(url: string): string[] {
  const prefix = "/api/photos/";
  if (!url.startsWith(`${prefix}products/`)) return [];
  const key = url.slice(prefix.length);
  if (key.includes("..")) return [];
  const match = SIZED_PHOTO_KEY.exec(key);
  if (!match) return [key];
  const [, base, maxText, extension] = match as unknown as [string, string, string, string];
  const max = Number(maxText);
  return [...PHOTO_WIDTHS.filter((width) => width < max), max].map(
    (width) => `${base}-w${width}.${extension}`,
  );
}
