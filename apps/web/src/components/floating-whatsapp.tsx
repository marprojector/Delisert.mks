import { waLink } from "@delisert.mks-1/api/data/business";

/**
 * Tombol WhatsApp yang melayang di bawah layar HP. Tidak dipakai di halaman
 * detail produk (punya bar pesan sendiri) dan di admin.
 */
export function FloatingWhatsApp({ hidden = false }: { hidden?: boolean }) {
  if (hidden) return null;
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-40 flex justify-center pb-[env(safe-area-inset-bottom)] lg:hidden">
      <a
        href={waLink("Halo Delisert, saya ingin memesan.")}
        target="_blank"
        rel="noopener noreferrer"
        className="pointer-events-auto inline-flex h-[3.375rem] items-center gap-2.5 rounded-full bg-foreground px-6 text-[0.9375rem] font-semibold text-background shadow-lg shadow-foreground/20 transition-transform active:scale-95"
      >
        <span aria-hidden="true" className="size-2.5 rounded-full bg-[#25d366]" />
        Pesan via WhatsApp
      </a>
    </div>
  );
}
