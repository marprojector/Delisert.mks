import { NAV_LINKS } from "@delisert.mks-1/api/data/business";
import { Button } from "@delisert.mks-1/ui/components/button";
import { cn } from "@delisert.mks-1/ui/lib/utils";
import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, MessageCircle, X } from "lucide-react";
import { useEffect, useState } from "react";
import { waLink } from "@delisert.mks-1/api/data/business";

export default function Header() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const isActive = (to: string) => (to === "/" ? pathname === "/" : pathname.startsWith(to));

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2.5">
          <span
            aria-hidden="true"
            className="flex size-9 items-center justify-center bg-primary text-sm font-semibold text-primary-foreground cn-font-display"
          >
            D
          </span>
          <span className="flex flex-col leading-none">
            <span className="cn-font-display text-lg text-primary">Delisert</span>
            <span className="text-[0.625rem] tracking-[0.18em] text-muted-foreground uppercase">
              Makassar
            </span>
          </span>
        </Link>

        <nav aria-label="Navigasi utama" className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={cn(
                "px-3 py-2 text-sm transition-colors",
                isActive(link.to)
                  ? "text-primary font-medium"
                  : "text-muted-foreground hover:text-foreground",
              )}
              aria-current={isActive(link.to) ? "page" : undefined}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            className="hidden sm:inline-flex"
            render={
              <a href={waLink("Halo Delisert, saya ingin bertanya tentang produk.")} target="_blank" rel="noopener noreferrer">
                <MessageCircle aria-hidden="true" />
                Pesan WhatsApp
              </a>
            }
          />

          <Button
            variant="outline"
            size="icon-sm"
            className="lg:hidden"
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
            onClick={() => setMobileOpen((open) => !open)}
          >
            {mobileOpen ? (
              <X aria-hidden="true" />
            ) : (
              <Menu aria-hidden="true" />
            )}
            <span className="sr-only">{mobileOpen ? "Tutup menu" : "Buka menu"}</span>
          </Button>
        </div>
      </div>

      {mobileOpen ? (
        <nav
          id="mobile-nav"
          aria-label="Navigasi seluler"
          className="border-t border-border bg-background lg:hidden"
        >
          <ul className="mx-auto max-w-6xl px-4 py-2 sm:px-6">
            {NAV_LINKS.map((link) => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  className={cn(
                    "block border-b border-border/60 py-3 text-sm last:border-b-0",
                    isActive(link.to) ? "text-primary font-medium" : "text-foreground",
                  )}
                  aria-current={isActive(link.to) ? "page" : undefined}
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li className="pt-3 pb-1">
              <Button
                size="sm"
                className="w-full"
                render={
                  <a
                    href={waLink("Halo Delisert, saya ingin bertanya tentang produk.")}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MessageCircle aria-hidden="true" />
                    Pesan WhatsApp
                  </a>
                }
              />
            </li>
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
