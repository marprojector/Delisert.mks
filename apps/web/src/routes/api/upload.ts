import { verifySessionToken } from "@delisert.mks-1/api/lib/admin-session";
import {
  MAX_PHOTO_WIDTH,
  sizedPhotoKey,
  validateImageUpload,
} from "@delisert.mks-1/api/lib/image";
import { createFileRoute } from "@tanstack/react-router";
import { env } from "cloudflare:workers";

/**
 * Unggah foto produk. Hanya admin yang punya token sah boleh menulis.
 * Kunci objek dibuat dari UUID (lihat validateImageUpload), jadi nama file
 * pengguna tidak pernah menyentuh path R2.
 *
 * Dua bentuk form diterima:
 * - Foto bertingkat (dari editor admin): field `w<lebar>` untuk setiap lebar,
 *   misalnya `w480`, `w960`, `w1600`. Semua disimpan dengan UUID yang sama dan
 *   URL versi terbesar dikembalikan. Lihat packages/ui/src/lib/photo.ts.
 * - Satu file di field `file` (cadangan bila browser tidak bisa mengubah
 *   ukuran foto). Disimpan apa adanya.
 */
const SIZE_FIELD = /^w(\d+)$/;
const SIZED_TYPES: Record<string, string> = { "image/webp": "webp", "image/jpeg": "jpg" };

export const Route = createFileRoute("/api/upload")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
        if (!token || !(await verifySessionToken(env.ADMIN_SESSION_SECRET, token, Date.now()))) {
          return Response.json({ error: "Sesi admin berakhir." }, { status: 401 });
        }

        let form: FormData;
        try {
          form = await request.formData();
        } catch {
          return Response.json({ error: "Data unggahan tidak valid." }, { status: 400 });
        }

        const sized: Array<{ width: number; file: File }> = [];
        for (const field of new Set(form.keys())) {
          const match = SIZE_FIELD.exec(field);
          const value: unknown = form.get(field);
          if (match && value instanceof File) sized.push({ width: Number(match[1]), file: value });
        }

        if (sized.length > 0) {
          return storeSizedPhoto(sized);
        }

        const file = form.get("file");
        if (!(file instanceof File)) {
          return Response.json({ error: "File tidak ditemukan." }, { status: 400 });
        }

        const check = validateImageUpload({
          filename: file.name,
          contentType: file.type,
          size: file.size,
        });
        if (!check.ok) {
          return Response.json({ error: check.reason }, { status: 400 });
        }

        await env.PHOTOS.put(check.key, await file.arrayBuffer(), {
          httpMetadata: { contentType: file.type },
        });

        return Response.json({ url: `/api/photos/${check.key}` });
      },
    },
  },
});

async function storeSizedPhoto(sized: Array<{ width: number; file: File }>): Promise<Response> {
  if (sized.length > 4) {
    return Response.json({ error: "Terlalu banyak ukuran foto." }, { status: 400 });
  }

  const extension = SIZED_TYPES[sized[0]!.file.type];
  for (const { width, file } of sized) {
    if (!Number.isInteger(width) || width < 1 || width > MAX_PHOTO_WIDTH) {
      return Response.json({ error: "Lebar foto tidak valid." }, { status: 400 });
    }
    if (SIZED_TYPES[file.type] !== extension || !extension) {
      return Response.json({ error: "Format foto harus WebP atau JPG." }, { status: 400 });
    }
    const check = validateImageUpload({ filename: file.name, contentType: file.type, size: file.size });
    if (!check.ok) return Response.json({ error: check.reason }, { status: 400 });
  }

  const id = crypto.randomUUID();
  await Promise.all(
    sized.map(async ({ width, file }) =>
      env.PHOTOS.put(sizedPhotoKey(id, width, extension!), await file.arrayBuffer(), {
        httpMetadata: { contentType: file.type },
      }),
    ),
  );

  const largest = Math.max(...sized.map(({ width }) => width));
  return Response.json({ url: `/api/photos/${sizedPhotoKey(id, largest, extension!)}` });
}
