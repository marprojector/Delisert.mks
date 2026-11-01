import { adminHeaders, readAdminToken } from "@/utils/admin-client";
import { resizePhoto } from "@/utils/image-resize";

/**
 * Unggah satu foto ke R2 lewat /api/upload (dikecilkan ke WebP bertingkat
 * di browser bila bisa). Mengembalikan URL foto, atau pesan galat.
 */
export async function uploadPhoto(file: File): Promise<{ url: string } | { error: string }> {
  try {
    const body = new FormData();
    const sized = await resizePhoto(file);
    if (sized) {
      const extension = sized[0]?.blob.type === "image/webp" ? "webp" : "jpg";
      for (const { width, blob } of sized) body.append(`w${width}`, blob, `foto-${width}.${extension}`);
    } else {
      body.append("file", file);
    }
    const response = await fetch("/api/upload", {
      method: "POST",
      headers: adminHeaders(readAdminToken()),
      body,
    });
    if (response.status === 401) return { error: "Sesi admin sudah berakhir. Keluar lalu masuk lagi." };
    const result = (await response.json().catch(() => ({}))) as { url?: string; error?: string };
    if (!response.ok || !result.url) return { error: result.error ?? "Gagal mengunggah foto." };
    return { url: result.url };
  } catch {
    return { error: "Gagal mengunggah foto. Periksa koneksi lalu coba lagi." };
  }
}
