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
  // Selama transisi keluar dari admin (mis. "Kembali ke website"), layout ini
  // masih terpasang sesaat. Pengaman tidak boleh bertindak di luar /admin,
  // kalau tidak pengguna dilempar balik ke halaman login.
  const inAdmin = pathname.startsWith("/admin");
  const guarded = inAdmin && !isLogin;

  const session = useQuery({
    ...trpc.adminAuth.session.queryOptions(),
    enabled: guarded,
    retry: false,
  });

  // Jumlah produk untuk lencana navigasi; query yang sama dipakai daftar produk.
  const products = useQuery({
    ...trpc.adminProduct.list.queryOptions(),
    enabled: guarded && Boolean(token),
  });

  useEffect(() => {
    if (guarded && !token) void navigate({ to: "/admin/login" });
  }, [guarded, token, navigate]);

  useEffect(() => {
    if (guarded && token && session.data && !session.data.authenticated) {
      clearAdminToken();
      queryClient.removeQueries(trpc.adminAuth.session.queryFilter());
      void navigate({ to: "/admin/login" });
    }
  }, [guarded, token, session.data, navigate, queryClient, trpc]);

  // Konten admin baru ditampilkan setelah sesi terkonfirmasi. Tanpa ini,
  // dashboard kosong sempat terlihat sebelum dialihkan ke halaman login.
  // (Markup tetap dirender di server; hanya disembunyikan secara visual.)
  const verified = Boolean(token) && session.data?.authenticated === true;

  if (isLogin) return <Outlet />;

  return (
    <div className={verified ? "" : "invisible"} aria-busy={!verified}>
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
    </div>
  );
}
