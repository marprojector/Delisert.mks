import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
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

function LoginPage() {
  const trpc = useTRPC();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const login = useMutation(
    trpc.adminAuth.login.mutationOptions({
      onSuccess: ({ token }) => {
        writeAdminToken(token);
        void navigate({ to: "/admin" });
      },
      onError: (mutationError) => {
        setError(
          mutationError.data?.code === "UNAUTHORIZED"
            ? "Kata sandi salah. Coba lagi."
            : "Tidak dapat masuk. Periksa koneksi lalu coba lagi.",
        );
      },
    }),
  );

  return (
    <div className="mx-auto flex max-w-sm flex-col gap-6 px-4 py-20 sm:px-6">
      <div className="flex flex-col gap-2">
        <p className="cn-eyebrow text-primary">Admin Delisert</p>
        <h1 className="text-2xl leading-tight">Masuk</h1>
        <p className="text-sm/relaxed text-muted-foreground">
          Halaman ini hanya untuk pemilik bisnis. Masukkan kata sandi admin untuk mengelola
          katalog.
        </p>
      </div>

      <form
        className="flex flex-col gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          setError(null);
          login.mutate({ password });
        }}
      >
        <div className="flex flex-col gap-1.5">
          <label htmlFor="admin-password" className="text-sm font-medium">
            Kata sandi
          </label>
          <input
            id="admin-password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="h-10 border border-border bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50"
          />
        </div>

        {error ? (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={login.isPending}
          className="inline-flex h-10 items-center justify-center border border-primary bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
        >
          {login.isPending ? "Memeriksa…" : "Masuk"}
        </button>
      </form>
    </div>
  );
}
