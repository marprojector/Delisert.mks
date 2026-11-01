/**
 * Penyimpanan foto produk di Supabase Storage.
 *
 * Menggantikan binding R2. Semua panggilan memakai service role key di sisi
 * server saja — key tidak pernah dikirim ke browser. Kegagalan jaringan atau
 * storage dikembalikan sebagai hasil, bukan dilempar, supaya route bisa
 * membalas pesan yang ramah.
 */

export type StorageConfig = {
  /** Project URL Supabase, mis. https://abc123.supabase.co */
  url: string;
  /** Service role key. Hanya untuk server. */
  serviceRoleKey: string;
  /** Nama bucket, mis. "products". */
  bucket: string;
};

export type StorageResult = { ok: true } | { ok: false; reason: string };

const trimSlash = (value: string): string => value.replace(/\/$/, "");

/** URL publik objek — bucket harus diset public agar foto bisa ditampilkan. */
export function publicPhotoUrl(config: StorageConfig, key: string): string {
  return `${trimSlash(config.url)}/storage/v1/object/public/${config.bucket}/${key}`;
}

const objectUrl = (config: StorageConfig, key: string): string =>
  `${trimSlash(config.url)}/storage/v1/object/${config.bucket}/${key}`;

export async function uploadPhoto(
  config: StorageConfig,
  key: string,
  body: ArrayBuffer,
  contentType: string,
): Promise<StorageResult> {
  try {
    const response = await fetch(objectUrl(config, key), {
      method: "POST",
      headers: {
        // Key Supabase tipe baru (`sb_secret_...`) bukan JWT, jadi harus
        // dikirim sebagai `apikey`; `Authorization` tetap dikirim agar
        // kompatibel dengan service_role key JWT lama.
        apikey: config.serviceRoleKey,
        Authorization: `Bearer ${config.serviceRoleKey}`,
        "content-type": contentType,
        "cache-control": "31536000",
        "x-upsert": "true",
      },
      body,
    });

    if (!response.ok) {
      return { ok: false, reason: "Gagal mengunggah foto ke penyimpanan." };
    }
    return { ok: true };
  } catch {
    return { ok: false, reason: "Gagal mengunggah foto ke penyimpanan." };
  }
}

export async function deletePhoto(
  config: StorageConfig,
  key: string,
): Promise<StorageResult> {
  try {
    const response = await fetch(objectUrl(config, key), {
      method: "DELETE",
      headers: {
        apikey: config.serviceRoleKey,
        Authorization: `Bearer ${config.serviceRoleKey}`,
      },
    });

    // Objek yang sudah tidak ada dianggap berhasil dihapus.
    if (!response.ok && response.status !== 404) {
      return { ok: false, reason: "Gagal menghapus foto dari penyimpanan." };
    }
    return { ok: true };
  } catch {
    return { ok: false, reason: "Gagal menghapus foto dari penyimpanan." };
  }
}
