import {
  DEFAULT_SITE_CONTENT,
  type SiteContent,
  waLinkFor,
} from "@delisert.mks-1/api/lib/site-content";
import { useQuery } from "@tanstack/react-query";

import { useTRPC } from "@/utils/trpc";

/**
 * Konten website (teks, jadwal, kontak) yang diatur pemilik di admin → Konten.
 * Dimuat sekali oleh loader root sehingga SSR sudah memakai isi terbaru; nilai
 * bawaan hanya dipakai bila server tidak bisa dihubungi.
 */
export function useSiteContent(): SiteContent {
  const trpc = useTRPC();
  const query = useQuery({ ...trpc.site.content.queryOptions(), staleTime: 60_000 });
  return query.data ?? DEFAULT_SITE_CONTENT;
}

/** Pembuat tautan WhatsApp dengan nomor dari konten website. */
export function useWaLink(): (message: string) => string {
  const { brand } = useSiteContent();
  return (message) => waLinkFor(brand.whatsappNumber, message);
}

export const ORDER_MESSAGE = "Halo Delisert, saya ingin memesan.";
export const ASK_MESSAGE = "Halo Delisert, saya ingin bertanya.";
