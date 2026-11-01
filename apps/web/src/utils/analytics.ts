/**
 * Cloudflare Web Analytics (PRD §12.2): gratis, tanpa cookie, tanpa banner
 * persetujuan, dan tidak membebani halaman selain satu script kecil `defer`.
 *
 * Cara mengaktifkan:
 * 1. Cloudflare dashboard → Analytics & Logs → Web Analytics → Add a site,
 *    isi domain website Delisert.
 * 2. Salin nilai "token" dari snippet yang diberikan, lalu isi konstanta di bawah.
 *
 * Token ini bukan rahasia — token selalu terlihat di HTML halaman. Selama
 * nilainya null, tidak ada script analitik yang dimuat.
 *
 * Catatan: kalau domain sudah diproksikan Cloudflare, "automatic setup" di
 * dashboard bisa menyisipkan beacon tanpa kode. Pakai SALAH SATU saja, jangan
 * keduanya, supaya kunjungan tidak terhitung dua kali.
 */
/**
 * Situs Web Analytics untuk domain workers.dev produksi, dibuat lewat API
 * Cloudflare. Hanya dimuat di build produksi supaya dev lokal tidak tercatat.
 */
export const CLOUDFLARE_ANALYTICS_TOKEN: string | null = import.meta.env.PROD
  ? "a30a4197bcef4be799081a3b9df6bccf"
  : null;

const BEACON_SRC = "https://static.cloudflareinsights.com/beacon.min.js";

export function analyticsScripts(token: string | null = CLOUDFLARE_ANALYTICS_TOKEN) {
  if (!token) return [];
  return [
    {
      src: BEACON_SRC,
      defer: true,
      "data-cf-beacon": JSON.stringify({ token }),
    },
  ];
}
