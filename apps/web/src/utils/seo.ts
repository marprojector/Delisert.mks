import { priceToNumber } from "@delisert.mks-1/ui/lib/price";
import {
  OPERATIONAL_ADDRESS,
  SOCIAL_MEDIA,
  WHATSAPP_NUMBER,
  waLink,
} from "@delisert.mks-1/api/data/business";
import { createIsomorphicFn } from "@tanstack/react-start";
import { getRequestUrl } from "@tanstack/react-start/server";

/**
 * Helper metadata SEO terpusat. Origin diambil dari request saat SSR dan dari
 * `window.location` di browser, sehingga canonical/OG/sitemap selalu menunjuk
 * ke domain yang benar-benar melayani halaman (lokal maupun produksi).
 * Tidak memfabricasi klaim — hanya fakta dari business.ts.
 */
export function joinOrigin(origin: string, path: string): string {
  const base = origin.replace(/\/$/, "");
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

// Origin diambil dari Host request yang benar-benar diterima Worker. Jangan
// percaya X-Forwarded-Host: header itu bebas diisi klien, dan hasilnya masuk
// ke canonical, JSON-LD, dan sitemap.xml yang di-cache publik.
export const siteUrl = createIsomorphicFn()
  .server(() => getRequestUrl().origin)
  .client(() => window.location.origin);

export function canonical(path: string, origin?: string): string {
  return joinOrigin(origin ?? siteUrl(), path);
}

/** URL yang sudah absolut dibiarkan; path relatif digabung dengan origin. */
export function absoluteUrl(url: string, origin?: string): string {
  return /^https?:\/\//i.test(url) ? url : joinOrigin(origin ?? siteUrl(), url);
}

type JsonLd = Record<string, unknown>;

export function localBusinessJsonLd(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "FoodEstablishment",
    name: "Delisert",
    description:
      "Dessert dan makanan homemade Makassar sejak 2021. Mochi, pancake durian, mango sticky rice, mille crepes, Dubai chewy cookie, dan slice cake.",
    foundingDate: "2021",
    telephone: `+${WHATSAPP_NUMBER}`,
    servesCuisine: "Dessert",
    priceRange: "Rp 8.000 - Rp 50.000",
    address: {
      "@type": "PostalAddress",
      streetAddress: `${OPERATIONAL_ADDRESS.complex}, ${OPERATIONAL_ADDRESS.street}, ${OPERATIONAL_ADDRESS.rtRw}`,
      addressLocality: OPERATIONAL_ADDRESS.city,
      addressRegion: OPERATIONAL_ADDRESS.province,
      addressCountry: "ID",
    },
    sameAs: SOCIAL_MEDIA.map((s) => s.url),
  };
}

export function productJsonLd(
  product: {
    name: string;
    description: string | null;
    priceCents: number | null;
    imageUrl: string | null;
    slug?: string;
    availability?: "available" | "preorder" | "soldout";
  },
  origin?: string,
): JsonLd {
  // priceCents menyimpan rupiah utuh, jadi nilainya langsung dipakai
  // sebagai nominal rupiah di schema.org (Rp 8.000 → 8000).
  const price = product.priceCents !== null ? priceToNumber(product.priceCents) : undefined;
  const base = origin ?? siteUrl();
  const availability =
    product.availability === "soldout"
      ? "https://schema.org/OutOfStock"
      : product.availability === "preorder"
        ? "https://schema.org/PreOrder"
        : "https://schema.org/InStock";

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    ...(product.slug ? { url: canonical(`/menu/${product.slug}`, base) } : {}),
    ...(product.description ? { description: product.description } : {}),
    // Foto unggahan disimpan sebagai path relatif (/api/photos/...);
    // schema.org butuh URL absolut.
    ...(product.imageUrl ? { image: [absoluteUrl(product.imageUrl, base)] } : {}),
    brand: { "@type": "Brand", name: "Delisert" },
    // Tanpa harga, `offers` sengaja dihilangkan — jangan pernah mengarang
    // harga 0 untuk produk yang harganya belum ditentukan.
    ...(price !== undefined
      ? {
          offers: {
            "@type": "Offer",
            priceCurrency: "IDR",
            price,
            availability,
            ...(product.slug ? { url: canonical(`/menu/${product.slug}`, base) } : {}),
          },
        }
      : {}),
  };
}

export { waLink };
