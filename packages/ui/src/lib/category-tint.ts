/**
 * Warna tempat foto per kategori, selama foto produk asli belum ada.
 * Semua turunan hangat dari palet merek — bukan warna merek baru.
 */
const TINTS: Record<string, string> = {
  mochi: "bg-[#e8cfc0]",
  "mango-sticky-rice": "bg-[#f0d9a8]",
  "pancake-durian": "bg-[#e4bd81]",
  "mille-crepes": "bg-[#ead6c4]",
  "slice-cake": "bg-[#e9d8c8]",
  "dubai-chewy-cookie": "bg-[#d8b98f]",
};

export function categoryTint(slug: string | undefined): string {
  return (slug && TINTS[slug]) || "bg-secondary";
}
