import { cn } from "@delisert.mks-1/ui/lib/utils";
import { Link, useRouterState } from "@tanstack/react-router";
import { Globe, LayoutDashboard, LogOut, Package } from "lucide-react";
import type { ReactNode } from "react";

/**
 * Kerangka admin. Desktop: sidebar kiri. HP: bilah merek di atas dan tab
 * navigasi di bawah layar supaya mudah dijangkau jempol.
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
  const onSummary = pathname === "/admin" || pathname === "/admin/";
  const onProducts = pathname.startsWith("/admin/produk");

  const navItem = (active: boolean) =>
    cn(
      "flex items-center justify-between gap-3 rounded-[0.875rem] px-3.5 py-3 text-[0.9375rem] transition-colors",
      active ? "bg-primary font-semibold text-primary-foreground" : "font-medium text-foreground hover:bg-secondary",
    );

  return (
    <div className="min-h-svh bg-muted lg:grid lg:grid-cols-[16.25rem_1fr]">
      <aside className="sticky top-0 hidden h-svh flex-col justify-between border-r border-border bg-background p-6 lg:flex">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col">
            <span className="cn-font-display text-[1.625rem] font-bold text-primary">Delisert</span>
            <span className="text-xs text-muted-foreground">Admin katalog</span>
          </div>
          <nav aria-label="Navigasi admin" className="flex flex-col gap-1.5">
            <Link to="/admin" className={navItem(onSummary)} aria-current={onSummary ? "page" : undefined}>
              <span className="flex items-center gap-3">
                <LayoutDashboard aria-hidden="true" className="size-4.5" />
                Ringkasan
              </span>
            </Link>
            <Link
              to="/admin/produk"
              className={navItem(onProducts)}
              aria-current={onProducts ? "page" : undefined}
            >
              <span className="flex items-center gap-3">
                <Package aria-hidden="true" className="size-4.5" />
                Produk
              </span>
              {productCount !== undefined ? (
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-xs font-semibold",
                    onProducts ? "bg-primary-foreground/20" : "bg-secondary text-primary",
                  )}
                >
                  {productCount}
                </span>
              ) : null}
            </Link>
            <a href="/" target="_blank" rel="noopener noreferrer" className={navItem(false)}>
              <span className="flex items-center gap-3">
                <Globe aria-hidden="true" className="size-4.5" />
                Lihat website ↗
              </span>
            </a>
          </nav>
        </div>
        <button
          type="button"
          onClick={onLogout}
          className="flex items-center gap-3 rounded-[0.875rem] border border-border px-3.5 py-3 text-sm font-medium text-foreground transition-colors hover:border-primary hover:text-primary"
        >
          <LogOut aria-hidden="true" className="size-4" />
          Keluar
        </button>
      </aside>

      <div className="flex min-w-0 flex-col pb-24 lg:pb-0">
        <div className="flex h-14 items-center px-5 lg:hidden">
          <span className="cn-font-display text-[1.375rem] font-bold text-primary">Delisert</span>
        </div>
        <div className="px-5 pt-2 pb-10 lg:px-12 lg:pt-10">{children}</div>
      </div>

      <nav
        aria-label="Navigasi admin"
        className="fixed inset-x-0 bottom-0 z-40 grid h-[4.75rem] grid-cols-4 border-t border-border bg-background pb-[env(safe-area-inset-bottom)] lg:hidden"
      >
        <TabLink to="/admin" active={onSummary} icon={LayoutDashboard} label="Ringkasan" />
        <TabLink to="/admin/produk" active={onProducts} icon={Package} label="Produk" />
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center justify-center gap-1 text-[0.6875rem] text-muted-foreground"
        >
          <Globe aria-hidden="true" className="size-5.5" />
          Website
        </a>
        <button
          type="button"
          onClick={onLogout}
          className="flex flex-col items-center justify-center gap-1 text-[0.6875rem] text-muted-foreground"
        >
          <LogOut aria-hidden="true" className="size-5.5" />
          Keluar
        </button>
      </nav>
    </div>
  );
}

function TabLink({
  to,
  active,
  icon: Icon,
  label,
}: {
  to: "/admin" | "/admin/produk";
  active: boolean;
  icon: typeof Package;
  label: string;
}) {
  return (
    <Link
      to={to}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex flex-col items-center justify-center gap-1 text-[0.6875rem]",
        active ? "font-semibold text-primary" : "text-muted-foreground",
      )}
    >
      <Icon aria-hidden="true" className="size-5.5" />
      {label}
    </Link>
  );
}
