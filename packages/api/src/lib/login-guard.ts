/**
 * Pengaman login admin: perbandingan kata sandi constant-time dan pembatas
 * percobaan gagal per IP.
 *
 * Pembatas ini disimpan di memori isolate Worker, jadi bukan batas global:
 * isolate lain punya hitungan sendiri dan hitungan hilang saat isolate
 * didaur ulang. Tetap memperlambat tebakan beruntun dari satu klien secara
 * berarti. Untuk batas yang benar-benar global, pasang aturan Rate Limiting
 * Cloudflare pada path /api/trpc/adminAuth.login.
 */

const encoder = new TextEncoder();

/** Bandingkan dua string tanpa membocorkan posisi beda pertama lewat waktu. */
export async function passwordsMatch(given: string, expected: string): Promise<boolean> {
  // Hash dulu supaya panjang kedua sisi sama dan panjang kata sandi asli
  // tidak ikut bocor.
  const [a, b] = await Promise.all([
    crypto.subtle.digest("SHA-256", encoder.encode(given)),
    crypto.subtle.digest("SHA-256", encoder.encode(expected)),
  ]);
  const left = new Uint8Array(a);
  const right = new Uint8Array(b);
  let mismatch = 0;
  for (let index = 0; index < left.length; index += 1) {
    mismatch |= left[index]! ^ right[index]!;
  }
  return mismatch === 0;
}

export const MAX_FAILED_ATTEMPTS = 5;
export const LOCKOUT_WINDOW_MS = 15 * 60 * 1000;

type Entry = { failures: number; windowStart: number };

export class LoginLimiter {
  private readonly entries = new Map<string, Entry>();

  constructor(
    private readonly maxFailures = MAX_FAILED_ATTEMPTS,
    private readonly windowMs = LOCKOUT_WINDOW_MS,
  ) {}

  /** Sisa milidetik sampai klien boleh mencoba lagi; 0 bila tidak terkunci. */
  retryAfterMs(key: string, now: number): number {
    const entry = this.entries.get(key);
    if (!entry) return 0;
    const elapsed = now - entry.windowStart;
    if (elapsed >= this.windowMs) {
      this.entries.delete(key);
      return 0;
    }
    return entry.failures >= this.maxFailures ? this.windowMs - elapsed : 0;
  }

  recordFailure(key: string, now: number): void {
    const entry = this.entries.get(key);
    if (!entry || now - entry.windowStart >= this.windowMs) {
      this.entries.set(key, { failures: 1, windowStart: now });
    } else {
      entry.failures += 1;
    }
    // Jaga ukuran map tetap kecil kalau ada banyak IP berbeda.
    if (this.entries.size > 10_000) {
      for (const [entryKey, value] of this.entries) {
        if (now - value.windowStart >= this.windowMs) this.entries.delete(entryKey);
      }
    }
  }

  reset(key: string): void {
    this.entries.delete(key);
  }
}

export const loginLimiter = new LoginLimiter();
