import { createFileRoute, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

import { AdminShell } from "@/components/admin/admin-shell";
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

  // Jumlah produk untuk lencana navigasi; query yang sama dipakai daftar produk.
  const products = useQuery({
    ...trpc.adminProduct.list.queryOptions(),
    enabled: !isLogin && Boolean(token),
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
    <AdminShell
      productCount={products.data?.length}
      onLogout={() => {
        clearAdminToken();
        queryClient.removeQueries(trpc.adminAuth.session.queryFilter());
        void navigate({ to: "/admin/login" });
      }}
    >
      <Outlet />
    </AdminShell>
  );
}
