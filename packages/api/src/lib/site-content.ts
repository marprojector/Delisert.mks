/**
 * Konten website yang bisa diubah pemilik dari admin (dan lewat MCP).
 *
 * Setiap bagian disimpan sebagai satu baris JSON di tabel `site_settings`.
 * Bagian yang belum pernah diubah, atau isinya rusak, memakai nilai bawaan di
 * bawah — nilai bawaan ini sama persis dengan isi website sebelum fitur ini ada.
 */
import { z } from "zod";

import {
  CFD,
  CFD_MAPS_URLS,
  DELIVERY_METHODS,
  OPERATIONAL_ADDRESS,
  OPERATIONAL_ADDRESS_MAPS_URL,
  PICKUP_INSTRUCTION,
  SOCIAL_MEDIA,
  TIKTOK_LIVE,
  WHATSAPP_DISPLAY,
  WHATSAPP_NUMBER,
} from "../data/business";

const text = (max: number) => z.string().trim().max(max);
const requiredText = (max: number) => z.string().trim().min(1, "Wajib diisi.").max(max);
/** URL http(s) atau path lokal (foto unggahan "/api/photos/..."), boleh kosong. */
const optionalUrl = z
  .string()
  .trim()
  .max(500)
  .refine((value) => value === "" || /^https?:\/\//.test(value) || value.startsWith("/api/photos/"), {
    message: "Harus berupa tautan http(s) atau foto unggahan.",
  });
