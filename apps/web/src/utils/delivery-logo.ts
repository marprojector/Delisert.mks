/**
 * Logo resmi layanan antar (sumber: Wikimedia Commons, disimpan di
 * public/logos). Nama layanan bisa diubah pemilik di admin → Konten, jadi
 * dicocokkan berdasarkan kata kunci; nama yang tidak dikenal tampil sebagai teks.
 */
export type DeliveryLogo = { src: string; width: number; height: number; className: string };

const LOGOS: ReadonlyArray<{ match: RegExp; logo: DeliveryLogo }> = [
  { match: /go\s*jek|go\s*send|go\s*food/i, logo: { src: "/logos/gojek.svg", width: 112, height: 32, className: "h-6 lg:h-7" } },
  { match: /grab/i, logo: { src: "/logos/grab.svg", width: 400, height: 142, className: "h-6 lg:h-7" } },
  { match: /maxim/i, logo: { src: "/logos/maxim.svg", width: 300, height: 105, className: "h-5 lg:h-6" } },
  { match: /shopee/i, logo: { src: "/logos/shopee.svg", width: 264, height: 375, className: "h-9 lg:h-10" } },
];

export function deliveryLogo(name: string): DeliveryLogo | null {
  return LOGOS.find((item) => item.match.test(name))?.logo ?? null;
}
