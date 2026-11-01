import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { useTRPC } from "@/utils/trpc";
import { writeAdminToken } from "@/utils/admin-client";

export const Route = createFileRoute("/admin/login")({
  head: () => ({
    meta: [
      { title: "Masuk Admin — Delisert" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: LoginPage,
});

/** Kode error yang pesannya dari server aman dan berguna untuk ditampilkan apa adanya. */
const SERVER_MESSAGE_CODES = new Set(["UNAUTHORIZED", "TOO_MANY_REQUESTS", "PRECONDITION_FAILED"]);

function LoginPage() {
  const trpc = useTRPC();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useMutation(
    trpc.adminAuth.login.mutationOptions({
      onSuccess: ({ token }) => {
        writeAdminToken(token);
        // Hasil session lama (authenticated: false) masih di cache selama
        // staleTime. Tanpa ini layout admin membuang token baru dan
        // mengembalikan pengguna ke halaman login.
        queryClient.removeQueries(trpc.adminAuth.session.queryFilter());
        void navigate({ to: "/admin" });
      },
      onError: (mutationError) => {
        const code = mutationError.data?.code;
        setError(
          code && SERVER_MESSAGE_CODES.has(code)
            ? mutationError.message
            : "Tidak dapat masuk. Periksa koneksi lalu coba lagi.",
        );
      },
    }),
  );

  return (
    <div className="min-h-svh bg-background lg:grid lg:grid-cols-[38.75rem_1fr]">
      <div className="flex h-72 flex-col justify-end gap-2.5 bg-primary p-6 text-primary-foreground lg:h-auto lg:justify-between lg:p-16">
        <span className="cn-font-display text-[1.625rem] font-bold lg:text-[2rem]">Delisert</span>
        <div className="flex flex-col gap-4">
          <p className="cn-font-display max-w-[30rem] text-[1.75rem] leading-[1.2] font-semibold lg:text-5xl lg:leading-[1.12]">
            Kelola katalog dari mana saja.
          </p>
          <p className="hidden max-w-[27.5rem] text-[1.0625rem]/relaxed text-primary-foreground/80 lg:block">
            Ubah harga, tandai stok habis, dan ganti foto produk. Perubahan langsung tampil di
            website.
          </p>
        </div>
        <span className="hidden text-[0.8125rem] text-accent lg:block">Halaman khusus pemilik bisnis</span>
      </div>

      <div className="flex justify-center px-6 pt-8 pb-12 lg:items-center lg:p-12">
        <div className="flex w-full max-w-[25rem] flex-col gap-6">
          <div className="flex flex-col gap-2">
            <span className="hidden cn-eyebrow text-primary lg:block">Admin Delisert</span>
            <h1 className="text-3xl font-semibold text-foreground lg:text-[2.5rem]">Masuk</h1>
            <p className="text-sm/relaxed text-muted-foreground lg:text-[0.9375rem]">
              Masukkan kata sandi admin untuk mengelola katalog.
            </p>
          </div>

          <form
            className="flex flex-col gap-5"
            onSubmit={(event) => {
              event.preventDefault();
              setError(null);
              login.mutate({ password });
            }}
          >
            <div className="flex flex-col gap-2">
              <label htmlFor="admin-password" className="text-sm font-semibold text-foreground">
                Kata sandi
              </label>
              <div className="flex h-[3.25rem] items-center rounded-[0.875rem] border border-border bg-white pr-2 focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/25">
                <input
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  aria-invalid={error ? true : undefined}
                  aria-describedby={error ? "login-error" : undefined}
                  className="h-full min-w-0 flex-1 rounded-[0.875rem] bg-transparent px-4 text-base outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-pressed={showPassword}
                  className="rounded-lg px-2 py-1.5 text-[0.8125rem] font-semibold text-primary"
                >
                  {showPassword ? "Sembunyikan" : "Tampilkan"}
                </button>
              </div>
            </div>

            {error ? (
              <p
                id="login-error"
                role="alert"
                className="rounded-xl bg-[#fbe9e7] px-3.5 py-3 text-[0.8125rem]/relaxed text-destructive"
              >
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={login.isPending}
              className="inline-flex h-[3.375rem] items-center justify-center rounded-full bg-primary text-base font-semibold text-primary-foreground transition-transform hover:bg-primary/90 active:scale-[0.98] disabled:opacity-60"
            >
              {login.isPending ? "Memeriksa…" : "Masuk"}
            </button>
          </form>

          <Link to="/" className="text-[0.8125rem] text-muted-foreground hover:text-primary">
            ← Kembali ke website
          </Link>
        </div>
      </div>
    </div>
  );
}
