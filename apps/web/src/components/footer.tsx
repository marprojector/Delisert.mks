import { NAV_LINKS } from "@delisert.mks-1/api/data/business";
import { weekSummary } from "@delisert.mks-1/api/lib/site-content";
import { Link } from "@tanstack/react-router";

import { ASK_MESSAGE, useSiteContent, useWaLink } from "@/lib/site";

export function Footer({ phoneBottomGap = false }: { phoneBottomGap?: boolean }) {
  const { brand, schedule } = useSiteContent();
  const waLink = useWaLink();
  const lines = weekSummary(schedule.week, schedule.liveLabel);
  const socials = [
    { id: "instagram", platform: "Instagram", url: brand.instagramUrl, handle: brand.instagramHandle },
    { id: "tiktok", platform: "TikTok", url: brand.tiktokUrl, handle: brand.tiktokHandle },
  ];
  return (
    <footer className="bg-foreground text-background">
      <div className="cn-shell grid gap-10 py-14 lg:grid-cols-[1.4fr_1fr_1fr_1fr] lg:py-16">
        <div className="flex flex-col gap-4">
          <span className="cn-font-display text-[1.75rem] font-bold lg:text-[2rem]">Delisert</span>
          <p className="max-w-sm text-sm/relaxed text-background/75">
            {brand.footerBlurb}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-10 lg:contents">
          <nav aria-label="Navigasi footer" className="flex flex-col gap-3">
            <h2 className="cn-eyebrow font-sans text-accent">Halaman</h2>
            <ul className="flex flex-col gap-2.5 text-sm">
              {NAV_LINKS.filter((link) => link.to !== "/").map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="transition-colors hover:text-accent">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex flex-col gap-3">
            <h2 className="cn-eyebrow font-sans text-accent">Jadwal</h2>
            <ul className="flex flex-col gap-2.5 text-sm">
              {lines.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <h2 className="cn-eyebrow font-sans text-accent">Kontak</h2>
          <ul className="flex flex-wrap gap-2 text-sm lg:flex-col lg:gap-2.5">
            <li>
              <a
                href={waLink(ASK_MESSAGE)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex rounded-full border border-background/20 px-3.5 py-2 transition-colors hover:border-accent hover:text-accent lg:border-0 lg:p-0"
              >
                {brand.whatsappDisplay}
              </a>
            </li>
            {socials.map((social) => (
              <li key={social.id}>
                <a
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex rounded-full border border-background/20 px-3.5 py-2 transition-colors hover:border-accent hover:text-accent lg:border-0 lg:p-0"
                >
                  <span className="sr-only">{social.platform} </span>
                  {social.handle}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
      {/* Di HP, baris terakhir diberi ruang setinggi tombol WA melayang / bar pesan. */}
      <div
        className={
          phoneBottomGap
            ? "cn-shell border-t border-background/10 pt-6 pb-[calc(6.5rem+env(safe-area-inset-bottom))] text-xs text-background/55 lg:pb-6"
            : "cn-shell border-t border-background/10 py-6 text-xs text-background/55"
        }
      >
        © {new Date().getFullYear()} Delisert Makassar
      </div>
    </footer>
  );
}
