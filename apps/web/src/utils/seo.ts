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

export const siteUrl = createIsomorphicFn()
  .server(() => getRequestUrl({ xForwardedHost: true }).origin)
  .client(() => window.location.origin);

export function canonical(path: string, origin?: string): string {
  return joinOrigin(origin ?? siteUrl(), path);
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

export function productJsonLd(product: {
  name: string;
  description: string | null;
  priceCents: number | null;
  imageUrl: string | null;
}): JsonLd {
  // priceCents menyimpan rupiah ×100, jadi nilainya langsung dipakai
  // sebagai nominal rupiah di schema.org (Rp 8.000 → 8000).
  const price = product.priceCents !== null ? priceToNumber(product.priceCents) : undefined;
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    ...(product.description ? { description: product.description } : {}),
    ...(product.imageUrl ? { image: [product.imageUrl] } : {}),
    brand: { "@type": "Brand", name: "Delisert" },
    ...(price !== undefined
      ? {
          offers: {
            "@type": "Offer",
            priceCurrency: "IDR",
            price,
            availability: "https://schema.org/InStock",
          },
        }
      : {}),
  };
}

export { waLink };
