/**
 * Sesi admin Delisert: token stateless yang ditandatangani HMAC-SHA256.
 *
 * Token hanya membawa `iat` dan `exp` — tidak ada kata sandi, tidak ada tabel
 * sesi. Kata sandi dibandingkan sekali saat login; setelah itu server cukup
 * memverifikasi tanda tangan dan masa berlaku. Malformed input ditolak
 * (return false), tidak pernah dilempar.
 */

export const SESSION_TTL_MS = 12 * 60 * 60 * 1000;

const encoder = new TextEncoder();

const toBase64Url = (bytes: Uint8Array): string =>
  btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

const fromBase64Url = (value: string): Uint8Array => {
  const padded = value
    .replace(/-/g, "+")
    .replace(/_/g, "/")
    .padEnd(value.length + ((4 - (value.length % 4)) % 4), "=");
  return Uint8Array.from(atob(padded), (char) => char.charCodeAt(0));
};

async function sign(secret: string, payload: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  return toBase64Url(new Uint8Array(signature));
}

export async function createSessionToken(
  secret: string,
  issuedAtMs: number,
  ttlMs: number,
): Promise<string> {
  const payload = toBase64Url(
    encoder.encode(JSON.stringify({ iat: issuedAtMs, exp: issuedAtMs + ttlMs })),
  );
  return `${payload}.${await sign(secret, payload)}`;
}

export async function verifySessionToken(
  secret: string,
  token: string,
  nowMs: number,
): Promise<boolean> {
  const parts = token.split(".");
  if (parts.length !== 2) return false;

  const [payload, signature] = parts as [string, string];

  try {
    const expected = await sign(secret, payload);
    if (expected.length !== signature.length) return false;

    // Perbandingan constant-time: jangan berhenti di karakter pertama yang beda.
    let mismatch = 0;
    for (let index = 0; index < expected.length; index += 1) {
      mismatch |= expected.charCodeAt(index) ^ signature.charCodeAt(index);
    }
    if (mismatch !== 0) return false;

    const decoded = JSON.parse(new TextDecoder().decode(fromBase64Url(payload))) as {
      exp?: unknown;
    };
    return typeof decoded.exp === "number" && decoded.exp > nowMs;
  } catch {
    return false;
  }
}
