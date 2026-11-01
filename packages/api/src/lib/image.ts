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
