import { cn } from "@delisert.mks-1/ui/lib/utils";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  BarChart3,
  Bot,
  ExternalLink,
  FileText,
  LayoutDashboard,
  LogOut,
  type LucideIcon,
  Menu,
  Package,
  Tags,
  X,
} from "lucide-react";
import { type ReactNode, useEffect, useRef, useState } from "react";

type NavTo = "/admin" | "/admin/analitik" | "/admin/produk" | "/admin/kategori" | "/admin/konten" | "/admin/mcp";

type NavItem = { to: NavTo; label: string; icon: LucideIcon; exact?: boolean };

const NAV_GROUPS: ReadonlyArray<{ label: string; items: NavItem[] }> = [
  {
    label: "Utama",
    items: [
      { to: "/admin", label: "Ringkasan", icon: LayoutDashboard, exact: true },
      { to: "/admin/analitik", label: "Analitik", icon: BarChart3 },
    ],
  },
  {
    label: "Katalog",
    items: [
      { to: "/admin/produk", label: "Produk", icon: Package },
      { to: "/admin/kategori", label: "Kategori", icon: Tags },
    ],
  },
  {
    label: "Website",
    items: [
      { to: "/admin/konten", label: "Konten website", icon: FileText },
      { to: "/admin/mcp", label: "MCP & asisten AI", icon: Bot },
    ],
  },
];

const TABS: NavItem[] = [
  { to: "/admin", label: "Ringkasan", icon: LayoutDashboard, exact: true },
  { to: "/admin/produk", label: "Produk", icon: Package },
  { to: "/admin/konten", label: "Konten", icon: FileText },
  { to: "/admin/analitik", label: "Analitik", icon: BarChart3 },
];

const isActive = (pathname: string, item: NavItem) => {
  const path = pathname.replace(/\/$/, "") || "/";
  return item.exact ? path === item.to : path === item.to || path.startsWith(`${item.to}/`);
};

/**
 * Kerangka admin. Desktop: sidebar kiri berkelompok. HP: bilah atas dengan
 * menu lengkap, plus tab bawah untuk halaman yang paling sering dibuka.
 */
