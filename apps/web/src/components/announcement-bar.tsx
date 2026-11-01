import { useSiteContent } from "@/lib/site";

/** Pita pengumuman di atas header, diatur di admin → Konten → Brand & kontak. */
export function AnnouncementBar() {
  const { brand } = useSiteContent();
  if (!brand.announcementEnabled || !brand.announcementText) return null;
  const text = <span className="line-clamp-2">{brand.announcementText}</span>;
  return (
    <div className="bg-foreground px-4 py-2.5 text-center text-[0.8125rem] font-medium text-background lg:text-sm">
      {brand.announcementUrl ? (
        <a
          href={brand.announcementUrl}
          target={brand.announcementUrl.startsWith("http") ? "_blank" : undefined}
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 underline-offset-4 hover:underline"
        >
          {text}
          <span aria-hidden="true">→</span>
        </a>
      ) : (
        text
      )}
    </div>
  );
}
