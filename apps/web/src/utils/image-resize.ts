import { PHOTO_WIDTHS } from "@delisert.mks-1/ui/lib/photo";

/**
 * Ubah foto menjadi beberapa lebar sebelum diunggah (PRD NFR-003, NFR-004, §11.4).
 *
 * Dilakukan di browser admin karena Worker tidak punya pustaka pengolah gambar.
 * Hasilnya WebP; Safari lama yang tidak bisa menyandikan WebP otomatis memakai
 * JPEG. Foto tidak pernah diperbesar: lebar yang dibuat adalah lebar standar
 * yang lebih kecil dari foto asli, ditambah satu versi terbesar (maks. 1600 px).
 */

export type SizedPhoto = { width: number; blob: Blob };

const QUALITY = 0.82;

/** Lebar yang akan dibuat untuk foto selebar `originalWidth` piksel. */
export function targetWidths(originalWidth: number): number[] {
  const max = Math.min(originalWidth, PHOTO_WIDTHS[PHOTO_WIDTHS.length - 1]!);
  return [...PHOTO_WIDTHS.filter((width) => width < max), max];
}

function encode(canvas: HTMLCanvasElement, type: string): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, QUALITY));
}

/** Null bila browser tidak bisa memproses foto; pemanggil lalu mengunggah file asli. */
export async function resizePhoto(file: File): Promise<SizedPhoto[] | null> {
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    return null;
  }

  try {
    const results: SizedPhoto[] = [];
    let type = "image/webp";

    for (const width of targetWidths(bitmap.width)) {
      const height = Math.round((bitmap.height * width) / bitmap.width);
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext("2d");
      if (!context) return null;
      context.imageSmoothingQuality = "high";
      context.drawImage(bitmap, 0, 0, width, height);

      let blob = await encode(canvas, type);
      // Browser yang tidak mendukung WebP diam-diam mengembalikan PNG.
      if (!blob || blob.type !== type) {
        type = "image/jpeg";
        blob = await encode(canvas, type);
      }
      if (!blob || blob.type !== type) return null;
      results.push({ width, blob });
    }

    // Semua ukuran harus satu format, karena nama filenya berbagi ekstensi.
    if (results.some((result) => result.blob.type !== type)) {
      const converted: SizedPhoto[] = [];
      for (const result of results) {
        const image = await createImageBitmap(result.blob);
        const canvas = document.createElement("canvas");
        canvas.width = image.width;
        canvas.height = image.height;
        canvas.getContext("2d")?.drawImage(image, 0, 0);
        const blob = await encode(canvas, type);
        if (!blob) return null;
        converted.push({ width: result.width, blob });
      }
      return converted;
    }

    return results;
  } finally {
    bitmap.close();
  }
}
