/** Alamat resmi website. */
export const CANONICAL_ORIGIN = "https://delisert.me";

/**
 * Kunjungan halaman lewat alamat lama (*.workers.dev) dialihkan permanen ke
 * delisert.me supaya Google hanya mengindeks satu alamat. Panggilan API
 * (/api/..., mis. koneksi MCP yang masih memakai alamat lama) dan permintaan
 * selain GET/HEAD tetap dilayani apa adanya — redirect akan memutus POST.
 */
export function canonicalRedirect(request: Request): string | null {
  const url = new URL(request.url);
  if (!url.hostname.endsWith(".workers.dev")) return null;
  if (request.method !== "GET" && request.method !== "HEAD") return null;
  if (url.pathname === "/api" || url.pathname.startsWith("/api/")) return null;
  return `${CANONICAL_ORIGIN}${url.pathname}${url.search}`;
}