const requiredUrl = z
  .string()
  .trim()
  .max(500)
  .refine((value) => /^https?:\/\//.test(value), { message: "Harus berupa tautan http(s)." });

export const DAY_KINDS = ["off", "live", "cfd"] as const;
export type DayKind = (typeof DAY_KINDS)[number];

export const siteContentSchema = z.object({
  brand: z.object({
    /** Nomor WhatsApp format internasional tanpa "+", mis. 6285190021421. */
    whatsappNumber: z.string().trim().regex(/^62\d{8,13}$/, "Gunakan format 62xxxxxxxxxx."),
    whatsappDisplay: requiredText(30),
    instagramUrl: requiredUrl,
    instagramHandle: requiredText(60),
    tiktokUrl: requiredUrl,
    tiktokHandle: requiredText(60),
    footerBlurb: text(240),
    /** Pita pengumuman di atas header, mis. "PO lebaran dibuka". */
    announcementEnabled: z.boolean(),
    announcementText: text(160),
    announcementUrl: optionalUrl,
  }),
  home: z.object({
    heroTitleLine1: requiredText(60),
    heroTitleLine2: text(60),
    heroLead: text(280),
    /** Foto hero (maks. 3). Kosong = memakai foto produk unggulan. */
    heroImages: z.array(optionalUrl).max(3),
    featuredEyebrow: requiredText(40),
    featuredTitle: requiredText(80),
    showCategories: z.boolean(),
    showStory: z.boolean(),
    storyEyebrow: text(40),
    storyTitle: text(120),
    storyText: text(400),
    storyImage: optionalUrl,
  }),
  schedule: z.object({
    /** Senin → Minggu. Mengatur pita minggu di halaman Jadwal. */
    week: z.array(z.enum(DAY_KINDS)).length(7),
    liveLabel: requiredText(40),
    liveDays: requiredText(60),
    liveHours: requiredText(60),
    liveNote: text(240),
    liveCtaLabel: requiredText(60),
    liveCtaUrl: requiredUrl,
    cfdHours: requiredText(60),
    cfdDescription: text(400),
    cfdLocations: z
      .array(
        z.object({
          name: requiredText(60),
          landmark: text(120),
          mapsUrl: optionalUrl,
        }),
      )
      .max(6),
    cfdNote: text(400),
    addressName: requiredText(120),
    addressText: requiredText(400),
    addressNote: text(240),
    addressMapsUrl: optionalUrl,
  }),
  about: z.object({
    titleLine1: requiredText(80),
    titleLine2: text(80),
    image: optionalUrl,
    storyLead: text(400),
    storyBody: text(800),
    stats: z.array(z.object({ value: requiredText(12), label: requiredText(60) })).max(4),
    steps: z.array(z.object({ title: requiredText(80), body: text(240) })).max(6),
    ctaTitle: requiredText(80),
    ctaText: text(240),
  }),
  contact: z.object({
    intro: text(200),
    whatsappNote: text(240),
    orderSteps: z.array(requiredText(120)).max(6),
    pickupInstruction: text(400),
    deliveryMethods: z.array(requiredText(60)).max(10),
    deliveryNote: text(200),
  }),
});

export type SiteContent = z.infer<typeof siteContentSchema>;
export type SiteSection = keyof SiteContent;
export const SITE_SECTIONS = Object.keys(siteContentSchema.shape) as SiteSection[];

const fullAddress = [
  OPERATIONAL_ADDRESS.complex,
  OPERATIONAL_ADDRESS.street,
  OPERATIONAL_ADDRESS.rtRw,
  OPERATIONAL_ADDRESS.village,
  OPERATIONAL_ADDRESS.district,
  OPERATIONAL_ADDRESS.city,
  OPERATIONAL_ADDRESS.province,
].join(", ");

const instagram = SOCIAL_MEDIA.find((item) => item.id === "instagram")!;
const tiktok = SOCIAL_MEDIA.find((item) => item.id === "tiktok")!;

export const DEFAULT_SITE_CONTENT: SiteContent = {
  brand: {
    whatsappNumber: WHATSAPP_NUMBER,
    whatsappDisplay: WHATSAPP_DISPLAY,
    instagramUrl: instagram.url,
    instagramHandle: instagram.handle,
    tiktokUrl: tiktok.url,
    tiktokHandle: tiktok.handle,
    footerBlurb: "Dessert homemade Makassar sejak 2021. Pesan langsung lewat WhatsApp.",
    announcementEnabled: false,
    announcementText: "",
    announcementUrl: "",
  },
  home: {
    heroTitleLine1: "Mochi lembut,",
    heroTitleLine2: "dibuat setiap hari.",
    heroLead:
      "Mochi, pancake durian, mango sticky rice, dan mille crepes homemade. Pesan langsung lewat WhatsApp.",
    heroImages: [],
    featuredEyebrow: "Menu Andalan",
    featuredTitle: "Yang paling sering dipesan",
    showCategories: true,
    showStory: true,
    storyEyebrow: "Cerita kami",
    storyTitle: "Dimulai dari satu mangkuk mochi di CFD Boulevard.",
    storyText:
      "Sejak 2021 dapur kecil kami di Makassar membuat dessert dalam batch terbatas, supaya setiap porsi tetap segar.",
    storyImage: "",
  },
  schedule: {
    week: ["off", "live", "live", "live", "live", "live", "cfd"],
    liveLabel: TIKTOK_LIVE.label,
    liveDays: TIKTOK_LIVE.days,
    liveHours: TIKTOK_LIVE.hours,
    liveNote: "Kanal jualan utama kami. Promo batch dan PO diumumkan saat live.",
    liveCtaLabel: `Follow ${tiktok.handle}`,
    liveCtaUrl: TIKTOK_LIVE.ctaUrl,
    cfdHours: CFD.hours,
    cfdDescription: CFD.description,
    cfdLocations: CFD.locations.map((location) => ({
      name: location.name,
      landmark: location.landmark,
      mapsUrl: CFD_MAPS_URLS[location.id],
    })),
    cfdNote: CFD.scheduleNote,
    addressName: OPERATIONAL_ADDRESS.name,
    addressText: fullAddress,
    addressNote: OPERATIONAL_ADDRESS.note,
    addressMapsUrl: OPERATIONAL_ADDRESS_MAPS_URL,
  },
  about: {
    titleLine1: "Dapur kecil di Makassar yang",
    titleLine2: "memulai dari satu mangkuk mochi.",
    image: "",
    storyLead:
      "Delisert dimulai pada 2021 dengan satu produk andalan: mochi buatan sendiri, dijual sepanjang Jalan Boulevard saat Car Free Day.",
    storyBody:
      "Respons yang datang membuat lini produk berkembang. Dapur kami menambah pancake durian, mango sticky rice, mille crepes, Dubai chewy cookie, dan slice cake — semua tetap dibuat dalam batch terbatas agar kualitas terjaga.",
    stats: [
      { value: "2021", label: "mulai berjualan di CFD" },
      { value: "8", label: "varian rasa mochi" },
      { value: "6", label: "kategori dessert" },
    ],
    steps: [
      {
        title: "Batch harian terbatas",
        body: "Dibuat segar setiap hari. Ketersediaan dipastikan ulang lewat WhatsApp sebelum diproses.",
      },
      {
        title: "Pesan lewat WhatsApp",
        body: "Pesan lewat WhatsApp, lalu dikirim via layanan antar yang tersedia.",
      },
      { title: "Hadir setiap Minggu di CFD", body: "Titik jual di CFD Boulevard dan CFD UNHAS." },
    ],
    ctaTitle: "Ada pertanyaan soal produk?",
    ctaText: "Sebutkan nama produknya, tim kami membalas di jam operasional.",
  },
  contact: {
    intro: "Semua pesanan lewat WhatsApp. Tidak perlu daftar akun.",
    whatsappNote: "Sertakan nama produk dan ukuran supaya kami bisa membalas lebih cepat.",
    orderSteps: [
      "Pilih produk dan ukuran di Menu",
      'Tekan "Pesan via WhatsApp" — pesan sudah terisi',
      "Konfirmasi stok, harga, dan pengiriman",
    ],
    pickupInstruction: PICKUP_INSTRUCTION,
    deliveryMethods: DELIVERY_METHODS.map((method) => method.name),
    deliveryNote: "Ketersediaan dan ongkir dikonfirmasi saat memesan.",
  },
};

/**
 * Gabungkan baris `site_settings` dengan nilai bawaan. Bagian yang rusak atau
 * tidak lolos validasi diabaikan (memakai bawaan) supaya website tidak pernah
 * gagal tampil karena satu isian.
 */
export function resolveSiteContent(rows: ReadonlyArray<{ key: string; value: string }>): SiteContent {
  const content: SiteContent = structuredClone(DEFAULT_SITE_CONTENT);
  for (const row of rows) {
    if (!(SITE_SECTIONS as string[]).includes(row.key)) continue;
    const section = row.key as SiteSection;
    let stored: unknown;
    try {
      stored = JSON.parse(row.value);
    } catch {
      continue;
    }
    if (!stored || typeof stored !== "object") continue;
    const merged = { ...DEFAULT_SITE_CONTENT[section], ...(stored as object) };
    const parsed = siteContentSchema.shape[section].safeParse(merged);
    if (parsed.success) (content as Record<SiteSection, unknown>)[section] = parsed.data;
  }
  return content;
}

/** Tautan wa.me dengan nomor dari konten website. */
export function waLinkFor(number: string, message: string): string {
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
