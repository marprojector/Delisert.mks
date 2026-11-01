/**
 * Konstanta bisnis Delisert. Sumber: docs/PRD.md §6.3 dan docs/TECHNICAL_ARCHITECTURE.md §4.4.
 * Data di file ini sangat jarang berubah dan tidak disimpan di database.
 */

import { WHATSAPP_NUMBER, productOrderMessage, waLink } from "../lib/whatsapp";

export { WHATSAPP_NUMBER, productOrderMessage, waLink };

export const WHATSAPP_DISPLAY = "0851 9002 1421";

export const SOCIAL_MEDIA = [
  {
    id: "instagram",
    platform: "Instagram",
    url: "https://www.instagram.com/delisert.mks/",
    handle: "@delisert.mks",
  },
  {
    id: "tiktok",
    platform: "TikTok",
    url: "https://www.tiktok.com/@delisert.mkss",
    handle: "@delisert.mkss",
  },
] as const;

export const TIKTOK_LIVE = {
  label: "TikTok Live",
  days: "Selasa – Sabtu",
  hours: "10:30 – 14:30 WITA",
  timezone: "WITA",
  ctaLabel: "Follow Delisert on TikTok",
  ctaUrl: "https://www.tiktok.com/@delisert.mkss",
} as const;

export const CFD = {
  description:
    "Setiap hari Minggu, Delisert berjualan langsung di aktivitas Car Free Day (CFD) di Makassar.",
  hours: "06.00 – 10.00 WITA",
  locations: [
    {
      id: "cfd-boulevard",
      name: "CFD Boulevard",
      landmark: "Berhadapan Social Barn",
    },
    {
      id: "cfd-unhas",
      name: "CFD UNHAS",
      landmark: "Berhadapan Masjid UNHAS, area taman",
    },
  ],
  scheduleNote:
    "Jam operasional kedua titik diumumkan melalui media sosial Delisert. Tidak ada jaminan kedua lokasi aktif setiap Minggu.",
} as const;

export const CLOSED_DAY = {
  label: "Senin",
  day: "Senin",
  description: "Tutup / libur",
} as const;

export const OPERATIONAL_ADDRESS = {
  name: "Delisert Mochi and Dessert",
  complex: "Perumahan Villa Surya Mas, Cluster Harmonis 20",
  street: "Jalan Toddopuli Raya Timur No. 20",
  rtRw: "RT.1/RW.24",
  village: "Borong",
  district: "Manggala",
  city: "Makassar",
  province: "Sulawesi Selatan",
  country: "Indonesia",
  postalCode: null as string | null,
  isPublicRetail: false,
  note: "Alamat operasional dapur. Bukan toko ritel publik dan bukan cabang tetap.",
} as const;

export const OPERATIONAL_ADDRESS_MAPS_URL =
  "https://www.google.com/maps/search/?api=1&query=Delisert+Mochi+and+Dessert+Villa+Surya+Mas+Cluster+Harmonis+20+Jalan+Toddopuli+Raya+Timur+Makassar";

export const CFD_MAPS_URLS = {
  "cfd-boulevard":
    "https://www.google.com/maps/search/?api=1&query=CFD+Boulevard+Makassar+Social+Barn",
  "cfd-unhas":
    "https://www.google.com/maps/search/?api=1&query=CFD+UNHAS+Makassar+Masjid+UNHAS",
} as const;

export const DELIVERY_METHODS = [
  { id: "gojek", name: "Gojek / GoSend", note: "Ketersediaan dikonfirmasi saat pemesanan" },
  { id: "grab", name: "GrabExpress", note: "Ketersediaan dikonfirmasi saat pemesanan" },
  { id: "maxim", name: "Maxim", note: "Ketersediaan dikonfirmasi saat pemesanan" },
  { id: "shopee", name: "Shopee", note: "Ketersediaan dikonfirmasi saat pemesanan" },
] as const;

export const PICKUP_INSTRUCTION =
  "Untuk memudahkan pengambilan pesanan, mohon sertakan nomor orderan (4 angka terakhir nomor WhatsApp yang digunakan saat memesan).";

export const NAV_LINKS = [
  { to: "/", label: "Beranda" },
  { to: "/tentang", label: "Tentang" },
  { to: "/menu", label: "Menu" },
  { to: "/jadwal", label: "Jadwal & Lokasi" },
  { to: "/kontak", label: "Kontak" },
] as const;
