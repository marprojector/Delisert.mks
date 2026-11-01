import type { Database } from "@delisert.mks-1/db";

import type { LoginLimiter } from "./lib/login-guard";
import type { AnalyticsConfig } from "./lib/web-analytics";

export type Context = {
  db: Database;
  /** Rahasia HMAC untuk menandatangani token sesi admin. */
  adminSecret: string;
  /** Kata sandi tunggal pemilik bisnis. Dibandingkan hanya saat login. */
  adminPassword: string;
  /** Header Authorization mentah dari request (berisi "Bearer <token>"). */
  authorization?: string;
  /** IP klien (CF-Connecting-IP), dipakai untuk membatasi percobaan login. */
  clientIp?: string;
  /** Pembatas login; default memakai instance bersama per isolate. Diisi di tes. */
  loginLimiter?: LoginLimiter;
  /** Hapus objek foto di R2 berdasarkan kuncinya (mis. "products/<uuid>.jpg"). */
  deletePhoto?: (key: string) => Promise<void>;
  /** Siapa yang memanggil: "admin" (bawaan) atau "mcp:<nama token>". Dicatat di log aktivitas. */
  actor?: string;
  /** Akses Cloudflare Web Analytics; null bila token belum dipasang. */
  analytics?: AnalyticsConfig | null;
  /** fetch yang dipakai untuk API luar; diganti di tes. */
  fetch?: typeof fetch;
};
