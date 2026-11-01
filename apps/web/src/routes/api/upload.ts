import { verifySessionToken } from "@delisert.mks-1/api/lib/admin-session";
import { validateImageUpload } from "@delisert.mks-1/api/lib/image";
import { publicPhotoUrl, uploadPhoto } from "@delisert.mks-1/api/lib/storage";
import { createFileRoute } from "@tanstack/react-router";
import { env } from "cloudflare:workers";

/**
 * Unggah foto produk ke Supabase Storage. Hanya admin dengan token sah yang
 * boleh menulis. Kunci objek dibuat dari UUID (lihat validateImageUpload),
 * jadi nama file pengguna tidak pernah menentukan path.
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

        const storage = {
          url: env.SUPABASE_URL,
          serviceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY,
          bucket: env.SUPABASE_BUCKET,
        };

        const uploaded = await uploadPhoto(
          storage,
          check.key,
          await file.arrayBuffer(),
          file.type,
        );
        if (!uploaded.ok) {
          return Response.json({ error: uploaded.reason }, { status: 502 });
        }

        return Response.json({ url: publicPhotoUrl(storage, check.key) });
      },
    },
  },
});
