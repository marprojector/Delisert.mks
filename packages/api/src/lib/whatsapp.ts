/**
 * Nomor dan tautan WhatsApp Delisert.
 *
 * Nomor tinggal di sini (bukan di data/business.ts) supaya modul ini tidak
 * mengimpor balik business.ts — business.ts yang me-re-export dari sini.
 */

export const WHATSAPP_NUMBER = "6285190021421";

/** Tautan WhatsApp dengan pesan terisi otomatis (FR-005). */
export function waLink(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

/**
 * Pesan pemesanan produk. Varian ikut disertakan supaya pemilik bisnis tahu
 * persis apa yang dipesan (mis. mochi isi 4, bukan isi 8).
 */
export function productOrderMessage(input: {
  productName: string;
  variantName?: string;
}): string {
  const variant = input.variantName ? ` (${input.variantName})` : "";
  return `Halo Delisert, saya ingin memesan ${input.productName}${variant}. Apakah masih tersedia?`;
}
