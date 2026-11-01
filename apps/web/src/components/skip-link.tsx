/**
 * Tautan lompat-ke-konten untuk pengguna keyboard dan pembaca layar.
 * Tersembunyi secara visual sampai menerima fokus.
 */
export function SkipLink() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:border focus:border-primary focus:bg-background focus:px-4 focus:py-2 focus:text-sm focus:font-medium"
    >
      Lompat ke konten utama
    </a>
  );
}
