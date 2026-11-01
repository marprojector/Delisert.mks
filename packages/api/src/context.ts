import type { Database } from "@delisert.mks-1/db";

export type Context = {
  db: Database;
  /** Rahasia HMAC untuk menandatangani token sesi admin. */
  adminSecret: string;
  /** Kata sandi tunggal pemilik bisnis. Dibandingkan hanya saat login. */
  adminPassword: string;
  /** Header Authorization mentah dari request (berisi "Bearer <token>"). */
  authorization?: string;
};
