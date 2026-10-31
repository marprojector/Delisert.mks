import {
  OPERATIONAL_ADDRESS,
  SOCIAL_MEDIA,
  WHATSAPP_NUMBER,
  waLink,
} from "@delisert.mks-1/api/data/business";

/**
 * Helper metadata SEO terpusat. SITE_URL di-resolve saat runtime agar
 * canonical/OG/sitemap mengikuti environment (lokal vs produksi).
 * Tidak memfabricasi klaim — hanya fakta dari business.ts.
 */
export function siteUrl(): string {
  return (
    (import.meta as unknown as { env?: Record<string, string | undefined> }).env?.VITE_SITE_URL ??
    "http://localhost:3001"
  );
}

export function canonical(path: string): string {
  return `${siteUrl().replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`;
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
  // priceCents menyimpan rupiah*1000 (80.000 sen = Rp 8.000).
  const price = product.priceCents !== null ? product.priceCents / 1000 : undefined;
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
