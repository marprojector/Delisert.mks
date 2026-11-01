import { NAV_LINKS, TIKTOK_LIVE, waLink } from "@delisert.mks-1/api/data/business";
import { Button } from "@delisert.mks-1/ui/components/button";
import { cn } from "@delisert.mks-1/ui/lib/utils";
import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { useMenuOverlay } from "@/lib/motion";

const ORDER_MESSAGE = "Halo Delisert, saya ingin bertanya tentang produk.";

export default function Header() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const [open, setOpen] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const openRef = useRef<HTMLButtonElement>(null);
  const headerRef = useRef<HTMLElement>(null);

  useMenuOverlay(open, overlayRef);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Saat menu terbuka: kunci scroll halaman, fokus ke tombol tutup, Escape menutup.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
      openRef.current?.focus();
    };
  }, [open]);

  // Halaman di belakang menu tidak bisa dijangkau Tab/pembaca layar selama menu terbuka.
  useEffect(() => {
    if (!open) return;
    const background = [
      headerRef.current,
      document.getElementById("main-content"),
      document.querySelector("footer"),
    ].filter((element): element is HTMLElement => element !== null);
    for (const element of background) element.setAttribute("inert", "");
    return () => {
      for (const element of background) element.removeAttribute("inert");
    };
  }, [open]);

  // Menu ini hanya untuk HP; tutup bila layar melebar (mis. tablet diputar).
  useEffect(() => {
    if (!open) return;
    const desktop = window.matchMedia("(min-width: 1024px)");
    const onChange = (event: MediaQueryListEvent) => {
      if (event.matches) setOpen(false);
    };
    if (desktop.matches) setOpen(false);
    desktop.addEventListener("change", onChange);
    return () => desktop.removeEventListener("change", onChange);
  }, [open]);

  const isActive = (to: string) => (to === "/" ? pathname === "/" : pathname.startsWith(to));

  return (
    <>
    <header ref={headerRef} className="sticky top-0 z-50 border-b border-transparent bg-background/90 backdrop-blur-md supports-[backdrop-filter]:bg-background/75">
      <div className="cn-shell flex h-[3.75rem] items-center justify-between gap-4 lg:h-20">
        <Link
          to="/"
          className="cn-font-display text-2xl font-bold text-primary lg:text-[1.75rem]"
          aria-label="Delisert — beranda"
        >
          Delisert
        </Link>

        <nav aria-label="Navigasi utama" className="hidden items-center gap-9 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={cn(
                "relative py-2 text-[0.9375rem] transition-colors after:absolute after:inset-x-0 after:-bottom-0.5 after:h-0.5 after:origin-left after:scale-x-0 after:rounded-full after:bg-primary after:transition-transform after:duration-300 hover:after:scale-x-100",
                isActive(link.to)
                  ? "font-semibold text-primary after:scale-x-100"
                  : "font-medium text-foreground hover:text-primary",
              )}
              aria-current={isActive(link.to) ? "page" : undefined}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button
            className="hidden h-[2.875rem] gap-2.5 rounded-full px-5.5 lg:inline-flex"
            nativeButton={false}
            render={
              <a href={waLink(ORDER_MESSAGE)} target="_blank" rel="noopener noreferrer">
                <span aria-hidden="true" className="size-2.5 rounded-full bg-[#25d366]" />
                Pesan via WhatsApp
              </a>
            }
          />

          <button
            ref={openRef}
            type="button"
            className="flex size-10 items-center justify-center rounded-full bg-secondary text-foreground transition-transform active:scale-95 lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen(true)}
          >
            <Menu aria-hidden="true" className="size-5" />
            <span className="sr-only">Buka menu</span>
          </button>
        </div>
      </div>
    </header>

      {open ? (
        <div
          ref={overlayRef}
          id="mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Menu navigasi"
          className="fixed inset-0 z-[60] flex flex-col overflow-y-auto bg-primary px-5 pb-8 text-primary-foreground lg:hidden"
        >
          <div className="flex h-[3.75rem] shrink-0 items-center justify-between">
            <span className="cn-font-display text-2xl font-bold">Delisert</span>
            <button
              ref={closeRef}
              type="button"
              className="flex size-10 items-center justify-center rounded-full bg-primary-foreground/15"
              onClick={() => setOpen(false)}
            >
              <X aria-hidden="true" className="size-5" />
              <span className="sr-only">Tutup menu</span>
            </button>
          </div>

          <nav aria-label="Navigasi seluler" className="pt-10">
            <ul className="flex flex-col gap-1.5">
              {NAV_LINKS.map((link, index) => (
                <li key={link.to} data-menu-item>
                  <Link
                    to={link.to}
                    // Tutup juga saat mengetuk halaman yang sedang dibuka (path tidak berubah).
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center justify-between py-3 cn-font-display text-4xl font-semibold",
                      isActive(link.to) ? "text-accent" : "text-primary-foreground",
                    )}
                    aria-current={isActive(link.to) ? "page" : undefined}
                  >
                    {link.label}
                    <span className="font-sans text-sm font-normal text-accent">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="mt-auto flex flex-col gap-4 pt-14" data-menu-item>
            <div className="h-px bg-primary-foreground/20" />
            <p className="text-sm text-primary-foreground/80">
              {TIKTOK_LIVE.label} {TIKTOK_LIVE.days} · {TIKTOK_LIVE.hours}
            </p>
            <Button
              className="h-[3.375rem] w-full gap-2.5 rounded-full bg-primary-foreground text-[0.9375rem] font-semibold text-primary hover:bg-primary-foreground/90"
              nativeButton={false}
              render={
                <a href={waLink(ORDER_MESSAGE)} target="_blank" rel="noopener noreferrer">
                  <span aria-hidden="true" className="size-2.5 rounded-full bg-[#25d366]" />
                  Pesan via WhatsApp
                </a>
              }
            />
          </div>
        </div>
      ) : null}
    </>
  );
}
