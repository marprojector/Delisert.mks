/** Bar pesan yang menempel di bawah layar HP pada halaman detail produk. */
export function StickyOrderBar({
  label,
  priceText,
  href,
}: {
  label: string;
  /** Teks harga, atau elemen harga beranimasi. */
  priceText: React.ReactNode;
  href: string;
}) {
  return (
    <div data-slide-up className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden">
      <div className="flex items-center justify-between gap-3 px-5 py-3.5">
        <div className="flex min-w-0 flex-col">
          <span className="truncate text-xs text-muted-foreground">{label}</span>
          <span className="text-lg font-bold text-foreground">{priceText}</span>
        </div>
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-[3.25rem] shrink-0 items-center gap-2.5 rounded-full bg-primary px-5.5 text-[0.9375rem] font-semibold text-primary-foreground transition-transform active:scale-[0.97]"
        >
          <span aria-hidden="true" className="size-2.5 rounded-full bg-[#25d366]" />
          Pesan via WhatsApp
        </a>
      </div>
    </div>
  );
}
