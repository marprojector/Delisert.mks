const TOKEN_KEY = "delisert.admin.token";

/**
 * Token sesi admin disimpan di sessionStorage: hilang saat tab ditutup dan
 * tidak dikirim otomatis seperti cookie, sehingga tidak ada permukaan CSRF.
 * Akses dibungkus try/catch karena mode privat bisa melempar.
 */
export function readAdminToken(): string | null {
  try {
    return sessionStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function writeAdminToken(token: string): void {
  try {
    sessionStorage.setItem(TOKEN_KEY, token);
  } catch {
    /* mode privat: sesi tidak bertahan, tetapi halaman tetap bisa dipakai */
  }
}

export function clearAdminToken(): void {
  try {
    sessionStorage.removeItem(TOKEN_KEY);
  } catch {
    /* abaikan */
  }
}

export function adminHeaders(token: string | null): Record<string, string> {
  return token ? { authorization: `Bearer ${token}` } : {};
}

/** Teks rupiah dari form → nilai price_cents. Kolom ini menyimpan rupiah utuh (Rp 8.000 → 8000), bukan sen. */
export function rupiahToCents(value: string): number | null {
  const digits = value.replace(/[^\d]/g, "");
  if (!digits) return null;
  return Number(digits);
}

/** Nilai price_cents → teks rupiah tanpa pemisah, untuk input form. */
export function centsToRupiahInput(cents: number | null): string {
  return cents === null ? "" : String(cents);
}
