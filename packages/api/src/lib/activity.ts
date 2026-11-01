/**
 * Kalimat log aktivitas untuk setiap perubahan dari admin atau MCP.
 * Mengembalikan null untuk aksi yang tidak perlu dicatat.
 */

const AVAILABILITY: Record<string, string> = {
  available: "Tersedia",
  preorder: "Pre-Order",
  soldout: "Habis",
};

const SECTION: Record<string, string> = {
  brand: "Brand & kontak",
  home: "Beranda",
  schedule: "Jadwal & lokasi",
  about: "Tentang",
  contact: "Kontak",
};

type Input = Record<string, unknown>;

const quoted = (value: unknown) => (typeof value === "string" && value ? `“${value}”` : "");
const ref = (input: Input, noun: string) => quoted(input.name) || `${noun} #${String(input.id ?? input.productId ?? "?")}`;

export function describeActivity(path: string, raw: unknown): { action: string; summary: string } | null {
  const input = (raw && typeof raw === "object" ? raw : {}) as Input;
  const describe: Record<string, () => string> = {
    "adminProduct.create": () => `Menambah produk ${quoted(input.name)}`,
    "adminProduct.update": () => `Mengubah produk ${ref(input, "produk")}`,
    "adminProduct.remove": () => `Menghapus produk #${String(input.id)}`,
    "adminProduct.setAvailability": () =>
      `Menandai produk #${String(input.id)} sebagai ${AVAILABILITY[String(input.availability)] ?? input.availability}`,
    "adminProduct.move": () => `Mengubah urutan produk #${String(input.id)}`,
    "adminProduct.addVariant": () => `Menambah varian ${quoted(input.name)} ke produk #${String(input.productId)}`,
    "adminProduct.updateVariant": () => `Mengubah varian #${String(input.id)}`,
    "adminProduct.removeVariant": () => `Menghapus varian #${String(input.id)}`,
    "adminCategory.create": () => `Menambah kategori ${quoted(input.name)}`,
    "adminCategory.update": () => `Mengubah kategori ${ref(input, "kategori")}`,
    "adminCategory.move": () => `Mengubah urutan kategori #${String(input.id)}`,
    "adminCategory.remove": () => `Menghapus kategori #${String(input.id)}`,
    "adminSite.update": () => `Mengubah konten ${SECTION[String(input.section)] ?? input.section}`,
    "adminSite.reset": () => `Mengembalikan konten ${SECTION[String(input.section)] ?? input.section} ke bawaan`,
    "adminMcp.create": () => `Membuat token MCP ${quoted(input.name)}`,
    "adminMcp.revoke": () => `Mencabut token MCP #${String(input.id)}`,
  };
  const text = describe[path];
  return text ? { action: path, summary: text().replace(/\s+/g, " ").trim() } : null;
}
