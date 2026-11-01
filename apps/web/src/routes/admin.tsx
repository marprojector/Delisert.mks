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

  const logout = () => {
    clearAdminToken();
    queryClient.removeQueries(trpc.adminAuth.session.queryFilter());
    void navigate({ to: "/admin/login" });
  };

  // Pemeriksaan sesi gagal (jaringan putus, server error): jangan biarkan
  // halaman kosong selamanya — beri tahu dan tawarkan coba lagi.
  if (guarded && token && session.isError) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-muted px-6">
        <div role="alert" className="flex max-w-sm flex-col items-center gap-4 rounded-3xl bg-background p-8 text-center">
          <h1 className="text-2xl font-semibold text-foreground">Tidak bisa memeriksa sesi</h1>
          <p className="text-sm/relaxed text-muted-foreground">
            Koneksi ke server terputus atau server sedang bermasalah. Coba lagi sebentar lagi.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <button
              type="button"
              onClick={() => void session.refetch()}
              disabled={session.isFetching}
              className="h-11 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground disabled:opacity-60"
            >
              {session.isFetching ? "Memeriksa…" : "Coba lagi"}
            </button>
            <button
              type="button"
              onClick={logout}
              className="h-11 rounded-full border border-border px-5 text-sm font-semibold text-foreground"
            >
              Masuk ulang
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={verified ? "" : "invisible"} aria-busy={!verified}>
    <AdminShell
      productCount={products.data?.length}
      onLogout={logout}
    >
      <Outlet />
    </AdminShell>
    </div>
  );
}
