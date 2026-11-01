export type Availability = "available" | "preorder" | "soldout";
export type StatusFilter = "all" | Availability;

/** Pencarian nama (tanpa peduli huruf besar/kecil) + filter ketersediaan di daftar produk admin. */
export function filterProducts<Row extends { name: string; availability: Availability }>(
  rows: readonly Row[],
  query: string,
  status: StatusFilter,
): Row[] {
  const needle = query.trim().toLowerCase();
  return rows.filter(
    (row) =>
      (status === "all" || row.availability === status) &&
      (needle === "" || row.name.toLowerCase().includes(needle)),
  );
}
