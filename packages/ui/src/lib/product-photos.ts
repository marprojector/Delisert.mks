/**
 * Foto yang ditampilkan untuk sebuah produk.
 *
 * - Foto produk sendiri selalu paling depan bila ada.
 * - Bila "foto otomatis dari rasa" aktif, foto setiap rasa (yang punya foto)
 *   ikut ditampilkan — kartu menu menggilirnya, galeri menampilkannya semua.
 * - Foto rasa yang sedang dipilih pelanggan selalu ditaruh paling depan.
 */
export type ProductPhoto = { url: string; alt: string; flavorName?: string };

export function productPhotos(
  product: {
    name: string;
    imageUrl: string | null;
    imageAlt?: string | null;
    useFlavorPhotos?: boolean;
    flavors?: ReadonlyArray<{ name: string; imageUrl?: string | null; isAvailable?: boolean }>;
  },
  selectedFlavor?: string | null,
): ProductPhoto[] {
  const own: ProductPhoto | null = product.imageUrl
    ? { url: product.imageUrl, alt: product.imageAlt ?? `Foto ${product.name} Delisert Makassar` }
    : null;
  const flavorPhotos: ProductPhoto[] = (product.flavors ?? [])
    .filter((flavor) => flavor.imageUrl)
    .map((flavor) => ({
      url: flavor.imageUrl!,
      alt: `${product.name} rasa ${flavor.name}`,
      flavorName: flavor.name,
    }));

  const selected = selectedFlavor ? flavorPhotos.find((photo) => photo.flavorName === selectedFlavor) : undefined;
  const rest = product.useFlavorPhotos ? [own, ...flavorPhotos] : [own];
  const ordered = [selected, ...rest].filter((photo): photo is ProductPhoto => Boolean(photo));

  // Foto yang sama (mis. rasa terpilih) tidak ditampilkan dua kali.
  const seen = new Set<string>();
  return ordered.filter((photo) => (seen.has(photo.url) ? false : (seen.add(photo.url), true)));
}
