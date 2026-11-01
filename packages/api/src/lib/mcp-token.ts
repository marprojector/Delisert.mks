/**
 * Token akses MCP. Bentuknya "dlsrt_<43 karakter acak>"; yang disimpan di
 * database hanya hash SHA-256 (hex) dan awalan pendek untuk dikenali.
 */

export const MCP_TOKEN_PREFIX = "dlsrt_";

const toBase64Url = (bytes: Uint8Array): string =>
  btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

export function generateMcpToken(): string {
  return `${MCP_TOKEN_PREFIX}${toBase64Url(crypto.getRandomValues(new Uint8Array(32)))}`;
}

export async function hashMcpToken(token: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token));
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

/** "dlsrt_Ab12Cd…" — cukup untuk dikenali, tidak cukup untuk dipakai. */
export const displayPrefix = (token: string) => token.slice(0, MCP_TOKEN_PREFIX.length + 6);

/** Ambil token dari header Authorization "Bearer dlsrt_...". */
export function bearerMcpToken(authorization: string | null | undefined): string | null {
  const match = authorization?.match(/^Bearer\s+(dlsrt_[A-Za-z0-9_-]{20,})\s*$/i);
  return match ? match[1]! : null;
}
