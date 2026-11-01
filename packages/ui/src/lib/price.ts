/**
 * Formatting dan ringkasan harga Delisert.
 *
 * Walaupun namanya `price_cents`, kolom ini menyimpan RUPIAH UTUH, bukan sen
 * (Rp 8.000 disimpan sebagai 8000). Format langsung memakai nilai tersebut;
 * jangan dikali atau dibagi 100. Daftar harga resmi: docs/DESIGN_AUDIT.md §2.
 */

export function formatRupiah(cents: number): string {
  return `Rp ${cents.toLocaleString("id-ID")}`;
}

/** Nilai rupiah untuk structured data JSON-LD (schema.org memakai unit mata uang). */
export function priceToNumber(cents: number): number {
  return cents;
}

export type VariantPriceSummary =
  | { kind: "none" }
  | { kind: "single"; cents: number }
  | { kind: "range"; min: number; max: number };

export function summariseVariantPrice(prices: Array<number | null>): VariantPriceSummary {
  const defined = prices.filter((price): price is number => price !== null);
  if (defined.length === 0) return { kind: "none" };

  const min = Math.min(...defined);
  const max = Math.max(...defined);
  return min === max ? { kind: "single", cents: min } : { kind: "range", min, max };
}
