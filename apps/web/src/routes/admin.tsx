import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

import { useTRPC } from "@/utils/trpc";
import { readAdminToken, clearAdminToken } from "@/utils/admin-client";

/**
 * Layout admin. Guard di sini hanya UX — batas keamanan sebenarnya adalah
 * adminProcedure di server, yang menolak setiap panggilan tanpa token sah.
 */
export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin — Delisert" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminLayout,
});

const TABS = [
  { to: "/admin", label: "Ringkasan" },
  { to: "/admin/produk", label: "Produk" },
] as const;

function AdminLayout() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const navigate = useNavigate();
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const token = readAdminToken();
  const isLogin = pathname === "/admin/login";

  const session = useQuery({
    ...trpc.adminAuth.session.queryOptions(),
    enabled: !isLogin,
    retry: false,
  });

  useEffect(() => {
    if (!isLogin && !token) void navigate({ to: "/admin/login" });
  }, [isLogin, token, navigate]);

  useEffect(() => {
    if (!isLogin && token && session.data && !session.data.authenticated) {
      clearAdminToken();
      queryClient.removeQueries(trpc.adminAuth.session.queryFilter());
      void navigate({ to: "/admin/login" });
    }
  }, [isLogin, token, session.data, navigate, queryClient, trpc]);

  if (isLogin) return <Outlet />;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <p className="cn-eyebrow text-primary">Admin Delisert</p>
          <h1 className="text-2xl leading-tight">Kelola katalog</h1>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/"
            className="inline-flex h-9 items-center border border-border px-3 text-sm transition-colors hover:border-primary hover:text-primary"
          >
            Lihat website
          </Link>
          <button
            type="button"
            onClick={() => {
              clearAdminToken();
              queryClient.removeQueries(trpc.adminAuth.session.queryFilter());
              void navigate({ to: "/admin/login" });
            }}
            className="inline-flex h-9 items-center border border-border px-3 text-sm transition-colors hover:border-primary hover:text-primary"
          >
            Keluar
          </button>
        </div>
      </div>

      <nav aria-label="Navigasi admin" className="flex gap-1 pt-4">
        {TABS.map((tab) => (
          <Link
            key={tab.to}
            to={tab.to}
            className={
              pathname === tab.to
                ? "border border-primary bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground"
                : "border border-border px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-primary"
            }
          >
            {tab.label}
          </Link>
        ))}
      </nav>

      <div className="pt-8">
        <Outlet />
      </div>
    </div>
  );
}