export function AdminShell({
  children,
  productCount,
  onLogout,
}: {
  children: ReactNode;
  productCount?: number;
  onLogout: () => void;
}) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const [drawerOpen, setDrawerOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);

  // Tutup saat menekan tautan mana pun — termasuk halaman yang sedang dibuka,
  // yang tidak mengubah path (sebelumnya menu tampak "macet" di kasus itu).
  const onNavigate = () => setDrawerOpen(false);
  const openDrawer = (event: { currentTarget: HTMLElement }) => {
    openerRef.current = event.currentTarget;
    setDrawerOpen(true);
  };

  useEffect(() => setDrawerOpen(false), [pathname]);
  useEffect(() => {
    if (!drawerOpen) return;
    // Kunci gulir halaman di belakang menu, fokus ke tombol tutup.
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus({ preventScroll: true });
    const close = (event: KeyboardEvent) => event.key === "Escape" && setDrawerOpen(false);
    window.addEventListener("keydown", close);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", close);
      openerRef.current?.focus({ preventScroll: true });
    };
  }, [drawerOpen]);

  const nav = (
    <nav aria-label="Navigasi admin" className="flex flex-col gap-6">
      {NAV_GROUPS.map((group) => (
        <div key={group.label} className="flex flex-col gap-1">
          <span className="px-3 pb-1 text-[0.6875rem] font-semibold tracking-[0.12em] text-muted-foreground/80 uppercase">
            {group.label}
          </span>
          {group.items.map((item) => {
            const active = isActive(pathname, item);
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={onNavigate}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "group flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-[0.9375rem] transition-colors active:scale-[0.98]",
                  active
                    ? "bg-primary font-semibold text-primary-foreground shadow-sm shadow-primary/20"
                    : "font-medium text-foreground/85 hover:bg-secondary hover:text-foreground",
                )}
              >
                <span className="flex items-center gap-3">
                  <item.icon aria-hidden="true" className="size-[1.125rem]" />
                  {item.label}
                </span>
                {item.to === "/admin/produk" && productCount !== undefined ? (
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums",
                      active ? "bg-primary-foreground/20" : "bg-secondary text-primary",
                    )}
                  >
                    {productCount}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );

  const footer = (
    <div className="flex flex-col gap-2">
      <a
        href="/"
        target="_blank"
        rel="noopener noreferrer"
        onClick={onNavigate}
        className="flex items-center justify-between gap-3 rounded-xl border border-border px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-primary hover:text-primary"
      >
        <span className="flex items-center gap-2.5">
          <span aria-hidden="true" className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-success/60 motion-reduce:hidden" />
            <span className="relative inline-flex size-2 rounded-full bg-success" />
          </span>
          Lihat website
        </span>
        <ExternalLink aria-hidden="true" className="size-4" />
      </a>
      <button
        type="button"
        onClick={() => {
          setDrawerOpen(false);
          onLogout();
        }}
        className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-[#fbe9e7] hover:text-destructive"
      >
        <LogOut aria-hidden="true" className="size-4" />
        Keluar
      </button>
    </div>
  );

  return (
    <div className="min-h-svh bg-muted lg:grid lg:grid-cols-[16.5rem_1fr]">
      <aside className="sticky top-0 hidden h-svh flex-col justify-between gap-6 overflow-y-auto border-r border-border bg-background px-4 py-6 lg:flex">
        <div className="flex flex-col gap-8">
          <Brand />
          {nav}
        </div>
        {footer}
      </aside>

      <div className="flex min-w-0 flex-col pb-24 lg:pb-0">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border/70 bg-background/90 px-4 backdrop-blur lg:hidden">
          <Brand compact />
          <button
            type="button"
            onClick={openDrawer}
            aria-expanded={drawerOpen}
            aria-controls="admin-drawer"
            className="flex size-10 items-center justify-center rounded-full bg-secondary text-foreground"
          >
            <Menu aria-hidden="true" className="size-5" />
            <span className="sr-only">Buka menu admin</span>
          </button>
        </header>
        <div className="mx-auto w-full max-w-[90rem] px-4 pt-5 pb-10 sm:px-6 lg:px-10 lg:pt-9 xl:px-12">{children}</div>
      </div>

      {drawerOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Menu admin" id="admin-drawer">
          <button
            type="button"
            aria-label="Tutup menu"
            tabIndex={-1}
            onClick={() => setDrawerOpen(false)}
            className="animate-in fade-in-0 absolute inset-0 bg-foreground/40 duration-200"
          />
          <div className="animate-in slide-in-from-right absolute inset-y-0 right-0 flex w-[min(20rem,85vw)] flex-col justify-between gap-6 overflow-y-auto overscroll-contain bg-background px-4 pt-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-2xl duration-200 ease-out">
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <Brand onNavigate={onNavigate} />
                <button
                  ref={closeRef}
                  type="button"
                  onClick={() => setDrawerOpen(false)}
                  className="flex size-10 items-center justify-center rounded-full bg-secondary"
                >
                  <X aria-hidden="true" className="size-5" />
                  <span className="sr-only">Tutup menu</span>
                </button>
              </div>
              {nav}
            </div>
            {footer}
          </div>
        </div>
      ) : null}

      <nav
        aria-label="Navigasi cepat admin"
        className="fixed inset-x-0 bottom-0 z-40 grid h-[4.5rem] grid-cols-5 border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
      >
        {TABS.map((item) => {
          const active = isActive(pathname, item);
          return (
            <Link
              key={item.to}
              to={item.to}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex flex-col items-center justify-center gap-1 text-[0.6875rem]",
                active ? "font-semibold text-primary" : "text-muted-foreground",
              )}
            >
              <item.icon aria-hidden="true" className="size-5" />
              {item.label}
            </Link>
          );
        })}
        <button
          type="button"
          onClick={openDrawer}
          aria-expanded={drawerOpen}
          aria-controls="admin-drawer"
          className={cn(
            "flex flex-col items-center justify-center gap-1 text-[0.6875rem]",
            drawerOpen ? "font-semibold text-primary" : "text-muted-foreground",
          )}
        >
          <Menu aria-hidden="true" className="size-5" />
          Lainnya
        </button>
      </nav>
    </div>
  );
}

function Brand({ compact = false, onNavigate }: { compact?: boolean; onNavigate?: () => void }) {
  return (
    <Link to="/admin" onClick={onNavigate} className="flex items-center gap-2.5 px-1">
      <span
        aria-hidden="true"
        className="cn-font-display flex size-9 items-center justify-center rounded-xl bg-primary text-lg font-bold text-primary-foreground"
      >
        D
      </span>
      <span className="flex flex-col leading-tight">
        <span className="cn-font-display text-lg font-bold text-foreground">Delisert</span>
        {compact ? null : <span className="text-xs text-muted-foreground">Panel pemilik</span>}
      </span>
    </Link>
  );
}
