import * as Cloudflare from "@alchemy.run/cloudflare";
import * as Alchemy from "alchemy";
import * as Effect from "effect/Effect";
import * as Redacted from "effect/Redacted";
import "varlock/auto-load";

/**
 * Catatan operasional: jalankan dev server lewat `bun run dev` di
 * packages/infra. Script itu membersihkan npm_execpath supaya alchemy tidak
 * menyerahkan diri kembali ke Bun — Bun lalu me-resolve kondisi `src/` dan
 * meminta `register-dev-mode.js` yang tidak ikut terkirim di paket terbit.
 */
export const db = Cloudflare.D1.Database("database", {
  migrations: "../../packages/db/src/migrations",
  importFiles: ["../../packages/db/src/seed.production.sql"],
});

/** Foto produk. Workers tidak punya disk yang bisa ditulis, jadi R2. */
export const photos = Cloudflare.R2.Bucket("photos", {
  cors: [{ allowedMethods: ["GET"], allowedOrigins: ["*"] }],
});

export const web = Cloudflare.Website.Vite("web", {
  rootDir: "../../apps/web",
  compatibility: {
    flags: ["nodejs_compat", "global_fetch_strictly_public"],
  },
  env: {
    DB: db,
    PHOTOS: photos,
    ADMIN_PASSWORD: Redacted.make(process.env.ADMIN_PASSWORD ?? ""),
    ADMIN_SESSION_SECRET: Redacted.make(process.env.ADMIN_SESSION_SECRET ?? ""),
  },
  dev: {
    port: 3001,
  },
});

export type WebEnv = Cloudflare.InferEnv<typeof web>;

export default Alchemy.Stack(
  "delisert.mks-1",
  {
    providers: Cloudflare.providers(),
    state: Cloudflare.state(),
  },
  Effect.gen(function* () {
    const webWorker = yield* web;

    return {
      web: webWorker.url,
    };
  }),
);
