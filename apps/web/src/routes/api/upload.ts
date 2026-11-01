import { verifySessionToken } from "@delisert.mks-1/api/lib/admin-session";
import { validateImageUpload } from "@delisert.mks-1/api/lib/image";
import { createFileRoute } from "@tanstack/react-router";
import { env } from "cloudflare:workers";

/**
 * Unggah foto produk. Hanya admin yang punya token sah boleh menulis.
 * Kunci objek dibuat dari UUID (lihat validateImageUpload), jadi nama file
 * pengguna tidak pernah menyentuh path R2.
 */
export const Route = createFileRoute("/api/upload")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
        if (!token || !(await verifySessionToken(env.ADMIN_SESSION_SECRET, token, Date.now()))) {
          return new Response("Unauthorized", { status: 401 });
        }

        const form = await request.formData();
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
