/**
 * Geser satu item naik/turun dalam daftar berurutan. Mengembalikan urutan
 * baru (0, 1, 2, …) untuk SEMUA id, sehingga nilai display_order yang dobel
 * atau bolong ikut dirapikan. null bila item tidak ditemukan atau sudah di ujung.
 */
export function moveInOrder(
  orderedIds: readonly number[],
  id: number,
  direction: "up" | "down",
): Array<{ id: number; displayOrder: number }> | null {
  const index = orderedIds.indexOf(id);
  if (index === -1) return null;
  const target = direction === "up" ? index - 1 : index + 1;
  if (target < 0 || target >= orderedIds.length) return null;
  const next = [...orderedIds];
  [next[index], next[target]] = [next[target]!, next[index]!];
  return next.map((itemId, displayOrder) => ({ id: itemId, displayOrder }));
}
