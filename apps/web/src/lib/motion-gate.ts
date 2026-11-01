/**
 * Gerbang animasi: skrip kecil di <head> yang jalan SEBELUM halaman tampil.
 *
 * Kenapa perlu: elemen beranimasi ada di HTML server dalam keadaan terlihat.
 * Kalau GSAP baru menyembunyikannya saat elemen masuk layar, mata melihat
 * terlihat → hilang → muncul lagi (berkedip). Dengan gerbang ini elemen sudah
 * tersembunyi sejak cat pertama, lalu GSAP tinggal memunculkannya.
 *
 * Aman tanpa JS: kelas hanya ditambahkan oleh skrip ini, dan hanya bila
 * pengunjung tidak meminta gerak dikurangi. Bila kode animasi gagal dimuat,
 * kelas MOTION_DONE_CLASS ditambahkan setelah batas waktu supaya semua konten
 * tetap muncul.
 */

export const MOTION_READY_CLASS = "motion-ready";
export const MOTION_DONE_CLASS = "motion-done";

/** Batas waktu sebelum konten dipaksa tampil bila GSAP tidak sempat jalan. */
export const MOTION_FALLBACK_MS = 3500;

export function motionGateScript(): string {
  return `(function(){try{if(!window.matchMedia("(prefers-reduced-motion: no-preference)").matches)return;var c=document.documentElement.classList;c.add("${MOTION_READY_CLASS}");window.setTimeout(function(){if(!window.__delisertMotion)c.add("${MOTION_DONE_CLASS}")},${MOTION_FALLBACK_MS})}catch(e){}})();`;
}
